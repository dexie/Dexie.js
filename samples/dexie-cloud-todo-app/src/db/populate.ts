import { TodoDB } from './TodoDB';

export function populate(db: TodoDB) {
  // SHOWCASE FOR "Private IDs"!
  //
  // What is Private IDs?
  //
  // Private IDs are primary keys that are prefixed with '#'.
  // Private IDs are suffixed with userID on server so that they only need to be unique per user.
  // They solve problems that occurs when unknown (not logged in) user needs to create objects only once
  // and avoid same object being created multiple times on different devices before authenticating.
  // Objects with private IDs should not be shared due to that external references to them will
  // not be the same for the owners and external users.

  // Use case that shows why we're using private IDs here:
  //
  // On device A:
  // 1. Alice launches the app first time on this device
  // 2. These default items are populated on local db
  // 3. Alice adds some more items to this list (with normal IDs)
  // 4. Alice logs in --> items are synced to cloud as '#privateId:aliceUserId'

  // On device B:
  // 1. Alice launches the app first time on this device
  // 2. These default items are populated on local db
  // 3. Alice logs in --> items are synced to cloud and replaces existing ones for Alice
  //    but that does not matter as they have the same IDs. The items that
  //    Alice added on other device is now synced back.

  // Private IDs are possible to test but does not behave optimally yet (as of 2021-12-19)
  // Need to refine how they sync before using them by default.
  // If you want to try, uncomment the code below:
  /*const todoListId = `#tdl-defaultTodoList`;
  return db.transaction('rw', db.todoLists, db.todoItems, () => {
    db.todoLists.add({
      id: todoListId,
      title: 'To Do Today',
    });
    db.todoItems.bulkAdd([
      {
        id: '#tdi-defaultItem001',
        title: 'Feed the birds',
        todoListId,
      },
      {
        id: '#tdi-defaultItem002',
        title: 'Watch a movie',
        todoListId,
      },
      {
        id: '#tdi-defaultItem003',
        title: 'Have some sleep',
        todoListId,
      },
    ]);
  });*/
}
