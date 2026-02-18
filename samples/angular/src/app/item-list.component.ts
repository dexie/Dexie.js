// item-list.component.ts - Todo list component (standalone, zoneless)
import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { liveQuery } from 'dexie';
import { db, TodoItem, TodoList } from './db';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="todo-list">
      <h2>{{ todoList().title }}</h2>

      <ul>
        @for (item of items(); track item.id) {
          <li [class.done]="item.done">
            <label>
              <input
                type="checkbox"
                [checked]="item.done"
                (change)="toggleItem(item)"
              />
              {{ item.title }}
            </label>
            <button class="delete" (click)="deleteItem(item.id)">×</button>
          </li>
        } @empty {
          <li class="empty">No items yet</li>
        }
      </ul>

      <form (ngSubmit)="addItem()">
        <input
          type="text"
          [(ngModel)]="newItemTitle"
          name="itemTitle"
          placeholder="Add new item..."
        />
        <button type="submit">Add</button>
      </form>

      <button class="delete-list" (click)="deleteList()">
        Delete List
      </button>
    </section>
  `,
  styles: [`
    .todo-list {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    h2 {
      margin: 0 0 1rem;
      font-size: 1.25rem;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem;
    }
    li {
      display: flex;
      align-items: center;
      padding: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    li.done label {
      text-decoration: line-through;
      color: #9ca3af;
    }
    li.empty {
      color: #9ca3af;
      font-style: italic;
    }
    label {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    form {
      display: flex;
      gap: 0.5rem;
    }
    input[type="text"] {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #d1d5db;
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
    .delete {
      background: transparent;
      color: #ef4444;
      padding: 0.25rem 0.5rem;
    }
    .delete:hover {
      background: #fee2e2;
    }
    .delete-list {
      margin-top: 1rem;
      background: #ef4444;
      width: 100%;
    }
    .delete-list:hover {
      background: #dc2626;
    }
  `],
})
export class ItemListComponent {
  // Signal input (Angular 17+)
  todoList = input.required<TodoList>();

  newItemTitle = '';

  // Computed signal that depends on todoList input
  private todoListId = computed(() => this.todoList().id);

  // LiveQuery as signal - reacts to todoListId changes
  items = toSignal(
    from(liveQuery(() => 
      db.todoItems.where({ todoListId: this.todoListId() }).toArray()
    )),
    { initialValue: [] as TodoItem[] }
  );

  async addItem() {
    const title = this.newItemTitle.trim();
    if (!title) return;
    await db.todoItems.add({
      todoListId: this.todoListId(),
      title,
      done: false,
    });
    this.newItemTitle = '';
  }

  async toggleItem(item: TodoItem) {
    await db.todoItems.update(item.id, { done: !item.done });
  }

  async deleteItem(id: number) {
    await db.todoItems.delete(id);
  }

  async deleteList() {
    // Delete all items in this list, then the list itself (atomically)
    await db.transaction('rw', db.todoItems, db.todoLists, async () => {
      await db.todoItems.where({ todoListId: this.todoListId() }).delete();
      await db.todoLists.delete(this.todoListId());
    });
  }
}
