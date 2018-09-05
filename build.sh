#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission.
cd `dirname $0`
BUILDARGS=$1

DIR=`pwd`
WEBSITE=~/workspace/espruinowebsite
mkdir -p $WEBSITE $WEBSITE/www/img $WEBSITE/www/scripts
mkdir -p html/refimages
mkdir -p html/boards
mkdir -p html/img
rm -f html/*.html
rm -f html/*.js
rm -f html/refimages/*
rm -f html/boards/*

nodejs bin/commenter.js

cd ../Espruino

for BOARDNAME in PICO_R1_3 ESPRUINOBOARD ESP8266_BOARD EMW3165 MICROBIT ESPRUINOWIFI PUCKJS PIXLJS ESP32 WIO_LTE MDBT42Q THINGY52 NRF52832DK STM32L496GDISCOVERY RAK8211 RAK8212
do
  python scripts/build_board_docs.py $BOARDNAME pinout
  mv boards/$BOARDNAME.html $DIR/html/boards
  cp boards/img/$BOARDNAME.* $WEBSITE/www/img
  cp boards/img/$BOARDNAME.* $DIR/html/img
done

cd $DIR

echo "Geting file modification times..."
git ls-tree -r --name-only HEAD | xargs -I{} git log -1 --format="%at {}" -- {} | sort > ordering.txt
# Built reference docs and references.json
nodejs bin/build.js $BUILDARGS || exit 1

#rm $WEBSITE/reference/*
cp html/*.html $WEBSITE/reference/
cp html/keywords.js $WEBSITE/www/js
cp datasheets/* $WEBSITE/www/datasheets
cp files/* $WEBSITE/www/files
mkdir -p $WEBSITE/www/refimages
rm $WEBSITE/www/refimages/*
cp html/refimages/* $WEBSITE/www/refimages
# Resize any images that might be too big, and remove metadata
#mogrify -resize "600x800>" -strip $WEBSITE/www/refimages/*

# -----------------------------------
bash buildmodules.sh
