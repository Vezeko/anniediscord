const Discord = require('discord.js');

module.exports.run = async (...ArrayStacks) => {


	let sayEmbed = new Discord.RichEmbed()

	let bicon = bot.user.displayAvatarURL;
	let text = args.join(" ");
	let textEmbed = args.slice(1).join(" ");


	if (message.member.roles.find(r => (r.name === 'Tomato Fox'))) {

		if (args[0] === 'embed') {

			sayEmbed.setColor(palette.halloween)
			sayEmbed.setDescription(textEmbed)

			return message.delete().then((msg) =>
				msg.channel.send(sayEmbed));

		}
		message.delete();
		return message.channel.send(text);

	}


	sayEmbed.setColor('#ffac30')
	sayEmbed.setDescription(`You don't have authorization to use this command.`)
	sayEmbed.setFooter(`Anime Artist United | Say Message`, bicon)

	return message.channel.send(sayEmbed);

}
module.exports.help = {
	name: "say",
	aliases: [],
	description: `Talk through bot`,
	usage: `>say <message>`,
	group: "Admin",
	public: true,
}