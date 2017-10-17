# Hipmunk Chatbot Engine

This is a node-based chatbot webserver built to interact with the Hipmunk [Lessenger UI](http://hipmunk.github.io/hipproblems/lessenger/).
Currently, it is capable of responding to simple weather prompts (*e.g.* "What is the weather in Arizona?") by utilizing
the Google Maps and Dark Sky APIS.

To use, follow the setup instructions below to start the server, then visit the Lessenger UI and begin chatting!

## Setup Instructions

### Install Dependencies

#### 1. Install Node

The chatbot requires at least Node v7, though Node v8 is recommended. You can download and install Node
[here](https://nodejs.org/en/), or manage multiple versions using [NVM](https://github.com/creationix/nvm).

#### 2. Setup config

The chatbot requires API keys for Google Maps and Dark Sky. These need to be set in `config.json`.

An example of the required config file is provided as `config.example.json`. To generate the real config file,
run:
```
cp config.example.json config.json
```
Then update `config.json` to include your API keys.

#### 3. Install packages

```
yarn install
```

### Start Server

In order to interact with the Lessenger UI, the webserver is expected to run on `localhost:9000`.
To start the node process, run:
```
yarn start
```

During development, it may be useful to run the process using [nodemon](https://nodemon.io/) instead.
To run with nodemon, install nodemon then use the command:
```
yarn run start-dev
```
