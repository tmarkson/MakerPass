var MPNode = function( config ) {
    _.extend( this, config );
    console.log( this );
    // this.id
    // this.authid
    // this.inputs
    // this.outputs
    // this.variables
    // this.events
    // this.lastMessageTime
    // this.totalMessages
    // this.lastCardScanned

        _.each( this.inputs, function( input ) {
            input.value = input.value || 0;
        } );
        _.each( this.outputs, function( output ) {
            output.state = output.state || 0;
        } );
        _.each( this.variables, function( variable ) {
            variable.value = variable.value || 0;
        } );

    var vals = this.vals = {};
    var valsources = [ this.inputs, this.outputs, this.variables ];
    _.each( valsources, function( src ) {
        _.each( src, function ( item ) {
            vals[ item.name || item.id ] = item;
        } );
    } );
    this.connect();

    var self = this;
    //$( function() {
        console.log( 'initpage' );
        self.msgbuilder( '#sendmesg' );
        self.msgbuilder( '#sendcard', 'CARD', function( value ) {
            self.lastCardScanned = value;
            self.updateValue( 'lastCardScanned' );
        } );
        self.updateValue();

        $( 'a.value' ).click( function( ev ) {
            console.log( 'click', ev );
        } );
    //} );
};

MPNode.prototype.val = function val( name ) {
    return this.vals[ name ];
};

MPNode.prototype.updateValue = function updateValue( name ) {
    console.log( 'updateValue' );
    var self = this;

    var el = name
        ? $( '.value[data-name=' + name + ']' )
        : $( '.value' );

    el.each( function( i, obj ) {
        var data = obj.dataset;
        var name = data.name;
        var type = data.type;
        var html;
        if ( type === 'info' ) {
            console.log( 'info', name, type );
            var val = self[ name ];
            $( this ).html( val );
            return;
        }

        var item = self.val( name );
        if ( type === 'input' ) {
            var value = item.value;
            if ( value === undefined ) {
                html = '<i class="fa fa-question"></i> unknown';
            } else if ( value === 0 ) {
                html = '<i class="fa fa-circle-o"></i> off';
            } else if ( value === 1023 ) {
                html = '<i class="fa fa-circle"></i> on';
            } else if ( value > item.threshold ) {
                html = '<i class="fa fa-circle"></i> on (' + value + ')';
            } else {
                html = '<i class="fa fa-circle-o"></i> off (' + value + ')';
            }
        } else if ( type === 'output' ) {
            if ( item.state === undefined ) {
                html = '<i class="fa fa-question"></i> unknown';
            } else if ( item.state ) {
                html = '<i class="fa fa-circle"></i> on';
            } else {
                html = '<i class="fa fa-circle-o"></i> off';
            }
        } else if ( type === 'variable' ) {
            if ( item.value === undefined ) {
                html = '<i class="fa fa-question"></i> unknown';
            } else {
                html = '<i class="fa fa-tag"></i> ' + item.value;
            }
        }
        $( this ).html( html );
    } );
};

MPNode.prototype.msgbuilder = function msgbuilder( selector, prepend, also ) {
    var self = this;
    $( selector ).keydown( function( ev ) {
        if ( ev.which === 13 ) { // enter
            var value = $( ev.target ).val();
            var msg = value;
            if ( prepend ) msg = prepend + ' ' + msg;
            self.logMessage( 'user', msg );
            self.send( msg );
            $( ev.target ).val( "" );
            ev.preventDefault();
            $( ev.target ).blur();
            if ( typeof also === 'function' ) also( value );
        }
        if ( ev.which === 27 ) { // escape
            $( ev.target ).val( "" );
            ev.preventDefault();
            $( ev.target ).blur();
        }
    } );
};

MPNode.prototype.logMessage = function logMessage( dir, msg ) {
    var icons = {
        to      : '<i class="fa fa-li fa-hand-o-right"></i>',
        from    : '<i class="fa fa-li fa-hand-o-left"></i>',
        user    : '<i class="fa fa-li fa-user"></i>',
    };
    var icon = icons[ dir ];
    $( '#msglog' ).append( "<li>" + icon + msg + "</li>" );
    $( '#msglog' ).children().slice( 0, -20 ).remove();
};

MPNode.prototype.parseMessage = function parseMessage( msg ) {
    var tokens = msg.split( ' ' );
    var target = tokens.shift();
    if ( ! ( ~ target.indexOf( '*' ) || target == this.id ) ) return false;

    this.logMessage( 'to', tokens.join( ' ' ) );
    var cmd = tokens.shift().toUpperCase();
    var func = this[ 'cmd_' + cmd ];

    if ( typeof func == 'function' ) {
        func.apply( this, tokens );
    }
};

MPNode.prototype.cmd_IDENT = function cmd_IDENT() {
    this.send( 'IDENT', this.id );
};

MPNode.prototype.cmd_PING = function cmd_PING() {
    this.send( 'PONG' );
};

MPNode.prototype.connect = function connect() {
    var node = this;
    var socket = io.connect();
    socket.on( 'message', function( msg ) {
        node.totalMessages++;
        node.updateValue( 'totalMessages' );
        node.lastMessageTime = new Date();
        node.updateValue( 'lastMessageTime' );
        node.parseMessage( msg );
    } );
    this.socket = socket;
};

MPNode.prototype.send = function send() {
    var msg = _.toArray( arguments ).join( ' ' );
    this.logMessage( 'from', msg );
    if ( this.socket ) {
        this.socket.emit( 'message', this.id + ' ' + msg );
    } else {
        console.error( "Attempt to send message before connected" );
    }
};
