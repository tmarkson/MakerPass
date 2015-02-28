var _ = require( 'underscore' ),
    util = require( '../util' );
    
var MPEvent = module.exports = util.emitter( 'MPEvent', [
    'id', 'event', 'actions', 'lastfired'
] );

MPEvent.prototype.init = function init() {
    this.id = this.event;
};
