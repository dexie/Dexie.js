<template>
  <div role="group" aria-label="Add todo">
    <input type="text" v-model="value" />
    <button type="button" @click="addTodo">Add Todo</button>
  </div>
</template>

<script>
export default {
  name: 'AddTodo',
  components: {},
  data() {
    return {
      value: '',
    }
  },
  methods: {
    // addTodo emits an event to add a todo to the todo list.
    addTodo() {
      this.$emit('add-todo', { text: this.value });
      this.value = '';
    }
  }
}
</script>
