var _ = require( 'underscore' ),
    EventEmitter = require( 'events' ).EventEmitter,
    util = require( './util' );

MPNode.toJSON = function toJSON() {
    return { id : this.id };
    return _.pick( this, 'id', 'authid' );
};

function MPNode( config ) {
    EventEmitter.call( this, config );
    this.objs = {};
    this.toJSON = function toJSON() {
        return _.pick( this, [
            'id', 'authid', 'inputs', 'outputs', 'variables', 'events',
            'lastMessageTime', 'totalMessages', 'lastCardScanned',
        ] );
    };

    if ( ! config.id ) {
        console.log( config );
        throw new Error( "Cannot create MPNode without an id" );
    }
    if ( config.id.length > 15 ) {
        throw new Error(
            "Node ID cannot be more than 15 characters (" + config.id + ")"
        );
    }

    this.id = config.id;
    this.authid = config.authid;
    this.interface = null;

    this.inputs = [];
    this.outputs = [];
    this.variables = [];
    this.events = [];

    _.extend( this, _.omit( config,
        'inputs', 'outputs', 'events', 'variables'
    ) );

    this.lastMessageTime = 0;
    this.totalMessages = 0;
    this.lastCardScanned = '';

    _.each( config.inputs, function( cfg, which ) {
        if ( typeof cfg === 'string' )
            cfg = { name : cfg, pin : 'INPUT' + which };
        this.addval( 'input', cfg );
    }, this );

    _.each( config.outputs, function( cfg, which ) {
        if ( typeof cfg === 'string' )
            cfg = { name : cfg, pin : 'OUTPUT' + which };
        this.addval( 'output', cfg );
    }, this );

    _.each( config.variables, function( cfg, name ) {
        if ( typeof cfg === 'string' ) cfg = { type : cfg };
        cfg.name = name;
        this.addval( 'variable', cfg );
    }, this );

    _.each( config.events, function( actions, event ) {
        if ( typeof actions === 'string' ) actions = [ actions ];
        this.addval( 'event', { event : event, actions : actions } );
    }, this );

    var node = this;
    this.pingIntervalObject = setInterval( function() {
        node.send( 'PING' );
    }, 60000 );
};
util.inherits( MPNode, EventEmitter );
module.exports = MPNode;

util.mkattrs( MPNode, [
    'lastMessageTime', 'totalMessages', 'lastCardScanned'
] );

var typectors = {
    input       : require( './value/input' ),
    output      : require( './value/output' ),
    event       : require( './value/event' ),
    variable    : require( './value/variable' ),
};
MPNode.prototype.addval = function addval( type, config ) {
    if ( ! config ) config = {};
    if ( ! type ) throw new Error( "MPNode.addval needs a type!" );
    config.objtype = type;
    var ctor = typectors[ type ];
    if ( ! ctor ) throw new Error( "Unknown MPObject type " + type );
    var obj = new ctor( config );
    this.objs[ obj.id ] = obj;
    this[ type + 's' ].push( obj );
    return obj;
};

MPNode.prototype.send = function send( msg ) {
    console.log( 'SENDING TO NODE', this.id, msg );
    if ( ! this.interface ) {
        console.error( 'Attempt to send to node without interface' );
        return;
    }
    this.interface.send( this.id, msg );
};
