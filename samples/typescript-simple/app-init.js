require.config({
    baseUrl: "/",
    paths: {
        "dexie": "node_modules/dexie/dist/dexie"
    }
});

requirejs(['./app']);
