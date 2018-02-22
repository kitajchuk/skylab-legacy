"use strict";



const fs = require( "fs" );
const path = require( "path" );
const yargs = require( "yargs" );
const lager = require( "properjs-lager" );
const express = require( "express" );
const expressPort = 8000;
const bodyParser = require( "body-parser" );
const child_process = require( "child_process" );
const context = "skylab-taskrunner";
const secret = String( fs.readFileSync( path.join( __dirname, "../task-secret" ) ) ).replace( /^\s+|\s+$/g, "" );
const taskBounce = 1000;
let taskRunner = null;



const doTaskRunner = () => {
    child_process.execSync( "/var/www/html/task-runner" );
};



const checkSecret = ( req, res, next ) => {
    if ( req.body.secret !== secret ) {
        res.status( 403 ).send( "Skylab taskrunner requires a secret." );
        lager.warn( "Skylab taskrunner requires a secret." );

    } else {
        next();
    }
};



const checkHitType = ( req, res, next ) => {
    if ( req.body.type === "test-trigger" ) {
        res.status( 200 ).send( "Skylab taskrunner ignores test triggers." );
        lager.warn( "Skylab taskrunner ignores test triggers." );

    } else if ( req.body.type === "api-update" ) {
        lager.cache( "Skylab taskrunner api-update triggered." );
        next();

    } else {
        res.status( 200 ).send( "Skylab taskrunner invalid req.body.type." );
        lager.warn( "Skylab taskrunner invalid req.body.type." );
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
        lager.cache( "Skylab taskrunner server is up." );
    });

    expressApp.post( "/webhook", checkSecret, checkHitType, ( req, res ) => {
        try {
            clearTimeout( taskRunner );

        } catch ( error ) {
            lager.error( error );
        }

        taskRunner = setTimeout(() => {
            doTaskRunner();
            res.status( 200 ).send( "Skylab taskrunner initialized." );
            lager.cache( "Skylab taskrunner initialized." );

        }, taskBounce );
    });

    expressApp.listen( expressPort );

    lager.cache( "Skylab taskrunner server booted." );
};



if ( yargs.argv.token && yargs.argv.webhook && yargs.argv.channel && yargs.argv.key && yargs.argv.secret && yargs.argv.region && yargs.argv.bucket && yargs.argv.prefix && yargs.argv.directory ) {
    startTaskRunner();

} else {
    lager.error( "All arguments required: token, webhook, channel, key, secret, region, bucket, prefix, directory..." );

    process.exit( 1 );
}
