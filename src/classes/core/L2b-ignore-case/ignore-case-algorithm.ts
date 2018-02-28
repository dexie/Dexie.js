export function upperFactory(dir: 'next' | 'prev') {
  return dir === "next" ?
    (s: string) => s.toUpperCase() :
    (s: string) => s.toLowerCase();
}

export function lowerFactory(dir: 'next' | 'prev') {
  return dir === "next" ?
    (s: string) => s.toLowerCase() :
    (s: string) => s.toUpperCase();
}

export function nextCasing(key: string, lowerKey: string, upperNeedle: string, lowerNeedle: string, cmp: (a,b)=>number, reverse: boolean) {
  var length = Math.min(key.length, lowerNeedle.length);
  var llp = -1;
  for (var i = 0; i < length; ++i) {
      var lwrKeyChar = lowerKey[i];
      if (lwrKeyChar !== lowerNeedle[i]) {
          if (cmp(key[i], upperNeedle[i]) < 0) return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
          if (cmp(key[i], lowerNeedle[i]) < 0) return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
          if (llp >= 0) return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
          return null;
      }
      if (cmp(key[i], lwrKeyChar) < 0) llp = i;
  }
  if (length < lowerNeedle.length && !reverse) return key + upperNeedle.substr(key.length);
  if (length < key.length && reverse) return key.substr(0, upperNeedle.length);
  return (llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1));
}

export function addIgnoreCaseAlgorithm(whereClause: WhereClause, match, needles, suffix) {
  /// <param name="needles" type="Array" elementType="String"></param>
  var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix,
      needlesLen = needles.length;
  if (!needles.every(s => typeof s === 'string')) {
      return fail(whereClause, STRING_EXPECTED);
  }
  function initDirection(dir) {
      upper = upperFactory(dir);
      lower = lowerFactory(dir);
      compare = (dir === "next" ? simpleCompare : simpleCompareReverse);
      var needleBounds = needles.map(function (needle){
          return {lower: lower(needle), upper: upper(needle)};
      }).sort(function(a,b) {
          return compare(a.lower, b.lower);
      });
      upperNeedles = needleBounds.map(function (nb){ return nb.upper; });
      lowerNeedles = needleBounds.map(function (nb){ return nb.lower; });
      direction = dir;
      nextKeySuffix = (dir === "next" ? "" : suffix);
  }
  initDirection("next");

  var c = new whereClause.Collection (whereClause, function() {
      return whereClause.db._deps.IDBKeyRange.bound(upperNeedles[0], lowerNeedles[needlesLen-1] + suffix);
  });

  c._ondirectionchange = function (direction) {
      // This event onlys occur before filter is called the first time.
      initDirection(direction);
  };

  var firstPossibleNeedle = 0;

  c._addAlgorithm(function (cursor, advance, resolve) {
      /// <param name="cursor" type="IDBCursor"></param>
      /// <param name="advance" type="Function"></param>
      /// <param name="resolve" type="Function"></param>
      var key = cursor.key;
      if (typeof key !== 'string') return false;
      var lowerKey = lower(key);
      if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
          return true;
      } else {
          var lowestPossibleCasing = null;
          for (var i=firstPossibleNeedle; i<needlesLen; ++i) {
              var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
              if (casing === null && lowestPossibleCasing === null)
                  firstPossibleNeedle = i + 1;
              else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                  lowestPossibleCasing = casing;
              }
          }
          if (lowestPossibleCasing !== null) {
              advance(function () { cursor.continue(lowestPossibleCasing + nextKeySuffix); });
          } else {
              advance(resolve);
          }
          return false;
      }
  });
  return c;
}
