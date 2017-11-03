const fetch = require('node-fetch');
const { createTfidf, search } = require('./createTfidf');

class Bot {
  constructor({ mapsApiKey, weatherApiKey }) {
    this.mapsApiKey = mapsApiKey;
    this.weatherApiKey = weatherApiKey;
    this.searchMap = createTfidf();
    this.users = {};
  }

  async generateResponse(message) {
    try {
      let messages = [];
      switch (message.action) {
        case 'join':
          this.users[message.user_id] = message.name;
          return this.handleJoinAction(message);
        case 'message':
          let textMessages = await this.handleMessageAction(message);
          messages = textMessages;
          break;
      }
      return this.craftReply(message.user_id, messages);
    } catch(e) {
      console.error(`Error generating response: "${e}"`);
      return this.defaultReply('error');
    }
  }

  craftReply(userId, messageArr) {
    // look up user
    const user = this.users[userId];
    let addressUser = true;
    messageArr[0] = `${user}, ${messageArr[0]}`;
    return {
      messages: [{
        type: 'text',
        text: messageArr[0],
      }],
    }
  }

  handleJoinAction(message) {
    return {
      messages: [{
        type: 'text',
        text: `Hello, ${message.name}! Try asking me about the weather.`
      }]
    };
  }

  handleSearch(message) {
    const searchTerm = message.text.replace('search ', '');
    const results = search(searchTerm, this.searchMap).join('\n')
    return {
      messages: [{
        type: 'text',
        text: `${results}`
      }]
    };
  }

  async handleMessageAction(message) {
    // catch 'search ___'
    if (message.text.indexOf('search') > -1) {
      return this.handleSearch(message);
    }

    // Match phrase like: (What's(?)) (the weather) (in(?)) <Location>
    const sentenceRegex = /^(?:whats|what is|hows|what's|how's|how is)?\s*(?:weather|the weather)\s+(?:of|in|at|for)?\s*(.*)$/;
    // Match phrase like: <Location> (weather)
    const clauseRegex = /(.*)(?=\s+(weather|the weather)\s*)/;
    let lowerCaseText = message.text.toLowerCase();
    const includeTomorrow = lowerCaseText.indexOf('tomorrow') > -1;
    lowerCaseText = lowerCaseText.replace('tomorrow', '');

    const matches = lowerCaseText.match(sentenceRegex) || lowerCaseText.match(clauseRegex);
    if (!matches) { return this.defaultReply() } // Not recognized as weather prompt

    const location = matches[1]; // Matched group
    const { latLng, readableLocation } = await this._getLatLng(location);
    if (!latLng) { return this.defaultReply('weather') }

    const weather = await this._getWeather(latLng);
    if (!weather) { return this.defaultReply('weather') }

    if (includeTomorrow) {
      return [
        `The weather for ${readableLocation} tomorrow will be a high of ${weather.tomorrow.temperatureMax}F and a low of ${weather.tomorrow.temperatureMin}F. ${weather.tomorrow.summary}.`
      ]
    }

    return [
      `Currently it is ${weather.currently.temperature}F at ${readableLocation}. ${weather.currently.summary}.`
    ];
  }

  _getLatLng(location) {
    const queryParams = `address=${location}&key=${this.mapsApiKey}`;
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?${queryParams}`)
    .then(res => res.json())
    .then(body => {
      if (body.status !== 'OK') {
        return Promise.reject(`${body.status}--${body.error_message}`)
      }
      return {
        latLng: body.results[0].geometry.location,
        readableLocation: body.results[0].formatted_address
      };
    }).catch(err => {
      console.error(`Error getting location from GMAPS: "${err}"`);
      return null;
    });
  }

  _getWeather({ lat, lng }) {
    const queryParams = 'exclude=minutely,hourly'
    return fetch(`https://api.darksky.net/forecast/${this.weatherApiKey}/${lat},${lng}?${queryParams}`)
    .then(res => res.json())
    .then(body => {
      return {
        currently: body.currently,
        tomorrow: body.daily.data[1]
      };
    }).catch(err => {
      console.error(`Error getting weather from Dark Sky: "${err}"`);
      return null;
    });
  }

  defaultReply(context) {
    switch (context) {
      case 'error':
        return {
          messages: [{
            type: 'text',
            text: 'I\'m sorry, something went wrong. Please try again!'
          }]
        };
      case 'weather':
        return {
          messages: [{
            type: 'text',
            text: 'I\'m sorry, I had trouble finding the weather there. Perhaps try a different location'
          }]
        }
      default:
        return {
          messages: [{
            type: 'text',
            text: 'I\'m sorry, I don\'t know how to help with that. Try asking me something like "What\'s the weather in Chicago?"'
          }]
        };
    }
  }
}

module.exports = Bot;

/*
Potential improvements:
- Remember users, so can give customized responses / remember locations
- Multi-message context (ex: "What's the weather" > "Where?" > "In Chicago")
- Rich responses for weather (https://erikflowers.github.io/weather-icons/)
- Better/more-robust language processing
- More varied replies (esp. default replies)
- Rework so it can be extended more easily (handle more than just weather)
*/
