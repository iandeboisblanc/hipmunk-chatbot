class Bot {

  async generateResponse(message) {
    console.log(message);
    try {
      switch (message.action) {
        case 'join':
        return await this._handleJoin(message);
        case 'message':
        return await this._handleMessage(message);
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

  _handleJoin(message) {
    return {
      messages: [{
        type: 'text',
        text: `Hello, ${message.name}!`
      }]
    };
  }

  async _handleMessage(message) {
    const response = {
      messages: [{
        type: 'text',
        text: 'Example 2'
      }]
    };
    return response;
  }
}

module.exports = Bot;
