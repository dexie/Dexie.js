import Dexie from 'dexie';
import * as pubsub from './pubsub';
import { subscribe } from './pubsub';
import './dexie-api-extension';
import { collectionObserve } from './collection-observe';
import { dbObserve } from './db-observe';

export default function dexieObservable (db: Dexie) {
  // TODO: Add methods observe() on Collection and db.
  db.Collection.prototype.observe = collectionObserve;
  db.observe = dbObserve;
}
