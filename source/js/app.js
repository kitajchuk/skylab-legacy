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

        this.bind();
        this.init();
    }


    bind () {
        this.core.dom.html.on( "click", ".js-theme-spot", ( e ) => {
            const $spot = $( e.target );
            const data = $spot.data();

            if ( data.theme === this.core.config.themes.light.id ) {
                core.dom.html.addClass( this.core.config.themes.light.css );

            } else {
                core.dom.html.removeClass( this.core.config.themes.light.css );
            }

            this.core.emitter.fire( "app--theme-change", data.theme );
        });

        this.bindIntro();
    }


    bindIntro () {
        this.core.emitter.on( "app--intro-teardown", () => {
            if ( router.is( core.config.homepage ) ) {
                navi.open();
            }

            if ( router.is( "work" ) ) {
                filter.query();
                filter.open();
            }

            this.bindPage();
        });
    }


    bindPage () {
        this.core.emitter.on( "app--page-teardown", () => {
            if ( router.is( core.config.homepage ) ) {
                navi.open();
            }
        });
    }


    init () {
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
