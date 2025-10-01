import { useEffect, useState } from 'react';
import { db } from '../db';
import { TodoItem } from '../db/TodoItem';
import { Trash2 } from 'lucide-react';
import { usePermissions } from 'dexie-react-hooks';
import { Button } from './ui/button';
import { CheckedSign } from './ui/CheckedSign';
import { cn } from '../lib/utils';
import { handleError } from '../helpers/handleError';

interface Props {
  item: TodoItem;
}

export function TodoItemView({ item }: Props) {
  const can = usePermissions(db, 'todoItems', item);
  const [isHovering, setIsHovering] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleToggle = (checked: boolean) => {
    db.todoItems.update(item.id, {
      done: checked,
    });
  };

  const handleDelete = async () => {
    await db.todoItems.delete(item.id!);
  };

  const handleStartEdit = () => {
    if (can.update('title')) {
      setIsEditing(true);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
    }
  };

  useEffect(() => {
    // On hover, show trash icon only if user can delete. After 2 seconds of hover, start fading out.
    let timer: NodeJS.Timeout;
    
    if (isHovering && can.delete()) {
      setShowTrash(true);
      // After 2 seconds of hover, start fading out
      timer = setTimeout(() => {
        setShowTrash(false);
      }, 2000);
    } else {
      setShowTrash(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHovering, can]);

  const showTrashOnClick = (e: React.MouseEvent) => {
    // Show trash on any click within the item (for mobile users)
    if (can.delete()) {
      setShowTrash(true);
      // Reset hover state to trigger useEffect timer
      setIsHovering(false);
      setTimeout(() => setIsHovering(true), 10);
    }
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
      onClick={showTrashOnClick}
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
            <CheckedSign />
          )}
        </div>
      </label>
      
      {/* Editable Title */}
      <div className="flex-1">
        {isEditing ? (
          <input
            type="text"
            defaultValue={item.title}
            onChange={handleError(
                (ev) => db.todoItems.update(item.id, { title: ev.target.value })
            )}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className={cn(
              "w-full text-sm leading-relaxed bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5",
              item.done ? "text-foreground/80" : "text-foreground"
            )}
          />
        ) : (
          <div 
            className={cn(
              "text-sm leading-relaxed cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5 transition-colors",
              item.done ? "text-foreground/80" : "text-foreground",
              !can.update('title') && "cursor-default hover:bg-transparent"
            )}
            onClick={handleStartEdit}
            title={can.update('title') ? "Click to edit" : undefined}
          >
            {item.title}
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
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
