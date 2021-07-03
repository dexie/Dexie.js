#!/bin/bash -e
rm -rf dist/types
mkdir dist/types
cd tools/tmp/modern
find . -name '*.d.ts' | cpio -pdm ../../../dist/types/
