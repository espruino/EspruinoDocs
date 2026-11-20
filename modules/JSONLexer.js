/* Copyright (c) 2026 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
class JSONLexer {
  constructor(cb) {
    this.cb = cb;
    this.j=""; // input buffer
    this.idx=0; // index in input buffer
    this.ended=false; // set by end() - no more data will arrive
  }

  next() {
    var j=this.j, x = this.idx, ch = j[x], m, s;
    while (ch!==undefined && " \t\r\n".includes(ch)) ch=j[this.idx=++x]; // whitespace
    if (ch===undefined) return null; // EOF
    if ("[]{},:".includes(ch)) return this.idx++,ch; // single chars
    if ("-0123456789.".includes(ch)) { // number
      m = j.substr(x).match(/^[-+0-9.eE]+/)[0];
      if (x+m.length==j.length && !this.ended) return null; // may continue in the next chunk
      s = parseFloat(m);
      if (isNaN(s)) throw new Error(`Invalid number '${m}'`);
      this.idx=x+m.length;
      return s;
    }
    if (ch=='"') {
      x=j.indexOf('"',x+1);
      while (x>=0) { // skip quotes escaped by an odd number of backslashes
        for (s=x; j[s-1]=='\\'; s--);
        if (!((x-s)&1)) break;
        x=j.indexOf('"',x+1);
      }
      if (x<0) return null; // string not finished - wait for more
      s=j.substring(this.idx,x+1);
      this.idx=x+1;
      return s;
    }
    m = j.substr(x).match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (m===null) throw new Error(`Unknown token start '${ch}'`);
    if (x+m[0].length==j.length && !this.ended) return null; // may continue in the next chunk
    this.idx=x+m[0].length;
    return m[0];
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

  end(data) {
    this.ended = true;
    this.write(data||"");
  }
}

exports = JSONLexer;
