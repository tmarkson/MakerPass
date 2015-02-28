var _ = require( 'underscore' ),
    chai = require( 'chai' ),
    should = chai.should(),
    path = require( 'path' );

describe( 'makerpass.util', function() {

    var util = require( '../lib/makerpass/util' );

    describe( '.inherits', function() {
        it( 'should exist', function() {
            util.should.have.property( 'inherits' );
        } );
        it( 'should be a function', function() {
            util.inherits.should.be.a( 'function' );
        } );
    } );

    describe( '.findHome', function() {
        it( 'should exist', function() {
            util.should.have.property( 'findHome' );
        } );
        it( 'should be a function', function() {
            util.findHome.should.be.a( 'function' );
        } );
        it( 'should return the correct directory', function() {
            util.findHome().should.equal( path.resolve( '.' ) );
        } );
    } );

    describe( 'Constructor', function() {
        it( 'should throw if called without a type', function() {
            should.Throw( function() { new MPInterface() } );
        } );
    } );

} );
