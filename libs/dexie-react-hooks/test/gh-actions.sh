#!/bin/bash -e
echo "Installing dependencies for dexie-react-hooks"
pnpm install >/dev/null
# Build y-dexie first as it is a devDependency for dexie-react-hooks
cd ../addons/y-dexie
pnpm install >/dev/null
pnpm run build
cd -
echo "Building and running the tests"
pnpm test:ltcloud

