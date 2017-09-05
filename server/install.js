const fs = require( "fs" );
const path = require( "path" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const child_process = require( "child_process" );


// Note that with `npm@5` there have been some hiccups
// The ultimate resolve was to trash the `.npm` cache


console.log( `Installing node_modules...` );

// 1.0: No `node_modules`
child_process.execSync( `rm -rf ${rootPackageLock}` );
child_process.execSync( `rm -rf ${rootNodeModules}` );
child_process.execSync( "npm install" );


console.log( `Stopping ${process.env.NODE_ENV} server...` );

// 2.0 Stop `environment` server
child_process.execSync( "npm run stop" );


console.log( `Forwarding port 80 to port 8000...` );

// 3.0 Make sure ports are forwarded for node
child_process.execSync( "iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000" );


console.log( `Starting ${process.env.NODE_ENV} server...` );

// 4.0 Start `environment` server
child_process.execSync( `npm run start:${process.env.NODE_ENV}` );
