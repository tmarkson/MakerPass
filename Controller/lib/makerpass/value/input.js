var _ = require( 'underscore' ),
    util = require( '../util' );

var MPInput = module.exports = util.emitter( 'MPInput', [
    'id', 'pin', 'name', 'value', 'state', 'lastChanged', 'threshold',
] );

MPInput.prototype.init = function init() {
    this.id = this.pin;
    this.value = null;
    this.state = null;
    this.lastChanged = null;
    _.defaults( this, {
        threshold   : 512,
    } );

    if ( ! this.name )
        throw new Error( "Can't create MPInput without name" );
};

// .id
// .pin
// .value -- 0-1023
// .state -- on(value=1023)/off(value=0)/analog(1>value<1023)
// .lastChanged
