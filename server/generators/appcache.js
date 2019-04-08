const child_process = require( "child_process" );
const config = require( "../../skylab.config" );
const lager = require( "properjs-lager" );
const prefix = config.aws.cdnOn ? config.aws.cdn : "";

// Generate cache manifest
//lager.cache( `${config.skylab.name} generating appcache-manifest` );
    child_process.execSync( `./node_modules/.bin/appcache-manifest -p ${prefix} -o ./static/cache.manifest --stamp --network-star ./static/css/* ./static/js/* ./static/fonts/* ./static/LivIconsEvo/css/*.css ./static/LivIconsEvo/js/**/*.js ./static/LivIconsEvo/svg/*` );
