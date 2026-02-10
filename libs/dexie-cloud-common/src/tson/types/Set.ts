export const setTypeDef = {
  Set: {
    replace: (set: Set<any>) => ({
      $t: "Set",
      v: Array.from(set),
    }),
    revive: ({ v }) => new Set(v),
  },
};

export default setTypeDef;
