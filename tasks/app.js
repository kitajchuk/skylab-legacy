"use strict";



const cli = require( "cli" );
const lager = require( "properjs-lager" );
const express = require( "express" );
const expressPort = 8000;
const bodyParser = require( "body-parser" );
const spawn = require( "child_process" ).spawn;
const slacker = require( "properjs-slacker" );
const context = "skylab-taskrunner";
let taskRunner = false;



const doTaskRunner = function () {
    taskRunner = true;

    // Reverse order since we use `tasks.pop()`
    const tasks = [
        {
            cmd: "./task-img ; ./task-s3",
            args: []
        }
    ];
    const onData = function ( data ) {
        console.log( data.toString() );
    };
    const doTask = function ( task ) {
        const child = spawn( task.cmd, task.args, {
            shell: true
        });

        child.stdout.on( "data", onData );
        child.on( "close", () => {
            if ( tasks.length ) {
                doTask( tasks.pop );

            } else {
                taskRunner = false;

                slacker( cli.options.token, cli.options.webhook, cli.options.channel, context, [
                    "Task Runner S3 Uploaded!"
                ]);

                lager.server( "Task Runner Complete!" );
            }
        });
    };

    doTask( tasks.pop() );
};



const startTaskServer = function () {
    const expressApp = express();

    expressApp.use(bodyParser.json({
        limit: "100mb"
    }));
    expressApp.use(bodyParser.urlencoded({
        limit: "100mb",
        extended: true
    }));

    expressApp.post( "/webhook", ( req, res ) => {
        lager.server( "Webhook Post Request" );
        lager.data( req.body );

        // api-update
        // test-trigger
        if ( req.body.type === "api-update" ) {
            if ( !taskRunner ) {
                lager.server( "Initializing Task Runner..." );

                doTaskRunner();

            } else {
                lager.warn( "Task Runner Running..." );
            }
        }

        // 2xx required by Prismic.io
        res.status( 200 ).send( "Thanks" );
    });

    lager.server( "Task Runner Listening for Updates..." );

    expressApp.listen( expressPort );
};



cli.setApp( "skylab-tasks", "0.1.0" );



cli.parse({
    // Imageprocess Options:
    token: ["token", "The Slack app integration token.", "string", ""],
    webhook: ["webhook", "The Slack app integration webhook URL.", "string", ""],
    channel: ["channel", "The Slack channel to ping.", "string", ""],

    // ProperJS/s3 Options:
    key: ["key", "The AWS access key id ( IAM ).", "string", ""],
    secret: ["secret", "The AWS secret access key ( IAM ).", "string", ""],
    region: ["region", "The AWS region, like us-west-2.", "string", ""],
    bucket: ["bucket", "The AWS s3 bucket name to sync with.", "string", ""],
    prefix: ["prefix", "The AWS s3 folder name to sync files to.", "string", ""],
    directory: ["directory", "The local directory to sync to AWS s3.", "string", ""]
});



if ( cli.options.token && cli.options.webhook && cli.options.channel && cli.options.key && cli.options.secret && cli.options.region && cli.options.bucket && cli.options.prefix && cli.options.directory ) {
    startTaskServer();

} else {
    lager.error( "All arguments required: token, webhook, channel, key, secret, region, bucket, prefix, directory..." );

    process.exit( 1 );
}
