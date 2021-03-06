'use strict';

const {GoogleSpreadsheet} = require('google-spreadsheet');

class Club {
    constructor (pwd, admin, sheet, client, pkey) {
        this.pwd = pwd;
        this.admin = admin;
        this.sheet = new GoogleSpreadsheet(sheet);
        this.client_email = client;
        this.private_key = pkey.replace(/\\n/g, '\n');
    }

    async authorize (callback) {
        await this.sheet.useServiceAccountAuth({
            client_email: this.client_email,
            private_key: this.private_key
        });

        await this.sheet.loadInfo();
        this.sheet = this.sheet.sheetsByIndex[0];

        this.queryCol(callback);
        this.loadRows(callback);
    }

    updateAdmin (uid, pwd) {
        console.log(this.pwd);
        if (pwd != this.pwd)
            return 0;
        this.admin = uid;
        return 1;
    }

    updateClub (uid, field, val) {
        if (uid != this.admin)
            return 0;
        this[field] = val;
        return 1;
    }

    queryClub (uid, field) {
        if (uid != this.admin)
            return 0;
        if (field == 'key')
            return this.keys[this.keys.length - 1];
        return this[field];
    }

    nextCol (c) {
        return String.fromCharCode(c.charCodeAt(0) + 1);
    }

    async queryCol (callback) {
        await this.sheet.loadCells('F1:Z3');
        let col = 'F';
        this.keys = [];
        while (this.sheet.getCellByA1(this.nextCol(col) + '1').value) {
            this.keys.push(this.sheet.getCellByA1(col + '1').value);
            col = this.nextCol(col);
        }

        this.col = col;
        this.keys.push(this.sheet.getCellByA1(col + '1').value);

        callback();
    }

    async loadRows (callback) {
        this.rows = await this.sheet.getRows({offset: 2});
        this.ids = [];
        for (let i = 0; i < this.rows.length; i++)
            this.ids.push(this.rows[i]['User ID']);

        callback();
    }

    async updateKey (uid, key) {
        if (uid != this.admin)
            return 0;
        if (this.keys.includes(key))
            return 2;

        this.col = this.nextCol(this.col);
        this.keys.push(key);

        this.sheet.getCellByA1(this.col + '1').value = key;
        let date = new Date();
        date = new Date(date.toLocaleString("en-US", {timeZone: 'America/Los_Angeles'}));
        this.sheet.getCellByA1(this.col + '2').value = (date.getMonth() + 1) + '/' + date.getDate();
        this.sheet.getCellByA1(this.col + '3').formula = '=sum(' + this.col + '4:' + this.col + ')';
        await this.sheet.saveUpdatedCells();

        return 1;
    }

    async updateMember (uid, field, val) {
        let i = this.ids.indexOf(uid);
        if (i == -1)
            return 0;
        this.rows[i][field] = val;
        let n = this.rows[i]._rowNumber;
        this.rows[i].total = '=sum(F' + n + ':Z' + n + ')';
        await this.rows[i].save();
        return 1;
    }

    queryMember (uid, field) {
        let i = this.ids.indexOf(uid);
        if (i == -1)
            return 0;
        return this.rows[i][field];
    }

    async signIn (uid, key, name) {
        if (key != this.keys[this.keys.length - 1])
            return 2;

        let i = this.ids.indexOf(uid), n;
        if (i == -1) {
            let nrow = await this.sheet.addRow({'User ID': uid, 'Name': name});
            n = nrow._rowNumber;
            this.ids.push(uid);
            this.rows.push(nrow);
        } else
            n = this.rows[i]._rowNumber;

        await this.sheet.loadCells(this.col + n);
        let cell = this.sheet.getCellByA1(this.col + n);
        if (cell.value)
            return 3;
        cell.value = 1;
        await this.sheet.saveUpdatedCells();
        this.rows[i].total = '=sum(F' + n + ':Z' + n + ')';
        await this.rows[i].save();

        console.log(uid);
        return (i == -1) ? 1 : 0;
    }
}

module.exports = Club;
