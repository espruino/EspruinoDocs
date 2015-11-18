<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
# EspruinoDocs

Espruino Documentation and Code

This project generates the website and tutorial code for [Espruino.com](http://espruino.com). This also contains the modules that can be required by the [Espruino  Web IDE](http://www.espruino.com/Web+IDE). You can contribute to the site and standardised modules in this project.

Documentation files are written [GitHub Markdown](https://help.github.com/articles/github-flavored-markdown) with additional metadata. Basically, a script that looks for the following (on the start of a line):

    * KEYWORDS: Comma,Separated,List ; Defines keywords for this file
    * APPEND_KEYWORD: Keyword        ; Append a list of pages that match the keyword
    * USES: Comma,Separated,List  ; Defines parts that are used by the given tutorial
    * APPEND_USES: part              ; Append a list of pages that have this part in their USES_PARTS list
    * APPEND_JSDOC: filename         ; Append JavaScript documentation based on the JS in the given file
    * APPEND_PINOUT: boardname       ; Append Pinout for the given board

It also looks for a title (second line, after copyright notices) which it uses to create the title of the HTML page (and of links to it).

There are a few extra bits too:

* ```[[My Page]]``` links to a page on the Espruino website
* ```[[http://youtu.be/VIDEOID]]``` puts a video on the page
* ```![Image Title](MyFilename/foo.png)``` Adds an image. Images should be in a directory named after the filename of the file referencing them (or the same directory as the file referencing them)

It then converts the Markdown to HTML and shoves it on the Espruino website. Lovely!

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

### First Time:

For the first time you can run:

```
$ ./build.sh
```

### Subsequent Times:

You can then run it with:

```
$ npm run build
```

The output will be placed in the `html` directory.

## View Generated Documentation

You can load a development version of the website locally.  It will *not* look exactly like the production site but you can test your build and links.

```
$ npm start
```

Then load up a page in a browser: [http://localhost:3040/EspruinoBoard](http://localhost:3040/EspruinoBoard)

--------

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

