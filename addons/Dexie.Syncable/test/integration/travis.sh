#!/bin/bash -e
cd ../../../Dexie.Observable
echo "Installing dependencies for dexie-observable"
npm install >/dev/null
echo "Building dexie-observable"
npm run build
cd -
echo "Installing dependencies for dexie-syncable"
npm install >/dev/null
echo "Building dexie-syncable"
npm run build

npm run test:integration
