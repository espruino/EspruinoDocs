<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Advanced Debug
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/AdvancedDebug. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Debug,SWD,JTAG,ICD,STLink,ST-Link
* USES: Espruino Board,Pico

While Espruino can be compiled and debugged on a Host PC, sometimes you'll need to be able to debug the hardware itself.

* On STM32-based devices you can do this using SWD pins and an ST-Link device, see below.
* On Nordic-based devices you need to connect a Nordic [nRF52832DK](/nRF52832DK) to
the two labelled SWD pins. **This is not covered on this page**.

We'd suggest using an STM32DISCOVERY board (not the VLDISCOVERY).

Make sure you disconnect the two ST-LINK jumpers first, then connect as detailed below. You can then use a normal debugger such as [st-link](https://github.com/texane/stlink) on linux.

Original Espruino Board
--------------------

Connect wires onto the 6 pin SWD connector as follows:

| Pin No. | F3/F4 Discovery Pin  | Espruino Pin |
|----------------|------|--------------|
| 1 | VDD Target | |
| 2 | SWCLK      | A14 |
| 3 | GND        | GND |
| 4 | SWDIO      | A13 |
| 5 | NRST       | |
| 6 | SWO        | |

Espruino Pico
--------------------

The Six SWD connections are available on six circular pads on the back of the [[Pico]]. Pin one is unmarked, but is nearest the USB connector.

You only actually need to connect pins 2,3 and 4 - but you can connect more if you want to.

Espruino WiFi
--------------------

SWD SWCLK and SWDIO are available via two labelled circular pads on the top of the board, by the USB connector.

Gotchas
------

* You'll need to remove `USE_BOOTLOADER=1` from the Makefile (under `else ifdef ESPRUINO_1V3`), and `'bootloader' : 1,` from `ESPRUINOBOARD.py` or `PICO_XX.py`
* You'll want to make with `DEBUG=1` in order to save the relevant debug info into the binary.
* You may also want to remove `USE_NET`, `USE_GRAPHICS`, `USE_FILESYSTEM` and whatever you're not interested in, to ensure that the binary (with debug info) fits in available flash
* (Non-Pico) You may also need to unsolder LED1 and LED2 (or their resistors), as these use the (usually useless!) SWD debug pins
* (Non-Pico) You need to edit ```targets/stm32/jshardware.c```, remove the line containing ```GPIO_Remap_SWJ_Disable```
* (Non-Pico) Initially won't be able to flash Espruino. This is because the SWD pins are disabled and used for status LEDs. You'll need to connect `BOOT0` to `3.3v` and tap reset, which stops Espruino itself booting and reclaiming the SWD pins.
* When trying to debug, you may find that your PC doesn't recognise the Espruino as a USB device. To solve this, power the Espruino up without USB and start the debugger. Then plug into USB when the firmware is actually running.

Phew. Finally (if you have the [st-link tools](https://github.com/texane/stlink) installed and on your path), you can flash Espruino, with:

```Bash
DEBUG=1 ESPRUINO_1V3=1 make flash
# or
DEBUG=1 PICO_1V3=1 make flash
```

You can then debug by running:

```Bash
st-util
```

in one window, and:

```Bash
DEBUG=1 ESPRUINO_1V3=1 make gdb
#or
DEBUG=1 PICO_1V3=1 make gdb
```

in the other.

There are some useful functions defined in `.gdinit` if you plan on debugging the interpreter - but if you're doing that we'd strongly suggest you try and debug a normal Linux executable of Espruino first, and only move onto actual hardware if you can't fix the problem there.
