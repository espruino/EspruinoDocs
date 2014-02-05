<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Advanced Debug
============

* KEYWORDS: Debug,SWD,JTAG,ICD

If you're developing the Espruino Interpreter itself you'll probably want a proper debugger. We'd suggest using an STM32DISCOVERY board (not the VLDISCOVERY), disconnecting the two ST-LINK jumpers, and connect wires onto the 6 pin SWD connector as follows:

| F3/F4 Discovery Pin  | Espruino Pin |
|----------------|------|--------------|
| 1 | VDD Target | |
| 2 | SWCLK      | A14 |
| 3 | GND        | GND |
| 4 | SWDIO      | A13 |
| 5 | NRST       | | 
| 6 | SWO        | |

You can then use a normal debugger such as [st-link](https://github.com/texane/stlink) on linux.

Gotchas
------

* You'll need to remove `USE_BOOTLOADER=1` from the Makefile (under `else ifdef ESPRUINO_1V3`), and `'bootloader' : 1,` `from ESPRUINOBOARD.py`
* You'll want to make with `DEBUG=1` in order to save the relevant debug info into the binary.
* You may also want to remove `USE_NET`, `USE_GRAPHICS`, `USE_FILESYSTEM` and whatever you're not interested in, to ensure that the binary (with debug info) fits in available flash
* You may also need to unsolder LED1 and LED2 (or their resistors), as these use the (usually useless!) SWD debug pins
* You need to edit ```targets/stm32/jshardware.c```, remove the line containing ```GPIO_Remap_SWJ_Disable```
* Initially won't be able to flash Espruino. This is because the SWD pins are disabled and used for status LEDs. You'll need to connect `BOOT0` to `3.3v` and tap reset, which stops Espruino itself booting and reclaiming the SWD pins.

Phew. Finally (if you have the [st-link tools](https://github.com/texane/stlink) installed and on your path), you can flash Espruino, with:

```DEBUG=1 ESPRUINO_1V3=1 make flash```

You can then debug by running:

```st-util```

in one window, and:

```DEBUG=1 ESPRUINO_1V3=1 make gdb```

in the other.

There are some useful functions defined in `.gdinit` if you plan on debugging the interpreter - but if you're doing that we'd strongly suggest you try and debug a normal Linux executable of Espruino first, and only move onto actual hardware if you can't fix the problem there.
