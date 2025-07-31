#!/bin/bash -e
echo "Installing dependencies for y-dexie"
pnpm install >/dev/null
pnpm run build
pnpm run test:ltcloud
