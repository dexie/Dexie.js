import Dexie from "dexie";
import { BehaviorSubject } from "rxjs";
import { associate } from "./associate";
import { UNAUTHORIZED_USER } from "./authentication/UNAUTHORIZED_USER";

const isOathCallback = typeof location !== 'undefined' && !!(new URL(location.href)).searchParams.get('dxc-auth');

export const getCurrentUserEmitter = associate((db: Dexie) => new BehaviorSubject(
  isOathCallback
  ? {...UNAUTHORIZED_USER, oauthInProgress: true}
  : UNAUTHORIZED_USER
));
