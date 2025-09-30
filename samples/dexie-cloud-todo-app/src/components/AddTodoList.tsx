import { List, Plus } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "../db";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export function AddTodoList() {
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState("");
  const hasAnyList = useLiveQuery(async () => {
    const listCount = await db.todoLists.count();
    return listCount > 0;
  });

  const handleSubmit = () => {
    if (title.trim()) {
      db.todoLists.add({ title: title.trim() });
      setTitle("");
      setIsActive(false);
    }
  };

  return !isActive ? (
    <Button 
      onClick={() => setIsActive(true)}
      size="lg"
      variant="outline"
      className="w-full sm:w-auto flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
    >
      <List className="h-4 w-4" />
      {hasAnyList ? `Add another list` : `Create ToDo List`}
    </Button>
  ) : (
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Todo List
        </CardTitle>
        <CardDescription>Give your list a name to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          autoFocus
          placeholder="Name of list..."
          value={title}
          onChange={(ev) => setTitle(ev.target.value)}
          onKeyUp={(ev) => {
            if (ev.key === "Enter") {
              handleSubmit();
            } else if (ev.key === "Escape") {
              setIsActive(false);
              setTitle("");
            }
          }}
        />
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create List
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsActive(false);
              setTitle("");
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
