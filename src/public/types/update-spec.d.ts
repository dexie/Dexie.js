import { KeyPaths, KeyPathValue } from "./keypaths";
import { PropModification } from "./prop-modification";

export type UpdateSpec<T> = { [KP in KeyPaths<T>]?: KeyPathValue<T, KP> | PropModification };
