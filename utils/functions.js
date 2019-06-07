

module.exports = (bot, message) => {

    const module = {};
    const format = require(`./formatManager`);
    const palette = require(`../colorset.json`);
    const m = new format(message);

    /**
    * creates any amount of pages in a embed, when a large string is inputed ad the input
    * @param message message object
    * @param pageOrigin large string value
    * @param evembed the vairable used for the RichEmbed
    * @returns A correctly formatted Embed
    */
    module.evalpages = (message, pageOrigin,evembed) => {

        const clean = (text = ``) => {
            if (typeof (text) === "string")
                return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
            else
                return text;
        }

        let pages = [];

        console.log(`1: pageOrigin.length = ` + pageOrigin.length);
        for (let index = 0; index < pageOrigin.length; index += 1) {
            console.log(index + 1 + `: pageOrigin.length = ` + pageOrigin.length);
            pages.push(pageOrigin.substr(0, 2000));
            pageOrigin = pageOrigin.slice(2000);
        }
        console.log(`Final: pageOrigin.length = ` + pageOrigin.length);
        console.log(`pages.length = ` + pages.length);

        let page = 1; // We will define what page we are on here, the default page will be 1. (You can change the default page)

        //const embed = new Discord.RichEmbed() // Define a new embed, if you are on the `stable` branch it will be new Discord.RichEmbed()
        //.setColor(0xffffff) // You can set your color here
        evembed.setFooter(`Page ${page} of ${pages.length}`) // This is the default value, showing the default page and the amount of pages in the array.
        evembed.setTitle(`Debug Pages Result:`)
        evembed.setDescription(`**Output**\n\`\`\`autohotkey\n${clean(pages[page - 1])}\n\`\`\``) // This sets the description as the default page (we are subtracting 1 since arrays start at 0)

        message.channel.send(evembed).then(async msg => { // Now, we will send the embed and pass the new msg object

            msg.react('⏪').then(async () => { // We need to make sure we start the first two reactions, this is the first one

                msg.react('⏩') // This is the second one, it will run this one after the first one

                // Filters - These make sure the varibles are correct before running a part of code
                const backwardsFilter = (reaction, user) => reaction.emoji.name === '⏪' && user.id === message.author.id;
                const forwardsFilter = (reaction, user) => reaction.emoji.name === '⏩' && user.id === message.author.id; // We need two filters, one for forwards and one for backwards

                const backwards = msg.createReactionCollector(backwardsFilter, {}); // This creates the collector, which has the filter passed through it. The time is in milliseconds so you can change that for however you want the user to be able to react
                const forwards = msg.createReactionCollector(forwardsFilter, {}); // This is the second collector, collecting for the forwardsFilter

                // Next, we need to handle the collections
                backwards.on('collect', r => { // This runs when the backwards reaction is found
                    r.remove(message.author.id);
                    if (page === 1) page = pages.length + 1; // We want to make sure if they are on the first page, they can't go back a page // CHANGED so it goes to last page
                    page--; // If it can go back, push back the page number
                    evembed.setDescription(`**Output**\n\`\`\`autohotkey\n${clean(pages[page - 1])}\n\`\`\``) // Just like setting the first one, reset the Description to the new page
                    evembed.setFooter(`Page ${page} of ${pages.length}`) // This also sets the footer to view the current pagenumber
                    msg.edit(evembed) // Then, we can push the edit to the message
                })

                forwards.on('collect', r => { // This runs when the forwards reaction is found
                    r.remove(message.author.id);
                    if (page === pages.length) page = 0; // We can use copy and paste since it is basically the same thing, although now it checks if the page is currently on the highest possible, so it can't go any higher. // CHANGED so it goe to first page
                    page++; // If it can go forwards, push forwards the page number
                    evembed.setDescription(`**Output**\n\`\`\`autohotkey\n${clean(pages[page - 1])}\n\`\`\``) // Just like setting the first one, reset the Description to the new page
                    evembed.setFooter(`Page ${page} of ${pages.length}`) // This also sets the footer to view the current pagenumber
                    msg.edit(evembed) // Then, we can push the edit to the message
                })
            });
        });
    }// End of evalpages

    /**
    * creates any amount of pages in a embed, when a array is given as the input. Each array index is its own page. array[0] has own page, array[1] has own page and so on.
    * @param message message object
    * @param pages array set
    * @param evembed the vairable used for the RichEmbed
    * @returns A correctly formatted Embed
    */
    module.pages = (message, pages, evembed) => {



        let page = 1; // We will define what page we are on here, the default page will be 1. (You can change the default page)

        //const embed = new Discord.RichEmbed() // Define a new embed, if you are on the `stable` branch it will be new Discord.RichEmbed()
        //.setColor(0xffffff) // You can set your color here
        evembed.setFooter(`Page ${page} of ${pages.length}`) // This is the default value, showing the default page and the amount of pages in the array.
        //evembed.setTitle(`Debug Pages Result:`)
        evembed.setDescription(pages[page - 1]) // This sets the description as the default page (we are subtracting 1 since arrays start at 0)

        message.channel.send(evembed).then(async msg => { // Now, we will send the embed and pass the new msg object

            msg.react('⏪').then(async () => { // We need to make sure we start the first two reactions, this is the first one

                msg.react('⏩') // This is the second one, it will run this one after the first one

                // Filters - These make sure the varibles are correct before running a part of code
                const backwardsFilter = (reaction, user) => reaction.emoji.name === '⏪' && user.id === message.author.id;
                const forwardsFilter = (reaction, user) => reaction.emoji.name === '⏩' && user.id === message.author.id; // We need two filters, one for forwards and one for backwards

                const backwards = msg.createReactionCollector(backwardsFilter, {}); // This creates the collector, which has the filter passed through it. The time is in milliseconds so you can change that for however you want the user to be able to react
                const forwards = msg.createReactionCollector(forwardsFilter, {}); // This is the second collector, collecting for the forwardsFilter

                // Next, we need to handle the collections
                backwards.on('collect', r => { // This runs when the backwards reaction is found
                    r.remove(message.author.id);
                    if (page === 1) page = pages.length + 1; // We want to make sure if they are on the first page, they can't go back a page // CHANGED so it goes to last page
                    page--; // If it can go back, push back the page number
                    evembed.setDescription(pages[page - 1]) // Just like setting the first one, reset the Description to the new page
                    evembed.setFooter(`Page ${page} of ${pages.length}`) // This also sets the footer to view the current pagenumber
                    msg.edit(evembed) // Then, we can push the edit to the message
                })

                forwards.on('collect', r => { // This runs when the forwards reaction is found
                    r.remove(message.author.id);
                    if (page === pages.length) page = 0; // We can use copy and paste since it is basically the same thing, although now it checks if the page is currently on the highest possible, so it can't go any higher. // CHANGED so it goe to first page
                    page++; // If it can go forwards, push forwards the page number
                    evembed.setDescription(pages[page - 1]) // Just like setting the first one, reset the Description to the new page
                    evembed.setFooter(`Page ${page} of ${pages.length}`) // This also sets the footer to view the current pagenumber
                    msg.edit(evembed) // Then, we can push the edit to the message
                })
            });
        });
    }// End of pages

    /**
     * Finds a user by id, or tag or plain name
     * @param {object} message message object
     * @param target the arg for the user (id, name, mention)
     * @returns {object} user object
     */
    module.userFinding = async (message, target) => {
        const userPattern = /^(?:<@!?)?([0-9]+)>?$/;
        if (userPattern.test(target)) target = target.replace(userPattern, '$1');
        let members = message.guild.members;

        const filter = member => member.user.id === target
            || member.displayName.toLowerCase() === target.toLowerCase()
            || member.user.username.toLowerCase() === target.toLowerCase()
            || member.user.tag.toLowerCase() === target.toLowerCase();

        return members.filter(filter).first();
    }// End of userFinding

    /**
        Lifesaver promise. Used pretty often when calling an API.
        @pause
    */
    module.pause = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }// End of pause
    
    /**
     * Returns a(n) emoji from the server based on name.
     *  @emoji a unicode emoji
     * */
    module.emoji = (name) => {
        return bot.emojis.find(e => e.name === name);
    }// End of emoji

    /**
     * 
     * Returns username based on the id.
     *  @name strings
     */
    module.name = (id) => {
        return bot.users.get(id).username;
    }


    module.send = (msg = ``, color = palette.darkmatte) => {
        return m.embedWrapper(color, msg);
    }


    module.commanized = (int = 0) => {
        return m.threeDigitsComa(int);
    }

    return module;

}