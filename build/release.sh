#!/bin/bash -e

if ! [ -e build/release.sh ]; then
  echo >&2 "Please run build/release.sh from the repo root"
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

# clean
rm -rf build/tmp
# build
npm run build
# test
npm test

current_version=$(node -p "require('./package').version")

# Next version?
printf "Next version (current is $current_version)? "
read next_version

validate_semver $next_version

next_ref="v$next_version"

update_version 'package.json' $next_version

# Force adding dist files
git add -f dist/\*.js
git add -f dist/\*.map
git add -f dist/\*.ts

git commit -am "Releasing v$next_version"

git tag $next_ref
git tag latest -f

printf "#git push origin master"
printf "#git push origin $next_ref"
printf "#git push origin latest -f"

printf "#npm publish"

# Remove dist files from git
git rm --cached dist/\*.js
git rm --cached dist/\*.map
git rm --cached dist/\*.ts
git commit --allow-empty -am "Post-publish: remove dist files. Just had them temporarly  in the release tag for the sake of bower."
printf "#git push origin master"
