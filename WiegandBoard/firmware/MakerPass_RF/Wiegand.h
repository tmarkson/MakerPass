#ifndef WIEGAND_H
#define WIEGAND_H

#define WIEGAND_MAX_BITS    1000
#define WIEGAND_WAIT_TIME   1000

#include <stdint.h>

void wiegandInit();
uint32_t wiegandPoll();
void wiegandDump();

#endif
