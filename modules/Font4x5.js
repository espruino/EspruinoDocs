/* Copyright (c) 2020 Gordon Williams, Pur3 Ltd and MaBe. See the file LICENSE for copying permission. */
/* 

Usage:

```
require("Font4x5").add(Graphics);
g.setFont4x5();
g.drawString("ESPRUINO ROCKS !");
```
*/
exports.add = function(graphics) {
  graphics.prototype.setFont4x5 = function() {
	this.setFontCustom(atob("AAAAdBgGAfV8CfyBIiQKrcAMAA6IARcAFXVARxAAwABCEAAIAAGTAPx+BHwAvXoK1+DhPg7W4P1uCEPg/X4O1+ACgACoAIqIBSlAIqIIVQC9VAfR4P1UB0VA/FwP1qD9KAdGYPk+AHwAEHwPk2D4Qg+j4PweB0XA/RAHTeD9FgTWQIfgD4fg8HwPi+DZNgwfAJ1yD8QAwQYI/ABEEACEIIIAB9Hg/VQHRUD8XA/WoP0oB0Zg+T4AfAAQfA+TYPhCD6Pg/B4HRcD9EAdN4P0WBNZAh+APh+DwfA+L4Nk2DB8AnXICfiAGwAj8gIYQAA=="),' ',4,5);
  };
};
