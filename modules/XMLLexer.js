/* Copyright (c) 2026 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
class XMLLexer {
  constructor(cb) {
    this.cb = cb;
    this.j=''; // input buffer
  }
  write(data) {
    this.j+=data;
    var i = this.j.indexOf("<"),k,v;
    while (i>=0) {
      if (i) { // parse out content
        this.cb({t:"c", txt:this.j.substr(0,i)});
        this.j = this.j.substr(i);
        i=0;
      } // now try and find tag (starts at 0)
      i = this.j.indexOf(">");
      if (i<0) return; // no tag end - wait for more
      var end = this.j[1]=="/";
      var ended = this.j[i-1]=="/";
      if (ended) i--;
      k = this.j.indexOf(" "); // first space
      if (k<0 || k>i) k=i;
      var tagName = this.j.substring(end?2:1,k);
      var attrs = i>k?this.j.substring(k+1,i).trim():undefined, a={};
      if (attrs) {
        var x = 0;
        while (attrs.length) {
          var m = attrs.match(/\s*([a-zA-Z_0-9:-]+)\s*=\s*/);
          if (!m) break;
          k=m[1];
          attrs = attrs.substr(m.index+m[0].length);
          if (attrs[0]=='"') {
            x=attrs.indexOf('"',1);
            while(x>=0 && attrs[x-1]=='\\') x=attrs.indexOf('"',x+1);
            if (x>0) v=JSON.parse(attrs.substring(0,x+1));
          } else {
            x=attrs.indexOf(" ");
            if (x>0) v=attrs.substr(0,x);
          }
          if (x>0) attrs = attrs.substr(x+1); else attrs="";
          a[k] = v;
        }
      }
      if (end) this.cb({t:"/", name:tagName});
      else {
        this.cb({t:"<>", name:tagName, attrs:a});
        if (ended) this.cb({t:"/", name:tagName});
      }
      this.j = this.j.substr(i+1);
      i = this.j.indexOf("<");
    }
  }
};


exports = XMLLexer;