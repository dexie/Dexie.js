
export function getTiedRealmId(objectId: string) {
  return 'rlm/' + objectId;
}

export function getTiedObjectId(realmId: string) {
  return realmId[3] === '/' ? realmId.substr(4) : null;
}
