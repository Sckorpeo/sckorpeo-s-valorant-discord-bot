const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		const user = interaction.member.nickname;
		console.log({ user });
		await interaction.reply('Pong!');
	},
};