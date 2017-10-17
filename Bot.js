const fetch = require('node-fetch');

class Bot {
  constructor({ mapsApiKey, weatherApiKey }) {
    this.mapsApiKey = mapsApiKey;
    this.weatherApiKey = weatherApiKey;
  }

  async generateResponse(message) {
    try {
      switch (message.action) {
        case 'join':
          return await this.handleJoinAction(message);
        case 'message':
          return await this.handleMessageAction(message);
      }
    } catch(e) {
      console.error(`Error generating response: "${e}"`);
      return this.defaultReply('error');
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

  async handleMessageAction(message) {
    // Match phrase like: (What's) (the weather) (in) <Location>
    const sentenceRegex = /(?:whats|what is|hows|what's|how's|how is)?\s*(?:weather|the weather)\s+(?:of|in|at|for)?\s?(.*)$/;
    // Match phrase like: <Location> (weather)
    const clauseRegex = /(.*)(?=\s+(weather|the weather))/;
    const lowerCaseText = message.text.toLowerCase();

    const location = lowerCaseText.match(sentenceRegex) || lowerCaseText.match(clauseRegex);
    if (!location) { return this.defaultReply() } // Not recognized as weather prompt

    const latLng = await this._getLatLng(location);
    if (!latLng) { return this.defaultReply('weather') }

    const weather = await this._getWeather(latLng);
    if (!weather) { return this.defaultReply('weather') }

    return {
      messages: [{
        type: 'text',
        text: `Currently it is ${weather.temperature}F. ${weather.summary}.`
      }]
    };
  }

  _getLatLng(location) {
    const queryParams = `address=${location}&key=${this.mapsApiKey}`;
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?${queryParams}`)
    .then(res => res.json())
    .then(body => {
      if (body.status !== 'OK') {
        return Promise.reject(`${body.status}--${body.error_message}`)
      }
      return body.results[0].geometry.location;
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
      return body.currently;
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
- Confirm location with name or map in response
- Better/more-robust language processing
- More varied replies (esp. default replies)
- Rework so it can be extended more easily (handle more than just weather)
*/
