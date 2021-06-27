#!/bin/bash -e
if [ ! -f "./dexie-cloud.json" ]; then
    echo "dexie-cloud.json is missing."
    echo "You must run: "
    echo "  npx dexie-cloud create"
    echo "or: "
    echo "  nxp dexie-cloud connect <DB-URL>"
    echo "Then retry this script!"
    exit 1;
fi
echo "Adding demo users to your application..."
npx dexie-cloud import src/data/importfile.json
DB_URL=$(node -p "require('./dexie-cloud.json').dbUrl")
echo ""
echo "Configuring .env.local: REACT_APP_DBURL=$DB_URL"
echo "REACT_APP_DBURL=$DB_URL" > .env.local
echo ""
echo "Application is now configured!"
echo "Use 'yarn install' if you haven't done so already."
echo "Use 'yarn start' to start the app."
