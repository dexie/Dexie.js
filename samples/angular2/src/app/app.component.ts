import { Component, OnInit } from '@angular/core';

import { TodoWithID, Todo, TodosService } from './todos.service';

@Component({
  selector: 'app-root',
  template: `<div>
    <h1>Angular 2 + Dexie Todo Example</h1>
    <app-add-todo (addTodo)="onAddTodo($event)"></app-add-todo>
    <app-todo-list
      [todos]="todosList"
      (toggleTodo)="onToggleTodo($event)"
      (deleteTodo)="onDeleteTodo($event)"
    ></app-todo-list>
  </div>`,
})
export class AppComponent implements OnInit {
  todosList: Array<TodoWithID> = [];
  constructor(private todosService: TodosService) {}

  ngOnInit() {
    this.todosService.getAll().then((todos: Array<TodoWithID>) => {
      this.todosList = todos;
    });
  }

  onAddTodo(title: string) {
    const todo: Todo = {
      title,
      done: false,
    };
    this.todosService
      .add(todo)
      .then((id) => {
        this.todosList = [...this.todosList, Object.assign({}, todo, { id })];
      });
  }

  onToggleTodo({ id, done }: { id: number, done: boolean }) {
    this.todosService
      .update(id, { done })
      .then(() => {
        const todoToUpdate = this.todosList.find((todo) => todo.id === id);
        this.todosList = [...this.todosList.filter((todo) => todo.id !== id), Object.assign({}, todoToUpdate, { done })];
      });
  }

  onDeleteTodo(id: number) {
    this.todosService
      .remove(id)
      .then(() => {
        this.todosList = this.todosList.filter((todo) => todo.id !== id);
      });
  }
}
