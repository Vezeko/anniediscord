module.exports = (bot, oldUser, newUser) => {

  function getRoles(r) {
      return bot.guilds.get('459891664182312980').roles.find(n => n.name === r)
  }
  
  let ticket = getRoles('Nickname Changer');
  if( newUser.roles && newUser.roles.has(ticket.id) && (oldUser.nickname !== newUser.nickname) ) {
    console.log(`${newUser.nickname} used a nickname changer ticket.`)
    newUser.removeRole(ticket);
  }


  //  Clan Stuff
  const clan_manageNicknames = async() => {
    
    const sql = require('sqlite');
    const sqlpath = '.data/database.sqlite';
    sql.open(sqlpath);
    const botHasNicknamePerms = async() => {
      return bot.guilds.get('459891664182312980').members.get(bot.user.id).hasPermission("MANAGE_NICKNAMES") &&
      bot.guilds.get('459891664182312980').members.get(bot.user.id).hasPermission("CHANGE_NICKNAME");
    }

    if (newUser.nickname !== oldUser.nickname) {
      let tag = ''
      let new_nickname
      newUser.nickname
        ? new_nickname = newUser.nickname.replace(RegExp(/\s*『[^『』]*』/g), '')
        : new_nickname = newUser.user.username.replace(RegExp(/\s*『[^『』]*』/g), '')

      // Section for appending Clan Tag
      let clan = await sql.get(`SELECT clanId FROM clanmember WHERE userID = ? AND status = 'joined'`, newUser.user.id)
      if (clan) {
        let clandata = await sql.get(`SELECT * FROM clandata WHERE id = ?`, clan.clanId) 
        tag = ` 『${clandata.tag}』`
      }
      new_nickname = `${new_nickname.slice(0, 32-tag.length)}${tag}`
      if (await botHasNicknamePerms()) {
        try { await newUser.setNickname(new_nickname.slice(0, 32)) }
        catch (e) { console.log(`Failed to modify nickname: ${newUser.user.username}`) }
      }
    }

  }

  let enable = true;
  if (enable) clan_manageNicknames();


}