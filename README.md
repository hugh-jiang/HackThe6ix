# Discord Accessibility Bot

A Discord Bot written in Python and Node JS that provides voice call transcription, text-to-speech, translation, and image description in Discord for the visually/hearing impaired. 

## Installation and Usage
Our Bot is written partially in Python and Javascript. First, clone the repository into your local machine.

### Dependencies
Python dependencies can be installed by running a "pip install" of the dependencies in the requirements.txt file.

Node JS dependencies can be installed by running "npm install package.json" in the root directory

### Environment Variables
This bot uses Google Cloud's APIs and Discord's APIs. You will need a Google Cloud account with the following API services enabled: Google Vision, Speech-to-Text, and Translate. Follow the instructions here to set environment variables for Python and Node JS to authenticate the API calls: https://cloud.google.com/docs/authentication/getting-started#cloud-console

Obtain a Discord API key you can sign up for a Discord developer account (https://discord.com/developers/docs/game-sdk/applications) and obtain a Discord API Key. Then, place your API Key in the "config.json" file. 

## Running the Bot
To run the Python portion of the Bot, run "python3 bot.py" from the root directory. 

To run the Node JS portion of the Bot, run "npm start" from the root directory.

