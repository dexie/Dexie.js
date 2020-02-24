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
 * Version {version}, {date}
 *
 * http://dexie.org
 *
 * Apache License Version 2.0, January 2004, http://www.apache.org/licenses/
 * 
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('dexie')) :
    typeof define === 'function' && define.amd ? define(['exports', 'dexie'], factory) :
    (factory((global.DexieExportImport = {}),global.Dexie));
}(this, (function (exports,Dexie) { 'use strict';

    Dexie = Dexie && Dexie.hasOwnProperty('default') ? Dexie['default'] : Dexie;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
    !function(e,n){module.exports=n();}(commonjsGlobal,function(){var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},n=function(){return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function sliceIterator(e,n){var t=[],r=!0,i=!1,o=void 0;try{for(var s,c=e[Symbol.iterator]();!(r=(s=c.next()).done)&&(t.push(s.value),!n||t.length!==n);r=!0);}catch(e){i=!0,o=e;}finally{try{!r&&c.return&&c.return();}finally{if(i)throw o}}return t}(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),t=function(e){if(Array.isArray(e)){for(var n=0,t=Array(e.length);n<e.length;n++)t[n]=e[n];return t}return Array.from(e)},r=Object.keys,i=Array.isArray,o={}.toString,s=Object.getPrototypeOf,c={}.hasOwnProperty,a=c.toString,u=["type","replaced","iterateIn","iterateUnsetNumeric"];function isThenable(e,n){return Typeson.isObject(e)&&"function"==typeof e.then&&(!n||"function"==typeof e.catch)}function toStringTag(e){return o.call(e).slice(8,-1)}function hasConstructorOf(n,t){if(!n||"object"!==(void 0===n?"undefined":e(n)))return !1;var r=s(n);if(!r)return !1;var i=c.call(r,"constructor")&&r.constructor;return "function"!=typeof i?null===t:"function"==typeof i&&null!==t&&a.call(i)===a.call(t)}function isPlainObject(e){return !(!e||"Object"!==toStringTag(e))&&(!s(e)||hasConstructorOf(e,Object))}function isObject(n){return n&&"object"===(void 0===n?"undefined":e(n))}function Typeson(o){var s=[],c=[],a={},y=this.types={},p=this.stringify=function(e,n,t,r){r=Object.assign({},o,r,{stringification:!0});var s=l(e,null,r);return i(s)?JSON.stringify(s[0],n,t):s.then(function(e){return JSON.stringify(e,n,t)})};this.stringifySync=function(e,n,t,r){return p(e,n,t,Object.assign({},{throwOnBadSyncType:!0},r,{sync:!0}))},this.stringifyAsync=function(e,n,t,r){return p(e,n,t,Object.assign({},{throwOnBadSyncType:!0},r,{sync:!1}))};var f=this.parse=function(e,n,t){return t=Object.assign({},o,t,{parse:!0}),h(JSON.parse(e,n),t)};this.parseSync=function(e,n,t){return f(e,n,Object.assign({},{throwOnBadSyncType:!0},t,{sync:!0}))},this.parseAsync=function(e,n,t){return f(e,n,Object.assign({},{throwOnBadSyncType:!0},t,{sync:!1}))},this.specialTypeNames=function(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return t.returnTypeNames=!0,this.encapsulate(e,n,t)},this.rootTypeName=function(e,n){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return t.iterateNone=!0,this.encapsulate(e,n,t)};var l=this.encapsulate=function(y,p,f){var l=(f=Object.assign({sync:!0},o,f)).sync,h={},v=[],d=[],b=[],O=!(f&&"cyclic"in f)||f.cyclic,m=f.encapsulateObserver,T=_encapsulate("",y,O,p||{},b);function finish(e){var n=Object.values(h);if(f.iterateNone)return n.length?n[0]:Typeson.getJSONType(e);if(n.length){if(f.returnTypeNames)return [].concat(t(new Set(n)));e&&isPlainObject(e)&&!e.hasOwnProperty("$types")?e.$types=h:e={$:e,$types:{$:h}};}else isObject(e)&&e.hasOwnProperty("$types")&&(e={$:e,$types:!0});return !f.returnTypeNames&&e}return b.length?l&&f.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():Promise.resolve(function checkPromises(e,t){return Promise.all(t.map(function(e){return e[1].p})).then(function(r){return Promise.all(r.map(function(r){var i=[],o=t.splice(0,1)[0],s=n(o,7),c=s[0],a=s[2],u=s[3],y=s[4],p=s[5],f=s[6],l=_encapsulate(c,r,a,u,i,!0,f),h=hasConstructorOf(l,TypesonPromise);return c&&h?l.p.then(function(n){return y[p]=n,checkPromises(e,i)}):(c?y[p]=l:e=h?l.p:l,checkPromises(e,i))}))}).then(function(){return e})}(T,b)).then(finish):!l&&f.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():f.stringification&&l?[finish(T)]:l?finish(T):Promise.resolve(finish(T));function _adaptBuiltinStateObjectProperties(e,n,t){Object.assign(e,n);var r=u.map(function(n){var t=e[n];return delete e[n],t});t(),u.forEach(function(n,t){e[n]=r[t];});}function _encapsulate(n,t,o,c,a,u,y){var p=void 0,l={},b=void 0===t?"undefined":e(t),O=m?function(e){var r=y||c.type||Typeson.getJSONType(t);m(Object.assign(e||l,{keypath:n,value:t,cyclic:o,stateObj:c,promisesData:a,resolvingTypesonPromise:u,awaitingTypesonPromise:hasConstructorOf(t,TypesonPromise)},void 0!==r?{type:r}:{}));}:null;if(b in{string:1,boolean:1,number:1,undefined:1})return void 0===t||"number"===b&&(isNaN(t)||t===-1/0||t===1/0)?(p=replace(n,t,c,a,!1,u,O))!==t&&(l={replaced:p}):p=t,O&&O(),p;if(null===t)return O&&O(),t;if(o&&!c.iterateIn&&!c.iterateUnsetNumeric){var T=v.indexOf(t);if(!(T<0))return h[n]="#",O&&O({cyclicKeypath:d[T]}),"#"+d[T];!0===o&&(v.push(t),d.push(n));}var g=isPlainObject(t),P=i(t),j=(g||P)&&(!s.length||c.replaced)||c.iterateIn?t:replace(n,t,c,a,g||P,null,O),S=void 0;if(j!==t?(p=j,l={replaced:j}):P||"array"===c.iterateIn?(S=new Array(t.length),l={clone:S}):g||"object"===c.iterateIn?l={clone:S={}}:""===n&&hasConstructorOf(t,TypesonPromise)?(a.push([n,t,o,c,void 0,void 0,c.type]),p=t):p=t,O&&O(),f.iterateNone)return S||p;if(!S)return p;if(c.iterateIn){var w=function _loop(e){var r={ownKeys:t.hasOwnProperty(e)};_adaptBuiltinStateObjectProperties(c,r,function(){var r=n+(n?".":"")+escapeKeyPathComponent(e),i=_encapsulate(r,t[e],!!o,c,a,u);hasConstructorOf(i,TypesonPromise)?a.push([r,i,!!o,c,S,e,c.type]):void 0!==i&&(S[e]=i);});};for(var A in t)w(A);O&&O({endIterateIn:!0,end:!0});}else r(t).forEach(function(e){var r=n+(n?".":"")+escapeKeyPathComponent(e);_adaptBuiltinStateObjectProperties(c,{ownKeys:!0},function(){var n=_encapsulate(r,t[e],!!o,c,a,u);hasConstructorOf(n,TypesonPromise)?a.push([r,n,!!o,c,S,e,c.type]):void 0!==n&&(S[e]=n);});}),O&&O({endIterateOwn:!0,end:!0});if(c.iterateUnsetNumeric){for(var C=t.length,N=function _loop2(e){if(!(e in t)){var r=n+(n?".":"")+e;_adaptBuiltinStateObjectProperties(c,{ownKeys:!1},function(){var n=_encapsulate(r,void 0,!!o,c,a,u);hasConstructorOf(n,TypesonPromise)?a.push([r,n,!!o,c,S,e,c.type]):void 0!==n&&(S[e]=n);});}},B=0;B<C;B++)N(B);O&&O({endIterateUnsetNumeric:!0,end:!0});}return S}function replace(e,n,t,r,i,o,u){for(var y=i?s:c,p=y.length;p--;){var f=y[p];if(f.test(n,t)){var v=f.type;if(a[v]){var d=h[e];h[e]=d?[v].concat(d):v;}return Object.assign(t,{type:v,replaced:!0}),!l&&f.replaceAsync||f.replace?(u&&u({replacing:!0}),_encapsulate(e,f[l||!f.replaceAsync?"replace":"replaceAsync"](n,t),O&&"readonly",t,r,o,v)):(u&&u({typeDetected:!0}),_encapsulate(e,n,O&&"readonly",t,r,o,v))}}return n}};this.encapsulateSync=function(e,n,t){return l(e,n,Object.assign({},{throwOnBadSyncType:!0},t,{sync:!0}))},this.encapsulateAsync=function(e,n,t){return l(e,n,Object.assign({},{throwOnBadSyncType:!0},t,{sync:!1}))};var h=this.revive=function(e,t){var s=(t=Object.assign({sync:!0},o,t)).sync,c=e&&e.$types,u=!0;if(!c)return e;if(!0===c)return e.$;c.$&&isPlainObject(c.$)&&(e=e.$,c=c.$,u=!1);var y=[],p={},f=function _revive(e,t,o,s,f,l){if(u&&"$types"===e)return;var h=c[e];if(i(t)||isPlainObject(t)){var v=i(t)?new Array(t.length):{};for(r(t).forEach(function(n){var r=_revive(e+(e?".":"")+escapeKeyPathComponent(n),t[n],o||v,s,v,n);hasConstructorOf(r,Undefined)?v[n]=void 0:void 0!==r&&(v[n]=r);}),t=v;y.length;){var d=n(y[0],4),b=d[0],O=d[1],m=d[2],T=d[3],g=getByKeyPath(b,O);if(hasConstructorOf(g,Undefined))m[T]=void 0;else{if(void 0===g)break;m[T]=g;}y.splice(0,1);}}if(!h)return t;if("#"===h){var P=getByKeyPath(o,t.substr(1));return void 0===P&&y.push([o,t.substr(1),f,l]),P}var j=s.sync;return [].concat(h).reduce(function(e,n){var t=a[n];if(!t)throw new Error("Unregistered type: "+n);return t[j&&t.revive?"revive":!j&&t.reviveAsync?"reviveAsync":"revive"](e,p)},t)}("",e,null,t);return isThenable(f=hasConstructorOf(f,Undefined)?void 0:f)?s&&t.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():f:!s&&t.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():s?f:Promise.resolve(f)};this.reviveSync=function(e,n){return h(e,Object.assign({},{throwOnBadSyncType:!0},n,{sync:!0}))},this.reviveAsync=function(e,n){return h(e,Object.assign({},{throwOnBadSyncType:!0},n,{sync:!1}))},this.register=function(e,n){return n=n||{},[].concat(e).forEach(function R(e){if(i(e))return e.map(R);e&&r(e).forEach(function(t){if("#"===t)throw new TypeError("# cannot be used as a type name as it is reserved for cyclic objects");if(Typeson.JSON_TYPES.includes(t))throw new TypeError("Plain JSON object types are reserved as type names");var r=e[t],o=r.testPlainObjects?s:c,u=o.filter(function(e){return e.type===t});if(u.length&&(o.splice(o.indexOf(u[0]),1),delete a[t],delete y[t]),r){if("function"==typeof r){var p=r;r={test:function test(e){return e&&e.constructor===p},replace:function replace(e){return assign({},e)},revive:function revive(e){return assign(Object.create(p.prototype),e)}};}else i(r)&&(r={test:r[0],replace:r[1],revive:r[2]});var f={type:t,test:r.test.bind(r)};r.replace&&(f.replace=r.replace.bind(r)),r.replaceAsync&&(f.replaceAsync=r.replaceAsync.bind(r));var l="number"==typeof n.fallback?n.fallback:n.fallback?0:1/0;if(r.testPlainObjects?s.splice(l,0,f):c.splice(l,0,f),r.revive||r.reviveAsync){var h={};r.revive&&(h.revive=r.revive.bind(r)),r.reviveAsync&&(h.reviveAsync=r.reviveAsync.bind(r)),a[t]=h;}y[t]=r;}});}),this};}function assign(e,n){return r(n).map(function(t){e[t]=n[t];}),e}function escapeKeyPathComponent(e){return e.replace(/~/g,"~0").replace(/\./g,"~1")}function unescapeKeyPathComponent(e){return e.replace(/~1/g,".").replace(/~0/g,"~")}function getByKeyPath(e,n){if(""===n)return e;var t=n.indexOf(".");if(t>-1){var r=e[unescapeKeyPathComponent(n.substr(0,t))];return void 0===r?void 0:getByKeyPath(r,n.substr(t+1))}return e[unescapeKeyPathComponent(n)]}function Undefined(){}function TypesonPromise(e){this.p=new Promise(e);}return TypesonPromise.prototype.then=function(e,n){var t=this;return new TypesonPromise(function(r,i){t.p.then(function(n){r(e?e(n):n);},function(e){t.p.catch(function(e){return n?n(e):Promise.reject(e)}).then(r,i);});})},TypesonPromise.prototype.catch=function(e){return this.then(null,e)},TypesonPromise.resolve=function(e){return new TypesonPromise(function(n){n(e);})},TypesonPromise.reject=function(e){return new TypesonPromise(function(n,t){t(e);})},["all","race"].map(function(e){TypesonPromise[e]=function(n){return new TypesonPromise(function(t,r){Promise[e](n.map(function(e){return e.p})).then(t,r);})};}),Typeson.Undefined=Undefined,Typeson.Promise=TypesonPromise,Typeson.isThenable=isThenable,Typeson.toStringTag=toStringTag,Typeson.hasConstructorOf=hasConstructorOf,Typeson.isObject=isObject,Typeson.isPlainObject=isPlainObject,Typeson.isUserObject=function isUserObject(e){if(!e||"Object"!==toStringTag(e))return !1;var n=s(e);return !n||hasConstructorOf(e,Object)||isUserObject(n)},Typeson.escapeKeyPathComponent=escapeKeyPathComponent,Typeson.unescapeKeyPathComponent=unescapeKeyPathComponent,Typeson.getByKeyPath=getByKeyPath,Typeson.getJSONType=function(n){return null===n?"null":i(n)?"array":void 0===n?"undefined":e(n)},Typeson.JSON_TYPES=["null","boolean","number","string","array","object"],Typeson});
    });

    var structuredCloning = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}(commonjsGlobal,function(){var e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},t=function(){return function(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return function sliceIterator(e,t){var n=[],r=!0,i=!1,o=void 0;try{for(var s,a=e[Symbol.iterator]();!(r=(s=a.next()).done)&&(n.push(s.value),!t||n.length!==t);r=!0);}catch(e){i=!0,o=e;}finally{try{!r&&a.return&&a.return();}finally{if(i)throw o}}return n}(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),n=function(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)},r=Object.keys,i=Array.isArray,o={}.toString,s=Object.getPrototypeOf,a={}.hasOwnProperty,c=a.toString,u=["type","replaced","iterateIn","iterateUnsetNumeric"];function isThenable(e,t){return Typeson.isObject(e)&&"function"==typeof e.then&&(!t||"function"==typeof e.catch)}function toStringTag(e){return o.call(e).slice(8,-1)}function hasConstructorOf(t,n){if(!t||"object"!==(void 0===t?"undefined":e(t)))return !1;var r=s(t);if(!r)return !1;var i=a.call(r,"constructor")&&r.constructor;return "function"!=typeof i?null===n:"function"==typeof i&&null!==n&&c.call(i)===c.call(n)}function isPlainObject(e){return !(!e||"Object"!==toStringTag(e))&&(!s(e)||hasConstructorOf(e,Object))}function isObject(t){return t&&"object"===(void 0===t?"undefined":e(t))}function Typeson(o){var s=[],a=[],c={},f=this.types={},p=this.stringify=function(e,t,n,r){r=Object.assign({},o,r,{stringification:!0});var s=y(e,null,r);return i(s)?JSON.stringify(s[0],t,n):s.then(function(e){return JSON.stringify(e,t,n)})};this.stringifySync=function(e,t,n,r){return p(e,t,n,Object.assign({},{throwOnBadSyncType:!0},r,{sync:!0}))},this.stringifyAsync=function(e,t,n,r){return p(e,t,n,Object.assign({},{throwOnBadSyncType:!0},r,{sync:!1}))};var l=this.parse=function(e,t,n){return n=Object.assign({},o,n,{parse:!0}),v(JSON.parse(e,t),n)};this.parseSync=function(e,t,n){return l(e,t,Object.assign({},{throwOnBadSyncType:!0},n,{sync:!0}))},this.parseAsync=function(e,t,n){return l(e,t,Object.assign({},{throwOnBadSyncType:!0},n,{sync:!1}))},this.specialTypeNames=function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return n.returnTypeNames=!0,this.encapsulate(e,t,n)},this.rootTypeName=function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return n.iterateNone=!0,this.encapsulate(e,t,n)};var y=this.encapsulate=function(f,p,l){var y=(l=Object.assign({sync:!0},o,l)).sync,v={},d=[],h=[],g=[],b=!(l&&"cyclic"in l)||l.cyclic,m=l.encapsulateObserver,T=_encapsulate("",f,b,p||{},g);function finish(e){var t=Object.values(v);if(l.iterateNone)return t.length?t[0]:Typeson.getJSONType(e);if(t.length){if(l.returnTypeNames)return [].concat(n(new Set(t)));e&&isPlainObject(e)&&!e.hasOwnProperty("$types")?e.$types=v:e={$:e,$types:{$:v}};}else isObject(e)&&e.hasOwnProperty("$types")&&(e={$:e,$types:!0});return !l.returnTypeNames&&e}return g.length?y&&l.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():Promise.resolve(function checkPromises(e,n){return Promise.all(n.map(function(e){return e[1].p})).then(function(r){return Promise.all(r.map(function(r){var i=[],o=n.splice(0,1)[0],s=t(o,7),a=s[0],c=s[2],u=s[3],f=s[4],p=s[5],l=s[6],y=_encapsulate(a,r,c,u,i,!0,l),v=hasConstructorOf(y,TypesonPromise);return a&&v?y.p.then(function(t){return f[p]=t,checkPromises(e,i)}):(a?f[p]=y:e=v?y.p:y,checkPromises(e,i))}))}).then(function(){return e})}(T,g)).then(finish):!y&&l.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():l.stringification&&y?[finish(T)]:y?finish(T):Promise.resolve(finish(T));function _adaptBuiltinStateObjectProperties(e,t,n){Object.assign(e,t);var r=u.map(function(t){var n=e[t];return delete e[t],n});n(),u.forEach(function(t,n){e[t]=r[n];});}function _encapsulate(t,n,o,a,c,u,f){var p=void 0,y={},g=void 0===n?"undefined":e(n),b=m?function(e){var r=f||a.type||Typeson.getJSONType(n);m(Object.assign(e||y,{keypath:t,value:n,cyclic:o,stateObj:a,promisesData:c,resolvingTypesonPromise:u,awaitingTypesonPromise:hasConstructorOf(n,TypesonPromise)},void 0!==r?{type:r}:{}));}:null;if(g in{string:1,boolean:1,number:1,undefined:1})return void 0===n||"number"===g&&(isNaN(n)||n===-1/0||n===1/0)?(p=replace(t,n,a,c,!1,u,b))!==n&&(y={replaced:p}):p=n,b&&b(),p;if(null===n)return b&&b(),n;if(o&&!a.iterateIn&&!a.iterateUnsetNumeric){var T=d.indexOf(n);if(!(T<0))return v[t]="#",b&&b({cyclicKeypath:h[T]}),"#"+h[T];!0===o&&(d.push(n),h.push(t));}var O=isPlainObject(n),w=i(n),S=(O||w)&&(!s.length||a.replaced)||a.iterateIn?n:replace(t,n,a,c,O||w,null,b),P=void 0;if(S!==n?(p=S,y={replaced:S}):w||"array"===a.iterateIn?(P=new Array(n.length),y={clone:P}):O||"object"===a.iterateIn?y={clone:P={}}:""===t&&hasConstructorOf(n,TypesonPromise)?(c.push([t,n,o,a,void 0,void 0,a.type]),p=n):p=n,b&&b(),l.iterateNone)return P||p;if(!P)return p;if(a.iterateIn){var j=function _loop(e){var r={ownKeys:n.hasOwnProperty(e)};_adaptBuiltinStateObjectProperties(a,r,function(){var r=t+(t?".":"")+escapeKeyPathComponent(e),i=_encapsulate(r,n[e],!!o,a,c,u);hasConstructorOf(i,TypesonPromise)?c.push([r,i,!!o,a,P,e,a.type]):void 0!==i&&(P[e]=i);});};for(var A in n)j(A);b&&b({endIterateIn:!0,end:!0});}else r(n).forEach(function(e){var r=t+(t?".":"")+escapeKeyPathComponent(e);_adaptBuiltinStateObjectProperties(a,{ownKeys:!0},function(){var t=_encapsulate(r,n[e],!!o,a,c,u);hasConstructorOf(t,TypesonPromise)?c.push([r,t,!!o,a,P,e,a.type]):void 0!==t&&(P[e]=t);});}),b&&b({endIterateOwn:!0,end:!0});if(a.iterateUnsetNumeric){for(var C=n.length,N=function _loop2(e){if(!(e in n)){var r=t+(t?".":"")+e;_adaptBuiltinStateObjectProperties(a,{ownKeys:!1},function(){var t=_encapsulate(r,void 0,!!o,a,c,u);hasConstructorOf(t,TypesonPromise)?c.push([r,t,!!o,a,P,e,a.type]):void 0!==t&&(P[e]=t);});}},B=0;B<C;B++)N(B);b&&b({endIterateUnsetNumeric:!0,end:!0});}return P}function replace(e,t,n,r,i,o,u){for(var f=i?s:a,p=f.length;p--;){var l=f[p];if(l.test(t,n)){var d=l.type;if(c[d]){var h=v[e];v[e]=h?[d].concat(h):d;}return Object.assign(n,{type:d,replaced:!0}),!y&&l.replaceAsync||l.replace?(u&&u({replacing:!0}),_encapsulate(e,l[y||!l.replaceAsync?"replace":"replaceAsync"](t,n),b&&"readonly",n,r,o,d)):(u&&u({typeDetected:!0}),_encapsulate(e,t,b&&"readonly",n,r,o,d))}}return t}};this.encapsulateSync=function(e,t,n){return y(e,t,Object.assign({},{throwOnBadSyncType:!0},n,{sync:!0}))},this.encapsulateAsync=function(e,t,n){return y(e,t,Object.assign({},{throwOnBadSyncType:!0},n,{sync:!1}))};var v=this.revive=function(e,n){var s=(n=Object.assign({sync:!0},o,n)).sync,a=e&&e.$types,u=!0;if(!a)return e;if(!0===a)return e.$;a.$&&isPlainObject(a.$)&&(e=e.$,a=a.$,u=!1);var f=[],p={},l=function _revive(e,n,o,s,l,y){if(u&&"$types"===e)return;var v=a[e];if(i(n)||isPlainObject(n)){var d=i(n)?new Array(n.length):{};for(r(n).forEach(function(t){var r=_revive(e+(e?".":"")+escapeKeyPathComponent(t),n[t],o||d,s,d,t);hasConstructorOf(r,Undefined)?d[t]=void 0:void 0!==r&&(d[t]=r);}),n=d;f.length;){var h=t(f[0],4),g=h[0],b=h[1],m=h[2],T=h[3],O=getByKeyPath(g,b);if(hasConstructorOf(O,Undefined))m[T]=void 0;else{if(void 0===O)break;m[T]=O;}f.splice(0,1);}}if(!v)return n;if("#"===v){var w=getByKeyPath(o,n.substr(1));return void 0===w&&f.push([o,n.substr(1),l,y]),w}var S=s.sync;return [].concat(v).reduce(function(e,t){var n=c[t];if(!n)throw new Error("Unregistered type: "+t);return n[S&&n.revive?"revive":!S&&n.reviveAsync?"reviveAsync":"revive"](e,p)},n)}("",e,null,n);return isThenable(l=hasConstructorOf(l,Undefined)?void 0:l)?s&&n.throwOnBadSyncType?function(){throw new TypeError("Sync method requested but async result obtained")}():l:!s&&n.throwOnBadSyncType?function(){throw new TypeError("Async method requested but sync result obtained")}():s?l:Promise.resolve(l)};this.reviveSync=function(e,t){return v(e,Object.assign({},{throwOnBadSyncType:!0},t,{sync:!0}))},this.reviveAsync=function(e,t){return v(e,Object.assign({},{throwOnBadSyncType:!0},t,{sync:!1}))},this.register=function(e,t){return t=t||{},[].concat(e).forEach(function R(e){if(i(e))return e.map(R);e&&r(e).forEach(function(n){if("#"===n)throw new TypeError("# cannot be used as a type name as it is reserved for cyclic objects");if(Typeson.JSON_TYPES.includes(n))throw new TypeError("Plain JSON object types are reserved as type names");var r=e[n],o=r.testPlainObjects?s:a,u=o.filter(function(e){return e.type===n});if(u.length&&(o.splice(o.indexOf(u[0]),1),delete c[n],delete f[n]),r){if("function"==typeof r){var p=r;r={test:function test(e){return e&&e.constructor===p},replace:function replace(e){return assign({},e)},revive:function revive(e){return assign(Object.create(p.prototype),e)}};}else i(r)&&(r={test:r[0],replace:r[1],revive:r[2]});var l={type:n,test:r.test.bind(r)};r.replace&&(l.replace=r.replace.bind(r)),r.replaceAsync&&(l.replaceAsync=r.replaceAsync.bind(r));var y="number"==typeof t.fallback?t.fallback:t.fallback?0:1/0;if(r.testPlainObjects?s.splice(y,0,l):a.splice(y,0,l),r.revive||r.reviveAsync){var v={};r.revive&&(v.revive=r.revive.bind(r)),r.reviveAsync&&(v.reviveAsync=r.reviveAsync.bind(r)),c[n]=v;}f[n]=r;}});}),this};}function assign(e,t){return r(t).map(function(n){e[n]=t[n];}),e}function escapeKeyPathComponent(e){return e.replace(/~/g,"~0").replace(/\./g,"~1")}function unescapeKeyPathComponent(e){return e.replace(/~1/g,".").replace(/~0/g,"~")}function getByKeyPath(e,t){if(""===t)return e;var n=t.indexOf(".");if(n>-1){var r=e[unescapeKeyPathComponent(t.substr(0,n))];return void 0===r?void 0:getByKeyPath(r,t.substr(n+1))}return e[unescapeKeyPathComponent(t)]}function Undefined(){}function TypesonPromise(e){this.p=new Promise(e);}TypesonPromise.prototype.then=function(e,t){var n=this;return new TypesonPromise(function(r,i){n.p.then(function(t){r(e?e(t):t);},function(e){n.p.catch(function(e){return t?t(e):Promise.reject(e)}).then(r,i);});})},TypesonPromise.prototype.catch=function(e){return this.then(null,e)},TypesonPromise.resolve=function(e){return new TypesonPromise(function(t){t(e);})},TypesonPromise.reject=function(e){return new TypesonPromise(function(t,n){n(e);})},["all","race"].map(function(e){TypesonPromise[e]=function(t){return new TypesonPromise(function(n,r){Promise[e](t.map(function(e){return e.p})).then(n,r);})};}),Typeson.Undefined=Undefined,Typeson.Promise=TypesonPromise,Typeson.isThenable=isThenable,Typeson.toStringTag=toStringTag,Typeson.hasConstructorOf=hasConstructorOf,Typeson.isObject=isObject,Typeson.isPlainObject=isPlainObject,Typeson.isUserObject=function isUserObject(e){if(!e||"Object"!==toStringTag(e))return !1;var t=s(e);return !t||hasConstructorOf(e,Object)||isUserObject(t)},Typeson.escapeKeyPathComponent=escapeKeyPathComponent,Typeson.unescapeKeyPathComponent=unescapeKeyPathComponent,Typeson.getByKeyPath=getByKeyPath,Typeson.getJSONType=function(t){return null===t?"null":i(t)?"array":void 0===t?"undefined":e(t)},Typeson.JSON_TYPES=["null","boolean","number","string","array","object"];for(var f={userObject:{test:function test(e,t){return Typeson.isUserObject(e)},replace:function replace(e){return Object.assign({},e)},revive:function revive(e){return e}}},p=[[{sparseArrays:{testPlainObjects:!0,test:function test(e){return Array.isArray(e)},replace:function replace(e,t){return t.iterateUnsetNumeric=!0,e}}},{sparseUndefined:{test:function test(e,t){return void 0===e&&!1===t.ownKeys},replace:function replace(e){return null},revive:function revive(e){}}}],{undef:{test:function test(e,t){return void 0===e&&(t.ownKeys||!("ownKeys"in t))},replace:function replace(e){return null},revive:function revive(e){return new Typeson.Undefined}}}],l={StringObject:{test:function test(t){return "String"===Typeson.toStringTag(t)&&"object"===(void 0===t?"undefined":e(t))},replace:function replace(e){return String(e)},revive:function revive(e){return new String(e)}},BooleanObject:{test:function test(t){return "Boolean"===Typeson.toStringTag(t)&&"object"===(void 0===t?"undefined":e(t))},replace:function replace(e){return Boolean(e)},revive:function revive(e){return new Boolean(e)}},NumberObject:{test:function test(t){return "Number"===Typeson.toStringTag(t)&&"object"===(void 0===t?"undefined":e(t))},replace:function replace(e){return Number(e)},revive:function revive(e){return new Number(e)}}},y=[{nan:{test:function test(e){return "number"==typeof e&&isNaN(e)},replace:function replace(e){return "NaN"},revive:function revive(e){return NaN}}},{infinity:{test:function test(e){return e===1/0},replace:function replace(e){return "Infinity"},revive:function revive(e){return 1/0}}},{negativeInfinity:{test:function test(e){return e===-1/0},replace:function replace(e){return "-Infinity"},revive:function revive(e){return -1/0}}}],v={date:{test:function test(e){return "Date"===Typeson.toStringTag(e)},replace:function replace(e){var t=e.getTime();return isNaN(t)?"NaN":t},revive:function revive(e){return "NaN"===e?new Date(NaN):new Date(e)}}},d={regexp:{test:function test(e){return "RegExp"===Typeson.toStringTag(e)},replace:function replace(e){return {source:e.source,flags:(e.global?"g":"")+(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.sticky?"y":"")+(e.unicode?"u":"")}},revive:function revive(e){var t=e.source,n=e.flags;return new RegExp(t,n)}}},h={map:{test:function test(e){return "Map"===Typeson.toStringTag(e)},replace:function replace(e){return Array.from(e.entries())},revive:function revive(e){return new Map(e)}}},g={set:{test:function test(e){return "Set"===Typeson.toStringTag(e)},replace:function replace(e){return Array.from(e.values())},revive:function revive(e){return new Set(e)}}},b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",m=new Uint8Array(256),T=0;T<b.length;T++)m[b.charCodeAt(T)]=T;var O=function encode(e,t,n){for(var r=new Uint8Array(e,t,n),i=r.length,o="",s=0;s<i;s+=3)o+=b[r[s]>>2],o+=b[(3&r[s])<<4|r[s+1]>>4],o+=b[(15&r[s+1])<<2|r[s+2]>>6],o+=b[63&r[s+2]];return i%3==2?o=o.substring(0,o.length-1)+"=":i%3==1&&(o=o.substring(0,o.length-2)+"=="),o},w=function decode(e){var t=e.length,n=.75*e.length,r=0,i=void 0,o=void 0,s=void 0,a=void 0;"="===e[e.length-1]&&(n--,"="===e[e.length-2]&&n--);for(var c=new ArrayBuffer(n),u=new Uint8Array(c),f=0;f<t;f+=4)i=m[e.charCodeAt(f)],o=m[e.charCodeAt(f+1)],s=m[e.charCodeAt(f+2)],a=m[e.charCodeAt(f+3)],u[r++]=i<<2|o>>4,u[r++]=(15&o)<<4|s>>2,u[r++]=(3&s)<<6|63&a;return c},S={arraybuffer:{test:function test(e){return "ArrayBuffer"===Typeson.toStringTag(e)},replace:function replace(e,t){t.buffers||(t.buffers=[]);var n=t.buffers.indexOf(e);return n>-1?{index:n}:(t.buffers.push(e),O(e))},revive:function revive(t,n){if(n.buffers||(n.buffers=[]),"object"===(void 0===t?"undefined":e(t)))return n.buffers[t.index];var r=w(t);return n.buffers.push(r),r}}},P="undefined"==typeof self?commonjsGlobal:self,j={};["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"].forEach(function(e){var t=e,n=P[t];n&&(j[e.toLowerCase()]={test:function test(e){return Typeson.toStringTag(e)===t},replace:function replace(e,t){var n=e.buffer,r=e.byteOffset,i=e.length;t.buffers||(t.buffers=[]);var o=t.buffers.indexOf(n);return o>-1?{index:o,byteOffset:r,length:i}:(t.buffers.push(n),{encoded:O(n),byteOffset:r,length:i})},revive:function revive(e,t){t.buffers||(t.buffers=[]);var r=e.byteOffset,i=e.length,o=e.encoded,s=e.index,a=void 0;return "index"in e?a=t.buffers[s]:(a=w(o),t.buffers.push(a)),new n(a,r,i)}});});var A={dataview:{test:function test(e){return "DataView"===Typeson.toStringTag(e)},replace:function replace(e,t){var n=e.buffer,r=e.byteOffset,i=e.byteLength;t.buffers||(t.buffers=[]);var o=t.buffers.indexOf(n);return o>-1?{index:o,byteOffset:r,byteLength:i}:(t.buffers.push(n),{encoded:O(n),byteOffset:r,byteLength:i})},revive:function revive(e,t){t.buffers||(t.buffers=[]);var n=e.byteOffset,r=e.byteLength,i=e.encoded,o=e.index,s=void 0;return "index"in e?s=t.buffers[o]:(s=w(i),t.buffers.push(s)),new DataView(s,n,r)}}},C={IntlCollator:{test:function test(e){return Typeson.hasConstructorOf(e,Intl.Collator)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.Collator(e.locale,e)}},IntlDateTimeFormat:{test:function test(e){return Typeson.hasConstructorOf(e,Intl.DateTimeFormat)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.DateTimeFormat(e.locale,e)}},IntlNumberFormat:{test:function test(e){return Typeson.hasConstructorOf(e,Intl.NumberFormat)},replace:function replace(e){return e.resolvedOptions()},revive:function revive(e){return new Intl.NumberFormat(e.locale,e)}}};function string2arraybuffer(e){for(var t=new Uint16Array(e.length),n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t.buffer}var N={file:{test:function test(e){return "File"===Typeson.toStringTag(e)},replace:function replace(e){var t=new XMLHttpRequest;if(t.open("GET",URL.createObjectURL(e),!1),"undefined"!=typeof TextEncoder&&t.overrideMimeType("text/plain; charset=utf-16le"),200!==t.status&&0!==t.status)throw new Error("Bad Blob access: "+t.status);return t.send(),{type:e.type,stringContents:t.responseText,name:e.name,lastModified:e.lastModified}},revive:function revive(e){var t=e.name,n=e.type,r=e.stringContents,i=e.lastModified,o=string2arraybuffer(r);return new File([o],t,{type:n,lastModified:i})},replaceAsync:function replaceAsync(e){return new Typeson.Promise(function(t,n){if(e.isClosed)n(new Error("The File is closed"));else{var r=new FileReader;r.addEventListener("load",function(){t({type:e.type,stringContents:r.result,name:e.name,lastModified:e.lastModified});}),r.addEventListener("error",function(){n(r.error);}),r.readAsText(e,"UTF-16");}})}}};return [f,p,l,y,v,d,{imagedata:{test:function test(e){return "ImageData"===Typeson.toStringTag(e)},replace:function replace(e){return {array:Array.from(e.data),width:e.width,height:e.height}},revive:function revive(e){return new ImageData(new Uint8ClampedArray(e.array),e.width,e.height)}}},{imagebitmap:{test:function test(e){return "ImageBitmap"===Typeson.toStringTag(e)||e&&e.dataset&&"ImageBitmap"===e.dataset.toStringTag},replace:function replace(e){var t=document.createElement("canvas");return t.getContext("2d").drawImage(e,0,0),t.toDataURL()},revive:function revive(e){var t=document.createElement("canvas"),n=t.getContext("2d"),r=document.createElement("img");return r.onload=function(){n.drawImage(r,0,0);},r.src=e,t},reviveAsync:function reviveAsync(e){var t=document.createElement("canvas"),n=t.getContext("2d"),r=document.createElement("img");return r.onload=function(){n.drawImage(r,0,0);},r.src=e,createImageBitmap(t)}}},N,{file:N.file,filelist:{test:function test(e){return "FileList"===Typeson.toStringTag(e)},replace:function replace(e){for(var t=[],n=0;n<e.length;n++)t[n]=e.item(n);return t},revive:function revive(e){function FileList(){this._files=arguments[0],this.length=this._files.length;}return FileList.prototype.item=function(e){return this._files[e]},FileList.prototype[Symbol.toStringTag]="FileList",new FileList(e)}}},{blob:{test:function test(e){return "Blob"===Typeson.toStringTag(e)},replace:function replace(e){var t=new XMLHttpRequest;if(t.open("GET",URL.createObjectURL(e),!1),"undefined"!=typeof TextEncoder&&t.overrideMimeType("text/plain; charset=utf-16le"),200!==t.status&&0!==t.status)throw new Error("Bad Blob access: "+t.status);return t.send(),{type:e.type,stringContents:t.responseText}},revive:function revive(e){var t=e.type,n=e.stringContents;return new Blob([string2arraybuffer(n)],{type:t})},replaceAsync:function replaceAsync(e){return new Typeson.Promise(function(t,n){if(e.isClosed)n(new Error("The Blob is closed"));else{var r=new FileReader;r.addEventListener("load",function(){t({type:e.type,stringContents:r.result});}),r.addEventListener("error",function(){n(r.error);}),r.readAsText(e,"UTF-16");}})}}}].concat("function"==typeof Map?h:[],"function"==typeof Set?g:[],"function"==typeof ArrayBuffer?S:[],"function"==typeof Uint8Array?j:[],"function"==typeof DataView?A:[],"undefined"!=typeof Intl?C:[])});

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
      lookup[chars.charCodeAt(i)] = i;
    }

    var encode = function encode(arraybuffer, byteOffset, length) {
      if (length === null || length === undefined) {
        length = arraybuffer.byteLength; // Needed for Safari
      }

      var bytes = new Uint8Array(arraybuffer, byteOffset || 0, // Default needed for Safari
      length);
      var len = bytes.length;
      var base64 = '';

      for (var _i = 0; _i < len; _i += 3) {
        base64 += chars[bytes[_i] >> 2];
        base64 += chars[(bytes[_i] & 3) << 4 | bytes[_i + 1] >> 4];
        base64 += chars[(bytes[_i + 1] & 15) << 2 | bytes[_i + 2] >> 6];
        base64 += chars[bytes[_i + 2] & 63];
      }

      if (len % 3 === 2) {
        base64 = base64.substring(0, base64.length - 1) + '=';
      } else if (len % 3 === 1) {
        base64 = base64.substring(0, base64.length - 2) + '==';
      }

      return base64;
    };
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
        encoded1 = lookup[base64.charCodeAt(_i2)];
        encoded2 = lookup[base64.charCodeAt(_i2 + 1)];
        encoded3 = lookup[base64.charCodeAt(_i2 + 2)];
        encoded4 = lookup[base64.charCodeAt(_i2 + 3)];
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
                        console.log("b.size: " + b.size);
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
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readBlobAsync(new Blob(blobsToAwait), 'binary')];
                case 1:
                    allChunks = _a.sent();
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
                                        typeSpec.finalize(b, allChunks.slice(b.start, b.end));
                                    }
                                }
                            }
                        }
                    }
                    // Free up memory
                    blobsToAwait = [];
                    return [2 /*return*/];
            }
        });
    }); };

    var DEFAULT_ROWS_PER_CHUNK = 2000;
    function exportDB(db, options) {
        return __awaiter(this, void 0, void 0, function () {
            function exportAll() {
                return __awaiter(this, void 0, void 0, function () {
                    var tablesRowCounts, emptyExportJson, posEndDataArray, firstJsonSlice, filter, _loop_1, _i, tables_1, tableName;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, Promise.all(db.tables.map(function (table) { return table.count(); }))];
                            case 1:
                                tablesRowCounts = _a.sent();
                                tablesRowCounts.forEach(function (rowCount, i) { return tables[i].rowCount = rowCount; });
                                progress.totalRows = tablesRowCounts.reduce(function (p, c) { return p + c; });
                                emptyExportJson = JSON.stringify(emptyExport, undefined, prettyJson ? 2 : undefined);
                                posEndDataArray = emptyExportJson.lastIndexOf(']');
                                firstJsonSlice = emptyExportJson.substring(0, posEndDataArray);
                                slices.push(firstJsonSlice);
                                filter = options.filter;
                                _loop_1 = function (tableName) {
                                    var table, primKey, inbound, LIMIT, emptyTableExport, emptyTableExportJson, posEndRowsArray, lastKey, lastNumRows, mayHaveMoreRows, _loop_2, state_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
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
                                                    var chunkedCollection, values, filteredValues, tsonValues, json, keys, keyvals, tsonTuples, json;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
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
                                                                values = _a.sent();
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
                                                                tsonValues = filteredValues.map(function (value) { return TSON.encapsulate(value); });
                                                                if (!TSON.mustFinalize()) return [3 /*break*/, 3];
                                                                return [4 /*yield*/, Dexie.waitFor(TSON.finalize(tsonValues))];
                                                            case 2:
                                                                _a.sent();
                                                                _a.label = 3;
                                                            case 3:
                                                                json = JSON.stringify(tsonValues, undefined, prettyJson ? 2 : undefined);
                                                                if (prettyJson)
                                                                    json = json.split('\n').join('\n      ');
                                                                // By generating a blob here, we give web platform the opportunity to store the contents
                                                                // on disk and release RAM.
                                                                slices.push(new Blob([json.substring(1, json.length - 1)]));
                                                                lastNumRows = filteredValues.length;
                                                                lastKey = values.length > 0 ?
                                                                    Dexie.getByKeyPath(values[values.length - 1], primKey.keyPath) :
                                                                    null;
                                                                return [3 /*break*/, 8];
                                                            case 4: return [4 /*yield*/, chunkedCollection.primaryKeys()];
                                                            case 5:
                                                                keys = _a.sent();
                                                                keyvals = keys.map(function (key, i) { return [key, values[i]]; });
                                                                if (filter)
                                                                    keyvals = keyvals.filter(function (_a) {
                                                                        var key = _a[0], value = _a[1];
                                                                        return filter(tableName, value, key);
                                                                    });
                                                                tsonTuples = keyvals.map(function (tuple) { return TSON.encapsulate(tuple); });
                                                                if (!TSON.mustFinalize()) return [3 /*break*/, 7];
                                                                return [4 /*yield*/, Dexie.waitFor(TSON.finalize(tsonTuples))];
                                                            case 6:
                                                                _a.sent();
                                                                _a.label = 7;
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
                                                                _a.label = 8;
                                                            case 8:
                                                                progress.completedRows += values.length;
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                };
                                                _a.label = 1;
                                            case 1:
                                                if (!mayHaveMoreRows) return [3 /*break*/, 3];
                                                return [5 /*yield**/, _loop_2()];
                                            case 2:
                                                state_1 = _a.sent();
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
            var slices, tables, prettyJson, emptyExport, progressCallback, progress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {};
                        slices = [];
                        tables = db.tables.map(function (table) { return ({
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
                            totalTables: db.tables.length
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
                    case 7:
                        if (progressCallback) {
                            // Keep ongoing transaction private
                            Dexie.ignoreTransaction(function () { return progressCallback(progress); });
                        }
                        return [2 /*return*/, new Blob(slices, { type: "text/json" })];
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
              var event = (parser.state === S.CLOSE_KEY) ? 'key' : 'object';
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
                        db = new Dexie(dbExport.databaseName);
                        db.version(dbExport.databaseVersion).stores(extractDbSchema(dbExport));
                        return [4 /*yield*/, importInto(db, stream, options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, db];
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
                                    var tableName, table, tableSchemaStr, sourceRows, rows, i, obj, filter, filteredRows, _a, keys, values;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
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
                                                        throw new Error("Exported table " + tableExport.tableName + " is missing in installed database");
                                                    else
                                                        return [2 /*return*/, "continue"];
                                                }
                                                if (!options.acceptChangedPrimaryKey &&
                                                    tableSchemaStr.split(',')[0] != table.schema.primKey.src) {
                                                    throw new Error("Primary key differs for table " + tableExport.tableName + ". ");
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
                                                filteredRows = filter ?
                                                    tableExport.inbound ?
                                                        rows.filter(function (value) { return filter(tableName, value); }) :
                                                        rows.filter(function (_a) {
                                                            var key = _a[0], value = _a[1];
                                                            return filter(tableName, value, key);
                                                        }) :
                                                    rows;
                                                _a = tableExport.inbound ?
                                                    [undefined, filteredRows] :
                                                    [filteredRows.map(function (row) { return row[0]; }), rows.map(function (row) { return row[1]; })], keys = _a[0], values = _a[1];
                                                if (!options.clearTablesBeforeImport) return [3 /*break*/, 2];
                                                return [4 /*yield*/, table.clear()];
                                            case 1:
                                                _b.sent();
                                                _b.label = 2;
                                            case 2:
                                                if (!options.overwriteValues) return [3 /*break*/, 4];
                                                return [4 /*yield*/, table.bulkPut(values, keys)];
                                            case 3:
                                                _b.sent();
                                                return [3 /*break*/, 6];
                                            case 4: return [4 /*yield*/, table.bulkAdd(values, keys)];
                                            case 5:
                                                _b.sent();
                                                _b.label = 6;
                                            case 6:
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
                                _b.label = 10;
                            case 10: return [2 /*return*/];
                        }
                    });
                });
            }
            var CHUNK_SIZE, jsonStream, dbExportFile, readBlobsSynchronously, dbExport, progressCallback, progress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = options || {}; // All booleans defaults to false.
                        CHUNK_SIZE = options.chunkSizeBytes || (DEFAULT_KILOBYTES_PER_CHUNK * 1024);
                        return [4 /*yield*/, loadUntilWeGotEnoughData(exportedData, CHUNK_SIZE)];
                    case 1:
                        jsonStream = _a.sent();
                        dbExportFile = jsonStream.result;
                        readBlobsSynchronously = 'FileReaderSync' in self;
                        dbExport = dbExportFile.data;
                        if (!options.acceptNameDiff && db.name !== dbExport.databaseName)
                            throw new Error("Name differs. Current database name is " + db.name + " but export is " + dbExport.databaseName);
                        if (!options.acceptVersionDiff && db.verno !== dbExport.databaseVersion) {
                            // Possible feature: Call upgraders in some isolated way if this happens... ?
                            throw new Error("Database version differs. Current database is in version " + db.verno + " but export is " + dbExport.databaseVersion);
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
                        if (!options.noTransaction) return [3 /*break*/, 3];
                        return [4 /*yield*/, importAll()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, db.transaction('rw', db.tables, importAll)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
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
                            throw new Error("Format version " + dbExportFile.formatVersion + " not supported");
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

    exports.exportDB = exportDB;
    exports.importDB = importDB;
    exports.importInto = importInto;
    exports.default = dexieExportImport;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=dexie-export-import.js.map
