#include <Arduino.h>
#include "Globals.h"
#include "Wiegand.h"

unsigned char databits[ WIEGAND_MAX_BITS ];  // stores all of the data bits
unsigned char bitCount;              // number of bits currently captured
unsigned char flagDone;              // goes low when data is currently being captured
unsigned int wiegand_counter;        // countdown until we assume there are no more bits

void ISR_INT0() {
#ifdef DEBUG
    Serial.print( "0" );
#endif
    databits[ bitCount++ ] = 0;
    flagDone = 0;
    wiegand_counter = WIEGAND_WAIT_TIME;
}

void ISR_INT1() {
#ifdef DEBUG
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

void wiegandPoll() {
    if ( ! flagDone ) {
        if ( --wiegand_counter == 0 ) flagDone = 1;
    }

    if ( bitCount > 0 && flagDone ) {
        unsigned char i;
        unsigned long card = 0;

#ifdef DEBUG
        Serial.println();
        Serial.print( "Wiegand: Read " );
        Serial.print( bitCount );
        Serial.println( " bits. " );
#endif

        for ( i = 0 ; i < bitCount ; i++ ) {
            card <<= 1;
            card |= databits[i];
        }
        Serial.print( "{CARD=" );
        Serial.print( card );
        Serial.println( "}" );

        bitCount = 0;
    }
}
