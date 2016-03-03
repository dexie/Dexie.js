# Sample - Using Dexie.js with Browserify

This is a sample on how to use browserify to include dexie.js into your web project.

## Install
npm install -g browserify
npm install dexie --save-dev

## Build
browserify scripts/main.js -o bundle.js

## Run
npm install http-server -g
http-server . -a localhost -p 8081
Surf to http://localhost:8081/app.html
