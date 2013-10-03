#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
cd `dirname $0`
mkdir -p html/refimages
rm -f html/*.html
rm -f html/*.js
rm -f html/refimages/*
node bin/build.js

WEBSITE=~/workspace/espruinowebsite
cp html/*.html $WEBSITE/reference/
cp html/keywords.js $WEBSITE/www/js
cp datasheets/* $WEBSITE/www/datasheets
mkdir $WEBSITE/www/refimages
cp html/refimages/* $WEBSITE/www/refimages
