import Dexie from "dexie";
import { BehaviorSubject } from "rxjs";
import { associate } from "./associate";
import { UNAUTHORIZED_USER } from "./authentication/UNAUTHORIZED_USER";
import { UserLogin } from "./dexie-cloud-client";

export const getCurrentUserEmitter = associate((db: Dexie) => new BehaviorSubject<UserLogin>(
  {...UNAUTHORIZED_USER, isLoading: true}
));
