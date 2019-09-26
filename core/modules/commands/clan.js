/** Notes:
 *  - refactor userFind regex
 *  - Locked DM
 *  - log() into Embed()
 */

class clan_wrapper {
    constructor(Stacks) {
        this.stacks     = Stacks;
    }
    async execute() {
        const Discord = require('discord.js');                      //  Temporary
        const env = require('../../../.data/environment.json');        //  Temporary
        const sql = require('sqlite');
        sql.open('.data/database.sqlite');

        let authorname  = this.stacks.meta.author.user.username
        let bot         = this.stacks.bot;
        let message     = this.stacks.message;
        let args        = this.stacks.args;
        let palette     = this.stacks.palette;
        let emoji       = this.stacks.emoji;
        let pause       = this.stacks.pause;

        const commandname = exports.help.name;
        const prefix = env.prefix;                                  //  Temporary
        const delay = 200;
        const timeout1 = 60000;
        
        /***************************************************************************************************
         * GLOBAL VARIABLE INITIALIZATION
         ***************************************************************************************************/
        /*  Global General-Purpose Data
         *  Put data that will be used within any sub-command 
         */

        const authorfilter = m => m.author.id === message.author.id;

        const meta = {
            create: {
                price: 20000,
                level: -1
            },
            change: {
                name: {
                    price: 20000,
                    level: -1
                },
                tag: {
                    price: 10000,
                    level: -1
                },
                color: {
                    price: 200,
                    level: -1
                },
                motto: {
                    price: 100,
                    level: -1
                }

            }
        }

        //  Initialize special globals
        let user, target, userclan, msg, cmdpath, accessmap

        /***************************************************************************************************
         * GLOBAL CLASS / FUNCTION INITIALIZATION
         ***************************************************************************************************/
        class User {
            constructor(search) {
                this._input = search;
                this._exists = false;
            }

            get exists()        { return this._exists}
            get input()         { return this._input }
            //  PUBLIC OUTPUT: User Class Data
            get client()        { return this.$client }
            get discriminator() { return this.$client.user.discriminator }
            get name()          { return this.$client.user.username }
            get pfp()           { return this.$client.user.displayAvatarURL }
            get nickname()      { return this.$client.nickname }
            get id()            { return this.$client.id }
            get roles()         { return this.$client.roledata }
            //  PUBLIC OUTPUT: Server Database Data
            get level()         { return this.$userdata.level }
            get clanid()        { return this.$userdata.clanId }
            get artcoins()      { return this.$userinventories.artcoins }
            get isLeader()      { return this.$userstatus.clanleader === 'True' ? true : false }
            get isMember()      { return this.$userstatus.clanmember === 'True' ? true : false }

            get applications()  { return this.$applications }
            get invitations()   { return this.$invitations }
            get hasApplied()    { return this.$applications.length > 0 ? true : false }
            get beenInvited()   { return this.$invitations.length > 0 ? true : false }


            //  OBTAIN: Property Container Functions
            async _get_user() { this.$client = await this._findUser() }
            async _get_userData() { this.$userdata = await sql.get(`SELECT * FROM userdata WHERE userId = ?`, this.id) }
            async _get_inventory() { this.$userinventories = await sql.get(`SELECT * FROM userinventories WHERE userId = ?`, this.id) }
            async _get_userCheck() { this.$userstatus = await sql.get(`SELECT * FROM usercheck WHERE userId = ?`, this.id) }
            async _get_invitations() { this.$invitations = await sql.all(`SELECT ALL clanId FROM clanmember WHERE status = 'invited' AND userId = ?`, this.id)}
            async _get_applications() { this.$applications = await sql.all(`SELECT ALL clanId FROM clanmember WHERE status = 'applied'AND userId = ?`, this.id)}
            async _get_userRoles() {
                let allroles = await this.$client.roles.array();
                this.$client.roledata = {}; 
                allroles.forEach(e => this.$client.roledata[e.id] = e.name); 
            }


            //  PRIVATE UTILITY METHODS
            async _isValidUser() { return await this._findUser() ? true : false }
            async _findUser() {
                const userPattern = /^(?:<@!?)?([0-9]+)>?$/;
                if (userPattern.test(this._input)) this._input = this._input.replace(userPattern, '$1');
                let members = message.guild.members;
                const filter = member =>
                    member.user.id === this._input ||
                    member.displayName.toLowerCase() === this._input.toLowerCase() ||
                    member.user.username.toLowerCase() === this._input.toLowerCase() ||
                    member.user.tag.toLowerCase() === this._input.toLowerCase();
                return members.filter(filter).first();
            }
            async _botHasNicknamePerms() {
                let botclient = message.guild.members.get(bot.user.id)
                return botclient.hasPermission("MANAGE_NICKNAMES") && botclient.hasPermission("CHANGE_NICKNAME");
            }
 


            // PUBLIC METHODS
            async setNickname(newnickname) {
                await this._get_user();
                if (await this._botHasNicknamePerms()) {
                    await this.client.setNickname(newnickname);
                    await this._get_user();
                } else throw error;
            }
            async init() {
                if (await this._isValidUser()) {

                    this._exists = true;
                    await this._get_user();
                    await this._get_userRoles();
                    await this._get_userData();
                    await this._get_inventory();
                    await this._get_userCheck();
                    await this._get_applications();
                    await this._get_invitations();

                } else this._exists = false
                return this
            }      
        }

        class Clan {
            constructor(search = null) {
                this._input = search;
                this._exists = false;
                if (!this._input) {
                    this.$data = {
                        id: null,
                        name: null,
                        tag: null,
                        motto: null,
                        color: null,
                        leader: null,
                        maxmembers: null,
                        foundingdate: null
                    };
                    this.$applications = [];
                    this.$invitations = [];
                }
            }

            //  PUBLIC OUTPUT
            get input()         { return this._input }
            get exists()        { return this._exists }

            get data()          { return this.$data }
            get id()            { return this.$data.id }
            get name()          { return this.$data.name }
            get tag()           { return this.$data.tag }
            get motto()         { return this.$data.motto }
            get color()         { return this.$data.color }
            get leaderid()      { return this.$data.leader }
            get maxmembers()    { return this.$data.maxmembers }
            get foundingdate()  { return this.$data.foundingdate }
            get hoist()         { return this.$data.hoist }
            get isHoist()       { return this.$data.hoist === 'True' ? true : false}

            get members()       { return this.$members }
            get applications()  { return this.$applications }
            get invitations()   { return this.$invitations }
            get recievedapps()  { return this.$applications.length > 0 ? true : false }
            get sentinvites()   { return this.$invitations.length > 0 ? true : false }

            //  OBTAIN: Property Container Functions
            async _get_clanData() { this.$data = await this._findClan() }
            async _get_invitations() { this.$invitations = await sql.all(`SELECT ALL userId FROM clanmember WHERE status = 'invited' AND clanId = ?`, this.id) }
            async _get_applications() { this.$applications = await sql.all(`SELECT ALL userId FROM clanmember WHERE status = 'applied' AND clanId = ?`, this.id) }

            //  PRIVATE UTILITY METHODS
            async _isValidClan() { return await this._findClan() ? true : false }
            async _findClan(search = this._input) {
                let cmd = `
                    SELECT * 
                    FROM clandata 
                    WHERE replace(lower(name), ' ', '') = ? 
                    OR replace(lower(tag), ' ', '') = ? 
                    OR id = ?`;
                return await sql.get(cmd, [
                    search.toLowerCase().replace(' ',''), 
                    search.toLowerCase().replace(' ',''),
                    search
                ]);
            }
            async _nameExists() {
                return (await sql.get(`
                    SELECT * 
                    FROM clandata 
                    WHERE replace(lower(name), ' ', '') = ? 
                    AND id <> ?`, 
                    [this.name.toLowerCase().replace(' ', ''), this.id])) ? true : false
            }
            async _tagExists() {
                return (await sql.get(`
                    SELECT * 
                    FROM clandata 
                    WHERE replace(lower(tag), ' ', '') = ? 
                    AND id <> ?`, 
                    [this.tag.toLowerCase().replace(' ', ''), this.id])) ? true : false
            }
            async _addRoleTo(member) {
                await member.client.addRole(this.id) 
            }
            async _removeRoleFrom(member) {
                await member.client.removeRole(this.id)
            }
            async _updateAllTags() {
                let memberlist = await sql.all(`SELECT userId FROM clanmember WHERE clanId = ? AND status = 'joined'`, this.id)
                memberlist.forEach(async e => {
                    let tag = ''
                    let new_nickname
                    let member = await new User(e.userId).init();
                    //let member = message.guild.members.get(e.userId)
                    member.nickname
                        ? new_nickname = member.nickname.replace(RegExp(/\s*『[^『』]*』/g), '')
                        : new_nickname = member.name.replace(RegExp(/\s*『[^『』]*』/g), '')
                    if (this.tag) tag = ` 『${this.tag}』`
                    new_nickname = `${new_nickname.slice(0, 32-tag.length)}${tag}`
                    try { await member.setNickname(new_nickname.slice(0, 32)) }
                    catch (e) { console.log(`Failed to modify clan tag: ${member.name} | ${member.id}`) }
                    return this
                })
            }
            async _removeTagFrom(member) {
                let new_nickname
                member.nickname
                    ? new_nickname = member.nickname.replace(RegExp(/『[^『』]*』\s*/g), '')
                    : new_nickname = member.name.replace(RegExp(/『[^『』]*』\s*/g), '')
                try { await member.setNickname(new_nickname.slice(0, 32)) }
                catch (e) { console.log(`Failed to remove clan tag: ${member.name} | ${member.id}`) }
                return this
            }


            //  SET CLAN DATA METHODS
            setName(name) {
                this.$data.name = name.slice(0,100)
                return this
            }
            setTag(tag) {
                this.$data.tag = tag.replace(/『|』/g,'').slice(0,10);
                return this
            }
            setColor(hex) {
                let color = hex.replace(/^#/,'')
                if (RegExp(/^[0-9A-F]{6}$/i).test(color)) this.$data.color = color.toUpperCase()
                else if (RegExp(/^[A-F0-9]{3}$/i).test(color)) {
                    let HEX6 = []
                    color.split('').forEach(hex => HEX6.push(hex, hex))
                    this.$data.color = HEX6.join('').toUpperCase()
                }
                return this
            }
            setMotto(motto) {
                this.$data.motto = motto
                return this
            }
            setHoist(input) {
                if (input === 'True' || input === 'False')
                this.$data.hoist = input
                return this
            }

            //  COMMAND METHODS
            async clanList() { 
                return await sql.all(`SELECT * FROM clandata`) 
            }
            async updateMember(member, type, status) {
                const userJoined = async() => {
                    await sql.run(`DELETE FROM clanmember WHERE userId = ?`, member.id)
                    await sql.run(`INSERT INTO clanmember (clanId, userId, type, status, date) VALUES (?, ?, ?, 'joined', ?)`,
                        [this.id, member.id, type.toLowerCase(), Date.now()])
                    await sql.run(`UPDATE userdata SET clanId = ? WHERE userId = ?`, [this.id, member.id])
                    if (type.toLowerCase() === 'leader') 
                        await sql.run(`UPDATE usercheck SET clanmember = 'True', clanleader = 'True' WHERE userId = ?`, member.id)
                    else if (type.toLowerCase() === 'member')
                        await sql.run(`UPDATE usercheck SET clanmember = 'True', clanleader = 'False' WHERE userId = ?`, member.id)
                    await this._addRoleTo(member)
                    await this._updateAllTags()
                }
                const userInvited = async() => {
                    let applied = (await sql.get(`SELECT * FROM clanmember WHERE clanId = ? AND userId = ? AND status = 'applied'`,
                        [this.id, member.id])) ? true : false
                    if (applied) await userJoined()
                    else await sql.run(`INSERT INTO clanmember (clanId, userId, type, status, date) VALUES (?, ?, ?, 'invited', ?)`,
                            [this.id, member.id, type.toLowerCase(), Date.now()])
                }
                const userApplied = async() => {
                    let invited = (await sql.get(`SELECT * FROM clanmember WHERE clanId = ? AND userId = ? AND status = 'invited'`,
                        [this.id, member.id])) ? true : false
                    if (invited) await userJoined()
                    else await sql.run(`INSERT INTO clanmember (clanId, userId, type, status, date) VALUES (?, ?, ?, 'applied', ?)`,
                            [this.id, member.id, type.toLowerCase(), Date.now()])
                }
                const userLeave = async() => {
                    await sql.run(`DELETE FROM clanmember WHERE clanId = ? AND userId = ?`,[this.id, member.id])
                    await sql.run(`UPDATE userdata SET clanId = ? WHERE userId = ?`, [null, member.id])
                    await sql.run(`UPDATE usercheck SET clanmember = 'False', clanleader = 'False', clancooldown = ? WHERE userId = ?`, [Date.now(), member.id])
                    await this._removeRoleFrom(member)
                    await this._removeTagFrom(member)
                }
                const userRemove = async() => {
                    await sql.run(`DELETE FROM clanmember WHERE clanId = ? AND userId = ?`,[this.id, member.id])
                    await sql.run(`UPDATE userdata SET clanId = ? WHERE userId = ?`, [null, member.id])
                    await sql.run(`UPDATE usercheck SET clanmember = 'False', clanleader = 'False' WHERE userId = ?`, member.id)
                    await this._removeRoleFrom(member)
                    await this._removeTagFrom(member)
                }

                let typemap = ['leader','member']
                let statusmap = {
                    joined  : userJoined,
                    invited : userInvited,
                    applied : userApplied,
                    leave   : userLeave,
                    remove  : userRemove,
                }

                if (typemap.includes(type.toLowerCase()) && statusmap.hasOwnProperty(status.toLowerCase()))
                return await statusmap[status]()
            }
            async updateData() {
                this._exists = false;
                let description = [];
                msg .setColor(palette.darkmatte)
                    .setFooter(`Canceled.`)
                if (await this._nameExists()) { description.push(`• Clan name "**\`${this.name}\`**" already exist.`); this._exists = true; }
                if (await this._tagExists()) { description.push(`• Clan tag "**\`${this.tag}\`**" already exists.`); this._exists = true; }
                if (this._exists) msg.setDescription(description.join(`\n`)).send()
                else {
                    await sql.run(`UPDATE clandata SET name = ?, tag = ?, motto = ?, color = ?, leader = ?, maxmembers = ?, hoist = ? WHERE id = ?`,
                        [this.name, this.tag, this.motto, this.color, this.leaderid, this.maxmembers, this.hoist, this.id])
                    this._input = this.id
                    await this.init()
                    let role = await message.guild.roles.get(this.id)
                    await role.setName(this.name)
                    await role.setColor(this.color)
                    await role.setHoist(this.isHoist)
                    await this._updateAllTags()
                }
            }
            async create() {
                this._exists = true;
                this.$data.id = 'Pending'
                let description = [];
                msg .setColor(palette.darkmatte)
                    .setFooter(`Canceled.`)

                if (await this._nameExists()) { description.push(`• Clan name "**\`${this.name}\`**" already exist.`); this._exists = false; }
                if (await this._tagExists()) { description.push(`• Clan tag "**\`${this.tag}\`**" already exists.`); this._exists = false; }
                if (!this._exists) msg.setDescription(description.join(`\n`)).send()
                else {
                    let role = await (message.guild.createRole({
                        name: this.$data.name,
                        position: message.guild.roles.find(x => x.id === '598256155235582047').position - 1,
                        permissions: 0x00}, `New Clan Role!`));
                    this.$data.id = role.id;
                    await sql.run(`INSERT INTO clandata (id, name, tag, motto, color, leader, maxmembers, foundingdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [this.id, this.name, this.tag, this.motto, this.color, user.id, 5, Date.now()])
                    await this.updateMember(user, 'leader', 'joined')
                    this._input = this.id
                    await this.init()
                }
            }
            async disband() {
                let memberlist = await sql.all(`SELECT userId FROM clanmember WHERE clanId = ? AND status = 'joined'`, this.id)
                memberlist.forEach(async e => { 
                    let target = await new User(e.userId).init();
                    await this.updateMember(target, 'member', 'remove') 
                })
                await sql.run(`DELETE FROM clandata WHERE id = ?`, this.id)
                await sql.run(`DELETE FROM clanmember WHERE clanId = ?`, this.id)
                let role = message.guild.roles.get(this.id)
                if (role) await role.delete(`Clan '${this.name}' disbanded.`) 
                this._input = this.id
                await this.init()
            }


            //  PUBLIC METHODS
            async init() {
                if (this._input && await this._isValidClan()) {
                    
                    this._exists = true;
                    await this._get_clanData();
                    await this._get_invitations();
                    await this._get_applications();

                } else this._exists = false;
                return this
            }

        }

        class Metadata {
            constructor(name) {
                this.name = name.toLowerCase();
                this.alias = [];
                this.info = "Command Information not set.";
                (this.name === 'help' || this.name === 'divider')
                    ? this.commandlist = [] 
                    : this.commandlist = [help, divider];
                this.access = {
                    clanstatus: "public",
                    memberapps: "public",
                    clanapps: "public",
                    roles: "developer",
                    level: -1
                };
                this.input = { 
                    prompt: new Embed()
                        .setColor(msg.promptcolor)
                        .setDescription(`No prompt message set.`),
                    require: false
                };
                this.arguments = [];
            }
            
            //  PRIVATE UTILITY METHOD
            _isString(input) { return typeof input === 'string' || input instanceof String }
            _isArray(input) { return input && typeof input === 'object' && input.constructor === Array  }
            _isObject(input) { return input && typeof input === 'object' && input.constructor === Object }

            //  PUBLIC SET DATA
            setAlias(input) {
                if (this._isArray(input) && input.every(this._isString)) this.alias = input;
                if (this._isString(input)) this.alias.push(input);
                return this
            }
            setInfo(input) {
                if (this._isString(input)) this.info = input;
                return this
            }
            setCommandList(input) {
                if (this._isArray(input) && input.every(this._isObject)) this.commandlist = this.commandlist.concat(input);
                if (this._isObject(input)) this.commandlist.push(input);
                return this
            }
            setAccess(input) {
                if (this._isObject(input)) {
                    for (let group in input) {
                        if (this.access[group] && this.access.hasOwnProperty(group) && typeof this.access[group] === typeof input[group])
                        this.access[group] = input[group];
                    }
                }
                return this
            }
            setInput(input) {
                for (let group in input) {
                    if (this.input.hasOwnProperty(group) && typeof this.input[group] === typeof input[group])
                    this.input[group] = input[group];
                    if (group === 'prompt' && input[group].description && input[group].description.includes('[SUBCOMMANDLIST]'))
                    this.input[group].description = input[group].description.replace(`[SUBCOMMANDLIST]`, this.outputCommandList())
                }
                return this
            }
            setArguments(input) {
                let set = []
                if (this._isArray(input)) {
                    input.forEach(e => {
                        if (this._isObject(e)) {
                            let temp = {}
                            if (e.hasOwnProperty('msg') && this._isString(e.msg)) {
                                e.hasOwnProperty('arg') && this._isString(e.arg)
                                    ? temp.arg = e.arg
                                    : temp.arg = e.msg
                                temp.msg = e.msg;
                                e.hasOwnProperty('cond') && this._isString(e.cond)
                                    ? temp.cond = e.cond
                                    : temp.cond = null
                                set.push(temp)
                            } 
                        } 
                        else if (this._isString(e)) set.push({ arg: e, msg: e, cond: null})
                        else set.push({ arg: `???`, msg: 'Error: Invalid Argument Format', cond: null})
                    })
                } 
                else if (this._isObject(input)) {
                    let temp = {}
                    if (input.hasOwnProperty('msg') && this._isString(input.msg)) {
                        input.hasOwnProperty('arg') && this._isString(input.arg)
                            ? temp.arg = input.arg
                            : temp.arg = input.msg
                        temp.msg = input.msg;
                        input.hasOwnProperty('cond') && this._isString(input.cond)
                            ? temp.cond = input.cond
                            : temp.cond = null
                        set.push(temp)
                    } 
                }
                else if (this._isString(input)) set.push({ arg: input, msg: input, cond: null})
                else set.push({ arg: `???`, msg: 'Error: Invalid Argument Format', cond: null})
                this.arguments = set;
                return this
            }

            //  PUBLIC UTILITY METHODS
            outputCommandList() {
                let longest = 0
                let outputlist = []
                let sublist = []
                let list = this.commandlist
                for (let e of list) { 
                    if (new Subcommand(this, e.metadata.name).init().accessGranted() && e.metadata.name.length > longest) 
                    longest = e.metadata.name.length 
                }
                for (let e of list) {
                    if (e.metadata.name === 'divider') {
                        if (sublist.length > 0) {
                            outputlist.push(msg.codeBlock(sublist.join(`\n`),`HTTP`)); sublist = []
                        }
                    } else {
                        let tab = ''
                        for (let i = 0; i < longest - e.metadata.name.length; i++) {tab += ' '}
                        if (new Subcommand(this, e.metadata.name).init().accessGranted())
                        sublist.push(`• ${e.metadata.name} ${tab}: ${e.metadata.info}`)
                    }
                }
                return `**${outputlist.join('')}**`
            }
        }
        
        class Subcommand {
            constructor (metadata, search = args[0]) {
                this._input = search;
                this._exists = false;
                this.$invoker = metadata;
            }

            //  PUBLIC OUTPUT
            get input()     { return this._input }
            get exists()    { return this._exists }
            
            //  CURRENT SUBCOMMAND
            get metadata()      { return this.$subcommand.metadata }
            get name()          { return this.metadata.name }
            get alias()         { return this.metadata.alias}
            get info()          { return this.metadata.info }
            get commandlist()   { return this.metadata.commandlist }
            get arguments()     { return this.metadata.arguments }
            get input()         { return this.metadata.input }
            get access()        { return this.metadata.access }

            //  INVOKING COMMAND
            get i_metadata()    { return this.$invoker }
            get i_name()        { return this.i_metadata.name }
            get i_alias()       { return this.i_metadata.alias }
            get i_info()        { return this.i_metadata.info }
            get i_commandlist() { return this.i_metadata.commandlist }
            get i_arguments()   { return this.i_metadata.arguments }
            get i_input()       { return this.i_metadata.input }
            get i_access()      { return this.i_metadata.access }

            //  OBTAIN: Property Container Functions
            _get_subcommand() { this.$subcommand = this._findSubcommand() }

            //  PRIVATE UTILITY METHODS
            _isValidSubCommand() { return this._findSubcommand() ? true : false }
            _normalizeSubcommand() { if (this._input) { this._input = this._input.toLowerCase() } }
            _findSubcommand() {
                let subcommand = null;
                this.i_commandlist.forEach((element) => {
                    if (element.metadata.name === this._input || element.metadata.alias.indexOf(this._input) >= 0) { subcommand = element }
                })
                return subcommand
            }

            //  PRIVATE RESTRICTION METHODS
            _checkClanStatus(value) { return accessmap.clanstatus[value] }
            _checkRoles(value) {
                for (let key in accessmap.roles[value]) { if (user.roles.hasOwnProperty(key)) return true }
                return false
            }
            _checkLevel(value) { return user.level >= value }
            _checkMemberApps(value) { return accessmap.memberapps[value] }
            _checkClanApps(value) { return accessmap.clanapps[value] }
            accessGranted() {
                let check = {
                    "clanstatus" : this._checkClanStatus,
                    "memberapps" : this._checkMemberApps,
                    "clanapps" : this._checkClanApps,
                    "roles" : this._checkRoles,
                    "level" : this._checkLevel
                }
                let lock = [];
                for (let key in this.access) { lock.push(check[key](this.access[key])) }
                return lock.every(e => e === true)
            }


            //  PUBLIC METHODS
            init() {
                this._normalizeSubcommand()
                if (this._isValidSubCommand()) { 

                    this._exists = true;
                    this._get_subcommand();

                } else this._exists = false 
                return this
            }
            async execute() {
                if (!this.accessGranted()) return msg.prompt(`Not Availible.`).send()
                else {
                    args.shift();
                    let current = false;
                    let next = false;
                    let collect = false;
                    if (args[0]) {
                        if (new Subcommand(this.metadata).init().exists) next = true
                        else if (this.arguments.length - args.length <= 0) current = true
                        else await this.input.prompt.send().then(async prompt => {
                            collect = true;
                            for (let e of this.arguments.slice(args.length)) {
                                await pause(delay)
                                msg.collect(`**${e.msg}**`)
                                e.cond ? msg.setFooter(e.cond) : msg.setFooter(msg.cancel)
                                await msg.send().then(async m => {
                                    await message.channel.awaitMessages(authorfilter, { maxMatches: 1, time: timeout1, errors: ['time']})
                                        .then(async collected => {
                                            await pause(delay)
                                            await collected.first().delete();
                                            await m.delete();
                                            args.push(collected.first().content);
                                            current = true;
                                            if (["CANCEL", "EXIT", "QUIT"].includes(collected.first().content.toUpperCase())) {
                                                msg.prompt(msg.canceled).send()
                                                return current = false
                                            }
                                        })
                                        .catch(async () => { await m.delete(); return current = false; });
                                });
                                if (!current) break;
                            }
                        })

                    } else {
                        if (!this.input.require) current = true
                        else await this.input.prompt.send().then(async prompt => {
                            collect = true;
                            if (this.arguments.length === 0) current = true
                            else for (let [i, e] of this.arguments.entries()) {
                                msg.collect(`**${e.msg}**`)
                                e.cond ? msg.setFooter(e.cond) : msg.setFooter(msg.cancel)
                                await pause(delay)
                                await msg.send().then(async m => {
                                    await message.channel.awaitMessages(authorfilter, { maxMatches: 1, time: timeout1, errors: ['time']})
                                    .then(async collected => {
                                        await pause(delay)
                                        await collected.first().delete();
                                        await m.delete();
                                        args.push(collected.first().content);
                                        current = true;
                                        if (["CANCEL", "EXIT", "QUIT"].includes(collected.first().content.toUpperCase())) {
                                            msg.prompt(msg.canceled).send()
                                            return next = current = false 
                                        }
                                        if (i === 0 && (await new Subcommand(this.metadata).init()).exists) { next = true; return current = false; }
                                        else {
                                            let check = args[0].split(" ");
                                            if (i === 0 && (await new Subcommand(this.metadata, check[0]).init()).exists) {
                                                args = [...check]
                                                args = msg.decrypt(args)
                                                next = true
                                                return current = false;
                                            }
                                        }
                                    })
                                    .catch(async () => { m.delete(); return next = current = false; });
                                });
                                if (!current) break;
                            }
                        })

                    }
                    
                    if (this._input.toLowerCase() !== "help") cmdpath.push(this.name)
                    if (collect) await pause(delay)
                    if (current) {
                        this._input.toLowerCase() === 'help' 
                            ? this.$subcommand.execute(this.i_metadata) 
                            : this.$subcommand.execute(this.metadata)
                    }
                    else if (next) {
                        let nextsubcommand = new Subcommand(this.metadata).init()
                        return nextsubcommand.execute(nextsubcommand.metadata)
                    }
                }
            }


        }

        class Embed extends Discord.RichEmbed {
            constructor() { super() }

            get en()    { return ` ` }
            get em()    { return ` ` }
            get div()   { return `${this.en}•${this.en}` }
            get arrow() { return `${this.en}🡆${this.en}` }
            
            get promptcolor()       { return palette.darkmatte }
            get collectorcolor()    { return palette.golden }
            
            get confirm()           { return `Confirm?${this.en}y / n` }
            get completed()         { return `Completed.` }
            get canceled()          { return `Canceled.` }
            get error()             { return `Error.`}
            get cancel()            { return `[cancel]` }
            get help()              { return `[help]` }
            get help_cancel()       { return `[help]${msg.div}[cancel]` }

            //  Private Methods
            _formatString(input) { let s = input; return input = s.replace(/(^\s+)|(\s+$)/g,"").replace(/\n[ \t]+/g,"\n") }
            _formatAllStrings() {
                for (let key1 in this) {
                    if (typeof this[key1] === "string") this[key1] = this._formatString(this[key1])
                    if (typeof this[key1] === "object") { for (let key2 in this[key1]) { if (typeof this[key1][key2] === "string") this[key1][key2] = this._formatString(this[key1][key2]) } }
                    if (key1 === "fields") { this[key1].forEach((e) => { for (let key in e) { if (typeof e[key] === "string") e[key] = this._formatString(e[key]) } }) }
                }
            }
            _clear() { for (let key in this) { typeof this[key] !== "object" ? this[key] = undefined : this[key] = [] }; return this}

            //  Public Methods
            send() { 
                this._formatAllStrings();
                let output = new Embed()
                Object.assign(output, this)
                this._clear()
                return message.channel.send(output); 
            }
            sendTo(channel) {
                this._formatAllStrings();
                let output = new Embed()
                Object.assign(output, this)
                this._clear()
                return /^\d+$/.test(channel) ?
                    bot.channels.find(x => x.id === channel).send(output) :
                    bot.channels.find(x => x.name === channel.toLowerCase()).send(output);
            }
            sendDM(target) {
                this._formatAllStrings();
                let output = new Embed()
                Object.assign(output, this)
                this._clear()
                return target.client.send(output);
            }   
            sendRaw(text) { return message.channel.send(this._formatString(text)); }
            sendRawTo(channel, text) {
                return /^\d+$/.test(channel) ?
                    bot.channels.find(x => x.id === channel).send(this._formatString(text)) :
                    bot.channels.find(x => x.name === channel.toLowerCase()).send(this._formatString(text));
            }
            sendRawDM(target, text) { return target.client.send(this._formatString(text)); }
            
            //  Shortcut Method
            embedWrapper(color, text) { return this.setColor(color).setDescription(this._formatString(text)).send() }
            prompt(text, footer = '') { return this.setColor(this.promptcolor).setDescription(this._formatString(text)).setFooter(footer) }
            collect(text, footer = '') { return this.setColor(this.collectorcolor).setDescription(this._formatString(text)).setFooter(footer) }

            //  Utility Methods
            formatComma(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
            codeBlock(message, style = ``, markdown = ``) { return `${markdown}\`\`\`${style}\n${this._formatString(message)}\`\`\`${markdown.split("").reverse().join("")}` }
            async collectAndRespond(data) {
                data.prompt.send().then(async confimration => {
                    await message.channel.awaitMessages(authorfilter, { maxMatches: 1, time: timeout1 }).then(async collected => {
                        await pause(delay)
                        await collected.first().delete();
                        await confimration.delete();
                        let check
                        if (data.match) {
                            if (data.match.toLowerCase() === 'exact') check = data.input.includes(collected.first().content)
                        } else check = data.input.includes(collected.first().content.toLowerCase())

                        if (check) {
                            this.sendRaw(`\`${data.loading}\``).then(async loading => {
                                await data.action()
                                await pause(delay)
                                await loading.delete()
                                await data.respond()
                            })
                        } else this.prompt(this.canceled).send()
                    })
                })
            }
            decrypt(input) {
                let single = 0
                let double = 0
                let storage = []
                let decode = []
                input.forEach(e => {
                    if(/^'/.test(e)) { if(single === 0 && double === 0) e = e.replace(`'`,``); single++ }
                    if(/^"/.test(e)) { if(single === 0 && double === 0) e = e.replace(`"`,``); double++ }
                    if(/'$/.test(e)) { single--; if(single === 0 && double === 0) e = e.replace(`'`,``) }
                    if(/"$/.test(e)) { double--; if(single === 0 && double === 0) e = e.replace(`"`,``) }
                    if(single === 0 && double === 0){
                        if(/[^\s]/.test(e)) { 
                            storage.push(e)
                            decode.push(storage.join(' '))
                            storage = [] 
                        } 
                    } else storage.push(e)
                })
                return [...decode]
            }

        }

        //  Define special globals
        user = await new User(authorname).init();
        userclan = await new Clan(user.clanid).init();
        msg = new Embed();
        cmdpath = []
        accessmap = {
            clanstatus : {
                public      : true,
                member      : user.isMember,
                leader      : user.isLeader,
                not_member  : !user.isMember,
                not_leader  : user.isMember && !user.isLeader
            },
            memberapps : {
                public       : true,
                been_invited : user.beenInvited,
                has_applied  : user.hasApplied
            },
            clanapps : {
                public        : true,
                sent_invites  : userclan.sentinvites,
                recieved_apps : userclan.recievedapps
            },
            roles : {
                public : { 
                    "459891664182312980" : "@everyone"
                },
                developer : { 
                    "502843277041729546" : "Developer Team"
                },
                admin : { 
                    "459936023498063902" : "Grand Master",
                    "465587578327007233" : "Creators Council"
                },
                beta : {
                    "626692698262208522" : "Clans Beta Access"
                },
                nobody : {
                    "999999999999999999" : "Nonexistant Test Role"
                }
            }
        } 
        
        /***************************************************************************************************
         * UTILITY COMMANDS
         ***************************************************************************************************/
        let divider = {
            metadata: new Metadata("divider").setAccess({ roles: "public" }),
            execute: async(metadata) => {}
        }
        
        let help = {
            metadata: new Metadata("help")
                .setInfo("View guide of this subcommand.")
                .setAccess({ roles: "public" }),

            execute: async(metadata) => {
                cmdpath.shift()
                cmdpath.unshift(`${prefix}${commandname}`)

                let style = `HTTP`
                let bold = `**`
                metadata.arguments.forEach((e, i)  => metadata.arguments[i] = `<${e.arg}>`)

                msg 
                    .setColor(palette.darkmatte)
                    .setDescription(`
                        Command Shortcut:   ${msg.codeBlock(`${cmdpath.join(' ')} ${metadata.arguments.join(' ')}`, `yaml`, bold)}
                        Information:        ${msg.codeBlock(metadata.info,'ini', bold)}`)

                if (args[0] === "DEVMODE") return msg
                    .setDescription(`
                        Command Shortcut:   ${msg.codeBlock(`${cmdpath.join(' ')} ${metadata.arguments.join(' ')}`, `yaml`, bold)}
                        Information:        ${msg.codeBlock(metadata.info, `ini`, bold)}
                        Formal Name:        ${msg.codeBlock(metadata.name, style, bold)}
                        Alias:              ${msg.codeBlock(metadata.alias.length ? metadata.alias.join(', ') : `--`, style, bold)}
                        Subcommand List:    ${metadata.outputCommandList()}
                        Access Permissions: ${msg.codeBlock(JSON.stringify(metadata.access).replace(/{|"|}/g,'').replace(/,/g,'\n').replace(/:/g,': '), style, bold)}`)
                    .setFooter(`${user.name} | Developer Mode`)
                    .send();
                else return msg.send();
            }
        }

        let clanList = {
            metadata: new Metadata("list")
                .setInfo("View a list of all clans")
                .setAccess({
                    clanstatus: "public",
                    roles: "beta" }),
            execute: async(metadata) => {
                let output = [];
                let list = await new Clan().clanList()
                list.forEach((e, i) => output.push(`\`[${i+1}]\` <@&${e.id}>\n`))
                msg.prompt(output.join(`\n`)).send()
            }
        }
        /***************************************************************************************************
         * CLAN CHANGE SETTINGS COMMANDS
         ***************************************************************************************************/
        let clanChangeName = {
            metadata: new Metadata("name")
                .setInfo("Change clan name.")
                .setAccess({   
                    clanstatus: "leader",
                    roles: "beta",
                    level: meta.change.name.level })
                .setInput({   
                    prompt: new Embed().prompt(`${emoji(`artcoins`,bot)}**${msg.formatComma(meta.change.name.price)}** 🡆 New Clan Name`),
                    require: true })
                .setArguments({
                    arg: "new name",
                    msg: "New Clan Name?"

                }),

            execute: async(metadata) => {

                let old_name = userclan.name
                let data = {
                    prompt  : msg.prompt(`**${old_name}** 🡆 **${args[0].slice(0,100)}**`, msg.confirm),
                    input   : ['y', 'yes'],
                    loading : `Changing clan name . . .`,
                    action  : async() => { 
                        if (args[0] === userclan.name) return
                        else userclan.setName(args[0]).updateData() 
                    },
                    respond : async() => {
                        if (userclan.name !== old_name) msg.prompt(`**${old_name}** 🡆 **${userclan.name}**`, msg.completed).send()
                        else if (userclan.name === old_name) msg.prompt('Clan name not changed.', msg.canceled).send()
                        else msg.prompt(msg.error).send() 
                    }
                }
                return await msg.collectAndRespond(data)

            }
        }
        
        let clanChangeTag = {
            metadata: new Metadata("tag")
                .setInfo("Change clan tag.")
                .setAccess({
                    clanstatus: "leader",
                    roles: "beta",
                    level: meta.change.motto.level })
                .setInput({
                    prompt: new Embed().prompt(`${emoji(`artcoins`,bot)}**${msg.formatComma(meta.change.tag.price)}** 🡆 New Clan Tag`),
                    require: true }) 
                .setArguments({
                    arg: "new tag",
                    msg: `New Clan tag?`,
                    cond: `Max 10 Chars.${msg.div}${msg.cancel}` }),
            execute: async(metadata) => {

                let old_tag = userclan.tag
                let data = {
                    prompt  : msg.prompt(`**${old_tag}** 🡆 **${args[0].slice(0,10)}**`, msg.confirm),
                    input   : ['y', 'yes'],
                    loading : `Changing clan tag . . .`,
                    action  : async() => { 
                        if (args[0] === userclan.tag) return
                        else userclan.setTag(args[0]).updateData() 
                    },
                    respond : async() => {
                        if (userclan.tag !== old_tag) msg.prompt(`**${old_tag}** 🡆 **${userclan.tag}**`, msg.completed).send()
                        else if (userclan.tag === old_tag) msg.prompt('Clan tag not changed.', msg.canceled).send()
                        else msg.prompt(msg.error).send()
                    }
                }
                return await msg.collectAndRespond(data) 
                
            }
        }

        let clanChangeColor = {
            metadata: new Metadata("color")
                .setInfo("Change clan color.")
                .setAlias("colour")
                .setAccess({
                    clanstatus: "leader",
                    roles: "beta",
                    level: meta.change.color.level })
                .setInput({
                    prompt: new Embed().prompt(`${emoji(`artcoins`,bot)}**${msg.formatComma(meta.change.color.price)}** 🡆 New Clan Color`), // hahaha no need to panic xD
                    require: true })
                .setArguments({
                    arg: "new color",
                    msg: "New Clan Color?",
                    cond: `[reset]${msg.div}${msg.cancel}`
                }),
            execute: async(metadata) => {
                
                args[0].toLowerCase() === 'reset' && !RegExp(/^[0-9A-F]{6}|[A-F0-9]{3}$/i).test(args[0]) ? args[0] = 'reset' : args[0] = `#${args[0].replace('#','')}`
                let old_color 
                !userclan.color ? old_color = 'No Color Set' : old_color = `#${userclan.color}`
                let data = {
                    prompt  : msg.prompt(`**${old_color}** 🡆 **${args[0].toUpperCase()}**`, msg.confirm),
                    input   : ['y', 'yes'],
                    loading :`Changing clan color . . .`,
                    action  : async() => {
                        if (args[0] === userclan.color) return
                        else if(args[0].toLowerCase() === 'reset') userclan.setColor('000000').updateData() 
                        else userclan.setColor(args[0]).updateData()
                    },
                    respond : async() => {
                        if (userclan.color !== old_color) msg.prompt(`**${old_color}** 🡆 **#${userclan.color}**`, msg.completed).send()
                        else if (userclan.color === old_color) msg.prompt('Clan color not changed.', msg.canceled).send()
                        else msg.prompt(msg.error).send() 
                    }
                }

                if (args[0].toLowerCase() !== 'reset' && !RegExp(/^[0-9A-F]{6}|[A-F0-9]{3}$/i).test(args[0])) {
                    msg.prompt(`\`${args[0]}\` is not a valid color.`).send()
                } else return await msg.collectAndRespond(data)

            } 
        }

        let clanChangeMotto = {
            metadata: new Metadata("motto")
                .setInfo("Change clan motto.")
                .setAccess({
                    clanstatus: "leader",
                    roles: "beta",
                    level: meta.change.motto.level })
                .setInput({
                    prompt: new Embed().prompt(`${emoji(`artcoins`,bot)}**${msg.formatComma(meta.change.motto.price)}** 🡆 New Clan Motto`),
                    require: true }) 
                .setArguments({
                    arg: "new motto",
                    msg: `New Clan Motto?` 
                }), 
            execute: async(metadata) => {
                
                let old_motto = userclan.motto
                let data = {
                    prompt  : msg.prompt(`**${old_motto}** 🡆 **${args[0]}**`, msg.confirm),
                    input   : ['y', 'yes'],
                    loading : `Chaning clan motto . . .`,
                    action  : async() => { 
                        if (args[0] === userclan.motto) return
                        else userclan.setMotto(args[0]).updateData() 
                    },
                    respond : async() => {
                        if (userclan.motto !== old_motto) msg.prompt(`**${old_motto}** 🡆 **${userclan.motto}**`, msg.completed).send()
                        else if (userclan.motto === old_motto) msg.prompt('Clan color not changed.', msg.canceled).send()
                        else msg.prompt(msg.error).send()
                    }
                }
                return await msg.collectAndRespond(data)
            }
        }

        /***************************************************************************************************
         * MEMBER MANAGEMENT COMMANDS
         ***************************************************************************************************/
        let clanSentInvitations = {
            metadata: new Metadata("invitations")
                .setInfo("View sent invitations.")
                .setAccess({
                    clanstatus: "leader",
                    clanapps: "sent_invites",
                    roles: "beta" })
                .setInput({
                    prompt: new Embed(),
                    require: false }),
            execute: async(metadata) => {
                
            }
        }
        
        let clanRecievedApplications = { 
            metadata: new Metadata("applications")
                .setInfo("Someone applied to your clan!")
                .setAccess({
                    clanstatus: "leader",
                    clanapps: "recieved_apps",
                    roles: "beta" })
                .setInput({
                    prompt: new Embed(),
                    require: false }),
            execute: async(metadata) => {
                
            }
        }

        let clanRecievedInvitations = {
            metadata: new Metadata("invited")
                .setInfo(`You have been invited to a clan!`)
                .setAccess({
                    clanstatus: "not_member",
                    memberapps: "been_invited",
                    roles: "beta" }),
            execute: async(metadata) => {

                let output = [`You have been invited to:\n`]
                if (user.invitations)
                user.invitations.forEach((e, i) => {
                    output.push(`\`[${i+1}]\` <@&${e.clanId}>\n`)
                })
                return msg.addField("TEST CLAN NAME", "[Click here](https://discordapp.com/channels/459891664182312980/565308091424571422/602799201067466753)").send()
                msg.prompt(`${output.join(`\n`)}\n**${msg.codeBlock(`• accept aa`,`HTTP`)}${msg.codeBlock(`• decline`,`HTTP`)}**`).send()

            }
        }

        let clanSentApplications = {
            metadata: new Metadata("applied")
                .setInfo("View clans you have applied to.")
                .setAccess({
                    clanstatus: "not_member",
                    memberapps: "has_applied",
                    roles: "beta" })
                .setInput({
                    prompt: new Embed(),
                    require: false }),
            execute: async(metadata) => {

            }
        }

        let clanApply = {
            metadata: new Metadata("apply")
                .setInfo("Apply to a clan.")
                .setAlias("join")
                .setAccess({
                    clanstatus: "not_member",
                    roles: "beta",
                    level: -1 })
                .setInput({
                    prompt: new Embed().prompt(`💌${msg.arrow}Clan?`),
                    require: true })
                .setArguments({
                    arg: "clan",
                    msg: "Clan Name?" }),
            execute: async(metadata) => {
                let targetclan = await new Clan(args[0]).init()
                if (targetclan.exists) {
                    let data = {
                        prompt: new Embed().prompt(`💌${msg.arrow}<@&${targetclan.id}>`, msg.confirm),
                        input: ["y", "yes"],
                        loading: "Sending Application . . .", 
                        action: async() => { await targetclan.updateMember(user, 'member', 'applied') },
                        respond: async() => {
                            await user.init();
                            let applied = false;
                            user.applications.forEach(e => { if (e.clanId === targetclan.id) applied = true })
                            if (applied) return msg.prompt(`💌${msg.arrow}<@&${targetclan.id}>`,msg.completed).send()
                            else if (user.clanid === targetclan.id) return msg.prompt(`${user.name}, welcome to <@&${user.clanid}> ${emoji(`aauinlove`, bot)}`,msg.completed).send()
                            else return msg.prompt(msg.error).send()
                        }
                    }
                    return await msg.collectAndRespond(data)
                } else return msg.prompt(`${args[0]} does not exists.`).send()
            }
        }

        let clanInvite = {
            metadata: new Metadata("invite")
                .setInfo("Invite a user to your clan.")
                .setAlias("add")
                .setAccess({
                    clanstatus: "leader",
                    roles: "beta" })
                .setInput({
                    prompt: new Embed().prompt(`💌${msg.arrow}User?`),
                    require: true })
                .setArguments({
                    arg: "user",
                    msg: "User Name?" }),
            execute: async(metadata) => {
                let target = await new User(args[0]).init()
                if (target.exists) {
                    if (target.isMember) return msg.prompt(`\`${target.name}\` is already in a clan.`).send()
                    else {
                        let data = {
                            prompt: new Embed().prompt(`💌${msg.arrow}${target.client}`, msg.confirm),
                            input: ["y", "yes"],
                            loading: "Inviting User . . .", 
                            action: async() => { await userclan.updateMember(target, 'member', 'invited') },
                            respond: async() => {
                                await target.init();
                                let invited = false;
                                target.invitations.forEach(e => { if (e.clanId === userclan.id) invited = true })
                                if (invited) return msg.prompt(`💌${msg.arrow}${target.client}`,msg.completed).send()
                                else if (userclan.id === target.clanid) return msg.prompt(`**\`${target.name}\`** has joined <@&${userclan.id}> ${emoji(`aauinlove`, bot)}`,msg.completed).send()
                                else return msg.prompt(msg.error).send()
                            }
                        }
                        return await msg.collectAndRespond(data)
                    }
                } else return msg.prompt(`${args[0]} does not exists.`).send()
            }
        }

        let clanLeave = {
            metadata: new Metadata('leave')
                .setInfo("Leave your clan.")
                .setAlias("gquit")
                .setAccess({
                    clanstatus: "not_leader",
                    roles: "beta" }),
            execute: async(metadata) => {
                let old_clan = userclan.id
                let data = {
                    prompt: new Embed().prompt(`Leave <@&${userclan.id}>?`, msg.confirm),
                    input: ["y", "yes"],
                    loading: "Leaving Clan . . .", 
                    action: async() => { await userclan.updateMember(user, 'member', 'leave') },
                    respond: async() => {
                        await user.init();
                        if (!user.isMember) return msg.prompt(`${user.name}, you have left <@&${old_clan}>. `,msg.completed).send()
                        else return msg.prompt(msg.error).send()
                    }
                }
                return await msg.collectAndRespond(data)
            }
        }

        let clanKick = {
            metadata: new Metadata('kick')
                .setInfo("Kick a clan member.")
                .setAlias(["remove", "kill", "gtfo"])
                .setAccess({
                    clanstatus: "leader",
                    roles: "beta" })
                .setInput({
                    prompt: new Embed().prompt(`🔪${msg.arrow}Member?`),
                    require: true })
                .setArguments({
                    arg: "member",
                    msg: "Member?" }),
            execute: async(metadata) => {
                let target = await new User(args[0]).init(); 
                if (target.id === user.id) msg.prompt(`You cannot kick yourself. ${emoji(`aauSatanialaugh`, bot)}`, msg.canceled).send()
                else {
                    let data = {
                        prompt: new Embed().prompt(`🔪${msg.arrow}\`${target.name}\``, msg.confirm),
                        input: ['y', 'yes'],
                        loading: "Removing member . . .",
                        action: async() => { await userclan.updateMember(target, 'member', 'remove') },
                        respond: async() => {
                            await target.init();
                            if(!target.isMember) return msg.prompt(`\`${target.name}\` has been kicked from <@&${userclan.id}>.`, msg.completed).send()
                            else return msg.prompt(msg.error).send()
                        }
                    }
                    return await msg.collectAndRespond(data)
                }
            }
        }

        /***************************************************************************************************
         * MAIN COMMANDS
         ***************************************************************************************************/
        let clanSettings = {
            metadata: new Metadata("settings")
                .setInfo("Change your clan settings.")
                .setAlias("change")
                .setCommandList([
                        clanChangeName,
                        clanChangeTag,
                        clanChangeColor,
                        clanChangeMotto, 
                    divider ])
                .setAccess({   
                    clanstatus: "leader",
                    roles: "beta" })
                .setInput({
                    prompt: new Embed()
                        .setColor(msg.promptcolor)
                        .setDescription(`[SUBCOMMANDLIST]`),
                    require: true })
                .setArguments({   
                    arg: "subcommand",
                    msg: "Subcommand?" }),

            execute: async(metadata) => {
                msg.prompt(`**\`${args[0]}\`** is not a valid subcommand.`).send()
            }
        }
        
        let clanDisband = { 
            metadata: new Metadata("disband")
                .setInfo("Permanently disband your clan...")
                .setAccess(
                    {   clanstatus: "leader",
                        roles: "beta" })
                .setInput(
                    {   prompt: new Embed()
                            .setColor(msg.promptcolor)
                            .setDescription(`**${userclan.name}** 🡆 Disband Clan`),
                        require: true }),

            execute: async(metadata) => {
                let clanname = userclan.name
                let data = {
                    prompt: new Embed().prompt(`${msg.codeBlock(`- Permanently Disband? -`,`diff`)}`, `${msg.help}${msg.div}[${userclan.name}] to confirm.`),
                    input: [userclan.name],
                    match: 'exact',
                    loading: "Disbanding clan . . .",
                    action: async() => { await userclan.disband() },
                    respond: async() => {
                        await userclan.init();
                        if(!userclan.exists) {
                            msg.prompt(`**${userclan.name}** 🡆 Permanently Disbanded`, msg.completed).send()
                            return console.log (`${user.name} disbanded clan: ${userclan.name}`)
                        }
                        else return msg.prompt(msg.error).send()
                    }
                }
                return await msg.collectAndRespond(data)
            }
        }
        
        let clanCreation = { 
            metadata: new Metadata("create")
                .setAlias("make")
                .setInfo("Create a new clan!")
                .setAccess({
                    clanstatus: "not_member",
                    roles: "beta",
                    level: meta.create.level })
                .setInput({
                    prompt: new Embed()
                        .setColor(msg.promptcolor)
                        .setDescription(`${emoji(`artcoins`,bot)}**${msg.formatComma(meta.create.price)}** 🡆 New Clan`),
                    require: true })
                .setArguments([
                    {   arg: "Name",
                        msg: "Clan Name?",
                        cond: msg.help_cancel },
                    {   arg: "Tag",
                        msg: "Clan Tag?",
                        cond: `Max 10 Chars.${msg.div}${msg.cancel}` },
                    {   arg: "Motto",
                        msg: "Clan Motto?" }]),

            execute: async(metadata) => {

                let newclan = new Clan()
                    .setName(args[0])
                    .setTag(args[1])
                    .setMotto(args[2])

                let data = {
                    prompt  : msg.collect(msg.codeBlock(`
                        • Name  : ${newclan.$data.name}
                        • Tag   : ${newclan.$data.tag}
                        • Motto : ${newclan.$data.motto}`,`HTTP`,`**`),
                        `${msg.confirm}`),
                    input   : ['y', 'yes'],
                    loading : `Creating new clan . . .`,
                    action  : async() => { await newclan.create() },
                    respond : async() => {
                        if (newclan.exists) {
                            msg.prompt(`**${newclan.$data.name}** 🡆 New Clan Created!`, msg.completed).send()
                            return console.log (`${user.name} created a new clan: ${newclan.name}`)
                        } else msg.prompt(msg.error).send()
                    }
                }

                return await msg.collectAndRespond(data)

            }
            
        }

        /***************************************************************************************************
         * ADMIN COMMANDS
         ***************************************************************************************************/
        let featureClan = {
            metadata: new Metadata("feature")
                .setInfo("Manually feature a clan.")
                .setAlias("hoist")
                .setAccess({ roles: "admin" })
                .setInput({
                    prompt: new Embed()
                        .setColor(msg.promptcolor)
                        .setDescription(`💖${msg.arrow}**Clan**`),
                    require: true })
                .setArguments({   
                    arg: "Clan",
                    msg: "Clan Name?",
                    cond: msg.help_cancel }),
            execute: async(metadata) => {
                let targetclan = await new Clan(args[0]).init()
                if (targetclan.exists) {
                    console.log(target)
                    let clanid = targetclan.id
                    let data = {
                        prompt: new Embed().prompt(`💖${msg.arrow}<@&${targetclan.id}>`, msg.confirm),
                        input: ['y', 'yes'],
                        loading: "Featuring clan . . .",
                        action: async() => { 
                            let hoistlist = await sql.all(`SELECT ALL * FROM clandata WHERE hoist = 'True'`)
                            await hoistlist.forEach(async e => {
                                let temp = await new Clan(e.id).init()
                                await temp.setHoist('False').updateData();
                            })
                            await targetclan.setHoist('True').updateData();
                        },
                        respond: async() => {
                            await targetclan.init();
                            if(targetclan.isHoist) return msg.prompt(`💖${msg.arrow}<@&${clanid}>`, msg.completed).send()
                            else return msg.prompt(msg.error).send()
                        }
                    }
                    return await msg.collectAndRespond(data)
                } else return msg.prompt(`${args[0]} does not exists.`).send()
            }
        }

        let purgeClan = {
            metadata: new Metadata("purge")
                .setAlias("remove")
                .setInfo("Purge an existing clan.") 
                .setAccess({ roles: "admin" })
                .setInput({
                    prompt: new Embed()
                        .setColor(msg.promptcolor)
                        .setDescription(`🔪${msg.arrow}**Clan**`),
                    require: true })
                .setArguments({   
                    arg: "Clan",
                    msg: "Clan Name?",
                    cond: msg.help_cancel }),

            execute: async(metadata) => {
                let targetclan = await new Clan(args[0]).init()
                let clanname = targetclan.name
                if (targetclan.exists) {
                    let data = {
                        prompt: new Embed().prompt(`🔪${msg.arrow}<@&${targetclan.id}>`, msg.confirm),
                        input: ['y', 'yes'],
                        loading: "Purging clan . . .",
                        action: async() => { await targetclan.disband() },
                        respond: async() => {
                            await targetclan.init();
                            if(!targetclan.exists) return msg.prompt(`\`${clanname}\` has been purged.`, msg.completed).send()
                            else return msg.prompt(msg.error).send()
                        }
                    }
                    return await msg.collectAndRespond(data)
                } else return msg.prompt(`${args[0]} does not exists.`).send()
            }
        }

        let test = {
            metadata: new Metadata("test")
                .setInfo("Testing Room 1")
                .setAccess({ role: "developer" })
                .setInput({
                    prompt: new Embed()
                        .setColor(msg.promptcolor)
                        .setDescription(`Change Username Test.`),
                    require: true })
                .setArguments([
                    {   
                    arg: "target",
                    msg: "Username?",
                    cond: msg.help_cancel },
                    { 
                    arg: "new nickname",
                    msg: "New Nickname?",
                    cond: msg.help_cancel }]),

            execute: async(metadata) => {
                let target = await new User(args[0]).init()
                let old_nickname = target.nickname
                let new_nickname = args[1]
                await target.setNickname(new_nickname)
                msg.prompt(`${old_nickname} | ${target.nickname}`).send()

            }
        }
        /***************************************************************************************************
         * EXECUTION:
         ***************************************************************************************************/ 
        let clanMain = {
            metadata: new Metadata("clan")
                .setInfo(`
                    • This is the starting point of all clan-related commands!\n
                    • You may start by entering [${prefix}${commandname}] and follow the instructions.\n
                    • Alternatively, you may combine commands by entering them in the correct format as shown above in: [Command Shortcut]\n
                    • Typing [help] after any command will open a detailed guide providing additional information.\n
                    • Below is a list of availible [subcommands] that you can access at this point.`)
                .setCommandList([   
                        clanList,
                    divider,
                        clanApply,
                        clanInvite,
                        clanKick,
                    divider,
                        clanSentInvitations,
                        clanSentApplications,
                        clanRecievedInvitations,
                        clanRecievedApplications,
                    divider,
                        clanSettings,
                        clanLeave,
                        clanCreation,
                        clanDisband,
                    divider,
                        featureClan,
                        purgeClan,
                    divider,
                        test,
                    divider ])
                .setAccess({ roles: "beta"})
                .setInput({
                    prompt: new Embed()
                        .setColor(msg.promptcolor)
                        //.attachFiles(['./images/clan_banner.png'])
                        .setDescription(`[SUBCOMMANDLIST]`),
                    require: true })
                .setArguments({
                    arg: "subcommand",
                    msg: "Subcommand?" }),

            execute: async(metadata) => {

                let subcommand = await new Subcommand(clanMain.metadata).init();
                if (subcommand.exists) return await subcommand.execute()
                else return msg.embedWrapper(palette.darkmatte, `**\`${args[0]}\`** is not a valid subcommand.`)

            }
        }

        const origin = () => {
            args.unshift(commandname)
            args = msg.decrypt(args)
            let originmeta = new Metadata("").setCommandList([ clanMain ])
            let maincommand = new Subcommand(originmeta).init();
            return maincommand.execute()
        }

        return origin()
    }
}

module.exports.help = {
    start: clan_wrapper,
    name: "clan",
    aliases: ["guild"],
    description: `Starting point for all clan-related commands.`,
    usage: `${require(`../../../.data/environment.json`).prefix}clan`,
	group: "Admin",
	public: false,
	required_usermetadata: true,
	multi_user: false
}