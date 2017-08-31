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
import ScrollNinja from "./ScrollNinja";


/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 * @param {object} options Optional config
 *
 */
class Controllers {
    constructor ( options ) {
        this.element = options.el;
        this.callback = options.cb;
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

        this.push( "animates", this.element.find( core.config.animSelector ), AnimateController, true );
        this.push( "project", this.element.find( core.config.projectSelector ), ProjectController, true );
        this.push( "scrollninja", this.element.find( core.config.scrollNinjaSelector ), ScrollNinja, true );
        this.push( "cover", this.element.find( core.config.coverSelector ), CoverController, true );
        this.push( "colors", this.element.find( core.config.colorSelector ), ColorController, true );
        this.push( "videos", this.element.find( core.config.videoSelector ), VideoController, true );
        this.push( "parallax", this.element.find( core.config.parallaxSelector ), ParallaxController, true );
        this.push( "map", this.element.find( core.config.mapSelector ), MapController, true );
        this.push( "hovers", this.element.find( core.config.hoverSelector ), HoverController, !core.detect.isDevice() );
        this.push( "toggler", this.element.find( core.config.togglerSelector ), TogglerController, true );
        this.push( "query", ["q"], QueryController, true );

        this.images = this.element.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            this.init();

            if ( this.callback ) {
                this.callback();
            }
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
