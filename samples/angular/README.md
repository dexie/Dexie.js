# Dexie.js + Angular Example

A modern Angular Todo app demonstrating Dexie.js with:

- **Angular 21** with standalone components
- **Zoneless change detection** (default in Angular 21+, no zone.js required)
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

## Why Zoneless?

Angular 21 defaults to zoneless change detection, which:
- **Improves performance** - no unnecessary change detection cycles
- **Reduces bundle size** - zone.js adds ~13KB gzipped
- **Works with native async/await** - no need to transpile down to ES2015
- **Pairs perfectly with signals** - change detection is triggered by signal updates

This example uses signals throughout, making it an ideal fit for zoneless mode.

## Key Patterns

### Database Setup (db.ts)

This is a simplified example. See `src/app/db.ts` for the full schema with TodoList and TodoItem tables.

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

The `liveQuery()` function returns an observable that emits whenever the underlying data changes. Combined with `toSignal()`, you get automatic UI updates when database records change.

### Template with New Control Flow

```html
@for (item of items(); track item.id) {
  <div>{{ item.title }}</div>
} @empty {
  <p>No items yet</p>
}
```

### Atomic Operations with Transactions

```typescript
// Delete list and all its items atomically
await db.transaction('rw', db.todoItems, db.todoLists, async () => {
  await db.todoItems.where({ todoListId: listId }).delete();
  await db.todoLists.delete(listId);
});
```

## Live Demo

[Open in StackBlitz](https://stackblitz.com/github/dexie/Dexie.js/tree/master/samples/angular)

## Learn More

- [Dexie.js Documentation](https://dexie.org/docs)
- [Angular Tutorial on dexie.org](https://dexie.org/docs/Tutorial/Angular)
- [liveQuery() Documentation](https://dexie.org/docs/liveQuery())
- [Angular Zoneless Guide](https://angular.dev/guide/zoneless)
