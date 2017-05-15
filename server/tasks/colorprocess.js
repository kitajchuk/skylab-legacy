"use strict";



const path = require( "path" );
const prismic = require( "prismic.io" );
const core = {
    file: require( "../core/file" ),
    config: require( "../core/config" )
};
const getColors = require( "get-image-colors" );
const chroma = require( "chroma-js" );
const slackbot = require( "./slackbot" );
const cli = require( "cli" );



const getQueryColors = function ( colors ) {
    const queryColors = [];
    const colorThreshold = 50;

    colors.forEach(( color ) => {
        core.config.skylab.colors.forEach(( coreColor ) => {
            const distance = chroma.distance( color.hex(), chroma( coreColor.query ).hex() );
            const deltaE = chroma.deltaE( color.hex(), chroma( coreColor.query ).hex() );

            if ( deltaE <= colorThreshold && queryColors.indexOf( coreColor.query ) === -1 ) {
                queryColors.push( coreColor.query );
            }
        });
    });

    console.log( core.config.logger, "Query Matches for Image Colorset", queryColors );

    return queryColors;
};



const doColorProcess = function ( token, webhook, channel ) {
    prismic.api( core.config.api.access, null ).then(( api ) => {
        const message = [];
        const context = "colorprocess-task";

        //console.log( api );
        api.query( prismic.Predicates.at( "document.type", core.config.skylab.mainType ) ).then(( json ) => {
            //console.log( json );
            let images = [];
            const results = [];

            // Iterate project documents and get ALL associated images
            json.results.forEach(( doc ) => {
                const slices = doc.getSliceZone( `${core.config.skylab.mainType}.slices` );

                if ( slices ) {
                    slices.value.forEach(( slice ) => {
                        if ( slice.sliceType === "image" ) {
                            images.push({
                                url: slice.value.url,
                                doc: `/${doc.type}/${doc.uid}/`
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


            // Iterate all associated images and get color sources
            const getImageColors = function ( image ) {
                getColors( image.url ).then(( colors ) => {
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

                        core.file.write( path.join( core.config.skylab.cacheDir, "colorprocess.json" ), JSON.stringify( results, null, 4 ) ).then(() => {
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
                        getImageColors( images.pop() );
                    }
                });
            };

            getImageColors( images.pop() );
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
    doColorProcess(
        cli.options.token,
        cli.options.webhook,
        cli.options.channel
    );

} else {
    console.log( "Requires Slack token, webhook URL and channel to ping." );

    process.exit( 1 );
}
