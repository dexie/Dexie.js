import {module, test, deepEqual} from 'QUnit';
import mergeChange from '../../src/merge-change';
import {CREATE, UPDATE, DELETE} from '../../src/change_types';

// Tests for if a key exists multiple times in a table
module('mergeChange: prev change was CREATE', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should just return the nextChange if it is CREATE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    obj: {},
    type: CREATE,
  };
  const nextChange = {
    key: 1,
    table: 'foo',
    obj: {foo: 'bar'},
    type: CREATE,
  };
  const res = mergeChange(prevChange, nextChange);
  deepEqual(res, nextChange);
});

test('should just return the nextChange if it is DELETE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    obj: {},
    type: CREATE,
  };
  const nextChange = {
    rev: 1,
    key: 1,
    table: 'foo',
    type: DELETE,
  };
  const res = mergeChange(prevChange, nextChange);
  deepEqual(res, nextChange);
});

test('should combine the CREATE and UPDATE change if nextChange is UPATE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    obj: {
      foo: 'baz',
    },
    type: CREATE,
  };
  const nextChange = {
    key: 1,
    table: 'foo',
    mods: {
      title: 'bar',
    },
    type: UPDATE,
  };

  const res = mergeChange(prevChange, nextChange);
  const expectedResult = {
    key: 1,
    table: 'foo',
    obj: {
      title: 'bar',
      foo: 'baz'
    },
    type: CREATE
  };
  deepEqual(res, expectedResult);
});

module('mergeChange: prev change was UPDATE', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should return the nextChange if it is CREATE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    mods: {foo: 'bar'},
    type: UPDATE,
  };
  const nextChange = {
    key: 1,
    table: 'foo',
    obj: {foo: 'bar baz'},
    type: CREATE,
  };
  const res = mergeChange(prevChange, nextChange);
  deepEqual(res, nextChange);
});

test('should return the nextChange if it is DELETE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    mods: {foo: 'bar'},
    type: UPDATE,
  };
  const nextChange = {
    rev: 1,
    key: 1,
    table: 'foo',
    type: DELETE,
  };
  const res = mergeChange(prevChange, nextChange);
  deepEqual(res, nextChange);
});

test('should the changes if the nextChange is UPDATE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    mods: {
      foo: 'baz',
    },
    type: UPDATE,
  };
  const nextChange = {
    key: 1,
    table: 'foo',
    mods: {
      title: 'bar',
    },
    type: UPDATE,
  };
  const res = mergeChange(prevChange, nextChange);
  const expectedResult = {
    key: 1,
    table: 'foo',
    mods: {
      title: 'bar',
      foo: 'baz'
    },
    type: UPDATE
  };
  deepEqual(res, expectedResult);
});

module('mergeChange: prev change was DELETE', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should return nextChange if it is CREATE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    type: DELETE,
  };
  const nextChange = {
    key: 1,
    table: 'foo',
    obj: {foo: 'bar'},
    type: CREATE,
  };
  const res = mergeChange(prevChange, nextChange);
  deepEqual(res, nextChange);
});

test('should return the prevChange if nextChange is DELETE', () => {
  const prevChange = {
    key: 1,
    table: 'foo',
    type: DELETE,
  };
  const nextChange = {
    key: 1,
    table: 'foo',
    type: DELETE,
  };
  const res = mergeChange(prevChange, nextChange);
  deepEqual(res, prevChange);
});

test('should return prevChange if nextChange is UPDATE', () => {
  const prevChange = {
    rev: 0,
    key: 1,
    table: 'foo',
    type: DELETE,
  };
  const nextChange = {
    rev: 1,
    key: 1,
    table: 'foo',
    mods: {foo: 'bar'},
    type: UPDATE,
  };
  const res = mergeChange(prevChange, nextChange);
  deepEqual(res, prevChange);
});
