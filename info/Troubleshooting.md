<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Troubleshooting
=============

## My board doesn't seem to be recognized by my computer

Hold down the RST button. Do the blue and red lights glow dimly? If not, there's a problem with your USB cable as power isn't getting to Espruino.

Hold down BTN1, and then press and release RST while keeping BTN1 held. The Blue and Red LEDs should now light brightly for a fraction of a second, and the Blue LED should be pulsing. If not, there is some issue with USB. Try another USB cable and if that doesn't work, see the next troubleshooting headings.


## My board doesn't appear as a USB Serial port in Windows XP / Windows 8.1

These versions of Windows don't come with the correct drivers preinstalled. You'll need to install [ST's VCP drivers](http://www.st.com/web/en/catalog/tools/PF257938) first. 


## My board doesn't appear in Windows Control Panel's 'Devices and Printers' page.

If you use many COM port devices in Windows, you may find that the COM port numbers quickly get so high that Windows refuses to add more. If this is the case, you'll have to follow the instructions here: [http://superuser.com/questions/408976/how-do-i-clean-up-com-ports-in-use]

If not, see the first troubleshooting item above.


## I tried to reflash my Espruino Board, and now it won't work

Just try reflashing again (by holding down BTN1 when RST is released, you should always be able to get the glowing blue LED).

As Espruino itself won't work, the IDE won't know what type of board it is supposed to flash so you'll have to look up the firmware manually. Just head to [the Espruino binaries site](http://www.espruino.com/binaries/?C=M;O=D) and look for the most recent (nearest the top) file named ```espruino_1v##_espruino_1r#.bin``` where ```1r#``` is the revision number written on the back of your Espruino board. Copy the link to the file, and paste it into the Espruino Web IDE.

