import { DBCore } from "./dbcore";

export interface Middleware<TStack extends {stack: string}> {
  stack: TStack["stack"],
  create: (down: TStack) => Partial<TStack>;
  level?: number;
  name?: string;
}

export interface DexieStacks {
  dbcore: DBCore;
}
