import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { liveQuery } from 'dexie';
import { Observable, from, of } from 'rxjs';
import { db, type TodoItem } from '../db/db';

/**
 * Component for displaying and managing items within a todo list
 *
 * Demonstrates:
 * - Using liveQuery() with component inputs
 * - Updating queries when inputs change
 * - Toggling item completion status
 */
@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-form">
      <input
        type="text"
        [(ngModel)]="newItemTitle"
        placeholder="Add new item..."
        (keyup.enter)="addItem()"
      />
      <button (click)="addItem()">Add Item</button>
    </div>

    <ul>
      @if (items$ | async; as items) {
        @for (item of items; track item.id) {
          <li [class.item-done]="item.done">
            <label>
              <input
                type="checkbox"
                [checked]="item.done"
                (change)="toggleDone(item)"
              />
              {{ item.title }}
            </label>
            <button class="secondary" (click)="deleteItem(item.id!)">
              Delete
            </button>
          </li>
        } @empty {
          <li>No items in this list yet.</li>
        }
      }
    </ul>
  `,
})
export class ItemListComponent implements OnChanges {
  @Input({ required: true }) listId!: number;

  items$: Observable<TodoItem[]> = of([]);
  newItemTitle = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listId']) {
      // Update the liveQuery when listId changes
      this.items$ = from(
        liveQuery(() => db.todoItems.where('todoListId').equals(this.listId).toArray())
      );
    }
  }

  async addItem(): Promise<void> {
    if (!this.newItemTitle.trim()) return;

    await db.todoItems.add({
      todoListId: this.listId,
      title: this.newItemTitle.trim(),
      done: false,
    });

    this.newItemTitle = '';
  }

  async toggleDone(item: TodoItem): Promise<void> {
    await db.todoItems.update(item.id!, { done: !item.done });
  }

  async deleteItem(id: number): Promise<void> {
    await db.todoItems.delete(id);
  }
}
