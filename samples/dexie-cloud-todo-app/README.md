# Dexie Cloud ToDo app

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# How to use the sample

If you just want to see the app in action, navigate to the [pre-built published version](https://dfahlander.github.io/Dexie.js/dexie-cloud-todo-app/). Currently it is bugging out on Safari so please use any other browser if possible.

If you want to build and play with it locally, follow these steps:

1. Create a dexie-cloud database to sync the data for your version of the app:
   `npx dexie-cloud create` - create your own database in the cloud.
2. `yarn install` - install dependencies.
3. `./configure-app.sh` (or manually set env variable REACT_APP_DBURL=`<database URL>`)
4. `yarn start`

See https://dexie.org/cloud/

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
