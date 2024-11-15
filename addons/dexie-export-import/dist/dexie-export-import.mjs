/* ========================================================================== 
 *                           dexie-export-import.js
 * ==========================================================================
 *
 * Dexie addon for exporting and importing databases to / from Blobs.
 *
 * By David Fahlander, david.fahlander@gmail.com,
 *
 * ==========================================================================
 *
 * Version 4.1.4, Fri Nov 15 2024
 *
 * https://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 * 
 */

import Dexie from 'dexie';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function getSchemaString(table) {
    var primKeyAndIndexes = [table.schema.primKey].concat(table.schema.indexes);
    return primKeyAndIndexes.map(function (index) { return index.src; }).join(',');
}
function extractDbSchema(exportedDb) {
    var schema = {};
    for (var _i = 0, _a = exportedDb.tables; _i < _a.length; _i++) {
        var table = _a[_i];
        schema[table.name] = table.schema;
    }
    return schema;
}
function readBlobAsync(blob, type) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onabort = function (ev) { return reject(new Error("file read aborted")); };
        reader.onerror = function (ev) { return reject(ev.target.error); };
        reader.onload = function (ev) { return resolve(ev.target.result); };
        if (type === 'binary')
            reader.readAsArrayBuffer(blob);
        else
            reader.readAsText(blob);
    });
}
function readBlobSync(blob, type) {
    if (typeof FileReaderSync === 'undefined') {
        throw new Error('FileReaderSync missing. Reading blobs synchronously requires code to run from within a web worker. Use TSON.encapsulateAsync() to do it from the main thread.');
    }
    var reader = new FileReaderSync(); // Requires worker environment
    var data = type === 'binary' ?
        reader.readAsArrayBuffer(blob) :
        reader.readAsText(blob);
    return data;
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var typeson = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  module.exports = factory() ;
}(commonjsGlobal, (function () {
  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
      return;
    }

    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  /**
   * We keep this function minimized so if using two instances of this
   *   library, where one is minimized and one is not, it will still work
   *   with `hasConstructorOf`.
   * With ES6 classes, we may be able to simply use `class TypesonPromise
   *   extends Promise` and add a string tag for detection.
   * @param {function} f
   */
  // eslint-disable-next-line max-len
  // eslint-disable-next-line block-spacing, space-before-function-paren, space-before-blocks, space-infix-ops, semi, promise/avoid-new
  var TypesonPromise = function TypesonPromise(f) {
    _classCallCheck(this, TypesonPromise);

    this.p = new Promise(f);
  }; // eslint-disable-next-line max-len
  // class TypesonPromise extends Promise {get[Symbol.toStringTag](){return 'TypesonPromise'};} // eslint-disable-line keyword-spacing, space-before-function-paren, space-before-blocks, block-spacing, semi


  TypesonPromise.__typeson__type__ = 'TypesonPromise'; // Note: core-js-bundle provides a `Symbol` polyfill

  /* istanbul ignore else */

  if (typeof Symbol !== 'undefined') {
    // Ensure `isUserObject` will return `false` for `TypesonPromise`
    TypesonPromise.prototype[Symbol.toStringTag] = 'TypesonPromise';
  }
  /**
   *
   * @param {function} [onFulfilled]
   * @param {function} [onRejected]
   * @returns {TypesonPromise}
   */


  TypesonPromise.prototype.then = function (onFulfilled, onRejected) {
    var _this = this;

    return new TypesonPromise(function (typesonResolve, typesonReject) {
      // eslint-disable-next-line promise/catch-or-return
      _this.p.then(function (res) {
        // eslint-disable-next-line promise/always-return
        typesonResolve(onFulfilled ? onFulfilled(res) : res);
      })["catch"](function (res) {
        return onRejected ? onRejected(res) : Promise.reject(res);
      }).then(typesonResolve, typesonReject);
    });
  };
  /**
   *
   * @param {function} onRejected
   * @returns {TypesonPromise}
   */


  TypesonPromise.prototype["catch"] = function (onRejected) {
    return this.then(null, onRejected);
  };
  /**
   *
   * @param {Any} v
   * @returns {TypesonPromise}
   */


  TypesonPromise.resolve = function (v) {
    return new TypesonPromise(function (typesonResolve) {
      typesonResolve(v);
    });
  };
  /**
   *
   * @param {Any} v
   * @returns {TypesonPromise}
   */


  TypesonPromise.reject = function (v) {
    return new TypesonPromise(function (typesonResolve, typesonReject) {
      typesonReject(v);
    });
  };

  ['all', 'race'].forEach(function (meth) {
    /**
     *
     * @param {Promise[]} promArr
     * @returns {TypesonPromise}
     */
    TypesonPromise[meth] = function (promArr) {
      return new TypesonPromise(function (typesonResolve, typesonReject) {
        // eslint-disable-next-line promise/catch-or-return
        Promise[meth](promArr.map(function (prom) {
          return prom && prom.constructor && prom.constructor.__typeson__type__ === 'TypesonPromise' ? prom.p : prom;
        })).then(typesonResolve, typesonReject);
      });
    };
  });

  var _ref = {},
      toStr = _ref.toString,
      hasOwn = {}.hasOwnProperty,
      getProto = Object.getPrototypeOf,
      fnToString = hasOwn.toString;
  /**
   * Second argument not in use internally, but provided for utility.
   * @param {Any} v
   * @param {boolean} catchCheck
   * @returns {boolean}
   */

  function isThenable(v, catchCheck) {
    return isObject(v) && typeof v.then === 'function' && (!catchCheck || typeof v["catch"] === 'function');
  }
  /**
   *
   * @param {Any} val
   * @returns {string}
   */


  function toStringTag(val) {
    return toStr.call(val).slice(8, -1);
  }
  /**
   * This function is dependent on both constructors
   *   being identical so any minimization is expected of both.
   * @param {Any} a
   * @param {function} b
   * @returns {boolean}
   */


  function hasConstructorOf(a, b) {
    if (!a || _typeof(a) !== 'object') {
      return false;
    }

    var proto = getProto(a);

    if (!proto) {
      return b === null;
    }

    var Ctor = hasOwn.call(proto, 'constructor') && proto.constructor;

    if (typeof Ctor !== 'function') {
      return b === null;
    }

    if (b === Ctor) {
      return true;
    }

    if (b !== null && fnToString.call(Ctor) === fnToString.call(b)) {
      return true;
    }

    if (typeof b === 'function' && typeof Ctor.__typeson__type__ === 'string' && Ctor.__typeson__type__ === b.__typeson__type__) {
      return true;
    }

    return false;
  }
  /**
   *
   * @param {Any} val
   * @returns {boolean}
   */


  function isPlainObject(val) {
    // Mirrors jQuery's
    if (!val || toStringTag(val) !== 'Object') {
      return false;
    }

    var proto = getProto(val);

    if (!proto) {
      // `Object.create(null)`
      return true;
    }

    return hasConstructorOf(val, Object);
  }
  /**
   *
   * @param {Any} val
   * @returns {boolean}
   */


  function isUserObject(val) {
    if (!val || toStringTag(val) !== 'Object') {
      return false;
    }

    var proto = getProto(val);

    if (!proto) {
      // `Object.create(null)`
      return true;
    }

    return hasConstructorOf(val, Object) || isUserObject(proto);
  }
  /**
   *
   * @param {Any} v
   * @returns {boolean}
   */


  function isObject(v) {
    return v && _typeof(v) === 'object';
  }
  /**
   *
   * @param {string} keyPathComponent
   * @returns {string}
   */


  function escapeKeyPathComponent(keyPathComponent) {
    return keyPathComponent.replace(/~/g, '~0').replace(/\./g, '~1');
  }
  /**
   *
   * @param {string} keyPathComponent
   * @returns {string}
   */


  function unescapeKeyPathComponent(keyPathComponent) {
    return keyPathComponent.replace(/~1/g, '.').replace(/~0/g, '~');
  }
  /**
   * @param {PlainObject|GenericArray} obj
   * @param {string} keyPath
   * @returns {Any}
   */


  function getByKeyPath(obj, keyPath) {
    if (keyPath === '') {
      return obj;
    }

    var period = keyPath.indexOf('.');

    if (period > -1) {
      var innerObj = obj[unescapeKeyPathComponent(keyPath.slice(0, period))];
      return innerObj === undefined ? undefined : getByKeyPath(innerObj, keyPath.slice(period + 1));
    }

    return obj[unescapeKeyPathComponent(keyPath)];
  }
  /**
   *
   * @param {PlainObject} obj
   * @param {string} keyPath
   * @param {Any} value
   * @returns {Any}
   */


  function setAtKeyPath(obj, keyPath, value) {
    if (keyPath === '') {
      return value;
    }

    var period = keyPath.indexOf('.');

    if (period > -1) {
      var innerObj = obj[unescapeKeyPathComponent(keyPath.slice(0, period))];
      return setAtKeyPath(innerObj, keyPath.slice(period + 1), value);
    }

    obj[unescapeKeyPathComponent(keyPath)] = value;
    return obj;
  }
  /**
   *
   * @param {external:JSON} value
   * @returns {"null"|"array"|"undefined"|"boolean"|"number"|"string"|
   *  "object"|"symbol"}
   */


  function getJSONType(value) {
    return value === null ? 'null' : Array.isArray(value) ? 'array' : _typeof(value);
  }

  var keys = Object.keys,
      isArray = Array.isArray,
      hasOwn$1 = {}.hasOwnProperty,
      internalStateObjPropsToIgnore = ['type', 'replaced', 'iterateIn', 'iterateUnsetNumeric'];
  /**
   * Handle plain object revivers first so reference setting can use
   * revived type (e.g., array instead of object); assumes revived
   * has same structure or will otherwise break subsequent references.
   * @param {PlainObjectType} a
   * @param {PlainObjectType} b
   * @returns {1|-1|boolean}
   */

  function nestedPathsFirst(a, b) {
    if (a.keypath === '') {
      return -1;
    }

    var as = a.keypath.match(/\./g) || 0;
    var bs = b.keypath.match(/\./g) || 0;

    if (as) {
      as = as.length;
    }

    if (bs) {
      bs = bs.length;
    }

    return as > bs ? -1 : as < bs ? 1 : a.keypath < b.keypath ? -1 : a.keypath > b.keypath;
  }
  /**
   * An instance of this class can be used to call `stringify()` and `parse()`.
   * Typeson resolves cyclic references by default. Can also be extended to
   * support custom types using the register() method.
   *
   * @class
   * @param {{cyclic: boolean}} [options] - if cyclic (default true),
   *   cyclic references will be handled gracefully.
   */


  var Typeson =
  /*#__PURE__*/
  function () {
    function Typeson(options) {
      _classCallCheck(this, Typeson);

      this.options = options; // Replacers signature: replace (value). Returns falsy if not
      //   replacing. Otherwise ['Date', value.getTime()]

      this.plainObjectReplacers = [];
      this.nonplainObjectReplacers = []; // Revivers: [{type => reviver}, {plain: boolean}].
      //   Sample: [{'Date': value => new Date(value)}, {plain: false}]

      this.revivers = {};
      /** Types registered via `register()`. */

      this.types = {};
    }
    /**
    * @typedef {null|boolean|number|string|GenericArray|PlainObject} JSON
    */

    /**
    * @callback JSONReplacer
    * @param {""|string} key
    * @param {JSON} value
    * @returns {number|string|boolean|null|PlainObject|undefined}
    * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The%20replacer%20parameter
    */

    /**
     * Serialize given object to Typeson.
     * Initial arguments work identical to those of `JSON.stringify`.
     * The `replacer` argument has nothing to do with our replacers.
     * @param {Any} obj
     * @param {JSONReplacer|string[]} replacer
     * @param {number|string} space
     * @param {object} opts
     * @returns {string|Promise} Promise resolves to a string
     */


    _createClass(Typeson, [{
      key: "stringify",
      value: function stringify(obj, replacer, space, opts) {
        opts = _objectSpread2({}, this.options, {}, opts, {
          stringification: true
        });
        var encapsulated = this.encapsulate(obj, null, opts);

        if (isArray(encapsulated)) {
          return JSON.stringify(encapsulated[0], replacer, space);
        }

        return encapsulated.then(function (res) {
          return JSON.stringify(res, replacer, space);
        });
      }
      /**
       * Also sync but throws on non-sync result.
       * @param {Any} obj
       * @param {JSONReplacer|string[]} replacer
       * @param {number|string} space
       * @param {object} opts
       * @returns {string}
       */

    }, {
      key: "stringifySync",
      value: function stringifySync(obj, replacer, space, opts) {
        return this.stringify(obj, replacer, space, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: true
        }));
      }
      /**
       *
       * @param {Any} obj
       * @param {JSONReplacer|string[]} replacer
       * @param {number|string} space
       * @param {object} opts
       * @returns {Promise<string>}
       */

    }, {
      key: "stringifyAsync",
      value: function stringifyAsync(obj, replacer, space, opts) {
        return this.stringify(obj, replacer, space, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: false
        }));
      }
      /**
       * Parse Typeson back into an obejct.
       * Initial arguments works identical to those of `JSON.parse()`.
       * @param {string} text
       * @param {function} reviver This JSON reviver has nothing to do with
       *   our revivers.
       * @param {object} opts
       * @returns {external:JSON}
       */

    }, {
      key: "parse",
      value: function parse(text, reviver, opts) {
        opts = _objectSpread2({}, this.options, {}, opts, {
          parse: true
        });
        return this.revive(JSON.parse(text, reviver), opts);
      }
      /**
      * Also sync but throws on non-sync result.
      * @param {string} text
      * @param {function} reviver This JSON reviver has nothing to do with
      *   our revivers.
      * @param {object} opts
      * @returns {external:JSON}
      */

    }, {
      key: "parseSync",
      value: function parseSync(text, reviver, opts) {
        return this.parse(text, reviver, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: true
        }));
      }
      /**
      * @param {string} text
      * @param {function} reviver This JSON reviver has nothing to do with
      *   our revivers.
      * @param {object} opts
      * @returns {Promise} Resolves to `external:JSON`
      */

    }, {
      key: "parseAsync",
      value: function parseAsync(text, reviver, opts) {
        return this.parse(text, reviver, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: false
        }));
      }
      /**
       *
       * @param {Any} obj
       * @param {object} stateObj
       * @param {object} [opts={}]
       * @returns {string[]|false}
       */

    }, {
      key: "specialTypeNames",
      value: function specialTypeNames(obj, stateObj) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        opts.returnTypeNames = true;
        return this.encapsulate(obj, stateObj, opts);
      }
      /**
       *
       * @param {Any} obj
       * @param {PlainObject} stateObj
       * @param {PlainObject} [opts={}]
       * @returns {Promise|GenericArray|PlainObject|string|false}
       */

    }, {
      key: "rootTypeName",
      value: function rootTypeName(obj, stateObj) {
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        opts.iterateNone = true;
        return this.encapsulate(obj, stateObj, opts);
      }
      /**
       * Encapsulate a complex object into a plain Object by replacing
       * registered types with plain objects representing the types data.
       *
       * This method is used internally by `Typeson.stringify()`.
       * @param {Any} obj - Object to encapsulate.
       * @param {PlainObject} stateObj
       * @param {PlainObject} opts
       * @returns {Promise|GenericArray|PlainObject|string|false}
       */

    }, {
      key: "encapsulate",
      value: function encapsulate(obj, stateObj, opts) {
        opts = _objectSpread2({
          sync: true
        }, this.options, {}, opts);
        var _opts = opts,
            sync = _opts.sync;
        var that = this,
            types = {},
            refObjs = [],
            // For checking cyclic references
        refKeys = [],
            // For checking cyclic references
        promisesDataRoot = []; // Clone the object deeply while at the same time replacing any
        //   special types or cyclic reference:

        var cyclic = 'cyclic' in opts ? opts.cyclic : true;
        var _opts2 = opts,
            encapsulateObserver = _opts2.encapsulateObserver;

        var ret = _encapsulate('', obj, cyclic, stateObj || {}, promisesDataRoot);
        /**
         *
         * @param {Any} ret
         * @returns {GenericArray|PlainObject|string|false}
         */


        function finish(ret) {
          // Add `$types` to result only if we ever bumped into a
          //  special type (or special case where object has own `$types`)
          var typeNames = Object.values(types);

          if (opts.iterateNone) {
            if (typeNames.length) {
              return typeNames[0];
            }

            return Typeson.getJSONType(ret);
          }

          if (typeNames.length) {
            if (opts.returnTypeNames) {
              return _toConsumableArray(new Set(typeNames));
            } // Special if array (or a primitive) was serialized
            //   because JSON would ignore custom `$types` prop on it


            if (!ret || !isPlainObject(ret) || // Also need to handle if this is an object with its
            //   own `$types` property (to avoid ambiguity)
            hasOwn$1.call(ret, '$types')) {
              ret = {
                $: ret,
                $types: {
                  $: types
                }
              };
            } else {
              ret.$types = types;
            } // No special types

          } else if (isObject(ret) && hasOwn$1.call(ret, '$types')) {
            ret = {
              $: ret,
              $types: true
            };
          }

          if (opts.returnTypeNames) {
            return false;
          }

          return ret;
        }
        /**
         *
         * @param {Any} ret
         * @param {GenericArray} promisesData
         * @returns {Promise<Any>}
         */


        function checkPromises(_x, _x2) {
          return _checkPromises.apply(this, arguments);
        }
        /**
         *
         * @param {object} stateObj
         * @param {object} ownKeysObj
         * @param {function} cb
         * @returns {undefined}
         */


        function _checkPromises() {
          _checkPromises = _asyncToGenerator(
          /*#__PURE__*/
          regeneratorRuntime.mark(function _callee2(ret, promisesData) {
            var promResults;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    _context2.next = 2;
                    return Promise.all(promisesData.map(function (pd) {
                      return pd[1].p;
                    }));

                  case 2:
                    promResults = _context2.sent;
                    _context2.next = 5;
                    return Promise.all(promResults.map(
                    /*#__PURE__*/
                    function () {
                      var _ref = _asyncToGenerator(
                      /*#__PURE__*/
                      regeneratorRuntime.mark(function _callee(promResult) {
                        var newPromisesData, _promisesData$splice, _promisesData$splice2, prData, _prData, keyPath, cyclic, stateObj, parentObj, key, detectedType, encaps, isTypesonPromise, encaps2;

                        return regeneratorRuntime.wrap(function _callee$(_context) {
                          while (1) {
                            switch (_context.prev = _context.next) {
                              case 0:
                                newPromisesData = [];
                                _promisesData$splice = promisesData.splice(0, 1), _promisesData$splice2 = _slicedToArray(_promisesData$splice, 1), prData = _promisesData$splice2[0];
                                _prData = _slicedToArray(prData, 7), keyPath = _prData[0], cyclic = _prData[2], stateObj = _prData[3], parentObj = _prData[4], key = _prData[5], detectedType = _prData[6];
                                encaps = _encapsulate(keyPath, promResult, cyclic, stateObj, newPromisesData, true, detectedType);
                                isTypesonPromise = hasConstructorOf(encaps, TypesonPromise); // Handle case where an embedded custom type itself
                                //   returns a `Typeson.Promise`

                                if (!(keyPath && isTypesonPromise)) {
                                  _context.next = 11;
                                  break;
                                }

                                _context.next = 8;
                                return encaps.p;

                              case 8:
                                encaps2 = _context.sent;
                                parentObj[key] = encaps2;
                                return _context.abrupt("return", checkPromises(ret, newPromisesData));

                              case 11:
                                if (keyPath) {
                                  parentObj[key] = encaps;
                                } else if (isTypesonPromise) {
                                  ret = encaps.p;
                                } else {
                                  // If this is itself a `Typeson.Promise` (because the
                                  //   original value supplied was a `Promise` or
                                  //   because the supplied custom type value resolved
                                  //   to one), returning it below will be fine since
                                  //   a `Promise` is expected anyways given current
                                  //   config (and if not a `Promise`, it will be ready
                                  //   as the resolve value)
                                  ret = encaps;
                                }

                                return _context.abrupt("return", checkPromises(ret, newPromisesData));

                              case 13:
                              case "end":
                                return _context.stop();
                            }
                          }
                        }, _callee);
                      }));

                      return function (_x3) {
                        return _ref.apply(this, arguments);
                      };
                    }()));

                  case 5:
                    return _context2.abrupt("return", ret);

                  case 6:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));
          return _checkPromises.apply(this, arguments);
        }

        function _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, cb) {
          Object.assign(stateObj, ownKeysObj);
          var vals = internalStateObjPropsToIgnore.map(function (prop) {
            var tmp = stateObj[prop];
            delete stateObj[prop];
            return tmp;
          }); // eslint-disable-next-line callback-return

          cb();
          internalStateObjPropsToIgnore.forEach(function (prop, i) {
            stateObj[prop] = vals[i];
          });
        }
        /**
         *
         * @param {string} keypath
         * @param {Any} value
         * @param {boolean} cyclic
         * @param {PlainObject} stateObj
         * @param {boolean} promisesData
         * @param {boolean} resolvingTypesonPromise
         * @param {string} detectedType
         * @returns {Any}
         */


        function _encapsulate(keypath, value, cyclic, stateObj, promisesData, resolvingTypesonPromise, detectedType) {
          var ret;
          var observerData = {};

          var $typeof = _typeof(value);

          var runObserver = encapsulateObserver ? function (obj) {
            var type = detectedType || stateObj.type || Typeson.getJSONType(value);
            encapsulateObserver(Object.assign(obj || observerData, {
              keypath: keypath,
              value: value,
              cyclic: cyclic,
              stateObj: stateObj,
              promisesData: promisesData,
              resolvingTypesonPromise: resolvingTypesonPromise,
              awaitingTypesonPromise: hasConstructorOf(value, TypesonPromise)
            }, {
              type: type
            }));
          } : null;

          if (['string', 'boolean', 'number', 'undefined'].includes($typeof)) {
            if (value === undefined || $typeof === 'number' && (isNaN(value) || value === -Infinity || value === Infinity)) {
              if (stateObj.replaced) {
                ret = value;
              } else {
                ret = replace(keypath, value, stateObj, promisesData, false, resolvingTypesonPromise, runObserver);
              }

              if (ret !== value) {
                observerData = {
                  replaced: ret
                };
              }
            } else {
              ret = value;
            }

            if (runObserver) {
              runObserver();
            }

            return ret;
          }

          if (value === null) {
            if (runObserver) {
              runObserver();
            }

            return value;
          }

          if (cyclic && !stateObj.iterateIn && !stateObj.iterateUnsetNumeric && value && _typeof(value) === 'object') {
            // Options set to detect cyclic references and be able
            //   to rewrite them.
            var refIndex = refObjs.indexOf(value);

            if (refIndex < 0) {
              if (cyclic === true) {
                refObjs.push(value);
                refKeys.push(keypath);
              }
            } else {
              types[keypath] = '#';

              if (runObserver) {
                runObserver({
                  cyclicKeypath: refKeys[refIndex]
                });
              }

              return '#' + refKeys[refIndex];
            }
          }

          var isPlainObj = isPlainObject(value);
          var isArr = isArray(value);
          var replaced = // Running replace will cause infinite loop as will test
          //   positive again
          (isPlainObj || isArr) && (!that.plainObjectReplacers.length || stateObj.replaced) || stateObj.iterateIn ? // Optimization: if plain object and no plain-object
          //   replacers, don't try finding a replacer
          value : replace(keypath, value, stateObj, promisesData, isPlainObj || isArr, null, runObserver);
          var clone;

          if (replaced !== value) {
            ret = replaced;
            observerData = {
              replaced: replaced
            };
          } else {
            // eslint-disable-next-line no-lonely-if
            if (keypath === '' && hasConstructorOf(value, TypesonPromise)) {
              promisesData.push([keypath, value, cyclic, stateObj, undefined, undefined, stateObj.type]);
              ret = value;
            } else if (isArr && stateObj.iterateIn !== 'object' || stateObj.iterateIn === 'array') {
              clone = new Array(value.length);
              observerData = {
                clone: clone
              };
            } else if (!['function', 'symbol'].includes(_typeof(value)) && !('toJSON' in value) && !hasConstructorOf(value, TypesonPromise) && !hasConstructorOf(value, Promise) && !hasConstructorOf(value, ArrayBuffer) || isPlainObj || stateObj.iterateIn === 'object') {
              clone = {};

              if (stateObj.addLength) {
                clone.length = value.length;
              }

              observerData = {
                clone: clone
              };
            } else {
              ret = value; // Only clone vanilla objects and arrays
            }
          }

          if (runObserver) {
            runObserver();
          }

          if (opts.iterateNone) {
            return clone || ret;
          }

          if (!clone) {
            return ret;
          } // Iterate object or array


          if (stateObj.iterateIn) {
            var _loop = function _loop(key) {
              var ownKeysObj = {
                ownKeys: hasOwn$1.call(value, key)
              };

              _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, function () {
                var kp = keypath + (keypath ? '.' : '') + escapeKeyPathComponent(key);

                var val = _encapsulate(kp, value[key], Boolean(cyclic), stateObj, promisesData, resolvingTypesonPromise);

                if (hasConstructorOf(val, TypesonPromise)) {
                  promisesData.push([kp, val, Boolean(cyclic), stateObj, clone, key, stateObj.type]);
                } else if (val !== undefined) {
                  clone[key] = val;
                }
              });
            };

            // eslint-disable-next-line guard-for-in
            for (var key in value) {
              _loop(key);
            }

            if (runObserver) {
              runObserver({
                endIterateIn: true,
                end: true
              });
            }
          } else {
            // Note: Non-indexes on arrays won't survive stringify so
            //  somewhat wasteful for arrays, but so too is iterating
            //  all numeric indexes on sparse arrays when not wanted
            //  or filtering own keys for positive integers
            keys(value).forEach(function (key) {
              var kp = keypath + (keypath ? '.' : '') + escapeKeyPathComponent(key);
              var ownKeysObj = {
                ownKeys: true
              };

              _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, function () {
                var val = _encapsulate(kp, value[key], Boolean(cyclic), stateObj, promisesData, resolvingTypesonPromise);

                if (hasConstructorOf(val, TypesonPromise)) {
                  promisesData.push([kp, val, Boolean(cyclic), stateObj, clone, key, stateObj.type]);
                } else if (val !== undefined) {
                  clone[key] = val;
                }
              });
            });

            if (runObserver) {
              runObserver({
                endIterateOwn: true,
                end: true
              });
            }
          } // Iterate array for non-own numeric properties (we can't
          //   replace the prior loop though as it iterates non-integer
          //   keys)


          if (stateObj.iterateUnsetNumeric) {
            var vl = value.length;

            var _loop2 = function _loop2(i) {
              if (!(i in value)) {
                // No need to escape numeric
                var kp = keypath + (keypath ? '.' : '') + i;
                var ownKeysObj = {
                  ownKeys: false
                };

                _adaptBuiltinStateObjectProperties(stateObj, ownKeysObj, function () {
                  var val = _encapsulate(kp, undefined, Boolean(cyclic), stateObj, promisesData, resolvingTypesonPromise);

                  if (hasConstructorOf(val, TypesonPromise)) {
                    promisesData.push([kp, val, Boolean(cyclic), stateObj, clone, i, stateObj.type]);
                  } else if (val !== undefined) {
                    clone[i] = val;
                  }
                });
              }
            };

            for (var i = 0; i < vl; i++) {
              _loop2(i);
            }

            if (runObserver) {
              runObserver({
                endIterateUnsetNumeric: true,
                end: true
              });
            }
          }

          return clone;
        }
        /**
         *
         * @param {string} keypath
         * @param {Any} value
         * @param {PlainObject} stateObj
         * @param {GenericArray} promisesData
         * @param {boolean} plainObject
         * @param {boolean} resolvingTypesonPromise
         * @param {function} [runObserver]
         * @returns {*}
         */


        function replace(keypath, value, stateObj, promisesData, plainObject, resolvingTypesonPromise, runObserver) {
          // Encapsulate registered types
          var replacers = plainObject ? that.plainObjectReplacers : that.nonplainObjectReplacers;
          var i = replacers.length;

          while (i--) {
            var replacer = replacers[i];

            if (replacer.test(value, stateObj)) {
              var type = replacer.type;

              if (that.revivers[type]) {
                // Record the type only if a corresponding reviver
                //   exists. This is to support specs where only
                //   replacement is done.
                // For example, ensuring deep cloning of the object,
                //   or replacing a type to its equivalent without
                //   the need to revive it.
                var existing = types[keypath]; // type can comprise an array of types (see test
                //   "should support intermediate types")

                types[keypath] = existing ? [type].concat(existing) : type;
              }

              Object.assign(stateObj, {
                type: type,
                replaced: true
              });

              if ((sync || !replacer.replaceAsync) && !replacer.replace) {
                if (runObserver) {
                  runObserver({
                    typeDetected: true
                  });
                }

                return _encapsulate(keypath, value, cyclic && 'readonly', stateObj, promisesData, resolvingTypesonPromise, type);
              }

              if (runObserver) {
                runObserver({
                  replacing: true
                });
              } // Now, also traverse the result in case it contains its
              //   own types to replace


              var replaceMethod = sync || !replacer.replaceAsync ? 'replace' : 'replaceAsync';
              return _encapsulate(keypath, replacer[replaceMethod](value, stateObj), cyclic && 'readonly', stateObj, promisesData, resolvingTypesonPromise, type);
            }
          }

          return value;
        }

        return promisesDataRoot.length ? sync && opts.throwOnBadSyncType ? function () {
          throw new TypeError('Sync method requested but async result obtained');
        }() : Promise.resolve(checkPromises(ret, promisesDataRoot)).then(finish) : !sync && opts.throwOnBadSyncType ? function () {
          throw new TypeError('Async method requested but sync result obtained');
        }() // If this is a synchronous request for stringification, yet
        //   a promise is the result, we don't want to resolve leading
        //   to an async result, so we return an array to avoid
        //   ambiguity
        : opts.stringification && sync ? [finish(ret)] : sync ? finish(ret) : Promise.resolve(finish(ret));
      }
      /**
       * Also sync but throws on non-sync result.
       * @param {*} obj
       * @param {object} stateObj
       * @param {object} opts
       * @returns {*}
       */

    }, {
      key: "encapsulateSync",
      value: function encapsulateSync(obj, stateObj, opts) {
        return this.encapsulate(obj, stateObj, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: true
        }));
      }
      /**
       * @param {*} obj
       * @param {object} stateObj
       * @param {object} opts
       * @returns {*}
       */

    }, {
      key: "encapsulateAsync",
      value: function encapsulateAsync(obj, stateObj, opts) {
        return this.encapsulate(obj, stateObj, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: false
        }));
      }
      /**
       * Revive an encapsulated object.
       * This method is used internally by `Typeson.parse()`.
       * @param {object} obj - Object to revive. If it has `$types` member, the
       *   properties that are listed there will be replaced with its true type
       *   instead of just plain objects.
       * @param {object} opts
       * @throws TypeError If mismatch between sync/async type and result
       * @returns {Promise|*} If async, returns a Promise that resolves to `*`
       */

    }, {
      key: "revive",
      value: function revive(obj, opts) {
        var types = obj && obj.$types; // No type info added. Revival not needed.

        if (!types) {
          return obj;
        } // Object happened to have own `$types` property but with
        //   no actual types, so we unescape and return that object


        if (types === true) {
          return obj.$;
        }

        opts = _objectSpread2({
          sync: true
        }, this.options, {}, opts);
        var _opts3 = opts,
            sync = _opts3.sync;
        var keyPathResolutions = [];
        var stateObj = {};
        var ignore$Types = true; // Special when root object is not a trivial Object, it will
        //   be encapsulated in `$`. It will also be encapsulated in
        //   `$` if it has its own `$` property to avoid ambiguity

        if (types.$ && isPlainObject(types.$)) {
          obj = obj.$;
          types = types.$;
          ignore$Types = false;
        }

        var that = this;
        /**
         * @callback RevivalReducer
         * @param {Any} value
         * @param {string} type
         * @returns {Any}
         */

        /**
         *
         * @param {string} type
         * @param {Any} val
         * @returns {[type]} [description]
         */

        function executeReviver(type, val) {
          var _ref2 = that.revivers[type] || [],
              _ref3 = _slicedToArray(_ref2, 1),
              reviver = _ref3[0];

          if (!reviver) {
            throw new Error('Unregistered type: ' + type);
          } // Only `sync` expected here, as problematic async would
          //  be missing both `reviver` and `reviverAsync`, and
          //  encapsulation shouldn't have added types, so
          //  should have made an early exit


          if (sync && !('revive' in reviver)) {
            // Just return value as is
            return val;
          }

          return reviver[sync && reviver.revive ? 'revive' : !sync && reviver.reviveAsync ? 'reviveAsync' : 'revive'](val, stateObj);
        }
        /**
         *
         * @returns {void|TypesonPromise<void>}
         */


        function revivePlainObjects() {
          // const references = [];
          // const reviveTypes = [];
          var plainObjectTypes = [];
          Object.entries(types).forEach(function (_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                keypath = _ref5[0],
                type = _ref5[1];

            if (type === '#') {
              /*
              references.push({
                  keypath,
                  reference: getByKeyPath(obj, keypath)
              });
              */
              return;
            }

            [].concat(type).forEach(function (type) {
              var _ref6 = that.revivers[type] || [null, {}],
                  _ref7 = _slicedToArray(_ref6, 2),
                  plain = _ref7[1].plain;

              if (!plain) {
                // reviveTypes.push({keypath, type});
                return;
              }

              plainObjectTypes.push({
                keypath: keypath,
                type: type
              });
              delete types[keypath]; // Avoid repeating
            });
          });

          if (!plainObjectTypes.length) {
            return undefined;
          } // console.log(plainObjectTypes.sort(nestedPathsFirst));

          /**
          * @typedef {PlainObject} PlainObjectType
          * @property {string} keypath
          * @property {string} type
          */


          return plainObjectTypes.sort(nestedPathsFirst).reduce(function reducer(possibleTypesonPromise, _ref8) {
            var keypath = _ref8.keypath,
                type = _ref8.type;

            if (isThenable(possibleTypesonPromise)) {
              return possibleTypesonPromise.then(function (val) {
                return reducer(val, {
                  keypath: keypath,
                  type: type
                });
              });
            } // console.log('obj', JSON.stringify(keypath), obj);


            var val = getByKeyPath(obj, keypath);
            val = executeReviver(type, val);

            if (hasConstructorOf(val, TypesonPromise)) {
              return val.then(function (v) {
                var newVal = setAtKeyPath(obj, keypath, v);

                if (newVal === v) {
                  obj = newVal;
                }

                return undefined;
              });
            }

            var newVal = setAtKeyPath(obj, keypath, val);

            if (newVal === val) {
              obj = newVal;
            }

            return undefined;
          }, undefined // This argument must be explicit
          ); // references.forEach(({keypath, reference}) => {});
          // reviveTypes.sort(nestedPathsFirst).forEach(() => {});
        }

        var revivalPromises = [];
        /**
         *
         * @param {string} keypath
         * @param {Any} value
         * @param {?(Array|object)} target
         * @param {Array|object} [clone]
         * @param {string} [key]
         * @returns {Any}
         */

        function _revive(keypath, value, target, clone, key) {
          if (ignore$Types && keypath === '$types') {
            return undefined;
          }

          var type = types[keypath];
          var isArr = isArray(value);

          if (isArr || isPlainObject(value)) {
            var _clone = isArr ? new Array(value.length) : {}; // Iterate object or array


            keys(value).forEach(function (k) {
              var val = _revive(keypath + (keypath ? '.' : '') + escapeKeyPathComponent(k), value[k], target || _clone, _clone, k);

              var set = function set(v) {
                if (hasConstructorOf(v, Undefined)) {
                  _clone[k] = undefined;
                } else if (v !== undefined) {
                  _clone[k] = v;
                }

                return v;
              };

              if (hasConstructorOf(val, TypesonPromise)) {
                revivalPromises.push(val.then(function (ret) {
                  return set(ret);
                }));
              } else {
                set(val);
              }
            });
            value = _clone; // Try to resolve cyclic reference as soon as available

            while (keyPathResolutions.length) {
              var _keyPathResolutions$ = _slicedToArray(keyPathResolutions[0], 4),
                  _target = _keyPathResolutions$[0],
                  keyPath = _keyPathResolutions$[1],
                  _clone2 = _keyPathResolutions$[2],
                  k = _keyPathResolutions$[3];

              var val = getByKeyPath(_target, keyPath); // Typeson.Undefined not expected here as not cyclic or
              //   `undefined`

              if (val !== undefined) {
                _clone2[k] = val;
              } else {
                break;
              }

              keyPathResolutions.splice(0, 1);
            }
          }

          if (!type) {
            return value;
          }

          if (type === '#') {
            var _ret = getByKeyPath(target, value.slice(1));

            if (_ret === undefined) {
              // Cyclic reference not yet available
              keyPathResolutions.push([target, value.slice(1), clone, key]);
            }

            return _ret;
          } // `type` can be an array here


          return [].concat(type).reduce(function reducer(val, typ) {
            if (hasConstructorOf(val, TypesonPromise)) {
              return val.then(function (v) {
                // TypesonPromise here too
                return reducer(v, typ);
              });
            }

            return executeReviver(typ, val);
          }, value);
        }
        /**
         *
         * @param {Any} retrn
         * @returns {undefined|Any}
         */


        function checkUndefined(retrn) {
          return hasConstructorOf(retrn, Undefined) ? undefined : retrn;
        }

        var possibleTypesonPromise = revivePlainObjects();
        var ret;

        if (hasConstructorOf(possibleTypesonPromise, TypesonPromise)) {
          ret = possibleTypesonPromise.then(function () {
            return obj;
          });
        } else {
          ret = _revive('', obj, null);

          if (revivalPromises.length) {
            // Ensure children resolved
            ret = TypesonPromise.resolve(ret).then(function (r) {
              return TypesonPromise.all([// May be a TypesonPromise or not
              r].concat(revivalPromises));
            }).then(function (_ref9) {
              var _ref10 = _slicedToArray(_ref9, 1),
                  r = _ref10[0];

              return r;
            });
          }
        }

        return isThenable(ret) ? sync && opts.throwOnBadSyncType ? function () {
          throw new TypeError('Sync method requested but async result obtained');
        }() : hasConstructorOf(ret, TypesonPromise) ? ret.p.then(checkUndefined) : ret : !sync && opts.throwOnBadSyncType ? function () {
          throw new TypeError('Async method requested but sync result obtained');
        }() : sync ? checkUndefined(ret) : Promise.resolve(checkUndefined(ret));
      }
      /**
       * Also sync but throws on non-sync result.
       * @param {Any} obj
       * @param {object} opts
       * @returns {Any}
       */

    }, {
      key: "reviveSync",
      value: function reviveSync(obj, opts) {
        return this.revive(obj, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: true
        }));
      }
      /**
      * @param {Any} obj
      * @param {object} opts
      * @returns {Promise} Resolves to `*`
      */

    }, {
      key: "reviveAsync",
      value: function reviveAsync(obj, opts) {
        return this.revive(obj, _objectSpread2({
          throwOnBadSyncType: true
        }, opts, {
          sync: false
        }));
      }
      /**
       * Register types.
       * For examples on how to use this method, see
       *   {@link https://github.com/dfahlander/typeson-registry/tree/master/types}.
       * @param {object.<string,Function[]>[]} typeSpecSets - Types and
       *   their functions [test, encapsulate, revive];
       * @param {object} opts
       * @returns {Typeson}
       */

    }, {
      key: "register",
      value: function register(typeSpecSets, opts) {
        opts = opts || {};
        [].concat(typeSpecSets).forEach(function R(typeSpec) {
          var _this = this;

          // Allow arrays of arrays of arrays...
          if (isArray(typeSpec)) {
            return typeSpec.map(function (typSpec) {
              return R.call(_this, typSpec);
            });
          }

          typeSpec && keys(typeSpec).forEach(function (typeId) {
            if (typeId === '#') {
              throw new TypeError('# cannot be used as a type name as it is reserved ' + 'for cyclic objects');
            } else if (Typeson.JSON_TYPES.includes(typeId)) {
              throw new TypeError('Plain JSON object types are reserved as type names');
            }

            var spec = typeSpec[typeId];
            var replacers = spec && spec.testPlainObjects ? this.plainObjectReplacers : this.nonplainObjectReplacers;
            var existingReplacer = replacers.filter(function (r) {
              return r.type === typeId;
            });

            if (existingReplacer.length) {
              // Remove existing spec and replace with this one.
              replacers.splice(replacers.indexOf(existingReplacer[0]), 1);
              delete this.revivers[typeId];
              delete this.types[typeId];
            }

            if (typeof spec === 'function') {
              // Support registering just a class without replacer/reviver
              var Class = spec;
              spec = {
                test: function test(x) {
                  return x && x.constructor === Class;
                },
                replace: function replace(x) {
                  return _objectSpread2({}, x);
                },
                revive: function revive(x) {
                  return Object.assign(Object.create(Class.prototype), x);
                }
              };
            } else if (isArray(spec)) {
              var _spec = spec,
                  _spec2 = _slicedToArray(_spec, 3),
                  test = _spec2[0],
                  replace = _spec2[1],
                  revive = _spec2[2];

              spec = {
                test: test,
                replace: replace,
                revive: revive
              };
            }

            if (!spec || !spec.test) {
              return;
            }

            var replacerObj = {
              type: typeId,
              test: spec.test.bind(spec)
            };

            if (spec.replace) {
              replacerObj.replace = spec.replace.bind(spec);
            }

            if (spec.replaceAsync) {
              replacerObj.replaceAsync = spec.replaceAsync.bind(spec);
            }

            var start = typeof opts.fallback === 'number' ? opts.fallback : opts.fallback ? 0 : Infinity;

            if (spec.testPlainObjects) {
              this.plainObjectReplacers.splice(start, 0, replacerObj);
            } else {
              this.nonplainObjectReplacers.splice(start, 0, replacerObj);
            } // Todo: We might consider a testAsync type


            if (spec.revive || spec.reviveAsync) {
              var reviverObj = {};

              if (spec.revive) {
                reviverObj.revive = spec.revive.bind(spec);
              }

              if (spec.reviveAsync) {
                reviverObj.reviveAsync = spec.reviveAsync.bind(spec);
              }

              this.revivers[typeId] = [reviverObj, {
                plain: spec.testPlainObjects
              }];
            } // Record to be retrieved via public types property.


            this.types[typeId] = spec;
          }, this);
        }, this);
        return this;
      }
    }]);

    return Typeson;
  }();
  /**
   * We keep this function minimized so if using two instances of this
   * library, where one is minimized and one is not, it will still work
   * with `hasConstructorOf`.
   * @class
   */


  var Undefined = function Undefined() {
    _classCallCheck(this, Undefined);
  }; // eslint-disable-line space-before-blocks


  Undefined.__typeson__type__ = 'TypesonUndefined'; // The following provide classes meant to avoid clashes with other values
  // To insist `undefined` should be added

  Typeson.Undefined = Undefined; // To support async encapsulation/stringification

  Typeson.Promise = TypesonPromise; // Some fundamental type-checking utilities

  Typeson.isThenable = isThenable;
  Typeson.toStringTag = toStringTag;
  Typeson.hasConstructorOf = hasConstructorOf;
  Typeson.isObject = isObject;
  Typeson.isPlainObject = isPlainObject;
  Typeson.isUserObject = isUserObject;
  Typeson.escapeKeyPathComponent = escapeKeyPathComponent;
  Typeson.unescapeKeyPathComponent = unescapeKeyPathComponent;
  Typeson.getByKeyPath = getByKeyPath;
  Typeson.getJSONType = getJSONType;
  Typeson.JSON_TYPES = ['null', 'boolean', 'number', 'string', 'array', 'object'];

  return Typeson;

})));
});

var structuredCloning = createCommonjsModule(function (module, exports) {
!function(e,t){module.exports=t();}(commonjsGlobal,(function(){function _typeof$1(e){return (_typeof$1="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck$1(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties$1(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function _defineProperty$1(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ownKeys$1(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n);}return r}function _toConsumableArray$1(e){return function _arrayWithoutHoles$1(e){if(Array.isArray(e))return _arrayLikeToArray$1(e)}(e)||function _iterableToArray$1(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||function _unsupportedIterableToArray$1(e,t){if(!e)return;if("string"==typeof e)return _arrayLikeToArray$1(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);"Object"===r&&e.constructor&&(r=e.constructor.name);if("Map"===r||"Set"===r)return Array.from(e);if("Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return _arrayLikeToArray$1(e,t)}(e)||function _nonIterableSpread$1(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray$1(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function _typeof(e){return (_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function _typeof(e){return typeof e}:function _typeof(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n);}}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function ownKeys(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n);}return r}function _objectSpread2(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys(Object(r),!0).forEach((function(t){_defineProperty(e,t,r[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t));}));}return e}function _slicedToArray(e,t){return function _arrayWithHoles(e){if(Array.isArray(e))return e}(e)||function _iterableToArrayLimit(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var r=[],n=!0,i=!1,o=void 0;try{for(var a,c=e[Symbol.iterator]();!(n=(a=c.next()).done)&&(r.push(a.value),!t||r.length!==t);n=!0);}catch(e){i=!0,o=e;}finally{try{n||null==c.return||c.return();}finally{if(i)throw o}}return r}(e,t)||_unsupportedIterableToArray(e,t)||function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _toConsumableArray(e){return function _arrayWithoutHoles(e){if(Array.isArray(e))return _arrayLikeToArray(e)}(e)||function _iterableToArray(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(e)||_unsupportedIterableToArray(e)||function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _unsupportedIterableToArray(e,t){if(e){if("string"==typeof e)return _arrayLikeToArray(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return "Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?_arrayLikeToArray(e,t):void 0}}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}var e=function TypesonPromise(e){_classCallCheck(this,TypesonPromise),this.p=new Promise(e);};e.__typeson__type__="TypesonPromise","undefined"!=typeof Symbol&&(e.prototype[Symbol.toStringTag]="TypesonPromise"),e.prototype.then=function(t,r){var n=this;return new e((function(e,i){n.p.then((function(r){e(t?t(r):r);})).catch((function(e){return r?r(e):Promise.reject(e)})).then(e,i);}))},e.prototype.catch=function(e){return this.then(null,e)},e.resolve=function(t){return new e((function(e){e(t);}))},e.reject=function(t){return new e((function(e,r){r(t);}))},["all","race"].forEach((function(t){e[t]=function(r){return new e((function(e,n){Promise[t](r.map((function(e){return e&&e.constructor&&"TypesonPromise"===e.constructor.__typeson__type__?e.p:e}))).then(e,n);}))};}));var t={}.toString,r={}.hasOwnProperty,n=Object.getPrototypeOf,i=r.toString;function isThenable(e,t){return isObject(e)&&"function"==typeof e.then&&(!t||"function"==typeof e.catch)}function toStringTag(e){return t.call(e).slice(8,-1)}function hasConstructorOf(e,t){if(!e||"object"!==_typeof(e))return !1;var o=n(e);if(!o)return null===t;var a=r.call(o,"constructor")&&o.constructor;return "function"!=typeof a?null===t:t===a||(null!==t&&i.call(a)===i.call(t)||"function"==typeof t&&"string"==typeof a.__typeson__type__&&a.__typeson__type__===t.__typeson__type__)}function isPlainObject(e){return !(!e||"Object"!==toStringTag(e))&&(!n(e)||hasConstructorOf(e,Object))}function isObject(e){return e&&"object"===_typeof(e)}function escapeKeyPathComponent(e){return e.replace(/~/g,"~0").replace(/\./g,"~1")}function unescapeKeyPathComponent(e){return e.replace(/~1/g,".").replace(/~0/g,"~")}function getByKeyPath(e,t){if(""===t)return e;var r=t.indexOf(".");if(r>-1){var n=e[unescapeKeyPathComponent(t.slice(0,r))];return void 0===n?void 0:getByKeyPath(n,t.slice(r+1))}return e[unescapeKeyPathComponent(t)]}function setAtKeyPath(e,t,r){if(""===t)return r;var n=t.indexOf(".");return n>-1?setAtKeyPath(e[unescapeKeyPathComponent(t.slice(0,n))],t.slice(n+1),r):(e[unescapeKeyPathComponent(t)]=r,e)}function _await(e,t,r){return r?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}var o=Object.keys,a=Array.isArray,c={}.hasOwnProperty,u=["type","replaced","iterateIn","iterateUnsetNumeric"];function _async(e){return function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];try{return Promise.resolve(e.apply(this,t))}catch(e){return Promise.reject(e)}}}function nestedPathsFirst(e,t){if(""===e.keypath)return -1;var r=e.keypath.match(/\./g)||0,n=t.keypath.match(/\./g)||0;return r&&(r=r.length),n&&(n=n.length),r>n?-1:r<n?1:e.keypath<t.keypath?-1:e.keypath>t.keypath}var s=function(){function Typeson(e){_classCallCheck(this,Typeson),this.options=e,this.plainObjectReplacers=[],this.nonplainObjectReplacers=[],this.revivers={},this.types={};}return function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),e}(Typeson,[{key:"stringify",value:function stringify(e,t,r,n){n=_objectSpread2(_objectSpread2(_objectSpread2({},this.options),n),{},{stringification:!0});var i=this.encapsulate(e,null,n);return a(i)?JSON.stringify(i[0],t,r):i.then((function(e){return JSON.stringify(e,t,r)}))}},{key:"stringifySync",value:function stringifySync(e,t,r,n){return this.stringify(e,t,r,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},n),{},{sync:!0}))}},{key:"stringifyAsync",value:function stringifyAsync(e,t,r,n){return this.stringify(e,t,r,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},n),{},{sync:!1}))}},{key:"parse",value:function parse(e,t,r){return r=_objectSpread2(_objectSpread2(_objectSpread2({},this.options),r),{},{parse:!0}),this.revive(JSON.parse(e,t),r)}},{key:"parseSync",value:function parseSync(e,t,r){return this.parse(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!0}))}},{key:"parseAsync",value:function parseAsync(e,t,r){return this.parse(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!1}))}},{key:"specialTypeNames",value:function specialTypeNames(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return r.returnTypeNames=!0,this.encapsulate(e,t,r)}},{key:"rootTypeName",value:function rootTypeName(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return r.iterateNone=!0,this.encapsulate(e,t,r)}},{key:"encapsulate",value:function encapsulate(t,r,n){var i=_async((function(t,r){return _await(Promise.all(r.map((function(e){return e[1].p}))),(function(n){return _await(Promise.all(n.map(_async((function(n){var o=!1,a=[],c=_slicedToArray(r.splice(0,1),1),u=_slicedToArray(c[0],7),s=u[0],f=u[2],l=u[3],p=u[4],y=u[5],v=u[6],b=_encapsulate(s,n,f,l,a,!0,v),d=hasConstructorOf(b,e);return function _invoke(e,t){var r=e();return r&&r.then?r.then(t):t(r)}((function(){if(s&&d)return _await(b.p,(function(e){return p[y]=e,o=!0,i(t,a)}))}),(function(e){return o?e:(s?p[y]=b:t=d?b.p:b,i(t,a))}))})))),(function(){return t}))}))})),s=(n=_objectSpread2(_objectSpread2({sync:!0},this.options),n)).sync,f=this,l={},p=[],y=[],v=[],b=!("cyclic"in n)||n.cyclic,d=n.encapsulateObserver,h=_encapsulate("",t,b,r||{},v);function finish(e){var t=Object.values(l);if(n.iterateNone)return t.length?t[0]:Typeson.getJSONType(e);if(t.length){if(n.returnTypeNames)return _toConsumableArray(new Set(t));e&&isPlainObject(e)&&!c.call(e,"$types")?e.$types=l:e={$:e,$types:{$:l}};}else isObject(e)&&c.call(e,"$types")&&(e={$:e,$types:!0});return !n.returnTypeNames&&e}function _adaptBuiltinStateObjectProperties(e,t,r){Object.assign(e,t);var n=u.map((function(t){var r=e[t];return delete e[t],r}));r(),u.forEach((function(t,r){e[t]=n[r];}));}function _encapsulate(t,r,i,u,s,v,b){var h,g={},m=_typeof(r),O=d?function(n){var o=b||u.type||Typeson.getJSONType(r);d(Object.assign(n||g,{keypath:t,value:r,cyclic:i,stateObj:u,promisesData:s,resolvingTypesonPromise:v,awaitingTypesonPromise:hasConstructorOf(r,e)},{type:o}));}:null;if(["string","boolean","number","undefined"].includes(m))return void 0===r||Number.isNaN(r)||r===Number.NEGATIVE_INFINITY||r===Number.POSITIVE_INFINITY?(h=u.replaced?r:replace(t,r,u,s,!1,v,O))!==r&&(g={replaced:h}):h=r,O&&O(),h;if(null===r)return O&&O(),r;if(i&&!u.iterateIn&&!u.iterateUnsetNumeric&&r&&"object"===_typeof(r)){var _=p.indexOf(r);if(!(_<0))return l[t]="#",O&&O({cyclicKeypath:y[_]}),"#"+y[_];!0===i&&(p.push(r),y.push(t));}var j,S=isPlainObject(r),T=a(r),w=(S||T)&&(!f.plainObjectReplacers.length||u.replaced)||u.iterateIn?r:replace(t,r,u,s,S||T,null,O);if(w!==r?(h=w,g={replaced:w}):""===t&&hasConstructorOf(r,e)?(s.push([t,r,i,u,void 0,void 0,u.type]),h=r):T&&"object"!==u.iterateIn||"array"===u.iterateIn?(j=new Array(r.length),g={clone:j}):(["function","symbol"].includes(_typeof(r))||"toJSON"in r||hasConstructorOf(r,e)||hasConstructorOf(r,Promise)||hasConstructorOf(r,ArrayBuffer))&&!S&&"object"!==u.iterateIn?h=r:(j={},u.addLength&&(j.length=r.length),g={clone:j}),O&&O(),n.iterateNone)return j||h;if(!j)return h;if(u.iterateIn){var A=function _loop(n){var o={ownKeys:c.call(r,n)};_adaptBuiltinStateObjectProperties(u,o,(function(){var o=t+(t?".":"")+escapeKeyPathComponent(n),a=_encapsulate(o,r[n],Boolean(i),u,s,v);hasConstructorOf(a,e)?s.push([o,a,Boolean(i),u,j,n,u.type]):void 0!==a&&(j[n]=a);}));};for(var P in r)A(P);O&&O({endIterateIn:!0,end:!0});}else o(r).forEach((function(n){var o=t+(t?".":"")+escapeKeyPathComponent(n);_adaptBuiltinStateObjectProperties(u,{ownKeys:!0},(function(){var t=_encapsulate(o,r[n],Boolean(i),u,s,v);hasConstructorOf(t,e)?s.push([o,t,Boolean(i),u,j,n,u.type]):void 0!==t&&(j[n]=t);}));})),O&&O({endIterateOwn:!0,end:!0});if(u.iterateUnsetNumeric){for(var I=r.length,C=function _loop2(n){if(!(n in r)){var o=t+(t?".":"")+n;_adaptBuiltinStateObjectProperties(u,{ownKeys:!1},(function(){var t=_encapsulate(o,void 0,Boolean(i),u,s,v);hasConstructorOf(t,e)?s.push([o,t,Boolean(i),u,j,n,u.type]):void 0!==t&&(j[n]=t);}));}},N=0;N<I;N++)C(N);O&&O({endIterateUnsetNumeric:!0,end:!0});}return j}function replace(e,t,r,n,i,o,a){for(var c=i?f.plainObjectReplacers:f.nonplainObjectReplacers,u=c.length;u--;){var p=c[u];if(p.test(t,r)){var y=p.type;if(f.revivers[y]){var v=l[e];l[e]=v?[y].concat(v):y;}return Object.assign(r,{type:y,replaced:!0}),!s&&p.replaceAsync||p.replace?(a&&a({replacing:!0}),_encapsulate(e,p[s||!p.replaceAsync?"replace":"replaceAsync"](t,r),b&&"readonly",r,n,o,y)):(a&&a({typeDetected:!0}),_encapsulate(e,t,b&&"readonly",r,n,o,y))}}return t}return v.length?s&&n.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():Promise.resolve(i(h,v)).then(finish):!s&&n.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():n.stringification&&s?[finish(h)]:s?finish(h):Promise.resolve(finish(h))}},{key:"encapsulateSync",value:function encapsulateSync(e,t,r){return this.encapsulate(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!0}))}},{key:"encapsulateAsync",value:function encapsulateAsync(e,t,r){return this.encapsulate(e,t,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},r),{},{sync:!1}))}},{key:"revive",value:function revive(t,r){var n=t&&t.$types;if(!n)return t;if(!0===n)return t.$;var i=(r=_objectSpread2(_objectSpread2({sync:!0},this.options),r)).sync,c=[],u={},s=!0;n.$&&isPlainObject(n.$)&&(t=t.$,n=n.$,s=!1);var l=this;function executeReviver(e,t){var r=_slicedToArray(l.revivers[e]||[],1)[0];if(!r)throw new Error("Unregistered type: "+e);return i&&!("revive"in r)?t:r[i&&r.revive?"revive":!i&&r.reviveAsync?"reviveAsync":"revive"](t,u)}var p=[];function checkUndefined(e){return hasConstructorOf(e,f)?void 0:e}var y,v=function revivePlainObjects(){var r=[];if(Object.entries(n).forEach((function(e){var t=_slicedToArray(e,2),i=t[0],o=t[1];"#"!==o&&[].concat(o).forEach((function(e){_slicedToArray(l.revivers[e]||[null,{}],2)[1].plain&&(r.push({keypath:i,type:e}),delete n[i]);}));})),r.length)return r.sort(nestedPathsFirst).reduce((function reducer(r,n){var i=n.keypath,o=n.type;if(isThenable(r))return r.then((function(e){return reducer(e,{keypath:i,type:o})}));var a=getByKeyPath(t,i);if(hasConstructorOf(a=executeReviver(o,a),e))return a.then((function(e){var r=setAtKeyPath(t,i,e);r===e&&(t=r);}));var c=setAtKeyPath(t,i,a);c===a&&(t=c);}),void 0)}();return hasConstructorOf(v,e)?y=v.then((function(){return t})):(y=function _revive(t,r,i,u,l){if(!s||"$types"!==t){var y=n[t],v=a(r);if(v||isPlainObject(r)){var b=v?new Array(r.length):{};for(o(r).forEach((function(n){var o=_revive(t+(t?".":"")+escapeKeyPathComponent(n),r[n],i||b,b,n),a=function set(e){return hasConstructorOf(e,f)?b[n]=void 0:void 0!==e&&(b[n]=e),e};hasConstructorOf(o,e)?p.push(o.then((function(e){return a(e)}))):a(o);})),r=b;c.length;){var d=_slicedToArray(c[0],4),h=d[0],g=d[1],m=d[2],O=d[3],_=getByKeyPath(h,g);if(void 0===_)break;m[O]=_,c.splice(0,1);}}if(!y)return r;if("#"===y){var j=getByKeyPath(i,r.slice(1));return void 0===j&&c.push([i,r.slice(1),u,l]),j}return [].concat(y).reduce((function reducer(t,r){return hasConstructorOf(t,e)?t.then((function(e){return reducer(e,r)})):executeReviver(r,t)}),r)}}("",t,null),p.length&&(y=e.resolve(y).then((function(t){return e.all([t].concat(p))})).then((function(e){return _slicedToArray(e,1)[0]})))),isThenable(y)?i&&r.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():hasConstructorOf(y,e)?y.p.then(checkUndefined):y:!i&&r.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():i?checkUndefined(y):Promise.resolve(checkUndefined(y))}},{key:"reviveSync",value:function reviveSync(e,t){return this.revive(e,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},t),{},{sync:!0}))}},{key:"reviveAsync",value:function reviveAsync(e,t){return this.revive(e,_objectSpread2(_objectSpread2({throwOnBadSyncType:!0},t),{},{sync:!1}))}},{key:"register",value:function register(e,t){return t=t||{},[].concat(e).forEach((function R(e){var r=this;if(a(e))return e.map((function(e){return R.call(r,e)}));e&&o(e).forEach((function(r){if("#"===r)throw new TypeError("# cannot be used as a type name as it is reserved for cyclic objects");if(Typeson.JSON_TYPES.includes(r))throw new TypeError("Plain JSON object types are reserved as type names");var n=e[r],i=n&&n.testPlainObjects?this.plainObjectReplacers:this.nonplainObjectReplacers,o=i.filter((function(e){return e.type===r}));if(o.length&&(i.splice(i.indexOf(o[0]),1),delete this.revivers[r],delete this.types[r]),"function"==typeof n){var c=n;n={test:function test(e){return e&&e.constructor===c},replace:function replace(e){return _objectSpread2({},e)},revive:function revive(e){return Object.assign(Object.create(c.prototype),e)}};}else if(a(n)){var u=_slicedToArray(n,3);n={test:u[0],replace:u[1],revive:u[2]};}if(n&&n.test){var s={type:r,test:n.test.bind(n)};n.replace&&(s.replace=n.replace.bind(n)),n.replaceAsync&&(s.replaceAsync=n.replaceAsync.bind(n));var f="number"==typeof t.fallback?t.fallback:t.fallback?0:Number.POSITIVE_INFINITY;if(n.testPlainObjects?this.plainObjectReplacers.splice(f,0,s):this.nonplainObjectReplacers.splice(f,0,s),n.revive||n.reviveAsync){var l={};n.revive&&(l.revive=n.revive.bind(n)),n.reviveAsync&&(l.reviveAsync=n.reviveAsync.bind(n)),this.revivers[r]=[l,{plain:n.testPlainObjects}];}this.types[r]=n;}}),this);}),this),this}}]),Typeson}(),f=function Undefined(){_classCallCheck(this,Undefined);};f.__typeson__type__="TypesonUndefined",s.Undefined=f,s.Promise=e,s.isThenable=isThenable,s.toStringTag=toStringTag,s.hasConstructorOf=hasConstructorOf,s.isObject=isObject,s.isPlainObject=isPlainObject,s.isUserObject=function isUserObject(e){if(!e||"Object"!==toStringTag(e))return !1;var t=n(e);return !t||(hasConstructorOf(e,Object)||isUserObject(t))},s.escapeKeyPathComponent=escapeKeyPathComponent,s.unescapeKeyPathComponent=unescapeKeyPathComponent,s.getByKeyPath=getByKeyPath,s.getJSONType=function getJSONType(e){return null===e?"null":Array.isArray(e)?"array":_typeof(e)},s.JSON_TYPES=["null","boolean","number","string","array","object"];for(var l={userObject:{test:function test(e,t){return s.isUserObject(e)},replace:function replace(e){return function _objectSpread2$1(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?ownKeys$1(Object(r),!0).forEach((function(t){_defineProperty$1(e,t,r[t]);})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):ownKeys$1(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t));}));}return e}({},e)},revive:function revive(e){return e}}},p=[{arrayNonindexKeys:{testPlainObjects:!0,test:function test(e,t){return !!Array.isArray(e)&&(Object.keys(e).some((function(e){return String(Number.parseInt(e))!==e}))&&(t.iterateIn="object",t.addLength=!0),!0)},replace:function replace(e,t){return t.iterateUnsetNumeric=!0,e},revive:function revive(e){if(Array.isArray(e))return e;var t=[];return Object.keys(e).forEach((function(r){var n=e[r];t[r]=n;})),t}}},{sparseUndefined:{test:function test(e,t){return void 0===e&&!1===t.ownKeys},replace:function replace(e){return 0},revive:function revive(e){}}}],y={undef:{test:function test(e,t){return void 0===e&&(t.ownKeys||!("ownKeys"in t))},replace:function replace(e){return 0},revive:function revive(e){return new s.Undefined}}},v={StringObject:{test:function test(e){return "String"===s.toStringTag(e)&&"object"===_typeof$1(e)},replace:function replace(e){return String(e)},revive:function revive(e){return new String(e)}},BooleanObject:{test:function test(e){return "Boolean"===s.toStringTag(e)&&"object"===_typeof$1(e)},replace:function replace(e){return Boolean(e)},revive:function revive(e){return new Boolean(e)}},NumberObject:{test:function test(e){return "Number"===s.toStringTag(e)&&"object"===_typeof$1(e)},replace:function replace(e){return Number(e)},revive:function revive(e){return new Number(e)}}},b=[{nan:{test:function test(e){return Number.isNaN(e)},replace:function replace(e){return "NaN"},revive:function revive(e){return Number.NaN}}},{infinity:{test:function test(e){return e===Number.POSITIVE_INFINITY},replace:function replace(e){return "Infinity"},revive:function revive(e){return Number.POSITIVE_INFINITY}}},{negativeInfinity:{test:function test(e){return e===Number.NEGATIVE_INFINITY},replace:function replace(e){return "-Infinity"},revive:function revive(e){return Number.NEGATIVE_INFINITY}}}],d={date:{test:function test(e){return "Date"===s.toStringTag(e)},replace:function replace(e){var t=e.getTime();return Number.isNaN(t)?"NaN":t},revive:function revive(e){return "NaN"===e?new Date(Number.NaN):new Date(e)}}},h={regexp:{test:function test(e){return "RegExp"===s.toStringTag(e)},replace:function replace(e){return {source:e.source,flags:(e.global?"g":"")+(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.sticky?"y":"")+(e.unicode?"u":"")}},revive:function revive(e){var t=e.source,r=e.flags;return new RegExp(t,r)}}},g={map:{test:function test(e){return "Map"===s.toStringTag(e)},replace:function replace(e){return _toConsumableArray$1(e.entries())},revive:function revive(e){return new Map(e)}}},m={set:{test:function test(e){return "Set"===s.toStringTag(e)},replace:function replace(e){return _toConsumableArray$1(e.values())},revive:function revive(e){return new Set(e)}}},O="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",_=new Uint8Array(256),j=0;j<O.length;j++)_[O.charCodeAt(j)]=j;var S=function encode(e,t,r){null==r&&(r=e.byteLength);for(var n=new Uint8Array(e,t||0,r),i=n.length,o="",a=0;a<i;a+=3)o+=O[n[a]>>2],o+=O[(3&n[a])<<4|n[a+1]>>4],o+=O[(15&n[a+1])<<2|n[a+2]>>6],o+=O[63&n[a+2]];return i%3==2?o=o.slice(0,-1)+"=":i%3==1&&(o=o.slice(0,-2)+"=="),o},T=function decode(e){var t,r,n,i,o=e.length,a=.75*e.length,c=0;"="===e[e.length-1]&&(a--,"="===e[e.length-2]&&a--);for(var u=new ArrayBuffer(a),s=new Uint8Array(u),f=0;f<o;f+=4)t=_[e.charCodeAt(f)],r=_[e.charCodeAt(f+1)],n=_[e.charCodeAt(f+2)],i=_[e.charCodeAt(f+3)],s[c++]=t<<2|r>>4,s[c++]=(15&r)<<4|n>>2,s[c++]=(3&n)<<6|63&i;return u},w={arraybuffer:{test:function test(e){return "ArrayBuffer"===s.toStringTag(e)},replace:function replace(e,t){t.buffers||(t.buffers=[]);var r=t.buffers.indexOf(e);return r>-1?{index:r}:(t.buffers.push(e),S(e))},revive:function revive(e,t){if(t.buffers||(t.buffers=[]),"object"===_typeof$1(e))return t.buffers[e.index];var r=T(e);return t.buffers.push(r),r}}},A="undefined"==typeof self?commonjsGlobal:self,P={};["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"].forEach((function(e){var t=e,r=A[t];r&&(P[e.toLowerCase()]={test:function test(e){return s.toStringTag(e)===t},replace:function replace(e,t){var r=e.buffer,n=e.byteOffset,i=e.length;t.buffers||(t.buffers=[]);var o=t.buffers.indexOf(r);return o>-1?{index:o,byteOffset:n,length:i}:(t.buffers.push(r),{encoded:S(r),byteOffset:n,length:i})},revive:function revive(e,t){t.buffers||(t.buffers=[]);var n,i=e.byteOffset,o=e.length,a=e.encoded,c=e.index;return "index"in e?n=t.buffers[c]:(n=T(a),t.buffers.push(n)),new r(n,i,o)}});}));var I={dataview:{test:function test(e){return "DataView"===s.toStringTag(e)},replace:function replace(e,t){var r=e.buffer,n=e.byteOffset,i=e.byteLength;t.buffers||(t.buffers=[]);var o=t.buffers.indexOf(r);return o>-1?{index:o,byteOffset:n,byteLength:i}:(t.buffers.push(r),{encoded:S(r),byteOffset:n,byteLength:i})},revive:function revive(e,t){t.buffers||(t.buffers=[]);var r,n=e.byteOffset,i=e.byteLength,o=e.encoded,a=e.index;return "index"in e?r=t.buffers[a]:(r=T(o),t.buffers.push(r)),new DataView(r,n,i)}}},C={IntlCollator:{test:function test(e){return s.hasConstructorOf(e,Intl.Collator)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.Collator(e.locale,e)}},IntlDateTimeFormat:{test:function test(e){return s.hasConstructorOf(e,Intl.DateTimeFormat)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.DateTimeFormat(e.locale,e)}},IntlNumberFormat:{test:function test(e){return s.hasConstructorOf(e,Intl.NumberFormat)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.NumberFormat(e.locale,e)}}};function string2arraybuffer(e){for(var t=new Uint8Array(e.length),r=0;r<e.length;r++)t[r]=e.charCodeAt(r);return t.buffer}var N={file:{test:function test(e){return "File"===s.toStringTag(e)},replace:function replace(e){var t=new XMLHttpRequest;if(t.overrideMimeType("text/plain; charset=x-user-defined"),t.open("GET",URL.createObjectURL(e),!1),t.send(),200!==t.status&&0!==t.status)throw new Error("Bad File access: "+t.status);return {type:e.type,stringContents:t.responseText,name:e.name,lastModified:e.lastModified}},revive:function revive(e){var t=e.name,r=e.type,n=e.stringContents,i=e.lastModified;return new File([string2arraybuffer(n)],t,{type:r,lastModified:i})},replaceAsync:function replaceAsync(e){return new s.Promise((function(t,r){var n=new FileReader;n.addEventListener("load",(function(){t({type:e.type,stringContents:n.result,name:e.name,lastModified:e.lastModified});})),n.addEventListener("error",(function(){r(n.error);})),n.readAsBinaryString(e);}))}}},k={bigint:{test:function test(e){return "bigint"==typeof e},replace:function replace(e){return String(e)},revive:function revive(e){return BigInt(e)}}},E={bigintObject:{test:function test(e){return "object"===_typeof$1(e)&&s.hasConstructorOf(e,BigInt)},replace:function replace(e){return String(e)},revive:function revive(e){return new Object(BigInt(e))}}},B={cryptokey:{test:function test(e){return "CryptoKey"===s.toStringTag(e)&&e.extractable},replaceAsync:function replaceAsync(e){return new s.Promise((function(t,r){crypto.subtle.exportKey("jwk",e).catch((function(e){r(e);})).then((function(r){t({jwk:r,algorithm:e.algorithm,usages:e.usages});}));}))},revive:function revive(e){var t=e.jwk,r=e.algorithm,n=e.usages;return crypto.subtle.importKey("jwk",t,r,!0,n)}}};return [l,y,p,v,b,d,h,{imagedata:{test:function test(e){return "ImageData"===s.toStringTag(e)},replace:function replace(e){return {array:_toConsumableArray$1(e.data),width:e.width,height:e.height}},revive:function revive(e){return new ImageData(new Uint8ClampedArray(e.array),e.width,e.height)}}},{imagebitmap:{test:function test(e){return "ImageBitmap"===s.toStringTag(e)||e&&e.dataset&&"ImageBitmap"===e.dataset.toStringTag},replace:function replace(e){var t=document.createElement("canvas");return t.getContext("2d").drawImage(e,0,0),t.toDataURL()},revive:function revive(e){var t=document.createElement("canvas"),r=t.getContext("2d"),n=document.createElement("img");return n.addEventListener("load",(function(){r.drawImage(n,0,0);})),n.src=e,t},reviveAsync:function reviveAsync(e){var t=document.createElement("canvas"),r=t.getContext("2d"),n=document.createElement("img");return n.addEventListener("load",(function(){r.drawImage(n,0,0);})),n.src=e,createImageBitmap(t)}}},N,{file:N.file,filelist:{test:function test(e){return "FileList"===s.toStringTag(e)},replace:function replace(e){for(var t=[],r=0;r<e.length;r++)t[r]=e.item(r);return t},revive:function revive(e){return new(function(){function FileList(){_classCallCheck$1(this,FileList),this._files=arguments[0],this.length=this._files.length;}return function _createClass$1(e,t,r){return t&&_defineProperties$1(e.prototype,t),r&&_defineProperties$1(e,r),e}(FileList,[{key:"item",value:function item(e){return this._files[e]}},{key:Symbol.toStringTag,get:function get(){return "FileList"}}]),FileList}())(e)}}},{blob:{test:function test(e){return "Blob"===s.toStringTag(e)},replace:function replace(e){var t=new XMLHttpRequest;if(t.overrideMimeType("text/plain; charset=x-user-defined"),t.open("GET",URL.createObjectURL(e),!1),t.send(),200!==t.status&&0!==t.status)throw new Error("Bad Blob access: "+t.status);return {type:e.type,stringContents:t.responseText}},revive:function revive(e){var t=e.type,r=e.stringContents;return new Blob([string2arraybuffer(r)],{type:t})},replaceAsync:function replaceAsync(e){return new s.Promise((function(t,r){var n=new FileReader;n.addEventListener("load",(function(){t({type:e.type,stringContents:n.result});})),n.addEventListener("error",(function(){r(n.error);})),n.readAsBinaryString(e);}))}}}].concat("function"==typeof Map?g:[],"function"==typeof Set?m:[],"function"==typeof ArrayBuffer?w:[],"function"==typeof Uint8Array?P:[],"function"==typeof DataView?I:[],"undefined"!=typeof Intl?C:[],"undefined"!=typeof crypto?B:[],"undefined"!=typeof BigInt?[k,E]:[])}));

});

/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2017 Brett Zamir, 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; // Use a lookup table to find the index.

var lookup = new Uint8Array(256);

for (var i = 0; i < chars.length; i++) {
  lookup[chars.codePointAt(i)] = i;
}
/**
 * @param {ArrayBuffer} arraybuffer
 * @param {Integer} byteOffset
 * @param {Integer} lngth
 * @returns {string}
 */


var encode = function encode(arraybuffer, byteOffset, lngth) {
  if (lngth === null || lngth === undefined) {
    lngth = arraybuffer.byteLength; // Needed for Safari
  }

  var bytes = new Uint8Array(arraybuffer, byteOffset || 0, // Default needed for Safari
  lngth);
  var len = bytes.length;
  var base64 = '';

  for (var _i = 0; _i < len; _i += 3) {
    base64 += chars[bytes[_i] >> 2];
    base64 += chars[(bytes[_i] & 3) << 4 | bytes[_i + 1] >> 4];
    base64 += chars[(bytes[_i + 1] & 15) << 2 | bytes[_i + 2] >> 6];
    base64 += chars[bytes[_i + 2] & 63];
  }

  if (len % 3 === 2) {
    base64 = base64.slice(0, -1) + '=';
  } else if (len % 3 === 1) {
    base64 = base64.slice(0, -2) + '==';
  }

  return base64;
};
/**
 * @param {string} base64
 * @returns {ArrayBuffer}
 */

var decode = function decode(base64) {
  var len = base64.length;
  var bufferLength = base64.length * 0.75;
  var p = 0;
  var encoded1, encoded2, encoded3, encoded4;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;

    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  var arraybuffer = new ArrayBuffer(bufferLength),
      bytes = new Uint8Array(arraybuffer);

  for (var _i2 = 0; _i2 < len; _i2 += 4) {
    encoded1 = lookup[base64.codePointAt(_i2)];
    encoded2 = lookup[base64.codePointAt(_i2 + 1)];
    encoded3 = lookup[base64.codePointAt(_i2 + 2)];
    encoded4 = lookup[base64.codePointAt(_i2 + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }

  return arraybuffer;
};

/* eslint-env browser, node */
var _global = typeof self === 'undefined' ? global : self;
var exportObj = {};
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
    var arrType = typeName;
    var TypedArray = _global[arrType];
    if (TypedArray) {
        exportObj[typeName.toLowerCase() + "2"] = {
            test: function (x) { return typeson.toStringTag(x) === arrType; },
            replace: function (_a) {
                var buffer = _a.buffer, byteOffset = _a.byteOffset, length = _a.length;
                return {
                    buffer: buffer,
                    byteOffset: byteOffset,
                    length: length
                };
            },
            revive: function (b64Obj) {
                var buffer = b64Obj.buffer, byteOffset = b64Obj.byteOffset, length = b64Obj.length;
                return new TypedArray(buffer, byteOffset, length);
            }
        };
    }
});

var arrayBuffer = {
    arraybuffer: {
        test: function (x) { return typeson.toStringTag(x) === 'ArrayBuffer'; },
        replace: function (b) {
            return encode(b, 0, b.byteLength);
        },
        revive: function (b64) {
            var buffer = decode(b64);
            return buffer;
        }
    }
};
// See also typed-arrays!

var TSON = new typeson().register(structuredCloning);
var readBlobsSynchronously = 'FileReaderSync' in self; // true in workers only.
var blobsToAwait = [];
var blobsToAwaitPos = 0;
// Need to patch encapsulateAsync as it does not work as of typeson 5.8.2
// Also, current version of typespn-registry-1.0.0-alpha.21 does not
// encapsulate/revive Blobs correctly (fails one of the unit tests in
// this library (test 'export-format'))
TSON.register([
    arrayBuffer,
    exportObj, {
        blob2: {
            test: function (x) { return typeson.toStringTag(x) === 'Blob'; },
            replace: function (b) {
                if (b.isClosed) { // On MDN, but not in https://w3c.github.io/FileAPI/#dfn-Blob
                    throw new Error('The Blob is closed');
                }
                if (readBlobsSynchronously) {
                    var data = readBlobSync(b, 'binary');
                    var base64 = encode(data, 0, data.byteLength);
                    return {
                        type: b.type,
                        data: base64
                    };
                }
                else {
                    blobsToAwait.push(b); // This will also make TSON.mustFinalize() return true.
                    var result = {
                        type: b.type,
                        data: { start: blobsToAwaitPos, end: blobsToAwaitPos + b.size }
                    };
                    blobsToAwaitPos += b.size;
                    return result;
                }
            },
            finalize: function (b, ba) {
                b.data = encode(ba, 0, ba.byteLength);
            },
            revive: function (_a) {
                var type = _a.type, data = _a.data;
                return new Blob([decode(data)], { type: type });
            }
        }
    }
]);
TSON.mustFinalize = function () { return blobsToAwait.length > 0; };
TSON.finalize = function (items) { return __awaiter(void 0, void 0, void 0, function () {
    var allChunks, _i, items_1, item, types, arrayType, keyPath, typeName, typeSpec, b;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, readBlobAsync(new Blob(blobsToAwait), 'binary')];
            case 1:
                allChunks = _c.sent();
                if (items) {
                    for (_i = 0, items_1 = items; _i < items_1.length; _i++) {
                        item = items_1[_i];
                        // Manually go through all "blob" types in the result
                        // and lookup the data slice they point at.
                        if (item.$types) {
                            types = item.$types;
                            arrayType = types.$;
                            if (arrayType)
                                types = types.$;
                            for (keyPath in types) {
                                typeName = types[keyPath];
                                typeSpec = TSON.types[typeName];
                                if (typeSpec && typeSpec.finalize) {
                                    b = Dexie.getByKeyPath(item, arrayType ? "$." + keyPath : keyPath);
                                    typeSpec.finalize(b, allChunks.slice((_a = b.data) === null || _a === void 0 ? void 0 : _a.start, (_b = b.data) === null || _b === void 0 ? void 0 : _b.end));
                                }
                            }
                        }
                    }
                }
                // Free up memory
                blobsToAwait = [];
                blobsToAwaitPos = 0;
                return [2 /*return*/];
        }
    });
}); };

var DEFAULT_ROWS_PER_CHUNK = 2000;
function exportDB(db, options) {
    return __awaiter(this, void 0, void 0, function () {
        function exportAll() {
            return __awaiter(this, void 0, void 0, function () {
                var tablesRowCounts, emptyExportJson, posEndDataArray, firstJsonSlice, filter, transform, _loop_1, _i, tables_1, tableName;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, Promise.all(targetTables.map(function (table) { return table.count(); }))];
                        case 1:
                            tablesRowCounts = _a.sent();
                            tablesRowCounts.forEach(function (rowCount, i) { return tables[i].rowCount = rowCount; });
                            progress.totalRows = tablesRowCounts.reduce(function (p, c) { return p + c; });
                            emptyExportJson = JSON.stringify(emptyExport, undefined, prettyJson ? 2 : undefined);
                            posEndDataArray = emptyExportJson.lastIndexOf(']');
                            firstJsonSlice = emptyExportJson.substring(0, posEndDataArray);
                            slices.push(firstJsonSlice);
                            filter = options.filter;
                            transform = options.transform;
                            _loop_1 = function (tableName) {
                                var table, primKey, inbound, LIMIT, emptyTableExport, emptyTableExportJson, posEndRowsArray, lastKey, lastNumRows, mayHaveMoreRows, _loop_2, state_1;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            table = db.table(tableName);
                                            primKey = table.schema.primKey;
                                            inbound = !!primKey.keyPath;
                                            LIMIT = options.numRowsPerChunk || DEFAULT_ROWS_PER_CHUNK;
                                            emptyTableExport = inbound ? {
                                                tableName: table.name,
                                                inbound: true,
                                                rows: []
                                            } : {
                                                tableName: table.name,
                                                inbound: false,
                                                rows: []
                                            };
                                            emptyTableExportJson = JSON.stringify(emptyTableExport, undefined, prettyJson ? 2 : undefined);
                                            if (prettyJson) {
                                                // Increase indentation according to this:
                                                // {
                                                //   ...
                                                //   data: [
                                                //     ...
                                                //     data: [
                                                // 123456<---- here
                                                //     ] 
                                                //   ]
                                                // }
                                                emptyTableExportJson = emptyTableExportJson.split('\n').join('\n    ');
                                            }
                                            posEndRowsArray = emptyTableExportJson.lastIndexOf(']');
                                            slices.push(emptyTableExportJson.substring(0, posEndRowsArray));
                                            lastKey = null;
                                            lastNumRows = 0;
                                            mayHaveMoreRows = true;
                                            _loop_2 = function () {
                                                var chunkedCollection, values, filteredValues, transformedValues, tsonValues, json, keys, keyvals, tsonTuples, json;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            if (progressCallback) {
                                                                // Keep ongoing transaction private
                                                                Dexie.ignoreTransaction(function () { return progressCallback(progress); });
                                                            }
                                                            chunkedCollection = lastKey == null ?
                                                                table.limit(LIMIT) :
                                                                table.where(':id').above(lastKey).limit(LIMIT);
                                                            return [4 /*yield*/, chunkedCollection.toArray()];
                                                        case 1:
                                                            values = _c.sent();
                                                            if (values.length === 0)
                                                                return [2 /*return*/, "break"];
                                                            if (lastKey != null && lastNumRows > 0) {
                                                                // Not initial chunk. Must add a comma:
                                                                slices.push(",");
                                                                if (prettyJson) {
                                                                    slices.push("\n      ");
                                                                }
                                                            }
                                                            mayHaveMoreRows = values.length === LIMIT;
                                                            if (!inbound) return [3 /*break*/, 4];
                                                            filteredValues = filter ?
                                                                values.filter(function (value) { return filter(tableName, value); }) :
                                                                values;
                                                            transformedValues = transform ?
                                                                filteredValues.map(function (value) { return transform(tableName, value).value; }) :
                                                                filteredValues;
                                                            tsonValues = transformedValues.map(function (value) { return TSON.encapsulate(value); });
                                                            if (!TSON.mustFinalize()) return [3 /*break*/, 3];
                                                            return [4 /*yield*/, Dexie.waitFor(TSON.finalize(tsonValues))];
                                                        case 2:
                                                            _c.sent();
                                                            _c.label = 3;
                                                        case 3:
                                                            json = JSON.stringify(tsonValues, undefined, prettyJson ? 2 : undefined);
                                                            if (prettyJson)
                                                                json = json.split('\n').join('\n      ');
                                                            // By generating a blob here, we give web platform the opportunity to store the contents
                                                            // on disk and release RAM.
                                                            slices.push(new Blob([json.substring(1, json.length - 1)]));
                                                            lastNumRows = transformedValues.length;
                                                            lastKey = values.length > 0 ?
                                                                Dexie.getByKeyPath(values[values.length - 1], primKey.keyPath) :
                                                                null;
                                                            return [3 /*break*/, 8];
                                                        case 4: return [4 /*yield*/, chunkedCollection.primaryKeys()];
                                                        case 5:
                                                            keys = _c.sent();
                                                            keyvals = keys.map(function (key, i) { return [key, values[i]]; });
                                                            if (filter)
                                                                keyvals = keyvals.filter(function (_a) {
                                                                    var key = _a[0], value = _a[1];
                                                                    return filter(tableName, value, key);
                                                                });
                                                            if (transform)
                                                                keyvals = keyvals.map(function (_a) {
                                                                    var key = _a[0], value = _a[1];
                                                                    var transformResult = transform(tableName, value, key);
                                                                    return [transformResult.key, transformResult.value];
                                                                });
                                                            tsonTuples = keyvals.map(function (tuple) { return TSON.encapsulate(tuple); });
                                                            if (!TSON.mustFinalize()) return [3 /*break*/, 7];
                                                            return [4 /*yield*/, Dexie.waitFor(TSON.finalize(tsonTuples))];
                                                        case 6:
                                                            _c.sent();
                                                            _c.label = 7;
                                                        case 7:
                                                            json = JSON.stringify(tsonTuples, undefined, prettyJson ? 2 : undefined);
                                                            if (prettyJson)
                                                                json = json.split('\n').join('\n      ');
                                                            // By generating a blob here, we give web platform the opportunity to store the contents
                                                            // on disk and release RAM.
                                                            slices.push(new Blob([json.substring(1, json.length - 1)]));
                                                            lastNumRows = keyvals.length;
                                                            lastKey = keys.length > 0 ?
                                                                keys[keys.length - 1] :
                                                                null;
                                                            _c.label = 8;
                                                        case 8:
                                                            progress.completedRows += values.length;
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            };
                                            _b.label = 1;
                                        case 1:
                                            if (!mayHaveMoreRows) return [3 /*break*/, 3];
                                            return [5 /*yield**/, _loop_2()];
                                        case 2:
                                            state_1 = _b.sent();
                                            if (state_1 === "break")
                                                return [3 /*break*/, 3];
                                            return [3 /*break*/, 1];
                                        case 3:
                                            slices.push(emptyTableExportJson.substr(posEndRowsArray)); // "]}"
                                            progress.completedTables += 1;
                                            if (progress.completedTables < progress.totalTables) {
                                                slices.push(",");
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            _i = 0, tables_1 = tables;
                            _a.label = 2;
                        case 2:
                            if (!(_i < tables_1.length)) return [3 /*break*/, 5];
                            tableName = tables_1[_i].name;
                            return [5 /*yield**/, _loop_1(tableName)];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            _i++;
                            return [3 /*break*/, 2];
                        case 5:
                            slices.push(emptyExportJson.substr(posEndDataArray));
                            progress.done = true;
                            if (progressCallback) {
                                // Keep ongoing transaction private
                                Dexie.ignoreTransaction(function () { return progressCallback(progress); });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        var skipTables, targetTables, slices, tables, prettyJson, emptyExport, progressCallback, progress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = options || {};
                    skipTables = options.skipTables ? options.skipTables : [];
                    targetTables = db.tables.filter(function (x) { return !skipTables.includes(x.name); });
                    slices = [];
                    tables = targetTables.map(function (table) { return ({
                        name: table.name,
                        schema: getSchemaString(table),
                        rowCount: 0
                    }); });
                    prettyJson = options.prettyJson;
                    emptyExport = {
                        formatName: "dexie",
                        formatVersion: 1,
                        data: {
                            databaseName: db.name,
                            databaseVersion: db.verno,
                            tables: tables,
                            data: []
                        }
                    };
                    progressCallback = options.progressCallback;
                    progress = {
                        done: false,
                        completedRows: 0,
                        completedTables: 0,
                        totalRows: NaN,
                        totalTables: tables.length
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 6, 7]);
                    if (!options.noTransaction) return [3 /*break*/, 3];
                    return [4 /*yield*/, exportAll()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, db.transaction('r', db.tables, exportAll)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    TSON.finalize(); // Free up mem if error has occurred
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/, new Blob(slices, { type: "text/json" })];
            }
        });
    });
}

var VERSION = 1;

var fakeStream = {Stream: function(){}};

var clarinet_1 = createCommonjsModule(function (module, exports) {
(function (clarinet) {

  // non node-js needs to set clarinet debug on root
  var env =(typeof process === 'object' && process.env)
    ? process.env
    : self;

  clarinet.parser            = function (opt) { return new CParser(opt);};
  clarinet.CParser           = CParser;
  clarinet.CStream           = CStream;
  clarinet.createStream      = createStream;
  clarinet.MAX_BUFFER_LENGTH = 10 * 1024 * 1024;
  clarinet.DEBUG             = (env.CDEBUG==='debug');
  clarinet.INFO              = (env.CDEBUG==='debug' || env.CDEBUG==='info');
  clarinet.EVENTS            =
    [ "value"
    , "string"
    , "key"
    , "openobject"
    , "closeobject"
    , "openarray"
    , "closearray"
    , "error"
    , "end"
    , "ready"
    ];

  var buffers     = {
        textNode: undefined,
        numberNode: ""
    }
    , streamWraps = clarinet.EVENTS.filter(function (ev) {
          return ev !== "error" && ev !== "end";
        })
    , S           = 0
    , Stream
    ;

  clarinet.STATE =
    { BEGIN                             : S++
    , VALUE                             : S++ // general stuff
    , OPEN_OBJECT                       : S++ // {
    , CLOSE_OBJECT                      : S++ // }
    , OPEN_ARRAY                        : S++ // [
    , CLOSE_ARRAY                       : S++ // ]
    , TEXT_ESCAPE                       : S++ // \ stuff
    , STRING                            : S++ // ""
    , BACKSLASH                         : S++
    , END                               : S++ // No more stack
    , OPEN_KEY                          : S++ // , "a"
    , CLOSE_KEY                         : S++ // :
    , TRUE                              : S++ // r
    , TRUE2                             : S++ // u
    , TRUE3                             : S++ // e
    , FALSE                             : S++ // a
    , FALSE2                            : S++ // l
    , FALSE3                            : S++ // s
    , FALSE4                            : S++ // e
    , NULL                              : S++ // u
    , NULL2                             : S++ // l
    , NULL3                             : S++ // l
    , NUMBER_DECIMAL_POINT              : S++ // .
    , NUMBER_DIGIT                      : S++ // [0-9]
    };

  for (var s_ in clarinet.STATE) clarinet.STATE[clarinet.STATE[s_]] = s_;

  // switcharoo
  S = clarinet.STATE;

  const Char = {
    tab                 : 0x09,     // \t
    lineFeed            : 0x0A,     // \n
    carriageReturn      : 0x0D,     // \r
    space               : 0x20,     // " "

    doubleQuote         : 0x22,     // "
    plus                : 0x2B,     // +
    comma               : 0x2C,     // ,
    minus               : 0x2D,     // -
    period              : 0x2E,     // .

    _0                  : 0x30,     // 0
    _9                  : 0x39,     // 9

    colon               : 0x3A,     // :

    E                   : 0x45,     // E

    openBracket         : 0x5B,     // [
    backslash           : 0x5C,     // \
    closeBracket        : 0x5D,     // ]

    a                   : 0x61,     // a
    b                   : 0x62,     // b
    e                   : 0x65,     // e 
    f                   : 0x66,     // f
    l                   : 0x6C,     // l
    n                   : 0x6E,     // n
    r                   : 0x72,     // r
    s                   : 0x73,     // s
    t                   : 0x74,     // t
    u                   : 0x75,     // u

    openBrace           : 0x7B,     // {
    closeBrace          : 0x7D,     // }
  };

  if (!Object.create) {
    Object.create = function (o) {
      function f () { this["__proto__"] = o; }
      f.prototype = o;
      return new f;
    };
  }

  if (!Object.getPrototypeOf) {
    Object.getPrototypeOf = function (o) {
      return o["__proto__"];
    };
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = [];
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
      return a;
    };
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(clarinet.MAX_BUFFER_LENGTH, 10)
      , maxActual = 0
      ;
    for (var buffer in buffers) {
      var len = parser[buffer] === undefined ? 0 : parser[buffer].length;
      if (len > maxAllowed) {
        switch (buffer) {
          case "text":
            closeText(parser);
          break;

          default:
            error(parser, "Max buffer length exceeded: "+ buffer);
        }
      }
      maxActual = Math.max(maxActual, len);
    }
    parser.bufferCheckPosition = (clarinet.MAX_BUFFER_LENGTH - maxActual)
                               + parser.position;
  }

  function clearBuffers (parser) {
    for (var buffer in buffers) {
      parser[buffer] = buffers[buffer];
    }
  }

  var stringTokenPattern = /[\\"\n]/g;

  function CParser (opt) {
    if (!(this instanceof CParser)) return new CParser (opt);

    var parser = this;
    clearBuffers(parser);
    parser.bufferCheckPosition = clarinet.MAX_BUFFER_LENGTH;
    parser.q        = parser.c = parser.p = "";
    parser.opt      = opt || {};
    parser.closed   = parser.closedRoot = parser.sawRoot = false;
    parser.tag      = parser.error = null;
    parser.state    = S.BEGIN;
    parser.stack    = new Array();
    // mostly just for error reporting
    parser.position = parser.column = 0;
    parser.line     = 1;
    parser.slashed  = false;
    parser.unicodeI = 0;
    parser.unicodeS = null;
    parser.depth    = 0;
    emit(parser, "onready");
  }

  CParser.prototype =
    { end    : function () { end(this); }
    , write  : write
    , resume : function () { this.error = null; return this; }
    , close  : function () { return this.write(null); }
    };

  try        { Stream = fakeStream.Stream; }
  catch (ex) { Stream = function () {}; }

  function createStream (opt) { return new CStream(opt); }

  function CStream (opt) {
    if (!(this instanceof CStream)) return new CStream(opt);

    this._parser = new CParser(opt);
    this.writable = true;
    this.readable = true;

    //var Buffer = this.Buffer || function Buffer () {}; // if we don't have Buffers, fake it so we can do `var instanceof Buffer` and not throw an error
    this.bytes_remaining = 0; // number of bytes remaining in multi byte utf8 char to read after split boundary
    this.bytes_in_sequence = 0; // bytes in multi byte utf8 char to read
    this.temp_buffs = { "2": new Buffer(2), "3": new Buffer(3), "4": new Buffer(4) }; // for rebuilding chars split before boundary is reached
    this.string = '';

    var me = this;
    Stream.apply(me);

    this._parser.onend = function () { me.emit("end"); };
    this._parser.onerror = function (er) {
      me.emit("error", er);
      me._parser.error = null;
    };

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, "on" + ev,
        { get          : function () { return me._parser["on" + ev]; }
        , set          : function (h) {
            if (!h) {
              me.removeAllListeners(ev);
              me._parser["on"+ev] = h;
              return h;
            }
            me.on(ev, h);
          }
        , enumerable   : true
        , configurable : false
        });
    });
  }

  CStream.prototype = Object.create(Stream.prototype,
    { constructor: { value: CStream } });

  CStream.prototype.write = function (data) {
    data = new Buffer(data);
    for (var i = 0; i < data.length; i++) {
      var n = data[i];

      // check for carry over of a multi byte char split between data chunks
      // & fill temp buffer it with start of this data chunk up to the boundary limit set in the last iteration
      if (this.bytes_remaining > 0) {
        for (var j = 0; j < this.bytes_remaining; j++) {
          this.temp_buffs[this.bytes_in_sequence][this.bytes_in_sequence - this.bytes_remaining + j] = data[j];
        }
        this.string = this.temp_buffs[this.bytes_in_sequence].toString();
        this.bytes_in_sequence = this.bytes_remaining = 0;

        // move iterator forward by number of byte read during sequencing
        i = i + j - 1;

        // pass data to parser and move forward to parse rest of data
        this._parser.write(this.string);
        this.emit("data", this.string);
        continue;
      }

      // if no remainder bytes carried over, parse multi byte (>=128) chars one at a time
      if (this.bytes_remaining === 0 && n >= 128) {
        if ((n >= 194) && (n <= 223)) this.bytes_in_sequence = 2;
        if ((n >= 224) && (n <= 239)) this.bytes_in_sequence = 3;
        if ((n >= 240) && (n <= 244)) this.bytes_in_sequence = 4;
        if ((this.bytes_in_sequence + i) > data.length) { // if bytes needed to complete char fall outside data length, we have a boundary split

          for (var k = 0; k <= (data.length - 1 - i); k++) {
            this.temp_buffs[this.bytes_in_sequence][k] = data[i + k]; // fill temp data of correct size with bytes available in this chunk
          }
          this.bytes_remaining = (i + this.bytes_in_sequence) - data.length;

          // immediately return as we need another chunk to sequence the character
          return true;
        } else {
          this.string = data.slice(i, (i + this.bytes_in_sequence)).toString();
          i = i + this.bytes_in_sequence - 1;

          this._parser.write(this.string);
          this.emit("data", this.string);
          continue;
        }
      }

      // is there a range of characters that are immediately parsable?
      for (var p = i; p < data.length; p++) {
        if (data[p] >= 128) break;
      }
      this.string = data.slice(i, p).toString();
      this._parser.write(this.string);
      this.emit("data", this.string);
      i = p - 1;

      // handle any remaining characters using multibyte logic
      continue;
    }
  };

  CStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) this._parser.write(chunk.toString());
    this._parser.end();
    return true;
  };

  CStream.prototype.on = function (ev, handler) {
    var me = this;
    if (!me._parser["on"+ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser["on"+ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]]
                 : Array.apply(null, arguments);
        args.splice(0, 0, ev);
        me.emit.apply(me, args);
      };
    }
    return Stream.prototype.on.call(me, ev, handler);
  };

  CStream.prototype.destroy = function () {
    clearBuffers(this._parser);
    this.emit("close");
  };

  function emit(parser, event, data) {
    if(clarinet.INFO) console.log('-- emit', event, data);
    if (parser[event]) parser[event](data);
  }

  function emitNode(parser, event, data) {
    closeValue(parser);
    emit(parser, event, data);
  }

  function closeValue(parser, event) {
    parser.textNode = textopts(parser.opt, parser.textNode);
    if (parser.textNode !== undefined) {
      emit(parser, (event ? event : "onvalue"), parser.textNode);
    }
    parser.textNode = undefined;
  }

  function closeNumber(parser) {
    if (parser.numberNode)
      emit(parser, "onvalue", parseFloat(parser.numberNode));
    parser.numberNode = "";
  }

  function textopts (opt, text) {
    if (text === undefined) {
      return text;
    }
    if (opt.trim) text = text.trim();
    if (opt.normalize) text = text.replace(/\s+/g, " ");
    return text;
  }

  function error (parser, er) {
    closeValue(parser);
    er += "\nLine: "+parser.line+
          "\nColumn: "+parser.column+
          "\nChar: "+parser.c;
    er = new Error(er);
    parser.error = er;
    emit(parser, "onerror", er);
    return parser;
  }

  function end(parser) {
    if (parser.state !== S.VALUE || parser.depth !== 0)
      error(parser, "Unexpected end");

    closeValue(parser);
    parser.c      = "";
    parser.closed = true;
    emit(parser, "onend");
    CParser.call(parser, parser.opt);
    return parser;
  }

  function isWhitespace(c) {
    return c === Char.carriageReturn || c === Char.lineFeed || c === Char.space || c === Char.tab;
  }

  function write (chunk) {
    var parser = this;
    if (this.error) throw this.error;
    if (parser.closed) return error(parser,
      "Cannot write after close. Assign an onready handler.");
    if (chunk === null) return end(parser);
    var i = 0, c = chunk.charCodeAt(0), p = parser.p;
    if (clarinet.DEBUG) console.log('write -> [' + chunk + ']');
    while (c) {
      p = c;
      parser.c = c = chunk.charCodeAt(i++);
      // if chunk doesnt have next, like streaming char by char
      // this way we need to check if previous is really previous
      // if not we need to reset to what the parser says is the previous
      // from buffer
      if(p !== c ) parser.p = p;
      else p = parser.p;

      if(!c) break;

      if (clarinet.DEBUG) console.log(i,c,clarinet.STATE[parser.state]);
      parser.position ++;
      if (c === Char.lineFeed) {
        parser.line ++;
        parser.column = 0;
      } else parser.column ++;
      switch (parser.state) {

        case S.BEGIN:
          if (c === Char.openBrace) parser.state = S.OPEN_OBJECT;
          else if (c === Char.openBracket) parser.state = S.OPEN_ARRAY;
          else if (!isWhitespace(c))
            error(parser, "Non-whitespace before {[.");
        continue;

        case S.OPEN_KEY:
        case S.OPEN_OBJECT:
          if (isWhitespace(c)) continue;
          if(parser.state === S.OPEN_KEY) parser.stack.push(S.CLOSE_KEY);
          else {
            if(c === Char.closeBrace) {
              emit(parser, 'onopenobject');
              this.depth++;
              emit(parser, 'oncloseobject');
              this.depth--;
              parser.state = parser.stack.pop() || S.VALUE;
              continue;
            } else  parser.stack.push(S.CLOSE_OBJECT);
          }
          if(c === Char.doubleQuote) parser.state = S.STRING;
          else error(parser, "Malformed object key should start with \"");
        continue;

        case S.CLOSE_KEY:
        case S.CLOSE_OBJECT:
          if (isWhitespace(c)) continue;
          (parser.state === S.CLOSE_KEY) ? 'key' : 'object';
          if(c === Char.colon) {
            if(parser.state === S.CLOSE_OBJECT) {
              parser.stack.push(S.CLOSE_OBJECT);
              closeValue(parser, 'onopenobject');
               this.depth++;
            } else closeValue(parser, 'onkey');
            parser.state  = S.VALUE;
          } else if (c === Char.closeBrace) {
            emitNode(parser, 'oncloseobject');
            this.depth--;
            parser.state = parser.stack.pop() || S.VALUE;
          } else if(c === Char.comma) {
            if(parser.state === S.CLOSE_OBJECT)
              parser.stack.push(S.CLOSE_OBJECT);
            closeValue(parser);
            parser.state  = S.OPEN_KEY;
          } else error(parser, 'Bad object');
        continue;

        case S.OPEN_ARRAY: // after an array there always a value
        case S.VALUE:
          if (isWhitespace(c)) continue;
          if(parser.state===S.OPEN_ARRAY) {
            emit(parser, 'onopenarray');
            this.depth++;
            parser.state = S.VALUE;
            if(c === Char.closeBracket) {
              emit(parser, 'onclosearray');
              this.depth--;
              parser.state = parser.stack.pop() || S.VALUE;
              continue;
            } else {
              parser.stack.push(S.CLOSE_ARRAY);
            }
          }
               if(c === Char.doubleQuote) parser.state = S.STRING;
          else if(c === Char.openBrace) parser.state = S.OPEN_OBJECT;
          else if(c === Char.openBracket) parser.state = S.OPEN_ARRAY;
          else if(c === Char.t) parser.state = S.TRUE;
          else if(c === Char.f) parser.state = S.FALSE;
          else if(c === Char.n) parser.state = S.NULL;
          else if(c === Char.minus) { // keep and continue
            parser.numberNode += "-";
          } else if(Char._0 <= c && c <= Char._9) {
            parser.numberNode += String.fromCharCode(c);
            parser.state = S.NUMBER_DIGIT;
          } else               error(parser, "Bad value");
        continue;

        case S.CLOSE_ARRAY:
          if(c === Char.comma) {
            parser.stack.push(S.CLOSE_ARRAY);
            closeValue(parser, 'onvalue');
            parser.state  = S.VALUE;
          } else if (c === Char.closeBracket) {
            emitNode(parser, 'onclosearray');
            this.depth--;
            parser.state = parser.stack.pop() || S.VALUE;
          } else if (isWhitespace(c))
              continue;
          else error(parser, 'Bad array');
        continue;

        case S.STRING:
          if (parser.textNode === undefined) {
            parser.textNode = "";
          }

          // thanks thejh, this is an about 50% performance improvement.
          var starti              = i-1
            , slashed = parser.slashed
            , unicodeI = parser.unicodeI
            ;
          STRING_BIGLOOP: while (true) {
            if (clarinet.DEBUG)
              console.log(i,c,clarinet.STATE[parser.state]
                         ,slashed);
            // zero means "no unicode active". 1-4 mean "parse some more". end after 4.
            while (unicodeI > 0) {
              parser.unicodeS += String.fromCharCode(c);
              c = chunk.charCodeAt(i++);
              parser.position++;
              if (unicodeI === 4) {
                // TODO this might be slow? well, probably not used too often anyway
                parser.textNode += String.fromCharCode(parseInt(parser.unicodeS, 16));
                unicodeI = 0;
                starti = i-1;
              } else {
                unicodeI++;
              }
              // we can just break here: no stuff we skipped that still has to be sliced out or so
              if (!c) break STRING_BIGLOOP;
            }
            if (c === Char.doubleQuote && !slashed) {
              parser.state = parser.stack.pop() || S.VALUE;
              parser.textNode += chunk.substring(starti, i-1);
              parser.position += i - 1 - starti;
              break;
            }
            if (c === Char.backslash && !slashed) {
              slashed = true;
              parser.textNode += chunk.substring(starti, i-1);
              parser.position += i - 1 - starti;
              c = chunk.charCodeAt(i++);
              parser.position++;
              if (!c) break;
            }
            if (slashed) {
              slashed = false;
                   if (c === Char.n) { parser.textNode += '\n'; }
              else if (c === Char.r) { parser.textNode += '\r'; }
              else if (c === Char.t) { parser.textNode += '\t'; }
              else if (c === Char.f) { parser.textNode += '\f'; }
              else if (c === Char.b) { parser.textNode += '\b'; }
              else if (c === Char.u) {
                // \uxxxx. meh!
                unicodeI = 1;
                parser.unicodeS = '';
              } else {
                parser.textNode += String.fromCharCode(c);
              }
              c = chunk.charCodeAt(i++);
              parser.position++;
              starti = i-1;
              if (!c) break;
              else continue;
            }

            stringTokenPattern.lastIndex = i;
            var reResult = stringTokenPattern.exec(chunk);
            if (reResult === null) {
              i = chunk.length+1;
              parser.textNode += chunk.substring(starti, i-1);
              parser.position += i - 1 - starti;
              break;
            }
            i = reResult.index+1;
            c = chunk.charCodeAt(reResult.index);
            if (!c) {
              parser.textNode += chunk.substring(starti, i-1);
              parser.position += i - 1 - starti;
              break;
            }
          }
          parser.slashed = slashed;
          parser.unicodeI = unicodeI;
        continue;

        case S.TRUE:
          if (c === Char.r) parser.state = S.TRUE2;
          else error(parser, 'Invalid true started with t'+ c);
        continue;

        case S.TRUE2:
          if (c === Char.u) parser.state = S.TRUE3;
          else error(parser, 'Invalid true started with tr'+ c);
        continue;

        case S.TRUE3:
          if(c === Char.e) {
            emit(parser, "onvalue", true);
            parser.state = parser.stack.pop() || S.VALUE;
          } else error(parser, 'Invalid true started with tru'+ c);
        continue;

        case S.FALSE:
          if (c === Char.a) parser.state = S.FALSE2;
          else error(parser, 'Invalid false started with f'+ c);
        continue;

        case S.FALSE2:
          if (c === Char.l) parser.state = S.FALSE3;
          else error(parser, 'Invalid false started with fa'+ c);
        continue;

        case S.FALSE3:
          if (c === Char.s) parser.state = S.FALSE4;
          else error(parser, 'Invalid false started with fal'+ c);
        continue;

        case S.FALSE4:
          if (c === Char.e) {
            emit(parser, "onvalue", false);
            parser.state = parser.stack.pop() || S.VALUE;
          } else error(parser, 'Invalid false started with fals'+ c);
        continue;

        case S.NULL:
          if (c === Char.u) parser.state = S.NULL2;
          else error(parser, 'Invalid null started with n'+ c);
        continue;

        case S.NULL2:
          if (c === Char.l) parser.state = S.NULL3;
          else error(parser, 'Invalid null started with nu'+ c);
        continue;

        case S.NULL3:
          if(c === Char.l) {
            emit(parser, "onvalue", null);
            parser.state = parser.stack.pop() || S.VALUE;
          } else error(parser, 'Invalid null started with nul'+ c);
        continue;

        case S.NUMBER_DECIMAL_POINT:
          if(c === Char.period) {
            parser.numberNode += ".";
            parser.state       = S.NUMBER_DIGIT;
          } else error(parser, 'Leading zero not followed by .');
        continue;

        case S.NUMBER_DIGIT:
          if(Char._0 <= c && c <= Char._9) parser.numberNode += String.fromCharCode(c);
          else if (c === Char.period) {
            if(parser.numberNode.indexOf('.')!==-1)
              error(parser, 'Invalid number has two dots');
            parser.numberNode += ".";
          } else if (c === Char.e || c === Char.E) {
            if(parser.numberNode.indexOf('e')!==-1 ||
               parser.numberNode.indexOf('E')!==-1 )
               error(parser, 'Invalid number has two exponential');
            parser.numberNode += "e";
          } else if (c === Char.plus || c === Char.minus) {
            if(!(p === Char.e || p === Char.E))
              error(parser, 'Invalid symbol in number');
            parser.numberNode += String.fromCharCode(c);
          } else {
            closeNumber(parser);
            i--; // go back one
            parser.state = parser.stack.pop() || S.VALUE;
          }
        continue;

        default:
          error(parser, "Unknown state: " + parser.state);
      }
    }
    if (parser.position >= parser.bufferCheckPosition)
      checkBufferLength(parser);
    return parser;
  }

})(exports);
});

function JsonStream(blob) {
    var pos = 0;
    var parser = JsonParser(true);
    var rv = {
        pullAsync: function (numBytes) {
            return __awaiter(this, void 0, void 0, function () {
                var slize, jsonPart, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            slize = blob.slice(pos, pos + numBytes);
                            pos += numBytes;
                            return [4 /*yield*/, readBlobAsync(slize, 'text')];
                        case 1:
                            jsonPart = _a.sent();
                            result = parser.write(jsonPart);
                            rv.result = result || {};
                            return [2 /*return*/, result];
                    }
                });
            });
        },
        pullSync: function (numBytes) {
            var slize = blob.slice(pos, pos + numBytes);
            pos += numBytes;
            var jsonPart = readBlobSync(slize, 'text');
            var result = parser.write(jsonPart);
            rv.result = result || {};
            return result;
        },
        done: function () {
            return parser.done();
        },
        eof: function () {
            return pos >= blob.size;
        },
        result: {}
    };
    return rv;
}
function JsonParser(allowPartial) {
    var parser = clarinet_1.parser();
    var level = 0;
    var result;
    var stack = [];
    var obj;
    var key;
    var done = false;
    var array = false;
    parser.onopenobject = function (newKey) {
        var newObj = {};
        newObj.incomplete = true;
        if (!result)
            result = newObj;
        if (obj) {
            stack.push([key, obj, array]);
            if (allowPartial) {
                if (array) {
                    obj.push(newObj);
                }
                else {
                    obj[key] = newObj;
                }
            }
        }
        obj = newObj;
        key = newKey;
        array = false;
        ++level;
    };
    parser.onkey = function (newKey) { return key = newKey; };
    parser.onvalue = function (value) { return array ? obj.push(value) : obj[key] = value; };
    parser.oncloseobject = function () {
        var _a;
        delete obj.incomplete;
        key = null;
        if (--level === 0) {
            done = true;
        }
        else {
            var completedObj = obj;
            _a = stack.pop(), key = _a[0], obj = _a[1], array = _a[2];
            if (!allowPartial) {
                if (array) {
                    obj.push(completedObj);
                }
                else {
                    obj[key] = completedObj;
                }
            }
        }
    };
    parser.onopenarray = function () {
        var newObj = [];
        newObj.incomplete = true;
        if (!result)
            result = newObj;
        if (obj) {
            stack.push([key, obj, array]);
            if (allowPartial) {
                if (array) {
                    obj.push(newObj);
                }
                else {
                    obj[key] = newObj;
                }
            }
        }
        obj = newObj;
        array = true;
        key = null;
        ++level;
    };
    parser.onclosearray = function () {
        var _a;
        delete obj.incomplete;
        key = null;
        if (--level === 0) {
            done = true;
        }
        else {
            var completedObj = obj;
            _a = stack.pop(), key = _a[0], obj = _a[1], array = _a[2];
            if (!allowPartial) {
                if (array) {
                    obj.push(completedObj);
                }
                else {
                    obj[key] = completedObj;
                }
            }
        }
    };
    return {
        write: function (jsonPart) {
            parser.write(jsonPart);
            return result;
        },
        done: function () {
            return done;
        }
    };
}

var DEFAULT_KILOBYTES_PER_CHUNK = 1024;
function importDB(exportedData, options) {
    return __awaiter(this, void 0, void 0, function () {
        var CHUNK_SIZE, stream, dbExport, db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    options = options || {}; // All booleans defaults to false.
                    CHUNK_SIZE = options.chunkSizeBytes || (DEFAULT_KILOBYTES_PER_CHUNK * 1024);
                    return [4 /*yield*/, loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE)];
                case 1:
                    stream = _a.sent();
                    dbExport = stream.result.data;
                    db = new Dexie(options.name !== undefined ? options.name : dbExport.databaseName);
                    db.version(dbExport.databaseVersion).stores(extractDbSchema(dbExport));
                    return [4 /*yield*/, importInto(db, stream, options.name !== undefined ? __assign(__assign({}, options), { acceptNameDiff: true }) : options)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, db];
            }
        });
    });
}
function peakImportFile(exportedData) {
    return __awaiter(this, void 0, void 0, function () {
        var stream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stream = JsonStream(exportedData);
                    _a.label = 1;
                case 1:
                    if (!!stream.eof()) return [3 /*break*/, 3];
                    return [4 /*yield*/, stream.pullAsync(5 * 1024)];
                case 2:
                    _a.sent(); // 5 k is normally enough for the headers. If not, it will just do another go.
                    if (stream.result.data && stream.result.data.data) {
                        // @ts-ignore - TS won't allow us to delete a required property - but we are going to cast it.
                        delete stream.result.data.data; // Don't return half-baked data array.
                        return [3 /*break*/, 3];
                    }
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, stream.result];
            }
        });
    });
}
function importInto(db, exportedData, options) {
    return __awaiter(this, void 0, void 0, function () {
        function importAll() {
            return __awaiter(this, void 0, void 0, function () {
                var _loop_1, _i, _a, tableExport, state_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _loop_1 = function (tableExport) {
                                var tableName, table, tableSchemaStr, sourceRows, rows, i, obj, filter, transform, filteredRows, _c, keys, values;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            if (skipTables.includes(tableExport.tableName))
                                                return [2 /*return*/, "continue"];
                                            if (!tableExport.rows)
                                                return [2 /*return*/, "break"]; // Need to pull more!
                                            if (!tableExport.rows.incomplete && tableExport.rows.length === 0)
                                                return [2 /*return*/, "continue"];
                                            if (progressCallback) {
                                                // Keep ongoing transaction private
                                                Dexie.ignoreTransaction(function () { return progressCallback(progress); });
                                            }
                                            tableName = tableExport.tableName;
                                            table = db.table(tableName);
                                            tableSchemaStr = dbExport.tables.filter(function (t) { return t.name === tableName; })[0].schema;
                                            if (!table) {
                                                if (!options.acceptMissingTables)
                                                    throw new Error("Exported table ".concat(tableExport.tableName, " is missing in installed database"));
                                                else
                                                    return [2 /*return*/, "continue"];
                                            }
                                            if (!options.acceptChangedPrimaryKey &&
                                                tableSchemaStr.split(',')[0] != table.schema.primKey.src) {
                                                throw new Error("Primary key differs for table ".concat(tableExport.tableName, ". "));
                                            }
                                            sourceRows = tableExport.rows;
                                            rows = [];
                                            for (i = 0; i < sourceRows.length; i++) {
                                                obj = sourceRows[i];
                                                if (!obj.incomplete) {
                                                    rows.push(TSON.revive(obj));
                                                }
                                                else {
                                                    break;
                                                }
                                            }
                                            filter = options.filter;
                                            transform = options.transform;
                                            filteredRows = filter ?
                                                tableExport.inbound ?
                                                    rows.filter(function (value) { return filter(tableName, value); }) :
                                                    rows.filter(function (_a) {
                                                        var key = _a[0], value = _a[1];
                                                        return filter(tableName, value, key);
                                                    }) :
                                                rows;
                                            if (transform) {
                                                filteredRows = filteredRows.map(tableExport.inbound ?
                                                    function (value) { return transform(tableName, value).value; } :
                                                    function (_a) {
                                                        var key = _a[0], value = _a[1];
                                                        var res = transform(tableName, value, key);
                                                        return [res.key, res.value];
                                                    });
                                            }
                                            _c = tableExport.inbound ?
                                                [undefined, filteredRows] :
                                                [filteredRows.map(function (row) { return row[0]; }), rows.map(function (row) { return row[1]; })], keys = _c[0], values = _c[1];
                                            if (!options.overwriteValues) return [3 /*break*/, 2];
                                            return [4 /*yield*/, table.bulkPut(values, keys)];
                                        case 1:
                                            _d.sent();
                                            return [3 /*break*/, 4];
                                        case 2: return [4 /*yield*/, table.bulkAdd(values, keys)];
                                        case 3:
                                            _d.sent();
                                            _d.label = 4;
                                        case 4:
                                            progress.completedRows += rows.length;
                                            if (!rows.incomplete) {
                                                progress.completedTables += 1;
                                            }
                                            sourceRows.splice(0, rows.length); // Free up RAM, keep existing array instance.
                                            return [2 /*return*/];
                                    }
                                });
                            };
                            _i = 0, _a = dbExport.data;
                            _b.label = 1;
                        case 1:
                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                            tableExport = _a[_i];
                            return [5 /*yield**/, _loop_1(tableExport)];
                        case 2:
                            state_1 = _b.sent();
                            if (state_1 === "break")
                                return [3 /*break*/, 4];
                            _b.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            // Avoid unnescessary loops in "for (const tableExport of dbExport.data)" 
                            while (dbExport.data.length > 0 && dbExport.data[0].rows && !dbExport.data[0].rows.incomplete) {
                                // We've already imported all rows from the first table. Delete its occurrence
                                dbExport.data.splice(0, 1);
                            }
                            if (!(!jsonStream.done() && !jsonStream.eof())) return [3 /*break*/, 8];
                            if (!readBlobsSynchronously) return [3 /*break*/, 5];
                            // If we can pull from blob synchronically, we don't have to
                            // keep transaction alive using Dexie.waitFor().
                            // This will only be possible in workers.
                            jsonStream.pullSync(CHUNK_SIZE);
                            return [3 /*break*/, 7];
                        case 5: return [4 /*yield*/, Dexie.waitFor(jsonStream.pullAsync(CHUNK_SIZE))];
                        case 6:
                            _b.sent();
                            _b.label = 7;
                        case 7: return [3 /*break*/, 9];
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            return [3 /*break*/, 0];
                        case 10: return [2 /*return*/];
                    }
                });
            });
        }
        var CHUNK_SIZE, jsonStream, dbExportFile, readBlobsSynchronously, dbExport, skipTables, progressCallback, progress, _i, _a, table;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    options = options || {}; // All booleans defaults to false.
                    CHUNK_SIZE = options.chunkSizeBytes || (DEFAULT_KILOBYTES_PER_CHUNK * 1024);
                    return [4 /*yield*/, loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE)];
                case 1:
                    jsonStream = _b.sent();
                    dbExportFile = jsonStream.result;
                    readBlobsSynchronously = 'FileReaderSync' in self;
                    dbExport = dbExportFile.data;
                    skipTables = options.skipTables ? options.skipTables : [];
                    if (!options.acceptNameDiff && db.name !== dbExport.databaseName)
                        throw new Error("Name differs. Current database name is ".concat(db.name, " but export is ").concat(dbExport.databaseName));
                    if (!options.acceptVersionDiff && db.verno !== dbExport.databaseVersion) {
                        // Possible feature: Call upgraders in some isolated way if this happens... ?
                        throw new Error("Database version differs. Current database is in version ".concat(db.verno, " but export is ").concat(dbExport.databaseVersion));
                    }
                    progressCallback = options.progressCallback;
                    progress = {
                        done: false,
                        completedRows: 0,
                        completedTables: 0,
                        totalRows: dbExport.tables.reduce(function (p, c) { return p + c.rowCount; }, 0),
                        totalTables: dbExport.tables.length
                    };
                    if (progressCallback) {
                        // Keep ongoing transaction private
                        Dexie.ignoreTransaction(function () { return progressCallback(progress); });
                    }
                    if (!options.clearTablesBeforeImport) return [3 /*break*/, 5];
                    _i = 0, _a = db.tables;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    table = _a[_i];
                    if (skipTables.includes(table.name))
                        return [3 /*break*/, 4];
                    return [4 /*yield*/, table.clear()];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (!options.noTransaction) return [3 /*break*/, 7];
                    return [4 /*yield*/, importAll()];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, db.transaction('rw', db.tables, importAll)];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9:
                    progress.done = true;
                    if (progressCallback) {
                        // Keep ongoing transaction private
                        Dexie.ignoreTransaction(function () { return progressCallback(progress); });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE) {
    return __awaiter(this, void 0, void 0, function () {
        var stream, dbExportFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stream = ('slice' in exportedData ?
                        JsonStream(exportedData) :
                        exportedData);
                    _a.label = 1;
                case 1:
                    if (!!stream.eof()) return [3 /*break*/, 3];
                    return [4 /*yield*/, stream.pullAsync(CHUNK_SIZE)];
                case 2:
                    _a.sent();
                    if (stream.result.data && stream.result.data.data)
                        return [3 /*break*/, 3];
                    return [3 /*break*/, 1];
                case 3:
                    dbExportFile = stream.result;
                    if (!dbExportFile || dbExportFile.formatName != "dexie")
                        throw new Error("Given file is not a dexie export");
                    if (dbExportFile.formatVersion > VERSION) {
                        throw new Error("Format version ".concat(dbExportFile.formatVersion, " not supported"));
                    }
                    if (!dbExportFile.data) {
                        throw new Error("No data in export file");
                    }
                    if (!dbExportFile.data.databaseName) {
                        throw new Error("Missing databaseName in export file");
                    }
                    if (!dbExportFile.data.databaseVersion) {
                        throw new Error("Missing databaseVersion in export file");
                    }
                    if (!dbExportFile.data.tables) {
                        throw new Error("Missing tables in export file");
                    }
                    return [2 /*return*/, stream];
            }
        });
    });
}

//
// Extend Dexie interface (runtime wise)
//
Dexie.prototype.export = function (options) {
    return exportDB(this, options);
};
Dexie.prototype.import = function (blob, options) {
    return importInto(this, blob, options);
};
Dexie.import = function (blob, options) { return importDB(blob, options); };
var dexieExportImport = (function () {
    throw new Error("This addon extends Dexie.prototype globally and does not have be included in Dexie constructor's addons options.");
});

export { dexieExportImport as default, exportDB, importDB, importInto, peakImportFile };
//# sourceMappingURL=dexie-export-import.mjs.map
