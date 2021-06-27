
export function allSettled(possiblePromises: any[]) {
  return new Promise(resolve => {
      if (possiblePromises.length === 0) resolve([]);
      let remaining = possiblePromises.length;
      const results = new Array(remaining);
      possiblePromises.forEach((p, i) => Promise.resolve(p).then(
          value => results[i] = {status: "fulfilled", value},
          reason => results[i] = {status: "rejected", reason})
          .then(()=>--remaining || resolve(results)));
  });
}
