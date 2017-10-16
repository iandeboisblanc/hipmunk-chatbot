const express = require('express');
const PORT = process.env.npm_package_config_port;

const server = express();

server.get('/', (req, res) => {
  res.send('Hello World!')
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
