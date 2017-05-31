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

        this.core.emitter.on( "app--intro-teardown", () => {
            this.bindLate();

            if ( router.isHomepage() ) {
                navi.open();
            }
        });
    }


    bindLate () {
        this.core.emitter.on( "app--activate-cover--feature", () => {
            this.onActivateCover();
        });

        this.core.emitter.on( "app--deactivate-cover--feature", () => {
            this.onDeactivateCover();
        });
    }


    onActivateCover () {
        if ( router.isHomepage() ) {
            navi.homeClass( false );
            navi.open();

            if ( !this.core.detect.isDevice() ) {
                filter.close();
            }
        }
    }


    onDeactivateCover () {
        if ( router.isHomepage() ) {
            navi.homeClass( true );
            navi.closeSpecial();

            if ( !this.core.detect.isDevice() ) {
                filter.open();
            }
        }
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
