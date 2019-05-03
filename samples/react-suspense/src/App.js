import React, { useCallback, useState } from 'react';
import { Observe } from 'fiberlib-react';
import './App.css';

import db from './db';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';

export const App = () => {
  // State
  const [showCompleted, setShowCompleted] = useState(false);
  const [error, setError] = useState(null);

  // View
  return <Observe>
    <div className="App">
      <div className="App-header">
        <h2>React Suspense + Dexie Todo Example</h2>
      </div>

      {error && <div className="error">
        <p className="error">An error occurred: {error}</p>
        <button onClick={()=>setError(null)}>Got it!</button>
      </div>}

      <AddTodo handleAddTodo={title =>
        db.todos.add({title, done: 0}).catch(setError)} />

      <div>
        <input
          type="checkbox"
          checked={showCompleted}
          onChange={ev => setShowCompleted(ev.target.checked)}
        />
        <span>Show completed</span>
      </div>
      
      <TodoList todos={
        showCompleted ?
          db.todos.orderBy('done') :
          db.todos.where({done: 0})
        }
        handleToggleTodo={(id, done) =>
          db.todos.update(id, {done}).catch(setError)}
        handleDeleteTodo={id =>
          db.todos.delete(id).catch(setError)}
      />

    </div>
  </Observe>
}
