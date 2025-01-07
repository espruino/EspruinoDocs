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

![](data:image/bmp;base64,Qk1ADQAAAAAAACAAAAAMAAAA+gBpAAEAAQD///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gP8AAAAHgAAP4AAAA/gAAPD+AAAAAAAAAAAAAAAAAH+A/wAAAB/gAA/gAAAD+AAD/P4AAAAAAAAAAAAAAAAAf4D/AAAAf/gAD+AAAAP4AA///gAAAAAAAAAAAAAAAAD/gP+AAAH//gAP4AAAA/gAP//+AAAAAAAAAAAAAAAAAP+B/4AAB///gA/gAAAD+AD///4AAAAAAAAAAAAAAAAA/8H/gAAH//+AD+AAAAP4AP///gAAAAAAAAAAAAAAAAD/wf+AAA///8AP4AAAA/gB///+AAAAAAAAAAAAAAAAAf/B/8AAD///wA/gAAAD+AH///4AAAAAAAAAAAAAAAAB/8H/wAAf8D/gD+AAAAP4A/4H/gAAAAAAAAAAAAAAAAH/wf/AAB/gH+AP4AAAA/gD/AP+AAAAAAAAAAAAAAAAAf/D/8AAP8AP8A/gAAAD+Af4Af4AAAAAAAAAAAAAAAAD/+P/4AA/gAfwD+AAAAP4B/AA/gAAAAAAAAAAAAAAAAP/4//gAD+AB/AP4AAAA/gH8AD+AAAAAAAAAAAAAAAAA//j/+AAP4AH8A/gAAAD+AfwAP4AAAAAAAAAAAAAAAAD/+P/4AA/gAfwD+AAAAP4B/AA/gAAAAAAAAAAAAAAAAf/4//wAD+AB/AP4AAAA/gH8AD+AAAAAAAAAAAAAAAAB//n//AAP4AH8A/gAAAD+AfwAP4AAAAAAAAAAAAAAAAH//f/8AA/gAfwD+AAAAP4B/AA/gAAAAAAAAAAAAAAAAf/9//wAD+AB/AP4AAAA/gH8AD+AAAAAAAAAAAAAAAAD//3//gAP8AP8A/wAwAD+Af4Af4AAAAAAAAAAAAAAAAP9/f3+AAf4B/gD/gHwAP4A/wD/gAAAAAAAAAAAAAAAA/n9/P4AB/wP+AP/A/wA/gD/gf+AAAAAAAAAAAAAAAAD+f/8/gAD/h/wA/+H/wD+AH/D/4AAAAAAAAAAAAAAAAf5//z/AAP///AD///+AP4Af///gAAAAAAAAAAAAAAAB/n//P8AAf//4AP///wA/gA///+AAAAAAAAAAAAAAAAH8f/8fwAB///gA///+AD+AD///4AAAAAAAAAAAAAAAAfw//h/AAD//8AD///wAP4AH///gAAAAAAAAAAAAAAAD/D/+H+AAD//AAP//8AA/gAH//+AAAAAAAAAAAAAAAAP8P/4f4AAD/wAA/v/AAD+AAH/v4AAAAAAAAAAAAAAAA/g//g/gAAD8AAD+PwAAP4AAH4/gAAAAAAAAAAAAAAAD+D/+D+AAAAAAAAAAAAA/gAAAD+AAAAAAAAAAAAAAAAf4P/4P8AAAAAAAAAAAAD+AAAAP4AAAAAAAAAAAAAAAB/gf/A/wAAAAAAAAAAAAP4AAAA/gAAAAAAAAAAAAAAAH8B/8B/AAAAAAAAAAAAA/gAAAD+AAAAAAAAAAAAAAAAfwH/wH8AAAAAAAAAAAAD+AAAAP4AAAAAAAAAAAAAAAD/Af/Af4AAAAAAAAAAAAP4AAAA/gAAAAAAAAAAAAAAAP8B/8B/gAAAAAAAAAAAA/gAAAD+AAAAAAAAAAAAAAAA/gH/wD+AAAAAAAAAAAAD+AAAAP4AAAAAAAAAAAAAAAD+AP+AP4AAAAAAAAAAAAP4AAAA/gAAAAAAAAAAAAAAAf4A/4A/wAAAAAAAAAAAA/gAAAD+AAAAAAAAAAAAAAAB/gD/gD/AAAAAAAAAAAAD+AAAAP4AAAAAAAAAAAAAAAH8AP+AH8AAAAAAAAAAAAP4AAAA/gAAAAAAAAAAAAAAAfwA/4AfwAAAAAAAAAAAA/gAAAD+AAAAAAAAAAAAAAAD/AD/gB/gAAAAAAAAAAAD+AAAAP4AAAAAAAAAAAAAAAP8AH8AH+AAAAAAAAAAAAP4AAAA/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfAD+AHwfAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8A/+AfB8A/+AAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwH/4B8HwH/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfAf/AHwfAf/4AAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8D/4AfB8D//gAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwPgAB8HwPg/AAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfB8AAHwfB8B8AAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8H//wfB8HwHwAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwf//B8HwfAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfB//8HwfB8B8AAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8H//wfB8HwHwAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwf//B8HwfAfAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///B8B8HwfB8B8AAAAAAAAAAAAAAAAAAAAAAAAAAAA///8D4PwfB8D4PwAAAAAAAAAAAAAAAAAAAAAAAAAAAD///wPx+B8HwPx+AAAAAAAAAAAAAAAAAAAAAAAAAAAAP///Af/4HwfAf/4AAAAAAAAAAAAAAAAAAAAAAAAAAAA///8B//AfB8B//AAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwD/4B8HwD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfAD+AHwfAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8ADgAfB8ADgAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwAAAB8HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfAAAAHwfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8AAAAfB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwAAAB8HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfAAAAHwfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8AAAAfB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwAAAB8HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPgAfAAAAHwfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AB8AAAAfB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AHwAAAB8HwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=)

**Note:** `g.setFontVector(height)` can be used, but is deprecated and `g.setFont("Vector", 60);` is preferred.

The built-in vector font contains contains the [ASCII characters](http://www.asciitable.com/) 0-255 in the ISO8859-1 codepage (see [Character Sets](#character-sets)).

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
| ![](Font4x5.js) | [[Font4x5.js]] | Tiny 4x5 fixed width font |
| ![](Font4x8Numeric.js) | [[Font4x8Numeric.js]] | 4x8 fixed width font (only digits 0-9) |
| ![](Font5x7Numeric7Seg.js) | [[Font5x7Numeric7Seg.js]] | 5x7 7 segment-style font (only `-.0123456789:ABCDEF`) |
| ![](Font5x9Numeric7Seg.js) | [[Font5x9Numeric7Seg.js]] | 5x9 7 segment-style font (only `-.0123456789:ABCDEF`) |
| ![](Font7x11Numeric7Seg.js) | [[Font7x11Numeric7Seg.js]] | 7x11 7 segment-style font (only `-.0123456789:ABCDEF`) |
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
| ![](FontVGA8.js) | [[FontVGA8.js]] | Fixed width 8x8 PC VGA-style font |
| ![](FontVGA16.js) | [[FontVGA16.js]] | Fixed width 8x16 PC VGA-style font |

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

* The built-in 4x6 small font only includes 0-127 ASCII chars
* The 6x8 font and Vector fonts (where included) contain the full character set
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
