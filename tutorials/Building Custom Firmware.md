<!--- Copyright (c) 2020 Mark Becker, Pur3 Ltd. See the file LICENSE for copying permission. -->
Building Custom Firmware
========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Building+Custom+Firmware. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Firmware,Building,Compiling,Custom,Customised,Customise,Customize,bin,hex,LCD_SPI_UNBUF
* USES: EspruinoWiFi

For your project you might want to use an [Espruino WiFi](/WiFi) (or other) board with firmware
that has different features from the Espruino-supplied one. For instance you might
want to add features, or remove some to make more room for storage.

You can do this just by creating your own `BOARD.py` file...

To get started (assuming you have an Espruino WiFi):

* Set up the Espruino build environment like described in
 * [README BuildProcess](https://github.com/espruino/Espruino/blob/master/README_BuildProcess.md)
 * [README Building](https://github.com/espruino/Espruino/blob/master/README_Building.md)
* Clone the [Espruino GitHub Reposutory](https://github.com/espruino/Espruino) locally
* Copy `boards/ESPRUINOWIFI.py` to `boards/ESPRUINOWIFI_CUSTOM.py`

**Note:** The board name file should be only alphanumeric capitals or underscores, starting with a letter (no dashes or lowercase).

### Make changes in ESPRUINOWIFI_CUSTOM.py

Here's what you might do to cut out some un-needed code and
add support for a special LCD display type. For more info on the
[LCD_SPI_UNBUF, click here](/LCD_SPI_UNBUF)


See the comments in-line:

```Python
info : {
    ....
    # Give your board a new name eg. `MYESPRUINOWIFI`, or give
    # your ESPRUINOWIFI_CUSTOM.py board file the *same name*
    # as the existing ESPRUINOWIFI.py file by choosing 'ESPRUINOWIFI'...
    'boardname' : 'MYESPRUINOWIFI',
    ....
    # Reduce number of variables in order to free up more heap/stack
    'variables' : 4000,
    ....
    # Create binaries with customised names
    'binary_name' : 'espruino_%v_wifi_MYESPRUINOWIFI.bin',
    'binaries' : [
      { 'filename' : 'espruino_%v_wifi_MYESPRUINOWIFI.bin', 'description' : "Custom Espruino WiFi build"},
    ],
    'build' : {
        .....
        'libraries' : [
            'USB_HID',
            'NET'
            'GRAPHICS',
    # Remove libraries that are not needed            
            #'TV', # If you're not using PAL TV output
            #'FILESYSTEM', # If you don't need to use SD cards
            'CRYPTO', 'SHA256', 'SHA512',
            'TLS',
            'NEOPIXEL'
    # Add LCD_SPI_UNBUF to handle 16bit color tft lcd displays
            'LCD_SPI_UNBUF'
        ],
     'makefile' : [
         ....
    # Remove WIZNET (Ethernet vi SPI) <- if no plan to use ethernet         
          # 'WIZNET=1', # Add support for W5500 by default
         ....

    # Set SPI buffer transfer size (for LCD_SPI_UNBUF)
         'DEFINES+=-DSPISENDMANY_BUFFER_SIZE=64',
    # add 6x8 font - a nice 255 character font
         'DEFINES+=-DUSE_FONT_6X8',
         ....
      ],
      .....
```

### Build firmware for the custom board

Just run the following commands:

```Bash
export BOARD=ESPRUINOWIFI_CUSTOM
export RELEASE=1

make clean

make
```

The following files will be created:

* `espruino_2v06.83_wifi_MYESPRUINOWIFI.elf`
* `espruino_2v06.83_wifi_MYESPRUINOWIFI.bin`
* `espruino_2v06.83_wifi_MYESPRUINOWIFI.lst`

You can also run `make serialflash` or `make flash` depending
on the board to write the binary directly to the board.

### Flash and check the custom firmware

```JS
>process.env.BOARD
="MYESPRUINOWIFI"

>process.env.MODULES.split(',')
=[
  "Flash",
  "Storage",
  "heatshrink",
  "net",
  "dgram",
  "http",
  "NetworkJS",
  "crypto",
  "neopixel",
  "Wifi",
  "AT"
 ]

process.memory()
={ free: 6950, usage: 50, total: 7000, history: 33,
  gc: 0, gctime: 6.34193420410, blocksize: 16, "stackEndAddress": 536987904, flash_start: 134217728,
  "flash_binary_end": 379352, "flash_code_start": 134283264, flash_length: 524288 }
>
```

And you now have a customised board firmware!
