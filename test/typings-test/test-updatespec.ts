import { UpdateSpec } from '../../dist/dexie';

// Issue 1714:
interface WithArray {
  fielda: number[];
}

const err: UpdateSpec<WithArray> = {
  fielda: [1], // Gives "Type 'number[]' is not assignable to type 'void'.ts(2322)" in 4.0.1-alpha.10
};

// Nested Objects
interface Address {
  city: string;
}
interface WithNestedObject {
  address: Address;
}
const spec1: UpdateSpec<WithNestedObject> = {
  'address.city': 'Stockholm',
};

const spec2: UpdateSpec<WithNestedObject> = {
  address: { city: 'Stockholm' },
};

// Nested Arrays
interface WithNestedArray {
  addresses: Address[];
}

const specB1: UpdateSpec<WithNestedArray> = {
  'addresses.0': { city: 'Stockholm' },
};

const specB2: UpdateSpec<WithNestedArray> = {
  'addresses.0.city': 'Stockholm',
};


const specB3: UpdateSpec<WithNestedArray> = {
  addresses: [{ city: 'Stockholm' }],
};
