# // Code adapted from open source resources including:
# // https://discord.com/developers/docs/intro
# // https://gist.github.com/tyliec/ddcb3dd66328f8aa8e7384e0789ea01e
# // https://github.com/chebro/discord-voice-recorder

from __future__ import print_function
from google.cloud import vision
import discord
from discord.ext import commands
import os
import six
from google.cloud import translate_v2 as translate
import time
import json

bot = commands.Bot(command_prefix = '!')
client = discord.Client()

# Import API Keys
f = open('config.json')
DISCORD_API_TOKEN = json.load(f)['BOT_TOKEN']
f.close()
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "login.json"

NUM_LABELS = 5
TTS = False
LANG = "en"
START_TIME = 0

def getTime():
    return round(time.time() * 1000)

def printTimeTaken():
    global START_TIME
    return f"*I am a bot. This action was done automatically in {round((getTime()-START_TIME)/1000, 2)}s*"


def translate_text(target, text):
    """Translates text into the target language.

    Target must be an ISO 639-1 language code.
    See https://g.co/cloud/translate/v2/translate-reference#supported_languages
    """
    translate_client = translate.Client()

    if isinstance(text, six.binary_type):
        text = text.decode("utf-8")

    # Text can also be a sequence of strings, in which case this method
    # will return a sequence of results for each text.
    result = translate_client.translate(text, target_language=target)
    return (result["translatedText"])

@bot.event
async def on_ready():
    print('We have logged in as {0.user}'.format(bot))

@bot.command(name = 'clear')
async def clear(ctx, amount = 100):
    await ctx.channel.purge(limit = amount)

@bot.command(name = 'tts')
async def tts(ctx):
    global TTS
    TTS = not TTS

@bot.command(name = 'lang')
async def selectLang(ctx,*,message):
    global LANG
    LANG = message;

#878472669975150642 is the TTS Output Channel.
@bot.event
async def on_message(message):
    global TTS
    global client
    global LANG
    global START_TIME

    START_TIME = getTime()

    if(message.author.bot):
        return;

    if (message.content.startswith("!")):
        await bot.process_commands(message)
        return

    if (LANG != "en" and message.channel.id != 878472669975150642 and len(message.attachments) == 0):
        msg = f"**Translation** \n"
        await message.reply(f"{msg} {translate_text(LANG, message.content)} \n {printTimeTaken()}")


    if len(message.attachments) > 0:
        if message.attachments[0].url.upper().endswith('PNG') or message.attachments[0].url.upper().endswith('JPG') or message.attachments[0].url.upper().endswith('JPEG'):
            temp = vision.ImageAnnotatorClient()
            image = vision.Image()
            image.source.image_uri = message.attachments[0].url

            response = temp.label_detection(image=image)

            msg = f"**Image Caption** \n {message.author} sent an image that may contain: "

            for i in range(NUM_LABELS):
                label =  response.label_annotations[i]
                if i != NUM_LABELS - 1:
                    msg = msg + f'{label.description}, '
                else:
                    msg = msg + f'and {label.description}.'


            await message.reply(f"{msg} \n {printTimeTaken()}")
    if (TTS == True):
        msg = message.content
        channel = bot.get_channel(878472669975150642)
        author = f"{message.author}"
        await message.guild.me.edit(nick=author)
        await channel.send(f"**TTS Message From: {message.author}"
                           f"**")
        await channel.send(translate_text(LANG, msg), tts = True)
        await message.guild.me.edit(nick="Disimplify")

bot.run(DISCORD_API_TOKEN)