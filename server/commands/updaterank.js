const { SlashCommandBuilder } = require('@discordjs/builders');
const scrapeRank = require('../helpers/scraperank');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('updaterank')
		.setDescription('Get your current Valorant rank and update your role.')
		.addStringOption(option =>
			option.setName('username')
				.setDescription('Enter your username in Valorant.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('tag')
				.setDescription('Enter your tag in Valorant.')
				.setRequired(true)),
	async execute(interaction) {
		// Get the values from the slash command options.
		const username = interaction.options.getString('username'),
			tag = interaction.options.getString('tag');
		// Get the user role manager.
		const user = interaction.member;

		// Defer the interaction because the code takes longer than 3 seconds to complete.
		await interaction.deferReply();

		if (!user.nickname) {
			await user.setNickname(`${username}#${tag}`);
		}
		// Web scrape the player information from tracker.gg.
		const rank = await scrapeRank(username, tag);

		if (rank) {
			// Get the list of roles available in the guild.
			const roles = await interaction.guild.roles.fetch();
			// Make the collection into an array so that we can filter out admin roles.
			// Safe guards members getting the bot to make them admim roles somehow.
			let filterRoles = [...roles].filter(([k, v]) => v.name !== 'Founder');
			filterRoles = filterRoles.filter(x => x[1].name !== 'Mod');
			filterRoles = filterRoles.filter(x => x[1].name !== 'Blinx Bot');
			// Checks their current Valorant rank against the roles and sets their role as the current rank.
			filterRoles.forEach(role => {
				if (rank === role[1].name) {
					user.roles.add(role[1].id);
				}
			});
			// Respond to user with their current role.
			await interaction.editReply(`Your current rank is ${rank}`);
		}
		else {
			await interaction.editReply('Couldn\'t get your rank. If your tracker.gg Valorant profile is private, make it unprivate and try again.');
		}
	},
};