import * as core from "../core";
import ImageController from "./ImageController";
import AnimateController from "./AnimateController";
import ProjectController from "./ProjectController";
import CoverController from "./CoverController";
import QueryController from "./QueryController";
import VideoController from "./VideoController";
import ParallaxController from "./ParallaxController";
import MapController from "./MapController";
import HoverController from "./HoverController";
import ColorController from "./ColorController";
import TogglerController from "./TogglerController";


/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 *
 */
class Controllers {
    constructor () {
        this.controllers = [];
    }


    push ( id, elements, controller, conditions ) {
        this.controllers.push({
            id: id,
            elements: elements,
            instance: null,
            Controller: controller,
            conditions: conditions
        });
    }


    init () {
        this.controllers.forEach(( controller ) => {
            if ( controller.elements.length && controller.conditions ) {
                controller.instance = new controller.Controller( controller.elements );
            }
        });
    }


    kill () {
        this.controllers.forEach(( controller ) => {
            if ( controller.instance ) {
                controller.instance.destroy();
            }
        });

        this.controllers = [];
    }


    exec () {
        this.controllers = [];

        this.push( "animates", core.dom.main.find( core.config.animSelector ), AnimateController, true );
        this.push( "project", core.dom.main.find( core.config.projectSelector ), ProjectController, true );
        this.push( "cover", core.dom.main.find( core.config.coverSelector ), CoverController, true );
        this.push( "colors", core.dom.main.find( core.config.colorSelector ), ColorController, true );
        this.push( "videos", core.dom.main.find( core.config.videoSelector ), VideoController, true );
        this.push( "parallax", core.dom.main.find( core.config.parallaxSelector ), ParallaxController, true );
        this.push( "map", core.dom.main.find( core.config.mapSelector ), MapController, true );
        this.push( "hovers", core.dom.main.find( core.config.hoverSelector ), HoverController, !core.detect.isDevice() );
        this.push( "toggler", core.dom.main.find( core.config.togglerSelector ), TogglerController, true );
        this.push( "query", ["q"], QueryController, true );

        this.images = core.dom.main.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            this.init();

            core.emitter.fire( "app--page-teardown" );
        });
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
        }

        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
