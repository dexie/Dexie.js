export const mapTypeDef = {
  Map: {
    replace: (map: Map<any, any>) => ({
      $t: "Map",
      v: Array.from(map.entries()),
    }),
    revive: ({ v }) => new Map(v),
  },
};

export default mapTypeDef;
