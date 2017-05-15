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
    default: require( "get-image-colors" ),
    vibrant: require( "node-vibrant" )
};



const getQueryColors = function ( colors ) {
    const queryColors = [];

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

        if ( queryColors.indexOf( closestColor.color ) === -1 ) {
            queryColors.push( closestColor.color );
        }
    });

    console.log( core.config.logger, "Query Matches for Image Colorset", queryColors );

    return queryColors;
};



const getImageColors = function ( image ) {
    return new Promise(( resolve, reject ) => {
        // Vibrant.js
        if ( cli.options.lib === "vibrant" ) {
            colorLibs.vibrant.from( image.url ).getPalette(( error, palette ) => {
                const colors = [];

                // Convert to chroma-js instances
                for ( const swatch in palette ) {
                    if ( palette[ swatch ] ) {
                        colors.push( chroma( palette[ swatch ].getHex() ) );
                    }
                }

                resolve( colors );
            });

        // Default
        } else {
            colorLibs.default( image.url ).then(( colors ) => {
                // Already chroma-js instances
                resolve( colors );
            });
        }
    });
};



const doColorProcess = function ( token, webhook, channel ) {
    console.log( core.config.logger, `Connecting to Prismic.io API...` );

    prismic.api( core.config.api.access, null ).then(( api ) => {
        const message = [];
        const context = "colorprocess-task";

        console.log( core.config.logger, `Loading all documents for content-type ${core.config.skylab.mainType}...` );

        api.query( prismic.Predicates.at( "document.type", core.config.skylab.mainType ) ).then(( json ) => {
            let images = [];
            const results = [];

            // Iterate project documents and get ALL associated images
            json.results.forEach(( doc ) => {
                const image = doc.getImage( `${core.config.skylab.mainType}.image` );
                const slices = doc.getSliceZone( `${core.config.skylab.mainType}.slices` );

                // Main index Image
                if ( image ) {
                    images.push({
                        url: image.url,
                        doc: `/${doc.type}/${doc.uid}/`,
                        width: image.main.width,
                        height: image.main.height
                    });
                }

                // Content Images
                if ( slices ) {
                    slices.value.forEach(( slice ) => {
                        // console.log( slice );

                        if ( slice.sliceType === "image" ) {
                            images.push({
                                url: slice.value.url,
                                doc: `/${doc.type}/${doc.uid}/`,
                                width: slice.value.main.width,
                                height: slice.value.main.height
                            });
                        }
                    });
                }
            });

            console.log( core.config.logger, `Image Color Processing for ${images.length} Images` );
                message.push( `Image Color Processing for ${images.length} Images` );


            // Splice small Array for test runs...
            // images = images.slice( 0, 6 );
            // console.log( core.config.logger, `Splicing ${images.length} Images for Color Processing` );
            //     message.push( `Splicing ${images.length} Images for Color Processing` );

            const processImage = function ( image ) {
                getImageColors( image ).then(( colors ) => {
                    const result = {
                        query: getQueryColors( colors ),
                        image: image,
                        colors: colors.map(( color ) => {
                            return color.hex();
                        })
                    };

                    console.log( core.config.logger, "Processed Image Colors", result.colors );
                        message.push( `Processed Image Colors ${result.colors.join( ", " )} — ${image.url}` );
                    console.log( "" );

                    results.push( result );

                    if ( !images.length ) {
                        console.log( core.config.logger, "Image Color Processing Done" );
                            message.push( "Image Color Processing Done" );

                        core.file.write( path.join( core.config.template.staticDir, "json", `colorprocess--${cli.options.lib}.json` ), JSON.stringify( results, null, 4 ) ).then(() => {
                            console.log( core.config.logger, "Image Color Date Saved" );
                                message.push( "Image Color Data Saved" );

                            slackbot.ping({
                                token,
                                webhook,
                                channel,
                                message,
                                context
                            });
                        });

                    } else {
                        processImage( images.pop() );
                    }
                });
            };

            processImage( images.pop() );
        });
    });
};



cli.setApp( "colorprocess", "0.1.0" );



cli.parse({
    lib: ["lib", "The library to use for image color extraction.", "string", ""],
    token: ["token", "The Slack app integration token.", "string", ""],
    webhook: ["webhook", "The Slack app integration webhook URL.", "string", ""],
    channel: ["channel", "The Slack channel to ping.", "string", ""]
});


if ( cli.options.token && cli.options.webhook && cli.options.channel ) {
    doColorProcess(
        cli.options.token,
        cli.options.webhook,
        cli.options.channel
    );

} else {
    console.log( "Requires Slack token, webhook URL and channel to ping." );

    process.exit( 1 );
}
