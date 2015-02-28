var _ = require( 'underscore' ),
    chai = require( 'chai' ),
    should = chai.should(),
    path = require( 'path' );

var testconfig = {
    interfaces  : [ 'Fake', { type : 'Fake', id : 'FakeTwo' } ],
    nodes       : [],
};

describe( 'makerpass', function() {

    var MakerPass = require( '..' );
    var makerpass = new MakerPass( testconfig );

    describe( '.nodes', function() {
        it( 'should exist', function() {
            makerpass.should.have.property( 'nodes' );
        } );
        var len = testconfig.nodes.length;
        it ( 'should be a ' + len + '-element array', function() {
            makerpass.nodes.should.be.an( 'array' ).with.length( len );
        } );
    } );
    describe( '.interfaces', function() {
        it( 'should exist', function() {
            makerpass.should.have.property( 'interfaces' );
        } );
        var len = testconfig.interfaces.length;
        it( 'should be a ' + len + '-element array', function() {
            makerpass.interfaces.should.be.an( 'array' ).with.length( len );
        } );
    } );
    describe( '.dir', function() {
        it( 'should exist', function() {
            makerpass.should.have.property( 'dir' );
        } );
        it( 'should be a string', function() {
            makerpass.dir.should.be.a( 'string' );
        } );
        it( 'should be the directory just above the tests', function() {
            var dir = path.resolve( module.filename, '..', '..' );
            makerpass.dir.should.equal( dir );
        } );
    } );
    describe.skip( '.webconfig', function() {
        it( 'should be an object', function() {
            makerpass.should.have.property( 'webconfig' );
            makerpass.webconfig.should.be.an( 'object' );
        } );
    } );
    describe( '.start', function() {
        it( 'should be a function', function() {
            makerpass.should.have.property( 'start' );
            makerpass.start.should.be.a( 'function' );
        } );
    } );
} );
