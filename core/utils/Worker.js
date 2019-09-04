const Controller = require(`./MessageController`)
const Experience = require(`./ExperienceFormula`)
const CollectPost = require(`./collectingArtpost`)
const EventSubmission = require(`./eventSubmissionManager`)
const Portfolio = require(`./portfolioManager`)
const Commands = require(`../modules/commandsHandler`)
const DM = require(`./directMessageInterface`)


/**
 *  Run the check.
 *  Don't change the current statement flow, they are already properly arranged.
 *  @Worker
 */
class Worker extends Controller {
    constructor(data) {
        super(data)
    }


    /**
     *  Basic flow
     *  @default
     */
    default() {

        //  Ignore any user interaction in dev environment
        if (super.isUserInDevEnvironment) return
        
        //  Ignore if its from a bot user
        if (super.isAuthorBot) return


        //  These are only run on production server
        if (!this.env.dev) {
            //  React and collect if its an art post
            if (super.isArtPost) new CollectPost(this.data).run()
            //  Handle event-submission post
            if (super.isEventSubmission) new EventSubmission(this.data).run()
            //  Handle portfolio post
            if (super.isAddingPortfolio) new Portfolio(this.data).add()
        }


        //  Handle direct message
        if (super.isDirectMessage) return new DM(this.data).run()

        //  Handle message that has prefix or bot related.
        if (super.isCommandMessage) return new Commands(this.data).prepare()

        //  Handle experience system
        if (super.inExpChannel) return new Experience(this.data).runAndUpdate()       
    }

}

module.exports = Worker