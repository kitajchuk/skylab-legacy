var botkit = require( "botkit" );
var config = require( "../core/config" );



/**
 *
 * @method ping
 * @param {string} context The message context
 * @param {array} message The array of fields to send
 * @description Send messages to #channel as @kitbot
 *
 */
var ping = function ( args ) {
    var slacker = botkit.slackbot();
    var slackBot = slacker.spawn({
        token: args.token,
        incoming_webhook: {
            url: args.webhook
        }
    });

    slackBot.startRTM(function () {
        var webhookObj = {
            channel: args.channel,
            attachments: [
                {
                    fallback: args.message.join( "\n" ),
                    author_name: "Skylab-www",
                    color: "#000",
                    pretext: args.context,
                    title: args.context,
                    text: args.message.join( "\n" ),
                    footer: "Skylab-www",
                    ts: Date.now()
                }
            ]
        };

        slackBot.sendWebhook( webhookObj, function ( error, response ) {
            slackBot.closeRTM();
        });
    });
};



module.exports = {
    ping
};
