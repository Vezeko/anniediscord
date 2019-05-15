/*
 *This is only a template, easy to pull from when making a new command
 *
 */

const Discord = require("discord.js");
const botconfig = require(`../botconfig.json`);
const palette = require(`../colorset.json`);

module.exports.run = async(bot, command,message,args)=>{

  function fileAliasesCheck(file) {
    const src = require(`./${file}`)
    return src.help.name;
  };

}//end of module.exports.run

module.exports.help = {
        name:"TemplateComand",
        aliases:[]
}