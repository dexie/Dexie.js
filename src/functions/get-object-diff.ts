import { keys, hasOwn, toStringTag, intrinsicTypeNameSet, isArray } from "./utils";

export const getValueOf = (val:any, type: string) => 
    type === "Array" ? ''+val.map(v => getValueOf(v, toStringTag(v))) :
    type === "ArrayBuffer" ? ''+new Uint8Array(val) :
    type === "Date" ? val.getTime() :
    ArrayBuffer.isView(val) ? ''+new Uint8Array(val.buffer) :
    val;

 export function getObjectDiff(a, b, rv?, prfx?) {
    // Compares objects a and b and produces a diff object.
    rv = rv || {};
    prfx = prfx || '';
    keys(a).forEach(prop => {
        if (!hasOwn(b, prop))
            rv[prfx+prop] = undefined; // Property removed
        else {
            var ap = a[prop],
                bp = b[prop];
            if (typeof ap === 'object' && typeof bp === 'object' && ap && bp)
            {
                const apTypeName = toStringTag(ap);
                const bpTypeName = toStringTag(bp);

                if (apTypeName === bpTypeName) {
                    if (intrinsicTypeNameSet[apTypeName] || isArray(ap)) {
                        // This is an intrinsic type. Don't go deep diffing it.
                        // Instead compare its value in best-effort:
                        // (Can compare real values of Date, ArrayBuffers and views)
                        if (getValueOf(ap, apTypeName) !== getValueOf(bp, bpTypeName)) {
                            rv[prfx + prop] = b[prop]; // Date / ArrayBuffer etc is of different value
                        }
                    } else {
                        // This is not an intrinsic object. Compare the it deeply:
                        getObjectDiff(ap, bp, rv, prfx + prop + ".");
                    }
                } else {
                    rv[prfx + prop] = b[prop];// Property changed to other type
                }                
            } else if (ap !== bp)
                rv[prfx + prop] = b[prop];// Primitive value changed
        }
    });
    keys(b).forEach(prop => {
        if (!hasOwn(a, prop)) {
            rv[prfx+prop] = b[prop]; // Property added
        }
    });
    return rv;
}

