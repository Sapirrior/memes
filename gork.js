const { Client, GatewayIntentBits, Events } = require('discord.js');
const gork = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});
const fs = require('node:fs');
require('dotenv').config();
let res = [];

gork.once(Events.ClientReady, g => {
  g.user.setActivity('on X');
  console.log('im alive :>');
  try {const data = fs.readFileSync('./gork-s.json', 'utf8');res = JSON.parse(data);}catch(err){console.log(err);};
});

gork.on(Events.MessageCreate, async msg => {
  if(msg.author.bot) return;
  if(Math.floor(Math.random()* 10) > 3) return; // only 30% chance
  const randomResIndex = Math.floor(Math.random() * res.length);
  const randomRes = res[randomResIndex];
  try{msg.channel.send(randomRes)}catch(error){console.log(error)}
});

gork.login(process.env.TOKEN); // Login Gork