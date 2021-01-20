# Vue + Dexie Todo Example

This project was bootstrapped with [Vue CLI](https://cli.vuejs.org/). Its arrangement of components is designed to be similar to that of the components in the [React](../react) example. The code is organized into:

* `src/database.js`: contains all database logic in its exported `Database` class.
* `src/App.vue`: the top-level Vue.js app instantiates a `Database` on its creation to handle database changes.
* `src/components/*.vue`: the components to the to-do list; sends events up to the `App.vue` component on user interactions.

## Install dependencies

Before you can run the app in your browser, you will have to install its dependencies with:

```
npm install
```

## Development server

Run `npm run serve` for a dev server. Navigate to `http://localhost:1123`. The app will automatically reload if you change any of the source files. You will also see any lint errors in the console.

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `build/` directory.

## Further help

* [Vue CLI guide](https://cli.vuejs.org)
* [Vue.js Guide](https://v3.vuejs.org/guide/introduction.html) for core Vue 3 concepts
* To get more help on Dexie check out the [Dexie Wiki](https://github.com/dfahlander/Dexie.js/wiki)
