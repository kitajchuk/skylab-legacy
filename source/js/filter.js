import * as core from "./core";
import paramalama from "paramalama";
import $ from "properjs-hobo";
import navi from "./navi";


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
        this.timing = core.util.getTransitionDuration( this.element[ 0 ] );
        this.timeout = null;

        this.bind();
        this.query();
    },


    query () {
        this.params = paramalama( window.location.search );

        for ( const prop in this.params ) {
            if ( this.params.hasOwnProperty( prop ) ) {
                const option = this.options.filter( `.js-filter-${prop}[data-value='${this.params[ prop ]}']` );

                if ( option.length ) {
                    this.activate( option );

                } else {
                    this.deactivate();
                }
            }
        }
    },


    deactivate () {
        this.options.removeClass( "is-active" );
        this.label.addClass( "is-empty" );
        this.label[ 0 ].innerHTML = "Filter";
    },


    activate ( option ) {
        this.options.removeClass( "is-active" );
        option.addClass( "is-active" );

        this.label.removeClass( "is-empty" );
        this.label[ 0 ].innerHTML = option.data().value;
    },


    bind () {
        this.trigger.on( "click", () => {
            this.toggle();
        });

        this.options.on( "click", ( e ) => {
            this.activate( $( e.target ) );
        });
    },


    open () {
        this.clearOut();
        this.isOpen = true;
        this.element.addClass( "is-active" );
        core.dom.html.addClass( "is-filter-open" );

        navi.close();
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
