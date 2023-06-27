import { Entity } from 'dexie';
import type { TodoDB } from './TodoDB';
import { DBRealmMember, getTiedRealmId } from 'dexie-cloud-addon';

/** Since there are some actions associated with
 * this entity (share(), unshare() etc) it can be
 * nice to use a mapped class here.
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

  isPrivate() {
    return this.id[0] === '#';
  }

  async makeSharable() {
    if (this.isPrivate())
      throw new Error('Private lists cannot be made sharable');
    const currentRealmId = this.realmId;
    const newRealmId = getTiedRealmId(this.id);
    const { db } = this;

    await this.db.transaction(
      'rw',
      [db.todoLists, db.todoItems, db.realms],
      async () => {
        // Create tied realm
        // We use put() here in case same user does this on
        // two offline devices to add different members - we don't
        // want one of the actions to fail - we want both to succeed
        // and add both members
        await db.realms.put({
          realmId: newRealmId,
          name: this.title,
          represents: 'a to-do list',
        });

        // "Realmify entity" (setting realmId equals own id will make it become a Realm)
        await db.todoLists.update(this.id!, { realmId: newRealmId });
        // Move all todo items into the new realm consistently (modify() is consistent across sync peers)
        await db.todoItems
          .where({
            realmId: currentRealmId,
            todoListId: this.id,
          })
          .modify({ realmId: newRealmId });
      }
    );
    return newRealmId;
  }

  async unshareWithEveryone() {
    const { db } = this;
    const tiedRealmId = getTiedRealmId(this.id);
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
          .modify({ realmId: db.cloud.currentUserId });

        // Move the todoList back into your private realm:
        await db.todoLists.update(this.id, {
          realmId: this.db.cloud.currentUserId,
        });

        // Remove all access (Collection.delete() is a sync-consistent operation)
        await db.members.where('realmId').equals(tiedRealmId).delete();
        // Delete tied realm
        await db.realms.delete(tiedRealmId);
      }
    );
  }

  async shareWith(name: string, email: string, sendEmail: boolean, roles: string[]) {
    const { db } = this;
    await db.transaction(
      'rw',
      [db.members, db.todoLists, db.todoItems, db.realms],
      async () => {
        let realmId = this.realmId;
        if (!this.isSharable()) {
          realmId = await this.makeSharable();
        }

        // Add given name and email as a member with full permissions
        await this.db.members.add({
          realmId,
          name,
          email,
          invite: sendEmail,
          roles
        });
      }
    );
  }

  async unshareWith(member: DBRealmMember) {
    const { db } = this;
    await db.transaction(
      'rw',
      [db.todoLists, db.todoItems, db.members, db.realms],
      async () => {
        await db.members.delete(member.id);
        const numOtherPeople = await db.members
          .where({ realmId: this.realmId })
          .filter(m => m.userId !== db.cloud.currentUserId)
          .count();
        if (numOtherPeople === 0) {
          // Only our own member left.
          await this.unshareWithEveryone();
        }
      }
    );
  }

  async leave() {
    const { db } = this;
    await db.members
      .where({ realmId: this.realmId, userId: db.cloud.currentUserId })
      .delete();
  }

  async delete() {
    const { db } = this;
    await db.transaction(
      'rw',
      [db.todoLists, db.todoItems, db.members, db.realms],
      () => {
        // Delete todo items
        db.todoItems
          .where({
            todoListId: this.id,
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
}
