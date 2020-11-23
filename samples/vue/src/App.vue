<template>
  <div class="app">
    <div class="app-header">
      <h2>Vue + Dexie Todo Example</h2>
    </div>
    <AddTodo @add-todo="addTodo" />
    <TodoList
      :todos="todos"
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
      @sort-todos="updateTodoOrder"
    />
  </div>
</template>

<script>
import AddTodo from './components/AddTodo.vue';
import TodoList from './components/TodoList.vue';

import { Database, forwardOrder } from './database.js';

export default {
  name: 'App',
  components: {
    AddTodo,
    TodoList,
  },
  data() {
    return {
      todos: [],
      sortOrder: forwardOrder,
    }
  },

  created() {
    this.db = new Database();
    this.updateTodos();
  },

  methods: {
    // addTodo adds a todo to the database and ultimately the displayed to-do
    // list.
    async addTodo(todo) {
      await this.db.addTodo(todo.text);
      this.updateTodos();
    },

    // toggleTodo toggles the todo with the ID passed in between complete and
    // incomplete in the database and ultimately the displayed to-do list.
    async toggleTodo(togglePayload) {
      await this.db.setTodoDone(togglePayload.id, togglePayload.done);
      this.updateTodos();
    },

    // deleteTodo deletes the todo with the ID passed in from the database and
    // ultimately the displayed to-do list.
    async deleteTodo(deletePayload) {
      await this.db.deleteTodo(deletePayload.id);
      this.updateTodos();
    },

    // updateTodoOrder retrieves todos from the database in the order passed
    // in, changing their order in the displayed to-do list.
    updateTodoOrder(sortTodosPayload) {
      this.order = sortTodosPayload.order;
      this.updateTodos();
    },

    // updateTodos retrieves todos from the database, updating the displayed
    // list.
    async updateTodos() {
      this.todos = await this.db.getTodos(this.order);
    },
  },
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}

.app {
  text-align: center;
}

.app-header {
  background-color: #222;
  height: 40px;
  padding: 20px;
  margin-bottom: 40px;
  color: white;
}
</style>
