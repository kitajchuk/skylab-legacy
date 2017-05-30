import $ from "properjs-hobo";
import * as core from "../core";


/**
 *
 * @public
 * @class Hover
 * @classdesc Show Hovers with an updatable position.
 * @param {Hobo} element The hover element
 *
 */
class Hover {
    constructor ( element ) {
        this.element = element;
        this.data = this.element.data();
        this.image = $( new Image() ).attr( "data-img-src", this.data.thumbnail ).addClass( "hover" );
        this.timeout = null;
        this.isAppended = false;

        this.load();
        this.bind();
    }


    load () {
        core.util.loadImages( this.image, core.util.noop );
    }


    bind () {
        this.element
            .on( "mouseenter", this.onHover.bind( this ) )
            .on( "mousemove", this.onHover.bind( this ) )
            .on( "mouseleave", this.onLeave.bind( this ) );
    }


    onHover ( e ) {
        const size = this.getSize();
        const x = (e.clientX - (size.width / 2));
        const y = (e.clientY - size.height - 50);

        this.append();
        this.setPosition( x, y );
    }


    onLeave () {
        this.remove();
    }


    setPosition ( x, y ) {
        core.util.translate3d(
            this.image[ 0 ],
            core.util.px( x ),
            core.util.px( y ),
            0
        );
    }


    getSize () {
        return this.image[ 0 ].getBoundingClientRect();
    }


    append () {
        if ( !this.isAppended ) {
            try {
                clearTimeout( this.timeout );

            } catch ( error ) {
                core.log( "warn", error );
            }

            this.isAppended = true;

            core.dom.body.append( this.image );

            setTimeout(() => {
                this.image.addClass( "is-active" );

            }, 0 );
        }
    }


    remove () {
        if ( this.isAppended ) {
            this.isAppended = false;

            this.image.removeClass( "is-active" );

            this.timeout = setTimeout(() => {
                this.image.remove();

            }, core.util.getElementDuration( this.image[ 0 ] ) );
        }
    }


    destroy () {
        this.remove();
        this.element.off( "mouseenter mousemove mouseleave" );
    }
}



/**
 *
 * @public
 * @class HoverController
 * @classdesc Show Hovers with an updatable position.
 * @param {Hobo} elements The hover elements
 *
 */
class HoverController {
    constructor ( elements ) {
        this.elements = elements;
        this.instances = [];

        this.elements.forEach(( node ) => {
            this.instances.push( new Hover( $( node ) ) );
        });
    }


    destroy () {
        this.instances.forEach(( instance ) => {
            instance.destroy();
        });
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default HoverController;
