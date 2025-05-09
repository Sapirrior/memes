const { Client, GatewayIntentBits, Events } = require('discord.js');
const gork = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
const fs = require('node:fs');
require('dotenv').config();
const res = [];

gork.once(Events.ClientReady, g => {
  g.user.setActivity('on X');
  console.log('im alive :>');
  try {const data = fs.readFileSync('./gork-s.json', 'utf8');res = JSON.parse(data);}catch(err){console.log(err);};
});

gork.on(Events.MessageCreate, async msg => {
  if(msg.author.bot) return;
  
  const randomResIndex = Math.floor(Math.random() * res.length);
  const randomRes = res[randomResIndex];
  try{msg.channel.send(randomRes)}catch(error){console.log(error)}
});

gork.login(process.env.TOKEN); // Login Gork