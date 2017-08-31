import * as core from "./core";
import paramalama from "paramalama";
import $ from "properjs-hobo";
import router from "./router";
import View from "./class/View";


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
        this.timing = core.util.getElementDuration( this.element[ 0 ] );
        this.screen = $( "<div />" ).addClass( "filter-screen screen is-active" );
        this.filterSets = this.element.find( ".js-filterset" );
        this.timeout = null;
        this.labelText = "Filter";
        this.skipLabel = "All";
        this.filterViews = [];

        this.setup();
    },


    setup () {
        let done = 0;

        this.filterSets.forEach(( node, i ) => {
            const filterEl = this.filterSets.eq( i );
            const filterData = filterEl.data();

            this.filterViews.push(new View({
                id: filterData.uid,
                el: filterEl,
                url: filterData.api,
                qs: false,
                cb: () => {
                    done++;

                    if ( done === this.filterSets.length ) {
                        this.options = this.element.find( ".js-filter-option" );
                        this.label = this.element.find( ".js-filter-label" );
                        this.alls = this.element.find( ".js-filter-all" );

                        this.bind();
                        this.query();
                    }
                }
            }));
        });
    },


    query () {
        // query?
        if ( window.location.search ) {
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

        } else {
            this.deactivate();

            const option = this.filterSets.filter( `[data-scope='${router.view}']` ).find( ".js-filter-all" );

            if ( option.length ) {
                this.activate( option );
            }
        }
    },


    deactivate () {
        this.alls.removeClass( "is-active" );
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
