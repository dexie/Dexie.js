import Dexie from 'dexie';
import * as pubsub from './pubsub';
import {subscribe} from './pubsub';

export default function dexieObservable (db: Dexie) {
  const o = {hej: 1};
  const o2 = {...o};
  const o3 = Object.assign(o, o2);
  subscribe("", ()=>{});
}
