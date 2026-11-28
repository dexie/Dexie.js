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

// Issue 2373: KeyPaths must carry the depth counter into the array-element
// branch, so row types that refer back to themselves through an array element
// resolve instead of failing with TS2615.
interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
}
const specTreeNode: UpdateSpec<TreeNode> = {
  name: 'new name',
};
const specTreeNodeChild: UpdateSpec<TreeNode> = {
  'children.0.name': 'new child name',
};
interface Author {
  id: string;
  name: string;
  posts: Post[];
}
interface Post {
  id: string;
  title: string;
  author: Author;
}
const specAuthorPost: UpdateSpec<Author> = {
  'posts.0.title': 'new title',
};
