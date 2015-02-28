var _ = require( 'underscore' );

exports.openstream = function openstream() {
    var self = this;
    var webconf = self.makerpass.webconfig || {};
    if ( webconf.disable || webconf.disabled ) {
        throw new Error( "Can't use Fake interface with web server disabled" );
    }
    var sock = self.makerpass.webserver.sockets;
    sock.on( 'connection', function( socket ) {
        socket.emit( 'message', '* IDENT' );
        socket.on( 'message', function( msg ) {
            console.log( 'message from socket.io:', msg );
            self.emit( 'message', msg );
        } );
    } );
    /*
    sock.on( 'message', function( msg ) {
        console.log( 'FAKE MSG:', msg );
    } );
    */
};

exports.send = function send( target, message ) {
    var sock = this.makerpass.webserver.sockets;
    sock.emit( 'message', target + ' ' + message );
};

exports.write = function write( string ) {
    /*
    this.port.write( string + "\n", function( err, results ) {
        console.log( 'err: ' + err );
        console.log( 'results: ' + results );
    } );
    */
};

exports.claimnode = function claimnode( node ) {
    this.nodes[ node.id ] = node;
    node.interface = this;
    node.fake = true;
};
