import { TypesonSimplified } from '../TypesonSimplified';
import { builtInTypeDefs } from '../presets/builtin';
import { undefinedTypeDef } from '../types/undefined';

describe('undefined type support', () => {
  const TSON = TypesonSimplified({ ...builtInTypeDefs, ...undefinedTypeDef });

  test('should stringify undefined', () => {
    expect(TSON.stringify({ foo: null, bar: undefined })).toBe(
      JSON.stringify({ foo: null, bar: { $t: "undefined" } }),
    );
  });

  test('should revive undefined', () => {
    const revived = TSON.parse(TSON.stringify({ foo: null, bar: undefined }));
    expect(Object.keys(revived)).toStrictEqual(["foo", "bar"]);
    expect(Object.values(revived)).toStrictEqual([null, undefined]);
  });

  test('should not leak undefined properties to children', () => {
    const ORIG = {
      foo: null,
      undef1: undefined,
      $undef1: undefined,
      bar: {
        baz: "x",
        undef: undefined,
        $undef: undefined,
        $$undef: undefined,
        $Gunnar: "2",
        $t: undefined,
      },
      undef2: undefined,
      $undef2: undefined,
      $t: undefined,
    };
    const stringified = TSON.stringify(ORIG);
    const revived = TSON.parse(stringified);
    expect(revived).toStrictEqual(ORIG);
  });

  test('should revive sync request with undefined values', () => {
    const REQUEST = {
      schema: {
        $jobs2: {
          markedForSync: undefined,
          initiallySynced: true,
          generateGlobalId: undefined,
        },
        $jobs: {
          markedForSync: undefined,
          initiallySynced: true,
          generateGlobalId: undefined,
        },
      },
    };
    const stringified = TSON.stringify(REQUEST);
    const revived = TSON.parse(stringified);
    expect(revived).toStrictEqual(REQUEST);
  });
});
