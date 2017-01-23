#!/bin/bash -e
npm install
npm run test:typings
npm run build
printf "Launching karma...\n"
node_modules/.bin/karma start test/karma.travis.conf.js --single-run
