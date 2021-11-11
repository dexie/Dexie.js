import { TodoDB } from './TodoDB';

export const db = new TodoDB();

// Connect to cloud
db.cloud.configure({
  databaseUrl: process.env.REACT_APP_DBURL!,
  tryUseServiceWorker: true, // true!
  requireAuth: false,
});
