#!/bin/bash -e
echo "Installing dependencies for dexie-export-import"
npm install >/dev/null
npm run build
# This test fails sporadically on Safari 12. Needs to retry it if it fails.
n=1
until [ $n -ge 4 ]
do
  echo "Retry $n of 3"
  npm run test && exit 0
  n=$[$n+1]
done
exit 1
