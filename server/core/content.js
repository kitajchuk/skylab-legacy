const path = require( "path" );
const core = {
    watch: require( "./watch" ),
    query: require( "./query" ),
    config: require( "./config" ),
    template: require( "./template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Load the data for the given request.
 *
 */
const getPage = function ( req, res, handle ) {
    return new Promise(( resolve, reject ) => {
        const page = (req.params.type ? req.params.type : core.config.homepage);
        const context = new ContextObject( page );
        const check = function ( data ) {
            // 0.0 => Missing template file
            // 0.1 => Single ContentItem
            // 0.2 => Multiple ContentItems(s)
            if ( core.watch.cache.pages.indexOf( `${page}.html` ) === -1 ) {
                const file = path.join( core.config.template.pagesDir, `${page}.html` );

                fail( `The template file for this path is missing at "${file}".` );

            } else if ( data.item ) {
                context.set( "item", data.item );

            } else if ( data.items ) {
                context.set( "items", data.items );
            }

            // Add `colors` array to the context
            if ( req.query.color ) {
                console.log( "colorset" );
                context.set( "colorset", data.items );
            }

            done();
        };
        const fail = function ( error ) {
            context.set({
                page: core.config.notfound,
                error: error
            });

            done();
        };
        const done = function () {
            context.set({
                navi: core.query.cache.navi,
                site: core.query.cache.site,
                statuses: core.query.cache.statuses,
                categories: core.query.cache.categories,
                colors: core.config.skylab.colors
            });

            resolve(( callback ) => {
                render( callback );
            });
        };
        const render = function ( callback ) {
            const localObject = {
                context: context
            };

            core.template.render( core.config.template.layout, localObject ).then(( html ) => {
                callback( (context.page === core.config.notfound ? 404 : 200), html );

            }).catch(( error ) => {
                console.log( core.config.logger, error );
            });
        };

        core.query.getPage( req, res, handle ).then( check ).catch( fail );
    });
};


module.exports = {
    getPage
};
