import * as core from "../core";
import ScrollController from "properjs-scrollcontroller";
import ResizeController from "properjs-resizecontroller";
import debounce from "properjs-debounce";


/**
 *
 * @public
 * @global
 * @class ScrollNinja
 * @classdesc Handle scrolling things together, like ninja shit.
 *
 */
class ScrollNinja {
    constructor ( element ) {
        this.element = element;
        this.data = this.element.data();
        this.scroller = new ScrollController();
        this.resizer = new ResizeController();
        this.info = this.element.find( ".js-scrollninja-info" );
        this.body = this.element.find( ".js-scrollninja-body" );

        this.checkInfo();
        this.watchScrollInfo();
        this.watchWindowInfo();
    }


    checkInfo () {
        this.infoValues = core.util.getTransformValues( this.info[ 0 ] );
        this.infoBounds = this.info[ 0 ].getBoundingClientRect();
        this.infoAmount = (this.infoBounds.bottom - this.infoValues.y) - window.innerHeight;
    }


    calcInfo () {
        this.doReader();
    }


    doReader () {
        const scrollPos = this.scroller.getScrollY();
        const maxScroll = this.scroller.getScrollMax();
        const offsetPos = scrollPos * (this.infoAmount / maxScroll);
        const infoStyle = window.getComputedStyle( this.info[ 0 ] ).position;

        if ( infoStyle === "relative" || this.infoAmount <= 0 ) {
            this.moveInfo( 0 );

        } else {
            this.moveInfo( -offsetPos );
        }
    }


    moveInfo ( y ) {
        core.util.translate3d(
            this.info[ 0 ],
            0,
            core.util.px( y ),
            0
        );
    }


    watchScrollInfo () {
        this.scroller.on( "scroll", () => {
            this.calcInfo();
        });
    }


    watchWindowInfo () {
        this.resizer.on( "resize", debounce(() => {
            this.checkInfo();
            this.calcInfo();

        }), 2000 );
    }


    destroy () {
        this.resizer.off( "resize" );
        this.scroller.off( "scroll" );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default ScrollNinja;
