"use strict";



const path = require( "path" );
const file = require( "./core/file" );
const config = require( "./core/config" );
const router = require( "./router" );



const canFeatures = function ( req ) {
    return (
        req.params.type === config.skylab.mainType &&
        !req.params.uid &&
        !req.query.category &&
        !req.query.status &&
        !req.query.color &&
        !req.query.material &&
        !req.query.space
    );
};



const canTileset = function ( req ) {
    return (req.query.color || req.query.material || req.query.space);
};



const getResults = function ( kind, value ) {
    return new Promise(( resolve, reject ) => {
        file.read( path.join( config.template.staticDir, "json", "imageprocess.json" ) ).then(( data ) => {
            const json = JSON.parse( String( data ) );

            resolve({
                results: json.filter(( result ) => {
                    return (result[ kind ].indexOf( value ) !== -1 );
                })
            });

        }).catch(( error ) => {
            reject( error );
        });
    });
};



const onQuery = function ( client, api, query, cache, req ) {
    let ret = query;

    if ( req.query.status ) {
        ret.push( client.Predicates.at( `my.${config.skylab.mainType}.status`, req.query.status ) );
        console.log( config.logger, `Querying by Status ${req.query.status}` );
    }

    if ( req.query.category ) {
        ret.push( client.Predicates.at( `my.${config.skylab.mainType}.categories.category`, req.query.category ) );
        console.log( config.logger, `Querying by Category ${req.query.category}` );
    }

    if ( req.query.color ) {
        ret = getResults( "colors", req.query.color );
        console.log( config.logger, `Querying by Color ${req.query.color}` );
    }

    if ( req.query.material || req.query.space ) {
        ret = getResults( "tags", req.query.material || req.query.space );
        console.log( config.logger, `Querying by Tag ${req.query.material || req.query.space}` );
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
        context.set( "features", context.get( "items" ).filter(( doc ) => {
            return (doc.getText( `${config.skylab.mainType}.type` ) === "Feature");
        }));
    }

    return context;
};



// :type, :handlers
router.on( config.homepage, { query: onQuery, context: onContext } );
router.on( config.skylab.mainType, { query: onQuery, context: onContext } );



router.init();
