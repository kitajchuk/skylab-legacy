"use strict";



const path = require( "path" );
const cli = require( "cli" );
const lager = require( "properjs-lager" );
const express = require( "express" );
const expressPort = 8000;
const bodyParser = require( "body-parser" );
const child_process = require( "child_process" );
const slacker = require( "properjs-slacker" );
const context = "skylab-taskrunner";
const secret = String( fs.readFileSync( path.join( __dirname, "../task-secret" ) ) ).replace( /^\s+|\s+$/g, "" );
let taskRunner = false;



const doTaskRunner = () => {
    taskRunner = true;

    const task = child_process.spawn( "/var/www/html/task-imgpro" );

    // task.stdout.on( "data", ( data ) => {
    //     lager.info( `task.stdout => ${data}` );
    // });

    // task.stderr.on( "data", ( data ) => {
    //     lager.info( `task.stderr => ${data}` );
    // });

    task.on( "close", ( code ) => {
        taskRunner = false;

        slacker( cli.options.token, cli.options.webhook, cli.options.channel, context, [
            "Task Runner S3 Uploaded!"
        ]);
    });
};



const checkSecret = ( req, res, next ) => {
    if ( req.body.secret !== secret ) {
        res.status( 403 ).send( "Skylab taskrunner requires a secret." );

    } else {
        next();
    }
};



const checkHitType = ( req, res, next ) => {
    if ( req.body.type === "test-trigger" ) {
        res.status( 200 ).send( "Skylab taskrunner ignores test triggers." );

    } else if ( req.body.type === "api-update" ) {
        next();

    } else {
        res.status( 200 ).send( "Skylab taskrunner invalid req.body.type." );
    }
};



const checkRunner = ( req, res, next ) => {
    if ( taskRunner ) {
        res.status( 200 ).send( "Skylab taskrunner running." );

    } else {
        next();
    }
};



const startTaskRunner = () => {
    const expressApp = express();

    expressApp.use(bodyParser.json({
        limit: "1mb"
    }));
    expressApp.use(bodyParser.urlencoded({
        limit: "1mb",
        extended: true
    }));

    expressApp.get( "/", ( req, res ) => {
        res.status( 200 ).send( "Skylab taskrunner server is up." );
    });

    expressApp.post( "/webhook", checkSecret, checkHitType, checkRunner, ( req, res ) => {
        setTimeout(() => res.status( 200 ).send( "Skylab taskrunner initialized." ), 250 );

        doTaskRunner();
    });

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
    startTaskRunner();

} else {
    lager.error( "All arguments required: token, webhook, channel, key, secret, region, bucket, prefix, directory..." );

    process.exit( 1 );
}
