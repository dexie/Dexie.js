import { Injectable } from '@angular/core';
import Dexie from 'dexie';

import { DexieService } from './core/dexie.service';

export interface Todo {
  title: string;
  done: boolean;
}

export interface TodoWithID extends Todo {
  id: number;
}

@Injectable()
export class TodosService {
  table: Dexie.Table<TodoWithID, number>;

  constructor(private dexieService: DexieService) {
    this.table = this.dexieService.table('todos');
  }

  getAll() {
    return this.table.toArray();
  }

  add(data) {
    return this.table.add(data);
  }

  update(id, data) {
    return this.table.update(id, data);
  }

  remove(id) {
    return this.table.delete(id);
  }
}
