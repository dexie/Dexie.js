import {module, test, deepEqual, ok} from 'QUnit';
import combineCreateAndUpdate from '../../src/combine-create-and-update';

module('combineCreateAndUpdate', {
  setup: () => {
  },
  teardown: () => {
  }
});

test('should get a create change and update change and return a combined object', () => {
  const createChange = {
    obj: {
      foo: 'value',
    },
  };
  const updateChange = {
    mods: {
      foo: 'value2',
      bar: 'new Value',
    },
  };

  const res = combineCreateAndUpdate(createChange, updateChange);
  deepEqual(res.obj, { foo: 'value2', bar: 'new Value' });
});

test('should not change the original createObject', () => {
  const createChange = {
    obj: {
      foo: 'value',
    },
  };
  const updateChange = {
    mods: {
      foo: 'value2',
      bar: 'new Value',
    },
  };

  combineCreateAndUpdate(createChange, updateChange);
  deepEqual(createChange.obj, { foo: 'value' });
});
