/* Copyright (c) 2021 Gordon Williams. See the file LICENSE for copying permission. */

/* starting with fitWords()

Usage:

```js
//fitWords(text,rows,width)
var line = 'Mary had a little lamb. His fleece was black as coal, yeah. Everywhere the child went.';
var width = 30,
    rows = line.length / 30 + 1;
var wrappedLine= require('StringDecoders').fitWords(longString,rows,width);
// wrappedLine is now a string with '\n' 
```

*/

exports.fitWords = function(text,rows,width) {
  // We never need more than rows*width characters anyway, split by any whitespace
  const words = text.trim().substr(0,rows*width).split(/\s+/);
  let row=1,len=0,limit=width;
  let result = "";
  for (let word of words) {
    // len==0 means first word of row, after that we also add a space
    if ((len?len+1:0)+word.length > limit) {
      if (row>=rows) {
        result += "...";
        break;
      }
      result += "\n";
      len=0;
      row++;
      if (row===rows) limit -= 3; // last row needs space for "..."
    }
    result += (len?" ":"") + word;
    len += (len?1:0) + word.length;
  }
  return result;
};
