<template>
  <li>
    <div role="group" :aria-label="titleLabel">
      <input
        type="checkbox"
        :checked="done"
        @change="toggleTodo"
      />
      <span
        :class="{ done: done }"
        :aria-label="titleLabel"
      >
        {{ text }}
      </span>
      <button type="button" @click="deleteTodo">Delete</button>
    </div>
  </li>
</template>

<script>
export default {
  name: 'Todo',
  props: ['todoID', 'text', 'done'],
  components: {},
  methods: {
    // toggleTodo emits an event to toggle this to-do between complete and
    // incomplete.
    toggleTodo() {
      this.$emit('toggle-todo', { id: this.todoID, done: !this.done });
    },

    // deleteTodo emits an event to delete this to-do.
    deleteTodo() {
      this.$emit('delete-todo', { id: this.todoID });
    }
  },
  computed: {
    titleLabel() {
      return this.done ?
        `${this.text} (completed task)` :
        this.text;
    }
  }
}
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