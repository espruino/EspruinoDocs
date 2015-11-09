#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
cd `dirname $0`
DIR=`pwd`
WEBSITE=~/workspace/espruinowebsite
mkdir -p html/refimages
mkdir -p html/boards
rm -f html/*.html
rm -f html/*.js
rm -f html/refimages/*
rm -f html/boards/*

cd ../Espruino
python scripts/build_board_docs.py PICO_R1_3 pinout
mv boards/PICO_R1_3.html $DIR/html/boards
python scripts/build_board_docs.py ESPRUINOBOARD pinout
mv boards/ESPRUINOBOARD.html $DIR/html/boards
python scripts/build_board_docs.py ESP8266_BOARD pinout
mv boards/ESP8266_BOARD.html $DIR/html/boards
python scripts/build_board_docs.py EMW3165 pinout
mv boards/EMW3165.html $DIR/html/boards
cd $DIR

# Built reference docs and references.json
node bin/build.js || exit 1

#rm $WEBSITE/reference/*
cp html/*.html $WEBSITE/reference/
cp html/keywords.js $WEBSITE/www/js
cp datasheets/* $WEBSITE/www/datasheets
cp files/* $WEBSITE/www/files
mkdir -p $WEBSITE/www/refimages
rm $WEBSITE/www/refimages/*
cp html/refimages/* $WEBSITE/www/refimages
# Resize any images that might be too big, and remove metadata
mogrify -resize "600x800>" -strip $WEBSITE/www/refimages/*

# -----------------------------------
bash buildmodules.sh
