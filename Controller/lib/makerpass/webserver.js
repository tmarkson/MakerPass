var _ = require( 'underscore' ),
    express = require( 'express' ),
    path = require( 'path' );

function MPWebServer( config ) {
    _.extend( this, config );

    var app = this.app = express();

    var port = this.port;
    this.server = app.listen( port, function() {
        console.log( "MakerPass Web Server listening on port " + port );
    } );
    this.io = require( 'socket.io' ).listen( this.server );
    this.sockets = this.io.sockets;
    
    console.log( "DIR: ", this.dir );

    var views = this.views || path.resolve( this.dir || './', 'views' );
    app.set( 'views', views );
    app.set( 'view engine', 'jade' );
    if ( this.debug ) {
        app.set( 'showStackErrors', 'true' );
    }

    //app.disable( 'etag' );

    var public = this.public || path.resolve( this.dir, 'public' );
    var favicon = this.favicon || path.resolve( public, 'favicon.ico' );
    var logger = this.logger || 'dev';
    app.use( express.favicon( favicon ) );
    app.use( express.logger( logger ) );
    app.use( express.static( public ) );
    app.use( express.static( path.resolve( this.dir, 'bower_components' ) ) );

    app.use( express.bodyParser() );
    app.use( express.methodOverride() );

    app.use( app.router );
 
    app.use( express.errorHandler() );
 
    var makerpass = this.makerpass;
    app.get( '/', function( req, res ) {
        res.render( 'index', {
            interfaces  : makerpass.interfaces,
            unclaimed   : _.filter( makerpass.nodes, function( node ) {
                return ! node.interface;
            } ),
        } );
    } );
    app.get( '/nodes', function( req, res ) {
        res.render( 'nodes', {
            nodes   : makerpass.nodes,
        } );
    } );
    app.get( '/node/:id', function( req, res ) {
        var node = makerpass.node( req.params.id );
        res.render( 'node', { node : node } );
    } );
    app.post( '/message/:target', function( req, res ) {
        makerpass.send( req,params.target, req.params.message );
    } );
};
module.exports = MPWebServer;
