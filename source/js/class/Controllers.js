import * as core from "../core";
import ImageController from "./ImageController";
import AnimateController from "./AnimateController";
import ProjectController from "./ProjectController";
import CoverController from "./CoverController";
import QueryController from "./QueryController";
// import OffsetController from "./OffsetController";


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
        this.offsets = core.dom.main.find( ".js-offset" );

        if ( this.animates.length ) {
            this.animateController = new AnimateController( this.animates );
        }

        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            core.emitter.fire( "app--intro-teardown" );
        });

        if ( this.project.length ) {
            this.projectController = new ProjectController( this.project );
        }

        if ( this.cover.length ) {
            this.coverController = new CoverController( this.cover );
        }

        this.queryController = new QueryController();

        // if ( this.offsets.length ) {
        //     this.offsetController = new OffsetController( this.offsets );
        // }
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

        // if ( this.offsetController ) {
        //     this.offsetController.destroy();
        //     this.offsetController = null;
        // }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
