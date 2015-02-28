var _ = require( 'underscore' ),
    nodeutil = require( 'util' ),
    EventEmitter = require( 'events' ).EventEmitter,
    path = require( 'path' );

// re-export some things from the regular nodejs util module
exports.inherits = nodeutil.inherits;

// create properties that fire events when their value changes
exports.mkattrs = function mkattrs( obj, names ) {
    _.each( names, function( name ) {
        Object.defineProperty( obj, name, {
            enumerable  : true,
            get         : function() { 
                return this[ '_' + name ];
            },
            set         : function( val ) { 
                var was = this[ '_' + name ];
                this[ '_' + name ] = val;
                this.emit( 'change', name, val, was );
            },
        } );
    } );
};

// make an object inherit from EventEmitter
exports.emitter = function emitter( name, attrs, toJSONattrs ) {
    var ctor = function( config ) {
        _.extend( this, config );
        this.toJSON = function toJSON() {
            var copy = {};
            _.each( toJSONattrs || attrs, function( attr ) {
                copy[ attr ] = this[ attr ];
            }, this );
            return copy;
        };
        _.pick( this, toJSONattrs || attrs );
        this.init();
    };
    ctor.name = name;
    nodeutil.inherits( ctor, EventEmitter );
    exports.mkattrs( ctor.prototype, attrs );
    return ctor;
};

exports.findHome = function findHome() {
    var findup = require( 'findup-sync' );
    var file = findup( 'package.json' );
    return path.dirname( file );
};
exports.home = exports.findHome();

exports.walk = function walk( dir, done ) {
    var results = [];
    fs.readdir( dir, function( err, list ) {
             if (err) return done(err);
             var i = 0;
             (function next() {
                 var file = list[i++];
                 if (!file) return done(null, results);
                 file = dir + '/' + file;
                 fs.stat(file, function(err, stat) {
                     if (stat && stat.isDirectory()) {
                         walk(file, function(err, res) {
                             results = results.concat(res);
                             next();
                        });
                     } else {
                         results.push(file);
                        next();
                     }
                 });
             })();
         });
};
