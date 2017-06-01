const config = require( "../../skylab.config" );



module.exports = require( `../adapters/${config.api.adapter}` );
