#!/bin/bash -e
if [ ! -f "./dexie-cloud.json" ]; then
    echo "Please run:"
    echo "  npx dexie-cloud create"
    echo "or: "
    echo "  npx dexie-cloud connect <DB-URL>"
    echo "...to create a database in the cloud"
    echo "Then retry this script!"
    exit 1;
fi
echo "Adding demo users to your application..."
npx dexie-cloud import src/data/importfile.json
echo "Whitelisting origin: http://localhost:3000"
npx dexie-cloud whitelist http://localhost:3000
DB_URL=$(node -p "require('./dexie-cloud.json').dbUrl")
echo ""
echo "Configuring .env.local: VITE_DBURL=$DB_URL"
echo "VITE_DBURL=$DB_URL" > .env.local
echo ""
echo "Application is now configured!"
echo "Use 'npm install' if you haven't done so already."
echo "Use 'npm run dev' or 'npm start' to start the app."
