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



// :req, :type, :uid, :callback
router.on( "api", "project", null, onQuery );
router.on( "page", "project", null, onQuery );



router.init();
