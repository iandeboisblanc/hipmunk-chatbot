const express = require('express');
const formidable = require('express-formidable');
const config = require('./config.json');

const PORT = config.PORT;

const server = express();
const Bot = require('./Bot.js');
const bot = new Bot();

// Allow cross-origin requests
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://hipmunk.github.io');
  next();
});

// Handle parsing of multipart forms
server.use(formidable());

// Handle new messages
server.post('/chat/messages', (req, res) => {
  console.log(req.fields)
  bot.generateResponse(req.fields).then((response) => {
    res.send(response);
  }).catch((error) => {
    console.error(error);
    res.send({ messages: [{
      type: 'text',
      text: 'I\'m sorry, something went wrong. Please try again!'
    }]});
  });
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
