<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
Inline Assembler
=============

* KEYWORDS: Assembler,Asm,ARM,Thumb,Thumb2,Thumb-2,C code,inline C

The new Web IDE allows you to write inline assembler in the right-hand pane.

```
var adder = E.asm("long(long)",
"movs    r2, #3",
"movs    r3, #0",
"adds    r0, r0, r2",
"adc.w   r1, r1, r3",
"bx  lr");
```

Which can then be used like a normal function:

```
>adder(2)
=5
>[1,2,3,4,5].map(adder)
=[4,5,6,7,8]
```

This is handled as follows:

* When you click `Send to Espruino` the Web IDE pulls out the `E.asm` call
* It runs the strings you supplied through [its assembler](https://github.com/espruino/EspruinoWebIDE/blob/master/js/plugins/assembler.js) (which doesn't support all the ARM's opCodes yet)
* It then creates code to load the assembler into Espruino using the `poke16` command
* It creates a call to [`E.nativeCall`](http://www.espruino.com/Reference#l_E_nativeCall) which creates a JavaScript function using the code that was generated.

**Note:** The assembler is only partially implemented so will only parse some opcodes at the moment.

Argument Specifiers / Call Signature
--------------------------------

The first argument of `E.asm` (and `E.nativeCall`) is the signature of the call, of the type:

```Text
returnType (argType1,argType2,...)
```

Allowed types are `void`, `bool`, `int`, `long`, `double`, `Pin` (a pin number), `JsVar` (a pointer to a JsVar structure).

Because of the structure of Espruino, you can only use an argument specifier that is already used by one of Espruino's built-in functions. At the moment finding a suitable specifier is a matter of trial and error.

Accessing IO
-----------

You can write to GPIO using the register addresses specified in the STM32F103 datasheet/reference (see [[EspruinoBoard]]). There's also a more readable version of the addresses in the [STM32F1 header file](https://github.com/espruino/Espruino/blob/master/targetlibs/stm32f1/lib/stm32f10x.h) - see GPIO_BASE/etc.

For instance, GPIOA's Output data register is `0x4001080C` (which sets ALL pins on that port). To set individual pins you can write to BSRR = `0x40010810` and to clear them you can write to BRR = `0x40010814`

So you could write the following code to give the 3 LEDs (on A13,A14 and A15) a quick pulse.

```
digitalWrite([LED1,LED2,LED3],0); // set up th eoutput state (easier done in JS!)

var pulse = E.asm("void()",
"ldr	r2, [pc, #8]", // 0-1
// get the data from the end a put it in r2. 
// pc has already moved on by 4, so we need to add 12-4 = 8 to it to get the address
"movw	r3, #57344", // 2-5
// the bit mask for A13,A14,A15 - 0b1110000000000000 = 57344
"str	r3, [r2, #0]", // 6-7
// set *0x40010810 = 57344 (set pins A13-A15)
"str	r3, [r2, #4]", // 8-9
// set *0x40010814 = 57344 (clear pins A13-A15)
"bx	lr", // 10-11
// Return
".word	0x40010810" // 12-5
// Our data
);

pulse();
```

Compiling C Code
--------------

While you can't directly inline C code (yet!), once you have [installed a toolchain that will compile Espruino](https://github.com/espruino/Espruino/blob/master/README.md#building), you can compile C code with:

```Bash
arm-none-eabi-gcc -mlittle-endian -mthumb -mcpu=cortex-m3  -mfix-cortex-m3-ldrd  -mthumb-interwork -mfloat-abi=soft -nostdinc -nostdlib -c test.c -o test.o
# you can also add -O3 to the command-line to optimise the code
```

And you can dump the contents of the object file with:

```Bash
arm-none-eabi-objdump -S test.o
```

You might get something like:

```
00000010 <pulse>:
  10:	4a02      	ldr	r2, [pc, #8]	; (1c <pulse+0xc>)
  12:	f44f 4360 	mov.w	r3, #57344	; 0xe000
  16:	6013      	str	r3, [r2, #0]
  18:	6053      	str	r3, [r2, #4]
  1a:	4770      	bx	lr
  1c:	40010810 	.word	0x40010810
```

Which you can then turn into:

```
var ASM_BASE=process.memory().stackEndAddress;
var ASM_BASE1=ASM_BASE+1/*thumb*/;
[0x4a02,0xf44f,0x4360,0x6013,0x6053,0x4770,0x0810,0x4001].forEach(function(v) { poke16((ASM_BASE+=2)-2,v); }); 
var pulse = E.nativeCall(ASM_BASE1, "void()")
```

If anyone has any success with the [output of TCC](http://bellard.org/tcc/) then please get in touch. I've been able to compile this to JavaScript with Emscripten, so we may be able to use it compile C code *inside the Web IDE*.
