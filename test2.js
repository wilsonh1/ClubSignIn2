'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet');

const keys = require('./keys/quickstart-1569797701892-a8c3c4f0a481.json');

const master = new GoogleSpreadsheet('12mUIfwhaReg_Q24SE6z09NeQJbgG3Kf8Yr1DDlp2Brg');
var rows, clubs = {};

(async function init () {
    await master.useServiceAccountAuth({
        client_email: keys.client_email,
        private_key: keys.private_key
    });

    await master.loadInfo();

    const sheet = master.sheetsByIndex[0];
    rows = await sheet.getRows({offset: 2});

    /*let nrow = await sheet.addRow({'User ID': 2, Name: 'Ho Wilson'});

    console.log(nrow._rowNumber);
    nrow.Total = '=sum(F' + nrow._rowNumber + ':Z' + nrow._rowNumber + ')';
    await nrow.save();

    rows.push(nrow);
    console.log(rows.length);
    console.log(rows[0]['email']);*/
    //console.log(rows[0]);

    await sheet.loadCells('B4');
    console.log(sheet.getCellByA1('B4').value);
})();
