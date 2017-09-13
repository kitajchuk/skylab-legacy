const config = require( "../../skylab.config" );
const sitemap = require( `../generators/${config.api.adapter}.sitemap` );
const lager = require( "properjs-lager" );



lager.cache( `${config.skylab.name} generating sitemap.xml` );



sitemap.generate().then(() => {
    lager.cache( `${config.skylab.name} sitemap.xml generated` );
});
