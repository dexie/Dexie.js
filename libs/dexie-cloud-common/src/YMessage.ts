
export type YMessage = YClientMessage | YServerMessage;
export type YClientMessage = YUpdateFromClientRequest | YAwarenessUpdate;
export type YServerMessage = YUpdateFromClientAck | YUpdateFromClientReject | YUpdateFromServerMessage | YAwarenessUpdate;

export interface YUpdateFromClientRequest {
  type: 'u-c';
  utbl: string;
  k: any;
  u: Uint8Array;
  i: number;
}

export interface YUpdateFromClientAck {
  type: 'u-ack';
  utbl: string;
  i: number;
}

export interface YUpdateFromClientReject {
  type: 'u-reject';
  utbl: string;
  i: number;
}


export interface YUpdateFromServerMessage {
  type: 'u-s';
  utbl: string;
  k: any;
  u: Uint8Array;
  realmSetHash: Uint8Array;
  newRev: string;
}

export interface YAwarenessUpdate {
  type: 'awareness';
  utbl: string;
  k: any;
  u: Uint8Array;
}
