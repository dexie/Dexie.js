#!/bin/bash -e

#
# eslint
#
printf "Running eslint Dexie src\n"
$(npm bin)/eslint src
printf "eslint ok.\n"

printf "Running eslint Dexie.Syncable src\n"
$(npm bin)/eslint --config "addons/Dexie.Syncable/src/.eslintrc.json" "addons/Dexie.Syncable/src"
printf "eslint ok.\n\n"

printf "Running eslint Dexie.Observable src\n"
$(npm bin)/eslint --config "addons/Dexie.Observable/src/.eslintrc.json" "addons/Dexie.Observable/src"
printf "eslint ok.\n\n"

#
# Build
#

printf "Building Dexie\n"
npm run build
printf "Dexie building done.\n\n"

ADDONS_DIR="addons/"
# Use an array to make sure that Observable is built before Syncable
addons=("Dexie.Observable" "Dexie.Syncable")

# build addons
for addon in "${addons[@]}"
do
    dir="${ADDONS_DIR}${addon}"
    # Copy Dexie node_modules to avoid having to install them for each addon
    cp -R 'node_modules' ${dir}
    cd ${dir}
    printf "Building ${addon}\n"
    npm run build
    printf "${addon} building done.\n\n"
    cd -
done

# test
printf "Testing Dexie\n"
$(npm bin)/karma start test/karma.travis.conf.js --single-run
printf "Dexie tests done.\n\n"

# Run tests for addons
for addon in "${addons[@]}"
do
    dir="${ADDONS_DIR}${addon}"
    cd ${dir}
    printf "Testing ${addon}\n"
    $(npm bin)/karma start test/karma.travis.conf.js --single-run
    printf "${addon} tests done.\n\n"
    cd -
done

printf "Done.\n"
