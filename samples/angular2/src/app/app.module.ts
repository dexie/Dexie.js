import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CoreModule } from './core/core.module';

import { AppComponent } from './app.component';
import { TodoListComponent } from './app-todo-list.component';
import { AddTodoComponent } from './app-add-todo.component';

import { TodosService } from './todos.service';

@NgModule({
  declarations: [
    AppComponent,
    TodoListComponent,
    AddTodoComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CoreModule,
  ],
  providers: [
    TodosService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
