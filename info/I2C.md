<!--- Copyright (c) 2018 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
I2C - Inter-Integrated Circuit
==============================

<span style="color:red">:warning: **Please view the correctly rendered version of this page at https://www.espruino.com/I2C. Links, lists, videos, search, and other features will not work correctly when viewed on GitHub** :warning:</span>

* KEYWORDS: Peripheral,Peripherals,I2C,I squared C,IIC,Inter-Integrated Circuit,Built-In

[I2C Class](/Reference#I2C) in the Reference.

Hardware I2C
------------

On most boards there are hardware I2C peripherals. Check out the
pin diagram on the reference page for your board and look for
pins marked with an `I2C` tag.

You can use it as follows.

```
// set up I2C
I2C1.setup({ scl : B6, sda: B7 });

// read 6 bytes from address 0x52
var d = I2C1.readFrom(0x52, 6);

// Write a single byte (0) to address 0x52
I2C1.writeTo(0x52, 0);
```

See the reference for [I2C.setup](/Reference#l_I2C_setup) for more information on
the arguments that can be passed in.

Software I2C
------------

If you don't have access to your board's pins, you can also emulate
I2C in software:

```
// set up I2C
var i2c = new I2C();
i2c.setup({ scl : B6, sda: B7 });

// read 6 bytes from address 0x52
var d = i2c.readFrom(0x52, 6);

// Write a single byte (0) to address 0x52
i2c.writeTo(0x52, 0);
```

See the reference for [I2C.setup](/Reference#l_I2C_setup) for more information on
the arguments that can be passed in.

Speed (bit rate)
----------------

Pretty much all I2C devices are guaranteed to support 100kBits/sec transfer
speed for I2C, so that is the default in Espruino. However you can specify
higher speeds with `bitrate` in [I2C.setup](/Reference#l_I2C_setup) if your
device supports it, eg:

```
i2c.setup({ scl : B6, sda: B7, bitrate: 400000 });
```


Using I2C
----------

* APPEND_KEYWORD: I2C
