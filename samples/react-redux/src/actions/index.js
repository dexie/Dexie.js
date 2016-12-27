import {
  LOAD_TODOS,
  ADD_TODO,
  UPDATE_TODO,
  DELETE_TODO,
} from '../constants';
import db from '../db';

export function loadTodos() {
  return (dispatch) => {
    db.table('todos')
      .toArray()
      .then((todos) => {
        dispatch({
          type: LOAD_TODOS,
          payload: todos,
        });
      });
  };
}

export function addTodo(title) {
  return (dispatch) => {
    const todoToAdd = { title, done: false };
    db.table('todos')
      .add(todoToAdd)
      .then((id) => {
         dispatch({
           type: ADD_TODO,
           payload: Object.assign({}, todoToAdd, { id }),
         });
      });
  }
}

export function deleteTodo(id) {
  return (dispatch) => {
    db.table('todos')
      .delete(id)
      .then(() => {
        dispatch({
          type: DELETE_TODO,
          payload: id,
        });
      });
  };
}

export function updateTodo(id, done) {
  return (dispatch) => {
    db.table('todos')
      .update(id, { done })
      .then(() => {
        dispatch({
          type: UPDATE_TODO,
          payload: { id, done },
        });
      });
  };
}
