#!/bin/bash -e

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
	#NPMTAG="latest$master_suffix" # Use this line as soon as Dexie v2.0.0 get the latest tag!
  NPMTAG="latest" # Replace this line with the above line as soon as Dexie v2.0.0 get 'latest' tag!
fi

echo "Will use: npm publish --tag $NPMTAG"

next_ref="v$next_version"

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
# eslint
#
printf "Running eslint src\n"
eslint src
printf "eslint ok.\n"

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
# build addons (for bower packages)
for dir in addons/*/
do
    cd ${dir}
    npm run build
    # npm test
    cd -
done

# test
printf "Testing on browserstack\n"
echo . > karma-release.log
tail -f karma-release.log &
TAIL_PID=$!
npm run test:release > karma-release.log
kill $TAIL_PID

printf "Browserstack tests passed.\n"

# Force adding/removing dist files
rm -rf dist/*.gz
git add -A --no-ignore-removal -f dist/ 2>/dev/null
git add -A --no-ignore-removal -f addons/*/dist/ 2>/dev/null
git add -A --no-ignore-removal -f test/bundle.js 2>/dev/null

# Commit all changes (still locally)
git commit -am "Build output" 2>/dev/null
# Tag the release
git tag -a -m "$next_ref" $next_ref
# Now, push the changes to the releases branch
git push origin master$master_suffix:releases$master_suffix --follow-tags

printf "Successful push to master$master_suffix:releases$master_suffix\n\n"

npm publish --tag $NPMTAG

printf "Successful publish to npm.\n\n"

# Push the update of package.json to master
printf "Pushing Release-commit to master$master_suffix (with updated version in package.json)\n"
git push origin $master_release_commit:master$master_suffix

printf "Resetting to origin/master$master_suffix\n"
git reset --hard origin/master$master_suffix

printf "Done."
