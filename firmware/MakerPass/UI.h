#ifndef UI_H
#define UI_H

#define MAX_MSG_SIZE    60
#include <stdint.h>

// command line structure
typedef struct _cmd_t {
    char *cmd;
    void (*func)(int argc, char **argv);
    struct _cmd_t *next;
} cmd_t;

void uiInit( uint32_t speed );
void uiPoll();
void uiCmd( char *name, void (*func)(int argc, char **argv) );

#endif
