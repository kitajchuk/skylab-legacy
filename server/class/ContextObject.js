"use strict";



const config = require( "../../skylab.config" );



/**
 *
 * Template Context {object}.
 *
 */
class ContextObject {
    constructor ( page ) {
        this.site = null;
        this.navi = null;
        this.page = page;
        this.cache = config.env.production;
        this.error = null;
        this.timestamp = config.timestamp;
        this.item = null;
        this.items = null;
        this.stylesheet = config.static.css;
        this.javascript = config.static.js;
    }

    set ( prop, value ) {
        if ( typeof prop === "object" ) {
            for ( let i in prop ) {
                this[ i ] = prop[ i ];
            }

        } else {
            this[ prop ] = value;
        }
    }

    get ( prop ) {
        return this[ prop ];
    }

    getTemplate () {
        return `pages/${this.page}.html`;
    }

    getUrl ( item ) {
        return `/${item.type}/${item.uid}/`;
    }

    getMediaAspect ( image ) {
        return `${image.height / image.width * 100}%`;
    }

    getPageTitle () {
        const item = this.get( "item" );
        const title = this.get( "site" ).data.title;

        return (item ? item.getText( `${item.type}.title` ) + ` — ${title}` : title);
    }

    getPageImage () {
        const item = this.get( "item" );
        const appImage = this.get( "site" ).data.appImage;
        const pageImage = item ? item.getImage( `${item.type}.image` ) : "";

        return (pageImage ? pageImage.url : appImage);
    }
}



module.exports = ContextObject;
