import { DBCoreTransaction } from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { TXExpandos } from '../types/TXExpandos';

export const outstandingTransactions = new BehaviorSubject<Set<DBCoreTransaction & IDBTransaction & TXExpandos>>(new Set());
