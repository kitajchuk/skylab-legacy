import * as core from "../core";
import ScrollController from "properjs-scrollcontroller";


/**
 *
 * @public
 * @global
 * @class ParallaxController
 * @param {Element} elements The dom elements to work with.
 * @classdesc Handle scroll events for a DOMElement.
 *
 */
class ParallaxController {
    constructor ( elements ) {
        this.elements = elements;

        if ( !core.detect.isDevice() ) {
            this.bind();
        }
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
        const anim = element.find( ".js-parallax-image" );
        const bounds = element[ 0 ].getBoundingClientRect();
        const offset = (bounds.top + bounds.height / 2) - (window.innerHeight / 2);
        const speed = 4;

        core.util.translate3d(
            anim[ 0 ],
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
export default ParallaxController;
