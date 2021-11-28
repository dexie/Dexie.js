import Dexie from "dexie";
import { BehaviorSubject } from "rxjs";
import { associate } from "./associate";
import { UNAUTHORIZED_USER } from "./authentication/UNAUTHORIZED_USER";

export const getCurrentUserEmitter = associate((db: Dexie) => new BehaviorSubject(UNAUTHORIZED_USER));
