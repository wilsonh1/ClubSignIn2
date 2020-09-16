'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet');

const master = new GoogleSpreadsheet('1shsiUiuHNYQUPF_LgiHKAJHAW0TcsOMXncNRDvNlIes');
var rows, clubs = {}, flag = 0;

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
    let uid = event.sender.id, message = event.message;

    if (flag != rows.length * 2) {
        sendMessage(uid, {text: "Bot is waking up, please try again in a few seconds."})
        return;
    }

    const notRecognized = "Message not recognized. Send \"help\" for a list of valid messages.";
    if (!message.text)
        sendMessage(uid, {text: notRecognized});
    else {
        let str = message.text.toLowerCase().split(" ");
        for (let i = 0; i < str.length; i++)
            sendMessage(uid, {text: str[i]});
    }
}

function sendMessage (uid, message) {
    request({
        url: "https://graph.facebook.com/v8.0/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: uid},
            message: message
        }
    }, function (err, response, body) {
        if (err)
            console.log("Error sending messages: " + err);
    });
}
