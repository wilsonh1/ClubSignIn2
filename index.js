'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet');
const Club = require('./club.js');
const allCommands = require('./commands.json');

const master = new GoogleSpreadsheet(process.env.SHEET_ID);
var rows, clubs = {}, cids = [], flag = 0;

(async function init () {
    await master.useServiceAccountAuth({
        client_email: process.env.CLIENT_EMAIL,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n')
    });

    await master.loadInfo();
    const sheet = master.sheetsByIndex[0];
    rows = await sheet.getRows();

    for (let i = 0; i < rows.length; i++) {
        clubs[rows[i]['Club ID']] = new Club(rows[i].pwd, rows[i].admin, rows[i].sheet, rows[i].client_email, rows[i].private_key);
        clubs[rows[i]['Club ID']].authorize(() => flag++);
        cids.push(rows[i]['Club ID']);
    }
})();

const
    request = require('request'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express().use(bodyParser.json());

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.post('/webhook', function (req, res) {
    let body = req.body;

    if (body.object === 'page') {
        res.status(200).send('EVENT_RECEIVED');
        body.entry.forEach(function(entry) {
            entry.messaging.forEach(function(event) {
                if (event.message)
                    processMessage(event);
            });
        });
    } else {
        res.sendStatus(404);
    }
});

app.get("/", function (req, res) {
    res.send("deployed");
});

app.get('/webhook', function (req, res) {
    const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

function processMessage (event) {
    if (event.message.is_echo)
        return;
    console.log(event);
    let uid = event.sender.id, message = event.message;

    if (flag != rows.length * 2) {
        sendMessage(uid, 'Bot is waking up, please try again in a few seconds.')
        return;
    }

    const notRecognized = 'Message not recognized. Send "member help" or "admin help" for a list of valid commands.';

    if (!message.text)
        sendMessage(uid, notRecognized);
    else {
        let str = message.text.toLowerCase().split(' ');
        let orig = message.text.split(' ');

        if (str[0] == 'clubs') {
            for (let i = 0; i < cids.length; i++)
                sendMessage(uid, cids[i]);
            return;
        }
        if (str[1] == 'help') {
            if (str[0] != 'member' && str[0] != 'admin' && str[0] != 'full')
                sendMessage(uid, notRecognized);
            else {
                for (let i = 0; i < allCommands[str[0]].length; i++)
                    sendMessage(uid, allCommands[str[0]][i]);
            }
            return;
        }

        const member = ['email', 'grade', 'total']
        const admin = ['pwd', 'sheet', 'client_email', 'private_key'];

        let cid = (str[0][0] == '!') ? str[0].substring(1) : str[1];
        if (!cid) {
            sendMessage(uid, notRecognized);
        } else if (!cids.includes(cid)) {
            sendMessage(uid, 'Club ID not recognized. Send "clubs" for a list of club IDs.');
            return;
        }

        if (str[0][0] == '!') {
            queueRequest({command: 0, cid: cid, uid: uid, args: [str[1]]});
        } else if (str[0] == 'update') {
            if (member.includes(str[2]) && str[2] != 'total')
                queueRequest({command: 1, cid: cid, uid: uid, args: [str[2], orig[3]]});
            else if (admin.includes(str[2]))
                queueRequest({command: 2, cid: cid, uid: uid, args: [str[2], orig[3]]});
            else if (str[2] == 'key')
                queueRequest({command: 3, cid: cid, uid: uid, args: [orig[3]]});
            else
                sendMessage(uid, notRecognized);
        } else if (str[0] == 'check') {
            if (member.includes(str[2]))
                queueRequest({command: 4, cid: cid, uid: uid, args: [str[2]]});
            else if (str[2] == 'key' || admin.includes(str[2]))
                queueRequest({command: 5, cid: cid, uid: uid, args: [str[2]]});
            else
                sendMessage(uid, notRecognized);
        } else if (str[0] == 'readmin') {
            queueRequest({command: 6, cid: cid, uid: uid, args: [orig[2]]});
        } else {
            sendMessage(uid, notRecognized);
        }
    }
}

var queue = [], processing = false;

function queueRequest (r) {
    queue.push(r);
    if (processing)
        return;
    processing = true;
    processQueue();
}

function processQueue () {
    if (!queue.length) {
        processing = false;
        return;
    }

    let r = queue.shift();
    console.log(r);
    switch(r.command) {
        case 0: {
            getName(r.uid, function(name) {
                clubs[r.cid].signIn(r.uid, r.args[0], name).then(function(ret) {
                    switch(ret) {
                        case 0:
                            sendMessage(r.uid, '(Y)');
                            break;
                        case 1:
                            sendMessage(r.uid, 'This is your first time signing in. Send "update [club id] email [address]" and "update [club id] grade [#]" to set your email address and grade level.');
                            break;
                        case 2:
                            sendMessage(r.uid, 'Invalid key.');
                            break;
                        case 3:
                            sendMessage(r.uid, 'Already signed in for this week.');
                    }
                    processQueue();
                });
            });
        } break;
        case 1: {
            clubs[r.cid].updateMember(r.uid, r.args[0], r.args[1]).then(function(ret) {
                if (!ret)
                    sendMessage(r.uid, 'Sign in first.');
                else
                    sendMessage(r.uid, ((r.args[0] == 'email') ? 'Email' : 'Grade') + ' updated.');
                processQueue();
            });
        } break;
        case 2: {
            let up = clubs[r.cid].updateClub(r.uid, r.args[0], r.args[1]);
            if (!up) {
                sendMessage(r.uid, 'Requires admin permissions.');
                processQueue();
            } else {
                updateMaster(r.cid, r.args[0], r.args[1]).then(function(ret) {
                    const fields = {pwd: 'Password', sheet: 'Sheet ID', client_email: 'Service account ', private_key: 'Private key'};
                    sendMessage(r.uid, fields[r.args[0]] + ' updated.');
                    processQueue();
                });
            }
        } break;
        case 3: {
            clubs[r.cid].updateKey(r.uid, r.args[0], r.args[1]).then(function(ret) {
                if (!ret)
                    sendMessage(r.uid, 'Requires admin permissions.');
                else if (ret == 1)
                    sendMessage(r.uid, 'Key updated.');
                else
                    sendMessage(r.uid, 'Keys must be unique.');
                processQueue();
            });
        } break;
        case 4: {
            let ret = clubs[r.cid].queryMember(r.uid, r.args[0]);
            if (ret === 0)
                sendMessage(r.uid, 'Not found.');
            else
                sendMessage(r.uid, ret);
            processQueue();
        } break;
        case 5: {
            let ret = clubs[r.cid].queryClub(r.uid, r.args[0]);
            if (ret === 0)
                sendMessage(r.uid, 'Requires admin permissions.');
            else
                sendMessage(r.uid, ret);
            processQueue();
        } break;
        case 6: {
            let up = clubs[r.cid].updateAdmin(r.uid, r.args[0]);
            console.log(up + ' ' + r.args[0]);
            if (!up) {
                sendMessage(r.uid, 'Invalid club password.');
                processQueue();
            } else {
                updateMaster(r.cid, 'admin', r.args[0]).then(function(ret) {
                    sendMessage(r.uid, 'You are now the admin of ' + r.cid + ' club.');
                    processQueue();
                });
            }
        }
    }
}

async function updateMaster (cid, field, val) {
    let i = cids.indexOf(cid);
    rows[i][field] = val;
    await rows[i].save();
    return true;
}

function getName (uid, callback) {
    request({
        url: "https://graph.facebook.com/v8.0/" + senderId,
        qs: {
            access_token: process.env.PAGE_ACCESS_TOKEN,
            fields: "name"
        },
        method: "GET"
    }, function (err, response, body) {
        if (err)
            console.log("Error getting user's name: " +  err);
        else {
            let bodyObj = JSON.parse(body);
            callback(bodyObj.name);
        }
    });
}

function sendMessage (uid, message) {
    request({
        url: "https://graph.facebook.com/v8.0/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: uid},
            message: {text: message}
        }
    }, function (err, response, body) {
        if (err)
            console.log("Error sending messages: " + err);
    });
}
