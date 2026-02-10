/** The undefined type is not part of builtin but can be manually added.
 * The reason for supporting undefined is if the following object should be revived correctly:
 *
 *    {foo: undefined}
 *
 * Without including this typedef, the revived object would just be {}.
 * If including this typedef, the revived object would be {foo: undefined}.
 */

export const undefinedTypeDef = {
  undefined: {
    replace: () => ({
      $t: "undefined",
    }),
    revive: () => undefined,
  },
};

export default undefinedTypeDef;
