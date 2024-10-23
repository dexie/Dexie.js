import { KeyPaths, KeyPathValue } from "./keypaths";
import { PropModification } from "./prop-modification";

export interface UpdateSpec<T> = { [KP in KeyPaths<T>]?: KeyPathValue<T, KP> | PropModification };
