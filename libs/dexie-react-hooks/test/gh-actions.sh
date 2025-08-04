#!/bin/bash -e
echo "Installing dependencies for dexie-react-hooks"
# Build y-dexie first as it is a devDependency for dexie-react-hooks
cd ../../../addons/y-dexie
pnpm install >/dev/null
pnpm run build
cd -
pnpm install >/dev/null
echo "Building and running the tests"
pnpm test:ltcloud

