import { KeyPaths, KeyPathValue } from "./keypaths";

export type UpdateSpec<T> = { [KP in KeyPaths<T>]?: KeyPathValue<T, KP> };