export const isSafari =
  typeof navigator !== 'undefined' &&
  /Safari\//.test(navigator.userAgent) &&
  !/Chrom(e|ium)\/|Edge\//.test(navigator.userAgent);

export const safariVersion = isSafari
  ? // @ts-ignore
    [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1]
  : NaN;
