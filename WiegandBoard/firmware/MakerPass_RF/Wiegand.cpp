#include <Arduino.h>
#include "Globals.h"
#include "Wiegand.h"
// #include "MakerPassMan.h"

unsigned char databits[ WIEGAND_MAX_BITS ];  // stores all of the data bits
unsigned char bitCount;              // number of bits currently captured
unsigned char flagDone;              // goes low when data is currently being captured
unsigned int wiegand_counter;        // countdown until we assume there are no more bits

void ISR_INT0() {
#if DEBUG
    Serial.print( "0" );
#endif
    databits[ bitCount++ ] = 0;
    flagDone = 0;
    wiegand_counter = WIEGAND_WAIT_TIME;
}

void ISR_INT1() {
#if DEBUG
    Serial.print( "1" );
#endif
    databits[ bitCount++ ] = 1;
    flagDone = 0;
    wiegand_counter = WIEGAND_WAIT_TIME;
}

void wiegandInit() {
    pinMode( 2, INPUT ); // INT0
    pinMode( 3, INPUT ); // INT1

    attachInterrupt( 0, ISR_INT0, FALLING );
    attachInterrupt( 1, ISR_INT1, FALLING );

    wiegand_counter = WIEGAND_WAIT_TIME;
}

uint32_t wiegandPoll()
{
	// flagDone is '0' while data was being captured
	// if this method is running, data should be captured
    if ( ! flagDone )
	{
        if ( --wiegand_counter == 0 ) flagDone = 1;
    }

    if ( bitCount > 0 && flagDone )
	{
		// setStatus( BUSY );
        uint8_t i;
        uint32_t card = 0;

        for ( i = 0 ; i < bitCount ; i++ )
		{
            card <<= 1;
            card |= databits[i];
        }
		
		// if ( ! ( bitCount == 26 ) )
		// {
			// return 0;
		// }

		#if DEBUG
			Serial.println();
			Serial.print( "Wiegand: Read " );
			Serial.print( bitCount );
			Serial.println( " bits. " );
			Serial.print( "{CARD=" );
			Serial.print( card );
			Serial.println( "}" );
		#endif

        bitCount = 0;
        return card;
    }
	return 0;
}
