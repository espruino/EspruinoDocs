<!--- Copyright (c) 2015 Gordon Williams & Sameh Hady. See the file LICENSE for copying permission. -->
Vec3 - 3 element Vector
=======================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Vec3. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Module,Vector,Vec3,XYZ,Point,Vertex,3D

This is a very simple library for maths on 3 element vectors. It's especially
useful when dealing with 3D data, for example from [Puck.js](/Puck.js)'s
magnetometer:

```
// get a zero reading when code is uploaded
var zero = Puck.mag();

// handle data as it's received from the magnetometer
Puck.on('mag', function(xyz) {
  // work out strength by subtracting our zero reading and getting the magnitude
  var strength = new Vec3(xyz).sub(zero).mag();
  console.log(strength);  
});
Puck.magOn();
```

**Note:** The value returned from `Puck.mag()` is not itself a `Vec3`, but
any object with `x`, `y` and `z` fields can be used as an argument to a `Vec3`
method that expects another vector.

Reference
----------

* APPEND_JSDOC: Vec3.js

Using
-----

* APPEND_USES: Vec3
