<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Fonts
====

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Fonts. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Graphics,Font,Fonts,Text,Typeface,Module
* USES: Graphics

Espruino usually has multiple fonts built-in.

<!--
var s = 8;
g = Graphics.createArrayBuffer(s*16,s*16,1);
g.setFontAlign(0,0);
g.setFont("6x8");
for (var y=0;y<16;y++)
  for (var x=0;x<16;x++)
    g.drawString(String.fromCharCode(x+y*16),(s/2)+x*s,(s/2)+y*s);
g.dump();
-->

* A vector font (scalable to any height, usually works best above 20px high)
* Bitmap fonts (scalable 1x, 2x, 3x, etc)
  * `4x6` is built into all devices, it is 4px wide and 6px high.
  * `6x8` is built into devices like [Bangle.js](/Bangle.js). It is a much more readable 6px wide, 8px high font that contains ISO Latin characters see [Character Sets](#character-sets)

These fonts are part of Espruino's built-in [[Graphics]] library.

You can use `g.getFonts()` to list the available fonts.


Vector Font
----------

The Vector font is made out of polygons, and it can be resized to any size. This makes it great for displaying big text like numbers.

**Note:** Some non-official Espruino boards don't have vector font support built-in, so all you'll have available is the bitmap font (see below).

To use it, just use `Graphics.setFont("Vector",height)` where `height` is the height in pixels. Assuming you've set up [[Graphics]] as a variable called `g` you can do:

```
g.clear();
g.setFont("Vector",40);
g.drawString("Hello",0,0); // 40px high
g.setFont("Vector", 60);
g.drawString("World",40,40); // 60px high
```

![](data:image/bmp;base64,Qk1ADQAAAAAAACAAAAAMAAAA+gBpAAEAAQD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAQAAAAAAAAAAAAAAD/gAAAP+AAAAAH/wAAH8AAD+AAAHwH+AAAAAAAAAAAAP/AAAA/8AAAAB//wAAf4AAP4AAB/wf4AAAAAAAAAAAA/8AAAD/wAAAAf//wAB/gAA/gAA//x/gAAAAAAAAAAAD/wAAAP/AAAAH///gAH+AAD+AAP//3+AAAAAAAAAAAAf/gAAB/+AAAB////gAf4AAP4AH////4AAAAAAAAAAAB/+AAAH/4AAAf/x//AB/gAA/gAf////gAAAAAAAAAAAH/4AAAf/gAAB/8D/+AH+AAD+AB/wD/+AAAAAAAAAAAAf/gAAB/+AAAH/AH/4Af4AAP4AP+AP/4AAAAAAAAAAAD//AAAP/8AAA/wAP/wB/gAA/gA/wAf/gAAAAAAAAAAAP/8AAA//wAAD+AAf/AH+AAD+AH+AA/+AAAAAAAAAAAA//wAAD//AAAf4AA/+Af4AAP4Af4AD/4AAAAAAAAAAAH//gAAf/8AAB/AAB/4B/gAA/gD/AAH/gAAAAAAAAAAAfv+AAB//4AAP8AAB/wH+AAD+AP4AAP+AAAAAAAAAAAB8/4AAH9/gAA/gAAH/Af4AAP4A/AAAf4AAAAAAAAAAAHz/gAAfn+AAH+AAAf+B/gAA/gH8AAB/gAAAAAAAAAAA/H/AAD+f8AAf4AAB/4H+AAD+AfwAAH+AAAAAAAAAAAD8f8AAP5/wAD/gAAH/gf4AAP4D/AAAf4AAAAAAAAAAAPx/wAA/D/AAP+AAAf8B/gAA/gP8AAB/gAAAAAAAAAAB+H/AAD8P8AA/4AAB/wH+AAD+B/wAAH+AAAAAAAAAAAH4P+AAfw/4AD/gAAH/Af4AAP4H/AAAf4AAAAAAAAAAAfg/4AB+D/gAP+AAAf8B/gAA/gf8AAB/gAAAAAAAAAAB+D/gAH4H+AA/4AAB/wH+AAD+B/wAAH+AAAAAAAAAAAP4H/AA/gf4AD/gAAD/Af4AAP4H/AAA/4AAAAAAAAAAA/Af8AD+B/wAP+AAAP8B/gAA/gP8AAD/gAAAAAAAAAAD8B/wAPwD/AA/4AAA/gH+AAD+A/wAAP+AAAAAAAAAAAPwD/AA/AP8AD/gAAH+Af4AAP4D/AAA/4AAAAAAAAAAB/AP+AH8A/4AP+AAAf4B/gAA/gP8AAD/gAAAAAAAAAAH4A/4AfgD/gA/8AAD/gH+AAD+A/4AAP+AAAAAAAAAAAfgD/gB+AH+AB/4AAP+Af4AAP4B/gAA/4AAAAAAAAAAD+AH/AP4Af4AH/gAB/4B/wAA/gH/AAD/gAAAAAAAAAAP4Af8A/gB/wAP/AAH/gH/gAD+Af8AAf+AAAAAAAAAAA/gB/wD8AH/AA/+AA/8Af/AAP4B/4AD/4AAAAAAAAAAD8AD/APwAP8AB/4AD/gB/+AA/gD/gAf/gAAAAAAAAAAfwAP+B/AA/wAH/wAf8AH/8ED+AH/wD/+AAAAAAAAAAB/AA/4H4AD/gAP////gAf//4P4AP/4f/4AAAAAAAAAAH8AB/gfgAP+AAf///8AB///g/gAf////gAAAAAAAAAA/wAH+B+AAf4AA////gAH7//D+AA////+AAAAAAAAAAD+AAf8P4AB/wAA///+AAfn/8P4AB///f4AAAAAAAAAAP4AB/w/AAH/AAB///gAB+P/4/gAD//x/gAAAAAAAAAA/gAD/D8AAP8AAB//4AAH4f/j+AAH/8H+AAAAAAAAAAH+AAP+fwAA/wAAB/+AAAfggAP4AAABAf4AAAAAAAAAAfwAA/5+AAD/gAAAAAAAAAAAA/gAAAAB/gAAAAAAAAAB/AAB/n4AAP+AAAAAAAAAAAAD+AAAAAH+AAAAAAAAAAH8AAH+/gAAf4AAAAAAAAAAAAP4AAAAAf4AAAAAAAAAA/wAAf/+AAB/gAAAAAAAAAAAA/gAAAAB/gAAAAAAAAAD/AAA//wAAH/AAAAAAAAAAAAD+AAAAAH+AAAAAAAAAAP4AAD//AAAf8AAAAAAAAAAAAP4AAAAAf4AAAAAAAAAB/gAAP/8AAA/wAAAAAAAAAAAA/gAAAAB/gAAAAAAAAAH+AAA//gAAD/gAAAAAAAAAAAD+AAAAAH+AAAAAAAAAAf4AAB/+AAAP+AAAAAAAAAAAAP4AAAAAf4AAAAAAAAAB/gAAH/4AAA/4AAAAAAAAAAAA/gAAAAB/gAAAAAAAAAP8AAAf/gAAB/gAAAAAAAAAAAD+AAAAAH+AAAAAAAAAA/wAAA/8AAAH/AAAAAAAAAAAAP4AAAAAf4AAAAAAAAAD/AAAD/wAAAf8AAAAAAAAAAAA/gAAAAB/gAAAAAAAAAf8AAAP/AAAA/wAAAAAAAAAAAD+AAAAAH+AAAAAAAAAAAQAAAf8AAAABAAAAAAAAAAAAP4AAAAAf4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAA/AACAAB8D4AA/gAAAAAAAAAAAAAAAAAAAAAAAAB8AAD8AA//AHwPgAP/gAAAAAAAAAAAAAAAAAAAAAAAAHwAAPwAf/+AfA+AH//gAAAAAAAAAAAAAAAAAAAAAAAAfAAA/AP//8B8D4D///AAAAAAAAAAAAAAAAAAAAAAAAB8AAD8A///wHwPgP8f+AAAAAAAAAAAAAAAAAAAAAAAAHwAAPwD8A/gfA+A+A/4AAAAAAAAAAAAAAAAAAAAAAAAfAAA/AfgB+B8D4HwB/wAAAAAAAAAAAAAAAAAAAAAAAB8AAD8B8AD8HwPgfAD/AAAAAAAAAAAAAAAAAAAAAAAAHwAAPwHwAHwfA+D4AD8AAAAAAAAAAAAAAAAAAAAAAAAfAAA/A/AAAB8D4PgAP4AAAAAAAAAAAAAAAAAAAAAAAB8AAD8D4AAAHwPh+AA/gAAAAAAAAAAAAAAAAAAAAAAAHwAAPwPgAAAfA+H4AD+AAAAAAAAAAAAAAAAAAAAAAAAfAAA/A////h8D4fgAPwAAAAAAAAAAAAAAAAAAAAAAAB8AAD8D///8HwPh+AA/AAAAAAAAAAAAAAAAAAAAAAAAHwAAPwP///wfA+H4AD8AAAAAAAAAAAAAAAAAAAAAAAAfAAA/A////B8D4fgAHwAAAAAAAAAAAAAAAAAAAAAAAB8AAD8D///8HwPh+AAfAAAAAAAAAAAAAAAAAAAAAAAAH////wPwAHgfA+H4AB8AAAAAAAAAAAAAAAAAAAAAAAAf////A/AAeB8D4fwAPwAAAAAAAAAAAAAAAAAAAAAAAB////8D+AD4HwPg/gA/AAAAAAAAAAAAAAAAAAAAAAAAH////wP4APgfA+D/AH8AAAAAAAAAAAAAAAAAAAAAAAAf////AfgB+B8D4H+AfgAAAAAAAAAAAAAAAAAAAAAAAB////8A/w/gHwPgf//8AAAAAAAAAAAAAAAAAAAAAAAAHwAAPwB//8AfA+A///gAAAAAAAAAAAAAAAAAAAAAAAAfAAA/AD//gB8D4B//8AAAAAAAAAAAAAAAAAAAAAAAAB8AAD8AH/8AHwPgD//wAAAAAAAAAAAAAAAAAAAAAAAAHwAAPwAP/gAfA+AH/8AAAAAAAAAAAAAAAAAAAAAAAAAfAAA/AAP8AB8D4AH/AAAAAAAAAAAAAAAAAAAAAAAAAB8AAD8AAAAAHwPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAPwAAAAAfA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAA/AAAAAB8D4AAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAD8AAAAAHwPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAPwAAAAAfA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAA/AAAAAB8D4AAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAD8AAAAAHwPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAPwAAAAAfA+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAfAAA/AAAAAB8D4AAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAD8AAAAAHwPgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=)

**Note:** `g.setFontVector(height)` can be used, but is deprecated and `g.setFont("Vector", 60);` is preferred.

The built-in vector font contains contains the [ASCII characters](http://www.asciitable.com/) 0-127 (eg. English text).

While the vector font is meant to look good at larger sizes, it doesn't scale down in size very well below about 20 pixels high, so there's the Bitmap Font.


Bitmap Font
----------

Bitmap fonts are designed to be small while still legible. These are the default font, but if you've already switched away from a Vector font, you can switch back to it with:

```
g.setFont("4x6");
g.drawString("Hello",0,0);
// double the size of the font to 8x12 with:
g.setFont("4x6",2);
g.drawString("2x Hello",0,10);
```

![](data:image/bmp;base64,Qk2IAQAAAAAAACAAAAAMAAAAUAAeAAEAAQD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH5mAGYefn4YAAAAAH5mAGYefn4YAAAAAGBmAGZgGBhmAAAAAGBmAGZgGBhmAAAAABgYAH5+GBhmAAAAABgYAH5+GBhmAAAAAAZmAGYYGBgYAAAAAAZmAGYYGBgYAAAAAHgAAGYAeHgAAAAAAHgAAGYAeHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFN3IAAAAAAAAAAAAFQiUAAAAAAAAAAAAHciUAAAAAAAAAAAAFIiIAAAAAAAAAAAAFBmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=)

If your device has the `6x8` font built in you can use `g.setFont("6x8");`


* The `4x6` font contains the [ASCII characters](http://www.asciitable.com/) 0-127 (eg. English text):

![](data:image/bmp;base64,Qk0gCAAAAAAAACAAAAAMAAAAgACAAAEAAQD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAIAAAAAAAAADAAAAAAADgwGCAwCBgQOCgIOBgQMAA4KCggCBAoODgoGCAQEBAAOCgoMDAQKCg4ECgQMBAYADgwGCgYOCgoKCgoOBAQEDA4AAAAABAAAAAAAAAYEDAYOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAACAAAAAAAAA4MBgYGBAIKDgQKDg4KBAAOCggKCAQGCgQECgQOCgoAAgoICg4OCgoMDAwEDgoKBAwMBgYEBAYMAAAKBAwMBAgACAACAAIACAQECAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBgoMBA4ECgoEDg4CDgAODA4MAgQKDg4KBAgIAgIAAAoKCgQECgoOBA4ECAQCAAAKCgoIBAoKCgoKAggIAgoADAQMBg4KCgoKCg4OCA4EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYKDAQMDggGCg4ECg4OCgQIDgoKCggICgoECgoIDg4KDgoMCAoMDAoOBAIMCA4OCgoKCgoKCAgICgQCDAgODgoEBAwEDA4OBgoOAgoICgoEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAABA4ODAIMBAQEBAQEBA4EBAoECAIOAgoECgIAAAgAAgAKBAQECgwMAgQGBAQEDgQECgwCAgoICAIKCgAAAAAAAgQEDAwGDgYOBAQAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAgAAAAABAAKDgoOAAQEAAQEAAQIAAAADgYIDAAIAgAOAA4ACAAEAAoMBAYACAIKBAAAAAQABAoODgIMBAgCDgAAAAACAAQKCgQKDAQEBAQAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==)

* The `6x8` font contains ISO Latin characters see [Character Sets](#character-sets):

![](data:image/bmp;base64,Qk0gCAAAAAAAACAAAAAMAAAAgACAAAEAAQD///8AAAAAAAAAAAAAAEAAAAAAOEA4OEQ4ODg4OBA4PDw8PARABEREREREREQAZEREREQ8WDxEREREREREfFRERERERGREOERERERERABMRERERERkRAh4ODg4ODgQOEREREREWEQwAAAAAAAAAAQAAAAAAEAAKFgwGChYKAAAMBgoKBBAKAAAAAAAAAAQAAAAAAAAAAA8PDw8PDwsPDw8PDw4ODg4REREREREUEBAQEBAEBAQEDw8PDw8PHxAeHh4eBAQEBAEBAQEBAQUQEREREQQEBAQODg4ODg4eDg4ODg4MDAwMAAAAAAAEAAAAAAAAAAAAAAwEDhYKCgAADAYKCgwGCgoAAAAAAAAAABAAAAAAAAAADBEODg4ODgAODg4ODgQQFgoREREREREKGREREREEHhEJExERERERBBURERERBBETHRUREREREQoVEREREQoRFAoZEREREREAExERERERHhIMEQ4ODg4OAA4RERERERAMABYMBgoWCgABDAYKCgQAAAAAAAAAAAAEAAAAAAAAAAAREREREREXDh8fHx8ODg4OERERERERFBEQEBAQBAQEBA4ODg4ODhwQEBAQEAQEBAQKCgoKCgoWEBwcHBwEBAQEBAQEBAQEDBEQEBAQBAQEBAAAAAQEAAcOHx8fHw4ODg4MBg4WCgQAAAwGCgAMBg4KAAAAAAAQBQAYAAAAERMRDgAfAAAACAUABAAAFBcSCxEABAAAAAoFAAgAAAoLCQkIAAQODAANBQwADgwFCQsUBAwfCAIACQ0MAAQSCgQEDAASBAQEAAkdAAAEEhQUFBIEEgQCAgQJDwAADBIAEhIKAAwADAwCAAAAAAQMABISEAAABAQAAAAEHgAOAAAAAA4AAAQEFxEEBAEAEQAFAgARAAAEDwgOHwQGABUACgIAGwAABBQICgQACQAZDhQeAB0AAAAUHA4fABIAGRIKAAAbAAAEDggRCgQMABUOBQAAHQAAAAQGABEEEAARAgAAABEAAAAEAAARBA4KDgwAAAAOHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAHhALAB8EAAAAAAAOAAAAAAEIFAAIBAAAAAAAHw4fAAAOBBYABAQAAAAAAA4AAAALEAgVAAIKAAwIGxIEAAAWCw4QCgAfEQAIBBIJAAAADR8AAAAAABEABAwJGwAAAAAABAAAAAQAAAAIGBIABAQAAAAAAAAAAAYABAQJFQQEABsOAg8PHwAJAAwEGwAEHwAbEQQUFBAAHAAABAAABAQAEAEIFBYIAAgAAA4AAB8EAAgOBBYUBAAcAAAEAAAEHwoEEAIUDwIACQAABAAABAQEGg4ADwAfAAYAAAMAAAAEABkEAAAABAAQAQAAAAAAAAAOAAMEGAAAEAEQHgcPBAoRAR8EBAQAAB4PEAEIEQoVCg8IBAQEEgARERAOCBEKFQQRBBgEAxUAEREZEAgREREKEQIYBAMJAB4PFg4eEREREREfBAQEAAAAAAAACAAAAAAAAAQEBAAAAAAAAAgAAAAAAAADBBgAAAAAAAAAAAAOAAAcAAAAAAAADx4PDw8IAREOAhEGFREOABEREBEQCA8RBAISBBUREQAPERARHwgREQQCHAQVEREAAREQEREIEREEAhIEFRERAA4eDg8OHg8eDA4RBBoeDgQAEAABAAgAEAAAEAQAAAAIABAAAQAHABAEAhAMAAAAAAEAAAAAAAAAAAAOAQ4AHxANEQ4EDgQKEQQfCAICAAAQEhERBBEKDhEEEAgCAgAAHhERAQQRChUKBAgIBAIRABERHg4EEREVBAoECAQCCgAREREQBBEREQoRAggIAgoAHg4eDh8RERERER8ICAIEAAAAAAAAAAAAAAAADhAOBAAPAAAAAAAAAAAAAAAAAAAAEBEeDhwfEA4RDg4RHxERDhMRERESEBAREQQREhAREREVDhEQERAQFxEEERwQERMRFQoeEBEcHBAfBAEUEBUVERMEERESEBAQEQQBEhAbGRERBB4OHB8fDhEOBxEQEREODgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAIAEAAOHx8OAg4OCA4OBAQEAAgEGQQQER8REQgRAQQECB8EABUEDgESAREEEQ8AABAAAgQVFAEGCh4eAg4RBAQIHwQCEwwREQYQCAEREQQEBAAIEQ4EDg4CHwYfDg4AAAIAEA4AAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAACCAAACAAAEAAEAAoOEw0ABAQKBAQABAgAAAAfFQsSAAgCBAQEAAQIAAQACgUIEgAIAh8fAB8ABAAEAAoOBA0ACAIEBAAAAAQABAofFAIEBAgCCgQAAAACAAQKCg4aCgQEBAAAAAAAAgAACgAEGQQEAggAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==)

**Note:** `g.setFontBitmap()` can be used, but is deprecated and `g.setFont("Bitmap", scale);` is preferred.


Font Modules
-----------

Often you may want a font that is bigger than the built-in font, but smaller than the vector font. For this, you can use one of the font modules.

Current modules are:

<!-- .[](FontXXXX.js) is handled by build.js -->

| Font Map | Name | Description |
|----------|------|-------------|
| ![](Font4x4Numeric.js) | [[Font4x4Numeric.js]] | Tiny 4x4 fixed width font with no space between characters (only digits 0-9) |
| ![](Font4x4.js) | [[Font4x4.js]] | Tiny 4x4 fixed width font by jose1711 |
| ![](Font4x5Numeric.js) | [[Font4x5Numeric.js]] | 4x5 variable width font (only `./0123456789`) |
| ![](Font4x8Numeric.js) | [[Font4x8Numeric.js]] | 4x8 fixed width font (only digits 0-9) |
| ![](Font5x7Numeric7Seg.js) | [[Font5x7Numeric7Seg.js]] | 5x7 7 segment-style font (only `.0123456789:ABCDEF`) |
| ![](Font7x11Numeric7Seg.js) | [[Font7x11Numeric7Seg.js]] | 7x11 7 segment-style font (only `.0123456789:ABCDEF`) |
| ![](FontCopasetic40x58Numeric.js) | [[FontCopasetic40x58Numeric.js]] | 40x58 numeric font (only `0123456789`) by [abhigkar](https://github.com/abhigkar/bangleJs-Custom-Fonts) |
| ![](Font6x8.js) | [[Font6x8.js]] | Variable width 8px high font |
| ![](Font6x12.js) | [[Font6x12.js]] | Variable width 12px high font |
| ![](Font8x12.js) | [[Font8x12.js]] | Wider variable width 12px high font |
| ![](Font8x16.js) | [[Font8x16.js]] | Variable width 16px high font |
| ![](FontDennis8.js) | [[FontDennis8.js]] | An 8 pixel high font by [Dennis Bemmann](https://github.com/pastaclub/espruino-font-dennis8) for non-english languages - see [Character Sets](#character-sets) |
| ![](FontCherry6x10.js) | [[FontCherry6x10.js]] | Variable width font with most characters for non-english languages - see [Character Sets](#character-sets) (originally from https://github.com/turquoise-hexagon/cherry) |
| ![](FontDylex7x13.js) | [[FontDylex7x13.js]] | Variable width font with most characters for non-english languages, see [Character Sets](#character-sets) (originally from https://github.com/dylex/fonts) |
| ![](FontHaxorNarrow7x17.js) | [[FontHaxorNarrow7x17.js]] | Variable width font with most characters for non-english languages, see [Character Sets](#character-sets) (originally from https://github.com/metan-ucw/fonts) |
| ![](FontSinclair.js) | [[FontSinclair.js]] | Fixed width 8x8 Retro Sinclair font by [Steve Anderson](https://github.com/IrregularShed), Copyright Sinclair Research, non-commercial use approved. |
| ![](FontTeletext10x18Ascii.js) | [[FontTeletext10x18Ascii.js]] | Fixed width Teletext / BBC Micro "MODE 7" font, 7-bit ASCII, with interpolated pixels as intended |
| ![](FontTeletext10x18Mode7.js) | [[FontTeletext10x18Mode7.js]] | Fixed width Teletext / BBC Micro "MODE 7" font, UK character set, with interpolated pixels as intended |
| ![](FontTeletext5x9Ascii.js) | [[FontTeletext5x9Ascii.js]] | Fixed width Teletext / BBC Micro "MODE 7" font, 7-bit ASCII, with original structural pixels only |
| ![](FontTeletext5x9Mode7.js) | [[FontTeletext5x9Mode7.js]] | Fixed width Teletext / BBC Micro "MODE 7" font, UK character set, with original structural pixels only |


Use these as follows:

```
// On initialisation...
require("Font8x12").add(Graphics);

// When drawing...
g.setFont8x12();
// or use: g.setFont("8x12")
g.drawString("Hello World!",0,0);

// Or double-size!
g.setFont("8x12",2);
g.drawString("Hello World!",0,20);
```

For instance if using [[FontDennis8.js]], use `require("FontDennis8")` and `g.setFontDennis8();` or `g.setFont("Dennis8")`.

Character sets
---------------

Espruino does not support unicode natively (and even if it did there wouldn't be
enough memory for every character). Espruino's strings are 8 bits only, so
while Espruino can store UTF-8, it doesn't interpret it in any useful way.

To deal with Latin languages, Espruino uses an 8 bit Latin codepage.
This is effectively the following:

* ISO8859-1 (otherwise known as ISO Latin)
* ISO10646-1/Unicode (this is UTF-16, but character codes 0..255 are basically the same as ISO8859-1)

There are some minor differences between the two (eg. the Euro symbol at char code 128)
but on the whole they are identical.

* The built-in 4x6 small font (as well as Vector font) only includes 0-127 ASCII chars
* The 6x8 font (where included) contains the full character set
* Many custom fonts contain the full character set (see above)

To convert text to ISO8859-1 on the desktop you can usually just use
`String.charCodeAt(position)`. Since character codes returned are
Unicode, if the character code is between 0 and 255 it should map
directly to Espruino's font.


Custom Fonts
-----------

You can also create your own fonts. To do this, see [`g.setFontCustom(...)`](/Reference#l_Graphics_setFontCustom)

You'll need a string containing a column-first, most significant bit first, 1 bit per pixel bitmap containing the font bitmap. Optionally you can also have another string containing the widths of each character.

We now have a [Font Converter page](/Font Converter) that allows you to
create fonts for Espruino based on a Web Font.

Matt Brailsford has made an excellent [online font converter](http://ebfc.mattbrailsford.com/) specifically for creating fonts for Espruino.
... or for an example of how to create the data programmatically, take a look at
[the JS file used to make Espruino's font modules](https://github.com/espruino/Espruino/blob/master/scripts/create_custom_font.js).


Font Widths
----------

Often it's extremely useful to know the size of a piece of text - either so that you can position it centrally, or so that you can position other text at the end. For this, you can use `g.stringWidth()`.

For example you may want to draw some small text right after some big text:

```
function bigThenSmall(big, small, x, y) {
  g.setFont("Vector",20);
  g.drawString(big, x, y);
  x += g.stringWidth(big);
  g.setFont("4x6");
  g.drawString(small, x, y);
}
bigThenSmall("Hello", " World", 0,0);
```

or you may just want to draw text centrally:

```
function central(text, y) {
  g.drawString(text, (g.getWidth() - g.stringWidth(text))/2, y);
}
central("Hello", 0);
```

Doubling Font Size
------------------

There might be a case where you need to take a small font and double the size of it (to save memory, or because it can look interesting).

As of Espruino 2v05 can now just use `g.setFont(fontName, scaleFactor)`.

However in older Espruino versions you could use this (slower) code:

```
// txt=text string, px=>x position, py=>y position, h=height of font
Graphics.prototype.drawStringDbl = (txt,px,py,h)=>{
  var g2 = Graphics.createArrayBuffer(128,h,2,{msb:true});
  // set your custom font here if you need to
  var w = g2.stringWidth(txt);
  var c = (w+3)>>2;
  g2.drawString(txt);
  var img = {width:w*2,height:1,transparent:0,buffer:new ArrayBuffer(c)};
  var a = new Uint8Array(img.buffer);
  for (var y=0;y<h;y++) {    
    a.set(new Uint8Array(g2.buffer,32*y,c));
    this.drawImage(img,px,py+y*2);
    this.drawImage(img,px,py+1+y*2);
  }
};


g.clear()
g.drawStringDbl("Hello",0,0,5)
g.flip()
```

The code works with a maximum text width of 128px, which means 256px in double-size font.
