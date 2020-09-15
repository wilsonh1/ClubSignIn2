'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet');
const Club = require('./club.js');

const keys = require('./keys/clubsignin2-291f28402623.json');

const master = new GoogleSpreadsheet('1shsiUiuHNYQUPF_LgiHKAJHAW0TcsOMXncNRDvNlIes');
var clubs = {};

(async function init () {
    await master.useServiceAccountAuth({
        client_email: keys.client_email,
        private_key: keys.private_key
    });

    await master.loadInfo();

    const sheet = master.sheetsByIndex[0];
    const rows = await sheet.getRows();
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        clubs[row['Club ID']] = new Club(row['Password'], row['Admin'], row['Sheet'], row['Client Email'], row['Private Key']);
        await clubs[row['Club ID']].authorize();
    }

    await clubs['test'].test();
})();
