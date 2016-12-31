/// <reference path="../../dist/dexie.js" />
/// <reference path="../../addons/Dexie.Syncable/dist/dexie-syncable.js" />
/// <reference path="../../addons/Dexie.Syncable/Dexie.Syncable.SyncProtocolAPI.js" />
/// <reference path="includes/jquery-2.1.0.js" />

Dexie.Syncable.registerSyncProtocol("sample_protocol", {

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
        //  To keep the sample simple, we assume the server has the exact same specification of how changes are structured.
        //  In real world, you would have to pre-process the changes array to fit the server specification.
        //  However, this example shows how to deal with ajax to fulfil the API.
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
            contentType: 'application/json', // Make sure we set the correct content-type header as some servers expect this
            dataType: 'json',
            data: JSON.stringify(request),
            error: function (xhr, textStatus) {
                // Network down, server unreachable or other failure. Try again in POLL_INTERVAL seconds.
                onError(textStatus, POLL_INTERVAL);
            },
            success: function (data) {
                // In this example, the server response has the following format:
                //{
                //    success: true / false,
                //    errorMessage: "",
                //    changes: changes,
                //    currentRevision: revisionOfLastChange,
                //    needsResync: false, // Flag telling that server doesn't have given syncedRevision or of other reason wants client to resync. ATTENTION: this flag is currently ignored by Dexie.Syncable
                //    partial: true / false, // The server sent only a part of the changes it has for us. On next resync it will send more based on the clientIdentity
                //    [clientIdentity: unique value representing the client identity. Only provided if we did not supply a valid clientIdentity in the request.]
                //}
                if (!data.success) {
                    onError (data.errorMessage, Infinity); // Infinity = Don't try again. We would continue getting this error.
                } else {
                    if ('clientIdentity' in data) {
                        context.clientIdentity = data.clientIdentity;
                        // Make sure we save the clientIdentity sent by the server before we try to resync.
                        // If saving fails we wouldn't be able to do a partial synchronization
                        context.save()
                            .then(() => {
                            // Since we got success, we also know that server accepted our changes:
                            onChangesAccepted();
                            // Convert the response format to the Dexie.Syncable.Remote.SyncProtocolAPI specification:
                            applyRemoteChanges (data.changes, data.currentRevision, data.partial, data.needsResync);
                            onSuccess({ again: POLL_INTERVAL });
                            })
                            .catch((e) => {
                                // We didn't manage to save the clientIdentity stop synchronization
                                onError(e, Infinity);
                            });
                    } else {
                        // Since we got success, we also know that server accepted our changes:
                        onChangesAccepted();
                        // Convert the response format to the Dexie.Syncable.Remote.SyncProtocolAPI specification:
                        applyRemoteChanges (data.changes, data.currentRevision, data.partial, data.needsResync);
                        onSuccess({ again: POLL_INTERVAL });
                    }
                }
            }
        });
    }
});
