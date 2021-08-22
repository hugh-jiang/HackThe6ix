const Discord = require('discord.js');
const client = new Discord.Client(
    {intents: ["GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILDS"]}
);

const config = require('./config.json');
const commands = require(`./bin/commands`);

//in case the bot was not configured properly
if(!config.PREFIX || !config.BOT_TOKEN) {
    console.error("Error: the configuration file was configured properly.");
    console.error("Make sure there are no spelling mistakes.");
    process.exit(1);
}

client.on('message', msg => {
    if (msg.content.startsWith(config.PREFIX)) {
        const  commandBody = msg.content.substring(config.PREFIX.length).split(' ');
        
        // Set the channel name
        let channelName = "";
        for (let i = 1; i < commandBody.length; i++) {
            channelName = channelName + commandBody[i] + ' ';
        }
        channelName = channelName.trim();

        // Make sure a channel was entered
        if (msg.content.trim().toLowerCase() == "!enter") msg.reply('Please enter a voice channel')
        // Run the command to get the bot to enter a voice channel
        else if (commandBody[0] === ('enter') && channelName) commands.enter(msg, channelName);
        
        // Run the exit voice channel command
        if (commandBody[0] === ('exit')) commands.exit(msg);
        
    }
});

client.login(config.BOT_TOKEN);

client.on('ready', () => {
    console.log(`\nONLINE\n`);
});

