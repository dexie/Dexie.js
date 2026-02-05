# Dexie.js Angular Sample

This sample demonstrates how to use [Dexie.js](https://dexie.org) with Angular 19, featuring reactive database queries using `liveQuery()`.

## Features

- **Angular 19** with standalone components and modern control flow syntax (`@if`, `@for`)
- **Dexie v4** with typed EntityTables
- **Reactive updates** using `liveQuery()` with Angular's async pipe
- **Full CRUD operations** on IndexedDB

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200/` in your browser.

## Project Structure

```
src/
  db/
    db.ts           # Dexie database definition and helpers
  app/
    app.component.ts       # Main component with todo lists
    item-list.component.ts # Child component for list items
  main.ts          # Application bootstrap
  index.html       # HTML entry point
  styles.css       # Global styles
```

## Key Concepts

### Database Setup (`src/db/db.ts`)

```typescript
import Dexie, { type EntityTable } from 'dexie';

export interface TodoList {
  id?: number;
  title: string;
}

export class AppDatabase extends Dexie {
  todoLists!: EntityTable<TodoList, 'id'>;

  constructor() {
    super('TodoAngularSampleDB');
    this.version(1).stores({
      todoLists: '++id, title',
    });
  }
}

export const db = new AppDatabase();
```

### Using liveQuery with Angular (`src/app/app.component.ts`)

```typescript
import { liveQuery } from 'dexie';
import { Observable, from } from 'rxjs';

@Component({
  template: `
    @if (todoLists$ | async; as lists) {
      @for (list of lists; track list.id) {
        <div>{{ list.title }}</div>
      }
    }
  `,
})
export class AppComponent {
  // liveQuery returns an Observable that auto-updates when data changes
  todoLists$: Observable<TodoList[]> = from(
    liveQuery(() => db.todoLists.toArray())
  );
}
```

## Learn More

- [Dexie.js Documentation](https://dexie.org/docs/)
- [liveQuery() API](https://dexie.org/docs/liveQuery())
- [Angular Documentation](https://angular.dev/)

## Legacy Example

For reference, the original Angular 12 example is available at:
[stackblitz.com/edit/angular-ivy-4666q1](https://stackblitz.com/edit/angular-ivy-4666q1)
