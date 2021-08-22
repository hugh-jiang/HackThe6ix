// Code adapted from open source resources including:
// https://discord.com/developers/docs/intro
// https://gist.github.com/tyliec/ddcb3dd66328f8aa8e7384e0789ea01e
// https://github.com/chebro/discord-voice-recorder


const fs = require('fs');
const fsExtra = require('fs-extra');
const speech = require('@google-cloud/speech');

const speechClient = new speech.SpeechClient();

// Current channel flag
let currentChannel = "";


exports.enter = function(msg, channelName) {
    channelName = channelName.toLowerCase();
    if (channelName === currentChannel) {
        msg.channel.send(`Already in your voice channel`);
        return;
    }
    
    //filter out all channels that aren't voice or stage
    const voiceChannel = msg.guild.channels.cache
                            .filter(c => c.type === "voice" || c.type === "stage")
                            .find(channel => channel.name.toLowerCase() === channelName);
    
    //if there is no voice channel at all, or the channel is not voice or stage, or no channel was entered
    if (!voiceChannel || (voiceChannel.type !== 'voice' && voiceChannel.type !== 'stage'))
        return msg.reply(`The channel #${channelName} doesn't exist or isn't a voice channel.`);
    
    // set channel name flag
    currentChannel = channelName;
    
    msg.channel.send(`Joined ${voiceChannel} and starting transcription ...`);
    voiceChannel.join()
        .then(conn => {
            
            // Send transcription warning
            const dispatcher = conn.play(__dirname + '/../sounds/recording_warning.mp3');
            dispatcher.on('finish', () => { console.log(`Joined ${voiceChannel.name}!\n\nREADY TO TRANSCRIBE\n`); });
            
            // Alert members that their voice is being transcribed
            let inVoice = voiceChannel.members.map(member => member.id);
            let ping = '';
            for (let i = 0; i < inVoice.length; i ++){
                if (inVoice[i] != 878390790898991114)
                    ping += '<@'+inVoice[i] +'>';
            }
            if (ping != ''){
                msg.channel.send(ping);
                msg.channel.send('Your voice is being transcribed');
            }

            const receiver = conn.receiver;
            conn.on('speaking', (user, speaking) => {
                if (speaking) {
                    console.log(`${user.username} started speaking`);
                    
                    const audio = conn.receiver.createStream(user, { mode: 'pcm' }); // Signed 16-bit PCM as the encoding, a Little-endian byte order, 2 Channels (Stereo) and a sample rate of 48000Hz. https://discordjs.guide/voice/receiving-audio.html#basic-usage

                    const audioFileName = './recordings/' + user.id + '_' + Date.now() + '.pcm';

                    audio.pipe(fs.createWriteStream(audioFileName));

                    audio.on('end', async () => {
                        fs.stat(audioFileName, async (err, stat) => { // For some reason, Discord.JS gives two audio files for one user speaking. Check if the file is empty before proceeding
                            if (!err && stat.size) {
                                const file = fs.readFileSync(audioFileName);
                                const audioBytes = file.toString('base64');
                                const audio = {
                                    content: audioBytes,
                                };
                                const config = {
                                    encoding: 'LINEAR16',
                                    sampleRateHertz: 48000,
                                    languageCode: 'en-US',
                                    audioChannelCount: 2,
                                };
                                const request = {
                                    audio: audio,
                                    config: config,
                                };
                                const [response] = await speechClient.recognize(request);
                                const transcription = response.results
                                    .map(result => result.alternatives[0].transcript)
                                    .join('\n');

                                //client.channels.cache.get("878687006119583765").send(`${user.username}: ${transcription}`);
                                // If the transcription is empty then don't send a message
                                if (transcription.trim() != "") {
                                    msg.channel.send(`${user.username}: ${transcription}`);
                                }
                            }
                        });
                    });

                }
            });
        })
        .catch(err => { throw err; });


}

exports.exit = function (msg) {
    //Line below is added, will delete all files in recordings dir
    fsExtra.emptyDirSync("recordings");

    // Clear channel flag
    currentChannel = "";

    //check to see if the voice cache has any connections and if there is
    //no ongoing connection (there shouldn't be undef issues with this).
    if(msg.guild.voiceStates.cache.filter(a => a.connection !== null).size !== 1)
        return;
    
    //make sure it's .last() not .first().  some discord js magic going on rn
    const { channel: voiceChannel, connection: conn } = msg.guild.voiceStates.cache.last();
    const dispatcher = conn.play(__dirname + "/../sounds/badumtss.mp3", { volume: 0 });
    dispatcher.on("finish", () => {
        voiceChannel.leave();
        console.log(`\nSTOPPED RECORDING\n`);
        msg.channel.send(`Left ${voiceChannel} and stopped transcription`)
    });
};
