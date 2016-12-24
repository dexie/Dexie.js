import { connect } from 'react-redux';

import App from '../components/App';

import {
  addTodo,
  updateTodo,
  deleteTodo,
} from '../actions';

function mapStateToProps(state) {
  const { todos } = state;
  return {
    todos,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    handleAddTodo(title) {
      dispatch(addTodo(title));
    },
    handleDeleteTodo(id) {
      dispatch(deleteTodo(id));
    },
    handleUpdateTodo(id, done) {
      dispatch(updateTodo(id, done));
    },
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);
