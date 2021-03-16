//TODO: create a single event on google calendar

// Startup code to authenticate oauth for Google services
require('dotenv').config();

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { gCalendar } = require('./classes/googleCalendar');

// Scope that the API will read
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Stores user's refresh token and is created automatically when flow is complete
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file
//TODO: Finish this 
fs.readFile('credentals.json', (err, content) => {
  if (err) return console.log('Error loading secret files: ', err);

  authorize(JSON.parse(content))
})
