// app.component.ts - Main app component (standalone)
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { liveQuery } from 'dexie';
import { db, TodoList } from './db';
import { ItemListComponent } from './item-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ItemListComponent],
  template: `
    <main>
      <h1>Dexie.js + Angular Todo App</h1>

      @for (list of todoLists(); track list.id) {
        <app-item-list [todoList]="list" />
      }

      <form (ngSubmit)="addNewList()">
        <input
          type="text"
          [(ngModel)]="newListName"
          name="listName"
          placeholder="New list name..."
        />
        <button type="submit">Add List</button>
      </form>
    </main>
  `,
  styles: [`
    main {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
      font-family: system-ui, sans-serif;
    }
    form {
      margin-top: 2rem;
      display: flex;
      gap: 0.5rem;
    }
    input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button {
      padding: 0.5rem 1rem;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #4338ca;
    }
  `],
})
export class AppComponent {
  newListName = '';

  // Convert Dexie's liveQuery observable to Angular signal
  todoLists = toSignal(
    from(liveQuery(() => db.todoLists.toArray())),
    { initialValue: [] as TodoList[] }
  );

  async addNewList() {
    if (!this.newListName.trim()) return;
    await db.todoLists.add({ title: this.newListName });
    this.newListName = '';
  }
}
