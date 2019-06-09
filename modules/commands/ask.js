  /**
   * Main module
   * @Ask 8ball-like question.
   */
  class Ask {
    constructor(Stacks) {
      this.author = Stacks.meta.author.user;
      this.data = Stacks.meta.data;
      this.utils = Stacks.utils;
      this.message = Stacks.message;
      this.args = Stacks.args;
      this.palette = Stacks.palette;
      this.replies = ["Yes.", "No.", "I don't know.", "You", "Well, probably.", "Not sure.", "Definitely!"];
      this.randomReplies = this.replies[Math.floor((Math.random() * this.replies.length))];
    }


    async execute() {
      if (!this.args[0]) return;
      let question = this.args.slice(0).join(" ");
      return this.utils
        .send(`${this.utils.name(this.author.id)} asked "${question}"`)
        .then(() => {
          this.utils.sendEmbed(`**${this.randomReplies}**`, this.palette.halloween)
        })
    }
  }


  module.exports.help = {
    start: Ask,
    name: "ask",
    aliases: [],
    description: `You can ask any question and Annie will answer you.`,
    usage: `>ask <message>`,
    group: "Fun",
    public: true,
    require_usermetadata: false
  }