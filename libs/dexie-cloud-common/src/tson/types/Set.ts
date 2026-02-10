export const setTypeDef = {
  Set: {
    replace: (set: Set<any>) => ({
      $t: "Set",
      v: Array.from(set.entries()),
    }),
    revive: ({ v }) => new Set(v),
  },
};

export default setTypeDef;
