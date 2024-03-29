const Discord = require(`discord.js`)
var content = require(`../../utils/challengelist.json`)

class artChallenge {
	constructor(Stacks) {
		this.stacks = Stacks
	}

	async execute() {
		let message = this.stacks.message
		let timer = 60

		const battlechoice = new Discord.RichEmbed()
			.setColor(this.stacks.palette.halloween)
		battlechoice.setDescription(`List of art challenges, please choose one.\n` +
        `you can view their sub-category by typing >sub{category name}\n\n` +
        `${timer} seconds to type the category, you wish the theme to be.\n\n` +
        `-Monster\n\n` +
        `-Challenges\n\n` +
        `-Enviroment\n\n` +
        `-Themes\n\n` +
        `-Personification\n\n` +
        `-Anime\n\n` +
        `-Emotion/Mood\n\n` +
        `-Time Period`)

		message.channel.send(battlechoice)
		const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: timer*1000 })
		collector.on(`collect`, message => {
			let argsUpperCased = message.content.toUpperCase()
			function getRndInteger(min, max) {
				return Math.floor(Math.random() * (max - min)) + min
			}

			let randomNum = 0
			let category
			if (`MONSTER`.includes(argsUpperCased)) {
				category = content.MONSTER
				randomNum = category.length
			} else if (`CHALLENGES`.includes(argsUpperCased)) {
				category = content.CHALLENGES
				randomNum = category.length
			} else if (`ENVIRONMENT`.includes(argsUpperCased)) {
				category = content.ENVIRONMENT
				randomNum = category.length
			} else if (`THEMES`.includes(argsUpperCased)) {
				category = content.THEMES
				randomNum = category.length
			} else if (`PERSONIFICATION`.includes(argsUpperCased)) {
				category = content.PERSONIFICATION
				randomNum = category.length
			} else if (`ANIME`.includes(argsUpperCased)) {
				category = content.ANIME
				randomNum = category.length
			} else if (`EMOTION/MOOD`.includes(argsUpperCased)) {
				category = content.EMOTION_MOOD
				randomNum = category.length
			} else if (`TIME PERIOD`.includes(argsUpperCased)) {
				category = content.TIME_PERIOD
				randomNum = category.length
			}

			let subItem = ``

			let y = getRndInteger(1, randomNum)
			subItem = category[y + 1].sub

			message.channel.send(`The chosen theme for this duel is...***${subItem}!***`)
		})
	}
}

module.exports.help = {
	start: artChallenge,
	name:`artch`,
	aliases: [`art.ch`],
	description: `Selects a random theme for an art duel`,
	usage: `art.ch`,
	group: `General`,
	public: false,
	required_usermetadata: false,
	multi_user: false
}