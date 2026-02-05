import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { liveQuery } from 'dexie';
import { Observable, from } from 'rxjs';
import { db, populateDatabase, resetDatabase, type TodoList } from '../db/db';
import { ItemListComponent } from './item-list.component';

/**
 * Main application component demonstrating Dexie.js with Angular
 *
 * This component shows how to:
 * - Use liveQuery() with Angular's async pipe for reactive updates
 * - Perform CRUD operations on IndexedDB via Dexie
 * - Structure an Angular application with Dexie
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemListComponent],
  template: `
    <h1>Dexie.js with Angular Demo</h1>

    <div class="add-form">
      <input
        type="text"
        [(ngModel)]="newListTitle"
        placeholder="New list title..."
        (keyup.enter)="addList()"
      />
      <button (click)="addList()">Add List</button>
      <button class="danger" (click)="reset()">Reset Database</button>
    </div>

    @if (todoLists$ | async; as lists) {
      @for (list of lists; track list.id) {
        <div class="todo-list">
          <h2>{{ list.title }}</h2>
          <app-item-list [listId]="list.id!" />
          <button class="secondary" (click)="deleteList(list.id!)">
            Delete List
          </button>
        </div>
      } @empty {
        <p>No todo lists yet. Add one above!</p>
      }
    }
  `,
})
export class AppComponent implements OnInit {
  /**
   * Observable of all todo lists, automatically updates when database changes
   * liveQuery() returns a native Observable that works seamlessly with Angular's async pipe
   */
  todoLists$: Observable<TodoList[]> = from(liveQuery(() => db.todoLists.toArray()));

  newListTitle = '';

  async ngOnInit(): Promise<void> {
    // Populate with sample data on first load
    await populateDatabase();
  }

  async addList(): Promise<void> {
    if (!this.newListTitle.trim()) return;

    await db.todoLists.add({
      title: this.newListTitle.trim(),
    });

    this.newListTitle = '';
  }

  async deleteList(id: number): Promise<void> {
    // Delete all items in the list first
    await db.todoItems.where('todoListId').equals(id).delete();
    // Then delete the list itself
    await db.todoLists.delete(id);
  }

  async reset(): Promise<void> {
    await resetDatabase();
  }
}
