import { isArray } from "../functions/utils";
import { PropModSpec } from "../public/types/prop-modification";

/** Consistent change propagation across offline synced data.
 * 
 * This class is executed client- and server side on sync, making
 * an operation consistent across sync for full consistency and accuracy.
 * 
 * Example: An object represents a bank account with a balance.
 * One offline user adds $ 1.00 to the balance.
 * Another user (online) adds $ 2.00 to the balance.
 * When first user syncs, the balance becomes the sum of every operation (3.00).
 * 
 * -- initial: balance is 0
 * 1. db.bankAccounts.update(1, { balance: new ProdModification({add: 100})}) // user 1 (offline)
 * 2. db.bankAccounts.update(1, { balance: new ProdModification({add: 200})}) // user 2 (online)
 * -- before user 1 syncs, balance is 200 (representing money with integers * 100 to avoid rounding issues)
 * <user 1 syncs>
 * -- balance is 300
 * 
 * When new operations are added, they need to be added to:
 * 1. PropModSpec interface
 * 2. Here in PropModification with the logic they represent
 * 3. (Optionally) a sugar function for it, such as const mathAdd = (amount: number | BigInt) => new PropModification({mathAdd: amount})
 */
export class PropModification {
  ["@@propmod"]: PropModSpec;
  execute(value: any): any {
    const spec = this["@@propmod"]
    // add (mathematical or set-wise)
    if (spec.add !== undefined) {
      const term = spec.add;
      // Set-addition on array representing a set of primitive types (strings, numbers)
      if (isArray(term)) {
        return [...(isArray(value) ? value : []), ...term].sort();
      }
      // Mathematical addition:
      if (typeof term === 'number') return (Number(value) || 0) + term; // if value is not convertible to number, return 0 + term
      if (typeof term === 'bigint') {
        try {
          return BigInt(value) + term;
        } catch {
          return BigInt(0) + term; // Unlike Number(value) that can return NaN, BigInt(value) throws if value is not BigInt, Number or numeric string
        }
      }
      throw new TypeError(`Invalid term ${term}`);
    }

    // remove (mathematical or set-wise)
    if (spec.remove !== undefined) {
      const subtrahend = spec.remove;
      // Set-addition on array representing a set of primitive types (strings, numbers)
      if (isArray(subtrahend)) {
        return isArray(value) ? value.filter(item => !subtrahend.includes(item)).sort() : [];
      }        
      // Mathematical addition:
      if (typeof subtrahend === 'number') return Number(value) - subtrahend;
      if (typeof subtrahend === 'bigint') {
        try {
          return BigInt(value) - subtrahend;
        } catch {
          return BigInt(0) - subtrahend; // Unlike Number(value) that can return NaN, BigInt(value) throws if value is not BigInt, Number or numeric string
        }
      }
      throw new TypeError(`Invalid subtrahend ${subtrahend}`);
    }

    // Replace a prefix:
    const prefixToReplace = spec.replacePrefix?.[0];
    if (prefixToReplace && typeof value === 'string' && value.startsWith(prefixToReplace)) {
      return spec.replacePrefix[1] + value.substring(prefixToReplace.length);
    }
    return value;
  }

  constructor(spec: PropModSpec) {
    this["@@propmod"] = spec;
  }
}
