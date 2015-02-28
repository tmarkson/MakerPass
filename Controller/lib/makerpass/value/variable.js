var _ = require( 'underscore' ),
    util = require( '../util' );

var MPVariable = module.exports = util.emitter( 'MPVariable', [
    'id', 'name', 'type', 'value', 'lastchanged'
] );

MPVariable.prototype.init = function init() {
    this.id = this.name;
};
