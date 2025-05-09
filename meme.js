const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.mentions.has(client.user) && !message.author.bot) {
        try {
            const res = await fetch('https://www.reddit.com/r/memes/random.json', {
                headers: { 'User-agent': 'Discord Meme Bot' }
            });
            const post = (await res.json())[0].data.children[0].data;

            if (!post.url.match(/\.(jpeg|jpg|gif|png)$/)) {
                return message.channel.send('No image meme found!');
            }

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: post.title.slice(0, 253) + (post.title.length > 253 ? '...' : ''),
                    url: `https://reddit.com${post.permalink}`
                })
                .setImage(post.url)
                .setFooter({ text: 'Find Top Memes From Internet' });

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.channel.send('Failed to fetch meme!');
        }
    }
});

client.login(process.env.TOKEN);