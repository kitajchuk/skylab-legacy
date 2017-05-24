import * as core from "../core";
import ImageController from "./ImageController";
import AnimateController from "./AnimateController";
import ProjectController from "./ProjectController";
import CoverController from "./CoverController";
import QueryController from "./QueryController";
import VideoController from "./VideoController";
import ParallaxController from "./ParallaxController";


/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 *
 */
class Controllers {
    constructor () {}


    exec () {
        this.images = core.dom.main.find( core.config.lazyImageSelector );
        this.animates = core.dom.main.find( core.config.animSelector );
        this.project = core.dom.main.find( core.config.projectSelector );
        this.cover = core.dom.main.find( core.config.coverSelector );
        this.videos = core.dom.main.find( core.config.videoSelector );
        this.parallax = core.dom.main.find( core.config.parallaxSelector );

        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            if ( this.animates.length ) {
                this.animateController = new AnimateController( this.animates );
            }

            if ( this.project.length ) {
                this.projectController = new ProjectController( this.project );
            }

            if ( this.cover.length ) {
                this.coverController = new CoverController( this.cover );
            }

            if ( this.videos.length ) {
                this.videoController = new VideoController( this.videos );
            }

            if ( this.parallax.length ) {
                this.parallaxController = new ParallaxController( this.parallax );
            }

            this.queryController = new QueryController();

            core.emitter.fire( "app--intro-teardown" );
        });
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
            this.imageController = null;
        }

        if ( this.animateController ) {
            this.animateController.destroy();
            this.animateController = null;
        }

        if ( this.projectController ) {
            this.projectController.destroy();
            this.projectController = null;
        }

        if ( this.coverController ) {
            this.coverController.destroy();
            this.coverController = null;
        }

        if ( this.queryController ) {
            this.queryController.destroy();
            this.queryController = null;
        }

        if ( this.videoController ) {
            this.videoController.destroy();
            this.videoController = null;
        }

        if ( this.parallaxController ) {
            this.parallaxController.destroy();
            this.parallaxController = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
