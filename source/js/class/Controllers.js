import * as core from "../core";
import ImageController from "./ImageController";
import AnimateController from "./AnimateController";
import ProjectController from "./ProjectController";


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
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
