/* MakerPass RF edition

  At the machine: Arduino promini + hoperf hm-trp radio

  In the middle: hoperf radio + ftdi cable + restful translator
  
  In the backend: restful api + user db

  TODO list ==============================
  - restart timer after duplicate card swipe
  - make supervisorStartTimer handle multiple outputs
  - try faster baud rates on radios
  - format all responses in json
  - implement print for all settings in CMD_settings
  - fix save and load settings methods
  - should commands be halted if it contains more than appropriate number of params?
  - auto reset after no comms period?
  - reset command? 
  - heartbeat? 
*/

#include "Globals.h"
#include "UI.h"
#include "Wiegand.h"
#include "MakerPassMan.h"
#include <EEPROM.h>
#include <MemoryFree.h>

#define SETTINGS_VERSION "MP0000"
#define SETTINGS_START 32

struct settingsStruct {
	char id[16];
	uint32_t speed;
	int inputs[32];
	int outputs[32];
	char settings_version[8];
} settings =
{
	"mp01",	 // id
	9600,   // speed
	{0,A0,A1,A2,A3,A4,A5},	 // inputs
	{0,4,5,6,7,8,9,10},	 // outputs
	SETTINGS_VERSION
};

bool validateSettings() {
	int readfrom = SETTINGS_START + sizeof( settings ) - 8;
	for ( int i = 0 ; i < 8 ; i++ ) {
		if ( EEPROM.read( readfrom + i ) != SETTINGS_VERSION[i] )
		{
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

void printUserId( uint32_t a )
{
	Serial.print( F( "{\"node_id\":\"" ) );
	Serial.print( settings.id );
	Serial.print( F( "\",\"user_id\":\"" ) );
	Serial.print( a );
	Serial.println( F( "\"}" ) );
}

void sendGreeting( )
{
	Serial.print( settings.id );
	Serial.println( F( " starting up." ) );
}

void setup()
{
	loadSettings();

	// sendGreeting();

	supervisorInit();

	uiInit( settings.speed );

	wiegandInit();

	uiCmd( "settings", CMD_settings );
	uiCmd( "load", CMD_loadsettings );
	uiCmd( "save", CMD_savesettings );
	uiCmd( "validate", CMD_validatesettings );
	uiCmd( "pins", CMD_pins );
	uiCmd( "timer", CMD_timer );
	uiCmd( "set", CMD_set );
	uiCmd( "get", CMD_get );

	// uiCmd( "id", CMD_id );
	// uiCmd( "speed", CMD_speed );
	// uiCmd( "on", CMD_on );
	// uiCmd( "off", CMD_off );
	// uiCmd( "ipin", CMD_ipin );
	// uiCmd( "opin", CMD_opin );

	setStatus( OFF );
	delay(200);
	setStatus( ERROR );
	delay(200);
	setStatus( WARNING );
	delay(200);
	setStatus( AUTHORIZED );
	delay(200);
	setStatus( BUSY );
	delay(200);
	setStatus( OFF );

	supervisorDisableSystem( );
}

void loop()
{
	supervisorPoll( );

	uiPoll( settings.id );

	uint32_t user_id = wiegandPoll();
	if ( user_id > 0 )
	{
		printUserId( user_id );
		#if DEBUG
			Serial.println( freeMemory() );
		#endif
	}
}


void CMD_settings ( int argc, char **argv )
{
	Serial.print( F( "{\"node_id\":\"" ) );
	Serial.print( settings.id );
	Serial.print( F( "\",\"node_speed\":\"" ) );
	Serial.print( settings.speed );
	Serial.println( F( "\"}" ) );
}

void CMD_loadsettings ( int argc, char **argv ) {
	loadSettings();
}

void CMD_savesettings ( int argc, char **argv ) {
	saveSettings();
}

void CMD_validatesettings ( int argc, char **argv ) {
	Serial.print( F( "{\"node_id\":\"" ) );
	Serial.print( settings.id );
	Serial.print( F( "\",\"node_message\":\"" ) );
	if ( validateSettings() )
	{
		Serial.print( F( "Settings are valid" ) );
	} else
	{
		Serial.print( F( "Settings are NOT valid!" ) );
	}
	Serial.println( F( "\"}" ) );
}

// TODO fix this and outputs with json arrays
void CMD_pins ( int argc, char **argv ) {
	Serial.print( F( "{\"node_id\":\"" ) );
	Serial.print( settings.id );
	/* INPUTS */
	for ( int i = 0 ; i < 32 ; i++ )
	{
		if ( settings.inputs[i] > 0 )
		{
			Serial.print( F( "\",\"node_input_pin\":\"" ) );   
			Serial.print( settings.inputs[i] );
		}
	}

	/* OUTPUTS */
	for ( int i = 0 ; i < 32 ; i++ )
	{
		if ( settings.outputs[i] > 0 )
		{
			Serial.print( F( "OUT" ) );
			Serial.print( i );
			Serial.print( F( " = pin" ) );
			Serial.println( settings.outputs[i] );
		}
	}
}

void CMD_timer ( int argc, char **argv )
{
	uint8_t state=0, output=0;
	Fstr *message;

	if ( argc < 3 )
	{
		message = F( "Timer not started." );
	} else
	{
		output = atoi( argv[3] );
		supervisorStartTimer( atoi( argv[2] ) , settings.outputs[ output ] );
		message = F( "Timer started." );
	}
	Serial.print( F( "{\"node_id\":\"" ) );
	Serial.print( settings.id );
	Serial.print( F( "\",\"node_message\":\"" ) );
	Serial.print( message );
	Serial.println( F( "\"}" ) );
}


void CMD_get( int argc, char **argv )
{
	if ( argc < 3 ) return;

	uint8_t input=0, pin=0;
	uint16_t reading=0;

	if ( argc > 2 ) input = atoi( argv[2] );

	#if DEBUG
		Serial.print( F( "arg count = " ) );
		Serial.println( argc );
	#endif

	pin = settings.inputs[ input ];

	pinMode( pin , INPUT );

	for ( uint8_t i = 0 ; i < INPUTS_SAMPLE_COUNT ; i++ )
	{
		reading += analogRead( pin );
		#if DEBUG
			Serial.print( pin );
			Serial.println( F( " read." ) );
		#endif
	}

	reading /= INPUTS_SAMPLE_COUNT;

	Serial.print( F( "{\"node_id\":\"" ) );
	Serial.print( settings.id );
	Serial.print( F( "\",\"node_message\":\"" ) );
	Serial.print( F( "input" ) );
	Serial.print( input );
	Serial.print( F( "=" ) );
	Serial.print( reading );
	Serial.println( F( "\"}" ) );
}

void CMD_set( int argc, char **argv )
{
	if ( argc < 3 ) return;

	uint8_t state=0, output=0, pin=0;

	if ( argc > 2 ) output = atoi( argv[2] );
	if ( argc > 3 ) state = atoi( argv[3] );

	#if DEBUG
		Serial.print( F( "arg count = " ) );
		Serial.println( argc );
	#endif

	Serial.print( F( "{\"node_id\":\"" ) );
	Serial.print( settings.id );
	Serial.print( F( "\",\"node_message\":\"" ) );

	// range check for output value
	if ( !( output <= 31 && output >= 0) )
	{
		Serial.print( F( "Output value out of range! " ) );
		Serial.println( F( "\"}" ) );
		return;
	}

	pin = settings.outputs[ output ];

	// check for state value
	// if state is valid, set pin to desired state
	if ( state == 0 || state == 1 )
	{
		pinMode( pin , OUTPUT );
		digitalWrite( pin , state );
	}
	else if ( state <= 255 )
	{
		pinMode( pin , OUTPUT );
		analogWrite( pin , state );
	}
	else
	{
		Serial.print( F( "Invalid state value!" ) );
		Serial.println( F( "\"}" ) );
		return;
	}

	#if DEBUG
		Serial.print( settings.id );
		Serial.print( F( " output" ) );
		Serial.print( output );
		Serial.print( F( "=" ) );
		Serial.println( state );
	#endif

	Serial.print( F( "output OK" ) );
	Serial.println( F( "\"}" ) );
}


/*
void CMD_id ( int argc, char **argv ) {
	if ( argc > 2 )
		strlcpy( settings.id, argv[2], 15 );
	#if DEBUG
		Serial.print( "Node ID: " );
		Serial.println( settings.id );
	#endif
}

void CMD_ipin ( int argc, char **argv ) {
	int input, pin;
	if ( argc > 2 )
		input = atoi( argv[2] );
	if ( argc > 3 )
		settings.inputs[ input ] = atoi( argv[3] );

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
	if ( argc > 2 )
		output = atoi( argv[2] );
	if ( argc > 3 )
		settings.outputs[ output ] = atoi( argv[3] );
	Serial.print( "OUT" );
	Serial.print( output );
	Serial.print( " = pin" );
	Serial.println( pin );
}

void CMD_speed ( int argc, char **argv ) {
	if ( argc > 2 )
		settings.speed = atol( argv[2] );

	if ( DEBUG )
	{
	Serial.print( "Speed: " );
	Serial.println( settings.speed );
	}
}

void CMD_hello( int arg_cnt, char **args ) {
	Serial.println( "Hello world" );
}

void CMD_on( int arg_cnt, char **args ) {
	#if DEBUG
		Serial.println( "on" );
	#endif
	digitalWrite( 13, HIGH );
}

void CMD_off( int arg_cnt, char **args ) {
	#if DEBUG
		Serial.println( "off" );
	#endif
	digitalWrite( 13, LOW );
}

*/