import { Entity } from 'dexie';
import type { TodoDB } from './TodoDB';
import { DBRealmMember, getTiedRealmId } from 'dexie-cloud-addon';

/** Since there are some actions associated with
 * this entity (shareWith(), unshareWith() etc) we encapsulate all
 * sync-consistent logic in these class methods.
 *
 * We could equally well have declared TodoList as an interface
 * and write helper functions on the side.
 *
 * The Entity base class tells dexie to inject db as a prop this.db.
 * This is to avoid recursive dependencies when you need to access
 * db from within a method.
 */
export class TodoList extends Entity<TodoDB> {
  //
  // Persisted Properties
  //

  id!: string;
  realmId!: string;
  owner!: string;
  title!: string;

  //
  // Methods
  //

  isSharable() {
    return this.realmId === getTiedRealmId(this.id);
  }

  /** Ensures the todoList is in a sharable state
   * If the list is already sharable, does nothing.
   * If the list is not sharable, it will be moved
   * to a new realm with a deterministic id based on
   * the todo-list id.
   * 
   * The operation is sync-consistent and will work correctly
   * whether the todo-list is shared or not while the operation
   * is performed offline.
   * 
   * If another client of the same user has added new todo-items
   * to the list while offline, those items will be
   * moved to the new realm as well.
   */
  async makeSharable() {
    // Compute a deterministic realmId tied to this todoList:
    const realmId = getTiedRealmId(this.id);

    const db = this.db; // Entity<T> provides this.db - avoids cyclic deps.
    await db.transaction('rw', [db.todoLists, db.todoItems, db.realms], () => {
      // Make sure a realm exists (using a deterministic id based on the id of the
      // todo-list)
      // We use Table.upsert() instead of add(), put() here:
      //   In case same user does this on two offline devices, we don't
      //   want one of the actions to fail (which would be the case if using add())
      //   and we don't want to overwrite existing props like owner (which
      //   would be the case if using put())
      db.realms.upsert(realmId, {
        name: this.title,
        represents: 'a to-do list',
      });

      // Move the todoList into the new realm
      db.todoLists.update(this.id!, { realmId: realmId });

      // Move all todo items into the new realm consistently
      // (modify() is consistent across sync peers)
      db.todoItems
        .where({ todoListId: this.id })
        .modify({ realmId: realmId });
    });
    return realmId;
  }

  /** Moves the list to the private realm and removes all members
   * 
   * The operation is sync-consistent and will work correctly
   * whether the todo-list is shared or not while the operation
   * is performed offline.
   * 
   * The operation may succeed offline but fail later during sync
   * if someone else has removed our access in the meantime.
   * If that happens, the server will roll-back the operation and
   * restore the local data to mirror the server state.
   */
  async makePrivate() {
    const tiedRealmId = getTiedRealmId(this.id);
    const db = this.db;
    await db.transaction(
      'rw',
      [db.todoLists, db.todoItems, db.members, db.realms],
      async () => {
        // Move todoItems out of the realm in a sync-consistent operation:
        await db.todoItems
          .where({
            realmId: tiedRealmId,
            todoListId: this.id,
          })
          .modify({
            realmId: db.cloud.currentUserId,
            owner: db.cloud.currentUserId,
          });

        // Move the todoList back into your private realm:
        await db.todoLists.update(this.id, {
          realmId: this.db.cloud.currentUserId,
          owner: this.db.cloud.currentUserId,
        });

        // Remove all access (Collection.delete() is a sync-consistent operation)
        await db.members.where('realmId').equals(tiedRealmId).delete();
        // Delete tied realm
        await db.realms.delete(tiedRealmId);
      }
    );
  }

  /** Share the todo list with a new person.
   * 
   * This will create an invite for the person
   * to accept.
   * 
   * The operation is sync-consistent and will work correctly
   * whether the todo-list is shared or not while the operation
   * is performed offline.
   * 
   * If the list is not already shared, it will be made
   * shared (moved to a new realm with deterministic id).
   * 
   * @param name Name of the person to share with
   * @param email Email of the person to share with
   * @param sendEmail Whether to send an email invite or not
   * @param roles Roles to assign the new member (e.g. ['readonly'] or ['manager'])
   */
  async shareWith(
    name: string,
    email: string,
    sendEmail: boolean,
    roles: string[]
  ) {
    const { db } = this;
    await db.transaction(
      'rw',
      [
        db.members,   // Used in this method
        db.todoLists, // Used in makeSharable()
        db.todoItems, // Used in makeSharable()
        db.realms     // Used in makeSharable()
      ],
      async () => {
        // Ensure todoList is sharable (in a realm with deterministic id)
        // ( idempotent operation )
        const realmId = await this.makeSharable(); // sub transaction

        // Add given name and email as a member with full permissions
        await db.members.add({
          realmId,
          name,
          email,
          invite: sendEmail,
          roles,
        });
      }
    );
  }

  /** Remove access to the list for given member
   * 
   * This is a sync-consistent operation. The server
   * will reject the operation if the deletion results in the realm
   * not having any member representing the owner (realm.owner).
   * 
   * If this happens, the server will roll-back the operation and
   * restore the local data to mirror the server state (i.e. the
   * given member will become added locally again).
   * 
   * @param member 
   */
  async unshareWith(member: DBRealmMember) {
    await this.db.members.delete(member.id);
  }

  /** Remove access to the list for the current user.
   * 
   * This is a sync-consistent operation. The server
   * will reject the operation if the user is the owner of the list.
   * If this happens, the server will roll-back the operation and
   * restore the local data to mirror the server state (i.e. the
   * user will still have access and be owner).
   */
  async leaveList() {
    // Delete own member entry --> you will then no longer have access
    // to the shared list.
    const { db } = this;
    await db.members
      .where({
        realmId: getTiedRealmId(this.id),
        userId: db.cloud.currentUserId,
      })
      .delete();
  }

  /** Delete the todo list including all its related entities (todo-items,
   * realm and memberships)
   * 
   * The operation is sync-consistent and will work correctly
   * whether the todo-list is shared or not while the operation
   * is performed offline.
   */
  async deleteList() {
    const { db } = this;
    await db.transaction(
      'rw',
      [db.todoLists, db.todoItems, db.members, db.realms],
      () => {
        // Delete todo items on the tied realmId in case it's shared
        db.todoItems
          .where({
            todoListId: this.id,
            realmId: getTiedRealmId(this.id)
          })
          .delete();

        // Delete todo items on the private realmId in case it's unshared
        db.todoItems
          .where({
            todoListId: this.id,
            realmId: db.cloud.currentUserId,
          })
          .delete();

        // Delete the list
        db.todoLists.delete(this.id!);

        // Delete any tied realm and related access.
        // If it wasn't shared, this is a no-op but do
        // it anyway to make this operation consistent
        // in case it was shared by other offline
        // client and then syncs.
        // No need to delete members - they will be deleted
        // automatically when the realm is deleted.
        const tiedRealmId = getTiedRealmId(this.id);
        db.realms.delete(tiedRealmId);
      }
    );
  }

  /** Change ownership of the todo list to given userId.
   * 
   * The operation is sync-consistent and will work correctly
   * whether the todo-list is shared or not while the operation
   * is performed offline.
   * 
   * The operation may succeed offline but fail later during sync
   * if someone else has removed access for userId in the meantime.
   * If that happens, the server will roll-back the operation and
   * restore the local data to mirror the server state.
   *
   * @param userId UserID of the new owner
   */
  async changeOwner(userId: string) {
    const { db } = this;
    const realmId = getTiedRealmId(this.id);

    if (!userId)
      throw new Error(
        `Cannot give ownership to user before invite is accepted.`
      );

    return db.transaction('rw', db.todoLists, db.members, db.realms, () => {
      // Before changing owner, give full permissions to the old owner:
      db.members
        .where({ realmId, userId: this.owner })
        .modify({ roles: ['manager'] });
      // Change owner of all members in the realm:
      db.members.where({ realmId }).modify({ owner: userId });
      // Change owner of the todo list:
      db.todoLists.where({ realmId, id: this.id }).modify({ owner: userId });
      // Change owner of realm:
      db.realms.update(realmId, { owner: userId });
    });
  }

  /** Change role for given member
   * 
   * @param member 
   * @param role 
   */
  async changeMemberRole(member: DBRealmMember, role: string) {
    await this.db.members.update(member.id, {
      permissions: {},
      roles: [role]
    });
  }
}
