import { useState } from 'react';
import { useLiveQuery, usePermissions } from 'dexie-react-hooks';
import { TodoList } from '../db/TodoList';
import { db } from '../db';
import { TodoItemView } from './TodoItemView';
import { AddTodoItem } from './AddTodoItem';
import { Share2, Trash2 } from 'lucide-react';
import { SharingForm } from './access-control/SharingForm';
import { usePersistedOpenState } from '../helpers/usePersistedOpenState';
import { Button } from './ui/button';
import { handleError } from '../helpers/handleError';
import { cn } from '../lib/utils';

interface Props {
  todoList: TodoList;
  autoFocus?: boolean;
}

export function TodoListView({ todoList, autoFocus }: Props) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const items = useLiveQuery(
    () => db.todoItems
      .where({ todoListId: todoList.id })
      .reverse() // Show newest items first
      .toArray(),
    [todoList.id]
  );
  const can = usePermissions(todoList);
  const [showInviteForm, setShowInviteForm] = usePersistedOpenState('sharing-menu', todoList.id, false);

  if (!items) return null;

  const handleDelete = async () => {
    const confirmed = confirm(`Are you sure you want to delete "${todoList.title}" and all its items?`);
    if (confirmed) {
      await todoList.deleteList();
    }
  };

  const handleStartTitleEdit = () => {
    if (can.update('title')) {
      setIsEditingTitle(true);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditingTitle(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="border-b border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-blue-300/70 bg-blue-500 dark:bg-blue-600">
        {/* Editable Title */}
        <div className="flex-1 mr-4">
          {isEditingTitle ? (
            <input
              type="text"
              defaultValue={todoList.title}
              onChange={handleError(
                (ev) => db.todoLists.update(todoList.id, { title: ev.target.value })
              )}
              onKeyDown={handleTitleKeyDown}
              onBlur={() => setIsEditingTitle(false)}
              autoFocus
              className={cn(
                "text-lg font-semibold bg-transparent border-none outline-none focus:ring-1 focus:ring-white/50 rounded px-2 py-1 text-white placeholder-white/70 w-full"
              )}
            />
          ) : (
            <h2
              className={cn(
                "text-lg font-semibold text-white cursor-pointer hover:bg-white/10 rounded px-2 py-1 transition-colors",
                !can.update('title') && "cursor-default hover:bg-transparent"
              )}
              onClick={handleStartTitleEdit}
              title={can.update('title') ? "Click to edit list name" : undefined}
            >
              {todoList.title}
            </h2>
          )}
        </div>
        <div className="flex items-center gap-2">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInviteForm(!showInviteForm)}
            title="Share list"
            className={cn(
              "text-white hover:bg-blue-600 transition-all duration-200",
              showInviteForm && "bg-blue-600/50"
            )}
          >
            <Share2 className={cn(
              "h-4 w-4 transition-transform duration-200",
              showInviteForm && "rotate-180"
            )} />
          </Button>

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
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showInviteForm
            ? "max-h-[600px] opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 py-4 bg-blue-50/70 dark:bg-blue-900/15 border-b border-blue-200/60">
          <SharingForm todoList={todoList} />
        </div>
      </div>

      {/* Todo Items */}
      <div className="px-0 py-0">
        {can.add('todoItems') && (
          <div className="px-4 py-3 border-b border-blue-200/60 bg-background">
            <AddTodoItem todoList={todoList} autoFocus={autoFocus} />
          </div>
        )}
        {items.map((item) => (
          <TodoItemView key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
