import { db } from "./db";

export async function populate() {
  const todoListId = await db.todoLists.add({
    title: "To Do Today"
  });
  await db.todoItems.bulkAdd([
    {
      todoListId,
      title: "Feed the birds"
    },
    {
      todoListId,
      title: "Watch a movie"
    },
    {
      todoListId,
      title: "Have some sleep"
    }
  ]);
}
