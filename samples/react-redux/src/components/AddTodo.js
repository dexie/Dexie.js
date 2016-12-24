import React, { PropTypes, Component } from 'react';

class AddTodo extends Component {
  constructor() {
    super();
    this.state = {value: ''};
    this.addTodo = this.addTodo.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  addTodo() {
    this.props.handleAddTodo(this.state.value);
  }

  handleChange(newValue) {
    this.setState({value: newValue});
  }

  render() {
    return (<div>
      <input type="text" value={this.state.value} onChange={(e) => this.handleChange(e.target.value)} />
      <button type="button" onClick={this.addTodo}>Add Todo</button>
    </div>);
  }
}

AddTodo.propTypes = {
  handleAddTodo: PropTypes.func.isRequired,
};

export default AddTodo;
