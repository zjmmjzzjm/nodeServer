#!/bin/bash
export IDE_WRAPPER="`readlink -f "$0"`"
HERE="`dirname "$IDE_WRAPPER"`"
export PATH=$HERE:$PATH
cd $HERE && node ide_service.js
