const puppeteer = require('puppeteer');

async function scrapeRank(username, tag) {

	const url = `https://tracker.gg/valorant/profile/riot/${username}%23${tag}/overview?playlist=competitive`;
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setDefaultNavigationTimeout(0);
	await page.goto(url);

	const [el] = await page.$x('//*[@id="app"]/div[2]/div[2]/div/main/div[2]/div[3]/div[3]/div[2]/div[2]/div[2]/div/div[1]/div[1]/span[2]');
	const txt = await el?.getProperty('textContent');
	let rank;
	if (txt) {
		const rawTxt = await txt.jsonValue();
		rank = rawTxt.split(' ')[0];

		console.log({ rawTxt, rank });
	}
	else {
		rank = null;
	}

	browser.close();

	return rank;
}

module.exports = scrapeRank;

// scrapeRank('Money', 'BREAD');
// scrapeRank('GoalZ', '6351');