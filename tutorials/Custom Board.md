<!--- Copyright (c) 2020 Mark Becker, Pur3 Ltd. See the file LICENSE for copying permission. -->
Custom Board
======================

For your project you like to used a ESPPRUINOWIFI board in a different way as distributed.

* setup the Esrupino build environment like described in 

 * [README BuildProcess](https://github.com/espruino/Espruino/blob/master/README_BuildProcess.md)
 * [README Building](https://github.com/espruino/Espruino/blob/master/README_Building.md)

### Create the custom board 

* copy boards/ESPRUINOWIFI.py to boards/ESPRUINOWIFI_CUSTOM.py 

### Think about required changes

* give your board a name eg MYESPRUINOWIFI

* reduce number of variable, because nore heap is needed

  * 6000 reduce to have enough memory

* add boardname to binary_name and binaries

* remove libraries

 * TV - if not planed to use the pal output
 * FILESYSTEMvas - storage lib is powerfull enough 

* add libraries

 * SPI\_LCD\_UNBUF to handle 16bit color tft lcd display
 
     Check [Custom Library SPI\_LCD\_UNBUF](Custom Library SPI_LCD_UNBUF.md) for usage.

* add make defines 

 * add 6x8 font  <- nice 255 character font 

 * add spi buffer transfer size 

* remove make defines 
 
 * remove WIZNET (Ethernet vi SPI) <- if no plan to use ethernet


### Make changes in ESPRUINOWIFI_CUSTOM.py
```
info : {
    ....
    'boardname' : 'MYESPRUINOWIFI',
    ....
    'variables' : 4000,
    ....

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
            #'TV',
            #'FILESYSTEM',
            'CRYPTO', 'SHA256', 'SHA512',
            'TLS',
            'NEOPIXEL'
            'SPI_LCD_UNBUF'
        ],
     'makefile' : [
         ....
         # 'WIZNET=1', # Add support for W5500 by default (not CC3000)
         ....
         'DEFINES+=-DSPISENDMANY_BUFFER_SIZE=64',
         'DEFINES+=-DUSE_FONT_6X8', 
         ....
      ],
      .....
```

### Build firmware for this custom board 

```
export BOARD=ESPRUINOWIFI_CUSTOM 
export RELEASE=1 

make clean

make

# created files
espruino_2v06.83_wifi_MYESPRUINOWIFI.elf
espruino_2v06.83_wifi_MYESPRUINOWIFI.bin
espruino_2v06.83_wifi_MYESPRUINOWIFI.lst

```

### Flash and check the custom firmware

```
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








