var _ = require( 'underscore' ),
    util = require( '../util' );

var MPOutput = module.exports = util.emitter( 'MPOutput', [
    'id', 'pin', 'name', 'state', 'lastChanged'
] );

MPOutput.prototype.init = function init() {
    this.id = this.pin;
    this.state = null;
    this.lastChanged = null;

    if ( ! this.name )
        throw new Error( "Can't create MPOutput without name" );
};

// .id
// .pin
// .name
// .state -- on/off
// .lastchanged
