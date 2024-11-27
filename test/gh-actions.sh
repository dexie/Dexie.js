#!/bin/bash -e
pnpm run test:typings
if [ "$LAMBDATEST" == "true" ]; then
  pnpm run test:ltcloud
else
  pnpm run test:unit
fi
