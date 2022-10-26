export type Optional<T, PropNames extends keyof T> = Omit<T, PropNames> & Partial<T>;
