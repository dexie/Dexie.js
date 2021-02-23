import { IDatabaseChange } from "dexie-observable/api";
import {
  ApplyRemoteChangesFunction,
  IPersistedContext,
  ISyncProtocol,
  ReactiveContinuation,
} from "dexie-syncable/api";
import { authenticate } from './authenticate';
import { TSON } from "./TSON";

// Constants:
var RECONNECT_DELAY = 5000; // Reconnect delay in case of errors such as network down.

export const dexieCloudSyncProtocol: ISyncProtocol = {
  async sync(
    context: IPersistedContext,
    url: string,
    options: { databaseUrl: string; requireAuth?: boolean },
    baseRevision: any,
    syncedRevision: any,
    changes: IDatabaseChange[],
    partial: boolean,
    applyRemoteChanges: ApplyRemoteChangesFunction,
    onChangesAccepted: () => void,
    onSuccess: (continuation: ReactiveContinuation) => void,
    onError: (error: any, again: number) => void
  ) {
    // The following vars are needed because we must know which callback to ack when server sends it's ack to us.
    let requestId = 0;
    const acceptCallbacks = new Map<number, () => void>();
    const wsUrl = new URL(url);
    wsUrl.protocol = wsUrl.protocol === "https" ? "wss" : "ws";
    const token: string = options.requireAuth
      ? await authenticate(url, context)
      : null;
    const query = `?clientIdentity=${encodeURIComponent(
      context.clientIdentity
    )}${token ? `&token=${encodeURIComponent(token)}` : ``}`;

    // Connect the WebSocket to given url:
    // Initiate this socket connection by sending our clientIdentity. If we dont have a clientIdentity yet,
    // server will call back with a new client identity that we should use in future WebSocket connections.
    const ws = new WebSocket(
      wsUrl.toString() +
        `?token=${encodeURIComponent(
          token
        )}&clientIdentity=${encodeURIComponent(context.clientIdentity || "")}`
    );
    ws.binaryType = "arraybuffer";

    // When WebSocket opens, send our changes to the server.
    ws.onopen = (event) => {
      console.log("onopen");
      // Send our changes if we have any:
      if (changes.length > 0) {
        console.log("sending changes");
        sendChanges(changes, baseRevision, partial, onChangesAccepted);
      }
      // Subscribe to server changes:
      console.log("subscribing");
      ws.send(
        JSON.stringify({
          type: "subscribe",
          syncedRevision: syncedRevision,
        })
      );
      /*setInterval(()=>{
        ws.send(JSON.stringify({type: "test"}));
      }, 1000);*/
    };

    // If network down or other error, tell the framework to reconnect again in some time:
    ws.onerror = function (event) {
      console.log("onerror");
      ws.close();
      onError((event as ErrorEvent).message, RECONNECT_DELAY);
    };

    // If socket is closed (network disconnected), inform framework and make it reconnect
    ws.onclose = function (event) {
      console.log("onclose");
      onError("Socket closed: " + event.reason, RECONNECT_DELAY);
    };

    // isFirstRound: Will need to call onSuccess() only when we are in sync the first time.
    // onSuccess() will unblock Dexie to be used by application code.
    // If for example app code writes: db.friends.where('shoeSize').above(40).toArray(callback), the execution of that query
    // will not run until we have called onSuccess(). This is because we want application code to get results that are as
    // accurate as possible. Specifically when connected the first time and the entire DB is being synced down to the browser,
    // it is important that queries starts running first when db is in sync.
    let isFirstRound = true;
    let incomingBinaryChunks: any[] = [];
    // When message arrive from the server, deal with the message accordingly:
    ws.onmessage = function (event) {
      console.log("onmessage");
      try {
        // Assume we have a server that should send JSON messages of the following format:
        // {
        //     type: "clientIdentity", "changes", "ack" or "error"
        //     clientIdentity: unique value for our database client node to persist in the context. (Only applicable if type="clientIdentity")
        //     message: Error message (Only applicable if type="error")
        //     requestId: ID of change request that is acked by the server (Only applicable if type="ack" or "error")
        //     changes: changes from server (Only applicable if type="changes")
        //     lastRevision: last revision of changes sent (applicable if type="changes")
        //     partial: true if server has additionalChanges to send. False if these changes were the last known. (applicable if type="changes")
        // }
        if (typeof event.data !== "string") {
          incomingBinaryChunks.push(event.data);
        } else {
          const requestFromServer = TSON.parse(
            event.data,
            incomingBinaryChunks
          );
          incomingBinaryChunks = [];
          if (requestFromServer.type === "changes") {
            applyRemoteChanges(
              requestFromServer.changes,
              requestFromServer.currentRevision,
              requestFromServer.partial
            );

            if (isFirstRound && !requestFromServer.partial) {
              // Since this is the first sync round and server sais we've got all changes - now is the time to call onsuccess()
              console.log("Calling onSuccess with continuation react.");
              debugger;
              onSuccess({
                // Specify a react function that will react on additional client changes
                react: function (
                  changes,
                  baseRevision,
                  partial,
                  onChangesAccepted
                ) {
                  console.log("Got changes", changes);
                  sendChanges(
                    changes,
                    baseRevision,
                    partial,
                    onChangesAccepted
                  );
                },
                // Specify a disconnect function that will close our socket so that we dont continue to monitor changes.
                disconnect: function () {
                  console.log("Framework wants to disconnect");
                  ws.close();
                },
              });
              isFirstRound = false;
            }
          } else if (requestFromServer.type == "ack") {
            var requestId = requestFromServer.requestId;
            var acceptCallback = acceptCallbacks.get(requestId);
            acceptCallback?.(); // Tell framework that server has acknowledged the changes sent.
            acceptCallbacks.delete(requestId);
          } else if (requestFromServer.type == "clientIdentity") {
            context.clientIdentity = requestFromServer.clientIdentity;
            context.save();
          } else if (requestFromServer.type == "error") {
            const requestId = requestFromServer.requestId;
            acceptCallbacks.delete(requestId);
            ws.close();
            onError(requestFromServer.message, Infinity); // Don't reconnect - an error in application level means we have done something wrong.
          }
        }
      } catch (e) {
        ws.close();
        onError(e, Infinity); // Something went crazy. Server sends invalid format or our code is buggy. Dont reconnect - it would continue failing.
      }
    };

    // sendChanges() method:
    function sendChanges(
      changes: IDatabaseChange[],
      baseRevision: number,
      partial: boolean,
      onChangesAccepted: () => void
    ) {
      ++requestId;
      acceptCallbacks.set(requestId, onChangesAccepted);

      // In this example, the server expects the following JSON format of the request:
      //  {
      //      type: "changes"
      //      baseRevision: baseRevision,
      //      changes: changes,
      //      partial: partial,
      //      requestId: id
      //  }
      //  To make the sample simplified, we assume the server has the exact same specification of how changes are structured.
      //  In real world, you would have to pre-process the changes array to fit the server specification.
      //  However, this example shows how to deal with the WebSocket to fullfill the API.
      const outgoingBinaryChunks = [];
      const tson = TSON.stringify(
        {
          type: "changes",
          changes,
          partial,
          baseRevision,
          requestId,
        },
        outgoingBinaryChunks
      );
      for (const chunk of outgoingBinaryChunks) ws.send(chunk);
      ws.send(tson);
    }
  },
};
