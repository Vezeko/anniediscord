class Testing {
    constructor(Stacks) {
        this.stacks     = Stacks;
    }
    async execute() {
        let bot         = this.stacks.bot;
        let message     = this.stacks.message;

    }

}

module.exports.help = {
    start: Testing,
    name: "test",
    aliases: [],
    description: `--`,
    usage: `${require(`../../../.data/environment.json`).prefix}buy <item>`,
    group: "Admin",
    public: false,
    required_usermetadata: false,
    multi_user : false
}