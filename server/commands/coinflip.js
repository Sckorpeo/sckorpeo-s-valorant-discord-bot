const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('coinflip')
		.setDescription('Flip a coin.'),
	async execute(interaction) {
		let heads = 0,
			tails = 0;

		for (let i = 0; i < 100; i++) {
			Math.floor(Math.random() * 2) ? heads++ : tails++;
		}

		if (heads >= tails) {
			await interaction.reply('Heads');
		}
		else {
			await interaction.reply('Tails');
		}
	},
};