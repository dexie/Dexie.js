import { PersistedSyncState } from '../db/entities/PersistedSyncState';
import { b64encode } from 'dreambase-library/dist/common/base64';

export async function computeRealmSetHash({
  realms,
  inviteRealms,
}: PersistedSyncState) {
  const data = JSON.stringify(
    [
      ...realms.map((realmId) => ({ realmId, accepted: true })),
      ...inviteRealms.map((realmId) => ({ realmId, accepted: false })),
    ].sort((a, b) =>
      a.realmId < b.realmId ? -1 : a.realmId > b.realmId ? 1 : 0
    )
  );
  const byteArray = new TextEncoder().encode(data);
  const digestBytes = await crypto.subtle.digest('SHA-1', byteArray);
  const base64 = b64encode(digestBytes);
  return base64;
}
