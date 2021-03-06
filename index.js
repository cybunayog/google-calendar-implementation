// Startup code to authenticate oauth for Google services & other packages/files
const fs = require('fs');
const readline = require('readline');
const prompt = require('prompt');
const promptSync = require('prompt-sync')();
const moment = require('moment');
const { google } = require('googleapis');
const promptSchema = require('./prompt');

// Scope that the API will read and other predefined variables
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
let calendarId;
const CLIENT_SECRET = 'credentials.json';

// Initial setup for readline package
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
  
//NOTE: Delete token.json in the directory if having auth errors for testing. The script will regenerate a new token for every run.
const TOKEN_PATH = 'token.json';

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

// Load client secrets from a local file.
fs.readFile(CLIENT_SECRET, (err, content) => {

  // Get the calendar ID first
  calendarId = promptSync("What is the calendar's ID? (If personal, use 'primary'.)");

  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  rl.question("Would you like to look at (list) or create an (event)? ", answer => {
    switch (answer) {
      case 'event':
        console.log("You chose: ", answer, calendarId);
        return authorize(JSON.parse(content), insertEvents);
      case 'list':
        console.log("You chose: ", answer, calendarId);
        return authorize(JSON.parse(content), listEvents);
      default:
        console.log('Closing prompt....');
        rl.close();
    }
  });
});


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url: ', authUrl);

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token ', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, id) {
  const calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res.data.items;
    if (events.length) {
      console.log('Upcoming 10 events:');
      events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });

      // Kill program
      process.exit();
    }
    console.log('No upcoming events found.');
    return;
  });
  }

/**
 * Creates an event on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function insertEvents(auth) {
  const calendar = google.calendar({version: 'v3', auth});
  // Event object
  let summary, location, desc, start_date, end_date;

  prompt.start();

  prompt.get(promptSchema, (err, res) => {
    if (err) console.err(err);
    summary = res.summary;
    location = res.location;
    desc = res.desc;

    // Time formatting (It's set to PST)
    start_date = moment(`${res.start_date} ${res.start_time}`, moment.HTML5_FMT.DATETIME_LOCAL).format('YYYY-MM-DDTHH:mm:ss-07:00');
    end_date = moment(`${res.end_date} ${res.end_time}`, moment.HTML5_FMT.DATETIME_LOCAL).format('YYYY-MM-DDTHH:mm:ss-07:00');

    console.log(summary, location, desc, start_date, end_date);
    
    var event = {
      'summary': summary,
      'location': location,
      'description': desc,
      'start': {
        'dateTime': start_date,
      },
      'end': {
        'dateTime': end_date,
      },
      'reminders': {
        'useDefault': false,
        'overrides': [
          { 'method': 'email', 'minutes': 24 * 60 },
          { 'method': 'popup', 'minutes': 10 },
        ],
      },
    };

    // Add event to calendar
    calendar.events.insert({
      auth: auth,
      calendarId,
      resource: event,
      }, (err, ev) => {
        if (err) {
          console.error('There was an error contacting the Calendar service: ', err);
          return;
        }
        console.log('Success!! Event created at %s', ev.data.htmlLink);
      
        // Kill program 
        process.exit();
        }
      ); 
    });
  }