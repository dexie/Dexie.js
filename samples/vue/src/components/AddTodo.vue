<template>
  <div role="group" aria-label="Add todo">
    <input type="text" v-model="value" />
    <button type="button" @click="addTodo">Add Todo</button>
  </div>
</template>

<script setup>
// vue reactivityTransform details on https://vuejs.org/guide/extras/reactivity-transform.html
let value = $ref();
const emits = defineEmits(['add-todo']);
// addTodo emits an event to add a todo to the todo list.
function addTodo() {
  emits('add-todo', { text: value });
  value = '';
}
</script>
