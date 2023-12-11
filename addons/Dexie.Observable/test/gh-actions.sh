#!/bin/bash -e
echo "Installing dependencies for dexie-observable"
pnpm install >/dev/null
pnpm run build
pnpm run test:typings
pnpm run test:ltcloud
pnpm run test:ltcloud:integration
