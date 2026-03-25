import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { getCurrentUserEmitter } from './currentUserEmitter';
import { DexieCloudDB, SyncStateChangedEventData } from './db/DexieCloudDB';
import { isOnline } from './sync/isOnline';
import { SyncState } from './types/SyncState';
import { userIsActive, userIsReallyActive } from './userIsActive';

export function computeSyncState(db: DexieCloudDB): Observable<SyncState> {
  // Throttle WS status changes to avoid distracting the user with transient states.
  // "connected" always passes through immediately (good news shouldn't be delayed).
  // All other states are debounced by 500ms so that brief disconnected→connecting→connected
  // transitions don't flash intermediate icons.
  const lazyWebSocketStatus = db.cloud.webSocketStatus.pipe(
    switchMap((status) =>
      status === 'connected' ? of(status) : of(status).pipe(debounceTime(500))
    )
  );
  return combineLatest([
    lazyWebSocketStatus,
    db.syncStateChangedEvent.pipe(
      startWith({ phase: 'initial' } as SyncStateChangedEventData)
    ),
    getCurrentUserEmitter(db.dx._novip),
    userIsReallyActive,
  ]).pipe(
    map(([status, syncState, user, userIsActive]) => {
      if (user.license?.status && user.license.status !== 'ok') {
        return {
          phase: 'offline',
          status: 'offline',
          license: user.license.status,
        } satisfies SyncState;
      }
      let { phase, error, progress } = syncState;
      let adjustedStatus = status;
      if (phase === 'error') {
        // Let users only rely on the status property to display an icon.
        // If there's an error in the sync phase, let it show on that
        // status icon also.
        adjustedStatus = 'error';
      }
      if (status === 'not-started') {
        // If websocket isn't yet connected becase we're doing
        // the startup sync, let the icon show the symbol for connecting.
        if (phase === 'pushing' || phase === 'pulling') {
          adjustedStatus = 'connecting';
        }
      }
      const previousPhase = db.cloud.syncState.value.phase;
      //const previousStatus = db.cloud.syncState.value.status;
      if (
        previousPhase === 'error' &&
        (syncState.phase === 'pushing' || syncState.phase === 'pulling')
      ) {
        // We were in an errored state but is now doing sync. Show "connecting" icon.
        adjustedStatus = 'connecting';
      }
      /*if (syncState.phase === 'in-sync' && adjustedStatus === 'connecting') {
        adjustedStatus = 'connected';
      }*/

      if (!userIsActive) {
        adjustedStatus = 'disconnected';
      }

      const retState: SyncState = {
        phase,
        error,
        progress,
        status: isOnline ? adjustedStatus : 'offline',
        license: 'ok',
      };

      return retState;
    })
  );
}
