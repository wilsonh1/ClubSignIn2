# ClubSignIn2

## Setup
- Google sheets API service account:
    - Go to [console.developers.google.com](https://console.developers.google.com/).
    - Create a new project and enable the Google Sheets API.
    - Under Credentials, create a new service account with Editor access.
    - Under this service account, create a new key.
    - Send me the JSON file containing the account credentials.

- Attendance sheet:
    - Create a copy of [example](https://docs.google.com/spreadsheets/d/1SQ-KhCJfa8mjXTG9EQ3gLa5h1CCn-Wyae8wl4KhuS_M/edit?usp=sharing).
    - Order of columns is important, as well as capitalization in the header. Column F may be deleted.
    - Send me the sheet ID in the URL.

- Create and send me a club ID and password.

- Upon registering your club, message `readmin [club id] [password]` to claim admin access. Admins have permission to update/check club info (see [commands](commands.md)).

- This bot updates the attendance sheet automatically. I would advise against updating the sheet manually, as values are cached in the bot and may cause conflicts.

## Commands
- For a full list of commands along with descriptions, see [commands](commands.md)
