"use strict";



const fs = require( "fs" );
const yargs = require( "yargs" );
const path = require( "path" );
const lager = require( "properjs-lager" );
// const chroma = require( "chroma-js" );
const prismic = require( "prismic.io" );
const slacker = require( "properjs-slacker" );
const core = {
    config: require( "../skylab.config" )
};
// const colorLibs = {
//     default: require( "get-image-colors" )
// };
const context = "skylab-imageprocess";
const staticJSONPath = path.join( __dirname, "../static/json/imageprocess.json" );
let staticJSONData = null;
let token = null;
let webhook = null;
let channel = null;
let total = null;
let message = [];
let results = {
    raw: [],
    processed: []
};



const getQueryColors = function ( colors ) {
    const queryColors = {
        colors: [],
        deltas: []
    };

    colors.forEach(( color ) => {
        let closestColor = {
            diff: 1000000,
            color: null
        };

        core.config.skylab.colors.forEach(( coreColor ) => {
            // const distance = chroma.distance( color.hex(), chroma( coreColor.query ).hex() );
            const deltaE = chroma.deltaE( color.hex(), chroma( coreColor.query ).hex() );

            if ( deltaE < closestColor.diff ) {
                closestColor.diff = deltaE;
                closestColor.color = coreColor.query;
            }
        });

        if ( queryColors.colors.indexOf( closestColor.color ) === -1 ) {
            queryColors.colors.push( closestColor.color );
            queryColors.deltas.push( closestColor.diff );
        }
    });

    colors = null;

    return queryColors;
};



const getImageColors = function ( result ) {
    return new Promise(( resolve, reject ) => {
        colorLibs.default( result.image.url ).then(( colors ) => {
            // Already chroma-js instances
            resolve( colors );
        });
    });
};



const getImageTags = function ( tagString ) {
    return (typeof tagString === "string" ? tagString.replace( /\s/g, "" ).split( "," ) : []);
};



const pushDiptych = function ( doc, slice ) {
    const group = slice.value.toArray()[ 0 ];
    const left = group.getImage( "left" );
    const right = group.getImage( "right" );

    if ( left ) {
        pushResult( doc, left );
    }

    if ( right ) {
        pushResult( doc, right );
    }
};



const pushTextImage = function ( doc, slice ) {
    const group = slice.value.toArray()[ 0 ];
    const image = group.getImage( "image" );

    if ( image ) {
        pushResult( doc, image );
    }
};



const pushParallax = function ( doc, slice ) {
    const group = slice.value.toArray()[ 0 ];
    const image = group.getImage( "image" );

    if ( image ) {
        pushResult( doc, image );
    }
};



const pushFeature = function ( doc, feature ) {
    feature = feature.toArray()[ 0 ];

    if ( feature.getImage( "image" ) ) {
        pushResult( doc, feature.getImage( "image" ) );
    }
};



const pushResult = function ( doc, image ) {
    // Make sure we don't have this image in raw results!
    const found = results.raw.find(( result ) => {
        return (result.image.url === image.url);

    // ALSO make sure we don't have this image in saved results
    // This is the "tree-shaking" so we don't process images that are already in our JSON cache.
    // Ideally this should reduce greatly how many images are processed at once after the first run.
    }) || staticJSONData.find(( result ) => {
        return (result.image.url === image.url);
    });

    if ( !found ) {
        let cats = doc.getGroup( "project.categories" );
            cats = cats ? cats.toArray().map(( cat ) => cat.data.category.value ) : [];

        results.raw.push({
            image: {
                url: image.url,
                doc: `/${core.config.skylab.workType}/${doc.uid}/`,
                width: image.main.width,
                height: image.main.height
            },
            doc: {
                title: doc.getText( "project.title" ),
                city: doc.getText( "project.city" ),
                state: doc.getText( "project.state" ),
                categories: cats
            },
            tags: getImageTags( image.main.alt ),
            // color: "#000000",
            // colors: []
        });
    }
};



const processResult = function ( result ) {
    // getImageColors( result ).then(( colors ) => {
        const progress = (total - results.raw.length) / total;
        const jsonPath = path.join( __dirname, "../", "static", "json", "imageprocess.json" );
        // const colorInfo = getQueryColors( colors );

        // result.colors = colorInfo.colors;
        // result.color = colors[ 0 ].hex();
        // result.deltas = colorInfo.deltas;

        results.processed.push( result );

        // Output progress bar to console ?

        // Log but don't push slack entry as it is likely too large a message that way...
        lager.info( `Image processed: Tags: ${result.tags.join( ", " )}` );
        // lager.info( `Image processed / Tags ${result.tags.join( ", " )} / Colors ${result.colors.join( ", " )}` );
            // message.push( `Image processed / Tags ${result.tags.join( ", " )} / Colors ${result.colors.join( ", " )}` );

        if ( !results.raw.length ) {
            fs.writeFile( jsonPath, JSON.stringify( results.processed ), "utf8", ( error ) => {
                // Slack Error so we are aware ;-P
                if ( error ) {
                    message = [error];

                } else {
                    message.push( `Image processing JSON saved to ${jsonPath}.` );
                }

                slacker( token, webhook, channel, context, message );
            });

        } else {
            processResult( results.raw.pop() );
        }
    // });
};



const doImageProcess = function () {
    results = {
        raw: [],
        processed: []
    };
    message = [];
    token = yargs.argv.token;
    webhook = yargs.argv.webhook;
    channel = yargs.argv.channel;
    staticJSONData = JSON.parse( String( fs.readFileSync( staticJSONPath ) ) );

    slacker( token, webhook, channel, context, [
        `Initializing ${context}`
    ]);

    lager.info( `Connecting to Prismic.io API...` );

    prismic.api( core.config.api.access, null ).then(( api ) => {
        lager.info( `Loading all documents for content-type ${core.config.skylab.mainType}...` );

        const getDocs = ( page ) => {
            api.form( core.config.skylab.mainType )
                .page( page )
                .pageSize( 100 )
                .ref( api.master() )
                .query( [prismic.Predicates.at( "document.type", core.config.skylab.mainType )] )
                .submit().then( gotDocs );
        };
        const gotDocs = ( json ) => {
            // Iterate project documents and get ALL associated images
            json.results.forEach(( doc ) => {
                const image = doc.getImage( `${core.config.skylab.mainType}.image` );
                const slices = doc.getSliceZone( `${core.config.skylab.mainType}.slices` );

                // Content Images
                if ( slices ) {
                    slices.value.forEach(( slice ) => {
                        // image?
                        if ( slice.sliceType === "image" ) {
                            pushResult( doc, slice.value );
                        }

                        // diptych?
                        if ( slice.sliceType === "diptych" ) {
                            pushDiptych( doc, slice );
                        }

                        // textImage?
                        if ( slice.sliceType === "textImage" ) {
                            pushTextImage( doc, slice );
                        }

                        // parallax?
                        if ( slice.sliceType === "parallax" ) {
                            pushParallax( doc, slice );
                        }
                    });
                }

                doc = null;
            });

            if ( json.next_page ) {
                getDocs( (json.page + 1) );

            } else {
                lager.info( `Image processing for ${results.raw.length} images.` );
                    message.push( `Image processing for ${results.raw.length} images.` );

                if ( results.raw.length > 0 ) {
                    processResult( results.raw.pop() );
                }
            }
        };

        getDocs( 1 );
    });
};



if ( yargs.argv.token && yargs.argv.webhook && yargs.argv.channel ) {
    doImageProcess();

} else {
    lager.error( "Requires Slack token, webhook URL, channel to ping." );

    process.exit( 1 );
}
