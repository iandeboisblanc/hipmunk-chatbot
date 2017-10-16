const express = require('express');
const formidable = require('express-formidable');
const config = require('./config.json');

const PORT = config.PORT;

const server = express();

// Allow cross-origin requests
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://hipmunk.github.io');
  next();
});

// Handle parsing of multipart forms
server.use(formidable());

server.post('/chat/messages', (req, res) => {
  const message = 'Example response';
  const response = {
    messages: [{
      type: 'text',
      text: message
    }]
  };
  console.log(req.fields)
  res.send(response);
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
