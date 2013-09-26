<!--- Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. -->
EspruinoDocs
============

Espruino Documentation and Code

This is basically [GitHub Markdown](https://help.github.com/articles/github-flavored-markdown) but it goes through a script which looks for the following (on the start of a line).

    * KEYWORDS: Comma,Separated,List ; Defines keywords for this file
    * APPEND_KEYWORD: Keyword        ; Append a list of pages that match the keyword

There are a few extra bits too:
* ```[[My Page]]``` links to a wiki page
* ```[[#Math.random]]``` links to that page in the Espruino code reference

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
