/* Copyright (c) 2026 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
class XMLLexer {
  constructor(cb) {
    this.cb = cb;
    this.j=''; // input buffer
  }
  write(data) {
    this.j+=data;
    var i = this.j.indexOf("<"),k,v,x;
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
      var tag = this.j.substring(end?2:1,i);
      if (tag.length>1 && tag[0]=="?" && tag[tag.length-1]=="?") tag = tag.slice(0,-1); // <?xml ... ?>
      var tagName = tag.match(/^[^\s]*/)[0], a={}, m, q;
      var attrs = tag.substr(tagName.length).trim();
      while (attrs.length) { // name, name=value, name="value" or name='value'
        m = attrs.match(/[^\s=]+/);
        if (!m || !m[0]) break;
        k = m[0];
        attrs = attrs.substr(m.index+k.length).trim();
        v = "";
        if (attrs[0]=="=") {
          attrs = attrs.substr(1).trim();
          q = attrs[0];
          if (q=='"' || q=="'") {
            x = attrs.indexOf(q,1);
            if (x<0) x = attrs.length;
            v = attrs.substring(1,x);
            attrs = attrs.substr(x+1);
          } else {
            v = attrs.match(/^[^\s]*/)[0];
            attrs = attrs.substr(v.length);
          }
          attrs = attrs.trim();
        }
        a[k] = v;
      }
      if (end) this.cb({t:"/", name:tagName});
      else {
        this.cb({t:"<>", name:tagName, attrs:a});
        if (ended) this.cb({t:"/", name:tagName});
      }
      this.j = this.j.substr(i+(ended?2:1));
      i = this.j.indexOf("<");
    }
  }
};


exports = XMLLexer;