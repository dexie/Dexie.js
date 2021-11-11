import { Entity } from 'dexie';
import type { TodoDB } from './TodoDB';

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

  id?: string;
  realmId?: string;
  title!: string;

  //
  // Methods
  //

  isSharable() {
    return this.id === this.realmId;
  }

  async makeSharable() {
    const currentRealmId = this.realmId;
    const newRealmId = this.id;

    await this.db.transaction('rw', 'todoLists', 'todoItems', async (tx) => {
      // "Realmify entity" (setting realmId equals own id will make it become a Realm)
      await tx.todoLists.update(this.id!, { realmId: newRealmId });
      // Move all todo items into the new realm consistently (modify() is consistent across sync peers)
      await tx.todoItems
        .where({
          realmId: currentRealmId,
          todoListId: this.id,
        })
        .modify({ realmId: newRealmId });
    });
  }

  async makePrivate() {
    await this.db.transaction(
      'rw',
      ['todoLists', 'todoItems', 'members'],
      async (tx) => {
        // Move todoItems out of the realm in a sync-consistent operation:
        await tx.todoItems
          .where({
            realmId: this.id, // This critera may seem ambigious, but it will optimize the sync operation.
            todoListId: this.id,
          })
          .modify({ realmId: this.db.cloud.currentUserId });
          
        // Remove all access (Collection.delete() is a sync-consistent operation)
        await tx.members.where('realmId').equals(this.id!).delete();
        
        // Move the todoList back into your private realm:
        await tx.todoLists.update(this.id!, {
          realmId: this.db.cloud.currentUserId,
        });


      }
    );
  }

  async shareWith(name: string, email: string, sendEmail: boolean) {
    await this.db.transaction('rw', 'members', 'todoLists', 'todoItems', async ()=>{
      if (!this.isSharable()) {
      
        await this.makeSharable();
      }

      // Add given name and email as a member with full permissions
      await this.db.members.add({
        realmId: this.id,
        name,
        email,
        invite: sendEmail,
        permissions: { add: ["todoItems"], update: {todoItems: ["done"]} },
      });
    });
  }

  async unshareWith(email: string) {
    await this.db.transaction('rw', 'members', 'todoLists', 'todoItems', async ()=>{
      await this.db.members
        .where({
          realmId: this.id,
          email,
        })
        .delete();
      const numMembers = await this.db.members.where({realmId: this.id}).count();
      if (numMembers === 0) {
        await this.makePrivate();
      }
    });
  }

  async delete() {
    await this.db.transaction(
      'rw',
      ['members', 'todoItems', 'todoLists'],
      (tx) => {
        tx.members.where({ realmId: this.id }).delete(); // Remove access if we are shared
        tx.todoItems.where({ todoListId: this.id }).delete(); // Delete todo items
        tx.todoLists.delete(this.id!); // Delete the list
      }
    );
  }
}
