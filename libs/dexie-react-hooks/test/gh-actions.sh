#!/bin/bash -e
echo "Installing dependencies for dexie-react-hooks"
pnpm install >/dev/null
echo "Building and running the tests"
pnpm test

