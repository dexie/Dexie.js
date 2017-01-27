#!/bin/bash -e
cd ../../../Dexie.Observable
echo "Building dexie-observable"
npm run build
cd -
echo "Building dexie-syncable"
npm run build

npm run test:integration
