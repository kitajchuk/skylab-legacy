import * as core from "../core";
import Controller from "properjs-controller";
import ScrollController from "properjs-scrollcontroller";
import ResizeController from "properjs-resizecontroller";
import debounce from "properjs-debounce";


/**
 *
 * @public
 * @global
 * @class ProjectController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle scroll events for a DOMElement.
 *
 */
class ProjectController extends Controller {
    constructor ( element ) {
        super();

        this.element = element;
        this.info = this.element.find( ".js-project-info" );
        this.body = this.element.find( ".js-project-body" );
        this.scroller = new ScrollController();
        this.resizer = new ResizeController();

        this.start();
    }


    start () {
        this.checkInfo();
        this.watchScroll();
        this.watchWindow();
    }


    checkInfo () {
        this.infoValues = core.util.getTransformValues( this.info[ 0 ] );
        this.infoBounds = this.info[ 0 ].getBoundingClientRect();
        this.infoAmount = (this.infoBounds.bottom - this.infoValues.y) - window.innerHeight;
    }


    calcMove () {
        const scrollPos = this.scroller.getScrollY();
        const maxScroll = this.scroller.getScrollMax();
        const offsetPos = scrollPos * (this.infoAmount / maxScroll);
        const infoStyle = window.getComputedStyle( this.info[ 0 ] ).position;

        if ( infoStyle === "relative" ) {
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


    watchScroll () {
        this.scroller.on( "scroll", () => {
            this.calcMove();
        });
    }


    watchWindow () {
        this.resizer.on( "resize", debounce(() => {
            this.checkInfo();
            this.calcMove();

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
export default ProjectController;
