# Commands
- Replace keywords in brackets. Do not include brackets in your message.
- All commands are not case-sensitive.

## Members
- Sign in: `![club id] [key]`
    - Upon signing in for the first time, you will be asked to update your email and grade level.
- Update member info:
    - Email: `update [club id] email [address]`
    - Grade level: `update [club id] grade [#]`
- Check member info:
    - Email: `check [club id] email`
    - Grade level: `check [club id] grade`
    - Number of sign ins: `check [club id] total`

## Club Admin
- Update admin: `readmin [club id] [password]`
    - For each club, there may only be one admin account at a time. One account may be the admin for multiple clubs.
    - Only the club admin is allowed to update/check club info.
- Update club info:
    - Password: `update [club id] pwd [new password]`
    - Google sheet:
        - Sheet ID: `update [club id] sheet [sheet id]`
        - Client email: `update [club id] client_email [address]`
        - Private key: `update [club id] private_key [key]`
    - Sign in key: `update [club id] key [key]`
        - Updating the sign in key will create a new column in the sheet. Header includes the key, date, and meeting total.
        - Keys must be unique for each meeting. Do not include any spaces in your key.
- Check club info:
    - Password: `check [club id] pwd`
    - Sheet ID: `check [club id] sheet`
    - Client email: `check [club id] client_email`
    - Private key: `check [club id] private_key`
    - Sign in key: `check [club id] key`

## Help
- Send `member help` for the list of member commands
- Send `admin help` for the list of admin commands
- Send `full help` for a link to this page
