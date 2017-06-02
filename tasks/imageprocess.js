"use strict";



const fs = require( "fs" );
const cli = require( "cli" );
const path = require( "path" );
const lager = require( "properjs-lager" );
const chroma = require( "chroma-js" );
const prismic = require( "prismic.io" );
const slacker = require( "properjs-slacker" );
const core = {
    config: require( "../skylab.config" )
};
const colorLibs = {
    default: require( "get-image-colors" )
};
const context = "skylab-imageprocess";
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
        const jsonPath = path.join( __dirname, "static", "json", "imageprocess.json" );
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
            fs.writeFile( jsonPath, JSON.stringify( results.processed, null, 4 ), "utf8", ( error ) => {
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
    });
};



const doImageProcess = function () {
    results = {
        raw: [],
        processed: []
    };
    message = [];
    token = cli.options.token;
    webhook = cli.options.webhook;
    channel = cli.options.channel;

    lager.info( `Connecting to Prismic.io API...` );

    prismic.api( core.config.api.access, null ).then(( api ) => {
        lager.info( `Loading all documents for content-type ${core.config.skylab.mainType}...` );

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
                        pushFeature( doc, feature );
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

            lager.info( `Image processing for ${total} images.` );
                message.push( `Image processing for ${total} images.` );

            processResult( results.raw.pop() );
        });
    });
};



cli.setApp( context, "0.1.0" );



cli.parse({
    token: ["token", "The Slack app integration token.", "string", ""],
    webhook: ["webhook", "The Slack app integration webhook URL.", "string", ""],
    channel: ["channel", "The Slack channel to ping.", "string", ""]
});



if ( cli.options.token && cli.options.webhook && cli.options.channel ) {
    doImageProcess();

} else {
    lager.error( "Requires Slack token, webhook URL, channel to ping." );

    process.exit( 1 );
}
