const { SlashCommandBuilder } = require('@discordjs/builders');
const shuffle = require('../helpers/shuffle');
const Discord = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('maketeams')
		.setDescription('Make teams with the people in your voice chat')
		.setDefaultPermission(false),
	async execute(interaction) {
		const voiceChannel = interaction.member.voice.channel,
			guild = interaction.guild,
			usersToBeMoved = [];

		if (!voiceChannel) {
			return await interaction.reply('You must be in voice chat to use this command.');
		}
		else if (voiceChannel.members.size === 1) {
			return await interaction.reply('You must have more than one person in voice chat to use this command.');
		}

		// Populate array for each person in the current voice chat.
		voiceChannel.members.each(collection => usersToBeMoved
			.push({
				username: collection.user.username,
				userId: collection.user.id,
			}));


		// Randomize the array.
		shuffle(usersToBeMoved);

		// Create team variables
		let teamOne = `**Team ${usersToBeMoved[0].username}:** `,
			teamTwo = !usersToBeMoved[usersToBeMoved.length / 2] ? '**Team Two:** ' : `**Team ${usersToBeMoved[usersToBeMoved.length / 2].username}:** `;
		const teamOneLed = usersToBeMoved[0],
			teamTwoLed = usersToBeMoved[usersToBeMoved.length / 2];

		// Create an embedded with the proposed teams.
		for (let i = 0; i < usersToBeMoved.length; i++) {
			if (i < usersToBeMoved.length / 2) {
				teamOne = teamOne + usersToBeMoved[i].username;
			}
			else {
				teamTwo = teamTwo + usersToBeMoved[i].username;
			}
		}

		// Create message collector to prompt teams.
		const filter = m => m.author == interaction.user;
		const collector = interaction.channel.createMessageCollector({ filter, time: 15_000, max: 1 });

		collector.on('collect', m => console.log(`Collected ${m.content}`));
		collector.on('end', collected => console.log(collected));

		collector.on('end', async (collected, reason) => {
			if (reason === 'time') {
				await messageEmbed.delete();
				await interaction.channel.send('Request timed out.');
			}
			else {
				const messageId = collected.keys().next().value;
				switch (collected.get(messageId).content) {
					case 'yes':
						await messageEmbed.delete();
						// Create voice channel.
						await guild.channels.create(`Team ${teamOneLed.username}`, {
							type: 'GUILD_VOICE',
							parent: '941793257099239444',
						})
							// When new voice channel created, push temp channel info to global array.
							.then(async newChannel => {
								global.tempCh.push({ id: newChannel.id, guild: newChannel.guild, name: newChannel.name });
								console.log(global.tempCh);
								// Move users in current voice channel to the newly created voice channel.
								for (let i = 0; i < usersToBeMoved.length; i++) {
									if (i < usersToBeMoved.length / 2) {
										const mem = await guild.members.fetch(usersToBeMoved[i].userId);
										await mem.voice.setChannel(newChannel.id);
									}
								}
							});
						// Create voice channel.
						await guild.channels.create(`Team ${teamTwoLed.username}`, {
							type: 'GUILD_VOICE',
							parent: '941793257099239444',
						})
							// When new voice channel created, push temp channel info to global array.
							.then(async newChannel => {
								global.tempCh.push({ id: newChannel.id, guild: newChannel.guild, name: newChannel.name });
								console.log(global.tempCh);
								// Move users in current voice channel to the newly created voice channel.
								for (let i = usersToBeMoved.length / 2; i < usersToBeMoved.length; i++) {
									const mem = await guild.members.fetch(usersToBeMoved[i].userId);
									await mem.voice.setChannel(newChannel.id);
								}
							});


						await interaction.channel.send({ embeds: [embed] });
						break;
					case 'no':
						await messageEmbed.delete();
						await interaction.channel.send('Use command again to randomize teams.');
						break;
					default:
						await messageEmbed.delete();
						await interaction.channel.send('Not sure what you said.');
						break;
				}
			}
		});
		const clientUrl = await interaction.client.user.avatarURL(),
			embed = new Discord.MessageEmbed()
				.setColor('#e42643')
				.setTitle('Are these teams good?')
				.setDescription(`**Reply with (yes/no)**\n\n${teamOne}\n${teamTwo}`)
				.setAuthor({ name: interaction.client.user.username, iconURL: `${clientUrl}` });
		const messageEmbed = await interaction.channel.send({ embeds: [embed] });
		console.log(`${clientUrl}`);
	},
};