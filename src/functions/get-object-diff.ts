import { keys, hasOwn, toStringTag } from './utils';

/**
 * Check if a value is a BlobRef (offloaded binary data).
 * BlobRefs are considered equal if they have the same 'ref' property.
 */
function isBlobRef(value: any): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.$t === 'string' &&
    typeof value.ref === 'string' &&
    value.v === undefined
  );
}

/**
 * Check if two BlobRefs are equal (same blob reference).
 */
function blobRefsEqual(a: any, b: any): boolean {
  return a.ref === b.ref;
}

export function getObjectDiff(a: any, b: any, rv?: any, prfx?: string) {
  // Compares objects a and b and produces a diff object.
  rv = rv || {};
  prfx = prfx || '';
  keys(a).forEach((prop) => {
    if (!hasOwn(b, prop)) {
      // Property removed
      rv[prfx + prop] = undefined;
    } else {
      var ap = a[prop],
        bp = b[prop];
      if (typeof ap === 'object' && typeof bp === 'object' && ap && bp) {
        const apTypeName = toStringTag(ap);
        const bpTypeName = toStringTag(bp);

        if (apTypeName !== bpTypeName) {
          rv[prfx + prop] = b[prop]; // Property changed to other type
        } else if (apTypeName === 'Object') {
          // Check if both are BlobRefs - compare by ref, not object identity
          if (isBlobRef(ap) && isBlobRef(bp)) {
            if (!blobRefsEqual(ap, bp)) {
              rv[prfx + prop] = b[prop]; // Different blob
            }
            // Same blob ref - no diff needed
          } else {
            // Pojo objects (not Date, ArrayBuffer, Array etc). Go deep.
            getObjectDiff(ap, bp, rv, prfx + prop + '.');
          }
        } else if (ap !== bp) {
          // Values differ.
          // Could have checked if Date, arrays or binary types have same
          // content here but I think that would be a suboptimation.
          // Prefer simplicity.
          rv[prfx + prop] = b[prop];
        }
      } else if (ap !== bp) rv[prfx + prop] = b[prop]; // Primitive value changed
    }
  });
  keys(b).forEach((prop) => {
    if (!hasOwn(a, prop)) {
      rv[prfx + prop] = b[prop]; // Property added
    }
  });
  return rv;
}
