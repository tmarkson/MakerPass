var _ = require( 'underscore' ),
    chai = require( 'chai' ),
    should = chai.should(),
    request = require( 'supertest' );

var TEST_PORT = 4321;

/*
request(app)
  .get('/user')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '20')
  .expect(200)
  .end(function(err, res){
    if (err) throw err;
  });
*/

var testconfig = {
    webconfig   : {
        port        : TEST_PORT,
    },
};

describe( 'makerpass.webserver', function() {

    var MakerPass = require( '../' );
    var makerpass = new MakerPass( testconfig );
    makerpass.start();

    var ws = makerpass.webserver;

    describe( '.dir', function() {
        it( 'should exist', function() {
            ws.should.have.property( 'dir' );
        } );
        it( 'should be a string', function() {
            ws.dir.should.be.a( 'string' );
        } );
        it( 'should match makerpass.dir', function() {
            ws.dir.should.equal( makerpass.dir );
        } );
    } );

    describe( '.port', function() {
        it( 'should exist', function() {
            ws.should.have.property( 'port' );
        } );
        it( 'should be a number', function() {
            ws.port.should.be.a( 'number' );
        } );
        it( 'should be set to TEST_PORT', function() {
            ws.port.should.equal( TEST_PORT );
        } );
    } );

    describe( '.server', function() {
        it( 'should exist', function() {
            ws.should.have.property( 'server' );
        } );
        it( 'should be an object', function() {
            ws.server.should.be.an( 'object' );
        } );
    } );

    describe( 'Web Requests', function() {
        request = request.agent( 'http://localhost:' + TEST_PORT );

        it( 'should deliver the home page for /', function( done ) {
            request.get( '/' )
                .expect( 'Content-Type', /html/ )
                .expect( 200, done );
        } );

        it( 'should deliver a node list for /nodes', function( done ) {
            request.get( '/nodes' )
                .expect( 'Content-Type', /html/ )
                .expect( 200, done );
        } );
    } );

} );
