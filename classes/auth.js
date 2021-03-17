const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Stores user's refresh token and is created automatically when flow is complete
const TOKEN_PATH = 'token.json';

class Authorize {
  constructor(credentials) {
    this.credentials = credentials;
  }
  
  // Create an OAuth2 client and execute the given callback function when accepted
  authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]
    );

    // Check if token is previously stored
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      return callback(oAuth2Client);
    });
  }

  // Get and store new token after prompting for user authorization, and 
  // finally executing the requested callback w/ authorized OAuth2 client.
  getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scopes: SCOPES
    });

    console.log('Authorize this app by visiting this url: ', authUrl);

    // Very similar to Java's System.out console class
    // reads the user' console input and output
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token: ', err);
        oAuth2Client.setCredentials(token);

        // store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
        });
        return callback(oAuth2Client);
      });
    });
  }
}

module.exports = Authorize;