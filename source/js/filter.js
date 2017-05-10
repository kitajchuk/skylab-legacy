import * as core from "./core";


/**
 *
 * @public
 * @namespace filter
 * @description Performs the branded load-in screen sequence.
 * @memberof menus
 *
 */
const filter = {
    /**
     *
     * @public
     * @method init
     * @memberof menus.filter
     * @description Method initializes filter node in DOM.
     *
     */
    init () {
        this.isOpen = false;
        this.element = core.dom.filter;
        this.trigger = core.dom.body.find( ".js-controller--filter" );
        this.timing = core.util.getTransitionDuration( this.element[ 0 ] );
        this.timeout = null;
        this.bind();
    },


    bind () {
        this.trigger.on( "click", () => {
            this.toggle();
        });
    },


    open () {
        this.clearOut();
        this.isOpen = true;
        this.element.addClass( "is-active" );
        core.dom.html.addClass( "is-filter-open" );
    },


    close () {
        this.clearOut();
        this.isOpen = false;
        this.element.addClass( "is-closing" ).removeClass( "is-active" );
        core.dom.html.removeClass( "is-filter-open" );

        this.timeout = setTimeout( () => this.element.removeClass( "is-closing" ), this.timing );
    },


    toggle () {
        if ( this.isOpen ) {
            this.close();

        } else {
            this.open();
        }
    },


    clearOut () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
            this.timeout = null;
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default filter;
