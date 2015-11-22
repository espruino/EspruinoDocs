/* Copyright (c) 2015 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */

/** Create a VT100-style terminal.

  g = Graphics to use
  charWidth = width of characters in pixels
  charHeight = height of characters in pixels
*/
function VT100(g, charWidth, charHeight) {
  this.g = g;
  this.charW = charWidth;
  this.charH = charHeight;
  this.x = 0;
  this.y = 0;
  // console height in lines
  this.consoleHeight = 0|(g.getHeight() / charHeight);
  this.controlChars = "";
}
/// Draw an underline under the current character
VT100.prototype.drawCursor = function() {
  this.g.fillRect(this.x*this.charW, (this.y+1)*this.charH-1, 
                  (this.x+1)*this.charW-1, (this.y+1)*this.charH-1);
};
/// Scroll the screen down (if possible, else clear)
VT100.prototype.scrollDown = function() {
  if (this.g.buffer !== undefined) {
    // if we have a buffer, hopefully we can scroll
    var stride = this.g.buffer.length / this.consoleHeight;
    new Uint8Array(this.g.buffer).set(new Uint8Array(this.g.buffer, stride), 0);
    this.y--;
    return;
  } else {
    // otherwise fall back - just clear screen
    this.g.clear();
    this.y=0;
  }
};
/// Call this every time you get a character (ch is a single-character string)
VT100.prototype.char = function(ch) {
  var chn = ch.charCodeAt(0);
  // clear cursor
  this.g.setColor(0);
  this.drawCursor();

  if (this.controlChars.length===0) { 
    if (chn==8) {
      if (this.x>0) this.x--;
    } else if (chn==10) { // line feed
      this.x = 0; this.y++;
      while (this.y >= this.consoleHeight) this.scrollDown();
      // TODO: scroll!
    } else if (chn==13) { // carriage return
      this.x = 0;
    } else if (chn==27) {
      this.controlChars = [ 27 ];
    } else if (chn==19 || chn==17) { // XOFF/XON
    } else {
      // Else actually add character
      this.g.fillRect(this.x*this.charW, this.y*this.charH, 
                 (this.x+1)*this.charW-1, (this.y+1)*this.charH-1);
      this.g.setColor(1,1,1);        
      this.g.drawString(ch, this.x*this.charW, this.y*this.charH);
      this.x++;
    }
  } else if (this.controlChars[0]==27) {
    if (this.controlChars[1]==91) {
      if (this.controlChars[2]==63) {
        if (this.controlChars[3]==55) {
          if (chn!=108)
            console.log("Expected 27, 91, 63, 55, 108 - no line overflow sequence");
          this.controlChars = [];
        } else {
          if (chn==55) {
            this.controlChars = [27, 91, 63, 55];
          } else this.controlChars = [];
        }
      } else {
        this.controlChars = [];
        switch (chn) {
          case 63: this.controlChars = [27, 91, 63]; break;
          case 65: if (this.y > 0) this.y--; break; // up  FIXME should add extra lines in...
          case 66: this.y++; while (this.y >= this.consoleHeight) this.scroll(); break;  // down
          case 67: this.x++; break; // right
          case 68: if (this.x > 0) this.x--; break; // left
        }
      }
    } else {
      switch (chn) {
        case 91: this.controlChars = [27, 91]; break;
        default: this.controlChars = []; break;
      }
    }
  } else this.controlChars = [];
  // draw cursor
  this.g.setColor(1,1,1);
  this.drawCursor();
};

exports.connect = function(g, charWidth, charHeight) {
  return new VT100(g, charWidth, charHeight);
};
