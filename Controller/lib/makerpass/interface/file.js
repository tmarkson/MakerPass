var _ = require( 'underscore' ),
    fs = require( 'fs' );

exports.defaults = { path : '/tmp/makerpass-messages' };

exports.openstream = function openstream() {
    this.stream = fs.createReadStream( this.path, {
        flags       : 'r',
        encoding    : 'utf8',
        autoClose   : false,
    } );
    this.stream.on( 'data', this.onData.bind( this ) );
    this.stream.on( 'error', this.onError.bind( this ) );
};

exports.getName = function getName() {
    return 'File Interface at ' + this.path;
};

exports.claimnode = function claimnode() {
    throw new Error( "File interface is input-only, cannot manage nodes" );
};
