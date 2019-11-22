#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
cd `dirname $0`
DIR=`pwd`
WEBSITE="$HOME/workspace/espruinowebsite"

MODULEDIR=$WEBSITE/www/modules
mkdir -p $MODULEDIR

# Minify all modules
MODULES=`find devices modules boards -name "*.js"`

for module in $MODULES; do
 if [ -f $module ]; then
  echo ">>>>" $module                                                 # e.g. <module-path>/DS18B20.js

  BNAME=`basename $module .js`                                        # e.g. 'DS18B20'
  MINJS=${BNAME}.min.js                                               # e.g. 'DS18B20.min.js'

  # An optional externs-file must be in the same directory as the module file.
  # Example devices/.../DS18B20.js → devices/.../DS18B20.externs
  externsFile="`dirname $module`/`basename -s .js $module`.externs"    # e.g. <module-path>/DS18B20.externs
  TARGET_MODULE="$MODULEDIR/$BNAME.js"                                # e.g. ~/workspace/espruinowebsite/www/modules/DS18B20.js

  # do nothing if ..
  #  .. the module code haven't changed and
  #  .. the target module file is newer than an existing externs file (or the externs file does not exist)

  if (diff $module $MODULEDIR/$BNAME.js >/dev/null 2>&1) && [[ (! -e $externsFile) || ($TARGET_MODULE -nt $externsFile) ]]; then
    echo "Module $BNAME hasn't changed, leaving"
    continue
  fi

  echo "Module $BNAME is different or doesn't exist"

  rm -f $MODULEDIR/$MINJS
  cp $module $MODULEDIR/$BNAME.js

  echo min $MODULEDIR/$module to $MINJS
  node bin/minify.js "$MODULEDIR/$BNAME.js" "$MODULEDIR/$MINJS" "$externsFile"

  if [[ -s $MODULEDIR/$MINJS ]] ; then
    echo "$MODULEDIR/$MINJS compile successful"
  else
    rm $MODULEDIR/$BNAME.js
    echo "$module compile FAILED."
    exit 1
  fi
 fi
done
