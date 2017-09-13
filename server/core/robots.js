const config = require( "../../skylab.config" );
const sitemap = require( `../generators/${config.api.adapter}.robots` );
const lager = require( "properjs-lager" );



lager.cache( `${config.skylab.name} generating robots.txt` );



sitemap.generate().then(() => {
    lager.cache( `${config.skylab.name} robots.txt generated` );
});
