<template>
  <div class="app">
    <div class="app-header">
      <h2>Vue + Dexie Todo Example</h2>
    </div>
    <AddTodo @addTodo="addTodo" />
    <TodoList
      :todos="todos"
      @toggle-todo="toggleTodo"
      @delete-todo="deleteTodo"
      @sort-todos="sortTodos"
    />
  </div>
</template>

<script>
import AddTodo from './components/AddTodo.vue';
import TodoList from './components/TodoList.vue';

export default {
  name: 'App',
  components: {
    AddTodo,
    TodoList,
  },
  data() {
    return {
      todos: [],
    }
  },
  methods: {
    // [TODO] Implement these methods once the Database class is written in the
    // following commit.

    // toggleTodo toggles the todo with the ID passed in between complete and
    // incomplete in the database and ultimately the displayed to-do list.
    toggleTodo() {},

    // deleteTodo deletes the todo with the ID passed in from the database and
    // ultimately the displayed to-do list.
    deleteTodo() {},

    // sortTodos retrieves todos from the database in the order passed in,
    // changing their order in the displayed to-do list.
    sortTodos() {},
  }
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
