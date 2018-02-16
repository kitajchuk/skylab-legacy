const path = require( "path" );
const root = __dirname;
const config = {
    // The URL of your actual site
    url: "http://skylabarchitecture.com",
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
    aws: {
        cdn: "https://s3-us-west-2.amazonaws.com/skylabarchitecture/static",
        cdnOn: true // Turn on to use CloudFront CDN
    },
    // Templating config
    template: {
        module: "ejs",
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
        port: 8001,
        hobo: "is eq not attr index filter detach remove append toggleClass",
        appcache: (process.env.NODE_ENV === "production")
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
    // Generators config ( sitemap, robots, cache manifest )
    generate: {
        sitemap: {
            site: false,
            person: false,
            social: false,
            newbiz: false
        },
        mappings: {
            blog: "play",
            project: "work"
        },
        robots: {
            site: false,
            page: false,
            person: false,
            social: false,
            newbiz: false
        }
    },
    // Skylab-www specific ( Prismic )
    skylab: {
        name: "Skylab",
        mainForm: "sitewide",
        naviFrag: "site.navi",
        siteType: "site",
        mainType: "project",
        blogType: "blog",
        homeType: "home",
        workType: "work",
        playType: "play",
        indexType: "index",
        colors: [
            { background: "red", query: "red" },
            { background: "#ff7b2b", query: "orange" },
            { background: "#85e042", query: "green" },
            { background: "#2ae0ff", query: "blue" },
            { background: "black", query: "black" },
            { background: "white", query: "white" }
        ]
    }
};



// Serves assets from either CDN or App Server...
config.static.js = (config.aws.cdnOn && !config.env.sandbox) ? `${config.aws.cdn}${config.static.endJS}` : config.static.endJS;
config.static.css = (config.aws.cdnOn && !config.env.sandbox) ? `${config.aws.cdn}${config.static.endCSS}` : config.static.endCSS;
config.aws.cdn = (config.aws.cdnOn && config.env.sandbox) ? `http://localhost:${config.browser.port}` : config.aws.cdn;



module.exports = config;
