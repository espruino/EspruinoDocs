/* Copyright (c) 2019 Tom Gidden. See the file LICENSE for copying permission. */

/* Based on character set of Mullard SAA5050 character generator, as used by BBC Microcomputer "MODE 7" and Teletext in the UK.  SAA5050 character set, with £ and # reversed

Usage:

```
require("FontTeletext5x9Mode7").add(Graphics);
g.setFontTeletext5x9Mode7();
g.drawString("0123456789");
```
*/
const font = atob("AAA+gAAAAAHAAHAAAAEj8kkEQgAZEk/kkTAAxGQEBMRgAbEkagICgAABAwAAAAAABwREEAAAAEERBwAAARBQ/hQRAAEAgfAgEAAAACBgAAAAAAgEAgAAAAAAAgAAAABAQEBAQAAOCIgiIOAAACE/gEAAARkUkkkYgAhEEklkzAAGBQSH8CAA5FEolEnAAPCkkkkDAAgEckFAwAAbEkkkkbAAYEkkkoeAAAAAIgAAAAAACJgAAAAEBQREEAAAKBQKBQKAAAEERBQEAAQEAmlAQAAfEEulUegAPiQiCQPgA/kkkkkbAAfEEgkERAA/kEgkEfAA/kkkkkggA/kgkEggAAfEEgkUTgA/ggEAg/gAAEE/kEAAABAEAgE/AA/ggKCIggA/gEAgEAgA/iAMCA/gA/hAEAQ/gAfEEgkEfAA/kgkEgYAAfEEikIegA/kgmEoYgAZEkkkkTAAgEA/kAgAA/AEAgE/AA4AwBgw4AA/AEHAE/AAxhQEBQxgAwBAHhAwAAhkUklEwgAEBwVAgEAA+AACYVBIAEAgVBwEAAEBAfBAEAAKH8KH8KAAEAgEAgEAABBUKhUHgA/hEIhEHAAHBEIhEIgAHBEIhE/gAHBUKhUGAAAAgfkgAAAHBFIpFPwA/hAIBAHgAABEvgEAAAAABvwAAAAAH8CAoIgAAEE/gEAAAPhAHhAHgAPhAIBAHgAHBEIhEHAAP5EIhEHAAHBEIhEP4AAB8EBAIAAEhUKhUJAAABA/BEAAAPAEAgEPgAMAYAgYMAAPAEDAEPAAIgoCAoIgAPAFAoFPwAIhMKhkIgAAHwAwKD4AAH8AH8AAAqFQUwKD4AEAgVAgEAA/n8/n8/gAAAAAAAAAA");
exports.add = function(graphics) {
    graphics.prototype.setFontTeletext5x9Mode7 = function() {
        this.setFontCustom(font, 33, 6, 9);
    }
}
