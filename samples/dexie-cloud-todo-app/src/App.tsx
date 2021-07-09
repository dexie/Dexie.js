import React from 'react';
import { TodoLists } from './components/TodoLists';
import { AddTodoList } from './components/AddTodoList';
import { ResetDatabaseButton } from './components/ResetDatabaseButton';
import { NavBar } from './components/navbar/NavBar';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div>
      <NavBar />
      <TodoLists />
      <AddTodoList />
      <ResetDatabaseButton />
    </div>
  );
}

export default App;
