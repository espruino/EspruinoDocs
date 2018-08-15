<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
# Espruino Documentation and Code

------------------------------------------------------------

**PLEASE VIEW THIS DOCUMENTATION ON [WWW.ESPRUINO.COM](http://espruino.com) - you can even [Search](http://espruino.com/Search).** The markdown files in this repository are designed to be parsed by a build script - by viewing them on GitHub you may be missing useful links or information.

------------------------------------------------------------

This project generates the website and tutorial code for [Espruino.com](http://espruino.com). This also contains the modules that can be required by the [Espruino  Web IDE](http://www.espruino.com/Web+IDE). You can contribute to the site and modules in this project.

* Find out how to [create modules here](http://www.espruino.com/Writing+Modules)
* Find out how to [create tutorials here](http://www.espruino.com/Writing+Tutorials)

------------------------------------------------------------

Documentation files are written [GitHub Markdown](https://help.github.com/articles/github-flavored-markdown) with additional metadata. Basically, a script that looks for the following (on the start of a line):

    * KEYWORDS: Comma,Separated,List ; Defines keywords for this file
    * APPEND_KEYWORD: Keyword        ; Append a list of pages that match the keyword
    * USES: Comma,Separated,List  ; Defines parts that are used by the given tutorial
    * APPEND_USES: part              ; Append a list of pages that have this part in their USES_PARTS list
    * APPEND_JSDOC: filename         ; Append JavaScript documentation based on the JS in the given file
    * APPEND_PINOUT: boardname       ; Append Pinout for the given board
    * BUYFROM: normalprice,bulkprice,link1,link2  ; Append a floating 'buy from' window
    * APPEND_TOC                     ; Append a table of contents made from H1/H2/H3

It also looks for a title (second line, after copyright notices) which it uses to create the title of the HTML page (and of links to it).

There are a few extra bits too:

* ```[[My Page]]``` links to a page on the Espruino website
* ```[[http://youtu.be/VIDEOID]]``` puts a video on the page
* ```![Image Title](MyFilename/foo.png)``` Adds an image. Images should be in a directory named after the filename of the file referencing them (or the same directory as the file referencing them)

It then converts the Markdown to HTML and shoves it on the Espruino website. Lovely!

## JavaScript

Any `.js` files in `examples` have a webpage created that uses the comments as markdown, and then adds the code as a code block right at the end.

All other `.js` files are treated as modules. They are minified using Google's online closure compiler and the SIMPLE_OPTIMISATIONS flag. To get advanced optimisations, you must add the exact text `@compilation_level ADVANCED_OPTIMIZATIONS` into the comments at the head of the file.

## Common keywords

Common keywords for USES/APPEND_USES are:

```
// Boards
Espruino Board
EspruinoWiFi
Pico
Puck.js
Pixl.js
MDBT42Q
MicroBit
Thingy52

// Other things
Internet       An internet connection
Graphics       Graphics Library
Waveform       Waveform Library
AT             AT Command library
Speaker
PWM
Infrared
ESP8266        ESP8266 attached to an Espruino
BLE            Bluetooth LE (eg via Puck.js) but may need board-specific hardware
Only BLE       Bluetooth LE (eg via Puck.js) but applicable to anything
Web Bluetooth
```

Common keywords for KEYWORDS/APPEND_KEYWORDS are:

```
Espruino
Official Board
PCB
Pinout                 Page contains pinout info
```

## Build Requirements

### Step 1: Obtain Espruino Source Code

Checked out the `Espruino` source at the same same level as `EspruinoDocs` folder. Assuming you're in the `EspruinoDocs` folder...

```
$ cd ..
$ git clone git@github.com:espruino/Espruino.git`
$ cd EspruinoDocs
```


### Step 2: Install Node.js® and npm

If you have Node.js and npm installed skip this step.

If you haven't got Node.js JavaScript runtime installed or the JavaScript Package managers installed  do so via the installation guides below.

* [Windows Installation Guide](http://treehouse.github.io/installation-guides/windows/node-windows.html)
* [Mac Installation Guide](http://treehouse.github.io/installation-guides/mac/node-mac.html)
* [Linux Installation Guide](http://treehouse.github.io/installation-guides/linux/node-linux.html)



### Step 3: Install Required Node Modules

In order to generate the documentation and view it you require several JavaScript packages. To install them issue the following command:

```
$ npm install
```

This will install all JavaScript dependancies.

## Build Process

Currently they are two build scripts. One bash, one JavaScript.

The bash script does 3 things:

1. Uses the `Espruino` source code to generate the pinout diagrams. `python` is required
2. Builds the production site at `~/workspace/espruinowebsite`
3. Builds Espruino specific modules and minifies the JavaScript code

The JavaScript build process just builds the documentation in the `html` folder.

You will have to run `build.sh` at least once if you want the `build.js` to work.

### To Do a Full Build

Run:

```
$ ./build.sh
```

###  To Build Documentation Only

**Note:** You've had to have least ran the bash script once for this to build successfully.

Run:

```
$ npm run build
```

The output will be placed in the `html` directory.

## View Generated Documentation

You can load a development version of the website locally.  It will *not* look exactly like the production site but you can test your build and links.

```
$ npm start
```

Then load up a page in a browser: [http://localhost:3040/Original](http://localhost:3040/Original)

# Troubleshooting

## OS X

### Set Maximum Open Files
On OSX, most likely the default amount of open files will be set too low.  This may cause
an error during the build, like: "Error: EMFILE, too many open files 'tasks/File Converter.md'"

Make sure you have at least 1024 for the value of open files.

```
$ ulimit -n       # see current limit
```

Increase the limit:

```
$ ulimit -n 1024  # increase to 1024
```
