/// <reference path="../../src/Dexie.js" />
/// <reference path="../../addons/Dexie.Syncable.js" />
/// <reference path="../../addons/Dexie.Syncable.Remote.js" />
/// <reference path="../../addons/Dexie.Syncable.Remote.SyncProtocolAPI.js" />
/// <reference path="includes/jquery-2.1.0.js" />

Dexie.Syncable.Remote.registerSyncProtocol("sample_protocol", {

    sync: function (context, url, options, baseRevision, syncedRevision, changes, partial, applyRemoteChanges, onChangesAccepted, onSuccess, onError) {
        /// <param name="context" type="IPersistedContext"></param>
        /// <param name="url" type="String"></param>
        /// <param name="changes" type="Array" elementType="IDatabaseChange"></param>
        /// <param name="applyRemoteChanges" value="function (changes, lastRevision, partial, clear) {}"></param>
        /// <param name="onSuccess" value="function (continuation) {}"></param>
        /// <param name="onError" value="function (error, again) {}"></param>

        var POLL_INTERVAL = 10000; // Poll every 10th second

        // In this example, the server expects the following JSON format of the request:
        //  {
        //      [clientIdentity: unique value representing the client identity. If omitted, server will return a new client identity in its response that we should apply in next sync call.]
        //      baseRevision: baseRevision,
        //      partial: partial,
        //      changes: changes,
        //      syncedRevision: syncedRevision
        //  }
        //  To make the sample simplified, we assume the server has the exact same specification of how changes are structured.
        //  In real world, you would have to pre-process the changes array to fit the server specification.
        //  However, this example shows how to deal with the WebSocket to fullfill the API.
        var request = {
            clientIdentity: context.clientIdentity || null,
            baseRevision: baseRevision,
            partial: partial,
            changes: changes,
            syncedRevision: syncedRevision
        };

        // Send the request:
        $.ajax(url, {
            type: 'post',
            dataType: 'json',
            data: JSON.stringify(request),
            error: function (xhr, textStatus) {
                // Network down, server unreachable or other failure. Try again in POLL_INTERVAL seconds.
                onError(textStatus, POLL_INTERVAL);
            },
            success: function (data) {
                // In this example, the server response is of the following format:
                //{
                //    success: true / false,
                //    errorMessage: "",
                //    changes: changes,
                //    currentRevision: revisionOfLastChange,
                //    needsResync: false, // Flag telling that server doesnt have given syncedRevision or of other reason wants client to resync.
                //    [clientIdentity: unique value representing the client identity. Only provided if we did not supply a valid clientIdentity in the request.]
                //}
                if (!data.success) {
                    onError (data.errorMessage, Infinity); // Infinity = Dont try again. We would continue getting this error.
                } else {
                    // Since we got success, we also know that server accepted our changes:
                    onChangesAccepted();
                    // Convert the response format to the Dexie.Syncable.Remote.SyncProtocolAPI specification:
                    applyRemoteChanges (data.changes, data.currentRevision, false, data.needsResync);
                    onSuccess({ again: POLL_INTERVAL });
                    if ('clientIdentity' in data) {
                        context.clientIdentity = data.clientIdentity;
                        context.save();
                    }
                }
            }
        });
    }
});
