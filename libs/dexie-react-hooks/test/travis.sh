#!/bin/bash -e
echo "Installing dependencies for dexie-react-hooks"
npm install >/dev/null
echo "Building and running the tests"
npm run test

