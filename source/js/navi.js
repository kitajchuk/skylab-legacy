import * as core from "./core";


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
        this.trigger = core.dom.body.find( ".js-controller--navi" );
        this.timing = core.util.getElementDuration( this.element[ 0 ] );
        this.timeout = null;
        this.bind();
    },


    bind () {
        this.trigger.on( "click", () => {
            this.toggle();
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


    clearOut () {
        if ( this.timeout ) {
            clearTimeout( this.timeout );
            this.timeout = null;
        }
    },


    activate ( view ) {
        this.items.removeClass( "is-active" );
        this.items.filter( `.js-navi--${view}` ).addClass( "is-active" );
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
