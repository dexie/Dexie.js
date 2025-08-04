#!/bin/bash -e
cd ../..
pnpm install
pnpm build
cd libs/dexie-cloud-common
pnpm install
pnpm build
cd ../../addons/y-dexie
pnpm install
pnpm build
cd ../../addons/dexie-cloud
pnpm install
pnpm build
echo "All built. To publish, run 'pnpm publish [--tag test|next]'"