"use strict";



/**
 *
 * Adapter for Prismic.io
 * Every adapter must have a common ORM format exposed to the scaffold:
 * cache: { site: Object, navi: Object }
 * getApi: Function
 * getPage: Function
 * getSite: Function
 * getNavi: Function
 * getPreview: Function
 * getPartial: Function
 * getWebhook: Function
 *
 * Different Headless CMS will require slightly different internal approaches
 * Whatever means necessary is A-OK as long as the data resolves to the ORM format
 *
 *
 */
const path = require( "path" );
const prismic = require( "prismic.io" );
const cache = {
    api: null,
    site: null,
    navi: null
};
const core = {
    watch: require( "../core/watch" ),
    config: require( "../core/config" ),
    template: require( "../core/template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Handle API requests.
 *
 */
const getApi = function ( req, res, handle ) {
    return new Promise(( resolve, reject ) => {
        getDataForApi( req, handle ).then(( json ) => {
            const data = {};

            // Single document for /:type/:uid
            if ( req.params.uid ) {
                data.document = getDoc( req.params.uid, json );

            // All documents for /:type
            } else {
                data.documents = json;
            }

            // Render partial for ?format=html&template=foo
            if ( req.query.format === "html" ) {
                getPartial( req, data ).then(( html ) => {
                    resolve( html );
                });

            } else {
                resolve( data );
            }

        }).catch(( error ) => {
            // Resolve error as JSON result
            resolve( error );
        });
    });
};



/**
 *
 * Handle Page requests.
 *
 */
const getPage = function ( req, res, handle ) {
    return new Promise(( resolve, reject ) => {
        getDataForPage( req, handle ).then(( json ) => {
            resolve( json );

        }).catch(( error ) => {
            reject( error );
        });
    });
};



/**
 *
 * Handle preview URLs from Prismic for draft content.
 *
 */
const getPreview = function ( req, res ) {
    return new Promise(( resolve, reject ) => {
        const previewToken = req.query.token;
        const linkResolver = function ( doc ) {
            return `/${doc.type}/${doc.uid}/`;
        };

        prismic.api( core.config.api.access, null ).then(( api ) => {
            api.previewSession( previewToken, linkResolver, "/", ( error, redirectUrl ) => {
                res.cookie( prismic.previewCookie, previewToken, {
                    maxAge: 60 * 30 * 1000,
                    path: "/",
                    httpOnly: false
                });

                resolve( redirectUrl );
            });
        });
    });
};



/**
 *
 * Handle webhook POST URLs from Prismic for content changes.
 *
 */
const getWebhook = function ( req, res ) {

};



/**
 *
 * Handle partial rendering.
 *
 */
const getPartial = function ( req, data ) {
    return new Promise(( resolve, reject ) => {
        const partial = (req.query.template || req.params.type);
        const localObject = {
            context: new ContextObject( partial )
        };
        const template = path.join( core.config.template.partialsDir, `${partial}.html` );

        if ( data.document ) {
            localObject.context.set( "item", data.document );
        }

        if ( data.documents ) {
            localObject.context.set( "items", data.documents );
        }

        // Add `features` array to the context
        if ( req.params.type === core.config.skylab.mainType && !req.query.category && !req.query.status && !req.query.color ) {
            localObject.context.set( "features", data.documents.filter(( doc ) => {
                return (doc.getText( `${core.config.skylab.mainType}.type` ) === "Feature");
            }));
        }

        // Add `colors` array to the context
        if ( req.query.color ) {
            localObject.context.set( "colorset", data.documents );
        }

        core.template.render( template, localObject )
            .then(( html ) => {
                resolve( html );
            })
            .catch(( error ) => {
                reject( error );
            });
    });
};



/**
 *
 * Load the Site context model.
 *
 */
const getSite = function ( req ) {
    return new Promise(( resolve, reject ) => {
        prismic.api( core.config.api.access, null ).then(( api ) => {
            const form = api.form( core.config.skylab.mainForm ).pageSize( 100 ).ref( getRef( req, api ) );

            form.submit().then(( json ) => {
                const docs = {
                    [core.config.skylab.siteType]: json.results.find(( doc ) => {
                        return (doc.type === core.config.skylab.siteType);
                    }),
                    [core.config.skylab.mainType]: json.results.filter(( doc ) => {
                        return (doc.type === core.config.skylab.mainType);
                    })
                };
                const navi = {
                    items: []
                };
                const site = {
                    data: {}
                };
                const statuses = [];
                const categories = [];

                // Normalize filter criteria ( category, status etc... )
                docs[ core.config.skylab.mainType ].forEach(( doc ) => {
                    const cats = doc.getGroup( `${core.config.skylab.mainType}.categories` );
                    const status = doc.getText( `${core.config.skylab.mainType}.status` );

                    if ( status && statuses.indexOf( status ) === -1 ) {
                        statuses.push( status );
                    }

                    if ( cats ) {
                        cats.value.forEach(( cat ) => {
                            if ( categories.indexOf( cat.data.category.value ) === -1 ) {
                                categories.push( cat.data.category.value );
                            }
                        });
                    }
                });

                // Normalize site context
                for ( let i in docs.site.fragments ) {
                    if ( i !== core.config.skylab.naviFrag ) {
                        const key = i.replace( /^site\./, "" );

                        site.data[ key ] = docs.site.fragments[ i ].value || docs.site.fragments[ i ].url;
                    }
                }

                // Normalize navi context
                docs.site.getSliceZone( core.config.skylab.naviFrag ).value.forEach(( slice ) => {
                    let id = null;
                    let uid = null;
                    let type = null;
                    let slug = null;
                    const style = slice.value.value[ 0 ].data.style.value.toLowerCase();
                    const title = slice.value.value[ 0 ].data.name.value;

                    // Handle Document.link to a Page
                    if ( slice.value.value[ 0 ].data.page ) {
                        id = slice.value.value[ 0 ].data.page.value.document.id;
                        uid = slice.value.value[ 0 ].data.page.value.document.uid;
                        type = slice.value.value[ 0 ].data.page.value.document.type;
                        slug = uid;

                    // Handle `slug` manual entry
                    } else {
                        slug = slice.value.value[ 0 ].data.slug.value.replace( /\//g, "" );
                        id = slug;
                        uid = slug;
                        type = slug;
                    }

                    navi.items.push({
                        id: id,
                        uid: (slug === core.config.homepage ? slug : uid),
                        type: type,
                        slug: (slug === core.config.homepage ? "/" : `/${slug}/`),
                        title: title,
                        style: style
                    });
                });

                cache.api = api;
                cache.site = site;
                cache.navi = navi;
                cache.docs = docs;
                cache.statuses = statuses;
                cache.categories = categories;

                resolve();
            });
        });
    });
};



/**
 *
 * Mapping for `site.navi` links referencing `Page` documents
 *
 */
const getNavi = function ( type ) {
    let ret = false;

    cache.navi.items.forEach(( item ) => {
        if ( item.uid === type ) {
            ret = item;
        }
    });

    return ret;
};



/**
 *
 * Load data for API response. Resolve RAW from Service.
 *
 */
const getDataForApi = function ( req, handle ) {
    return new Promise(( resolve, reject ) => {
        const doQuery = function ( type ) {
            prismic.api( core.config.api.access, null ).then(( api ) => {
                const done = function ( json ) {
                    resolve( json.results );
                };
                const fail = function ( error ) {
                    resolve({
                        error: error
                    });
                };
                const form = getForm( req, api );
                let query = [];

                // query: type?
                query.push( prismic.Predicates.at( "document.type", type ) );

                // query: pubsub?
                if ( handle ) {
                    query = handle.handler( prismic, api, query, cache, req );
                }

                // query: promise?
                if ( query instanceof Promise ) {
                    query.then( done ).catch( fail );

                } else {
                    // query?
                    if ( query.length ) {
                        form.query( query );
                    }

                    // submit
                    form.submit().then( done ).catch( fail );
                }
            });
        };

        // if ( req.params.type === core.config.skylab.mainType ) {
            // console.log( `getApi::cache::${core.config.skylab.mainType}` );
            // resolve( cache.docs[ core.config.skylab.mainType ] );

        // } else {
            doQuery( req.params.type );
        // }
    });
};



/**
 *
 * Load data for Page response.
 *
 */
const getDataForPage = function ( req, handle ) {
    return new Promise(( resolve, reject ) => {
        const data = {
            item: null,
            items: null
        };
        const doQuery = function ( type ) {
            const done = function ( json ) {
                if ( !json.results.length ) {
                    // Static page with no CMS data attached to it...
                    if ( core.watch.cache.pages.indexOf( `${type}.html` ) !== -1 ) {
                        resolve( data );

                    } else {
                        reject( `Prismic has no data for the content-type "${type}".` );
                    }

                } else {
                    // uid
                    if ( req.params.uid || navi ) {
                        data.item = getDoc( (navi ? navi.uid : req.params.uid), json.results );

                        if ( !data.item ) {
                            reject( `The document with UID "${navi ? navi.uid : req.params.uid}" could not be found by Prismic.` );
                        }

                    } else {
                        data.items = json.results;
                    }

                    resolve( data );
                }
            };
            const fail = function ( error ) {
                reject( error );
            };
            const navi = getNavi( type );
            const form = getForm( req, cache.api );
            let query = [];

            // query: type?
            if ( navi ) {
                query.push( prismic.Predicates.at( "document.type", navi.type ) );
                query.push( prismic.Predicates.at( "document.id", navi.id ) );

            } else {
                query.push( prismic.Predicates.at( "document.type", type ) );
            }

            // query: pubsub?
            if ( handle ) {
                query = handle.handler( prismic, cache.api, query, cache, req );
            }

            // query: promise?
            if ( query instanceof Promise ) {
                query.then( done ).catch( fail );

            } else {
                // query?
                if ( query.length ) {
                    form.query( query );
                }

                // ordering?

                // submit
                form.submit().then( done ).catch( fail );
            }
        };

        getSite( req ).then(() => {
            const uid = req.params.uid;
            const type = req.params.type;

            if ( !type ) {
                resolve( data );

            // } else if ( type === core.config.skylab.mainType ) {
            //     if ( uid ) {
            //         data.item = getDoc( uid, cache.docs[ core.config.skylab.mainType ] );
            //
            //     } else {
            //         data.items = cache.docs[ core.config.skylab.mainType ];
            //     }
            //
            //     console.log( `getPage::cache::${core.config.skylab.mainType}` );
            //     resolve( data );

            } else {
                doQuery( type );
            }
        });
    });
};



/**
 *
 * Get valid `ref` for Prismic API data.
 *
 */
const getRef = function ( req, api ) {
    let ref = api.master();

    if ( req && req.cookies && req.cookies[ prismic.previewCookie ] ) {
        ref = req.cookies[ prismic.previewCookie ];
    }

    return ref;
};



/**
 *
 * Get one document from all documents.
 *
 */
const getDoc = function ( uid, documents ) {
    return documents.find(( doc ) => {
        return (doc.uid === uid);
    });
};



/**
 *
 * Get the stub of the search form.
 *
 */
const getForm = function ( req, api ) {
    return api.form( "everything" ).pageSize( 100 ).ref( getRef( req, api ) );
};



module.exports = {
    cache,
    getApi,
    getPage,
    getPreview,
    getWebhook
};
