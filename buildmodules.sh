#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
cd `dirname $0`
DIR=`pwd`
WEBSITE=~/workspace/espruinowebsite

MODULEDIR=$WEBSITE/www/modules
mkdir -p $MODULEDIR

# Minify all modules
MODULES=`ls devices/*.js`
MODULES+=" "
MODULES+=`ls modules/*.js`

for module in $MODULES; do
  echo ">>>>" $module
  BNAME=`basename $module .js`
  MINJS=${BNAME}.min.js
  # if file doesn't exist, write an empty file so diff works
  if [ ! -f $MODULEDIR/$BNAME.js ]; then
    echo > $MODULEDIR/$BNAME.js
  fi

  if diff $module $MODULEDIR/$BNAME.js >/dev/null ; then
    echo "Module $BNAME hasn't changed, leaving"
  else
    echo "Module $BNAME is different or doesn't exist"  

    rm -f $MODULEDIR/$MINJS
    cp $module $MODULEDIR/$BNAME.js

    echo min $MODULEDIR/$module to $MINJS  
    node bin/minify.js $MODULEDIR/$BNAME.js $MODULEDIR/$MINJS 
 
     if [[ -s $MODULEDIR/$MINJS ]] ; then 
       echo "$MODULEDIR/$MINJS compile successful"
     else
       rm $MODULEDIR/$BNAME.js
       echo "$module compile FAILED."
       exit 1
     fi 
  fi
done
