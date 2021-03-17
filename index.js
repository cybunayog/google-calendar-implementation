//TODO: create a single event on google calendar
// Startup code to authenticate oauth for Google services
require('dotenv').config();
const fs = require('fs');
const { google } = require('googleapis');
const gCalendar = require('./classes/googleCalendar');
const Authorize = require('./classes/auth');

// Scope that the API will read
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

let userAuth, userCalendar;

// Load client secrets from a local file
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading secret files: ', err);
  let secretContents = JSON.parse(content);
  // userAuth class gets the credentials and creates the OAuth2Client
  // userCalendar gets the OAuth2Client
  userAuth = new Authorize(secretContents);
  userAuth.authorize(secretContents);
});
