#ifndef MAKERPASSMAN_H
#define MAKERPASSMAN_H

#include <Arduino.h>
#include "Timer.h"

#define OFF 0
#define ERROR 1
#define WARNING 2
#define AUTHORIZED 3
#define BUSY 4

// LED status pin and status levels
#define statusLedPin_R A0
#define statusLedPin_G A1
#define statusLedPin_B A2

#define SUPERVISOR_ENABLE_VALUE HIGH
#define SUPERVISOR_DISABLE_VALUE LOW

Timer t;
int8_t currentTimerId = -1;
int8_t currentOutput = -1;
// int8_t activeTimers[] = {-1,-1,-1,-1,-1,-1,-1,-1,-1,-1};


void setStatus( uint8_t status = OFF )
{
	switch ( status )
	{
		case ERROR:
			analogWrite( statusLedPin_R , 0xff );
			analogWrite( statusLedPin_G , 0x00 );
			analogWrite( statusLedPin_B , 0x00 );
			break;

		case WARNING:
			analogWrite( statusLedPin_R , 0xff );
			analogWrite( statusLedPin_G , 0xbb );
			analogWrite( statusLedPin_B , 0x00 );
			break;

		case AUTHORIZED:
			analogWrite( statusLedPin_R , 0x00 );
			analogWrite( statusLedPin_G , 0xff );
			analogWrite( statusLedPin_B , 0x00 );
			break;

		case BUSY:
			analogWrite( statusLedPin_R , 0x00 );
			analogWrite( statusLedPin_G , 0x00 );
			analogWrite( statusLedPin_B , 0xff );
			break;

		default:
			analogWrite( statusLedPin_R , 0x00 );
			analogWrite( statusLedPin_G , 0x00 );
			analogWrite( statusLedPin_B , 0x00 );
			break;
	}
}

/*
void setStatus_OFF() { setStatus( OFF ); }
void setStatus_ERROR() { setStatus( ERROR ); }
void setStatus_WARNING() { setStatus( WARNING ); }
void setStatus_AUTHORIZED() { setStatus( AUTHORIZED ); }
void setStatus_BUSY() { setStatus( BUSY ); }

void setStatusBlink_AUTHORIZED()
{
	// if ( millis() / 2 == 0 )
	if( ( millis() & 0x01 ) == 0) 
	{
		setStatus( AUTHORIZED );
	} else
	{
		setStatus( OFF );
	}
}
*/

void resetSupervisorIds()
{
	currentTimerId = -1;
	currentOutput = -1;
}

void supervisorDisableSystem()
{
	#if DEBUG
		Serial.println( F( "Disable System and Outputs." ) );
	#endif
	digitalWrite( currentOutput , SUPERVISOR_DISABLE_VALUE );
}

void supervisorStopTimer()
{
	#if DEBUG
		Serial.println( F( "Disable System." ) );
	#endif
	setStatus( BUSY );
	supervisorDisableSystem();
	t.stop( currentTimerId );
	resetSupervisorIds();
	setStatus( OFF );
}

uint16_t supervisorEnableSystem( uint16_t timeToEnable , uint8_t outputNum )
{
	setStatus( AUTHORIZED );

	currentOutput = outputNum;
	pinMode( currentOutput , OUTPUT );
	digitalWrite( currentOutput , SUPERVISOR_ENABLE_VALUE );

	#if DEBUG
		Serial.print( F( "Enable System for (sec): " ) );
		Serial.print( timeToEnable );
		Serial.print( F( "Start Timer ID = " ) );
		Serial.print( currentTimerId );
	#endif
	return 1;
}

void supervisorStartTimer( uint16_t timeToEnable , uint8_t outputNum )
{
	currentTimerId = t.after( ( timeToEnable * 1000 ) , supervisorStopTimer );
	supervisorEnableSystem( timeToEnable , outputNum );
}

void supervisorInit( )
{
}

void supervisorPoll(  )
{
	t.update();
}

#endif
