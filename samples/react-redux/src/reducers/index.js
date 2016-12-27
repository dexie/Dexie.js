import {
  LOAD_TODOS,
  ADD_TODO,
  UPDATE_TODO,
  DELETE_TODO,
} from '../constants';

export default function (state, { type, payload }) {
  switch (type) {
    case LOAD_TODOS: return { todos: payload };
    case ADD_TODO: return { todos: [...state.todos, payload] };
    case UPDATE_TODO: {
      const todoToUpdate = state.todos.find((todo) => todo.id === payload.id);
      return { todos: [
        ...state.todos.filter((todo) => todo.id !== payload.id),
        Object.assign({}, todoToUpdate, { done: payload.done }),
      ] };
    }
    case DELETE_TODO: return { todos: state.todos.filter((todo) => todo.id !== payload) };
    default: return state;
  }
}
