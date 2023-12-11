#!/bin/bash -e
pnpm install
pnpm install webpack # Need to do all the time - bug in pnpm probably.
pnpm test
