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
    clubs['test'].signIn('1', 'test', 'Wilson Ho').then(console.log);
    clubs['test'].signIn('2', 'test', 'Ho Wilson').then(console.log);
})();

async function updateMaster (cid, pwd, field, val) {
    if (clubs[cid].updateClub(pwd, field, val) == 1) {
        let i = 0;
        while (rows[i]['Club ID'] != cid)
            i++;
        rows[i][field] = val;
        await rows[i].save();
    }
}
