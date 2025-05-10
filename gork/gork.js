// Discord.js v14 Meme Bot
// This bot responds to mentions by fetching and posting random memes from r/memes

// Required packages to install:
// npm install discord.js axios dotenv

// Configuration: Create a .env file with:
// DISCORD_TOKEN=your_discord_bot_token

require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Log when the bot is ready
client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
  client.user.setActivity('memes', { type: 'WATCHING' });
});

// Function to fetch a random meme from Reddit
async function getRandomMeme() {
  try {
    // Fetch memes from Reddit's r/memes subreddit
    const response = await axios.get('https://www.reddit.com/r/memes/hot.json?limit=100');
    const posts = response.data.data.children;
    
    // Filter out posts without images and stickied posts
    const memes = posts.filter(post => {
      const isImage = post.data.url.match(/\.(jpeg|jpg|gif|png)$/) !== null;
      return isImage && !post.data.stickied && !post.data.is_video;
    });
    
    // Get a random meme from the filtered list
    if (memes.length === 0) throw new Error('No memes found');
    const randomIndex = Math.floor(Math.random() * memes.length);
    return memes[randomIndex].data;
    
  } catch (error) {
    console.error('Error fetching meme:', error);
    throw error;
  }
}

// Function to create an embed for the meme
function createMemeEmbed(memeData) {
  return new EmbedBuilder()
    .setColor('#FF4500') // Reddit's color
    .setTitle(memeData.title)
    .setURL(`https://reddit.com${memeData.permalink}`)
    .setImage(memeData.url)
    .setFooter({ text: `👍 ${memeData.ups} | 💬 ${memeData.num_comments} comments | Posted by u/${memeData.author}` })
    .setTimestamp(new Date(memeData.created_utc * 1000));
}

// Listen for messages and respond to mentions
client.on('messageCreate', async message => {
  // Check if the message mentions the bot and doesn't come from a bot
  if (message.mentions.has(client.user) && !message.author.bot) {
    try {
      // Show typing indicator to make the bot feel more interactive
      await message.channel.sendTyping();
      
      // Send a loading message
      const loadingMsg = await message.reply('Looking for a meme... 🔍');
      
      // Fetch a random meme
      const memeData = await getRandomMeme();
      
      // Create and send the embed
      const memeEmbed = createMemeEmbed(memeData);
      await message.channel.send({ embeds: [memeEmbed] });
      
      // Delete the loading message
      await loadingMsg.delete().catch(console.error);
      
    } catch (error) {
      console.error('Error:', error);
      message.reply('Sorry, I couldn\'t fetch a meme right now. Try again later.');
    }
  }
});

// Error handling
client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord with your bot token
client.login(process.env.TOKEN);
