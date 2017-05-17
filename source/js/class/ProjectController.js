import * as core from "../core";
import Controller from "properjs-controller";
import ScrollController from "properjs-scrollcontroller";
import ResizeController from "properjs-resizecontroller";
import debounce from "properjs-debounce";
import router from "../router";


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
        this.next = this.element.find( ".js-project-next" );
        this.previous = this.element.find( ".js-project-previous" );
        this.scroller = new ScrollController();
        this.resizer = new ResizeController();

        this.start();
    }


    start () {
        this.checkInfo();
        this.watchKeys();
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


    watchKeys () {
        this.onKeydown = ( e ) => {
            // Left
            if ( e.keyCode === 37 && this.previous.length ) {
                router.route( this.previous[ 0 ].href );

            // Right
            } else if ( e.keyCode === 39 && this.next.length ) {
                router.route( this.next[ 0 ].href );

            // Up
            } else if ( e.keyCode === 38 ) {
                router.route( "/" );
            }
        };

        core.dom.doc.on( "keydown", this.onKeydown );
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
        core.dom.doc.off( "keydown", this.onKeydown );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default ProjectController;
