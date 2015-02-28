var _ = require( 'underscore' ),
    chai = require( 'chai' ),
    should = chai.should();

describe( 'makerpass.interface', function() {

    var MPInterface = require( '../lib/makerpass/interface' );

    describe( 'Constructor', function() {
        it( 'should throw if called without a type', function() {
            should.Throw( function() { new MPInterface() } );
        } );
    } );

} );
