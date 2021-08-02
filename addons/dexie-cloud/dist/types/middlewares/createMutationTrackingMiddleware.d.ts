import { DBCore, Middleware } from 'dexie';
import { BehaviorSubject } from 'rxjs';
import { DexieCloudDB } from '../db/DexieCloudDB';
import { UserLogin } from '../db/entities/UserLogin';
export interface MutationTrackingMiddlewareArgs {
    currentUserObservable: BehaviorSubject<UserLogin>;
    db: DexieCloudDB;
}
/** Tracks all mutations in the same transaction as the mutations -
 * so it is guaranteed that no mutation goes untracked - and if transaction
 * aborts, the mutations won't be tracked.
 *
 * The sync job will use the tracked mutations as the source of truth when pushing
 * changes to server and cleanup the tracked mutations once the server has
 * ackowledged that it got them.
 */
export declare function createMutationTrackingMiddleware({ currentUserObservable, db }: MutationTrackingMiddlewareArgs): Middleware<DBCore>;
