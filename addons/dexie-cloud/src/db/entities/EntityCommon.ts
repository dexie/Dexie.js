export interface EntityCommon {
  realmId?: string;
  owner?: string;
  $ts?: string;
  _hasBlobRefs?: 1; // Indicates that the entity has unresolved BlobRefs
}
