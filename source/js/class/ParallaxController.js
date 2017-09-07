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
            this.exec();
        }
    }


    bind () {
        this.scroller = new ScrollController();
        this.scroller.on( "scroll", () => {
            this.exec();
        });
    }


    exec () {
        this.elements.forEach(( element, i ) => {
            this.handle( this.elements.eq( i ) );
        });
    }


    move ( elem, val ) {
        if ( elem.length ) {
            core.util.translate3d(
                elem[ 0 ],
                0,
                core.util.px( val ),
                0
            );
        }
    }


    handle ( element ) {
        const image = element.find( ".js-parallax-image" );
        const background = element.find( ".js-parallax-background" );
        const cover = element.find( ".js-parallax-cover" );
        const bounds = cover[ 0 ].getBoundingClientRect();
        const offset = (bounds.top + bounds.height / 2) - (window.innerHeight / 2);
        const speed = 4;

        this.move( image, (offset / speed) );
        this.move( background, (-offset / speed) );
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
