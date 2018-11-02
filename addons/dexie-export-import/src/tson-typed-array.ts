declare var global;

/* eslint-env browser, node */
import Typeson from 'typeson';
import {encode, decode} from 'base64-arraybuffer-es6';

const _global = typeof self === 'undefined' ? global : self;

const exportObj = {};
[
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array'
].forEach(function (typeName) {
    const arrType = typeName;
    const TypedArray = _global[arrType];
    if (TypedArray) {
        exportObj[typeName.toLowerCase()+"2"] = {
            test (x) { return Typeson.toStringTag(x) === arrType; },
            replace ({buffer, byteOffset, length}) {
                return {
                    buffer,
                    byteOffset,
                    length
                };
            },
            revive (b64Obj) {
                const {buffer, byteOffset, length} = b64Obj;
                return new TypedArray(buffer, byteOffset, length);
            }
        };
    }
});

export default exportObj;
