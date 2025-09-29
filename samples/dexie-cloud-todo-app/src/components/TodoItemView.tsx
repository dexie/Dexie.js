import { useEffect, useState } from 'react';
import { db } from '../db';
import { TodoItem } from '../db/TodoItem';
import { Trash2 } from 'lucide-react';
import { usePermissions } from 'dexie-react-hooks';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface Props {
  item: TodoItem;
}

export function TodoItemView({ item }: Props) {
  const can = usePermissions(db, 'todoItems', item);
  
  const handleToggle = (checked: boolean) => {
    db.todoItems.update(item.id, {
      done: checked,
    });
  };

  const handleDelete = async () => {
    await db.todoItems.delete(item.id!);
  };

  return (
    <div className={cn(
      "group flex items-center gap-3 py-2 px-1 border-b border-border/50 last:border-b-0",
      item.done && "opacity-60"
    )}>
      {/* Custom Checkbox */}
      <label className="relative flex items-center cursor-pointer">
        <input
          type="checkbox"
          disabled={!can.update('done')}
          checked={!!item.done}
          onChange={(ev) => handleToggle(ev.target.checked)}
          className="sr-only"
        />
        <div className={cn(
          "w-5 h-5 border-2 rounded flex items-center justify-center transition-colors",
          item.done 
            ? "bg-primary border-primary text-primary-foreground" 
            : "border-border hover:border-primary",
          !can.update('done') && "opacity-50 cursor-not-allowed"
        )}>
          {item.done && (
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          )}
        </div>
      </label>
      
      <div className={cn(
        "flex-1 text-sm leading-relaxed",
        item.done && "text-muted-foreground"
      )}>
        {item.title}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        disabled={!can.delete()}
        onClick={handleDelete}
        title="Delete item"
        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
