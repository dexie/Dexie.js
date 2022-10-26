import React from 'react';
import { TodoLists } from './components/TodoLists';
import { AddTodoList } from './components/AddTodoList';
import { ResetDatabaseButton } from './components/ResetDatabaseButton';
import { NavBar } from './components/navbar/NavBar';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Invites } from './components/access-control/Invites';

function App() {
  return (
    <div>
      <NavBar />
      <Invites />
      <TodoLists />
      <AddTodoList />
      <ResetDatabaseButton />
    </div>
  );
}

export default App;
