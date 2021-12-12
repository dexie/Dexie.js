# Dexie Cloud ToDo app

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# How to use the sample

If you just want to see the app in action, navigate to the [pre-built published version](https://dexie.github.io/Dexie.js/dexie-cloud-todo-app/). Currently it is bugging out on Safari so please use any other browser if possible. Safari crashed from our service worker. *Next version will workaround this so that it will work well on iOS and Safari (by avoiding to do sync from the service worker and instead do it from the main thread).*

If you want to build and play with it locally, follow these steps:

1. `npm install --global yarn` (if yarn not already installed)
2. `npx dexie-cloud create`
3. `yarn install`
4. `./configure-app.sh`
5. `yarn start`

The steps above will:

1. Install yarn (if you haven't already)
2. Create a new database in the cloud *(Currently only for beta testers. You can apply for the waitlist if you're not in it already. See [Dexie Cloud page](https://dexie.org/cloud/))*.
3. Install dependencies
4. Import demo-users to your database and create a .env file that connects the ToDo app to your database.
5. Build and start the application in local dev-mode (without a service worker).

# Activating Service Worker

Service worker is automatically disabled in dev-mode (the default for create-react-app). To enable it, the easiest way is to deploy the app:

1. Fork Dexie.js (if you haven't already)
2. Follow the instructions for using the app (see earlier in this README)
3. `yarn deploy` (will publish the app to your gh-pages branch of the Dexie.js fork)
4. Voila: Go to https://your-github-username.github.io/Dexie.js/dexie-cloud-todo-app/ from your browser. This is a full installable PWA that you can add to your start screen on a mobile phone.

You can also [follow these instructions from create-react-app](https://create-react-app.dev/docs/making-a-progressive-web-app/#offline-first-considerations) to enable service worker in dev mode.

Dexie Cloud works both with and without a service worker but there are some benefits of activating the service worker:

* Your app becomes a real installable PWA that people can add to their start screen on mobile or desktop on a laptop.
* If you do a change while being offline and close the app. It will be synced once you get online, no matter if you're still in the app or not.
* If your PWA is installed via Chrome (or any browser that supports the periodicSync event), the app will periodically sync with the server also when you aren't using it, making sure that next time the app is started, it already has the fresh data from server.

# Disabling Service Worker

To disable Dexie Cloud from using its service worker (for syncing data):
* Remove `tryUseServiceWorker: true` from `db.cloud.configure()` in [db.ts](https://github.com/dfahlander/Dexie.js/blob/master/samples/dexie-cloud-todo-app/src/models/db.ts)

To disable the application from using service worker (for caching resources):
* Change `serviceWorkerRegistration.register();` to `serviceWorkerRegistration.unregister();` in [index.tsx](https://github.com/dfahlander/Dexie.js/blob/master/samples/dexie-cloud-todo-app/src/index.tsx)

## Available Scripts

In the project directory, you can run:

### `./configure-app.sh`

Configure this app to use your created database.
This command will create the file .env.local and configure it against the DB URL in dexie-cloud.json.
You can equally well set the environment variable REACT_APP_DBURL manually to the URL of your
Dexie Cloud database.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn deploy`

Deploys the built app to gh-pages branch of this github repository under the folder /dexie-cloud-todo-app/.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

To learn about Dexie Cloud, check out the [Dexie Cloud documentation](https://dexie.org/cloud/).
