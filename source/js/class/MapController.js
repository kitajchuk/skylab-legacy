// import * as core from "../core";
// import paramalama from "paramalama";
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
        this.data = this.element.data();

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
        const longLat = this.data.latlong.reverse();

        window.mapboxgl.accessToken = apiToken;

        this.map = new window.mapboxgl.Map({
            container: this.element[ 0 ],
            style: "mapbox://styles/mapbox/dark-v9",
            zoom: 13,
            center: longLat,
            scrollZoom: false
        });
        this.marker = new window.mapboxgl.Marker();
        this.marker.setLngLat( longLat );
        this.marker.addTo( this.map );
    }


    destroy () {

    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default MapController;
