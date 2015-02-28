var _ = require( 'underscore' ),
    EventEmitter = require( 'events' ).EventEmitter,
    glob = require( 'glob' ),
    path = require( 'path' ),
    yaml = require( 'js-yaml' ),
    fs = require( 'fs' ),
    util = require( './makerpass/util' );

function MakerPass( config ) {
    this.dir = util.home;
    this.config = config;
    this.nodes = [];
    this.interfaces = [];

    _.extend( this, _.omit( config, 'nodes', 'interfaces' ) );

    _.each( config.interfaces || [], this.addInterface.bind( this ) );
    _.each( config.nodes || [], this.addNode.bind( this ) );
};

MakerPass.prototype.send = function send( target, message ) {
    if ( ~ target.indexOf( '*' ) ) {
        _.each( this.interfaces, function( interface ) {
            interface.send( target, message );
        } );
    } else {
        var node = this.node( target );
        node.send( message );
    }
};

MakerPass.prototype.addNode = function addNode( cfg ) {
    var MPNode = require( './makerpass/node' );
    var node = new MPNode( cfg );
    if ( typeof node.interface == 'string' ) {
        var int = this.interface( node.interface );
        if ( int ) int.claimnode( node );
    }
    this.nodes.push( node );
    return node;
};

MakerPass.prototype.node = function node( id ) {
    return _.find( this.nodes, function( node ) {
        return node.id == id || node.name == id;
    } );
};

MakerPass.prototype.addInterface = function addInterface( cfg ) {
    var MPInterface = require( './makerpass/interface' );
    var iface = new MPInterface( cfg );
    iface.makerpass = this;

    iface.on( "message", function( message ) {
        console.log( 'message: ', message );
    } );
    iface.on( "error", function( err ) {
        console.error( err );
    } );

    iface.idx = this.interfaces.length;
    iface.name = iface.getName();

    this.interfaces.push( iface );
    return iface;
};

MakerPass.prototype.interface = function interface( id ) {
    return _.find( this.interfaces, function( int ) {
        return int.id == id;
    } ) || _.find( this.interfaces, function( int ) {
        return int.name == id;
    } ) || _.find( this.interfaces, function( int ) {
        return int.type == id;
    } );
};

MakerPass.prototype.loadNodes = function loadNodes( /* args */ ) {
    var dir = this.dir;
    var queue = _.map( _.flatten( arguments ), function( x ) {
        return path.resolve( dir, x );
    } );
    if ( ! queue.length )
        throw new Error( "Can't loadNodes without directory or file" );

    while ( queue.length > 0 ) {
        var file = queue.shift();
        var stat = fs.statSync( file );
        if ( stat.isDirectory() ) {
            _.each( fs.readdirSync( file ), function( x ) {
                queue.push( path.resolve( file, x ) );
            } );
            continue;
        }
        var ext = path.extname( file );
        var adder = this.addNode.bind( this );
        if ( ext === '.js' ) {
            var node = require( file );
            if ( Array.isArray( node ) ) {
                _.each( node, adder );
            } else {
                adder( node );
            }
        } else if ( ext === '.yml' || ext === '.yaml' ) {
            var str = fs.readFileSync( file, 'utf8' );
            yaml.safeLoadAll( str, adder );
        } else {
            console.log( "Skipping unknown extension:", file );
        }
    }

/* TODO
    _.each( this.nodes, function( node ) {
        if ( typeof node.interface === 'string' ) {
            console.log( 'claiming interface!' );
            var iface = this.interface( node.interface );
            if ( iface ) iface.claimnode( node );
        }
    } );
*/
};

MakerPass.prototype.start = function start() {
    // Start the web interface, unless it's been disabled
    if ( ! this.webconfig.disable ) this.startweb();
    // Start the device interfaces
    _.each( this.interfaces, function( iface ) { iface.start(); } );
};

MakerPass.prototype.startweb = function startweb() {
    var webconf = this.webconfig = this.webconfig || {};
    // If the web interface is disabled, then don't start it
    if ( webconf.disable || webconf.disabled ) return false;

    var cfg = {
        port    : 3000,
    };
    if ( this.webconfig ) {
        _.extend( cfg, this.webconfig );
    }
    cfg.dir = this.dir;
    cfg.makerpass = this;

    var MPWebServer = require( './makerpass/webserver' );
    this.webserver = new MPWebServer( cfg );
    return true;
};

module.exports = MakerPass;
