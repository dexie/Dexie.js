import { PropModification } from "../../helpers/prop-modification";

export function add(value: number | bigint | Array<string | number>) {
  return new PropModification({add: value});
}
