#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
cd `dirname $0`
mkdir -p html/refimages
rm -f html/*.html
rm -f html/*.js
rm -f html/refimages/*
node bin/build.js

WEBSITE=~/workspace/espruinowebsite

#rm $WEBSITE/reference/*
cp html/*.html $WEBSITE/reference/
cp html/keywords.js $WEBSITE/www/js
cp datasheets/* $WEBSITE/www/datasheets
mkdir -p $WEBSITE/www/refimages
rm $WEBSITE/www/refimages/*
cp html/refimages/* $WEBSITE/www/refimages
mkdir -p $WEBSITE/www/modules
rm $WEBSITE/www/modules/*
cp devices/*.js $WEBSITE/www/modules
