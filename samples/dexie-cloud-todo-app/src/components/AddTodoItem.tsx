import { useState } from 'react';
import { db } from '../db';
import { TodoItem } from '../db/TodoItem';
import { TodoList } from '../db/TodoList';
import { Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface Props {
  todoList: TodoList;
  autoFocus?: boolean;
}

export function AddTodoItem({ todoList, autoFocus }: Props) {
  const [title, setTitle] = useState('');

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (title.trim()) {
      await db.todoItems.add({
        todoListId: todoList.id,
        realmId: todoList.realmId,
        title: title.trim(),
      });
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="Add todo item ..."
          value={title}
          autoFocus={autoFocus}
          onChange={(ev) => setTitle(ev.target.value)}
        />
      </div>
      <Button 
        type="submit" 
        size="icon"
        disabled={!title.trim()}
        title="Add item"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
