var _ = require( 'underscore' ),
    chai = require( 'chai' ),
    should = chai.should();

describe( 'missiles example', function() {

    var MakerPass = require( '../' );
    var makerpass = new MakerPass( {
        interfaces  : [ 'Fake' ],
    } );
    makerpass.loadNodes( __dirname + '/config/missiles-example.yml' );

    console.log( makerpass );
    describe( '.nodes', function() {
        it( 'should be an array', function() {
            makerpass.should.have.property( 'nodes' );
            makerpass.nodes.should.be.an( 'array' ).with.length( 1 );
        } );
    } );
    describe( '.interfaces', function() {
        it( 'should be an array', function() {
            makerpass.should.have.property( 'interfaces' );
            makerpass.interfaces.should.be.an( 'array' ).with.length( 1 );
        } );
    } );

} );
