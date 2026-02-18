# Dexie.js + Angular Example

A modern Angular Todo app demonstrating Dexie.js with:

- **Angular 19+** with standalone components
- **Signal-based reactivity** using `toSignal()` from `@angular/core/rxjs-interop`
- **New control flow syntax** (`@for`, `@if`, `@empty`)
- **Signal inputs** (`input.required<T>()`)
- **Dexie's `liveQuery()`** for reactive database queries
- **EntityTable** for typed table access

## Quick Start

```bash
npm install
npm start
```

Then open http://localhost:4200

## Key Patterns

### Database Setup (db.ts)

```typescript
import Dexie, { type EntityTable } from 'dexie';

interface TodoItem {
  id: number;
  title: string;
  done: boolean;
}

const db = new Dexie('MyApp') as Dexie & {
  todoItems: EntityTable<TodoItem, 'id'>;
};

db.version(1).stores({
  todoItems: '++id',
});

export { db };
```

### Using liveQuery with Angular Signals

```typescript
import { toSignal } from '@angular/core/rxjs-interop';
import { from } from 'rxjs';
import { liveQuery } from 'dexie';

// In your component:
items = toSignal(
  from(liveQuery(() => db.todoItems.toArray())),
  { initialValue: [] }
);
```

### Template with New Control Flow

```html
@for (item of items(); track item.id) {
  <div>{{ item.title }}</div>
} @empty {
  <p>No items yet</p>
}
```

## Live Demo

[Open in StackBlitz](https://stackblitz.com/github/dexie/Dexie.js/tree/master/samples/angular)

## Learn More

- [Dexie.js Documentation](https://dexie.org/docs)
- [Angular Tutorial on dexie.org](https://dexie.org/docs/Tutorial/Angular)
- [liveQuery() Documentation](https://dexie.org/docs/liveQuery())
