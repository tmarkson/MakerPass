var _ = require( 'underscore' ),
    chai = require( 'chai' ),
    smock = require( '../node_modules/serialport/test_mocks/linux-hardware' ),
    SerialPort = smock.SerialPort,
    hardware = smock.hardware,
    should = chai.should(),
    SandboxedModule = require( 'sandboxed-module' );

SandboxedModule.require( '../lib/makerpass/interface', {
    requires    : { 'serialport' : SerialPort },
} );

var dev = '/dev/fakeserial';
var testconfig = {
    type            : 'Serial',
    path            : dev,
};
hardware.createPort( dev );

describe( 'interface.serial', function() {
    var MPInterface = require( '../lib/makerpass/interface' );

    it( 'should be a function', function() {
        MPInterface.should.be.a( 'function' );
    } );

    describe( 'Class', function() {
        var iface = new MPInterface( testconfig );
        it( 'should have .buffer', function() {
            iface.should.have.property( 'buffer' ).with.length( 0 );
        } );
        it( 'should have .status', function() {
            iface.should.have.property( 'status' );
            iface.status.should.be.a( 'string' );
            iface.status.should.equal( 'stopped' );
        } );
        it( 'should have .lastMessageTime', function() {
            iface.should.have.property( 'lastMessageTime' );
            iface.lastMessageTime.should.equal( 0 );
        } );
        it( 'should have .totalMessages', function() {
            iface.should.have.property( 'totalMessages' );
            iface.totalMessages.should.be.a( 'number' );
            iface.totalMessages.should.equal( 0 );
        } );
        it( 'should have .nodes', function() {
            iface.should.have.property( 'nodes' );
            iface.nodes.should.be.an( 'object' );
            iface.nodes.should.be.empty;
        } );
        it( 'should have .initialize', function() {
            iface.should.have.property( 'initialize' );
            iface.initialize.should.be.a( 'function' );
        } );
        it( 'should have .claimnode', function() {
            iface.should.have.property( 'claimnode' );
            iface.claimnode.should.be.a( 'function' );
        } );
        it( 'should have .seterror', function() {
            iface.should.have.property( 'seterror' );
            iface.seterror.should.be.a( 'function' );
        } );
        it( 'should have .start', function() {
            iface.should.have.property( 'start' );
            iface.start.should.be.a( 'function' );
        } );
        it( 'should have .getName', function() {
            iface.should.have.property( 'getName' );
            iface.getName.should.be.a( 'function' );
            iface.getName().should.equal( 'Serial Interface on ' + dev );
        } );

        it( 'should have .onData', function() {
            iface.should.have.property( 'onData' );
            iface.onData.should.be.a( 'function' );
        } );
        it( 'should have .onClose', function() {
            iface.should.have.property( 'onClose' );
            iface.onClose.should.be.a( 'function' );
        } );
        it( 'should have .onError', function() {
            iface.should.have.property( 'onError' );
            iface.onError.should.be.a( 'function' );
        } );
    } );

    var messages = {
        '123 blah blah blah blah blah' : {
        },
    };
    
    _.each( messages, function( data, msg ) {
        var iface = new MPInterface( testconfig );
        iface.openstream();

        iface.on( 'message', function( message ) {
            message.should.equal( data );
        } );

        it( 'should receive a message "' + msg + '"', function() {
            hardware.emitData( '/dev/fakeserial', new Buffer( msg ) );
        } );
    } );

} );
