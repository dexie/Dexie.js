#!/bin/bash -e
#cp -r
cd tmp
rm -rf ../dist/typings
mkdir ../dist/typings
for file in `find . -mindepth 1`
do
  if [ -d "${file}" ]; then
    mkdir -p ../dist/typings/${file##./}
  elif [[ $file =~ \.d\.ts$ ]]; then
    cp ${file##./} ../dist/typings/${file##./}
  fi
done
