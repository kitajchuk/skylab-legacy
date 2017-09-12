import Controller from "properjs-controller";
import * as core from "../core";


/**
 *
 * @public
 * @global
 * @class AnimateController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle scroll events for a DOMElement.
 *
 */
class AnimateController extends Controller {
    constructor ( elements ) {
        super();

        this.elements = elements;
        this.intros = this.elements.filter( ".js-animate--intro" );
        this.animates = this.elements.not( ".js-animate--intro" );

        this.bind();
        this.start();
    }


    bind () {
        this._onIntroTeardown = () => {
            this.intros.addClass( "is-animate" );
        };

        core.emitter.on( "app--page-teardown", this._onIntroTeardown );
    }


    /**
     *
     * @instance
     * @description Initialize the animation frame
     * @memberof AnimateController
     * @method start
     *
     */
    start () {
        // Call on parent cycle
        this.go(() => {
            const anims = this.animates.not( ".is-animate" );

            if ( anims.length ) {
                anims.forEach(( element, i ) => {
                    if ( core.util.isElementVisible( element ) ) {
                        anims.eq( i ).addClass( "is-animate" );
                    }
                });

            } else {
                this.stop();
            }
        });
    }


    /**
     *
     * @instance
     * @description Stop the animation frame
     * @memberof AnimateController
     * @method destroy
     *
     */
    destroy () {
        this.stop();

        if ( this._onIntroTeardown ) {
            core.emitter.off( "app--page-teardown", this._onIntroTeardown );
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default AnimateController;
