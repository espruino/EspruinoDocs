<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
EspruinoDocs
============

Espruino Documentation and Code

This is basically [GitHub Markdown](https://help.github.com/articles/github-flavored-markdown) but it goes through a script which looks for the following (on the start of a line):

    * KEYWORDS: Comma,Separated,List ; Defines keywords for this file
    * APPEND_KEYWORD: Keyword        ; Append a list of pages that match the keyword
    * USES: Comma,Separated,List  ; Defines parts that are used by the given tutorial
    * APPEND_USES: part              ; Append a list of pages that have this part in their USES_PARTS list
    * APPEND_JSDOC: filename         ; Append JavaScript documentation based on the JS in the given file

It also looks for a title (second line, after copyright notices) which it uses to create the title of the HTML page (and of links to it).

There are a few extra bits too:
* ```[[My Page]]``` links to a page on the Espruino website
* ```[[http://youtu.be/VIDEOID]]``` puts a video on the page
* ```![Image Title](foo.png)``` Adds an image. Images should be in a directory named after the filename of the file referencing them (or the same directory as the file referencing them)

It then converts the markdown to HTML and shoves it on the Espruino website. lovely.

Building
-------

You just need node.js... For Linux (Debian/Ubuntu) you can do this with:

```
# Get newer node.js - you'll only need this on earlier Linux versions
$ sudo apt-add-repository ppa:richarvey/nodejs 
$ sudo apt-get update

# Install node
$ sudo apt-get install npm nodejs
```
# Set Maximum Open Files
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

# Install Required Modules

For OSX, go to [http://nodejs.org/](http://nodejs.org/) and click "Install".

Finally you need to install a node module for highlighting:

```
$ npm install marked highlight.js acorn express --save
```

You can then run it with:

```
$ node bin/build.js
```

and the output will be placed in the `html` directory...


## Run the Website Locally

You can load a dev version of the website locally.  It will not look exactly like the production site but you can test your build and links.

```
$ node app.js
```

Then load up a page in a browser: [http://localhost:3040/EspruinoBoard](http://localhost:3040/EspruinoBoard)

