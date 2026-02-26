export interface EntityCommon {
  realmId?: string;
  owner?: string;
  $ts?: string;
  $hasBlobRefs?: 1; // Indicates that the entity has unresolved BlobRefs
}
