import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { TodoListView } from "./TodoListView";

export function TodoLists() {
  const lists = useLiveQuery(
    () => db.todoLists
      .reverse() // Show newest lists first
      .toArray()
  );
  if (!lists) return null;

  return (
    <div className="w-full">
      {lists.map((list, i) => (
        <TodoListView key={list.id} todoList={list} autoFocus={i === 0} />
      ))}
    </div>
  );
}
