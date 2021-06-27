import {module, test, deepEqual, ok} from 'QUnit';
import combineUpdateAndUpdate from '../../src/combine-update-and-update';

module('combineUpdateAndUpdate', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should combine the keys of nextChange.mods and prevChange.mods', () => {
  const prevChange = {
    mods: {
      foo: 'bar',
    },
  };
  const nextChange = {
    mods: {
      bar: 'baz',
    },
  };

  const res = combineUpdateAndUpdate(prevChange, nextChange);
  deepEqual(res.mods, {foo: 'bar', bar: 'baz'});
});

test('should leave the original object untouched', () => {
  const prevChange = {
    mods: {
      foo: 'bar',
    },
  };
  const nextChange = {
    mods: {
      bar: 'baz',
    },
  };

  combineUpdateAndUpdate(prevChange, nextChange);
  deepEqual(prevChange, {mods: {foo: 'bar'}});
});

test('should overwrite a previous change with the same key', () => {
  const prevChange = {
    mods: {
      foo: 'bar',
    },
  };
  const nextChange = {
    mods: {
      foo: 'baz',
    },
  };

  const res = combineUpdateAndUpdate(prevChange, nextChange);
  deepEqual(res.mods, {foo: 'baz'});
});

test('should ignore a previous change which changed a parent object of the next change', () => {
  const prevChange = {
    mods: {
      'foo': {bar: 'baz', baz: 'bar'},
    },
  };
  const nextChange = {
    mods: {
      'foo.bar': 'foobar',
    },
  };

  const res = combineUpdateAndUpdate(prevChange, nextChange);
  deepEqual(res, {mods: {foo: {bar: 'foobar', baz: 'bar'}}});
});

test('should ignore a previous change which changed a sub value of the nextChange', () => {
  const prevChange = {
    mods: {
      'foo.bar': 'foobar',
    },
  };
  const nextChange = {
    mods: {
      'foo': {bar: 'baz'},
    },
  };

  const res = combineUpdateAndUpdate(prevChange, nextChange);
  deepEqual(res, {mods: {'foo': {bar: 'baz'}}});
});
