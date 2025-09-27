# Dexie Cloud ToDo app

This project is built with [Vite](https://vitejs.dev/) and uses TypeScript and React.

# How to use the sample

**[You can open a deployed version of this PWA at https://dexie.github.io/Dexie.js/dexie-cloud-todo-app](https://dexie.github.io/Dexie.js/dexie-cloud-todo-app)**

*NOTE: Previous versions of the published app (before december 2021) were on an old URL and we recommend to uninstall the PWA from your device if you did save it to your home screen or desktop.*

If you just want to see the app in action, navigate to the [pre-built published version](https://dexie.github.io/Dexie.js/dexie-cloud-todo-app/).

If you want to build and play with it locally, follow these steps:

1. `npx dexie-cloud create`
2. `npm install`
3. `./configure-app.sh`
4. `npm run dev` (or `npm start`)

The steps above will:

1. Create a new database in the cloud
2. Install dependencies
3. Import demo-users to your database and create a .env.local file that connects the ToDo app to your database.
4. Build and start the application in local dev-mode with Vite's fast HMR (Hot Module Replacement).

# Activating Service Worker

Service worker is automatically enabled in production builds thanks to vite-plugin-pwa. In development mode, the service worker is disabled by default for easier debugging. To enable it in development, you can set the environment variable `SW_DEV=true`.

The easiest way to test the full PWA experience is to deploy the app:

1. `npm run build && npm run preview` (local production preview)
2. Or deploy with: `npm run deploy` (will publish the app to your gh-pages branch of your Dexie.js fork)
3. `npx dexie-cloud whitelist https://your-github-username.github.io` (replace `your-github-username`)
4. Voila: Go to https://your-github-username.github.io/Dexie.js/dexie-cloud-todo-app/ from your browser. This is a full installable PWA that you can add to your start screen on a mobile phone.

Dexie Cloud works both with and without a service worker but there are some benefits of activating the service worker:

* Your app becomes a real installable PWA that people can add to their start screen on mobile or desktop on a laptop.
* If you do a change while being offline and close the app. It will be synced once you get online, no matter if you're still in the app or not.
* If your PWA is installed via Chrome (or any browser that supports the periodicSync event), the app will periodically sync with the server also when you aren't using it, making sure that next time the app is started, it already has the fresh data from server.

# Disabling Service Worker

To disable Dexie Cloud from using its service worker (for syncing data):
* Remove `tryUseServiceWorker: true` from `db.cloud.configure()` in [src/db/TodoDB.ts](https://github.com/dfahlander/Dexie.js/blob/master/samples/dexie-cloud-todo-app/src/db/TodoDB.ts)

To disable the application from using service worker (for caching resources):
* Remove the `serviceWorkerRegistration.register();` call from [src/index.tsx](https://github.com/dfahlander/Dexie.js/blob/master/samples/dexie-cloud-todo-app/src/index.tsx)
* Or set `registerType: 'disabled'` in the VitePWA plugin configuration in `vite.config.ts`

## Available Scripts

In the project directory, you can run:

### `./configure-app.sh`

Configure this app to use your created database.
This command will create the file .env.local and configure it against the DB URL in dexie-cloud.json.
You can equally well set the environment variable VITE_DBURL manually to the URL of your
Dexie Cloud database.

### `npm run dev` or `npm start`

Runs the app in development mode using Vite.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload automatically when you make edits thanks to Vite's Hot Module Replacement (HMR).\
You will also see any lint errors in the console.

### `npm test`

Runs the test suite using Vitest.\
Tests run in watch mode by default in development.

### `npm run test:ui`

Runs the test suite with Vitest's UI interface for a better testing experience.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance using Vite.

The build is minified and includes content hashing for optimal caching.\
Your app is ready to be deployed!

### `npm run preview`

Serves the production build locally for testing.\
This allows you to test the built app before deployment, including the service worker functionality.

### `npm run deploy`

Deploys the built app to gh-pages branch of this github repository under the folder /dexie-cloud-todo-app/.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run deploy`

Deploys the built app to gh-pages branch of this github repository under the folder /dexie-cloud-todo-app/.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more about Vite in the [Vite documentation](https://vitejs.dev/).

To learn React, check out the [React documentation](https://reactjs.org/).

To learn about Dexie Cloud, check out the [Dexie Cloud documentation](https://dexie.org/cloud/docs/).

## Migration from Create React App

This project has been migrated from Create React App to Vite for improved development experience and build performance. Key changes include:

- **Faster development server** with Vite's Hot Module Replacement (HMR)
- **Faster builds** using esbuild and Rollup
- **Built-in TypeScript support** without additional configuration
- **PWA support** via vite-plugin-pwa instead of Workbox
- **Environment variables** now use `VITE_` prefix instead of `REACT_APP_`
- **Modern build output** optimized for modern browsers

The application functionality remains exactly the same, but with better performance and developer experience.
