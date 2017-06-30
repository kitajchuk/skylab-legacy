import Easing from "properjs-easing";


/**
 *
 * @public
 * @namespace config
 * @memberof core
 * @description Stores app-wide config values.
 *
 */
const config = {
    /**
     *
     * @public
     * @member themes
     * @memberof core.config
     * @description The built-in themes.
     *
     */
    themes: {
        dark: {
            id: "dark",
            css: "is-theme--dark",
            default: true
        },
        light: {
            id: "light",
            css: "is-theme--light"
        }
    },

    /**
     *
     * @public
     * @member homepage
     * @memberof core.config
     * @description The default homepage slug.
     *
     */
    homepage: "home",


    /**
     *
     * @public
     * @member defaultEasing
     * @memberof core.config
     * @description The default easing function for javascript Tweens.
     *
     */
    defaultEasing: Easing.easeInOutCubic,


    /**
     *
     * @public
     * @member defaultDuration
     * @memberof core.config
     * @description The default duration for javascript Tweens.
     *
     */
    defaultDuration: 400,


    /**
     *
     * @public
     * @member defaultVideoChannel
     * @memberof core.config
     * @description The [MediaBox]{@link https://github.com/ProperJS/MediaBox} channel used for video.
     *
     */
    defaultVideoChannel: "vid",


    /**
     *
     * @public
     * @member defaultAudioChannel
     * @memberof core.config
     * @description The [MediaBox]{@link https://github.com/ProperJS/MediaBox} channel used for audio.
     *
     */
    defaultAudioChannel: "bgm",


    /**
     *
     * @public
     * @member mainSelector
     * @memberof core.config
     * @description The string selector used for <main> node.
     *
     */
    mainSelector: ".js-main",


    /**
     *
     * @public
     * @member togglerSelector
     * @memberof core.config
     * @description The string selector used for <toggler> node.
     *
     */
    togglerSelector: ".js-toggler",


    /**
     *
     * @public
     * @member colorSelector
     * @memberof core.config
     * @description The string selector used for <color> node.
     *
     */
    colorSelector: ".js-color",


    /**
     *
     * @public
     * @member mapSelector
     * @memberof core.config
     * @description The string selector used for <map> node.
     *
     */
    mapSelector: ".js-map",


    /**
     *
     * @public
     * @member hoverSelector
     * @memberof core.config
     * @description The string selector used for <hover> node.
     *
     */
    hoverSelector: ".js-hover",


    /**
     *
     * @public
     * @member parallaxSelector
     * @memberof core.config
     * @description The string selector used for <parallax> node.
     *
     */
    parallaxSelector: ".js-parallax",


    /**
     *
     * @public
     * @member videoSelector
     * @memberof core.config
     * @description The string selector used for <video> node.
     *
     */
    videoSelector: ".js-video",


    /**
     *
     * @public
     * @member introSelector
     * @memberof core.config
     * @description The string selector used for <intro> node.
     *
     */
    introSelector: ".js-intro",


    /**
     *
     * @public
     * @member viewSelector
     * @memberof core.config
     * @description The string selector used for <view> nodes.
     *
     */
    viewSelector: ".js-view",


    /**
     *
     * @public
     * @member naviSelector
     * @memberof core.config
     * @description The string selector used for <navi> node.
     *
     */
    naviSelector: ".js-navi",


    /**
     *
     * @public
     * @member headerSelector
     * @memberof core.config
     * @description The string selector used for <header> node.
     *
     */
    headerSelector: ".js-header",


    /**
     *
     * @public
     * @member lazyImageSelector
     * @memberof core.config
     * @description The string selector used for images deemed lazy-loadable.
     *
     */
    lazyImageSelector: ".js-lazy-image",


    /**
     *
     * @public
     * @member animSelector
     * @memberof core.config
     * @description The string selector used for animatables.
     *
     */
    animSelector: ".js-animate",


    /**
     *
     * @public
     * @member coverSelector
     * @memberof core.config
     * @description The string selector used for covers.
     *
     */
    coverSelector: ".js-cover",


    /**
     *
     * @public
     * @member projectSelector
     * @memberof core.config
     * @description The string selector used for projects.
     *
     */
    projectSelector: ".js-project",


    /**
     *
     * @public
     * @member filterSelector
     * @memberof core.config
     * @description The string selector used for filter menu.
     *
     */
    filterSelector: ".js-filter",


    /**
     *
     * @public
     * @member scrollNinjaSelector
     * @memberof core.config
     * @description The string selector used for <scrollninja> node.
     *
     */
    scrollNinjaSelector: ".js-scrollninja",


    /**
     *
     * @public
     * @member lazyImageAttr
     * @memberof core.config
     * @description The string attribute for lazy image source URLs.
     *
     */
    lazyImageAttr: "data-img-src",


    /**
     *
     * @public
     * @member imageLoaderAttr
     * @memberof core.config
     * @description The string attribute ImageLoader gives loaded images.
     *
     */
    imageLoaderAttr: "data-imageloader"
};



/******************************************************************************
 * Export
*******************************************************************************/
export default config;
