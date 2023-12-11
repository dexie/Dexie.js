#!/bin/bash -e
echo "Installing dependencies for dexie-export-import"
pnpm install >/dev/null
pnpm run build
# This test fails sporadically on Safari 12. Needs to retry it if it fails.
n=1
until [ $n -ge 4 ]
do
  echo "Retry $n of 3"
  pnpm test:ltcloud && exit 0
  n=$[$n+1]
done
exit 1
