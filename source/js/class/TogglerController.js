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
        this.n = 0;

        this.bind();
        this.toggle( 1 );
    }


    bind () {
        this.element.on( "click", ".js-toggler-btn", ( e ) => {
            const node = $( e.target );
            const index = node.index() + 1;

            this.toggle( index );
        });
    }


    toggle ( n ) {
        this.element.removeClass( `is-n${this.n}` ).addClass( `is-n${n}` );

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
