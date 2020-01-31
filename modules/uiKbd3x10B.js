/* Copyright (c) allObjects - See the file https://muet.mit-license.org LICENSE for copying permission. */
/*

----- keyboard/keypad - 3 x 10 Btns ------------------------- 20190927


*** uiKbd3x10B - ui keyboard module w/ 3 rows x 10 columns of uiBtn ui elements.


Note: uiKbd3x10B *IS NOT* part of the ui singleton. It is a standalone
input ui element similar to the touch modules: connected to ui and ui
elements, but not mixed into the ui element and managed by the ui (yet
or ever).


--- Key assugnments and mappings

For Keyboards with buttons, key ids are the button ids, and button ids are
SINGLE character ids (thus reserved for the ui modules and not available
to application ui elements). The id of a key is the 1st char on the key
(btn), for examples:

```
 - "a" for key (btn) "a@"  , returning the values "a"    , "A", and "@".
 - "<" for key (btn) "<' \", returning the values "cr/lf", "'", and "\".
 - "." for key (btn) "
```

Keyboard key handler calls cb callback w/ values v, k, u, e, and t parameters:

```
  v - key value - single character representing the printable key; special
      values: "sh0".."sh3" for shift key, "bs" for BacksSpace, "cr/lf" for
      CR/LF 
  k - keyboard object (this)
  u - ui core singleton
  e - event source (key btn)
  t - touch object
```

e is the key board button that has just been untouched (k: keyboard, u: ui
core and t: touch event object).

Key value depends on short TAP / LONG TOUCH and shift key mode.

The ^-shift key cycles w/ short taps through  ^ m=0,  ^^ m=1,  ^^^ m=2,
^# m=3 its displays and modes; long touch always goes directly to
^# m=3 shift mode (number and special characters - NUM-LOCK).

For REGULAR keys, shift key modes and returned chars with regular - SHORT
TAP - are:

```
shift   shift
key     mode
display    impact (and for mode 1 only also state change)
  ^     0: lowercase   - key id/1st char in lowercase
  ^^    1: 1 uppercase - key id/1st char in uppercase, falls back to mode 0.
  ^^^   2: all uppercase, key id/1st char in uppercase (SHIFT LOCK)
  ^#    3: all number and special chars - 2nd char on key (NUM LOCK)
```

LONG TOUCH return number for key with numbers - top row - and for other
keys with three (3) characters this third character (except cr/lf key),
otherwise none (cr/lf key is double special: special 'special key').

The ^-shift key itself returns key values: "sh"+mode: "sh0", "sh1", "sh2"
and "sh3".

Special keys with shift mode 0..3 returns (listed by key, mode and short
tap or long touch):

```
special key w/ [chars on key] - location on keyboard
1st
chr
on  shift shft
key displ mod returns  (comment)
--- ----- --- -------- ---------------------------------------------------
^ (shift)[^],[^^],[^^^],[#^] - 1st key in bottom row
  ... w/ short tap:
    ^     0:  sh1     (when sh0 / ^ no-shift,     cycles to sh1, single shot)
    ^^    1:  sh2     (when sh1 / ^^ single shot  cycles to sh2)
    ^^^   2:  sh3     (when sh2 / ^^^ shift lock, cycles to sh3)
    #^    3:  sh0     (when sh3 / #^ NumLock,     cycles back to sh0)
  ... w/ long touch:
    N/C   *:  sh3     (ALWAYS jumps to mode 3 / "sh3" string for NumLock)

< (=cr/lf) [<'\] - last key in 2nd to bottom row:
  ... w/ short tap:
    ^     0:  cr/lf   ("cr/lf" string)
    ^^    1:  '       (single quote) and back to shift mode 0
    ^^^   2:  \       (back slash)
    #^    3:  cr/lf   ("cr/lf" string)
  ... w/ long touch:

. (dot) [.?..] - second to last key in bottom row:
  ... w/ short tap:
    ^     0:  .       (dot)
    ^^    1:  ?       (question mark) and back to shift mode 0
    ^^^   2:  .       (dot) 
    #^    3:  .       (dot)
  ... w/ long touch:
    ^     0:  .       (dot)
    ^^    1:  ?       (question mark) and back to shift mode 0
    ^^^   2:  .       (dot)
    #^    3:  .       (dot)

b/blank [ "_] - last key in bottom row:
  ... w/ short tap:
    ^     0:  b/blank (space 'bar')
    ^^    1:  "       (double quotes) and back to shift mode 0
    ^^^   2:  _       (underscore)
    #^    3:  b/blank (space 'bar')
  ... w/ long touch:
    N/A   *:  bs      (ALWAYS "bs" string for BackSpace)
```

In other words - basically:

- When no-shift (^): first char on key prints.
- Tap shift once (^^) prints next char in uppercase or 2nd special key on special key.
- Tap shift twice goes into SHIFT-LOCK and twice again goes bakc to no-shift.
- When in SHIFT-LOCK (^^^): char key prints uppercase and special key 3rd char.
- Touch shift long goes always into NUM-LOCK.
- When in NUM-LOCK (#^): key with number prints number, special key.
- Touch long key with number or 3rd, special char prints number and special char, resp.
- Tapping shift cycles from no-shift to single-shot shift, SHIFT-LOCK,
  NUM-LOCK and back to no-shift.


--- Usage example

get the keyboard and 'connect' it to entry field "i1" - as part of UI definition:

Note: this keyboard modules requires ui base and uiBtn modules to be
loaded. It creates for each key a button with the id being the first char
displayed on the key, for example, a,b,c,..., ^ for shift, < for enter /
return, blank (" ") for blank/backspace,... Therefore, (practically) all
single letter ui element id's are taken and therefore 'reserved'.

```
var ui = require("ui")     // load ui base module
    .adx(require("uiBtn")) // add module into base and remove from cache
    ;
var kbd = require("uiKbd3x10B")
                  .connect(ui,0,215,24,24, 7, 7,-2, 1, 1,10 ,0, 2, 4,
//                         ui,x,  y, w, h,bc,fc,sc,mx,my,fs,tc,tx,ty,cb
  function(v) {
    var s = ui.g("i1"); // is uiInp(ut field) ui element 
    if (v.length === 1) {  'normal' key - append
      ui.s("i1",s + "" + v);
    } else if (v === "bs") { BS/BackSpace key - remove last char
      if (s.length > 0) { ui.s("i1",s.substr(0,s.length - 1)); } 
    }
  } );
```


--- Module .connect(arguments)

```
 0  ui  ui core
 1  x   top of bounding box border
 2  y   left of bounding box border
 3  w   width of bounding box
 4  h   height of bounding box
 5  bc  key border color
 6  fc  key fill color for regular keys
 7  sc  key fill color for special keys (shift, return, special chars,...
 8  mx  x margin of key bounding box            ...only, blank, backspace)
 9  my  y margin of key bounding box
10  fs  key font spec
11  tc  key text color 
12  tx  key text x offset (within key/btn bounding box)
13  ty  key text y offset (within key/btn bounding box)
14  cb  callback function to accept following parameters:
   0  v   key: a single printable char, string for non-printables:
          "bs" for backspace, "cr/lf", "sh0".."sh4" for shift key
   1  k   keyboard (this sigleton)
   1  u   ui core singleton (see ui module)
   2  e   key btn that was just released (see uiBtn module)
   3  t   touch object (see ui module)
```

--- uiKbd3x10B - soft keyboard properties - variables and methods - mixed into ui base:

 */
exports =  // uiKbd3x10B
{ mn: "uiKbd3x10B"
, kc: 30   // key count
, fi: -1   // idx 1st key in ui.es ui elts; adjust when insert/remove before
, fk: null // first key ("q")
, lt: 0.14 // short touch maximum / medium ('long') touch min time in seconds
, tt: 0    // touch time in secs
, sm: 0    // shift mode (0="^", 1="^^", 2="^#", 3="^^^")
, sk: null // shift key
, cb: null // callback
, st: ["^","^^","^^^","#^"] // for shift key status display
, connect:   function(ui,x,  y, w, h,bc,fc,sc,mx,my,fs,tc,tx,ty,cb) {
    // parms example: ui,0,215,24,24, 7, 7,-2, 1, 1,10, 0, 2, 4,
    var _=_||this, f = (function(id,d,u,e,t) { // key handler (key btn callback)
          var m=_.sm, v=null, s=((_.tt=getTime() - u.tt) < _.lt);
          if ((p="^<. ".indexOf(id))<0) { // regular keys (!^shifts && !<(cr/lf) && !. && ! b(lank))
            if (s) { // short tap
              if (m==1) { // ==1:1UC 
                v = (id == ".") ? "/" : id.toUpperCase(); m=0;
              } else { // 0:*lc | 2:*UC: | 3:*sp:  
                v = (m) ? ((m == 2) ? id.toUpperCase() : e[11][4].charAt(1)) : id; }
            } else { // long touch - number or 3rd, special char (except for cr/lf)
              m = (m == 1) ? 0 : m; p = e[11][4]; if (e[9]<10) { v = p.charAt(1); // number
              } else if (p.length > 2) { v = p.charAt(2); } } // 3rd, special character
          } else if (!p) { // (p==0) (id==="^") { // ^ - shifts
            v = "sh" + ( m = (s) ? ((m = m + 1) > 3 ? 0 : m) : 3 ); // short tap | long touch
          } else if (p == 1) { // (id==="<") { // < CR/LF: 0:*lc: cr/lf | 1:1UC: special ' | 2:*UC: \ | 3:*sp: cr/lf
            if (m == 1) {  v = "'"; m = 0; } else { v = (m == 2) ? "\\" : "cr/lf"; }
          } else if (p == 2) { // (id===".") { // .: 0=*lc: . | 1=1UC: special: ? | 2=*UC: . | 3=*sp: .
            if (m == 1) { v = "?"; m = 0; } else { v = "."; }
          } else { // (p===3) (id===" ") { // b/blank: 0=l*c: b | 1=1UC: special: " | 2=*UC: b | 3=*sp: b
            if (s) { if (m == 1) { v = "\""; m = 0; } else { v = (m==2) ? "_" : " "; } // short tap
            } else { v = "bs"; } } // long touch - BackSpace
          if (m!==_.sm) { _.sk[11][4]=_.st[_.sm=m]; _.cb(v,k,u,e,t); if (u.di) { u.d(_.sk); }
          } else if (v !== null) { _.cb(v,k,u,e,t); }
        }).bind(_),
        xr, yr=y-h+my, k="q1w2e3r4t5y6u7i8o9p0a@s#d$f%g^h&j~k(l)<'^ z-x+c=v<b>n!m,.? \"",
        es=ui.es, r=es.length, bw=w-mx-mx, bh=h-my-my, v=-1, i;
    // creating the basic key with letter and numeric/special character
    for (i=0; i<59; i+=2) { if (i%20 === 0) { xr=1+mx; yr+=h; } else { xr+=w; } 
      ui.c(3,"btn",k.charAt(i),xr,yr,bw,bh,bc,fc,++v,f,[fs,tc,tx,ty,k.substr(i,2)]); }
    // color the special keys: enter/shift/dot/space 
    [19,20,28,29].forEach(function(rr){ (k=es[r+rr])[7]=k[8]=sc; });
    // add more types to certain keys (including blanks for 'formatting'
    xr=";:*[] \\`{}/|.. _";
    [14,15,16,17,18,19,19,23,24,25,26,27,28,28,29,29].forEach(function(rr,i){ 
        yr=(k=es[r+rr])[11]; yr[4]+=xr.charAt(i); if (ui.di) { ui.d(k); } });
    _.fk=es[_.fi=r]; _.sk=es[r+20]; _.cb=cb;
    return _;
  }
};
