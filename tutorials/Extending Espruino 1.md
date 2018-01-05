<!--- Copyright (c) 2017 Juergen Marsch, Pur3 Ltd. See the file LICENSE for copying permission. -->
Extending Espruino 1 - Making own firmware extension
==================================================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Extending+Espruino+1. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Custom,C,C++,Extending,Extension,Native,Firmware

This tutorial provides a little intro into writing your own extension to Espruino and create your own binary.

For a more detailed tutorial [you can see how to make your own class](/Extending Espruino 2)

__WARNING__: while everything described here works, the tutorial has not been tested much.

__WARNING__: Since my intension was to get some special functions for Espruino on ESP8266, example below are tested for ESP8266-port of Espruino. Good news, there is a lot of general information, hopefully of help for others.

__Prerequisite__: before you start with this, you should have your own development running, to compile your own version. Follow [the instructions on GitHub](https://github.com/espruino/Espruino/blob/master/README_Building.md) to get started.

__Prerequisite__: last not least, its helpful to have some knowledge around linux, writing code in C, linking, etc. etc. If you start on a level like mine, your expectation should be to run into lots of questions, and run against a wall from time to time.

Example use free flash memory for text
--------------------------------------

The idea is to take not used flash memory and store textual data in this area. An http-server uses a lot of html commands, and to store this in javascript sources takes away a lot of available space. In a small chip like the ESP8266, this becomes ugly soon.

There are already some commands available to handle FlashMemory, so the idea is to add an additional command like

`readString(StartAddress of Flashpage, sequenceNumber inside this page)`

This tutorial has the following steps:
- Create wrapper files
- Template for .h and .c
- Add function source in C
- Changes to make file
- running and have fun

Create Wrapper File
-------------------
Espruino is the base of everything. Therefore we should use conventions already used. This starts with naming of sourcefiles.
In our example we give it the name jswrap_FlashExtension. Path to store sourcefiles is */Esrpuino/targets/esp8266/myLibs*
Our example is tested for ESP8266 only, and it is not a part of standard Espruino for this board, therefore path to store sourcefiles is */Espruino/targets/esp8266/myLibs*
We need one header file and one source file:
jswrap_FlashExtension.h
jswrap_FlashExtension.c

Template for .h and .c
---------------------
Lets start with the header file. For this time, lets skip the copyright part. My recommendation is, to take a closer look to other files and do something similiar. Please have in mind, Espruino is open source.

```C
#include "jsvar.h"
#include "jswrap_flash.h"

JsVar *jswrap_flash_readString(int addr, int pointer);
```

Including jsvar is always a good idea. jsvar is one of the most important parts of Espruino. For the JavaScript-only reader, this is the handling of everything which is stored, variables and source.
jswrap_flash is the header file foe all flash relevant functions. And some of those functions will be helpful.
Last not least 3rd line is the description of the function, we see more in the c-file.

Add function source in C
------------------------

```C
#include "jswrap_FlashExtension.h"
#include "jshardware.h"
```

First include is "business as usual" for everybody writing C. 2nd include is more interesting. jshardware.h is header for all hardware relevant functions. Reading flash is one of them.

```C
/*JSON{
  "type" : "staticmethod",
  "class" : "Flash",
  "name" : "readString",
  "generate" : "jswrap_flash_readString",
  "params" : [
    ["addr","int","An address in the page to store strings"],
    ["pointer","int","seqNr of string"]
  ],
  "return" : ["JsVar","A Uint8Array"]
}
 */
```

This part looks like comment only. But there is a nice script in the background, scanning for comments like this. As we can see, there is some data in JSON format. And this is translated into one more C-file. At the end, this generated file is the connection between Javascript file and the compiled C-function.
I'm pretty sure, there are a lot of guys, having a better explanation than this, so go on, add your knowledge ;-)

Lets start first with a short description of the way, text is stored in Flash, to be readable for our flash extension.
Begin of a page in flash is a collection of pointer to data itself. For each text, start and length are stored as 16bit values. Text itself starts at the end of this pointer collection. There is a lot of options, how data can be stored here, but at least for this explanation, this is a nice option.

```C
JsVar *jswrap_flash_readString(int addr, int pointer){
  int startAddr, length, pnt,tmp;
  pnt = addr + pointer * 4;
  jshFlashRead(&tmp, (uint32_t)(pnt), 4);
  length = tmp >> 16;
  startAddr = tmp & 0xffff;
  return jswrap_flash_read(length,addr + startAddr);
}
```

Reading data from flash in hardware relevant function (jshFlashRead) is done in sets of 4 bytes on 4 bytes boundaries. The Int32 is splitted into start and length.
Last we only have to use already existing read function from Flash object to get the text. Return format is an Uint8Array, which can easily be converted to a string using `E.toString`.

Changes to make file
--------------------

Now that we have the source code, next step is to compile and link. Make file needs to know about additional files. Now we get the answer, why we used subdirectory myLibs.
To avoid additional changes for each new extensions, make searches for files in this directory only.

```Makefile
 ifdef USE_ESP8266
 DEFINES += -DUSE_ESP8266
 WRAPPERSOURCES += libs/network/esp8266/jswrap_esp8266_network.c \
   targets/esp8266/jswrap_esp8266.c
 INCLUDE += -I$(ROOT)/libs/network/esp8266
 SOURCES += \
 libs/network/esp8266/network_esp8266.c\
 libs/network/esp8266/pktbuf.c\
 libs/network/esp8266/ota.c
  ifdef USE_MYLIB
   WRAPPERSOURCES += $(wildcard targets/esp8266/myLibs/jswrap*.c)
   SOURCES += $(wildcard targets/esp8266/myLibs/lib*.c)
  endif
 endif
```

We already have a part in make file, adding board specific files to an internal list. If USE_MYLIB is set to 1, wildcard function for make searches for additional files and adds them also. Lines around wildcards are not part of standard make. They have to be added before doing next step.

Running and have fun
--------------------
All changes are done now, its time to call  make. In my case flashing of firmware is done with NODEMCU FIRMWARE PROGRAMMER under windows. To make this workflow easy to use, my VM shares a directory with windows. Make itself creates a tar file with all binaries. There are apps available to handle tar files, but its much easier doing this in VM already.

```Bash
ESP8266_BOARD=1 USE_MYLIB=1 make
tar -xzf espruino*.tgz -C /mnt/hgfs/C_tmp_VMWare
cd /mnt/hgfs/C_tmp_VMWare
rm -rvf espruino
mv espruino* espruino
cd
```

Of course things never just work... Please provide feedback in the
[espruino forum](http://forum.espruino.com/) or on [gitter](https://gitter.im/espruino/Espruino) about this tutorial and the mishaps you've had so it can be improved!
