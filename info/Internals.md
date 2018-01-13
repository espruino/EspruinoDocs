<!--- Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Interpreter Internals
===========================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/Internals. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Espruino,Hacking,Internals,Contributing,Implementation

Please see the [[Performance]] section first for a rough overview, and for the practical implications of the implementation.

**Note:** There's also a [forum thread](http://forum.espruino.com/conversations/265821) with some more in-depth answers to questions about the interpreter.

Compilation
----------

Espruino's Makefile calls a few different Python scripts that precompute various things:

* Parse information on the board and chip, and create:
  * A `platform_config` file - with information about the current system (how many of each peripheral, what pin buttons + LEDs are on, etc)
  * A `pininfo` source file - listing what peripherals are on what pins
  * Board Documentation (if required)
* Parse all the `jswrap_` files (looking for JSON-formatted comments above each function), and create:
  * A `jswrapper.c` file containing a symbol table and calls to the functions that need to be executed
  * API Documentation (if required)

Parsing
------

There is no bytecode, so execution happens inside the parser in `jsparse.c`

The parser is a hand-written recursive-descent parser, and code to be executed is executed directly from variables (see below), **not** from a C-style string or flat buffer.

Variable Storage
--------------

Variables are usually stored in fixed-size 16 byte blocks. In small devices this can get down to 12 bytes (10 bit addresses) and on PCs it's 32 bytes (32 bit addresses). 

This has several implications:

* Free variables are stored in a linked list, so memory allocation and deallocation is `O(1)`
* Garbage collection passes are **fast**
* Memory fragmentation is not a problem
* Malloc would generally have a 4 byte allocation overhead for each memory block - we can do without this.

Each block has optional links to children and siblings, which allows a tree structure to be built. However in many cases these references aren't needed and can be used to store other data.

What follows are the basic variable bytes. Note that NAME_INT_INT, NAME_INT_BOOL, and NAME_STRING_INT follow the same pattern as NAME_STR/NAME_INT - they just use `child` to store a value rather than a reference:

### 16 byte JsVars 

( > 1024 variables, JsVars for 32 bit refs are similar )
 
 | Offset | Name    | STRING | STR_EXT  | NAME_STR | NAME_INT | INT  | DOUBLE  | OBJ/FUNC/ARRAY | ARRAYBUFFER |
 |--------|---------|--------|----------|----------|----------|------|---------|----------------|-------------|
 | 0 - 3  | varData | data   | data     |  data    | data     | data | data    | nativePtr      | size        |
 | 4 - 5  | next    | data   | data     |  next    | next     |  -   | data    | argTypes       | format      |
 | 6 - 7  | prev    | data   | data     |  prev    | prev     |  -   | data    | argTypes       | format      |
 | 8 - 9  | first   | data   | data     |  child   | child    |  -   |  -      | first          | stringPtr   |
 | 10-11  | refs    | refs   | data     |  refs    | refs     | refs | refs    | refs           | refs        |
 | 12-13  | last    | nextPtr| nextPtr  |  nextPtr |  -       |  -   |  -      | last           | -           |
 | 14-15  | Flags   | Flags  | Flags    |  Flags   | Flags    | Flags| Flags   | Flags          | Flags       |
 
###  12 byte JsVars 

( where < 1024 variables )

10 bit addresses are used, with the extra bits being stored in a field called `pack` and the `flags` variable
 
 | Offset | Name    | STRING | STR_EXT  | NAME_STR | NAME_INT | INT  | DOUBLE | OBJ/FUNC/ARRAY | ARRAYBUFFER |
 |--------|---------|--------|----------|----------|----------|------|--------|----------------|-------------|
 | 0 - 3  | varData | data   | data     |  data    | data     | data | data   | nativePtr      | size        |
 | 4      | next    | data   | data     |  next    | next     |  -   | data   | argTypes       | format      |
 | 5      | prev    | data   | data     |  prev    | prev     |  -   | data   | argTypes       | format      |
 | 6      | first   | data   | data     |  child   | child    |  -   | data   | first          | stringPtr   |
 | 7      | pack    | pack   | data     |  pack    | pack     | pack | data   | pack           | pack        |
 | 8      | refs    | refs   | data     |  refs    | refs     | refs | refs   | refs           | refs        |
 | 9      | last    | nextPtr| nextPtr  |  nextPtr |  -       |  -   |   -    | last           | -           |
 | 10-11  | Flags   | Flags  | Flags    |  Flags   | Flags    | Flags| Flags  | Flags          | Flags       |


