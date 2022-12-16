/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd and MaBe. See the file LICENSE for copying permission. */
/*

Usage:

```
require("Font4x5").add(Graphics);
g.setFont4x5();
g.drawString("ESPRUINO ROCKS !");
```

Source:

var fontBitmap = Graphics.createImage(`
\n\n\n


111 1

11

11

11111
 1 1
11111

 1  1
11111
1  1

1  1
  1
 1  1

 1 1
1 1 1
1 111


11


 111
1   1


1   1
 111


1 1 1
 111
1 1 1

  1
 111
  1


11


  1
  1
  1


    1



   11
  1
11

11111
1   1
11111

 1
11111


1 111
1 1 1
111 1

1 1 1
1 1 1
11111

111
  1
11111

111 1
1 1 1
1 111

11111
1 1 1
1 111

1
1
11111

11111
1 1 1
11111

111 1
1 1 1
11111


 1 1


    1
 1 1


1   1
 1 1
  1

 1 1
 1 1
 1 1

  1
 1 1
1   1

1
1 1 1
 1

1 111
1 1 1
 1 1

 1111
1 1
 1111

11111
1 1 1
 1 1

 111
1   1
 1 1

11111
1   1
 111

11111
1 1 1
1 1 1

11111
1 1
1 1

 111
1   1
1  11

11111
  1
11111


11111


   1
    1
1111

11111
  1
11 11

11111
    1
    1

11111
 1
11111

11111
1
 1111

 111
1   1
 111

11111
1 1
 1

 111
1  11
 1111

11111
1 1
 1 11

 1  1
1 1 1
1  1

1
11111
1

11111
    1
11111

1111
    1
1111

11111
   1
11111

11 11
  1
11 11

11
  111
11

1  11
1 1 1
11  1

11111
1   1


11
  1
   11

1   1
11111


 1
1
 1

    1
    1
    1

1
 1


 1111
1 1
 1111

11111
1 1 1
 1 1

 111
1   1
 1 1

11111
1   1
 111

11111
1 1 1
1 1 1

11111
1 1
1 1

 111
1   1
1  11

11111
  1
11111


11111


   1
    1
1111

11111
  1
11 11

11111
    1
    1

11111
 1
11111

11111
1
 1111

 111
1   1
 111

11111
1 1
 1

 111
1  11
 1111

11111
1 1
 1 11

 1  1
1 1 1
1  1

1
11111
1

11111
    1
11111

1111
    1
1111

11111
   1
11111

11 11
  1
11 11

11
  111
11

1  11
1 1 1
11  1

  1
11111
1   1


11 11


1   1
11111
  1

1
11
 1
`.substr(1)).buffer;


g.clear();

Graphics.prototype.setFont4x5 = function() {
  this.setFontCustom(fontBitmap,' '.charCodeAt(), 4, 5);
};
g.setFont("4x5",4);
g.drawString("!\"#$&'()*+,-./",1,5);
g.drawString("0123456789",1,30);
g.drawString(":;>=<?@",1,55);
g.drawString("ABCDEFGHIJKLM",1,80);
g.drawString("NOPQRSTUVWXYZ",1,105);
g.drawString("[\\]^_`",1,130);
g.drawString("abcdefghijklm",1,155);
g.drawString("nopqrstuvwxyz",1,180);
g.drawString("{|}~",1,205);
*/
exports.add = function(graphics) {
  graphics.prototype.setFont4x5 = function(scale) {
	this.setFontCustom(atob("AAAAdBgGAfV8CfyBIiQKrcAMAA6IARcAFXVARxAAwABCEAAIAAGTAPx+BHwAvXoK1+DhPg7W4P1uCEPg/X4O1+ACgACoAIqIBSlAIqIIVQC9VAfR4P1UB0VA/FwP1qD9KAdGYPk+AHwAEHwPk2D4Qg+j4PweB0XA/RAHTeD9FgTWQIfgD4fg8HwPi+DZNgwfAJ1yD8QAwQYI/ABEEACEIIIAB9Hg/VQHRUD8XA/WoP0oB0Zg+T4AfAAQfA+TYPhCD6Pg/B4HRcD9EAdN4P0WBNZAh+APh+DwfA+L4Nk2DB8AnXICfiAGwAj8gIYQAA=="),32,4,5|(scale<<8));
  };
};
