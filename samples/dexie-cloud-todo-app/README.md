# Dexie Cloud ToDo app

This project is built with [Vite](https://vitejs.dev/) and uses TypeScript and React.

## How to use the sample

**[You can open a deployed version of this PWA at https://dexie.github.io/Dexie.js/dexie-cloud-todo-app](https://dexie.github.io/Dexie.js/dexie-cloud-todo-app)**

If you just want to see the app in action, navigate to the [pre-built published version](https://dexie.github.io/Dexie.js/dexie-cloud-todo-app/).

If you want to build and play with it locally, follow these steps:

1. `npx dexie-cloud create` or `npx dexie-cloud connect <existing db>`
2. `npm install`
3. `./configure-app.sh`
4. `npm run dev` (or `npm start`)

The steps above will:

1. Create a new database in the cloud (or connect to existing)
2. Install dependencies
3. Import demo-users to your database and create a .env.local file that connects the ToDo app to your database.
4. Build and start the application in local dev-mode with Vite's fast HMR (Hot Module Replacement).

## Activating Service Worker

Service worker is automatically enabled in production builds thanks to vite-plugin-pwa. In development mode, the service worker is disabled by default for easier debugging.

The easiest way to test the full PWA experience is to deploy the app:

1. `npm run build && npm run preview` (local production preview). The production build is previewed on port 3001
2. Or deploy with: `npm run deploy` (will publish the app to your gh-pages branch of your Dexie.js fork)
3. `npx dexie-cloud whitelist https://your-github-username.github.io` (replace `your-github-username`)
4. Voila: Go to https://your-github-username.github.io/Dexie.js/dexie-cloud-todo-app/ from your browser. This is a full installable PWA that you can add to your start screen on a mobile phone.

Dexie Cloud works both with and without a service worker but there are some benefits of activating the service worker:

* Your app becomes a real installable PWA that people can add to their start screen on mobile or desktop.
* If you do a change while being offline and close the app, it will be synced once you get online, no matter if you're still in the app or not.
* If your PWA is installed via Chrome (or any browser that supports the periodicSync event), the app will periodically sync with the server also when you aren't using it, making sure that next time the app is started, it already has the fresh data from server.

## Disabling Service Worker

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

Runs the test suite using Vitest once and exits.\
Perfect for CI/CD or quick test verification.

### `npm run test:watch`

Runs the test suite in watch mode using Vitest.\
Tests will re-run automatically when files change during development.

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

## Learn More

You can learn more about Vite in the [Vite documentation](https://vitejs.dev/).

To learn React, check out the [React documentation](https://reactjs.org/).

To learn about Dexie Cloud, check out the [Dexie Cloud documentation](https://dexie.org/cloud/docs/).

## Configuration and Customization

Unlike Create React App's "eject" operation, Vite provides full configuration flexibility without ejecting:

- **Build configuration**: Modify `vite.config.ts` to customize the build process
- **TypeScript settings**: Update `tsconfig.json` for TypeScript configuration  
- **PWA settings**: Configure PWA behavior in the VitePWA plugin settings
- **Testing**: Customize test setup in `vitest.config.ts`
- **Plugins**: Add any Vite plugin for additional functionality

All configuration files are accessible and can be modified at any time without losing upgrade paths or tooling support.

## Migration from Create React App

This project has been migrated from Create React App to Vite for improved development experience and build performance. Key changes include:

- **Faster development server** with Vite's Hot Module Replacement (HMR)
- **Faster builds** using esbuild and Rollup
- **Built-in TypeScript support** without additional configuration
- **PWA support** via vite-plugin-pwa instead of Workbox
- **Environment variables** now use `VITE_` prefix instead of `REACT_APP_`
- **Modern build output** optimized for modern browsers

### Public URL Configuration

Unlike Create React App's `%PUBLIC_URL%` template syntax, Vite handles public paths through the `base` configuration in `vite.config.ts`. 

- **Default**: Absolute paths (`/assets/...`) for root domain deployment
- **Subdirectory deployment**: Set `PUBLIC_URL` environment variable
  ```bash
  # For deployment in subdirectory
  PUBLIC_URL=/my-app npm run build
  
  # For relative paths (e.g., GitHub Pages without custom domain)
  PUBLIC_URL=. npm run build
  ```

The `PUBLIC_URL` environment variable is automatically converted to Vite's `base` option during build.

The application functionality remains exactly the same, but with better performance and developer experience.
