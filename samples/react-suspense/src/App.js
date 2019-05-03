import React, { useCallback, useState } from 'react';
import { Observe } from 'react-observe';
import './App.css';

import db from './db';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';

export const App = () => {
  // State
  const [error, setError] = useState(null);
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);

  // View
  return <Observe>
    <div className="App">
      <div className="App-header">
        <h2>React Suspense + Dexie Todo Example</h2>
      </div>

      <AddTodo handleAddTodo={title =>
        db.todos.add({title, done: 0}).catch(setError)} />

      <div>
        <input
          type="checkbox"
          checked={showCompletedTodos}
          onChange={ev => setShowCompletedTodos(ev.target.checked)}
        />
        <span>Show completed</span>
      </div>
      
      <TodoList
        todos={showCompletedTodos ?
          db.todos.orderBy('done') : // List undone first, then by date/time
          db.todos.where({done: 0})  // List only undone
        }
        
        handleToggleTodo={(id, done) =>
          db.todos.update(id, {done}).catch(setError)}

        handleDeleteTodo={id =>
          db.todos.delete(id).catch(setError)}
          
      />

      {error && <div className="error">
        <p>An error has occurred: {error}</p>
        <button onClick={()=>setError(null)}>Got it!</button>
      </div>}

    </div>
  </Observe>
}
