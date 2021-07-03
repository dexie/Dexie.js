export interface Realm {
  /** Primary key of the realm.
   */
  realmId: string;

  /** The name of the realm.
   *
   * This property is optional but it can be a good practice to name a realm for what it represents.
   */
  name?: string;

  /** Contains the user-ID of the owner. An owner has implicit full write-access to the realm
   * and all obejcts connected to it. Ownership does not imply read (sync) access though,
   * so realm owners still needs to add themself as a member if they are going to use the realm
   * themselves.
   */
  owner?: string;
}