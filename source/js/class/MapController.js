import * as core from "../core";
import loadJS from "fg-loadjs";
import loadCSS from "fg-loadcss";


const apiScript = "https://api.tiles.mapbox.com/mapbox-gl-js/v0.37.0/mapbox-gl.js";
const apiStyle = "https://api.tiles.mapbox.com/mapbox-gl-js/v0.37.0/mapbox-gl.css";
const apiToken = "pk.eyJ1Ijoia2l0YWpjaHVrIiwiYSI6ImNqMzRxOXhnYzAxbG8ycHA2ZW9keXZtMGEifQ.xMItgdorzQWYZo3DIhqMeA";


/**
 *
 * @public
 * @global
 * @class MapController
 * @classdesc Handle loading a Javascript map...
 *
 */
class MapController {
    constructor ( element ) {
        this.element = element;
        this.marker = this.element.find( ".js-map-marker" ).detach();
        this.data = this.element.data();
        this.lnglat = this.data.latlng.reverse();
        this.theme = core.dom.html.is( ".is-theme--light" ) ? "light" : "dark";
        this.map = null;
        this.mapMarker = null;

        if ( window.mapboxgl ) {
            this.onReady();

        } else {
            this.loadAPI();
        }
    }


    loadAPI () {
        loadJS( apiScript, () => this.onReady() );

        loadCSS( apiStyle );
    }


    onReady () {
        // Set public access token...
        window.mapboxgl.accessToken = apiToken;

        this.bind();
        this.init();
    }


    init () {
        this.map = new window.mapboxgl.Map({
            container: this.element[ 0 ],
            center: this.lnglat,
            scrollZoom: false,
            style: `mapbox://styles/mapbox/${this.theme}-v9`,
            zoom: 16
        });

        // this.mapMarker = new window.mapboxgl.Marker();
        // this.mapMarker.setLngLat( this.lnglat );
        // this.mapMarker.addTo( this.map );

        this.fooMarker = new window.mapboxgl.Marker( this.marker[ 0 ] );
        this.fooMarker.setLngLat( this.lnglat );
        this.fooMarker.addTo( this.map );
    }


    bind () {
        this.onThemeChange = ( theme ) => {
            if ( this.map ) {
                this.theme = theme;
                this.map.setStyle( `mapbox://styles/mapbox/${this.theme}-v9` );
            }
        };

        core.emitter.on( "app--theme-change", this.onThemeChange );
    }


    destroy () {
        this.map = null;
        this.mapMarker = null;
        core.emitter.off( "app--theme-change", this.onThemeChange );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default MapController;
