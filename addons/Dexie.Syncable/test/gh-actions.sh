#!/bin/bash -e
cd ../../Dexie.Observable
echo "Installing dependencies for dexie-observable"
pnpm install >/dev/null
echo "Building dexie-observable"
pnpm run build
cd -
echo "Installing dependencies for dexie-syncable"
pnpm install >/dev/null
echo "Building dexie-syncable"
pnpm run build

pnpm run test:typings
pnpm run test:unit
pnpm run test:integration
