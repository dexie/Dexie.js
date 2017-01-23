#!/bin/bash -e
npm run test:typings
npm run build test
node_modules/.bin/karma start test/karma.travis.conf.js --single-run
