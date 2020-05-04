/* Copyright (c) 2019 Tom Gidden. See the file LICENSE for copying permission. */

/* Based on character set of Mullard SAA5055 character generator, as used by BBC Microcomputer "MODE 7", but with character set equivalent to 7-bit US ASCII.

Usage:

```
require("FontTeletext5x9Ascii").add(Graphics);
g.setFontTeletext5x9Ascii();
g.drawString("0123456789");
```
*/
const font = atob("AAA+gAAAAAHAAHAAAAKH8KH8KAAZEk/kkTAAxGQEBMRgAbEkagICgAABAwAAAAAABwREEAAAAEERBwAAARBQ/hQRAAEAgfAgEAAAACBgAAAAAAgEAgAAAAAAAgAAAABAQEBAQAAOCIgiIOAAACE/gEAAARkUkkkYgAhEEklkzAAGBQSH8CAA5FEolEnAAPCkkkkDAAgEckFAwAAbEkkkkbAAYEkkkoeAAAAAIgAAAAAACJgAAAAEBQREEAAAKBQKBQKAAAEERBQEAAQEAmlAQAAfEEulUegAPiQiCQPgA/kkkkkbAAfEEgkERAA/kEgkEfAA/kkkkkggA/kgkEggAAfEEgkUTgA/ggEAg/gAAEE/kEAAABAEAgE/AA/ggKCIggA/gEAgEAgA/iAMCA/gA/hAEAQ/gAfEEgkEfAA/kgkEgYAAfEEikIegA/kgmEoYgAZEkkkkTAAgEA/kAgAA/AEAgE/AA4AwBgw4AA/AEHAE/AAxhQEBQxgAwBAHhAwAAhkUklEwgAAH8gkEggAQBAEAQBAAgkEgn8AAAICAgCAIAAAgEAgEAgAAAAwBAAAABBUKhUHgA/hEIhEHAAHBEIhEIgAHBEIhE/gAHBUKhUGAAAAgfkgAAAHBFIpFPwA/hAIBAHgAABEvgEAAAAABvwAAAAAH8CAoIgAAEE/gEAAAPhAHhAHgAPhAIBAHgAHBEIhEHAAP5EIhEHAAHBEIhEP4AAB8EBAIAAEhUKhUJAAABA/BEAAAPAEAgEPgAMAYAgYMAAPAEDAEPAAIgoCAoIgAPAFAoFPwAIhMKhkIgAAAgbEEggAAAA/gAAAAgkEbAgAAAQEAQBAQAA/n8/n8/gAAAAAAAAAA");
exports.add = function(graphics) {
    graphics.prototype.setFontTeletext5x9Ascii = function() {
        this.setFontCustom(font, 33, 6, 9);
    }
}
