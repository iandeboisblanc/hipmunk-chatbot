const express = require('express');
const formidable = require('express-formidable');
const config = require('./config.json');
const { createTfidf, search } = require('./createTfidf');

const {
  PORT,
  GMAPS_API_KEY,
  DARK_SKY_API_KEY
} = config;

if (!PORT || !GMAPS_API_KEY || !DARK_SKY_API_KEY) {
  console.error('Missing configs! Check config.json')
  process.exit(1);
}

// console.log('starting ds build');
// const rankedSearchMap = createTfidf();
// console.log('done');
// console.log(rankedSearchMap)
// console.log(search('home town', rankedSearchMap));

const server = express();
const Bot = require('./Bot.js');
const bot = new Bot({
  mapsApiKey: GMAPS_API_KEY,
  weatherApiKey: DARK_SKY_API_KEY
});

// Allow cross-origin requests
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://hipmunk.github.io');
  next();
});

// Handle parsing of multipart forms
server.use(formidable());

// Handle new messages
server.post('/chat/messages', (req, res) => {
  bot.generateResponse(req.fields).then((response) => {
    res.send(response);
  });
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
