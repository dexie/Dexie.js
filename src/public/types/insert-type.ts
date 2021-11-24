import { Entity } from './entity';

export type MethodProps<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? P : never;
}[keyof T];

export type InsertType<T, TOptionalProperties> = string extends MethodProps<T>
  ? T
  : Omit<
      T,
      TOptionalProperties extends keyof T
        ? MethodProps<T> | TOptionalProperties
        : MethodProps<T>
    > &
      (TOptionalProperties extends keyof T
        ? { [P in TOptionalProperties]?: T[P] }
        : {});
