var MakerPass = require( './' );
var server = new MakerPass( {
    // the interfaces section is required, it indicates the type and
    // configuration options for your hardware interfaces.
    interfaces : [
        // Fake interface, for simulating MakerPass boards in the browser
        { type : 'Fake' },
        // Serial interface
        { type : 'Serial', path : '/dev/tty.usbserial-FTGA2JIW' },
    ],
    webconfig   : {
        // port       : 8080, // change the web interface port
        // disable     : true, // set to true to disable the web interface
        // debug   : true, // set to true to enable debugging

        /* All the webconfig options that follow are available, but you'll
         * probably never actually use them.  The defaults are reasonable, this
         * just shows how you can override them if you really need to.  The
         * values shown are the default values (files and directories are shown
         * relative to the Controller directory).
         *
         *  views   :   'views',
         *  public  :   'public',
         *  favicon :   'public/favicon.ico',
         *  logger  :   'dev',
         */
    },
} );
server.start();
