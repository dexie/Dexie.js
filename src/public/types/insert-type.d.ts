export type MethodProps<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any ? P : never;
}[keyof T];

export type InsertType<T, TOptionalProperties, TKeyPropNameOrKeyType> = string extends MethodProps<T>
  ? T
  : Omit<
      T,
      TOptionalProperties extends keyof T
        ? TKeyPropNameOrKeyType extends keyof T
          ? MethodProps<T> | TOptionalProperties | TKeyPropNameOrKeyType
          : MethodProps<T> | TOptionalProperties
        : MethodProps<T>
    > &
      (TOptionalProperties extends keyof T
        ? TKeyPropNameOrKeyType extends keyof T
          ? { [P in (TOptionalProperties | TKeyPropNameOrKeyType)]?: T[P] }
          : { [P in TOptionalProperties]?: T[P] }
        : {});
