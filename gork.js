const { Client, GatewayIntentBits, Events } = require('discord.js');
const gork = new Client({intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
const axios = require('axios');
require('dotenv').config();

gork.once(Events.ClientReady, c => {
  console.log('online, sir');
  gork.user.setActivity('on X');
});

gork.on(Events.MessageCreate, async message => {
  if(message.author.bot) return;
  if(!message.mentions.has(gork.user)) return;
  
  try{const memes = await axios.get('https://meme-api.com/gimme');const meme = memes.data.url;const title = memes.data.title;}catch(err){console.log(err)};
  embed = {color: 0x0000,author: { name: title },image: { url: meme }};
  message.channel.send({embeds: [embed]}).catch(err => console.log(err));
});

gork.login(process.env.TOKEN)