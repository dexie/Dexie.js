import { DBCoreMutateRequest } from "dexie";
import { UserLogin } from './UserLogin';

export interface TXExpandos {
  txid: string;
  currentUser: UserLogin;
}
