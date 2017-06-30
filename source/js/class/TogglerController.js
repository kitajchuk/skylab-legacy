import $ from "properjs-hobo";


/**
 *
 * @public
 * @global
 * @class TogglerController
 * @classdesc Handle toggling things...
 *
 */
class TogglerController {
    constructor ( element ) {
        this.element = element;
        this.buttons = this.element.find( ".js-toggler-btn" );
        this.tiles = null;
        this.n = 0;

        this.bind();
    }


    bind () {
        this.element.on( "click", ".js-toggler-btn", ( e ) => {
            const node = $( e.target );
            const index = node.index() + 1;

            if ( !this.tiles ) {
                this.tiles = this.element.find( ".js-toggle-tile" );
            }

            this.toggle( index );
        });
    }


    toggle ( n ) {
        this.tiles.removeClass( "is-n1 is-n2 is-n3 is-n4" ).addClass( `is-n${n}` );

        this.buttons.removeClass( "is-active" ).eq( n - 1 ).addClass( "is-active" );

        this.n = n;
    }


    destroy () {
        this.element.off( "click" );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default TogglerController;
