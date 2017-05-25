import * as core from "./core";
import scroll2 from "properjs-scroll2";
import filter from "./filter";
import router from "./router";


/**
 *
 * @public
 * @namespace navi
 * @description Performs the branded load-in screen sequence.
 * @memberof menus
 *
 */
const navi = {
    /**
     *
     * @public
     * @method init
     * @memberof menus.navi
     * @description Method initializes navi node in DOM.
     *
     */
    init () {
        this.isOpen = false;
        this.element = core.dom.navi;
        this.items = this.element.find( ".js-navi-a" );
        this.home = this.items.filter( ".js-navi--home" );
        this.trigger = core.dom.body.find( ".js-controller--navi" );
        this.timing = core.util.getElementDuration( this.element[ 0 ] );
        this.timeout = null;
        this.isHome = false;
        this.bind();
    },


    bind () {
        this.trigger.on( "click", () => {
            this.toggle();
        });

        this.element.on( "click", ( e ) => {
            if ( !/js-navi-a/.test( e.target.className ) ) {
                this.close();
            }
        });

        this.home.on( "click", () => {
            if ( router.isHomepage() && !this.isHomepage() ) {
                this.homeScroll();
                this.homeClass( true );
            }
        });
    },


    open () {
        if ( !this.isOpen ) {
            this.clearOut();
            this.isOpen = true;
            this.element.addClass( "is-active" );
            core.dom.html.addClass( "is-navi-open" );
        }
    },


    close () {
        if ( this.isOpen ) {
            this.clearOut();
            this.isOpen = false;
            this.element.addClass( "is-closing" ).removeClass( "is-active is-special" );
            core.dom.html.removeClass( "is-navi-open" );

            this.timeout = setTimeout( () => this.element.removeClass( "is-closing" ), this.timing );
        }
    },


    closeSpecial () {
        if ( this.isOpen ) {
            this.clearOut();
            this.isOpen = false;
            this.element.addClass( "is-special" );
            core.dom.html.removeClass( "is-navi-open" );

            this.timeout = setTimeout( () => this.element.removeClass( "is-active is-special" ), this.timing );
        }
    },


    clearOut () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
            this.timeout = null;
        }
    },


    activate ( view ) {
        this.items.removeClass( "is-active" );

        if ( view !== core.config.homepage ) {
            this.items.filter( `.js-navi--${view}` ).addClass( "is-active" );
        }
    },


    isHomepage () {
        return this.isHome;
    },


    homeScroll () {
        const target = core.dom.main.find( ".js-home--target" );

        filter.open().then(() => {
            scroll2({
                y: target[ 0 ].offsetTop,
                ease: core.config.defaultEasing,
                duration: 600
            });
        });
    },


    homeClass ( bool ) {
        if ( bool ) {
            this.isHome = true;
            this.items.removeClass( "is-active" );
            this.home.addClass( "is-active" );

        } else {
            this.isHome = false;
            this.home.removeClass( "is-active" );
        }
    },


    toggle () {
        if ( this.isOpen ) {
            this.close();

        } else {
            this.open();
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default navi;
