import 'dexie-observable';
import '../../src/Dexie.Syncable';
import {module, asyncTest, start, stop, strictEqual, deepEqual, ok} from 'QUnit';

module("tests-WebSocketSyncServer");

asyncTest("testWebSocketSyncServer", function () {
  var server = new SyncServer(1234);
  server.start();

  var ws = new WebSocket("http://dummy:1234");
  ws.onopen = function () {
    ok(true, "WebSocket opened");
    ws.send(JSON.stringify({
      type: "clientIdentity",
      clientIdentity: null
    }));
    ws.send(JSON.stringify({
      type: "subscribe",
      syncedRevision: null
    }));
  }
  ws.onclose = function (reason) {
    ok(true, "WebSocket closed. Reason: " + reason);
    start();
  }
  ws.onerror = function (event) {
    ok(false, "Error: " + event.reason);
    start();
  }

  ws.onmessage = function (event) {
    var requestFromServer = JSON.parse(event.data);
    if (requestFromServer.type === "clientIdentity") {
      ok(true, "Got client identity: " + requestFromServer.clientIdentity);
      // Now send changes to server
      ws.send(JSON.stringify({
        type: "changes",
        changes: [],
        partial: false,
        baseRevision: null,
        requestId: 1
      }));
    } else if (requestFromServer.type == "ack") {
      ok(true, "Got ack from server: " + requestFromServer.requestId);
      equal(requestFromServer.requestId, 1, "The request ID 1 was acked");

      // Now connect another WebSocket and send its changes to server so that server will react and send us the changes:
      var ws2 = new WebSocket("http://dummy:1234");
      ws2.onopen = function () {
        ws2.send(JSON.stringify({
          type: "clientIdentity",
          clientIdentity: null
        }));
        ws2.send(JSON.stringify({
          type: "changes",
          changes: [{type: 1, table: "UllaBella", key: "apa", obj: {name: "Apansson"}}],
          partial: false,
          baseRevision: null,
          requestId: 1
        }));
      }
    } else if (requestFromServer.type == "changes") {
      if (requestFromServer.currentRevision == 0) {
        ok(true, "Got initial changes sent to us with current revision 0");
      } else {
        ok(true, "Got changes from server: " + JSON.stringify(requestFromServer.changes));
        equal(JSON.stringify(requestFromServer.changes), JSON.stringify([
          {
            rev: 1,
            source: 2, // WebSocket2 was the source of the changes.
            type: 1,
            table: "UllaBella",
            key: "apa",
            obj: {name: "Apansson"}
          }
        ]), "Changes where the same as the ones sent by WebSocket2");
        start();
      }
    }
  }
});
