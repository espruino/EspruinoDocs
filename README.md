<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
EspruinoDocs
============

Espruino Documentation and Code

This is basically [GitHub Markdown](https://help.github.com/articles/github-flavored-markdown) but it goes through a script which looks for the following (on the start of a line):

    * KEYWORDS: Comma,Separated,List ; Defines keywords for this file
    * APPEND_KEYWORD: Keyword        ; Append a list of pages that match the keyword
    * USES: Comma,Separated,List  ; Defines parts that are used by the given tutorial
    * APPEND_USES: part              ; Append a list of pages that have this part in their USES_PARTS list

It also looks for a title (second line, after copyright notices) which it uses to create the title of the HTML page (and of links to it).

There are a few extra bits too:
* ```[[My Page]]``` links to a page on the Espruino website
* ```[[http://youtu.be/VIDEOID]]``` puts a video on the page
* ```![Image Title](foo.png)``` Adds an image. Images should be in a directory named after the filename of the file referencing them

It then converts the markdown to HTML and shoves it on the Espruino website. lovely.

Building
-------

```
sudo apt-add-repository ppa:richarvey/nodejs
sudo apt-get update

sudo apt-get install npm nodejs
#npm install marked pygmentize-bundled --save
npm install marked highlight.js --save
```

