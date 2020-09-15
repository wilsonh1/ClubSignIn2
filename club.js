'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet');

class Club {
    constructor (pwd, admin, sheet, client, key) {
        this.pwd = pwd;
        this.admin = admin;
        this.sheet = new GoogleSpreadsheet(sheet);
        this.client = client;
        this.key = key.replace(/\\n/g, '\n');
    }

    async authorize () {
        await this.sheet.useServiceAccountAuth({
            client_email: this.client,
            private_key: this.key
        });

        await this.sheet.loadInfo();
        this.sheet = this.sheet.sheetsByIndex[0];
    }

    async test () {
        await this.sheet.loadCells('A4:D4');
        console.log(this.sheet.getCellByA1('B4').value);
    }
}

module.exports = Club;
