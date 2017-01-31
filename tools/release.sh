#!/bin/bash -e

export NODE_ENV=release

if ! [ -e tools/release.sh ]; then
  echo >&2 "Please run tools/release.sh from the repo root"
  exit 1
fi

update_version() {
  echo "$(node -p "p=require('./${1}');p.version='${2}';JSON.stringify(p,null,2)")" > $1
  echo "Updated ${1} version to ${2}"
}

validate_semver() {
  if ! [[ $1 =~ ^[0-9]\.[0-9]+\.[0-9](-.+)? ]]; then
    echo >&2 "Version $1 is not valid! It must be a valid semver string like 1.0.2 or 2.3.0-beta.1"
    exit 1
  fi
}

current_version=$(node -p "require('./package').version")

# Adapt to master branch name (master or master-1, master-2 etc)
master_branch="$(git symbolic-ref HEAD)"
master_branch=${master_branch##refs/heads/}
echo "Master branch is: '$master_branch'"
if ! [[ $master_branch =~ ^master ]]; then
    echo >&2 "Error: Must be on a branch prefixed 'master'";
    exit 1;
fi
master_suffix="${master_branch##master}"


# Next version?
printf "Next version (current is $current_version)? "
read next_version
validate_semver $next_version

if echo "$next_version" | grep -q "-"; then
	NPMTAG="next$master_suffix"
else
	NPMTAG="latest$master_suffix"
fi

echo "Will use: npm publish --tag $NPMTAG"

next_ref="v$next_version"

# Auto-publish addons?
ADDONS_DIR="addons/"
# Use an array to make sure that Observable is built before Syncable
addons=("Dexie.Observable" "Dexie.Syncable")

autoPublishAddons=false
# build addons
for addon in "${addons[@]}"
do
    dir="${ADDONS_DIR}${addon}"
    cd ${dir}
    addonNpmName=$(node -p "require('./package').name")
    addonPublishedVersion=$(npm show $addonNpmName version)
    addonLocalVersion=$(node -p "require('./package').version")
    if ! [ "${addonPublishedVersion}" = "${addonLocalVersion}" ]; then
      printf "$addonNpmName version ($addonLocalVersion) differs from its published version ($addonPublishedVersion)\n"
      autoPublishAddons=true
    fi
    cd -
done

if [ "${autoPublishAddons}" = "true" ]; then
  printf "Do you want to publish these addons if all tests pass (Y/n)? ";
  read autoPublishAddons
fi

if [ "${autoPublishAddons}" = "Y" ]; then
  echo "Will publish updated addons to npm if tests pass."
else
  echo "Will not publish any addons."
fi

update_version 'package.json' $next_version
update_version 'bower.json' $next_version

# Commit package.json change
git commit package.json bower.json --allow-empty -m "Releasing v$next_version" 2>/dev/null
# Save this SHA to cherry pick later
master_release_commit=$(git rev-parse HEAD)

#
# Merge last release output here before rebuilding
#
git merge --no-edit -s ours origin/releases$master_suffix

#
# Rebuild
#

# clean
rm -rf tools/tmp
rm -rf dist/*
rm -rf addons/*/tools/tmp
rm -rf addons/*/dist/*

# build
npm run build

# test
printf "Testing on browserstack\n"
npm run test

printf "Browserstack tests for Dexie.js passed.\n"

#
# Addons
#

# Build, test and eventually release addons
for addon in "${addons[@]}"
do
    dir="${ADDONS_DIR}${addon}"
    cd ${dir}

    addonNpmName=$(node -p "require('./package').name")
    addonPublishedVersion=$(npm show $addonNpmName version)
    addonLocalVersion=$(node -p "require('./package').version")

    printf "Installing dependencies for ${addonNpmName}"
    npm install

    printf "Building and testing ${addon} on browserstack\n"

    npm run test

    printf "${addon} Browserstack tests passed.\n"
    
    if [ "${autoPublishAddons}" = "Y" ]; then
      if ! [ "${addonPublishedVersion}" = "${addonLocalVersion}" ]; then
        printf "Publishing ${addonNpmName} ${addonLocalVersion} on npm\n"
        #echo "Would now invoke npm publish from $(pwd)!"
        npm publish
      fi
    fi
    cd -
done

# Force adding/removing dist files
git add -A --no-ignore-removal -f dist/ 2>/dev/null
git add -A --no-ignore-removal -f addons/*/dist/ 2>/dev/null
git add -A --no-ignore-removal -f test/bundle.js 2>/dev/null

# Commit all changes (still locally)
git commit -am "Build output" 2>/dev/null
# Tag the release
git tag -f -a -m "$next_ref" $next_ref
# Now, push the changes to the releases branch
#echo "Would now git push to releases"
git push origin master$master_suffix:releases$master_suffix --follow-tags

printf "Successful push to master$master_suffix:releases$master_suffix\n\n"

#echo "Would now invoke npm publish --tag $NPMTAG from $(pwd)"
npm publish --tag $NPMTAG

printf "Successful publish to npm.\n\n"

# Push the update of package.json to master
printf "Pushing Release-commit to master$master_suffix (with updated version in package.json)\n"
#echo "Would now git push new package.json to master"
git push origin $master_release_commit:master$master_suffix

printf "Resetting to origin/master$master_suffix\n"
#echo "Would now git reset --hard"
git reset --hard origin/master$master_suffix

printf "Done."
