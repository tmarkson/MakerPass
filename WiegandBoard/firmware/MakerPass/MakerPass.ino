#include "Globals.h"
#include "UI.h"
#include "Wiegand.h"
#include <EEPROM.h>

#define SETTINGS_VERSION "MP0000"
#define SETTINGS_START 32

struct settingsStruct {
    char id[16];
    uint32_t speed;
    int inputs[32];
    int outputs[32];
    char settings_version[8];
} settings = {
    "",     // id
    9600,   // speed
    {},     // inputs
    {},     // outputs
    SETTINGS_VERSION
};

bool validateSettings() {
    int readfrom = SETTINGS_START + sizeof( settings ) - 8;
    for ( int i = 0 ; i < 8 ; i++ ) {
        if ( EEPROM.read( readfrom + i ) != SETTINGS_VERSION[i] ) {
            Serial.println( "Invalid settings!" );
            return false;
        }
    }
    return true;
}       

void loadSettings() {
    if ( ! validateSettings() ) return;
    for ( unsigned int t = 0 ; t < sizeof( settings ) ; t++ ) {
        *( (char*) &settings + t ) = EEPROM.read( SETTINGS_START + t );
    }
}

void saveSettings() {
    for ( unsigned int t = 0 ; t < sizeof( settings ) ; t++ ) {
        EEPROM.write( SETTINGS_START + t, *( (char*) &settings + t ) );
    }
}   

void setup() {
    loadSettings();

    uiInit( settings.speed );
    wiegandInit();

    uiCmd( "settings", CMD_settings );
    uiCmd( "load", CMD_loadsettings );
    uiCmd( "save", CMD_savesettings );
    uiCmd( "validate", CMD_validatesettings );
    uiCmd( "id", CMD_id );
    uiCmd( "speed", CMD_speed );
    uiCmd( "on", CMD_on );
    uiCmd( "off", CMD_off );
    uiCmd( "ipin", CMD_ipin );
    uiCmd( "opin", CMD_opin );

    pinMode( 13, OUTPUT );
}

void loop() {
    uiPoll();
    wiegandPoll();
}

void CMD_id ( int argc, char **argv ) {
    if ( argc > 1 )
        strlcpy( settings.id, argv[1], 15 );
    Serial.print( "Node ID: " );
    Serial.println( settings.id );
}

void CMD_ipin ( int argc, char **argv ) {
    int input, pin;
    if ( argc > 1 )
        input = atoi( argv[1] );
    if ( argc > 2 )
        settings.inputs[ input ] = atoi( argv[2] );

    pin = settings.inputs[ input ];
    Serial.print( "IN" );
    Serial.print( input );
    if ( pin > 0 ) {
        Serial.print( " = pin" );
        Serial.println( pin );
    } else {
        Serial.println( " is not configured" );
    }
}

void CMD_opin ( int argc, char **argv ) {
    int output, pin;
    if ( argc > 1 )
        output = atoi( argv[1] );
    if ( argc > 2 )
        settings.outputs[ output ] = atoi( argv[2] );
    Serial.print( "OUT" );
    Serial.print( output );
    Serial.print( " = pin" );
    Serial.println( pin );
}

void CMD_pins ( int argc, char **argv ) {
    // inputs
    for ( int i = 0 ; i < 32 ; i++ ) {
        if ( settings.inputs[i] > 0 ) {
            Serial.print( "IN" );
            Serial.print( i );
            Serial.print( " = pin" );
            Serial.println( settings.inputs[i] );
        }
    }
    // outputs
    for ( int i = 0 ; i < 32 ; i++ ) {
        if ( settings.outputs[i] > 0 ) {
            Serial.print( "OUT" );
            Serial.print( i );
            Serial.print( " = pin" );
                Serial.println( settings.outputs[i] );
        }
    }
}

void CMD_speed ( int argc, char **argv ) {
    if ( argc > 1 )
        settings.speed = atol( argv[1] );
    Serial.print( "Speed: " );
    Serial.println( settings.speed );
}

void CMD_settings ( int argc, char **argv ) {
    Serial.println( "### Current Configuration ###" );
    Serial.print( "Node ID: " );
    Serial.println( settings.id );
    Serial.print( "Speed:   " );
    Serial.println( settings.speed );
}

void CMD_loadsettings ( int argc, char **argv ) {
    loadSettings();
}

void CMD_savesettings ( int argc, char **argv ) {
    saveSettings();
}

void CMD_validatesettings ( int argc, char **argv ) {
    if ( validateSettings() ) {
        Serial.println( "Settings are valid" );
    } else {
        Serial.println( "Settings are NOT valid!" );
    }
}

void CMD_hello( int arg_cnt, char **args ) {
    Serial.println( "Hello world" );
}

void CMD_on( int arg_cnt, char **args ) {
    Serial.println( "on" );
    digitalWrite( 13, HIGH );
}

void CMD_off( int arg_cnt, char **args ) {
    Serial.println( "off" );
    digitalWrite( 13, LOW );
}
