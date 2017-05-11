const config = require( "./core/config" );
const router = require( "./router" );



const onCategory = function ( client, query, req ) {
    if ( req.query.category ) {
        query.push( client.Predicates.at( `my.${config.skylab.mainType}.categories.category`, req.query.category ) );
    }

    return query;
};



// :req, :type, :uid, :callback
router.on( "api", "project", null, onCategory );
router.on( "page", "project", null, onCategory );



router.init();
