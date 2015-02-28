var _ = require( 'underscore' ),
    chai = require( 'chai' ),
    should = chai.should();

var testconfig = {
    id              : 'test',
    authid          : 'test.auth.id',
    inputs          : {
        1   : 'test_input_1',
        2   : 'test_input_2',
        3   : { name : 'test_input_3' },
    },
    outputs         : {
        1   : 'test_output_1',
        2   : 'test_output_2',
        3   : { name : 'test_output_3' },
    },
    variables       : {
        'test_var'      : 'counter',
        'test_timer'    : { type : 'timer' },
    },
    events          : {
        'test_event_1'  : [
            'test_counter = 100',
            'test_counter.incr',
        ],
        'test_event_2'  : [
            'test_timer = 10s',
        ],
    },
};

describe( 'node', function() {

    var MPNode = require( '../lib/makerpass/node' );

    it( 'should be a function', function() {
        MPNode.should.be.a( 'function' );
    } );

    var node = new MPNode( testconfig );

    describe( '.inputs', function() {
        it( 'should exist', function() {
            node.should.have.property( 'inputs' );
        } );
        it( 'should be an array', function() {
            node.inputs.should.be.an( 'array' );
        } );
        it( 'should have 3 entries', function() {
            node.inputs.should.have.length( 3 );
        } );
    } );
    describe( '.outputs', function() {
        it( 'should exist', function() {
            node.should.have.property( 'outputs' );
        } );
        it( 'should be an array', function() {
            node.outputs.should.be.an( 'array' );
        } );
        it( 'should have 3 entries', function() {
            node.outputs.should.have.length( 3 );
        } );
    } );
    describe( '.variables', function() {
        it( 'should exist', function() {
            node.should.have.property( 'variables' );
        } );
        it( 'should be an array', function() {
            node.variables.should.be.an( 'array' );
        } );
        it( 'should have 2 entries', function() {
            node.variables.should.have.length( 2 );
        } );
    } );
    describe( '.events', function() {
        it( 'should exist', function() {
            node.should.have.property( 'events' );
        } );
        it( 'should be an array', function() {
            node.events.should.be.an( 'array' );
        } );
        it( 'should have 2 entries', function() {
            node.events.should.have.length( 2 );
        } );
    } );
    describe( '.addval', function() {
        it( 'should exist', function() {
            node.should.have.property( 'addval' );
        } );
        it( 'should be a function', function() {
            node.addval.should.be.a( 'function' );
        } );
        it( 'should throw if called without type ', function() {
            should.Throw( function() { node.addval() } );
        } );
        it( 'should throw if called with invalid type ', function() {
            should.Throw( function() { node.addval( 'blah', {} ) } );
        } );
    } );
} );
