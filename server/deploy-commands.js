// This file is for pushing a list of commands (Name,Description) to the discord api.
// This only registers the commands with discord.


// Require dotenv so we can use .env file types.
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// Use nodes file system intergration to read folders.
const fs = require('fs');
// Rest allows us to send delete, get, patch, post, put requests.
const { REST } = require('@discordjs/rest');
// Routes allows us to easily create urls for submitting to the discord api.
const { Routes } = require('discord-api-types/v9');
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(TOKEN);

// Delete global bot commands.

// rest.get(Routes.applicationCommands(CLIENT_ID))
// 	.then(data => {
// 		console.log(data);
// 		for (const command of data) {
// 			rest.delete(Routes.applicationCommand(CLIENT_ID, command.id));
// 			console.log(`deleted ${command.name}`);
// 		}
// 	})
// 	.catch(console.error);

// Add current bot commands to specifc server.

rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);