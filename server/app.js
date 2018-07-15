"use strict";



const fs = require( "fs" );
const path = require( "path" );
const config = require( "../skylab.config" );
const router = require( "./router" );
const lager = require( "properjs-lager" );
const request = require( "request" );
const imageJSON = `${config.aws.cdn}/json/imageprocess.json`;



const isIndex = ( req ) => {
    return (req.params.type === config.skylab.indexType);
};



const isWork = ( req ) => {
    return (
        req.params.type === config.skylab.workType &&
        !req.query.tag &&
        !req.query.category &&
        !req.query.image &&
        !req.query.color
    );
};



const canFeatures = ( req ) => {
    return (req.params.type === config.homepage);
};



const canTileset = ( req ) => {
    return (
        req.query.color ||
        req.query.image ||
        isIndex( req )
    );
};



const canDetail = ( req ) => {
    return (req.params.uid);
};



const getResults = ( kind, value ) => {
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
                    const regex = new RegExp( value.toLowerCase(), "gi" );

                    return regex.test( result[ kind ].join( "" ).toLowerCase() );
                });

                resolve({
                    results: results
                });
            }
        });
    });
};



const getMapped = ( items ) => {
    return items.map(( item ) => {
        const image = item.getImage( `${config.skylab.mainType}.image` );

        return {
            image: {
                url: image.main.url,
                doc: `/${config.skylab.workType}/${item.uid}/`,
                width: image.main.width,
                height: image.main.height
            },
            doc: {
                title: item.getText( `${config.skylab.mainType}.title` ),
                year: item.getText( `${config.skylab.mainType}.year` ),
                city: item.getText( `${config.skylab.mainType}.city` ),
                state: item.getText( `${config.skylab.mainType}.state` ),
                categories: []
            },
            color: "#111"
        };
    });
};



const getNotHidden = ( items ) => {
    return items.filter(( doc ) => {
        const type = doc.getText( `${config.skylab.mainType}.type` ) || doc.getText( `${config.skylab.blogType}.type` );

        return (type !== "Hidden");
    });
};



const onQuery = ( client, api, query, cache, req ) => {
    let ret = query;

    if ( req.query.tag ) {
        ret.push( client.Predicates.at( `document.tags`, req.query.tag ) );
        lager.info( `Querying by Tag ${req.query.tag}` );
    }

    if ( req.query.category ) {
        ret.push( client.Predicates.at( `my.${req.params.type === config.skylab.workType ? config.skylab.mainType : config.skylab.blogType}.categories.category`, req.query.category ) );
        lager.info( `Querying by Category ${req.query.category}` );
    }

    if ( req.query.color || req.query.image ) {
        ret = getResults( "tags", req.query.color || req.query.image );
        lager.info( `Querying by Tag ${req.query.color || req.query.image}` );
    }

    return ret;
};



const onContext = ( context, cache, req ) => {
    if ( isIndex( req ) ) {
        context.set( "items", getMapped( getNotHidden( context.get( "items" ) ) ) );
        lager.info( `Mapping ${req.params.type} to imageprocess JSON format...` );
    }

    if ( isWork( req ) ) {
        context.set( "items", getNotHidden( context.get( "items" ) ) );
        lager.info( `Removing hidden documents from the items...` );
    }

    // Add `tileset` array to the context for filter criteria
    if ( canTileset( req ) ) {
        context.set( "tileset", context.get( "items" ) );
    }

    // Add `features` array to the context
    if ( canFeatures( req ) ) {
        context.set( "features", context.get( "items" ).filter(( doc ) => {
            const type = doc.getText( `${config.skylab.mainType}.type` ) || doc.getText( `${config.skylab.blogType}.type` );

            return (type === "Feature");

        }).sort(( docA, docB ) => {
            let ret = 0;
            let dateA = docA.getDate( `${config.skylab.mainType}.date` ) || docA.getDate( `${config.skylab.blogType}.date` );
            let dateB = docB.getDate( `${config.skylab.mainType}.date` ) || docB.getDate( `${config.skylab.blogType}.date` );

            // Don't sort null values
            if ( dateA === null && dateB === null ) {
                ret = 0;

            // Sorts B above A
            } else if ( dateA === null ) {
                ret = 1;

            // Sorts A above B
            } else if ( dateB === null ) {
                ret = -1;

            } else {
                dateA = new Date( dateA );
                dateB = new Date( dateB );

                ret = (dateA.getTime() < dateB.getTime() ? 1 : -1);
            }

            return ret;

        }));
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



const onOrderings = ( client, api, form, cache, req ) => {
    form.orderings( `[my.${config.skylab.mainType}.date desc]` );
};



// :type, :handlers
router.on( config.skylab.homeType, { query: onQuery, context: onContext } );
router.on( config.skylab.workType, { query: onQuery, context: onContext } );
router.on( config.skylab.playType, { query: onQuery, context: onContext } );
router.on( config.skylab.indexType, { query: onQuery, context: onContext, orderings: onOrderings } );



router.init();
