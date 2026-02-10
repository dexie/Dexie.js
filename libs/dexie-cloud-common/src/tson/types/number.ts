export const numberTypeDef = {
  number: {
    replace: (num: number) => {
      switch (true) {
        case isNaN(num):
          return { $t: "number", v: "NaN" };
        case num === Infinity:
          return { $t: "number", v: "Infinity" };
        case num === -Infinity:
          return { $t: "number", v: "-Infinity" };
        default:
          return num;
      }
    },
    revive: ({ v }) => Number(v),
  },
};

export default numberTypeDef;
