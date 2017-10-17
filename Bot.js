const fetch = require('node-fetch');
const config = require('./config.json');

class Bot {

  async generateResponse(message) {
    console.log(message);
    try {
      switch (message.action) {
        case 'join':
          return await this.handleJoinAction(message);
        case 'message':
          return await this.handleMessageAction(message);
      }
    } catch(e) {
      console.error(e);
      return {
        messages: [{
          type: 'text',
          text: 'I\'m sorry, something went wrong. Please try again!'
        }]
      };
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

  getLatLng(location) {
    const queryParams = `address=${location}&key=${config.GMAPS_API_KEY}`;
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?${queryParams}`)
      .then(res => res.json())
      .then(body => {
        if (body.status !== 'OK') {
          return Promise.reject(body.error_message || 'Unknown error')
        }
        console.log('Got result from gmaps:', body);
        return body.results[0].geometry.location;
      }).catch(err => {
        console.error(`Error getting location from GMAPS: "${err}"`);
        return null;
      });
  }

  getWeather({ lat, lng }) {
    const queryParams = 'exclude=minutely,hourly'
    return fetch(`https://api.darksky.net/forecast/${config.DARK_SKY_API_KEY}/${lat},${lng}?${queryParams}`)
      .then(res => res.json())
      .then(body => {
        console.log('Got results from darksky:', body)
        return body.currently;
      }).catch(err => {
        console.error(`Error getting weather from Dark Sky: "${err}"`);
        return null;
      });
  }

  async handleMessageAction(message) {
    // TODO: Decide if weather
    const latLng = await this.getLatLng('San Francisco');
    if (!latLng) { return this.defaultReply() }
    const weather = await this.getWeather(latLng);
    if (!weather) { return this.defaultReply() }
    return {
      messages: [{
        type: 'text',
        text: `Currently it is ${weather.temperature}F. ${weather.summary}.`
      }]
    };
  }

  defaultReply() {
    return {
      messages: [{
          type: 'text',
          text: 'I\m sorry, I don\'t know how to help with that. Try asking me something like "What\'s the weather in Chicago?"'
      }]
    };
  }
}

module.exports = Bot;

/*
Potential improvements:
- Remember users, so can give customized responses / remember locations
- Multi-message context (ex: "What's the weather" > "Where?" > "In Chicago")
- Better language processin
*/
