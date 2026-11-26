<!--- Copyright (c) 2019 allObjects, Pur3 Ltd. See the file LICENSE for copying permission. -->
UI input field module
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/uiExt. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,UI,Graphics,User Interface

A module that provides various extension functions used by other `ui*` modules.

* `cvs: function(x,y,w)` - circle from vertices by bounding box w/ left, top and width
* `vs2: function(x,y,x2,y2,p)` - vertices for for chk like shapes ('beveled') corners. 4 'beveled corners' = 8 corners defined by 0 and p insetting combinations for x, y
* `vs3: function(x,y,x2,y2,p,q)` - return vertices for btn like shapes ('round' corners). 12 'round corners' (4x3) defined by 0, p and q insetting combinations for x and y
* `ff: function(a,f,s,_)` - find 1st in array w/ condition function from s-tart
* `fx: function(a,f,s,_)` - find idx in arr w/ condition...
* `e: function(iie,s)` - find e by idx,
* `g: function(iie)` - get value / value obj of ui element by idx, id or element
* `u: function(iie,v,p)` - update val obj of ui elt by idx, id or elt...

Using
-----

* APPEND_USES: uiExt
