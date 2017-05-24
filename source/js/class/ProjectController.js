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
        this.data = this.element.data();
        this.keys = {
            left: core.dom.body.find( ".js-key-left" ),
            right: core.dom.body.find( ".js-key-right" )
        };
        this.scroller = new ScrollController();
        this.resizer = new ResizeController();

        this.start();
    }


    start () {
        this.watchKeys();

        if ( this.data.type === "standard" ) {
            this.startStandard();
        }
    }


    startStandard () {
        this.info = this.element.find( ".js-project-info" );
        this.body = this.element.find( ".js-project-body" );

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


    pressKey ( key ) {
        key.addClass( "is-pressed" );

        setTimeout( () => key.removeClass( "is-pressed" ), 1000 );
    }


    watchKeys () {
        this.onKeydown = ( e ) => {
            // Left
            if ( e.keyCode === 37 && this.data.previous ) {
                this.pressKey( this.keys.left );
                router.route( this.data.previous );

                // Right
            } else if ( e.keyCode === 39 && this.data.next ) {
                this.pressKey( this.keys.right );
                router.route( this.data.next );
            }
        };

        core.dom.doc.on( "keydown", this.onKeydown );
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
        core.dom.doc.off( "keydown", this.onKeydown );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default ProjectController;
