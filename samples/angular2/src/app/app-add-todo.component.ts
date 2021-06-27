import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-add-todo',
  template: `
    <input type="text" [(ngModel)]="title"/>
    <button type="button" (click)="onAddTodo()">Add Todo</button>
  `,
})
export class AddTodoComponent {
  @Output() addTodo = new EventEmitter();
  title = '';

  onAddTodo() {
    this.addTodo.emit(this.title);
  }
}
