#include "Globals.h"
#include "HardwareSerial.h"
#include "UI.h"

// command line message buffer and pointer
static uint8_t msg[MAX_MSG_SIZE];
static uint8_t *msg_ptr;

// linked list for command table
static cmd_t *cmd_tbl_list, *cmd_tbl;

void uiPrompt() {
    Serial.println();
    Serial.print( "MAMA> " );
}

void uiParse( char *cmd ) {
    uint8_t argc, i = 0;
    char *argv[30];
    char buf[50];
    cmd_t *cmd_entry;

    fflush( stdout );

    argv[i] = strtok( cmd, " " );
    do {
        argv[++i] = strtok( NULL, " " );
    } while ( ( i < 6 ) && ( argv[i] != NULL ) );
    
    argc = i;

    for (cmd_entry = cmd_tbl; cmd_entry != NULL; cmd_entry = cmd_entry->next)
    {
        if ( strcmp( argv[0], cmd_entry->cmd ) == 0 ) {
            cmd_entry->func( argc, argv );
            uiPrompt();
            return;
        }
    }

    Serial.println( "Command not recognized" );
    uiPrompt();
}

void uiHandler() {
    char c = Serial.read();

    switch ( c ) {
        case '\r':
            *msg_ptr = '\0';
            Serial.println();
            uiParse( (char *)msg );
            msg_ptr = msg;
            break;
    
        case '\b':
            Serial.print( c );
            if ( msg_ptr > msg ) {
                msg_ptr--;
            }
            break;
    
        case '\t':
            // TODO - tab completion!
            break;

        default:
            Serial.print( c );
            *msg_ptr++ = c;
            break;
    }
}

void uiPoll() {
    while ( Serial.available() ) {
        uiHandler();
    }
}

void uiInit( uint32_t speed ) {
    // init the msg ptr
    msg_ptr = msg;

    // init the command table
    cmd_tbl_list = NULL;

    // set the serial speed
    Serial.begin( speed );
}

void uiCmd( char *name, void (*func)(int argc, char **argv) ) {
    cmd_tbl = (cmd_t *)malloc(sizeof(cmd_t));
    char *cmd_name = (char *)malloc(strlen(name)+1);

    strcpy(cmd_name, name);

    cmd_name[strlen(name)] = '\0';

    cmd_tbl->cmd = cmd_name;
    cmd_tbl->func = func;
    cmd_tbl->next = cmd_tbl_list;
    cmd_tbl_list = cmd_tbl;
}

// strtol(str, NULL, base);
