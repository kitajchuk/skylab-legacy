"use strict";



const path = require( "path" );
const file = require( "./core/file" );
const config = require( "./core/config" );
const router = require( "./router" );



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
        ret = new Promise(( resolve, reject ) => {
            file.read( path.join( config.skylab.cacheDir, "colorprocess.json" ) ).then(( data ) => {
                const json = JSON.parse( String( data ) );

                resolve({
                    results: json.filter(( color ) => {
                        return (color.query.indexOf( req.query.color ) !== -1 );
                    })
                });

            }).catch(( error ) => {
                reject( error );
            });
        });

        console.log( config.logger, `Querying by Color ${req.query.color}` );
    }

    return ret;
};



const onContext = function ( context, cache, req ) {
    // Add `colors` array to the context
    if ( req.query.color ) {
        context.set( "colorset", context.get( "items" ) );
    }

    // Add `features` array to the context
    if ( req.params.type === config.skylab.mainType && !req.params.uid && !req.query.category && !req.query.status && !req.query.color ) {
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
