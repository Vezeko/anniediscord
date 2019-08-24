module.exports = (bot, oldUser, newUser) => {

	function getRoles(r) {
		return bot.guilds.get(`459891664182312980`).roles.find(n => n.name === r)
	}
  
	let ticket = getRoles(`Nickname Changer`)
	let muted = getRoles(`muted`)
	let eventParticipant = getRoles(`Event Participant`)

	if( newUser.roles.has(ticket.id) && (oldUser.nickname !== newUser.nickname) ) {
		console.log(`${newUser.nickname} used the nickname changer ticket.`)
		newUser.removeRole(ticket)
	}
	if (newUser.roles.has(muted.id)){
		if(newUser.roles.has(eventParticipant.id)){
			newUser.removeRole(eventParticipant.id)
			console.log(`${newUser.nickname} was given the ${muted.name} role so their event participant role has been taken away.`)
		}
	}
  
}