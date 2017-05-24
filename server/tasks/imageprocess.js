"use strict";



const path = require( "path" );
const prismic = require( "prismic.io" );
const core = {
    file: require( "../core/file" ),
    config: require( "../core/config" )
};
const slackbot = require( "./slackbot" );
const cli = require( "cli" );
const chroma = require( "chroma-js" );
const colorLibs = {
    default: require( "get-image-colors" )
};
const context = "imageprocess-task";
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
    const background = group.getImage( "background" );

    if ( image ) {
        pushResult( doc, image );
    }

    if ( background ) {
        pushResult( doc, background );
    }
};



const pushResult = function ( doc, image ) {
    const found = results.raw.find(( result ) => {
        return (result.image.url === image.url);
    });

    if ( !found ) {
        results.raw.push({
            image: {
                url: image.url,
                doc: `/${doc.type}/${doc.uid}/`,
                width: image.main.width,
                height: image.main.height
            },
            tags: getImageTags( image.main.alt ),
            color: "#000000",
            colors: []
        });
    }
};



const processResult = function ( result ) {
    getImageColors( result ).then(( colors ) => {
        const progress = (total - results.raw.length) / total;
        const jsonPath = path.join( core.config.template.staticDir, "json", "imageprocess.json" );
        const colorInfo = getQueryColors( colors );

        result.colors = colorInfo.colors;
        result.color = colors[ 0 ].hex();
        result.deltas = colorInfo.deltas;

        results.processed.push( result );

        // Output progress bar to console
        cli.progress( progress );

        // Push slack entry
        message.push( `Image processed / Tags ${result.tags.join( ", " )} / Colors ${result.colors.join( ", " )}` );

        if ( !results.raw.length ) {
            core.file.write( jsonPath, JSON.stringify( results.processed, null, 4 ) ).then(() => {
                message.push( `Image processing JSON saved to ${jsonPath}.` );

                slackbot.ping({
                    token,
                    webhook,
                    channel,
                    message,
                    context
                });
            });

        } else {
            processResult( results.raw.pop() );
        }
    });
};



const doColorProcess = function () {
    results = {
        raw: [],
        processed: []
    };
    message = [];
    token = cli.options.token;
    webhook = cli.options.webhook;
    channel = cli.options.channel;

    console.log( core.config.logger, `Connecting to Prismic.io API...` );

    prismic.api( core.config.api.access, null ).then(( api ) => {
        console.log( core.config.logger, `Loading all documents for content-type ${core.config.skylab.mainType}...` );

        api.form( core.config.skylab.mainForm )
            .pageSize( 100 )
            .ref( api.master() )
            .query( [prismic.Predicates.at( "document.type", core.config.skylab.mainType )] )
            .submit().then(( json ) => {
                // Iterate project documents and get ALL associated images
                json.results.forEach(( doc ) => {
                    const image = doc.getImage( `${core.config.skylab.mainType}.image` );
                    const slices = doc.getSliceZone( `${core.config.skylab.mainType}.slices` );
                    let feature = doc.getGroup( `${core.config.skylab.mainType}.feature` );

                    // Main Image
                    if ( image ) {
                        pushResult( doc, image );
                    }

                    // Feature Images
                    if ( feature ) {
                        feature = feature.toArray()[ 0 ];

                        if ( feature.getImage( "image" ) ) {
                            pushResult( doc, feature.getImage( "image" ) );
                        }
                    }

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
                });

            total = results.raw.length;

            console.log( core.config.logger, `Image processing for ${total} images.` );
                message.push( `Image processing for ${total} images.` );

            processResult( results.raw.pop() );
        });
    });
};



cli.setApp( "colorprocess", "0.1.0" );



cli.parse({
    token: ["token", "The Slack app integration token.", "string", ""],
    webhook: ["webhook", "The Slack app integration webhook URL.", "string", ""],
    channel: ["channel", "The Slack channel to ping.", "string", ""]
});


if ( cli.options.token && cli.options.webhook && cli.options.channel ) {
    doColorProcess();

} else {
    console.log( "Requires Slack token, webhook URL and channel to ping." );

    process.exit( 1 );
}
