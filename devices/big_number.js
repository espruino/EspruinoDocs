/* Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/* 
Big Number library for use with 20x4 text-based LCDs. This fills the screen with 5 huge numbers of your choosing.

```
var lcd = require("HD44780").connect(A4,A5,A0,A1,A2,A3);
var disp = require("big_number").use(lcd);
disp.showNumber(12345);
```  

*/

exports.use = function(lcd) {
  var bigChars =
["415 431151153 3311411115415415",
 "3 3  3223223323315315  3323723",
 "3 3  33    3  3  33 3  33 3  3",
 "726  3322226  3226726  3726226"];
  // create the chars
  lcd.createChar(1,[31,31,31,31,0,0,0,0]);
  lcd.createChar(2,[0,0,0,0,0,31,31,31,31]);
  lcd.createChar(3,[31,31,31,31,31,31,31,31]);
  lcd.createChar(4,[1,3,7,15,31,31,31,31]);
  lcd.createChar(5,[16,24,28,30,31,31,31,31]);
  lcd.createChar(6,[31,31,31,31,30,28,24,16]);
  lcd.createChar(7,[31,31,31,31,15,7,3,1]);
  return {
    // write a big number num at column number x
    showDigit : function(x, num) {
      for (var y=0;y<4;y++) {
        lcd.setCursor(x,y);
        for (var n=0;n<3;n++) {
          var c = bigChars[y].charAt(num*3+n);
          lcd.write(c==" "?32:parseInt(c,10));
        }
      }
    },
    // write the given 5 digit decimal on the LCD screen
    showNumber : function(num) {
      lcd.clear(); this.showDigit(17,num%10);
      if (num>9) this.showDigit(14,(num/10)%10);
      if (num>99) this.showDigit(11,(num/100)%10);
      if (num>999) this.showDigit(8,(num/1000)%10);
      if (num>9999) this.showDigit(5,(num/10000)%10);
    }
  };
};
