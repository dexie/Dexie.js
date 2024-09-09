
export type YMessage = YClientMessage | YServerMessage;
export type YClientMessage = YUpdateFromClientRequest | YStateVector | YAwarenessUpdate; // | YDocumentClosed;
export type YServerMessage = YUpdateFromClientAck | YUpdateFromClientReject | YUpdateFromServerMessage | YAwarenessUpdate;

export interface YUpdateFromClientRequest {
  type: 'u-c';
  table: string;
  prop: string;
  k: any;
  u: Uint8Array;
  i: number;
}

export interface YStateVector {
  type: 'sv';
  table: string;
  prop: string;
  k: any;
  sv: Uint8Array;
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
  realmSetHash: Uint8Array;
  newRev: string;
}

export interface YAwarenessUpdate {
  type: 'aware';
  table: string;
  prop: string;
  k: any;
  u: Uint8Array;
}

/*export interface YDocumentClosed { // Probably not needed. We have an awareness update for that. Just we need to identify clientID.
  type: 'doc-closed';
  utbl: string;
  k: any;
}
*/