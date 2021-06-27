import Typeson from 'typeson';
import {encode, decode} from 'base64-arraybuffer-es6';

export default {
    arraybuffer: {
        test (x) { return Typeson.toStringTag(x) === 'ArrayBuffer'; },
        replace (b) {
            return encode(b, 0, b.byteLength);
        },
        revive (b64) {
            const buffer = decode(b64);
            return buffer;
        }
    }
};

// See also typed-arrays!
