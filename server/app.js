const config = require( "./core/config" );
const router = require( "./router" );



const onQuery = function ( client, query, req ) {
    if ( req.query.status ) {
        query.push( client.Predicates.at( `my.${config.skylab.mainType}.status`, req.query.status ) );
    }

    if ( req.query.category ) {
        query.push( client.Predicates.at( `my.${config.skylab.mainType}.categories.category`, req.query.category ) );
    }

    return query;
};



// :req, :type, :uid, :callback
router.on( "api", "project", null, onQuery );
router.on( "page", "project", null, onQuery );



router.init();
