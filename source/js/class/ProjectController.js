import * as core from "../core";
import Controller from "properjs-controller";
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

        this.start();
    }


    start () {
        this.watchKeys();
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


    destroy () {
        core.dom.doc.off( "keydown", this.onKeydown );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default ProjectController;
