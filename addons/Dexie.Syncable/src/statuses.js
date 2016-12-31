export const Statuses = {
  ERROR: -1, // An irreparable error occurred and the sync provider is dead.
  OFFLINE: 0, // The sync provider hasn't yet become online, or it has been disconnected.
  CONNECTING: 1, // Trying to connect to server
  ONLINE: 2, // Connected to server and currently in sync with server
  SYNCING: 3, // Syncing with server. For poll pattern, this is every poll call. For react pattern, this is when local changes are being sent to server.
  ERROR_WILL_RETRY: 4 // An error occurred such as net down but the sync provider will retry to connect.
};

export const StatusTexts = {
  "-1": "ERROR",
  "0": "OFFLINE",
  "1": "CONNECTING",
  "2": "ONLINE",
  "3": "SYNCING",
  "4": "ERROR_WILL_RETRY"
};
