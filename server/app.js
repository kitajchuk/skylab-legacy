"use strict";



const fs = require( "fs" );
const path = require( "path" );
const config = require( "../skylab.config" );
const router = require( "./router" );
const shuffle = require( "shuffle-array" );
const lager = require( "properjs-lager" );
const request = require( "request" );
const imageJSON = config.env.sandbox ? `http://localhost:${config.browser.port}/json/imageprocess.json` : `${config.deploy.cdnURL}/json/imageprocess.json`;



const canFeatures = function ( req ) {
    return (req.query.template === config.homepage);
};



const canTileset = function ( req ) {
    return (
        req.query.color ||
        req.query.material ||
        req.query.space
    );
};



const canDetail = function ( req ) {
    return (req.params.uid);
};



const getColorSort = function ( results ) {
    return results.sort(( a, b ) => {
        const minA = Math.min.apply( Math, a.deltas );
        const minB = Math.min.apply( Math, b.deltas );

        if ( minA < minB ) {
            return -1;

        } else {
            return 1;
        }
    });
};



const getResults = function ( kind, value ) {
    return new Promise(( resolve, reject ) => {
        request({
            url: imageJSON,
            json: true,
            method: "GET"

        }, function ( error, response, json ) {
            if ( error ) {
                reject( error );

            } else {
                let results = json.filter(( result ) => {
                    return (result[ kind ].indexOf( value ) !== -1 );
                });

                // Filters...?
                if ( kind === "colors" ) {
                    results = getColorSort( results );
                }

                resolve({
                    results: results
                });
            }
        });
    });
};



const onQuery = function ( client, api, query, cache, req ) {
    let ret = query;

    if ( req.query.status ) {
        ret.push( client.Predicates.at( `my.${config.skylab.mainType}.status`, req.query.status ) );
        lager.info( `Querying by Status ${req.query.status}` );
    }

    if ( req.query.category ) {
        ret.push( client.Predicates.at( `my.${req.params.type === config.skylab.workType ? config.skylab.mainType : config.skylab.blogType}.categories.category`, req.query.category ) );
        lager.info( `Querying by Category ${req.query.category}` );
    }

    if ( req.query.color ) {
        ret = getResults( "colors", req.query.color );
        lager.info( `Querying by Color ${req.query.color}` );
    }

    if ( req.query.material || req.query.space ) {
        ret = getResults( "tags", req.query.material || req.query.space );
        lager.info( `Querying by Tag ${req.query.material || req.query.space}` );
    }

    return ret;
};



const onContext = function ( context, cache, req ) {
    // Add `tileset` array to the context for filter criteria
    if ( canTileset( req ) ) {
        context.set( "tileset", context.get( "items" ) );
    }

    // Add `features` array to the context
    if ( canFeatures( req ) ) {
        context.set( "features", shuffle(context.get( "items" ).filter(( doc ) => {
            const type = doc.getText( `${config.skylab.mainType}.type` ) || doc.getText( `${config.skylab.blogType}.type` );

            return (type === "Feature");
        })));
    }

    // Add `previous` / `next` documents to context
    if ( canDetail( req ) ) {
        const item = context.get( "item" );
        const items = context.get( "items" );
        const index = items.indexOf( item );

        context.set( "next", items[ index + 1 ] );
        context.set( "previous", items[ index - 1 ] );
    }

    return context;
};



// :type, :handlers
// router.on( config.homepage, { query: onQuery, context: onContext } );
router.on( config.skylab.homeType, { query: onQuery, context: onContext } );
router.on( config.skylab.workType, { query: onQuery, context: onContext } );
router.on( config.skylab.playType, { query: onQuery, context: onContext } );



router.init();
