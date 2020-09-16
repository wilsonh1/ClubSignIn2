'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet');
const Club = require('./club.js');

const keys = require('./keys/clubsignin2-291f28402623.json');

const master = new GoogleSpreadsheet('1shsiUiuHNYQUPF_LgiHKAJHAW0TcsOMXncNRDvNlIes');
var rows, clubs = {};

(async function init () {
    await master.useServiceAccountAuth({
        client_email: keys.client_email,
        private_key: keys.private_key
    });

    await master.loadInfo();

    const sheet = master.sheetsByIndex[0];
    rows = await sheet.getRows();
    console.log(rows.length);

    //let r1 = await sheet.addRow([1, 2, 3, 4, 5, 6]);
    //console.log(rows.length);
    //console.log(r1);

    let flag = 0;
    for (let i = 0; i < rows.length; i++) {
        clubs[rows[i]['Club ID']] = new Club(rows[i].pwd, rows[i].admin, rows[i].sheet, rows[i].client_email, rows[i].private_key);
        clubs[rows[i]['Club ID']].authorize(function() {
            flag++;
        });
    }

    await new Promise(r => setTimeout(r, 5000));
    console.log(flag);

    //clubs['test'].test();
    //clubs['test2'].test();

    /*clubs['test'].updateKey('0MnG3xnbqO', 'test');
    clubs['test'].updateKey('0MnG3xnbqO', 'test2');*/

    clubs['test'].updateKey('0MnG3xnbqO', 'test').then(console.log);
    /*clubs['test'].signIn('1', 'test', 'Wilson Ho').then(console.log);
    clubs['test'].signIn('2', 'test', 'Ho Wilson').then(console.log);
    clubs['test'].signIn('3', 'test', 'Ho Wilson').then(console.log);
    clubs['test'].signIn('4', 'test', 'Ho Wilson').then(console.log);
    clubs['test'].signIn('5', 'test', 'Ho Wilson').then(console.log);*/

    queueRequest({uid: '1', key: 'test', name: 'Wilson Ho'});
    queueRequest({uid: '2', key: 'test', name: 'Wilson Ho'});
    queueRequest({uid: '3', key: 'test', name: 'Wilson Ho'});
    queueRequest({uid: '4', key: 'test', name: 'Wilson Ho'});
    queueRequest({uid: '5', key: 'test', name: 'Wilson Ho'});
    queueRequest({uid: '6', key: 'test', name: 'Wilson Ho'});
})();

async function updateMaster (cid, uid, field, val) {
    let i = Object.keys(clubs).indexOf(cid);
    if (i == -1)
        return 0;

    if (field == 'admin') {
        if (clubs[cid].updateAdmin(uid, val)) {
            rows[i].admin = uid;
            await rows[i].save();
            return 1;
        }
        return 2;
    } else {
        let up = clubs[cid].updateClub(pwd, field, val);
        if (up == 1) {
            rows[i][field] = val;
            await rows[i].save();
            return 1;
        }
        return up
    }
}

var queue = []
var processing = false;

function queueRequest (request) {
    queue.push(request);
    if (processing)
        return;
    console.log('qr');
    processing = true;
    processQueue();
}

function processQueue () {
    if (!queue.length) {
        processing = false;
        return;
    }
    let request = queue.shift();
    clubs['test'].signIn(request.uid, request.key, request.name).then(function(value) {
        console.log(value);
        processQueue()
    });
}
