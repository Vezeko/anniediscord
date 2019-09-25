module.exports = (bot, oldUser, newUser) => {
  
    //  Clan Stuff
    const clan_manageUsernames = async() => {

        const sql = require('sqlite');
        const sqlpath = '.data/database.sqlite';
        sql.open(sqlpath);

        let regex = RegExp(/\s*『[^『』]*』/g)
        const guildMemberData = async(id) => bot.guilds.get('459891664182312980').members.find(n => n.id === id)
        const botHasNicknamePerms = async() => {
            return bot.guilds.get('459891664182312980').members.get(bot.user.id).hasPermission("MANAGE_NICKNAMES") &&
            bot.guilds.get('459891664182312980').members.get(bot.user.id).hasPermission("CHANGE_NICKNAME");
          }

        if (newUser.username !== oldUser.username) {
            let guildMember = await guildMemberData(newUser.id)
            if (regex.test(newUser.username) && !guildMember.nickname) {

                let tag = ''
                let new_nickname = newUser.username.replace(regex, '')

                // Section for appending Clan Tag
                let clan = await sql.get(`SELECT clanId FROM clanmember WHERE userID = ? AND status = 'joined'`, newUser.id)
                if (clan) {
                    let clandata = await sql.get(`SELECT * FROM clandata WHERE id = ?`, clan.clanId) 
                    tag = ` 『${clandata.tag}』`
                }
                new_nickname = `${new_nickname.slice(0, 32-tag.length)}${tag}`
                if (await botHasNicknamePerms()) {
                    try { await guildMember.setNickname(new_nickname.slice(0, 32)) }
                    catch (e) { console.log(`Failed to modify nickname: ${newUser.username}`) }
                }
            }
        }

    }

    let enable = true;
    if (enable) clan_manageUsernames()
  
}
