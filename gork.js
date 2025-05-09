const { Client, GatewayIntentBits, Events } = require('discord.js');
const gork = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
const { GoogleGenAI } = require('@google/genai');
require("dotenv").config();

gork.once(Events.ClientReady, g => {
  g.user.setActivity('on X');
  console.log('im alive :>');
});

gork.on(Events.MessageCreate, async message => {
  if(message.author.bot) return;
  if(Math.floor(Math.random()* 10) > 1) return; // only 10% chance
  const ai = new GoogleGenAI({ apiKey: process.env.API });
  
  try {
    const res = await ai.models.generateContent({model: "gemini-1.5-flash",contents: ` your name is Gork. you recived a message from ${message.author.username}, respone to  his "${message.content}" message in a bit humorous way. only send your respone, nothing else.`,});
    message.reply(res.text)
  } catch (err) {console.log('error:' + err.message);};
});

gork.login(process.env.TOKEN);