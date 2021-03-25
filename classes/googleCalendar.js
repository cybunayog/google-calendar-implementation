const { google } = require('googleapis');

class gCalendar {
  // Constructor needs authentication
  constructor(auth, calendarId) {
    this.auth = auth;
    this.calendar = google.calendar({ version: 'v3', auth });
    this.calendarId = calendarId;
  }


  insertEvent(summary, location, desc, start_date, end_date) {
    // Event object
    let event = {
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

    // Insert event into calendar
    return calendar.events.insert({
      auth: this.auth,
      calendarId: this.calendarId,
      resource: event,
    }, (err, event) => {
      if (err) {
        console.log('There was an error contacting the Calendar service: ', err);
        return;
      }
      console.log('Event created: %s', event.htmlLink)
    }
    );
  }

  // List 10 events
  listEvents(auth) {
    return calendar.events.list({
      calendarId: this.calendarId,
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