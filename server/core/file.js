const fs = require( "fs" );
const path = require( "path" );



module.exports = {
    read ( path, sync ) {
        if ( sync ) {
            return fs.readFileSync( path );

        } else {
            return new Promise(( resolve, reject ) => {
                fs.readFile( path, ( error, data ) => {
                    if ( error ) {
                        reject( error );

                    } else {
                        resolve( data );
                    }
                });
            });
        }
    },

    write ( path, content, sync ) {
        if ( sync ) {
            return fs.writeFileSync( path, content, "utf8" );

        } else {
            return new Promise(( resolve, reject ) => {
                fs.writeFile( path, content, "utf8", ( error ) => {
                    if ( error ) {
                        reject( error );

                    } else {
                        resolve();
                    }
                });
            });
        }
    }
};
