/* Copyright (c) 2026 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
class JSONLexer {
  constructor(cb) {
    this.cb = cb;
    this.j=""; // input buffer
    this.idx=0; // index in input buffer
  }

  next() {
    var j=this.j, x = this.idx, ch = j[x], m, s;
    if (ch===undefined) return null; // EOF
    while (" \t".includes(ch)) ch=j[this.idx=++x]; // whitespace
    if ("[]{},:".includes(ch)) return this.idx++,ch; // single chars
    if ("-0123456789.".includes(ch)) { // number
      if (ch=='-') x++;
      s = j.substr(x).match(/^\d+/)[0];
      x += s.length;
      if (j[x]==".") {
        m = j.substr(x+1).match(/^\d*/)[0];
        s += '.'+m;
        x += 1+m.length;
      }
      this.idx=x;
      return ((ch=="-")?-1:1)*parseFloat(s);
    }
    if (ch=='"') {
      x=j.indexOf('"',x+1);
      while(x>=0 && j[x-1]=='\\') x=j.indexOf('"',x+1);
      if (x<0) return null;
      s=j.substring(this.idx,x+1);
      this.idx=x+1;
      return s;
    } else {
      m = j.substr(x).match(/^[A-Za-z_][A-Za-z9-9_]*/);
      if (m!==null) {
        this.idx=x+m[0].length;
        return m[0];
      } else throw new Error(`Unknown token start '${ch}'`);
    }
  }

  write(data) {
    this.j += data;
    var tk = this.next();
    while (tk!==null) {
      this.cb(tk);
      tk=this.next();
    }
    this.j = this.j.substr(this.idx);
    this.idx = 0;
  }
}

exports = JSONLexer;