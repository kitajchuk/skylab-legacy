import * as core from "./core";
import paramalama from "paramalama";
import $ from "properjs-hobo";
// import navi from "./navi";


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
        this.options = this.element.find( ".js-filter-option" );
        this.label = this.element.find( ".js-filter-label" );
        this.trigger = core.dom.body.find( ".js-controller--filter" );
        this.timing = core.util.getElementDuration( this.element[ 0 ] );
        this.timeout = null;
        this.screen = $( "<div />" ).addClass( "filter-screen screen is-active" );
        this.labelText = "Filter";
        this.skipLabel = "All";

        this.bind();
        this.query();
    },


    query () {
        this.params = paramalama( window.location.search );

        this.deactivate();

        for ( const prop in this.params ) {
            if ( this.params.hasOwnProperty( prop ) ) {
                const option = this.options.filter( `.js-filter-${prop}[data-value='${this.params[ prop ]}']` );

                if ( option.length ) {
                    this.activate( option );
                }
            }
        }
    },


    deactivate () {
        this.options.removeClass( "is-active" );
        this.label.addClass( "is-empty" );
        this.label[ 0 ].innerHTML = this.labelText;
    },


    activate ( option ) {
        const value = option.data().value;

        option.addClass( "is-active" );

        if ( value !== this.skipLabel ) {
            this.label.removeClass( "is-empty" );
            this.label[ 0 ].innerHTML = value;
        }
    },


    bind () {
        this.trigger.on( "click", () => {
            this.toggle();
        });

        this.screen.on( "click", () => {
            this.toggle();
        });
    },


    open () {
        return new Promise(( resolve ) => {
            this.clearOut();
            this.isOpen = true;
            this.element.addClass( "is-active" );
            core.dom.html.addClass( "is-filter-open" );
            core.dom.body.append( this.screen );

            setTimeout( () => resolve(), this.timing );
        });
    },


    close () {
        return new Promise(( resolve ) => {
            this.clearOut();
            this.isOpen = false;
            this.element.addClass( "is-closing" ).removeClass( "is-active" );
            core.dom.html.removeClass( "is-filter-open" );
            this.screen.detach();

            this.timeout = setTimeout( () => {
                this.element.removeClass( "is-closing" );
                resolve();

            }, this.timing );
        });
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
