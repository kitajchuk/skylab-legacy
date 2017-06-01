import * as core from "../core";
import Controller from "properjs-controller";
// import $ from "properjs-hobo";


/**
 *
 * @public
 * @global
 * @class ColorController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle fullbleed cover image moments.
 *
 */
class ColorController extends Controller {
    constructor ( elements ) {
        super();

        this.active = null;
        this.elements = elements;

        this.start();
    }


    start () {
        // Call on parent cycle
        this.go(() => {
            const elem = this.getElement();
            const data = elem.data();

            if ( elem && this.active !== elem[ 0 ] ) {
                console.log( "activate color", data.color );
                this.active = elem[ 0 ];
                core.dom.html
                    .removeClass( `is-theme--${core.config.themes.dark.id} is-theme--${core.config.themes.light.id}` )
                    .addClass( `is-theme--${data.color}` );

            } else if ( !elem && this.active ) {
                console.log( "deactivate color" );
                this.active = null;
                core.dom.html.removeClass( `is-theme--${core.config.themes.dark.id} is-theme--${core.config.themes.light.id}` );
            }
        });
    }


    getElement () {
        let ret = null;

        this.elements.forEach(( el, i ) => {
            const node = this.elements.eq( i );
            const headBounds = core.dom.header[ 0 ].getBoundingClientRect();
            const nodeBounds = node[ 0 ].getBoundingClientRect();

            if ( nodeBounds.top < headBounds.bottom && nodeBounds.bottom > headBounds.top /*&& !ret*/ ) {
                ret = node;
            }
        });

        return ret;
    }


    destroy () {
        core.dom.html.removeClass( `is-theme--${core.config.themes.dark.id} is-theme--${core.config.themes.light.id}` );

        this.stop();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default ColorController;
