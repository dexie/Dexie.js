export const dateTypeDef = {
  Date: {
    replace: (date: Date) => ({
      $t: "Date",
      v: isNaN(date.getTime()) ? "NaN" : date.toISOString(),
    }),
    revive: ({ v }) => new Date(v === "NaN" ? NaN : Date.parse(v)),
  },
};

export default dateTypeDef;
