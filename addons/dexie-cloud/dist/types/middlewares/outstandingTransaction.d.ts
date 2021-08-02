import { DBCoreTransaction } from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { TXExpandos } from '../types/TXExpandos';
export declare const outstandingTransactions: BehaviorSubject<Set<DBCoreTransaction & IDBTransaction & TXExpandos>>;
