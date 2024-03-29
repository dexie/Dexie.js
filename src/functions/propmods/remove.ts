import { PropModification } from "../../helpers/prop-modification";

export function remove(value: number | BigInt | Array<string | number>) {
  return new PropModification({remove: value});
}
