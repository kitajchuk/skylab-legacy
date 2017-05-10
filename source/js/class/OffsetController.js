import * as core from "../core";
import ScrollController from "properjs-scrollcontroller";


/**
 *
 * @public
 * @global
 * @class OffsetController
 * @param {Element} elements The dom elements to work with.
 * @param {Element} container The scrolling parent container
 * @classdesc Handle scroll events for a DOMElement.
 *
 */
class OffsetController {
    constructor ( elements ) {
        this.elements = elements;

        this.bind();
    }


    bind () {
        this.scroller = new ScrollController();
        this.scroller.on( "scroll", () => {
            this.elements.forEach(( element, i ) => {
                this.handle( this.elements.eq( i ) );
            });
        });
    }


    handle ( element ) {
        const bounds = element[ 0 ].getBoundingClientRect();
        const offset = (bounds.top + bounds.height / 2) - (window.innerHeight / 2);
        const speed = parseInt( element.data().speed, 10 );

        core.util.translate3d(
            element[ 0 ],
            0,
            core.util.px( -offset / speed ),
            0
        );
    }


    destroy () {
        if ( this.scroller ) {
            this.scroller.destroy();
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default OffsetController;
