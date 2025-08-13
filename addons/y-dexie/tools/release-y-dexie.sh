#!/bin/bash -e
cd ../..
pnpm install
pnpm build
cd -
pnpm install
pnpm build
pnpm test
echo "All built. To publish, run 'pnpm publish [--tag test|next]'"
