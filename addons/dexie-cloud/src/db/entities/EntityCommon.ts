export interface EntityCommon {
  realmId?: string;
  owner?: string;
  $ts?: string;
  $unresolved?: 1; // Indicates that the entity has unresolved BlobRefs
}
