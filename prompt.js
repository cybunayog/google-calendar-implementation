// Schema for Events promt
const moment = require('moment');

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
      description: `Starting date? (Format: ${moment().format("YYYY-MM-DD")})`,
      required: true,
    },
    start_time: {
      description: `Starting time (Format: 09:30) If none, press enter`,
      default: ''
    },
    end_date: {
      description: `Ending date? (Format: ${moment().format('YYYY-MM-DD')})`,
      required: true
    },
    end_time: {
      description: 'Ending time? (Format: 09:30) If none, press enter',
      default: ''
    }
  }
}

module.exports = promptSchema;