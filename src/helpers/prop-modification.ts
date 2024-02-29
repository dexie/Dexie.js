import { PropModSpec } from "../public/types/prop-modification";

export const PropModSymbol: unique symbol = Symbol();

export class PropModification implements PropModSpec {
  [PropModSymbol]?: true;
  $replacePrefix?: [string, string];

  execute(value: any) {
    const prefixToReplace = this.$replacePrefix?.[0];
    if (prefixToReplace && typeof value === 'string' && value.startsWith(prefixToReplace)) {
      return this.$replacePrefix[1] + value.substring(prefixToReplace.length);
    }
    return value;
  }

  constructor(spec: PropModSpec) {
    Object.assign(this, spec);
  }
}
