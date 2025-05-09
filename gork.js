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
    const res = await ai.models.generateContent({model: "gemini-1.5-flash",contents: `first read this message "${message.content}", only send the respone to this given message nothing else.`,});
    message.reply(res.text)
  } catch (err) {console.log('error:' + err.message);};
});

gork.login(process.env.TOKEN);