#!/bin/bash -e
echo "Installing dependencies for dexie-export-import"
npm install >/dev/null
npm run build
npm run test
