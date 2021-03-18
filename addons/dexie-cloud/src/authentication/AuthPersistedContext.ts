import { SyncableDB } from "../SyncableDB";
import { UserLogin } from "../types/UserLogin";

export interface AuthPersistedContext extends UserLogin {
  save(): Promise<void>;
}

// Emulate true-private property db. Why? So it's not stored in DB.
const wm = new WeakMap<AuthPersistedContext, SyncableDB>();

export class AuthPersistedContext {
  constructor(db: SyncableDB, userLogin: UserLogin) {
    wm.set(this, db);
    Object.assign(this, userLogin);
  }

  static load(db: SyncableDB, userId: string) {
    return db
      .table("$logins")
      .get(userId)
      .then(
        (userLogin) => new AuthPersistedContext(db, userLogin || {
          userId,
          claims: {
            sub: userId
          },
          lastLogin: new Date(0)
        })
      );
  }

  async save() {
    const db = wm.get(this)!;
    db.table("$logins").put(this);
  }
}
