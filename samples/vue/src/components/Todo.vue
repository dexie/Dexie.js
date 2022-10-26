<template>
  <li>
    <div role="group" :aria-label="titleLabel">
      <input type="checkbox" :checked="done" @change="toggleTodo" />
      <span :class="{ done: done }" :aria-label="titleLabel">
        {{ text }}
      </span>
      <button type="button" @click="deleteTodo">Delete</button>
    </div>
  </li>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps(['todoID', 'text', 'done']);
const emits = defineEmits(['toggle-todo', 'delete-todo']);
// toggleTodo emits an event to toggle this to-do between complete and
// incomplete.
function toggleTodo() {
  emits('toggle-todo', { id: props.todoID, done: !props.done });
}

// deleteTodo emits an event to delete this to-do.
function deleteTodo() {
  emits('delete-todo', { id: props.todoID });
}

const titleLabel = computed(() => {
  return props.done ? `${props.text} (completed task)` : props.text;
});
</script>

<style scoped>
ul li {
  margin-top: 7px;
  list-style: none;
}

ul li button {
  margin-left: 7px;
}

.done {
  text-decoration: line-through;
}
</style>
