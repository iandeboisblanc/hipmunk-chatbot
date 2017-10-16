const express = require('express');
const formidable = require('express-formidable');

const PORT = process.env.npm_package_config_port;

const server = express();

// Allow cross-origin requests
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://hipmunk.github.io');
  next();
});

// Handle parsing of multipart forms
server.use(formidable());

server.post('/chat/messages', (req, res) => {
  console.log('Got message!');
  console.log(req.fields)
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`);
});
