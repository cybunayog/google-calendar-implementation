//TODO: create a single event on google calendar
// Startup code to authenticate oauth for Google services
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const prompt = require('prompt');
const moment = require('moment');
const { google } = require('googleapis');
// const gCalendar = require('./classes/googleCalendar');
// const Authorize = require('./classes/auth');

// Scope that the API will read
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

const promptSchema = {
  properties: {
    summary: {
      description: 'What is the title of the event?',
      required: true,
    },
    location: {
      description: 'Enter the location. If none, press enter',
      default: '',
      required: false,
    },
    desc: {
      description: `What's the event about?`,
      required: true,
    },
    start_date: {
      description: 'Starting date? (Format: 2020-01-01)',
      required: true,
    },
    start_time: {
      description: 'Starting time (Format: 09:30) If none, press enter',
      default: ''
    },
    end_date: {
      description: 'Ending date? (Format: 2020-01-01)',
      required: true
    },
    end_time: {
      description: 'Ending time? (Format: 09:30) If none, press enter',
      default: ''
    }
  }
}

// // Load client secrets from a local file
// fs.readFile('credentials(1).json', (err, content) => {
//   if (err) return console.log('Error loading secret files: ', err);
//   let secretContents = JSON.parse(content);
//   // userAuth class gets the credentials and creates the OAuth2Client
//   // userCalendar gets the OAuth2Client
//   userAuth = new Authorize(secretContents);
//   userCalendar = new gCalendar(userAuth);
//   userAuth.authorize(secretContents, userCalendar.listEvents());
// });


// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

let calendar;

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Calendar API.
  authorize(JSON.parse(content), addEvent);
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
  console.log('Authorize this app by visiting this url:', authUrl);

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
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
function listEvents(auth) {
  calendar = google.calendar({version: 'v3', auth});
  calendar.events.list({
    calendarId: 'primary',
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
    } else {
      console.log('No upcoming events found.');
    }
  });
}

function addEvent(auth) {
  calendar = google.calendar({version: 'v3', auth});
  // Event object
  let summary, location, desc, start_date, end_date;
  // rl.question('What is the title of the event?', answer => {
    
  //   summary = answer;
  //   console.log(summary);
  // });

  // rl.question('Is there a location? (y/n)', answer => {
    
  //   if (answer === 'n') {
  //     rl.question('Where is the location?', res => {
  //       location = res;
  //     });
  //   } else {
  //     location = '';
  //   }
  //   console.log(location);
  // })


  prompt.start();

  prompt.get(promptSchema, (err, res) => {
    console.log(res);
  });
  
  let event = {
    'summary': summary,
    'location': location,
    'description': desc,
    'start': {
      'dateTime': start_date,
      'timeZone': 'America/Los Angeles'
    },
    'end': {
      'dateTime': end_date,
      'timeZone': 'America/Los Angeles'
    },
    'reminders': {
      'useDefault': false,
      'overrides': [
        { 'method': 'email', 'minutes': 24 * 60 },
        { 'method': 'popup', 'minutes': 10 },
      ],
    },
  };

  // Insert event into calendar
  // return calendar.events.insert({
  //   calendarId: CALENDAR_ID,
  //   resource: event,
  //   }, (err, event) => {
  //     if (err) {
  //       console.log('There was an error contacting the Calendar service: ', err);
  //       return;
  //     }
  //     console.log('Event created: %s', event.htmlLink)
  //     }
  // ); 
}