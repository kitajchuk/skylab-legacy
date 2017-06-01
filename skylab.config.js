const path = require( "path" );
const root = __dirname;
const config = {
    // Homepage UID
    homepage: "home",
    // Page Not Found — 404
    notfound: "404",
    // Timestamp ( Will be time app booted )
    timestamp: Date.now(),
    // Environments
    env: {
        sandbox: (process.env.NODE_ENV === "sandbox"),
        staging: (process.env.NODE_ENV === "staging"),
        production: (process.env.NODE_ENV === "production")
    },
    // API CMS config ( Prismic, Contentful )
    api: {
        // Prismic
        access: "https://skylab.cdn.prismic.io/api",
        adapter: "prismic"
    },
    // Deployment config ( AWS etc... )
    deploy: {
        cdnURL: "https://s3-us-west-2.amazonaws.com/skylabarchitecture/static",
    },
    // Templating config
    template: {
        module: "ejs",
        require: require( "ejs" ),
        dir: path.join( root, "template" ),
        layout: path.join( root, "template/index.html" ),
        pagesDir: path.join( root, "template", "pages" ),
        partialsDir: path.join( root, "template", "partials" ),
        staticDir: path.join( root, "static" )
    },
    // Express.js config
    express: {
        port: 8000
    },
    // Browser-sync config
    browser: {
        port: 8001
    },
    // Static assets config
    static: {
        // One day
        maxAge: 86400000,
        endJS: "/js/app.js",
        endCSS: "/css/screen.css"
    },
    // Compression js config
    compression: {
        level: 9,
        threshold: 0
    },

    // Skylab-www specific ( Prismic )
    skylab: {
        mainForm: "sitewide",
        naviFrag: "site.navi",
        siteType: "site",
        mainType: "project",
        colors: [
            { background: "red", query: "red" },
            { background: "#ff7b2b", query: "orange" },
            { background: "#ffee00", query: "yellow" },
            { background: "#85e042", query: "green" },
            { background: "#2ae0ff", query: "blue" },
            { background: "violet", query: "violet" }
        ],
        materials: [
            "Wood",
            "Steel",
            "Concrete",
            "Glass",
            "Brick",
            "Lighting"
        ],
        spaces: [
            "Interior",
            "Exterior"
        ]
    }
};



// Serves assets from either CDN or App Server...
config.deploy.cdnEnabled = (!config.env.sandbox && config.deploy.cdnURL);
config.static.js = config.deploy.cdnEnabled ? `${config.deploy.cdnURL}${config.static.endJS}` : config.static.endJS;
config.static.css = config.deploy.cdnEnabled ? `${config.deploy.cdnURL}${config.static.endCSS}` : config.static.endCSS;



module.exports = config;
