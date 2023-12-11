export interface Member {
  id?: string; // Auto-generated universal primary key
  realmId: string;
  userId?: string; // User identity. Set by the system when user accepts invite.
  email?: string; // The email of the requested user (for invites).
  name?: string; // The name of the requested user (for invites).
  invite?: boolean;
  invited?: Date;
  accepted?: Date;
  rejected?: Date;
  roles?: string[]; // Array of role names for this user.
  permissions?: {
    add?: string[] | "*"; // array of tables or "*" (all).
    update?: {
      [tableName: string]: string[] | "*"; // array of properties or "*" (all).
    };
    manage?: string[] | "*"; // array of tables or "*" (all).
  };
}
