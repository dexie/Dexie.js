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
  const [isHovering, setIsHovering] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isHovering) {
      setShowTrash(true);
      // Efter 2 sekunder av hover, börja fade out
      timer = setTimeout(() => {
        setShowTrash(false);
      }, 2000);
    } else {
      setShowTrash(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHovering]);

  const resetTimer = () => {
    if (isHovering) {
      setShowTrash(true);
      // Trigger en re-render av useEffect genom att sätta isHovering
      setIsHovering(false);
      setTimeout(() => setIsHovering(true), 10);
    }
  };
  
  const handleToggle = (checked: boolean) => {
    db.todoItems.update(item.id, {
      done: checked,
    });
  };

  const handleDelete = async () => {
    await db.todoItems.delete(item.id!);
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-3 py-3 px-4 border-b border-blue-200/60 last:border-b-0 transition-colors",
        item.done 
          ? "bg-blue-50 dark:bg-blue-900/20" 
          : "bg-background hover:bg-muted/30"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={resetTimer}
    >
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
          "w-6 h-6 border-2 rounded flex items-center justify-center transition-all duration-200",
          item.done 
            ? "bg-blue-500 border-blue-500 text-white shadow-sm" 
            : "border-gray-300 hover:border-blue-400 bg-white",
          !can.update('done') && "opacity-50 cursor-not-allowed"
        )}>
          {item.done && (
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            </svg>
          )}
        </div>
      </label>
      
      <div className={cn(
        "flex-1 text-sm leading-relaxed",
        item.done ? "text-foreground/80" : "text-foreground"
      )}>
        {item.title}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        disabled={!can.delete()}
        onClick={handleDelete}
        title="Delete item"
        className={cn(
          "h-8 w-8 text-muted-foreground hover:text-destructive transition-all duration-300",
          showTrash 
            ? "opacity-100 translate-x-0" 
            : "opacity-0 translate-x-2 pointer-events-none"
        )}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
