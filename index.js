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

    clubs = master.sheetsByIndex[0];
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
                    console.log(clubs.title);
                    //processMessage(event);
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

// if sheet is undefined, "Bot is waking up, please try again in a few seconds."
