<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Advanced Debug
============

If you're developing the Espruino Interpreter itself you'll probably want a proper debugger. We'd suggest using an STM32DISCOVERY board (not the VLDISCOVERY), disconnecting the two ST-LINK jumpers, and connect wires onto the 6 pin SWD connector as follows:

| Discovery Pin  | Name | Espruino Pin |
|----------------|------|--------------|
| 1 | VDD Target | 3.3v |
| 2 | SWCLK      | A14 |
| 3 | GND        | GND |
| 4 | SWDIO      | A13 |
| 5 | NRST       | RST | 
| 6 | SWO        | B3 |

You can then use a normal debugger such as [st-link](https://github.com/texane/stlink) on linux.

Gotchas
------

* You'll want to compile with DEBUG=1 in order to save the relevant debug info into the binary.
* Initially you may not be able to flash Espruino. This is because the SWD pins are disabled and used for status LEDs. You'll need to connect BOOT0 to 3.3v and reset, which stops Espruino itself booting and reclaiming the SWD pins.
* After you've flashed, you will have the same problem. You need to edit ```targets/stm32/jshardware.c```, remove the line containing ```GPIO_Remap_SWJ_Disable```, and recompile (this should happen when DEBUG=1 on the command-line).
