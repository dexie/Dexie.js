export function combine(filter1, filter2) {
  return filter1 ?
      filter2 ?
          function () { return filter1.apply(this, arguments) && filter2.apply(this, arguments); } :
          filter1 :
      filter2;
}
