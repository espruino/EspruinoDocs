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

MODULEDIR=$WEBSITE/www/modules
mkdir -p $MODULEDIR

#exit 0

# Minify all modules
for module in `ls devices/*.js`; do
  BNAME=`basename $module .js`
  MINJS=${BNAME}.min.js
  # if file doesn't exist, write an empty file so diff works
  if [ ! -f $MODULEDIR/$BNAME.js ]; then
    echo > $MODULEDIR/$BNAME.js
  fi

  if diff devices/$BNAME.js $MODULEDIR/$BNAME.js >/dev/null ; then
    echo "Module $BNAME hasn't changed, leaving"
  else
    echo "Module $BNAME is different or doesn't exist"  
    cp devices/$BNAME.js $MODULEDIR/$BNAME.js
    echo Minifying $MODULEDIR/$module to $MINJS  
    # Minify, and convert binary to a proper number
    sed "s/0b\([01][01]*\)/parseInt(\"\1\",2)/g" $module | curl -s \
      -d compilation_level=SIMPLE_OPTIMIZATIONS \
      -d output_format=text \
      -d output_info=compiled_code \
      --data-urlencode "js_code@/dev/fd/0" \
     http://closure-compiler.appspot.com/compile > $MODULEDIR/$MINJS
  
     if [[ -s $MODULEDIR/$MINJS ]] ; then 
       echo "$MODULEDIR/$MINJS compile successful"
     else
       echo "$MODULEDIR/$MINJS compile FAILED."
       exit 1
     fi 
  fi
done
