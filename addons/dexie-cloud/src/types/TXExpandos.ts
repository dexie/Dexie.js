import { DBCoreMutateRequest } from "dexie";
import { UserLogin } from '../db/entities/UserLogin';

export interface TXExpandos {
  txid: string;
  currentUser: UserLogin;
}
