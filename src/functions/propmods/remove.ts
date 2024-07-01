import { PropModification } from "../../helpers/prop-modification";

export function remove(value: number | bigint | Array<string | number>) {
  return new PropModification({remove: value});
}
