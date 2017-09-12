import * as core from "./core";


/**
 *
 * @public
 * @namespace intro
 * @description Performs the branded load-in screen sequence.
 * @memberof menus
 *
 */
const intro = {
    /**
     *
     * @public
     * @method init
     * @memberof menus.intro
     * @description Method initializes intro node in DOM.
     *
     */
    init () {
        this.element = core.dom.intro;
        this.logo = this.element.find( ".js-intro-logo" );
        this.durations = {
            animation: 3500
        };
        core.emitter.on( "app--page-teardown", this.teardown );
    },


    teardown () {
        core.emitter.off( "app--page-teardown", intro.teardown );

        core.util.loadImages( intro.logo, core.util.noop ).on( "done", intro.loaded );
    },


    loaded () {
        setTimeout( () => {
            intro.element.removeClass( "is-active" );

        }, intro.durations.animation );

        intro.element.on( "transitionend", () => {
            intro.element.remove();

            core.emitter.fire( "app--intro-teardown" );
        });
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default intro;
