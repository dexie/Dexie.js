import { PropModification } from "../../helpers/prop-modification";

export function replacePrefix(a: string, b:string) {
  return new PropModification({replacePrefix: [a, b]});
}
