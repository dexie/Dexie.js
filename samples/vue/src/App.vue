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
      order: forwardOrder,
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
      this.updateTodos(false);
    },

    // toggleTodo toggles the todo with the ID passed in between complete and
    // incomplete in the database and ultimately the displayed to-do list.
    async toggleTodo(togglePayload) {
      await this.db.setTodoDone(togglePayload.id, togglePayload.done);
      this.updateTodos(false);
    },

    // deleteTodo deletes the todo with the ID passed in from the database and
    // ultimately the displayed to-do list.
    async deleteTodo(deletePayload) {
      await this.db.deleteTodo(deletePayload.id);
      this.updateTodos(false);
    },

    // updateTodoOrder retrieves todos from the database in the order passed
    // in, changing their order in the displayed to-do list.
    updateTodoOrder(sortTodosPayload) {
      this.order = sortTodosPayload.order;
      this.updateTodos(true);
    },

    // updateTodos retrieves todos from the database, updating the displayed
    // list.
    async updateTodos(orderUpdated) {
      let todos = await this.db.getTodos(this.order);

      if (orderUpdated) {
        this.todos = todos;
        return
      }

      // if we are not updating the order of the todos, then we update the
      // todos in place. The reason for this is because if we are in
      // "unfinished first" order, then we don't want to-dos to suddenly bounce
      // in the to-do list because the task at the top of the to-do list
      // became marked as finished, which would reduce accessibility.
      let idToIndex = {};
      for (let i = 0; i < this.todos.length; i++) {
        idToIndex[this.todos[i].id] = i;
      }
      this.todos = todos.sort((a, b) => {
        // handle new items
        if (idToIndex[a.id] == undefined) {
          return 1;
        } else if (idToIndex[b.id] == undefined) {
          return -1;
        }
        
        return idToIndex[a.id] < idToIndex[b.id] ? -1 : 1;
      })
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
