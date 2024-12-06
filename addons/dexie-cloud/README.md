The web client for [Dexie Cloud](https://dexie.org/cloud/).

## Getting started

```
npm install dexie@latest
npm install dexie-cloud-addon@latest
```

```ts
import Dexie from 'dexie';
import dexieCloud from 'dexie-cloud-addon';

const db = new Dexie('dbname', { addons: [dexieCloud]});

db.version(1).stores({
    yourTable: '@primKeyProp, indexedProp1, indexedProp2, ...'
});

db.cloud.configure({
  databaseUrl: 'https://<yourdb>.dexie.cloud'
})
```

## See also

https://dexie.org/cloud/docs/dexie-cloud-addon#api

## Obtaining a database URL

Run the following command in a console / terminal:

```
npx dexie-cloud create
```

See also https://dexie.org/cloud/#getting-started

*Having problems getting started, please [file an issue](https://github.com/dexie/Dexie.js/issues/new)*

# The Cloud Service

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v2/monitor/jist.svg)](https://www.dexie-cloud-status.com)

The official production service for Dexie Cloud Server is forever free of charge so you do not need to install any server to get started. The free service has some limits, see https://dexie.org/cloud/pricing

# On-Prem version

Dexie Cloud Server is a closed source software that can be purchased and installed on own hardware, see [On-Prem Silver / On-Prem Gold](https://dexie.org/cloud/pricing)

# CLI

See https://dexie.org/cloud/docs/cli

# APIs

See https://dexie.org/cloud/docs/dexie-cloud-api
