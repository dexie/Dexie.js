import React, { Component } from 'react';
import './App.css';

import db from './db';
import AddTodo from './AddTodo';
import TodoList from './TodoList';

class App extends Component {
  constructor() {
    super();
    this.state = { todos: [] };
    this.handleAddTodo = this.handleAddTodo.bind(this);
    this.handleDeleteTodo = this.handleDeleteTodo.bind(this);
    this.handleToggleTodo = this.handleToggleTodo.bind(this);
  }

  componentDidMount() {
    db.table('todos')
      .toArray()
      .then((todos) => {
        this.setState({ todos });
      });
  }

  handleAddTodo(title) {
    const todo = {
      title,
      done: false,
    };
    db.table('todos')
      .add(todo)
      .then((id) => {
        const newList = [...this.state.todos, Object.assign({}, todo, { id })];
        this.setState({ todos: newList });
      });
  }

  handleToggleTodo(id, done) {
    db.table('todos')
      .update(id, { done })
      .then(() => {
        const todoToUpdate = this.state.todos.find((todo) => todo.id === id);
        const newList = [
          ...this.state.todos.filter((todo) => todo.id !== id),
          Object.assign({}, todoToUpdate, { done })
        ];
        this.setState({ todos: newList });
      });
  }

  handleDeleteTodo(id) {
    db.table('todos')
      .delete(id)
      .then(() => {
        const newList = this.state.todos.filter((todo) => todo.id !== id);
        this.setState({ todos: newList });
      });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>React + Dexie Todo Example</h2>
        </div>
        <AddTodo handleAddTodo={this.handleAddTodo} />
        <TodoList
          todos={this.state.todos}
          handleToggleTodo={this.handleToggleTodo}
          handleDeleteTodo={this.handleDeleteTodo}
        />
      </div>
    );
  }
}

export default App;
