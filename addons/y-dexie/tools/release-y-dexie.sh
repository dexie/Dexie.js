#!/bin/bash -e
cd ../..
pnpm install
pnpm build
cd ../../addons/y-dexie
pnpm install
pnpm build
echo "All built. To publish, run 'pnpm publish [--tag test|next]'"
