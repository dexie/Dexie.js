#!/bin/bash -e
echo "Installing dependencies for dexie-observable"
pnpm install >/dev/null
pnpm run build
pnpm run test:integration
