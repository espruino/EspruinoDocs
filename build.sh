#!/bin/bash
# Copyright (c) 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. 
cd `dirname $0`
rm html/*.html
node bin/build.js
