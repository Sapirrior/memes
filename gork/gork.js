/*
 * Copyright © 2025 Jimmynnit
 * Licensed under the MIT License. See LICENSE file in the project root or
 * https://opensource.org/licenses/MIT for details.
 */

const { Client, GatewayIntentBits, PermissionsBitField, Events } = require('discord.js');
const gork = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const linkai = require('./LinkAI.js');
require('dotenv').config();
gork.once(Events.ClientReady, g => { try { console.log(`online as ${g.user.tag}`); g.user.setActivity('on X'); } catch (err) { console.error('err: setting client ready status:', err); } });
gork.on(Events.MessageCreate, async message => { try { if (!message.guild || message.author.bot || message.author.id === message.guild.ownerId || message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return; const res = linkai(message.content); if (!res || res === '0') return; if (!message.channel.permissionsFor(message.guild.members.me).has([PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.SendMessages])) { console.warn('err: missing channel permissions'); return; } await message.delete().catch(err => { console.error('err: deleting message:', err); throw err; }); const msg = await message.channel.send(`<@${message.author.id}> No Links Allowed`).catch(err => { console.error('err: sending warning:', err); throw err; }); setTimeout(async () => { try { await msg.delete(); } catch (err) { console.error('err: deleting warning message:', err); } }, 5000); } catch (err) { console.error('err: processing message event:', err); } });
gork.on('rateLimit', data => { console.warn(`rate limit hit, timeout: ${data.timeout}ms, limit: ${data.limit}`); });
try { if (!process.env.TOKEN) throw new Error('missing token'); gork.login(process.env.TOKEN).catch(err => { console.error('err: login failed:', err); process.exit(1); }); } catch (err) { console.error('err: initializing bot:', err); process.exit(1); }