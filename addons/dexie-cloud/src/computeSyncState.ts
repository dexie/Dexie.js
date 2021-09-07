import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { DexieCloudDB } from './db/DexieCloudDB';
import { isOnline } from './sync/isOnline';
import { SyncState } from './types/SyncState';
import { userIsActive, userIsReallyActive } from './userIsActive';

export function computeSyncState(db: DexieCloudDB): Observable<SyncState> {
  let _prevStatus = db.cloud.webSocketStatus.value;
  const lazyWebSocketStatus = db.cloud.webSocketStatus.pipe(
    switchMap((status) => {
      const prevStatus = _prevStatus;
      _prevStatus = status;
      const rv = of(status);
      switch (status) {
        // A normal scenario is that the WS reconnects and falls shortly in disconnected-->connection-->connected.
        // Don't distract user with this unless these things take more time than normal:

        // Only show disconnected if disconnected more than 500ms, or if we can
        // see that the user is indeed not active.
        case 'disconnected':
          return userIsActive.value ? rv.pipe(debounceTime(500)) : rv;

        // Only show connecting if previous state was 'not-started' or 'error', or if
        // the time it takes to connect goes beyond 4 seconds.
        case 'connecting':
          return prevStatus === 'not-started' || prevStatus === 'error'
            ? rv
            : rv.pipe(debounceTime(4000));
        default:
          return rv;
      }
    })
  );
  return combineLatest([
    lazyWebSocketStatus,
    db.syncStateChangedEvent.pipe(startWith({ phase: 'initial' } as SyncState)),
    userIsReallyActive
  ]).pipe(
    map(([status, syncState, userIsActive]) => {
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
      if (previousPhase === 'error' && (syncState.phase === 'pushing' || syncState.phase === 'pulling')) {
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
      };

      return retState;
    })
  );
}
