# Sample - Using Dexie.js with Browserify

This is a sample on how to use browserify to include dexie.js into your web project.

## Install
npm install

## Build
browserify scripts/main.js -o bundle.js

## Run
npm install -g http-server
http-server . -a localhost -p 8081
Surf to http://localhost:8081/app.html
