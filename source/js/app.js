require( "../sass/screen.scss" );


import router from "./router";
import * as core from "./core";
import navi from "./navi";
import intro from "./intro";
import filter from "./filter";
import Analytics from "./class/Analytics";
import $ from "properjs-hobo";


/**
 *
 * @public
 * @class App
 * @classdesc Load the App application Class to handle it ALL.
 *
 */
class App {
    constructor () {
        this.core = core;
        this.navi = navi;
        this.intro = intro;
        this.router = router;
        this.filter = filter;

        this.bindEvents();
        this.initModules();
    }


    bindEvents () {
        this.core.dom.html.on( "click", ".js-theme-spot", ( e ) => {
            const $spot = $( e.target );
            const data = $spot.data();

            if ( data.theme === "light" ) {
                core.dom.html.addClass( "is-theme--light" );

            } else {
                core.dom.html.removeClass( "is-theme--light" );
            }
        });

        this.core.emitter.on( "app--activate-cover--feature", () => {
            navi.homeClass( false );
            navi.openSpecial();

            if ( !this.core.detect.isDevice() ) {
                filter.close();
            }
        });

        this.core.emitter.on( "app--deactivate-cover--feature", () => {
            navi.homeClass( true );
            navi.closeSpecial();

            if ( !this.core.detect.isDevice() ) {
                filter.open();
            }
        });
    }


    /**
     *
     * @public
     * @instance
     * @method initModules
     * @memberof App
     * @description Initialize application modules.
     *
     */
    initModules () {
        // Core
        this.core.detect.init();

        // Utility ?

        // Views
        this.navi.init();
        this.intro.init();
        this.filter.init();

        // Controller
        this.router.init();

        // Analytics
        this.analytics = new Analytics();
    }
}


/******************************************************************************
 * Expose
*******************************************************************************/
window.app = new App();


/******************************************************************************
 * Export
*******************************************************************************/
export default window.app;
