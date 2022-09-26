<template>
  <div class="todo-list">
    <div class="select-order-group" role="group" aria-label="Update order">
      <span class="select-order-header" aria-hidden="true">Update order</span>
      <!-- [TODO] Define sort events these buttons will emit when we add the
           database.js file -->
      <button aria-label="oldest first" @click="sortTodos(forwardOrder)">
        🦖 Oldest first
      </button>
      <button aria-label="newest first" @click="sortTodos(reverseOrder)">
        🛸 Newest first
      </button>
      <button
        aria-label="unfinished first"
        @click="sortTodos(unfinishedFirstOrder)"
      >
        🚧 Unfinished first
      </button>
    </div>
    <ul>
      <Todo
        v-for="todo in todos"
        :key="todo.id"
        :todoID="todo.id"
        :text="todo.text"
        :done="todo.done"
        @toggle-todo="toggleTodo"
        @delete-todo="deleteTodo"
      />
    </ul>
  </div>
</template>

<script setup>
import Todo from './Todo.vue';
import { forwardOrder, reverseOrder, unfinishedFirstOrder } from '../database';

defineProps(['todos']);

const emits = defineEmits(['toggle-todo', 'delete-todo', 'sort-todos']);

// toggleTodo emits an event to toggle a todo between finished and
// unfinished.
function toggleTodo(togglePayload) {
  emits('toggle-todo', togglePayload);
}

// deleteTodo emits an event to delete a todo of the given ID
function deleteTodo(deletePayload) {
  emits('delete-todo', deletePayload);
}

// sortTodo emits an event to sort the todo list by a given order.
function sortTodos(order) {
  emits('sort-todos', { order: order });
}
</script>

<style scoped>
.todo-list {
  margin-top: 20px;
}

.select-order-group {
  font-size: 18px;
}

.select-order-group button {
  margin-left: 10px;
}
</style>
