const fs = require( "fs" );
const path = require( "path" );
const root = __dirname;
const rootNodeModules = path.join( root, "node_modules" );
const rootPackageLock = path.join( root, "package-lock.json" );
const rootStatic = path.join( root, "static" );
const rootStaticJson = path.join( rootStatic, "json" );
const child_process = require( "child_process" );
const yargs = require( "yargs" );


// Note that with `npm@5` there have been some hiccups
// The ultimate resolve was to trash the `.npm` cache


console.log( `Stopping task server` );

// 0.0 Stop `environment` server
child_process.execSync( "npm run stop" );


// 1.0 Create static/json path
console.log( "Creating static/json path..." );

if ( !fs.existsSync( rootStatic ) ) {
    child_process.execSync( `mkdir ${rootStatic}` );
}

if ( !fs.existsSync( rootStaticJson ) ) {
    child_process.execSync( `mkdir ${rootStaticJson}` );
}


console.log( "Installing node_modules..." );

// 2.0: No `node_modules`
child_process.execSync( `rm -rf ${rootPackageLock}` );
child_process.execSync( `rm -rf ${rootNodeModules}` );
child_process.execSync( "npm install" );


console.log( `Forwarding port 80 to port 8000...` );

// 3.0 Make sure ports are forwarded for node
child_process.execSync( "iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports 8000" );


// 4.0 Start `environment` server
console.log( "Starting task server..." );

child_process.execSync( `node_modules/.bin/forever -a -l forever.log -o out.log -e err.log start app.js --token "${yargs.argv.token}" --webhook "${yargs.argv.webhook}" --channel "${yargs.argv.channel}" --key ${yargs.argv.key} --secret ${yargs.argv.secret} --region "${yargs.argv.region}" --bucket "${yargs.argv.bucket}" --prefix "static" --directory "static"` );
