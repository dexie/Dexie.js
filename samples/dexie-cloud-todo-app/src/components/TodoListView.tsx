import { useLiveQuery, usePermissions } from 'dexie-react-hooks';
import { TodoList } from '../db/TodoList';
import { db } from '../db';
import { TodoItemView } from './TodoItemView';
import { AddTodoItem } from './AddTodoItem';
import { Share2, Trash2 } from 'lucide-react';
import { SharingForm } from './access-control/SharingForm';
import { usePersistedOpenState } from '../helpers/usePersistedOpenState';
import { Button } from './ui/button';

interface Props {
  todoList: TodoList;
}

export function TodoListView({ todoList }: Props) {
  const items = useLiveQuery(
    () => db.todoItems.where({ todoListId: todoList.id }).toArray(),
    [todoList.id]
  );
  const can = usePermissions(todoList);
  const [showInviteForm, setShowInviteForm] = usePersistedOpenState('sharing-menu', todoList.id, false);

  if (!items) return null;

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${todoList.title}" and all its items?`);
    if (confirmed) {
      await todoList.delete();
    }
  };

  return (
    <div className="border-b border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-blue-300/70 bg-blue-500 dark:bg-blue-600">
        <h2 className="text-lg font-semibold text-white">{todoList.title}</h2>
        <div className="flex items-center gap-2">
          {!todoList.isPrivate() && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowInviteForm(!showInviteForm)}
              title="Share list"
              className="text-white hover:bg-blue-600"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          {can.delete() && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              title="Delete list"
              className="text-white hover:bg-blue-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Sharing Form */}
      {showInviteForm && (
        <div className="px-4 py-4 bg-blue-50/70 dark:bg-blue-900/15 border-b border-blue-200/60">
          <SharingForm todoList={todoList} />
        </div>
      )}
      
      {/* Todo Items */}
      <div className="px-0 py-0">
        {items.map((item) => (
          <TodoItemView key={item.id} item={item} />
        ))}
        {can.add('todoItems') && (
          <div className="px-4 py-3 border-b border-blue-200/60 bg-background">
            <AddTodoItem todoList={todoList} />
          </div>
        )}
      </div>
    </div>
  );
}
