const { google } = require('googleapis');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');
const { calendar } = require('googleapis/build/src/apis/calendar');

const CALENDAR_ID = 'primary';

class gCalendar {
  // Constructor needs authentication
  constructor(auth) {
    this.auth = auth;
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  function addEvent(summary, location, desc, start_date, end_date) {
    // Event object
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
    return this.calendar.events.insert({
      auth: this.auth,
      calendarId: CALENDAR_ID,
      resource: event,
    }, (err, event) => {
      if (err) {
        console.log('There was an error contacting the Calendar service: ', err);
        return;
      }
      console.log('Event created: %s', event.htmlLink)
    }
  }

  // List 10 events
  function listEvents() {
    return this.calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: (new Date()).toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    }, (err, res) => {
      if (err) return console.log('The API returned an error: ', err);
      const events = res.data.items;
      if (events.length) {
        console.log('Upcoming 10 events: ');
        events.map((event, i) => {
          const start = event.start.dateTime || event.start.date;
          console.log(`${start} - ${event.summary}`);
        })
      } else {
        console.log('No upcoming events found.');
      }
    });
  }
}

module.exports = gCalendar;