<!--- Copyright (c) 2020 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Code Style
============

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Code+Style. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Code Style,Code,Formatting,Indent,Spacing,K&R,1TBS

Throughout Espruino we tend to use a code style very similar to the [`K&R`-like `1TBS` style](https://en.wikipedia.org/wiki/Indentation_style#Variant:_1TBS_(OTBS)),
with a relaxation on the need for braces around single-line blocks.

For example:

```JS
const MY_CONSTANT = "Hello";

function myFunction() {
  if (1==1)
    print("Ok");

  if (1==1) {
    print("Ok");
  } else {
    print(1);
    print(2);
  }
  print("one",
        "two",
        "three");
  var obj = {
    a:12,
    b:34
  };
}

class MyClass {
  test() {
  }
}

var classInstance = new MyClass();

function MyClass2() {
}
MyClass2.prototype.test = function() {
}
```

The basic rules are:

* No tabs, 2 spaces for each indent
* Open braces are on the same line as the reason for their opening
* Single lines don't need braces around them
* Constants are `ALL_CAPS`
* variables/functions start lowercase, with capitalised letters: `myLongVarName`
* Classes or Functions with prototypes start uppercase: `MyClass`

These is also the same coding style used for [the firmware's C code](https://github.com/espruino/Espruino)

Other Suggestions
-----------------

* If you need to store big blobs of data in your code, store them as Base64 Strings (you can encode with `btoa`, or the [Image](/Image+Converter), [File](/File+Converter) or [Font](/Font+Converter) Converters do this automatically) *and save your code to Flash with Pretokenisation enabled*.

When pretokenisation is enabled (in 2v21 and later), strings will be stored as raw data and only referenced (so that their contents are loaded from flash on demand). This is very fast and memory efficient.

```JS
// - Very efficient in 2v21 with pretokenisation enabled - string is referenced
// in flash and only read when needed.
// - Uses RAM in 2v20 and earlier (or without pretokenisation)
const mydata = atob("GBgCAAAAAAAAAAQA....AAAAAAAAAAAAA");
// mydata is a string

const myarray = new Uint8Array(E.toArrayBuffer(atob("SGVsbG8gd29ybGQ=")));
// 2v21+ myarray is a read-only Uint8Array that references the data in Flash memory
// pre-2v21 it's a normal Uint8Array in RAM

// doesn't use RAM until called
function getMyData() {
  return atob("GBgCAAAAAAAAAAQA....AAAAAAAAAAAAA");
}
```

* Use Typed Arrays wherever possible if you know your data will always be within bounds:

```
// uses 18 blocks of memory, slow to access
var a = new Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]);

// uses 4 blocks of memory, fast to access
// (in this case, stores numbers in range 0..255)
var a = new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])
```

* Try to use objects rather than lots of function arguments. It's more readable and extendable and the size of a function in RAM depends on how many arguments it has:

```JS
// Uses lots of RAM, hard to read
function draw(text,alignLeft,alignRight,isUpsideDown) {
   ...
}
draw("foo",true,false,true)

// Function uses less RAM, easier to read and extend
function draw(text,options) {
   ...
}
draw("foo",{
  alignLeft:true,
  alignRight:false,
  isUpsideDown:true
})
```

* Before version 2v21, if you're using big blobs of data *and saving your code to Flash* it's best to [define them in functions](/Performance#functions-in-flash) so they're only allocated when the function is called. However in 2v21 and later, when uploading code that's pretokenised strings will be stored as raw data and only referenced (so that their contents are loaded from flash on demand).


Why?
----

For much more detail, check out [the Espruino Performance page](/Performance)

### Code size

Code written this way is reasonably compact, and when executing from source [code size matters](http://www.espruino.com/Performance)

### Bracket Counting

Each time you press enter, Espruino's command-line interface counts brackets to see if the statement you've entered is complete. If it is, it'll try and execute it. For instance:

```
if (true) {
  console.log("Hello");
}
```

is a complete statement, so when you hit enter at the end it'll be executed immediately. However if you type:

```
if (true) {
  console.log("Hello");
}
else {
  console.log("Oh No!");
}
```

Then [now we have a problem](http://www.espruino.com/Troubleshooting#i-ve-pasted-code-into-the-left-hand-side-of-the-web-ide-and-it-doesn-t-work). Halfway through, Espruino sees that the first `if` statement is complete and executes, and it's now given a line that starts `else {` that isn't a valid statement.

The easiest way to fix this is to write code in the style above:

```
if (true) {
  console.log("Hello");
} else {
  console.log("Oh No!");
}
```

The IDE is smart enough that if you write code in some other way **on the right-hand side of the IDE** it'll
replace all the newlines with a special newline (`Alt-Enter`) that doesn't cause execution. However it's a
good idea to write code in a style that would allow you to copy and paste it to the left hand side of
the IDE if needed.
