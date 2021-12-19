
export function getTiedRealmId(objectId: string) {
  return 'rlm~' + objectId;
}

export function getTiedObjectId(realmId: string) {
  return realmId.startsWith('rlm~') ? realmId.substr(4) : null;
}
