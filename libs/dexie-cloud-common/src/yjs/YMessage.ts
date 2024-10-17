
export type YMessage = YClientMessage | YServerMessage;
export type YClientMessage = YUpdateFromClientRequest | YStateVector | YDocumentOpen | YAwarenessUpdate| YDocumentClose;
export type YServerMessage = YUpdateFromClientAck | YUpdateFromClientReject | YUpdateFromServerMessage | YAwarenessUpdate | YInSyncMessage;

export interface YUpdateFromClientRequest {
  type: 'u-c';
  table: string;
  prop: string;
  k: any;
  u: Uint8Array;
  i: number;
}

export interface YDocumentOpen {
  type: 'doc-open';
  table: string;
  prop: string;
  k: any;
  serverRev?: string; // The server revision of what client has received in last sync. User to query changes since this revision.
  sv?: Uint8Array;
}

export interface YStateVector {
  type: 'sv';
  table: string;
  prop: string;
  k: any;
  sv: Uint8Array;
}


export interface YDocumentClose {
  type: 'doc-close';
  table: string;
  prop: string;
  k: any;
}

export interface YUpdateFromClientAck {
  type: 'u-ack';
  table: string;
  prop: string;
  i: number;
}

export interface YUpdateFromClientReject {
  type: 'u-reject';
  table: string;
  prop: string;
  i: number;
}


export interface YUpdateFromServerMessage {
  type: 'u-s';
  table: string;
  prop: string;
  k: any;
  u: Uint8Array;
}

export interface YAwarenessUpdate {
  type: 'aware';
  table: string;
  prop: string;
  k: any;
  u: Uint8Array;
}

export interface YInSyncMessage {
  type: 'in-sync';
  table: string;
  prop: string;
  k: any;
}


/*export interface YDocumentClosed { // Probably not needed. We have an awareness update for that. Just we need to identify clientID.
  type: 'doc-closed';
  utbl: string;
  k: any;
}
*/