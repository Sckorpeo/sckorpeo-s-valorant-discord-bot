if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const { TOKEN } = process.env;
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
global.tempCh = [];

const client = new Client({ intents: [Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	client.commands.set(command.data.name, command);
}


client.once('ready', () => {
	console.log('The bot is online');
});

// Run command on slash command interaction.
client.on('interactionCreate', async int => {
	if (!int.isCommand()) return;

	const command = client.commands.get(int.commandName);

	if (!command) return;

	try {
		await command.execute(int);
	}
	catch (err) {
		console.error(err);
		await int.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// When someone leaves voice chat, check if there are any temp rooms empty.
// If there are, delete them.
client.on('voiceStateUpdate', async (oldState, newState) => {
	console.log('Voice state changed');
	console.log(global.tempCh);
	let newChList = global.tempCh;
	if (global.tempCh.length > 0) {
		for (const ch of global.tempCh) {
			const channel = await newState.guild.channels.fetch(ch.id);
			if (channel.members.size <= 0) {
				newChList = global.tempCh.filter(x => x.id !== ch.id);
				await channel.delete('No one in room anymore')
					.then(console.log(`Temp room ${ch.name} deleted.`))
					.catch(console.error);
			}
		}
	}
	global.tempCh = newChList;
});

// Bot logs into Discord
client.login(TOKEN);