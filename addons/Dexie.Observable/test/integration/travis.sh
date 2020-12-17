#!/bin/bash -e
echo "Installing dependencies for dexie-observable"
npm install >/dev/null
npm run build
npm run test:integration
