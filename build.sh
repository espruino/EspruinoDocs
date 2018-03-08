#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.
cd `dirname $0`
DIR=`pwd`
WEBSITE=~/workspace/espruinowebsite
mkdir -p $WEBSITE $WEBSITE/www/img $WEBSITE/www/scripts
mkdir -p html/refimages
mkdir -p html/boards
rm -f html/*.html
rm -f html/*.js
rm -f html/refimages/*
rm -f html/boards/*

nodejs bin/commenter.js

cd ../Espruino
python scripts/build_board_docs.py PICO_R1_3 pinout
mv boards/PICO_R1_3.html $DIR/html/boards
cp boards/img/PICO_R1_3.png $WEBSITE/www/img

python scripts/build_board_docs.py ESPRUINOBOARD pinout
mv boards/ESPRUINOBOARD.html $DIR/html/boards
cp boards/img/ESPRUINOBOARD.png $WEBSITE/www/img

python scripts/build_board_docs.py ESP8266_BOARD pinout
mv boards/ESP8266_BOARD.html $DIR/html/boards
cp boards/img/ESP8266_BOARD.png $WEBSITE/www/img

python scripts/build_board_docs.py EMW3165 pinout
mv boards/EMW3165.html $DIR/html/boards
cp boards/img/EMW3165.png $WEBSITE/www/img

python scripts/build_board_docs.py MICROBIT pinout
mv boards/MICROBIT.html $DIR/html/boards
cp boards/img/ESPRUINOWIFI.png $WEBSITE/www/img

python scripts/build_board_docs.py ESPRUINOWIFI pinout
mv boards/ESPRUINOWIFI.html $DIR/html/boards
cp boards/img/ESPRUINOWIFI.png $WEBSITE/www/img

python scripts/build_board_docs.py PUCKJS pinout
mv boards/PUCKJS.html $DIR/html/boards
cp boards/img/PUCKJS_.jpg $WEBSITE/www/img

python scripts/build_board_docs.py PUCKJS pinout
mv boards/PUCKJS.html $DIR/html/boards
cp boards/img/PUCKJS_.jpg $WEBSITE/www/img

python scripts/build_board_docs.py ESP32 pinout
mv boards/ESP32.html $DIR/html/boards
cp boards/img/ESP32.jpg $WEBSITE/www/img

python scripts/build_board_docs.py WIO_LTE pinout
mv boards/WIO_LTE.html $DIR/html/boards
cp boards/img/WIO_LTE.jpg $WEBSITE/www/img

python scripts/build_board_docs.py MDBT42Q pinout
mv boards/MDBT42Q.html $DIR/html/boards
cp boards/img/MDBT42Q.jpg $WEBSITE/www/img

python scripts/build_board_docs.py THINGY52 pinout
mv boards/THINGY52.html $DIR/html/boards
cp boards/img/THINGY52.jpg $WEBSITE/www/img

python scripts/build_board_docs.py NRF52832DK pinout
mv boards/NRF52832DK.html $DIR/html/boards
cp boards/img/NRF52832DK.jpg $WEBSITE/www/img

python scripts/build_board_docs.py STM32L496GDISCOVERY pinout
mv boards/STM32L496GDISCOVERY.html $DIR/html/boards
cp boards/img/STM32L496GDISCOVERY.jpg $WEBSITE/www/img

cd $DIR

# Built reference docs and references.json
nodejs bin/build.js || exit 1

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
