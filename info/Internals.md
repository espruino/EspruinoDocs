<!--- Copyright (c) 2014 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Espruino Interpreter Internals
===========================

* KEYWORDS: Espruino,Hacking,Internals,Contributing,Implementation

Please see the [[Performance]] section first for a rough overview, and for the practical implications of the implementation.


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

Variables are usually stored in fixed-size 20 byte blocks. In small devices this can get down to 15 (8 bit addresses) and on PCs it's 30 (32 bit addresses). 

This has several implications:

* Free variables are stored in a linked list, so memory allocation and deallocation is `O(1)`
* Garbage collection passes are **fast**
* Memory fragmentation is not a problem
* Malloc would generally have a 4 byte allocation overhead for each memory block - we can do without this.

Each block has optional links to children and siblings, which allows a tree structure to be built. However in many cases these references aren't needed and are used to store extra String Data if it is required. This allows variable names of up to 12 characters to be stored without having to allocate extra variable blocks.


| Bytes | Type         | Normal | Variable Name | String Data |
|--|--|--|--|--|
| 2 | Flags + Lock Count | F | F | F | 
| 8 | Value              | V | V | V | 
| 2 | Next Sibling       | R | V | V | 
| 2 | Previous Sibling   | R | V | V | 
| 2 | Reference Count    | C | C | V | 
| 2 | First Child        | R | R (variable ref) | V | 
| 2 | Last Child         | R | R (string data) | R (string data) | 

...

| Key | Meaning |
|--|--|
| F | Flags |
| V | Value Data |
| R | Reference to another var |
| C | Reference Count |



