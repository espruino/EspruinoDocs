<!--- Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Other Boards
============

* KEYWORDS: Nucleo,Discovery,Maple,Olimexino,Leaflabs,Arduino


These are other boards that Espruino compiles for, but which aren't 'officially supported'. This means:

*   Espruino does not come pre-installed on the board
*   Your purchase does not help to support the Espruino project
*   Not all the functionality available on the Espruino Board is available on other boards
*   The modules, tutorials and examples are designed for the Espruino Board and may not work
*   The Web IDE may have to employ 'throttling' for error free communications - significantly slowing down your experience.
*   You cannot update the firmware for other boards via the Web IDE
*   We're not able to support you if you have problems using these boards. If you want support, get an [official board](/EspruinoBoard)
*   The community is responsible for maintaining these boards, and as such releases are not subject to the same level of testing.

**Note:** ST Nucleo and Discovery boards are sold at a low price, for evaluation purposes only. According to the [Evaluation products license agreement](http://www.st.com/st-web-ui/static/active/en/resource/legal/legal_agreement/license_agreement/EvaluationProductLicenseAgreement.pdf) that comes with each board, you must **not use them as part of a finished product**. If you want to do that, please check out our [official boards](/Order).

To see how to get started with the [official boards](/Order), just follow our [Quick Start](/Quick+Start) guide, or you can [Order one here](/Order).

## BOARDS that Espruino works on

 |      | **Chip** | **Speed** | **Vars** | **Cost** | **USB** | **UARTs** | **SPIs** | **Bat** | **Arduino Headers** | **SD Card** | **Other** |
 |------|----------|-----------|----------|----------|---------|-----------|----------|---------|---------------------|-------------|-----------|
 | [**STM32VLDISCOVERY**](/ReferenceSTM32VLDISCOVERY) | STM32F100 | 24Mhz | 250 | €12 | N | 3 | 2 | N | N | N | |
 | [**STM32F3DISCOVERY**](/ReferenceSTM32F3DISCOVERY) | STM32F303 | 72Mhz | 2800 | €14 | Y | 3 | 2 | N | N | N | |
 | [**STM32F4DISCOVERY**](/ReferenceSTM32F4DISCOVERY) | STM32F407 | 168Mhz | 5000 | €16 | Y | 6 | 3 | N | N | N | |
 | **[ST NUCLEO-F401RE](/ReferenceNUCLEOF401RE)** | STM32F401 | 84Mhz | 5300 | €12 | N | 3 | 4 | N | Y | N | |
 | **[ST NUCLEO-F411RE](/ReferenceNUCLEOF411RE)** | STM32F411 | 84Mhz | 5300 | €12 | N | 3 | 4 | N | Y | N | |
 | [**OLIMEXINO-STM32**](/ReferenceOLIMEXINO_STM32) | STM32F103RB | 72Mhz | 700 | €20 | Y | 3 | 2 | LiPo | Y | Y | |
 | [**LeafLabs Maple RBT6**](/ReferenceOLIMEXINO_STM32) | STM32F103RB | 72Mhz | 700 | €40 | Y | 3 | 2 | LiPo | Y | N | |
 | [**'HY' 2.4" LCD **](/ReferenceHYSTM32_24) | STM32F103VE | 72Mhz | 2800 | €30 | Y | 3 | 2 | N | N | Y | |
 | [**'HY' 2.8" LCD**](/ReferenceHYSTM32_28) | STM32F103RB | 72Mhz | 700 | €30 | Y | 3 | 2 | N | N | U | |
 | [**'HY' 3.2" LCD**](/ReferenceHYSTM32_32) | STM32F103VC | 72Mhz | 2000 | €30 | Y | 3 | 2 | N | N | Y | |
 | [**ESP8266**](/EspruinoESP8266) | Xtensa | 80Mhz | 1023 | €10 | N | 1 | 1 | N | N | N | WiFi |

**Key:** `Y`=Yes, `N`=No, `U`=Yes, but currently unimplemented

You can also see these boards listed with thumbnails at the top of [the reference page](/Reference).

After you've got a board, head to the [Download](/Download) page and then follow the instructions below in order to flash your board.

## MORE INFORMATION

### OLIMEXINO-STM32

Good value, and can usually be purchased from well-known suppliers. It contains an SD card, Arduino-style headers, and conveniently a LiPo battery connector (with charger).

It comes pre-flashed with a bootloader. HOWEVER there is not enough space for this and Espruino, so you will need to overwrite it using a USB-TTL converter. See [Serial Bootloader](/Serial+Bootloader) for instructions.

You can get this directly from [Olimex](https://www.olimex.com/Products/Duino/STM32/OLIMEXINO-STM32/) or [Farnell/Element14](http://uk.farnell.com/olimex/olimexino-stm32/board-dev-olimexino-stm32/dp/2061325).

### 'HY' LCD Modules

These appear to come from [Haoyu](http://www.hotmcu.com/) electronics and come in a few types, with varying LCD sizes. They are amazingly good value, and can be obtained from eBay (although they are often shipped direct from Hong Kong or China). They don't generally have a specific name or model number, so are hard to tell apart.

Espruino contains bitmap and vector fonts, and along with the SD card driver and space for saving variables Espruino starts to have trouble fitting in just 128kb of Flash - so we suggest that you avoid the RBT6-based board and head for the VET6 or VCT6 ones.

**2.4" STM32F103VET6 **- 512kb Flash, 64kb RAM - The largest board, but with the most features - 4 buttons, 4 LEDs, 2 Potentiometers, 2x USB, an RS232-level serial connection, SD card, buzzer, and a external flash chip. Has 'HY-STM32_100P' on the back of the PCB. **BEWARE: There is a new version of this board that is wired up differently - Espruino will only drive the LCD on the original board.**

**2.8" STM32F103VET6** - 256kb Flash, 48kb RAM - This looks just like the 2.4" STM32F103VET6, but is **UNTESTED** (May work with 2.4" drivers)

**2.8" STM32F103RBT6** - 128kb Flash, 20kb RAM - This works, however the board itself very basic with few peripherals, the CPU does not have much flash memory, and it is not recommended. RBT6 does not support the faster FSMC LCD interface, so LCD updates are slow. SD card is currently unimplemented. Has MINI-STM32-V3.0 on the main board under the LCD.** BEWARE: Boards with an SD card and 'armjishu.com' written on the bottom are currently unsupported.**

**3.2" STM32F103VCT6** - 256kb Flash, 48kb RAM - Works well. It has a big display and it is quite fast. Few on-board peripherals though (2 LEDs, 2 Buttons and an SD card). Recommended.

**3.2" STM32F103RBT6** - 128kb Flash, 20kb RAM - **UNTESTED **(May work with 2.8" drivers)

## Wiring up a serial port

Every supported board except the STM32VLDISCOVERY has a USB serial port, so most users can skip this step. If you have an STM32VLDISCOVERY, or you want to use Bluetooth, or to connect to a Raspberry Pi using serial (rather than USB), please see the [Wiring Up](/Wiring+Up) page.

## Plug in Espruino

You communicate with Espruino using a Terminal Emulator over a Serial port. Most Espruino devices can emulate a Serial port over USB, so when you plug these in to your PC or Mac the Operating System will automatically detect them. All you need to do is find out what the Operating System has 'called' the serial port that has been created.

**Windows XP Users:** Windows XP seems not to have generic drivers for USB Virtual COM Ports installed, so you'll have to get them from ST [via this link](http://www.st.com/web/en/catalog/tools/PF257938) (thanks Josef!)

First off, you need to know which USB port to connect to:

|                   |                                                |
|-------------------|------------------------------------------------|
| **ESPRUINO & PICO BOARDS** | **There's just one USB port - so it's easy!** |
| **NUCLEOF4xxRE** | There's just one USB port, which serves as the programmer, serial port, and mass storage device. |
| **STM32VLDISCOVERY   ** | You will have had to use a USB-TTL converter (see [Wiring Up](/Wiring+Up)). After programming you'll need to connect at 9600 baud. |
| **STM32F3DISCOVERY   ** | Plug in to the port labelled 'USB USER'. **Note:** This board is more difficult to connect to. You need to power up the board without 'USB USER' plugged in, and then plug in USB later. If you subsequently reset the board, you'll need to unplug USB and plug it back in. |
| **STM32F4DISCOVERY   ** | Plug in to the port nearest the headphone Jack. Note: This board still needs power from an external source such as the USB port on the other side. |
| **'HY' board** | Use either of the two available USB ports. The one nearest the power LED is a built-in USB-TTL converter, and the other is a Virtual COM port. **Note:** We'd suggest using the 'Virtual COM port' USB port as this is faster and shouldn't have flow control problems.|
 | **Olimexino STM32 Leaflabs Maple** | The one USB port |


Don't plug the device in right away though.

## Flashing Espruino

### Espruino Board

See the [Download](/Download) page for more information - the Web IDE directly supports updating firmware on these boards.

### ST NUCLEO-F4xxRE

*   When you plug your board in, it should appear as a USB flash drive.

*   To actually communicate with Espruino you'll need access to the communications port on the Nucleo, and for that you may need some drivers. ST provides them for Windows [Vista/7/8](http://www.st.com/web/en/catalog/tools/PF260218) and [XP](http://www.st.com/web/en/catalog/tools/PF260219). You may also want to check out ST's [getting started](http://www.st.com/st-web-ui/static/active/en/resource/technical/document/user_manual/DM00105928.pdf) guide.

*   If this is the first time you've used the board then you will probably want to [update your Nucleo's firmware](http://developer.mbed.org/teams/ST/wiki/Nucleo-Firmware). Not doing this could cause problems when you try and upload Espruino (or any software) - especially on Macs.

*   Copy the file espruino_1vXX_nucleof401re.bin out of the ZIP file you got from the download page and paste it into the flash drive

*   Wait until the LEDs have stopped blinking, reset your board, and connect with the Web IDE (at 9600 baud, the default) to start using Espruino.

### STM32 (VL/F3/F4) Discovery

### On Windows

*   Go to the ST-Link website: [http://www.st.com/internet/evalboard/product/251168.jsp](http://www.st.com/internet/evalboard/product/251168.jsp) and click 'Design Support', then download and install the 'STM32 ST-LINK utility'.

*   Extract the archive containing Espruino

*   Run the 'STM32 ST-LINK Utility'

*   Click 'File'->'Open File' and choose espruino_1vXX_stm32vldiscovery.bin

*   When asked if you want to program, click 'Yes'

*   Click 'Program' on the next window

### On Linux/Mac

*   On Linux: Download and install 'stlink' using the instructions here:[https://github.com/texane/stlink/blob/master/README](https://github.com/texane/stlink/blob/master/README)

*   On Mac: Download and install 'stlink', either by typing:

```
    brew install libusb  
    git clone https://github.com/texane/stlink.git  
    cd stlink  
    LIBRARY_PATH=/usr/local/lib  
    C_INCLUDE_PATH=/usr/local/include  
    ./autogen.sh  
    ./configure  
    make
```

    Or by using the instructions here: [http://cu.rious.org/make/getting-stlink-to-work-on-mac-os-x-with-macports/](http://cu.rious.org/make/getting-stlink-to-work-on-mac-os-x-with-macports/) however Branton tells us that these are out of date.

*   Extract the archive containing Espruino to the stlink directory.

*   Go to the stlink directory, and type: 'flash/st-flash write espruino_1vXX_stm32vldiscovery.bin 0x08000000' (be sure to change the filename to the correct one for your device)

### Olimexino-STM32 AND LeafLabs Maple

Unfortunately the USB bootloader pre-installed on these devices takes up too much flash to allow a usable version of Espruino to be installed. This means you'll have to overwrite the USB bootloader. This is pretty simple - you just need a USB-TTL converter. It's also trivial to write the bootloader back in later on.

Just follow our [Serial Bootloader](/Serial+Bootloader) instructions and use the file espruino_1vXX_olimexino_stm32.bin. If you want to restore your board to use the Maple bootloader, just use the binary file available from [http://leaflabs.com/docs/bootloader.html#flashing-a-custom-bootloader](http://leaflabs.com/docs/bootloader.html#flashing-a-custom-bootloader)

### 'HY' LCD Boards

The 'HY' boards have a USB-RS232 converter onboard, so to flash them, you can use the STM32's built-in bootloader:

*   Make sure you don't still have a terminal application running
*   Set BOOT0 to 1:
    *   On 2.4" boards, there is a 'BOOT0' jumper
    *   On other boards, BOOT0 is a button which you must hold down while you tap the RESET button
*   Plug USB into the RS232 converter port of the board. Note that Prolific has decided not to provide drivers for older versions of their PL2303 chips on Windows 7 and later, so on some boards that use this chip, you may have problems.
    *   On 2.4" board this is the bottom connector (near the power LED)
    *   On other boards, with the buttons at the bottom of the board, this is the connector on the top left
*   Follow our [Serial Bootloader](/Serial+Bootloader) instructions - use the file espruino_..._hystm32_XX_YY.bin where XX is the size of the LCD screen (24=2.4, etc) and YY is the two letters from the chip name after F103 (STM32F103VCT6 = VC)
*   On the 2.4" board, move the 'BOOT0' jumper back to 0
*   Press Reset, and Espruino will load.
*   If connecting to the RS232 converter port of the board, you'll need to connect at 9600 baud.

In order to run the Python file from the link above,  you may need to have Python 2.7 installed, and not the newest version of Python (version 3).

### Raspberry Pi

The version for Raspberry Pi is a simple executable. Extract it from the ZIP file and make it executable with:

`chmod a+x espruino_1vXX_raspberrypi`

You may also want to rename it:

`mv espruino_1vXX_raspberrypi espruino`

Finally, just run it with:

`./espruino`

Note that in order to use GPIO (or to start an HTTP server with a port number less than 1024), Espruino will need to be run as root:

`sudo ./espruino `

Also, the Raspberry Pi version doesn't currently support Serial, SPI, OneWire or I2C - which means you're stuck with GPIO.

## Finally...

<font color="red">**Please Note:** If you have saved code to Espruino, when booting it will load your saved JavaScript program from flash memory. Occasionally we change the way programs are stored in memory between versions in order to make Espruino more efficient, and when this happens, after flashing the latest version of Espruino to the device, it may stop booting. You can solve this in two ways:</font>

*   If you're using the stm32loader.py, you can supply the '-e' flag to completely erase the STM32's flash.
*   Hold down Button1 while booting (which will stop Espruino automatically loading the saved program)  - see [here](http://www.espruino.com/Reference#l__global_save) for details. You can then type 'save()' to save a correct (but Empty) JavaScript program back into flash.

See our [Quick Start](/Quick+Start) page for how to get started using Espruino itself.

### ESP8266

Please see [the ESP8266 page](/EspruinoESP8266) for more information.