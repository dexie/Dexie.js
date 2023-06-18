#!/bin/bash -e
echo "Installing dependencies for dexie-observable"
pnpm install >/dev/null
pnpm run build
pnpm run test:typings
pnpm run test:unit
pnpm run test:integration
