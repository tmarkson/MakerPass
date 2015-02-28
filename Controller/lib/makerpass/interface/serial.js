var _ = require( 'underscore' ),
    serialport = require( 'serialport' ),
    SerialPort = serialport.SerialPort;

exports.defaults = {
    path        : '/dev/ttyS0', // TODO - search for serial devices
    baudrate    : 9600,
    databits    : 8,
    stopbits    : 1,
    parity      : 'none',
    flowcontrol : false,
};

exports.openstream = function openstream() {
    var self = this;
    var sp = this.port = new SerialPort(
        this.path, // path to device
        { // config
            baudrate                : this.baudrate,
            databits                : this.databits,
            stopbits                : this.stopbits,
            parity                  : this.parity,
            flowcontrol             : this.flowcontrol,
            buffersize              : 512,
        },
        true, // connect immediately
        function( err ) { // connection callback
            if ( err ) {
                self.seterror( err );
            } else {
                sp.on( 'data', self.onData.bind( self ) );
                sp.on( 'close', self.onClose.bind( self ) );
                sp.on( 'error', self.onError.bind( self ) );
            }
        }
    );
};

exports.send = function send( target, message ) {
    this.port.write( target + ' ' + message + "\n", function( err, results ) {
        console.log( 'err: ' + err );
        console.log( 'results: ' + results );
    } );
};

exports.getName = function getName() {
    return 'Serial Interface on ' + this.path;
};
