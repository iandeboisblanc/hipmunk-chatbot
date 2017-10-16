class Bot {
  constructor() {

  }

  async generateResponse(message) {
    // const message = 'Example response';
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
