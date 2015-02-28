var net = require( 'net' );

exports.defaults = {
    port        : 1234,
    address     : '127.0.0.1',
};

exports.openstream = function openstream() {
    this.server = net.createServer( function( socket ) {
        socket.on( 'connect', function() {}, this );
        socket.on( 'data', this.onData, this );
        socket.on( 'end', function() {}, this );
        socket.on( 'timeout', function() {}, this );
        socket.on( 'drain', function() {}, this );
        socket.on( 'close', function( had_error ) {}, this );
    } );
    this.server.listen( this.port, this.address, function() {
    } );
    this.server.on( 'listening', function() {} );
    this.server.on( 'close', function() {} );
    this.server.on( 'error', function( error ) {} );
};

exports.write = function write( string ) {
    // TODO - how do we find the right socket to write to?
    /*
    this.sp.write( string + "\n", function( err, results ) {
        console.log('err ' + err);
        console.log('results ' + results);
    } );
    */
};
