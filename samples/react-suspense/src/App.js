import React, { useCallback, useState } from 'react';
import { Observe } from 'react-observe';
import './App.css';

import db from './db';
import { AddTodo } from './AddTodo';
import { TodoList } from './TodoList';
import { ErrorBoundary } from './ErrorBoundary';

export const App = () => {
  // State
  const errorBoundary = useRef(null);
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);

  // Create a query depending on whether showCompletedTodos was checked or not:
  const todoQuery = showCompletedTodos ?
    db.todos.orderBy('done') : // List undone first, then by date/time
    db.todos.where({done: 0})  // List only undone

  // View
  return <div className="App">
    <ErrorBoundary ref={errorBoundary}>
      <React.Suspense fallback={<p>Loading...</p>}>
        <div className="App-header">
          <h2>React Suspense + Dexie Todo Example</h2>
        </div>

        <AddTodo handleAddTodo={title =>
          db.todos.add({title, done: 0}).catch(errorBoundary.handleError)} />

        <div>
          <input
            type="checkbox"
            checked={showCompletedTodos}
            onChange={ev => setShowCompletedTodos(ev.target.checked)}
          />
          <span>Show completed</span>
        </div>
        
        <TodoList
          todoQuery={todoQuery}
          
          handleToggleTodo={(id, done) =>
            db.todos.update(id, {done}).catch(errorBoundary.handleError)}

          handleDeleteTodo={id =>
            db.todos.delete(id).catch(errorBoundary.handleError)}
            
        />
      </React.Suspense>
    </ErrorBoundary>
  </div>

}
