var Gc = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ph(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var du = { exports: {} };
(function(t, e) {
  (function(n, r) {
    t.exports = r();
  })(Gc, function() {
    var n = function(s, a) {
      return (n = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(u, p) {
        u.__proto__ = p;
      } || function(u, p) {
        for (var y in p)
          Object.prototype.hasOwnProperty.call(p, y) && (u[y] = p[y]);
      })(s, a);
    }, r = function() {
      return (r = Object.assign || function(s) {
        for (var a, u = 1, p = arguments.length; u < p; u++)
          for (var y in a = arguments[u])
            Object.prototype.hasOwnProperty.call(a, y) && (s[y] = a[y]);
        return s;
      }).apply(this, arguments);
    };
    function i(s, a, u) {
      if (u || arguments.length === 2)
        for (var p, y = 0, v = a.length; y < v; y++)
          !p && y in a || ((p = p || Array.prototype.slice.call(a, 0, y))[y] = a[y]);
      return s.concat(p || Array.prototype.slice.call(a));
    }
    var o = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : Gc, c = Object.keys, l = Array.isArray;
    function d(s, a) {
      return typeof a != "object" || c(a).forEach(function(u) {
        s[u] = a[u];
      }), s;
    }
    typeof Promise > "u" || o.Promise || (o.Promise = Promise);
    var h = Object.getPrototypeOf, f = {}.hasOwnProperty;
    function g(s, a) {
      return f.call(s, a);
    }
    function m(s, a) {
      typeof a == "function" && (a = a(h(s))), (typeof Reflect > "u" ? c : Reflect.ownKeys)(a).forEach(function(u) {
        w(s, u, a[u]);
      });
    }
    var b = Object.defineProperty;
    function w(s, a, u, p) {
      b(s, a, d(u && g(u, "get") && typeof u.get == "function" ? { get: u.get, set: u.set, configurable: !0 } : { value: u, configurable: !0, writable: !0 }, p));
    }
    function I(s) {
      return { from: function(a) {
        return s.prototype = Object.create(a.prototype), w(s.prototype, "constructor", s), { extend: m.bind(null, s.prototype) };
      } };
    }
    var j = Object.getOwnPropertyDescriptor, $ = [].slice;
    function B(s, a, u) {
      return $.call(s, a, u);
    }
    function L(s, a) {
      return a(s);
    }
    function Q(s) {
      if (!s)
        throw new Error("Assertion Failed");
    }
    function se(s) {
      o.setImmediate ? setImmediate(s) : setTimeout(s, 0);
    }
    function te(s, a) {
      if (typeof a == "string" && g(s, a))
        return s[a];
      if (!a)
        return s;
      if (typeof a != "string") {
        for (var u = [], p = 0, y = a.length; p < y; ++p) {
          var v = te(s, a[p]);
          u.push(v);
        }
        return u;
      }
      var k = a.indexOf(".");
      if (k !== -1) {
        var S = s[a.substr(0, k)];
        return S == null ? void 0 : te(S, a.substr(k + 1));
      }
    }
    function oe(s, a, u) {
      if (s && a !== void 0 && !("isFrozen" in Object && Object.isFrozen(s)))
        if (typeof a != "string" && "length" in a) {
          Q(typeof u != "string" && "length" in u);
          for (var p = 0, y = a.length; p < y; ++p)
            oe(s, a[p], u[p]);
        } else {
          var v, k, S = a.indexOf(".");
          S !== -1 ? (v = a.substr(0, S), (k = a.substr(S + 1)) === "" ? u === void 0 ? l(s) && !isNaN(parseInt(v)) ? s.splice(v, 1) : delete s[v] : s[v] = u : oe(S = !(S = s[v]) || !g(s, v) ? s[v] = {} : S, k, u)) : u === void 0 ? l(s) && !isNaN(parseInt(a)) ? s.splice(a, 1) : delete s[a] : s[a] = u;
        }
    }
    function je(s) {
      var a, u = {};
      for (a in s)
        g(s, a) && (u[a] = s[a]);
      return u;
    }
    var ye = [].concat;
    function De(s) {
      return ye.apply([], s);
    }
    var Pt = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(De([8, 16, 32, 64].map(function(s) {
      return ["Int", "Uint", "Float"].map(function(a) {
        return a + s + "Array";
      });
    }))).filter(function(s) {
      return o[s];
    }), H = new Set(Pt.map(function(s) {
      return o[s];
    })), de = null;
    function me(s) {
      return de = /* @__PURE__ */ new WeakMap(), s = function a(u) {
        if (!u || typeof u != "object")
          return u;
        var p = de.get(u);
        if (p)
          return p;
        if (l(u)) {
          p = [], de.set(u, p);
          for (var y = 0, v = u.length; y < v; ++y)
            p.push(a(u[y]));
        } else if (H.has(u.constructor))
          p = u;
        else {
          var k, S = h(u);
          for (k in p = S === Object.prototype ? {} : Object.create(S), de.set(u, p), u)
            g(u, k) && (p[k] = a(u[k]));
        }
        return p;
      }(s), de = null, s;
    }
    var we = {}.toString;
    function ke(s) {
      return we.call(s).slice(8, -1);
    }
    var z = typeof Symbol < "u" ? Symbol.iterator : "@@iterator", ne = typeof z == "symbol" ? function(s) {
      var a;
      return s != null && (a = s[z]) && a.apply(s);
    } : function() {
      return null;
    };
    function re(s, a) {
      return a = s.indexOf(a), 0 <= a && s.splice(a, 1), 0 <= a;
    }
    var ge = {};
    function be(s) {
      var a, u, p, y;
      if (arguments.length === 1) {
        if (l(s))
          return s.slice();
        if (this === ge && typeof s == "string")
          return [s];
        if (y = ne(s)) {
          for (u = []; !(p = y.next()).done; )
            u.push(p.value);
          return u;
        }
        if (s == null)
          return [s];
        if (typeof (a = s.length) != "number")
          return [s];
        for (u = new Array(a); a--; )
          u[a] = s[a];
        return u;
      }
      for (a = arguments.length, u = new Array(a); a--; )
        u[a] = arguments[a];
      return u;
    }
    var ue = typeof Symbol < "u" ? function(s) {
      return s[Symbol.toStringTag] === "AsyncFunction";
    } : function() {
      return !1;
    }, Er = ["Unknown", "Constraint", "Data", "TransactionInactive", "ReadOnly", "Version", "NotFound", "InvalidState", "InvalidAccess", "Abort", "Timeout", "QuotaExceeded", "Syntax", "DataClone"], Et = ["Modify", "Bulk", "OpenFailed", "VersionChange", "Schema", "Upgrade", "InvalidTable", "MissingAPI", "NoSuchDatabase", "InvalidArgument", "SubTransaction", "Unsupported", "Internal", "DatabaseClosed", "PrematureCommit", "ForeignAwait"].concat(Er), ae = { VersionChanged: "Database version changed by other database connection", DatabaseClosed: "Database has been closed", Abort: "Transaction aborted", TransactionInactive: "Transaction has already completed or failed", MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb" };
    function Ae(s, a) {
      this.name = s, this.message = a;
    }
    function it(s, a) {
      return s + ". Errors: " + Object.keys(a).map(function(u) {
        return a[u].toString();
      }).filter(function(u, p, y) {
        return y.indexOf(u) === p;
      }).join(`
`);
    }
    function Je(s, a, u, p) {
      this.failures = a, this.failedKeys = p, this.successCount = u, this.message = it(s, a);
    }
    function Ke(s, a) {
      this.name = "BulkError", this.failures = Object.keys(a).map(function(u) {
        return a[u];
      }), this.failuresByPos = a, this.message = it(s, this.failures);
    }
    I(Ae).from(Error).extend({ toString: function() {
      return this.name + ": " + this.message;
    } }), I(Je).from(Ae), I(Ke).from(Ae);
    var st = Et.reduce(function(s, a) {
      return s[a] = a + "Error", s;
    }, {}), Ve = Ae, Z = Et.reduce(function(s, a) {
      var u = a + "Error";
      function p(y, v) {
        this.name = u, y ? typeof y == "string" ? (this.message = "".concat(y).concat(v ? `
 ` + v : ""), this.inner = v || null) : typeof y == "object" && (this.message = "".concat(y.name, " ").concat(y.message), this.inner = y) : (this.message = ae[a] || u, this.inner = null);
      }
      return I(p).from(Ve), s[a] = p, s;
    }, {});
    Z.Syntax = SyntaxError, Z.Type = TypeError, Z.Range = RangeError;
    var Le = Er.reduce(function(s, a) {
      return s[a + "Error"] = Z[a], s;
    }, {}), qe = Et.reduce(function(s, a) {
      return ["Syntax", "Type", "Range"].indexOf(a) === -1 && (s[a + "Error"] = Z[a]), s;
    }, {});
    function ce() {
    }
    function _e(s) {
      return s;
    }
    function Ie(s, a) {
      return s == null || s === _e ? a : function(u) {
        return a(s(u));
      };
    }
    function Re(s, a) {
      return function() {
        s.apply(this, arguments), a.apply(this, arguments);
      };
    }
    function vt(s, a) {
      return s === ce ? a : function() {
        var u = s.apply(this, arguments);
        u !== void 0 && (arguments[0] = u);
        var p = this.onsuccess, y = this.onerror;
        this.onsuccess = null, this.onerror = null;
        var v = a.apply(this, arguments);
        return p && (this.onsuccess = this.onsuccess ? Re(p, this.onsuccess) : p), y && (this.onerror = this.onerror ? Re(y, this.onerror) : y), v !== void 0 ? v : u;
      };
    }
    function En(s, a) {
      return s === ce ? a : function() {
        s.apply(this, arguments);
        var u = this.onsuccess, p = this.onerror;
        this.onsuccess = this.onerror = null, a.apply(this, arguments), u && (this.onsuccess = this.onsuccess ? Re(u, this.onsuccess) : u), p && (this.onerror = this.onerror ? Re(p, this.onerror) : p);
      };
    }
    function Tt(s, a) {
      return s === ce ? a : function(u) {
        var p = s.apply(this, arguments);
        d(u, p);
        var y = this.onsuccess, v = this.onerror;
        return this.onsuccess = null, this.onerror = null, u = a.apply(this, arguments), y && (this.onsuccess = this.onsuccess ? Re(y, this.onsuccess) : y), v && (this.onerror = this.onerror ? Re(v, this.onerror) : v), p === void 0 ? u === void 0 ? void 0 : u : d(p, u);
      };
    }
    function Fd(s, a) {
      return s === ce ? a : function() {
        return a.apply(this, arguments) !== !1 && s.apply(this, arguments);
      };
    }
    function ro(s, a) {
      return s === ce ? a : function() {
        var u = s.apply(this, arguments);
        if (u && typeof u.then == "function") {
          for (var p = this, y = arguments.length, v = new Array(y); y--; )
            v[y] = arguments[y];
          return u.then(function() {
            return a.apply(p, v);
          });
        }
        return a.apply(this, arguments);
      };
    }
    qe.ModifyError = Je, qe.DexieError = Ae, qe.BulkError = Ke;
    var Rt = typeof location < "u" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
    function yc(s) {
      Rt = s;
    }
    var Sr = {}, gc = 100, Pt = typeof Promise > "u" ? [] : function() {
      var s = Promise.resolve();
      if (typeof crypto > "u" || !crypto.subtle)
        return [s, h(s), s];
      var a = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
      return [a, h(a), s];
    }(), Er = Pt[0], Et = Pt[1], Pt = Pt[2], Et = Et && Et.then, xn = Er && Er.constructor, io = !!Pt, xr = function(s, a) {
      Cr.push([s, a]), Ei && (queueMicrotask(Vd), Ei = !1);
    }, so = !0, Ei = !0, Cn = [], xi = [], oo = _e, cn = { id: "global", global: !0, ref: 0, unhandleds: [], onunhandled: ce, pgp: !1, env: {}, finalize: ce }, ie = cn, Cr = [], In = 0, Ci = [];
    function J(s) {
      if (typeof this != "object")
        throw new TypeError("Promises must be constructed via new");
      this._listeners = [], this._lib = !1;
      var a = this._PSD = ie;
      if (typeof s != "function") {
        if (s !== Sr)
          throw new TypeError("Not a function");
        return this._state = arguments[1], this._value = arguments[2], void (this._state === !1 && co(this, this._value));
      }
      this._state = null, this._value = null, ++a.ref, function u(p, y) {
        try {
          y(function(v) {
            if (p._state === null) {
              if (v === p)
                throw new TypeError("A promise cannot be resolved with itself.");
              var k = p._lib && Hn();
              v && typeof v.then == "function" ? u(p, function(S, x) {
                v instanceof J ? v._then(S, x) : v.then(S, x);
              }) : (p._state = !0, p._value = v, vc(p)), k && zn();
            }
          }, co.bind(null, p));
        } catch (v) {
          co(p, v);
        }
      }(this, s);
    }
    var ao = { get: function() {
      var s = ie, a = Di;
      function u(p, y) {
        var v = this, k = !s.global && (s !== ie || a !== Di), S = k && !un(), x = new J(function(O, D) {
          lo(v, new mc(wc(p, s, k, S), wc(y, s, k, S), O, D, s));
        });
        return this._consoleTask && (x._consoleTask = this._consoleTask), x;
      }
      return u.prototype = Sr, u;
    }, set: function(s) {
      w(this, "then", s && s.prototype === Sr ? ao : { get: function() {
        return s;
      }, set: ao.set });
    } };
    function mc(s, a, u, p, y) {
      this.onFulfilled = typeof s == "function" ? s : null, this.onRejected = typeof a == "function" ? a : null, this.resolve = u, this.reject = p, this.psd = y;
    }
    function co(s, a) {
      var u, p;
      xi.push(a), s._state === null && (u = s._lib && Hn(), a = oo(a), s._state = !1, s._value = a, p = s, Cn.some(function(y) {
        return y._value === p._value;
      }) || Cn.push(p), vc(s), u && zn());
    }
    function vc(s) {
      var a = s._listeners;
      s._listeners = [];
      for (var u = 0, p = a.length; u < p; ++u)
        lo(s, a[u]);
      var y = s._PSD;
      --y.ref || y.finalize(), In === 0 && (++In, xr(function() {
        --In == 0 && uo();
      }, []));
    }
    function lo(s, a) {
      if (s._state !== null) {
        var u = s._state ? a.onFulfilled : a.onRejected;
        if (u === null)
          return (s._state ? a.resolve : a.reject)(s._value);
        ++a.psd.ref, ++In, xr(qd, [u, s, a]);
      } else
        s._listeners.push(a);
    }
    function qd(s, a, u) {
      try {
        var p, y = a._value;
        !a._state && xi.length && (xi = []), p = Rt && a._consoleTask ? a._consoleTask.run(function() {
          return s(y);
        }) : s(y), a._state || xi.indexOf(y) !== -1 || function(v) {
          for (var k = Cn.length; k; )
            if (Cn[--k]._value === v._value)
              return Cn.splice(k, 1);
        }(a), u.resolve(p);
      } catch (v) {
        u.reject(v);
      } finally {
        --In == 0 && uo(), --u.psd.ref || u.psd.finalize();
      }
    }
    function Vd() {
      On(cn, function() {
        Hn() && zn();
      });
    }
    function Hn() {
      var s = so;
      return Ei = so = !1, s;
    }
    function zn() {
      var s, a, u;
      do
        for (; 0 < Cr.length; )
          for (s = Cr, Cr = [], u = s.length, a = 0; a < u; ++a) {
            var p = s[a];
            p[0].apply(null, p[1]);
          }
      while (0 < Cr.length);
      Ei = so = !0;
    }
    function uo() {
      var s = Cn;
      Cn = [], s.forEach(function(p) {
        p._PSD.onunhandled.call(null, p._value, p);
      });
      for (var a = Ci.slice(0), u = a.length; u; )
        a[--u]();
    }
    function Ii(s) {
      return new J(Sr, !1, s);
    }
    function Me(s, a) {
      var u = ie;
      return function() {
        var p = Hn(), y = ie;
        try {
          return fn(u, !0), s.apply(this, arguments);
        } catch (v) {
          a && a(v);
        } finally {
          fn(y, !1), p && zn();
        }
      };
    }
    m(J.prototype, { then: ao, _then: function(s, a) {
      lo(this, new mc(null, null, s, a, ie));
    }, catch: function(s) {
      if (arguments.length === 1)
        return this.then(null, s);
      var a = s, u = arguments[1];
      return typeof a == "function" ? this.then(null, function(p) {
        return (p instanceof a ? u : Ii)(p);
      }) : this.then(null, function(p) {
        return (p && p.name === a ? u : Ii)(p);
      });
    }, finally: function(s) {
      return this.then(function(a) {
        return J.resolve(s()).then(function() {
          return a;
        });
      }, function(a) {
        return J.resolve(s()).then(function() {
          return Ii(a);
        });
      });
    }, timeout: function(s, a) {
      var u = this;
      return s < 1 / 0 ? new J(function(p, y) {
        var v = setTimeout(function() {
          return y(new Z.Timeout(a));
        }, s);
        u.then(p, y).finally(clearTimeout.bind(null, v));
      }) : this;
    } }), typeof Symbol < "u" && Symbol.toStringTag && w(J.prototype, Symbol.toStringTag, "Dexie.Promise"), cn.env = bc(), m(J, { all: function() {
      var s = be.apply(null, arguments).map(Ti);
      return new J(function(a, u) {
        s.length === 0 && a([]);
        var p = s.length;
        s.forEach(function(y, v) {
          return J.resolve(y).then(function(k) {
            s[v] = k, --p || a(s);
          }, u);
        });
      });
    }, resolve: function(s) {
      return s instanceof J ? s : s && typeof s.then == "function" ? new J(function(a, u) {
        s.then(a, u);
      }) : new J(Sr, !0, s);
    }, reject: Ii, race: function() {
      var s = be.apply(null, arguments).map(Ti);
      return new J(function(a, u) {
        s.map(function(p) {
          return J.resolve(p).then(a, u);
        });
      });
    }, PSD: { get: function() {
      return ie;
    }, set: function(s) {
      return ie = s;
    } }, totalEchoes: { get: function() {
      return Di;
    } }, newPSD: ln, usePSD: On, scheduler: { get: function() {
      return xr;
    }, set: function(s) {
      xr = s;
    } }, rejectionMapper: { get: function() {
      return oo;
    }, set: function(s) {
      oo = s;
    } }, follow: function(s, a) {
      return new J(function(u, p) {
        return ln(function(y, v) {
          var k = ie;
          k.unhandleds = [], k.onunhandled = v, k.finalize = Re(function() {
            var S, x = this;
            S = function() {
              x.unhandleds.length === 0 ? y() : v(x.unhandleds[0]);
            }, Ci.push(function O() {
              S(), Ci.splice(Ci.indexOf(O), 1);
            }), ++In, xr(function() {
              --In == 0 && uo();
            }, []);
          }, k.finalize), s();
        }, a, u, p);
      });
    } }), xn && (xn.allSettled && w(J, "allSettled", function() {
      var s = be.apply(null, arguments).map(Ti);
      return new J(function(a) {
        s.length === 0 && a([]);
        var u = s.length, p = new Array(u);
        s.forEach(function(y, v) {
          return J.resolve(y).then(function(k) {
            return p[v] = { status: "fulfilled", value: k };
          }, function(k) {
            return p[v] = { status: "rejected", reason: k };
          }).then(function() {
            return --u || a(p);
          });
        });
      });
    }), xn.any && typeof AggregateError < "u" && w(J, "any", function() {
      var s = be.apply(null, arguments).map(Ti);
      return new J(function(a, u) {
        s.length === 0 && u(new AggregateError([]));
        var p = s.length, y = new Array(p);
        s.forEach(function(v, k) {
          return J.resolve(v).then(function(S) {
            return a(S);
          }, function(S) {
            y[k] = S, --p || u(new AggregateError(y));
          });
        });
      });
    }), xn.withResolvers && (J.withResolvers = xn.withResolvers));
    var Xe = { awaits: 0, echoes: 0, id: 0 }, Wd = 0, Oi = [], Ai = 0, Di = 0, Hd = 0;
    function ln(s, a, u, p) {
      var y = ie, v = Object.create(y);
      return v.parent = y, v.ref = 0, v.global = !1, v.id = ++Hd, cn.env, v.env = io ? { Promise: J, PromiseProp: { value: J, configurable: !0, writable: !0 }, all: J.all, race: J.race, allSettled: J.allSettled, any: J.any, resolve: J.resolve, reject: J.reject } : {}, a && d(v, a), ++y.ref, v.finalize = function() {
        --this.parent.ref || this.parent.finalize();
      }, p = On(v, s, u, p), v.ref === 0 && v.finalize(), p;
    }
    function Yn() {
      return Xe.id || (Xe.id = ++Wd), ++Xe.awaits, Xe.echoes += gc, Xe.id;
    }
    function un() {
      return !!Xe.awaits && (--Xe.awaits == 0 && (Xe.id = 0), Xe.echoes = Xe.awaits * gc, !0);
    }
    function Ti(s) {
      return Xe.echoes && s && s.constructor === xn ? (Yn(), s.then(function(a) {
        return un(), a;
      }, function(a) {
        return un(), $e(a);
      })) : s;
    }
    function zd() {
      var s = Oi[Oi.length - 1];
      Oi.pop(), fn(s, !1);
    }
    function fn(s, a) {
      var u, p = ie;
      (a ? !Xe.echoes || Ai++ && s === ie : !Ai || --Ai && s === ie) || queueMicrotask(a ? (function(y) {
        ++Di, Xe.echoes && --Xe.echoes != 0 || (Xe.echoes = Xe.awaits = Xe.id = 0), Oi.push(ie), fn(y, !0);
      }).bind(null, s) : zd), s !== ie && (ie = s, p === cn && (cn.env = bc()), io && (u = cn.env.Promise, a = s.env, (p.global || s.global) && (Object.defineProperty(o, "Promise", a.PromiseProp), u.all = a.all, u.race = a.race, u.resolve = a.resolve, u.reject = a.reject, a.allSettled && (u.allSettled = a.allSettled), a.any && (u.any = a.any))));
    }
    function bc() {
      var s = o.Promise;
      return io ? { Promise: s, PromiseProp: Object.getOwnPropertyDescriptor(o, "Promise"), all: s.all, race: s.race, allSettled: s.allSettled, any: s.any, resolve: s.resolve, reject: s.reject } : {};
    }
    function On(s, a, u, p, y) {
      var v = ie;
      try {
        return fn(s, !0), a(u, p, y);
      } finally {
        fn(v, !1);
      }
    }
    function wc(s, a, u, p) {
      return typeof s != "function" ? s : function() {
        var y = ie;
        u && Yn(), fn(a, !0);
        try {
          return s.apply(this, arguments);
        } finally {
          fn(y, !1), p && queueMicrotask(un);
        }
      };
    }
    function fo(s) {
      Promise === xn && Xe.echoes === 0 ? Ai === 0 ? s() : enqueueNativeMicroTask(s) : setTimeout(s, 0);
    }
    ("" + Et).indexOf("[native code]") === -1 && (Yn = un = ce);
    var $e = J.reject, Pt = "4.2.0-alpha.1", An = String.fromCharCode(65535), Ht = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.", _c = "String expected.", Gn = [], Ri = "__dbnames", ho = "readonly", po = "readwrite";
    function Dn(s, a) {
      return s ? a ? function() {
        return s.apply(this, arguments) && a.apply(this, arguments);
      } : s : a;
    }
    var kc = { type: 3, lower: -1 / 0, lowerOpen: !1, upper: [[]], upperOpen: !1 };
    function Pi(s) {
      return typeof s != "string" || /\./.test(s) ? function(a) {
        return a;
      } : function(a) {
        return a[s] === void 0 && s in a && delete (a = me(a))[s], a;
      };
    }
    function Sc() {
      throw Z.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
    }
    function Se(s, a) {
      try {
        var u = Ec(s), p = Ec(a);
        if (u !== p)
          return u === "Array" ? 1 : p === "Array" ? -1 : u === "binary" ? 1 : p === "binary" ? -1 : u === "string" ? 1 : p === "string" ? -1 : u === "Date" ? 1 : p !== "Date" ? NaN : -1;
        switch (u) {
          case "number":
          case "Date":
          case "string":
            return a < s ? 1 : s < a ? -1 : 0;
          case "binary":
            return function(y, v) {
              for (var k = y.length, S = v.length, x = k < S ? k : S, O = 0; O < x; ++O)
                if (y[O] !== v[O])
                  return y[O] < v[O] ? -1 : 1;
              return k === S ? 0 : k < S ? -1 : 1;
            }(xc(s), xc(a));
          case "Array":
            return function(y, v) {
              for (var k = y.length, S = v.length, x = k < S ? k : S, O = 0; O < x; ++O) {
                var D = Se(y[O], v[O]);
                if (D !== 0)
                  return D;
              }
              return k === S ? 0 : k < S ? -1 : 1;
            }(s, a);
        }
      } catch {
      }
      return NaN;
    }
    function Ec(s) {
      var a = typeof s;
      return a != "object" ? a : ArrayBuffer.isView(s) ? "binary" : (s = ke(s), s === "ArrayBuffer" ? "binary" : s);
    }
    function xc(s) {
      return s instanceof Uint8Array ? s : ArrayBuffer.isView(s) ? new Uint8Array(s.buffer, s.byteOffset, s.byteLength) : new Uint8Array(s);
    }
    function Ui(s, a, u) {
      var p = s.schema.yProps;
      return p ? (a && 0 < u.numFailures && (a = a.filter(function(y, v) {
        return !u.failures[v];
      })), Promise.all(p.map(function(y) {
        return y = y.updatesTable, a ? s.db.table(y).where("k").anyOf(a).delete() : s.db.table(y).clear();
      })).then(function() {
        return u;
      })) : u;
    }
    var Cc = (Ne.prototype._trans = function(s, a, u) {
      var p = this._tx || ie.trans, y = this.name, v = Rt && typeof console < "u" && console.createTask && console.createTask("Dexie: ".concat(s === "readonly" ? "read" : "write", " ").concat(this.name));
      function k(O, D, E) {
        if (!E.schema[y])
          throw new Z.NotFound("Table " + y + " not part of transaction");
        return a(E.idbtrans, E);
      }
      var S = Hn();
      try {
        var x = p && p.db._novip === this.db._novip ? p === ie.trans ? p._promise(s, k, u) : ln(function() {
          return p._promise(s, k, u);
        }, { trans: p, transless: ie.transless || ie }) : function O(D, E, P, C) {
          if (D.idbdb && (D._state.openComplete || ie.letThrough || D._vip)) {
            var A = D._createTransaction(E, P, D._dbSchema);
            try {
              A.create(), D._state.PR1398_maxLoop = 3;
            } catch (R) {
              return R.name === st.InvalidState && D.isOpen() && 0 < --D._state.PR1398_maxLoop ? (console.warn("Dexie: Need to reopen db"), D.close({ disableAutoOpen: !1 }), D.open().then(function() {
                return O(D, E, P, C);
              })) : $e(R);
            }
            return A._promise(E, function(R, T) {
              return ln(function() {
                return ie.trans = A, C(R, T, A);
              });
            }).then(function(R) {
              if (E === "readwrite")
                try {
                  A.idbtrans.commit();
                } catch {
                }
              return E === "readonly" ? R : A._completion.then(function() {
                return R;
              });
            });
          }
          if (D._state.openComplete)
            return $e(new Z.DatabaseClosed(D._state.dbOpenError));
          if (!D._state.isBeingOpened) {
            if (!D._state.autoOpen)
              return $e(new Z.DatabaseClosed());
            D.open().catch(ce);
          }
          return D._state.dbReadyPromise.then(function() {
            return O(D, E, P, C);
          });
        }(this.db, s, [this.name], k);
        return v && (x._consoleTask = v, x = x.catch(function(O) {
          return console.trace(O), $e(O);
        })), x;
      } finally {
        S && zn();
      }
    }, Ne.prototype.get = function(s, a) {
      var u = this;
      return s && s.constructor === Object ? this.where(s).first(a) : s == null ? $e(new Z.Type("Invalid argument to Table.get()")) : this._trans("readonly", function(p) {
        return u.core.get({ trans: p, key: s }).then(function(y) {
          return u.hook.reading.fire(y);
        });
      }).then(a);
    }, Ne.prototype.where = function(s) {
      if (typeof s == "string")
        return new this.db.WhereClause(this, s);
      if (l(s))
        return new this.db.WhereClause(this, "[".concat(s.join("+"), "]"));
      var a = c(s);
      if (a.length === 1)
        return this.where(a[0]).equals(s[a[0]]);
      var u = this.schema.indexes.concat(this.schema.primKey).filter(function(S) {
        if (S.compound && a.every(function(O) {
          return 0 <= S.keyPath.indexOf(O);
        })) {
          for (var x = 0; x < a.length; ++x)
            if (a.indexOf(S.keyPath[x]) === -1)
              return !1;
          return !0;
        }
        return !1;
      }).sort(function(S, x) {
        return S.keyPath.length - x.keyPath.length;
      })[0];
      if (u && this.db._maxKey !== An) {
        var v = u.keyPath.slice(0, a.length);
        return this.where(v).equals(v.map(function(x) {
          return s[x];
        }));
      }
      !u && Rt && console.warn("The query ".concat(JSON.stringify(s), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(a.join("+"), "]"));
      var p = this.schema.idxByName;
      function y(S, x) {
        return Se(S, x) === 0;
      }
      var k = a.reduce(function(E, x) {
        var O = E[0], D = E[1], E = p[x], P = s[x];
        return [O || E, O || !E ? Dn(D, E && E.multi ? function(C) {
          return C = te(C, x), l(C) && C.some(function(A) {
            return y(P, A);
          });
        } : function(C) {
          return y(P, te(C, x));
        }) : D];
      }, [null, null]), v = k[0], k = k[1];
      return v ? this.where(v.name).equals(s[v.keyPath]).filter(k) : u ? this.filter(k) : this.where(a).equals("");
    }, Ne.prototype.filter = function(s) {
      return this.toCollection().and(s);
    }, Ne.prototype.count = function(s) {
      return this.toCollection().count(s);
    }, Ne.prototype.offset = function(s) {
      return this.toCollection().offset(s);
    }, Ne.prototype.limit = function(s) {
      return this.toCollection().limit(s);
    }, Ne.prototype.each = function(s) {
      return this.toCollection().each(s);
    }, Ne.prototype.toArray = function(s) {
      return this.toCollection().toArray(s);
    }, Ne.prototype.toCollection = function() {
      return new this.db.Collection(new this.db.WhereClause(this));
    }, Ne.prototype.orderBy = function(s) {
      return new this.db.Collection(new this.db.WhereClause(this, l(s) ? "[".concat(s.join("+"), "]") : s));
    }, Ne.prototype.reverse = function() {
      return this.toCollection().reverse();
    }, Ne.prototype.mapToClass = function(s) {
      var a, u = this.db, p = this.name;
      function y() {
        return a !== null && a.apply(this, arguments) || this;
      }
      (this.schema.mappedClass = s).prototype instanceof Sc && (function(x, O) {
        if (typeof O != "function" && O !== null)
          throw new TypeError("Class extends value " + String(O) + " is not a constructor or null");
        function D() {
          this.constructor = x;
        }
        n(x, O), x.prototype = O === null ? Object.create(O) : (D.prototype = O.prototype, new D());
      }(y, a = s), Object.defineProperty(y.prototype, "db", { get: function() {
        return u;
      }, enumerable: !1, configurable: !0 }), y.prototype.table = function() {
        return p;
      }, s = y);
      for (var v = /* @__PURE__ */ new Set(), k = s.prototype; k; k = h(k))
        Object.getOwnPropertyNames(k).forEach(function(x) {
          return v.add(x);
        });
      function S(x) {
        if (!x)
          return x;
        var O, D = Object.create(s.prototype);
        for (O in x)
          if (!v.has(O))
            try {
              D[O] = x[O];
            } catch {
            }
        return D;
      }
      return this.schema.readHook && this.hook.reading.unsubscribe(this.schema.readHook), this.schema.readHook = S, this.hook("reading", S), s;
    }, Ne.prototype.defineClass = function() {
      return this.mapToClass(function(s) {
        d(this, s);
      });
    }, Ne.prototype.add = function(s, a) {
      var u = this, p = this.schema.primKey, y = p.auto, v = p.keyPath, k = s;
      return v && y && (k = Pi(v)(s)), this._trans("readwrite", function(S) {
        return u.core.mutate({ trans: S, type: "add", keys: a != null ? [a] : null, values: [k] });
      }).then(function(S) {
        return S.numFailures ? J.reject(S.failures[0]) : S.lastResult;
      }).then(function(S) {
        if (v)
          try {
            oe(s, v, S);
          } catch {
          }
        return S;
      });
    }, Ne.prototype.update = function(s, a) {
      return typeof s != "object" || l(s) ? this.where(":id").equals(s).modify(a) : (s = te(s, this.schema.primKey.keyPath), s === void 0 ? $e(new Z.InvalidArgument("Given object does not contain its primary key")) : this.where(":id").equals(s).modify(a));
    }, Ne.prototype.put = function(s, a) {
      var u = this, p = this.schema.primKey, y = p.auto, v = p.keyPath, k = s;
      return v && y && (k = Pi(v)(s)), this._trans("readwrite", function(S) {
        return u.core.mutate({ trans: S, type: "put", values: [k], keys: a != null ? [a] : null });
      }).then(function(S) {
        return S.numFailures ? J.reject(S.failures[0]) : S.lastResult;
      }).then(function(S) {
        if (v)
          try {
            oe(s, v, S);
          } catch {
          }
        return S;
      });
    }, Ne.prototype.delete = function(s) {
      var a = this;
      return this._trans("readwrite", function(u) {
        return a.core.mutate({ trans: u, type: "delete", keys: [s] }).then(function(p) {
          return Ui(a, [s], p);
        }).then(function(p) {
          return p.numFailures ? J.reject(p.failures[0]) : void 0;
        });
      });
    }, Ne.prototype.clear = function() {
      var s = this;
      return this._trans("readwrite", function(a) {
        return s.core.mutate({ trans: a, type: "deleteRange", range: kc }).then(function(u) {
          return Ui(s, null, u);
        });
      }).then(function(a) {
        return a.numFailures ? J.reject(a.failures[0]) : void 0;
      });
    }, Ne.prototype.bulkGet = function(s) {
      var a = this;
      return this._trans("readonly", function(u) {
        return a.core.getMany({ keys: s, trans: u }).then(function(p) {
          return p.map(function(y) {
            return a.hook.reading.fire(y);
          });
        });
      });
    }, Ne.prototype.bulkAdd = function(s, a, u) {
      var p = this, y = Array.isArray(a) ? a : void 0, v = (u = u || (y ? void 0 : a)) ? u.allKeys : void 0;
      return this._trans("readwrite", function(k) {
        var O = p.schema.primKey, S = O.auto, O = O.keyPath;
        if (O && y)
          throw new Z.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
        if (y && y.length !== s.length)
          throw new Z.InvalidArgument("Arguments objects and keys must have the same length");
        var x = s.length, O = O && S ? s.map(Pi(O)) : s;
        return p.core.mutate({ trans: k, type: "add", keys: y, values: O, wantResults: v }).then(function(A) {
          var E = A.numFailures, P = A.results, C = A.lastResult, A = A.failures;
          if (E === 0)
            return v ? P : C;
          throw new Ke("".concat(p.name, ".bulkAdd(): ").concat(E, " of ").concat(x, " operations failed"), A);
        });
      });
    }, Ne.prototype.bulkPut = function(s, a, u) {
      var p = this, y = Array.isArray(a) ? a : void 0, v = (u = u || (y ? void 0 : a)) ? u.allKeys : void 0;
      return this._trans("readwrite", function(k) {
        var O = p.schema.primKey, S = O.auto, O = O.keyPath;
        if (O && y)
          throw new Z.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
        if (y && y.length !== s.length)
          throw new Z.InvalidArgument("Arguments objects and keys must have the same length");
        var x = s.length, O = O && S ? s.map(Pi(O)) : s;
        return p.core.mutate({ trans: k, type: "put", keys: y, values: O, wantResults: v }).then(function(A) {
          var E = A.numFailures, P = A.results, C = A.lastResult, A = A.failures;
          if (E === 0)
            return v ? P : C;
          throw new Ke("".concat(p.name, ".bulkPut(): ").concat(E, " of ").concat(x, " operations failed"), A);
        });
      });
    }, Ne.prototype.bulkUpdate = function(s) {
      var a = this, u = this.core, p = s.map(function(k) {
        return k.key;
      }), y = s.map(function(k) {
        return k.changes;
      }), v = [];
      return this._trans("readwrite", function(k) {
        return u.getMany({ trans: k, keys: p, cache: "clone" }).then(function(S) {
          var x = [], O = [];
          s.forEach(function(E, P) {
            var C = E.key, A = E.changes, R = S[P];
            if (R) {
              for (var T = 0, U = Object.keys(A); T < U.length; T++) {
                var N = U[T], M = A[N];
                if (N === a.schema.primKey.keyPath) {
                  if (Se(M, C) !== 0)
                    throw new Z.Constraint("Cannot update primary key in bulkUpdate()");
                } else
                  oe(R, N, M);
              }
              v.push(P), x.push(C), O.push(R);
            }
          });
          var D = x.length;
          return u.mutate({ trans: k, type: "put", keys: x, values: O, updates: { keys: p, changeSpecs: y } }).then(function(E) {
            var P = E.numFailures, C = E.failures;
            if (P === 0)
              return D;
            for (var A = 0, R = Object.keys(C); A < R.length; A++) {
              var T, U = R[A], N = v[Number(U)];
              N != null && (T = C[U], delete C[U], C[N] = T);
            }
            throw new Ke("".concat(a.name, ".bulkUpdate(): ").concat(P, " of ").concat(D, " operations failed"), C);
          });
        });
      });
    }, Ne.prototype.bulkDelete = function(s) {
      var a = this, u = s.length;
      return this._trans("readwrite", function(p) {
        return a.core.mutate({ trans: p, type: "delete", keys: s }).then(function(y) {
          return Ui(a, s, y);
        });
      }).then(function(k) {
        var y = k.numFailures, v = k.lastResult, k = k.failures;
        if (y === 0)
          return v;
        throw new Ke("".concat(a.name, ".bulkDelete(): ").concat(y, " of ").concat(u, " operations failed"), k);
      });
    }, Ne);
    function Ne() {
    }
    function Ir(s) {
      function a(k, S) {
        if (S) {
          for (var x = arguments.length, O = new Array(x - 1); --x; )
            O[x - 1] = arguments[x];
          return u[k].subscribe.apply(null, O), s;
        }
        if (typeof k == "string")
          return u[k];
      }
      var u = {};
      a.addEventType = v;
      for (var p = 1, y = arguments.length; p < y; ++p)
        v(arguments[p]);
      return a;
      function v(k, S, x) {
        if (typeof k != "object") {
          var O;
          S = S || Fd;
          var D = { subscribers: [], fire: x = x || ce, subscribe: function(E) {
            D.subscribers.indexOf(E) === -1 && (D.subscribers.push(E), D.fire = S(D.fire, E));
          }, unsubscribe: function(E) {
            D.subscribers = D.subscribers.filter(function(P) {
              return P !== E;
            }), D.fire = D.subscribers.reduce(S, x);
          } };
          return u[k] = a[k] = D;
        }
        c(O = k).forEach(function(E) {
          var P = O[E];
          if (l(P))
            v(E, O[E][0], O[E][1]);
          else {
            if (P !== "asap")
              throw new Z.InvalidArgument("Invalid event config");
            var C = v(E, _e, function() {
              for (var A = arguments.length, R = new Array(A); A--; )
                R[A] = arguments[A];
              C.subscribers.forEach(function(T) {
                se(function() {
                  T.apply(null, R);
                });
              });
            });
          }
        });
      }
    }
    function Or(s, a) {
      return I(a).from({ prototype: s }), a;
    }
    function Jn(s, a) {
      return !(s.filter || s.algorithm || s.or) && (a ? s.justLimit : !s.replayFilter);
    }
    function yo(s, a) {
      s.filter = Dn(s.filter, a);
    }
    function go(s, a, u) {
      var p = s.replayFilter;
      s.replayFilter = p ? function() {
        return Dn(p(), a());
      } : a, s.justLimit = u && !p;
    }
    function ji(s, a) {
      if (s.isPrimKey)
        return a.primaryKey;
      var u = a.getIndexByKeyPath(s.index);
      if (!u)
        throw new Z.Schema("KeyPath " + s.index + " on object store " + a.name + " is not indexed");
      return u;
    }
    function Ic(s, a, u) {
      var p = ji(s, a.schema);
      return a.openCursor({ trans: u, values: !s.keysOnly, reverse: s.dir === "prev", unique: !!s.unique, query: { index: p, range: s.range } });
    }
    function Li(s, a, u, p) {
      var y = s.replayFilter ? Dn(s.filter, s.replayFilter()) : s.filter;
      if (s.or) {
        var v = {}, k = function(S, x, O) {
          var D, E;
          y && !y(x, O, function(P) {
            return x.stop(P);
          }, function(P) {
            return x.fail(P);
          }) || ((E = "" + (D = x.primaryKey)) == "[object ArrayBuffer]" && (E = "" + new Uint8Array(D)), g(v, E) || (v[E] = !0, a(S, x, O)));
        };
        return Promise.all([s.or._iterate(k, u), Oc(Ic(s, p, u), s.algorithm, k, !s.keysOnly && s.valueMapper)]);
      }
      return Oc(Ic(s, p, u), Dn(s.algorithm, y), a, !s.keysOnly && s.valueMapper);
    }
    function Oc(s, a, u, p) {
      var y = Me(p ? function(v, k, S) {
        return u(p(v), k, S);
      } : u);
      return s.then(function(v) {
        if (v)
          return v.start(function() {
            var k = function() {
              return v.continue();
            };
            a && !a(v, function(S) {
              return k = S;
            }, function(S) {
              v.stop(S), k = ce;
            }, function(S) {
              v.fail(S), k = ce;
            }) || y(v.value, v, function(S) {
              return k = S;
            }), k();
          });
      });
    }
    var Ar = (Ac.prototype.execute = function(s) {
      var a = this["@@propmod"];
      if (a.add !== void 0) {
        var u = a.add;
        if (l(u))
          return i(i([], l(s) ? s : [], !0), u, !0).sort();
        if (typeof u == "number")
          return (Number(s) || 0) + u;
        if (typeof u == "bigint")
          try {
            return BigInt(s) + u;
          } catch {
            return BigInt(0) + u;
          }
        throw new TypeError("Invalid term ".concat(u));
      }
      if (a.remove !== void 0) {
        var p = a.remove;
        if (l(p))
          return l(s) ? s.filter(function(y) {
            return !p.includes(y);
          }).sort() : [];
        if (typeof p == "number")
          return Number(s) - p;
        if (typeof p == "bigint")
          try {
            return BigInt(s) - p;
          } catch {
            return BigInt(0) - p;
          }
        throw new TypeError("Invalid subtrahend ".concat(p));
      }
      return u = (u = a.replacePrefix) === null || u === void 0 ? void 0 : u[0], u && typeof s == "string" && s.startsWith(u) ? a.replacePrefix[1] + s.substring(u.length) : s;
    }, Ac);
    function Ac(s) {
      this["@@propmod"] = s;
    }
    var Yd = (Oe.prototype._read = function(s, a) {
      var u = this._ctx;
      return u.error ? u.table._trans(null, $e.bind(null, u.error)) : u.table._trans("readonly", s).then(a);
    }, Oe.prototype._write = function(s) {
      var a = this._ctx;
      return a.error ? a.table._trans(null, $e.bind(null, a.error)) : a.table._trans("readwrite", s, "locked");
    }, Oe.prototype._addAlgorithm = function(s) {
      var a = this._ctx;
      a.algorithm = Dn(a.algorithm, s);
    }, Oe.prototype._iterate = function(s, a) {
      return Li(this._ctx, s, a, this._ctx.table.core);
    }, Oe.prototype.clone = function(s) {
      var a = Object.create(this.constructor.prototype), u = Object.create(this._ctx);
      return s && d(u, s), a._ctx = u, a;
    }, Oe.prototype.raw = function() {
      return this._ctx.valueMapper = null, this;
    }, Oe.prototype.each = function(s) {
      var a = this._ctx;
      return this._read(function(u) {
        return Li(a, s, u, a.table.core);
      });
    }, Oe.prototype.count = function(s) {
      var a = this;
      return this._read(function(u) {
        var p = a._ctx, y = p.table.core;
        if (Jn(p, !0))
          return y.count({ trans: u, query: { index: ji(p, y.schema), range: p.range } }).then(function(k) {
            return Math.min(k, p.limit);
          });
        var v = 0;
        return Li(p, function() {
          return ++v, !1;
        }, u, y).then(function() {
          return v;
        });
      }).then(s);
    }, Oe.prototype.sortBy = function(s, a) {
      var u = s.split(".").reverse(), p = u[0], y = u.length - 1;
      function v(x, O) {
        return O ? v(x[u[O]], O - 1) : x[p];
      }
      var k = this._ctx.dir === "next" ? 1 : -1;
      function S(x, O) {
        return Se(v(x, y), v(O, y)) * k;
      }
      return this.toArray(function(x) {
        return x.sort(S);
      }).then(a);
    }, Oe.prototype.toArray = function(s) {
      var a = this;
      return this._read(function(u) {
        var p = a._ctx;
        if (p.dir === "next" && Jn(p, !0) && 0 < p.limit) {
          var y = p.valueMapper, v = ji(p, p.table.core.schema);
          return p.table.core.query({ trans: u, limit: p.limit, values: !0, query: { index: v, range: p.range } }).then(function(S) {
            return S = S.result, y ? S.map(y) : S;
          });
        }
        var k = [];
        return Li(p, function(S) {
          return k.push(S);
        }, u, p.table.core).then(function() {
          return k;
        });
      }, s);
    }, Oe.prototype.offset = function(s) {
      var a = this._ctx;
      return s <= 0 || (a.offset += s, Jn(a) ? go(a, function() {
        var u = s;
        return function(p, y) {
          return u === 0 || (u === 1 ? --u : y(function() {
            p.advance(u), u = 0;
          }), !1);
        };
      }) : go(a, function() {
        var u = s;
        return function() {
          return --u < 0;
        };
      })), this;
    }, Oe.prototype.limit = function(s) {
      return this._ctx.limit = Math.min(this._ctx.limit, s), go(this._ctx, function() {
        var a = s;
        return function(u, p, y) {
          return --a <= 0 && p(y), 0 <= a;
        };
      }, !0), this;
    }, Oe.prototype.until = function(s, a) {
      return yo(this._ctx, function(u, p, y) {
        return !s(u.value) || (p(y), a);
      }), this;
    }, Oe.prototype.first = function(s) {
      return this.limit(1).toArray(function(a) {
        return a[0];
      }).then(s);
    }, Oe.prototype.last = function(s) {
      return this.reverse().first(s);
    }, Oe.prototype.filter = function(s) {
      var a;
      return yo(this._ctx, function(u) {
        return s(u.value);
      }), (a = this._ctx).isMatch = Dn(a.isMatch, s), this;
    }, Oe.prototype.and = function(s) {
      return this.filter(s);
    }, Oe.prototype.or = function(s) {
      return new this.db.WhereClause(this._ctx.table, s, this);
    }, Oe.prototype.reverse = function() {
      return this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev", this._ondirectionchange && this._ondirectionchange(this._ctx.dir), this;
    }, Oe.prototype.desc = function() {
      return this.reverse();
    }, Oe.prototype.eachKey = function(s) {
      var a = this._ctx;
      return a.keysOnly = !a.isMatch, this.each(function(u, p) {
        s(p.key, p);
      });
    }, Oe.prototype.eachUniqueKey = function(s) {
      return this._ctx.unique = "unique", this.eachKey(s);
    }, Oe.prototype.eachPrimaryKey = function(s) {
      var a = this._ctx;
      return a.keysOnly = !a.isMatch, this.each(function(u, p) {
        s(p.primaryKey, p);
      });
    }, Oe.prototype.keys = function(s) {
      var a = this._ctx;
      a.keysOnly = !a.isMatch;
      var u = [];
      return this.each(function(p, y) {
        u.push(y.key);
      }).then(function() {
        return u;
      }).then(s);
    }, Oe.prototype.primaryKeys = function(s) {
      var a = this._ctx;
      if (a.dir === "next" && Jn(a, !0) && 0 < a.limit)
        return this._read(function(p) {
          var y = ji(a, a.table.core.schema);
          return a.table.core.query({ trans: p, values: !1, limit: a.limit, query: { index: y, range: a.range } });
        }).then(function(p) {
          return p.result;
        }).then(s);
      a.keysOnly = !a.isMatch;
      var u = [];
      return this.each(function(p, y) {
        u.push(y.primaryKey);
      }).then(function() {
        return u;
      }).then(s);
    }, Oe.prototype.uniqueKeys = function(s) {
      return this._ctx.unique = "unique", this.keys(s);
    }, Oe.prototype.firstKey = function(s) {
      return this.limit(1).keys(function(a) {
        return a[0];
      }).then(s);
    }, Oe.prototype.lastKey = function(s) {
      return this.reverse().firstKey(s);
    }, Oe.prototype.distinct = function() {
      var s = this._ctx, s = s.index && s.table.schema.idxByName[s.index];
      if (!s || !s.multi)
        return this;
      var a = {};
      return yo(this._ctx, function(y) {
        var p = y.primaryKey.toString(), y = g(a, p);
        return a[p] = !0, !y;
      }), this;
    }, Oe.prototype.modify = function(s) {
      var a = this, u = this._ctx;
      return this._write(function(p) {
        var y, v, k;
        k = typeof s == "function" ? s : (y = c(s), v = y.length, function(U) {
          for (var N = !1, M = 0; M < v; ++M) {
            var K = y[M], F = s[K], W = te(U, K);
            F instanceof Ar ? (oe(U, K, F.execute(W)), N = !0) : W !== F && (oe(U, K, F), N = !0);
          }
          return N;
        });
        var S = u.table.core, E = S.schema.primaryKey, x = E.outbound, O = E.extractKey, D = 200, E = a.db._options.modifyChunkSize;
        E && (D = typeof E == "object" ? E[S.name] || E["*"] || 200 : E);
        function P(U, K) {
          var M = K.failures, K = K.numFailures;
          A += U - K;
          for (var F = 0, W = c(M); F < W.length; F++) {
            var q = W[F];
            C.push(M[q]);
          }
        }
        var C = [], A = 0, R = [], T = s === Dc;
        return a.clone().primaryKeys().then(function(U) {
          function N(K) {
            var F = Math.min(D, U.length - K), W = U.slice(K, K + F);
            return (T ? Promise.resolve([]) : S.getMany({ trans: p, keys: W, cache: "immutable" })).then(function(q) {
              var V = [], G = [], Y = x ? [] : null, X = T ? W : [];
              if (!T)
                for (var he = 0; he < F; ++he) {
                  var Ee = q[he], fe = { value: me(Ee), primKey: U[K + he] };
                  k.call(fe, fe.value, fe) !== !1 && (fe.value == null ? X.push(U[K + he]) : x || Se(O(Ee), O(fe.value)) === 0 ? (G.push(fe.value), x && Y.push(U[K + he])) : (X.push(U[K + he]), V.push(fe.value)));
                }
              return Promise.resolve(0 < V.length && S.mutate({ trans: p, type: "add", values: V }).then(function(Be) {
                for (var le in Be.failures)
                  X.splice(parseInt(le), 1);
                P(V.length, Be);
              })).then(function() {
                return (0 < G.length || M && typeof s == "object") && S.mutate({ trans: p, type: "put", keys: Y, values: G, criteria: M, changeSpec: typeof s != "function" && s, isAdditionalChunk: 0 < K }).then(function(Be) {
                  return P(G.length, Be);
                });
              }).then(function() {
                return (0 < X.length || M && T) && S.mutate({ trans: p, type: "delete", keys: X, criteria: M, isAdditionalChunk: 0 < K }).then(function(Be) {
                  return Ui(u.table, X, Be);
                }).then(function(Be) {
                  return P(X.length, Be);
                });
              }).then(function() {
                return U.length > K + F && N(K + D);
              });
            });
          }
          var M = Jn(u) && u.limit === 1 / 0 && (typeof s != "function" || T) && { index: u.index, range: u.range };
          return N(0).then(function() {
            if (0 < C.length)
              throw new Je("Error modifying one or more objects", C, A, R);
            return U.length;
          });
        });
      });
    }, Oe.prototype.delete = function() {
      var s = this._ctx, a = s.range;
      return !Jn(s) || s.table.schema.yProps || !s.isPrimKey && a.type !== 3 ? this.modify(Dc) : this._write(function(u) {
        var p = s.table.core.schema.primaryKey, y = a;
        return s.table.core.count({ trans: u, query: { index: p, range: y } }).then(function(v) {
          return s.table.core.mutate({ trans: u, type: "deleteRange", range: y }).then(function(x) {
            var S = x.failures, x = x.numFailures;
            if (x)
              throw new Je("Could not delete some values", Object.keys(S).map(function(O) {
                return S[O];
              }), v - x);
            return v - x;
          });
        });
      });
    }, Oe);
    function Oe() {
    }
    var Dc = function(s, a) {
      return a.value = null;
    };
    function Gd(s, a) {
      return s < a ? -1 : s === a ? 0 : 1;
    }
    function Jd(s, a) {
      return a < s ? -1 : s === a ? 0 : 1;
    }
    function bt(s, a, u) {
      return s = s instanceof Rc ? new s.Collection(s) : s, s._ctx.error = new (u || TypeError)(a), s;
    }
    function Xn(s) {
      return new s.Collection(s, function() {
        return Tc("");
      }).limit(0);
    }
    function Ni(s, a, u, p) {
      var y, v, k, S, x, O, D, E = u.length;
      if (!u.every(function(A) {
        return typeof A == "string";
      }))
        return bt(s, _c);
      function P(A) {
        y = A === "next" ? function(T) {
          return T.toUpperCase();
        } : function(T) {
          return T.toLowerCase();
        }, v = A === "next" ? function(T) {
          return T.toLowerCase();
        } : function(T) {
          return T.toUpperCase();
        }, k = A === "next" ? Gd : Jd;
        var R = u.map(function(T) {
          return { lower: v(T), upper: y(T) };
        }).sort(function(T, U) {
          return k(T.lower, U.lower);
        });
        S = R.map(function(T) {
          return T.upper;
        }), x = R.map(function(T) {
          return T.lower;
        }), D = (O = A) === "next" ? "" : p;
      }
      P("next"), s = new s.Collection(s, function() {
        return dn(S[0], x[E - 1] + p);
      }), s._ondirectionchange = function(A) {
        P(A);
      };
      var C = 0;
      return s._addAlgorithm(function(A, R, T) {
        var U = A.key;
        if (typeof U != "string")
          return !1;
        var N = v(U);
        if (a(N, x, C))
          return !0;
        for (var M = null, K = C; K < E; ++K) {
          var F = function(W, q, V, G, Y, X) {
            for (var he = Math.min(W.length, G.length), Ee = -1, fe = 0; fe < he; ++fe) {
              var Be = q[fe];
              if (Be !== G[fe])
                return Y(W[fe], V[fe]) < 0 ? W.substr(0, fe) + V[fe] + V.substr(fe + 1) : Y(W[fe], G[fe]) < 0 ? W.substr(0, fe) + G[fe] + V.substr(fe + 1) : 0 <= Ee ? W.substr(0, Ee) + q[Ee] + V.substr(Ee + 1) : null;
              Y(W[fe], Be) < 0 && (Ee = fe);
            }
            return he < G.length && X === "next" ? W + V.substr(W.length) : he < W.length && X === "prev" ? W.substr(0, V.length) : Ee < 0 ? null : W.substr(0, Ee) + G[Ee] + V.substr(Ee + 1);
          }(U, N, S[K], x[K], k, O);
          F === null && M === null ? C = K + 1 : (M === null || 0 < k(M, F)) && (M = F);
        }
        return R(M !== null ? function() {
          A.continue(M + D);
        } : T), !1;
      }), s;
    }
    function dn(s, a, u, p) {
      return { type: 2, lower: s, upper: a, lowerOpen: u, upperOpen: p };
    }
    function Tc(s) {
      return { type: 1, lower: s, upper: s };
    }
    var Rc = (Object.defineProperty(Qe.prototype, "Collection", { get: function() {
      return this._ctx.table.db.Collection;
    }, enumerable: !1, configurable: !0 }), Qe.prototype.between = function(s, a, u, p) {
      u = u !== !1, p = p === !0;
      try {
        return 0 < this._cmp(s, a) || this._cmp(s, a) === 0 && (u || p) && (!u || !p) ? Xn(this) : new this.Collection(this, function() {
          return dn(s, a, !u, !p);
        });
      } catch {
        return bt(this, Ht);
      }
    }, Qe.prototype.equals = function(s) {
      return s == null ? bt(this, Ht) : new this.Collection(this, function() {
        return Tc(s);
      });
    }, Qe.prototype.above = function(s) {
      return s == null ? bt(this, Ht) : new this.Collection(this, function() {
        return dn(s, void 0, !0);
      });
    }, Qe.prototype.aboveOrEqual = function(s) {
      return s == null ? bt(this, Ht) : new this.Collection(this, function() {
        return dn(s, void 0, !1);
      });
    }, Qe.prototype.below = function(s) {
      return s == null ? bt(this, Ht) : new this.Collection(this, function() {
        return dn(void 0, s, !1, !0);
      });
    }, Qe.prototype.belowOrEqual = function(s) {
      return s == null ? bt(this, Ht) : new this.Collection(this, function() {
        return dn(void 0, s);
      });
    }, Qe.prototype.startsWith = function(s) {
      return typeof s != "string" ? bt(this, _c) : this.between(s, s + An, !0, !0);
    }, Qe.prototype.startsWithIgnoreCase = function(s) {
      return s === "" ? this.startsWith(s) : Ni(this, function(a, u) {
        return a.indexOf(u[0]) === 0;
      }, [s], An);
    }, Qe.prototype.equalsIgnoreCase = function(s) {
      return Ni(this, function(a, u) {
        return a === u[0];
      }, [s], "");
    }, Qe.prototype.anyOfIgnoreCase = function() {
      var s = be.apply(ge, arguments);
      return s.length === 0 ? Xn(this) : Ni(this, function(a, u) {
        return u.indexOf(a) !== -1;
      }, s, "");
    }, Qe.prototype.startsWithAnyOfIgnoreCase = function() {
      var s = be.apply(ge, arguments);
      return s.length === 0 ? Xn(this) : Ni(this, function(a, u) {
        return u.some(function(p) {
          return a.indexOf(p) === 0;
        });
      }, s, An);
    }, Qe.prototype.anyOf = function() {
      var s = this, a = be.apply(ge, arguments), u = this._cmp;
      try {
        a.sort(u);
      } catch {
        return bt(this, Ht);
      }
      if (a.length === 0)
        return Xn(this);
      var p = new this.Collection(this, function() {
        return dn(a[0], a[a.length - 1]);
      });
      p._ondirectionchange = function(v) {
        u = v === "next" ? s._ascending : s._descending, a.sort(u);
      };
      var y = 0;
      return p._addAlgorithm(function(v, k, S) {
        for (var x = v.key; 0 < u(x, a[y]); )
          if (++y === a.length)
            return k(S), !1;
        return u(x, a[y]) === 0 || (k(function() {
          v.continue(a[y]);
        }), !1);
      }), p;
    }, Qe.prototype.notEqual = function(s) {
      return this.inAnyRange([[-1 / 0, s], [s, this.db._maxKey]], { includeLowers: !1, includeUppers: !1 });
    }, Qe.prototype.noneOf = function() {
      var s = be.apply(ge, arguments);
      if (s.length === 0)
        return new this.Collection(this);
      try {
        s.sort(this._ascending);
      } catch {
        return bt(this, Ht);
      }
      var a = s.reduce(function(u, p) {
        return u ? u.concat([[u[u.length - 1][1], p]]) : [[-1 / 0, p]];
      }, null);
      return a.push([s[s.length - 1], this.db._maxKey]), this.inAnyRange(a, { includeLowers: !1, includeUppers: !1 });
    }, Qe.prototype.inAnyRange = function(U, a) {
      var u = this, p = this._cmp, y = this._ascending, v = this._descending, k = this._min, S = this._max;
      if (U.length === 0)
        return Xn(this);
      if (!U.every(function(N) {
        return N[0] !== void 0 && N[1] !== void 0 && y(N[0], N[1]) <= 0;
      }))
        return bt(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", Z.InvalidArgument);
      var x = !a || a.includeLowers !== !1, O = a && a.includeUppers === !0, D, E = y;
      function P(N, M) {
        return E(N[0], M[0]);
      }
      try {
        (D = U.reduce(function(N, M) {
          for (var K = 0, F = N.length; K < F; ++K) {
            var W = N[K];
            if (p(M[0], W[1]) < 0 && 0 < p(M[1], W[0])) {
              W[0] = k(W[0], M[0]), W[1] = S(W[1], M[1]);
              break;
            }
          }
          return K === F && N.push(M), N;
        }, [])).sort(P);
      } catch {
        return bt(this, Ht);
      }
      var C = 0, A = O ? function(N) {
        return 0 < y(N, D[C][1]);
      } : function(N) {
        return 0 <= y(N, D[C][1]);
      }, R = x ? function(N) {
        return 0 < v(N, D[C][0]);
      } : function(N) {
        return 0 <= v(N, D[C][0]);
      }, T = A, U = new this.Collection(this, function() {
        return dn(D[0][0], D[D.length - 1][1], !x, !O);
      });
      return U._ondirectionchange = function(N) {
        E = N === "next" ? (T = A, y) : (T = R, v), D.sort(P);
      }, U._addAlgorithm(function(N, M, K) {
        for (var F, W = N.key; T(W); )
          if (++C === D.length)
            return M(K), !1;
        return !A(F = W) && !R(F) || (u._cmp(W, D[C][1]) === 0 || u._cmp(W, D[C][0]) === 0 || M(function() {
          E === y ? N.continue(D[C][0]) : N.continue(D[C][1]);
        }), !1);
      }), U;
    }, Qe.prototype.startsWithAnyOf = function() {
      var s = be.apply(ge, arguments);
      return s.every(function(a) {
        return typeof a == "string";
      }) ? s.length === 0 ? Xn(this) : this.inAnyRange(s.map(function(a) {
        return [a, a + An];
      })) : bt(this, "startsWithAnyOf() only works with strings");
    }, Qe);
    function Qe() {
    }
    function Ut(s) {
      return Me(function(a) {
        return Dr(a), s(a.target.error), !1;
      });
    }
    function Dr(s) {
      s.stopPropagation && s.stopPropagation(), s.preventDefault && s.preventDefault();
    }
    var Tr = "storagemutated", mo = "x-storagemutated-1", hn = Ir(null, Tr), Xd = (jt.prototype._lock = function() {
      return Q(!ie.global), ++this._reculock, this._reculock !== 1 || ie.global || (ie.lockOwnerFor = this), this;
    }, jt.prototype._unlock = function() {
      if (Q(!ie.global), --this._reculock == 0)
        for (ie.global || (ie.lockOwnerFor = null); 0 < this._blockedFuncs.length && !this._locked(); ) {
          var s = this._blockedFuncs.shift();
          try {
            On(s[1], s[0]);
          } catch {
          }
        }
      return this;
    }, jt.prototype._locked = function() {
      return this._reculock && ie.lockOwnerFor !== this;
    }, jt.prototype.create = function(s) {
      var a = this;
      if (!this.mode)
        return this;
      var u = this.db.idbdb, p = this.db._state.dbOpenError;
      if (Q(!this.idbtrans), !s && !u)
        switch (p && p.name) {
          case "DatabaseClosedError":
            throw new Z.DatabaseClosed(p);
          case "MissingAPIError":
            throw new Z.MissingAPI(p.message, p);
          default:
            throw new Z.OpenFailed(p);
        }
      if (!this.active)
        throw new Z.TransactionInactive();
      return Q(this._completion._state === null), (s = this.idbtrans = s || (this.db.core || u).transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability })).onerror = Me(function(y) {
        Dr(y), a._reject(s.error);
      }), s.onabort = Me(function(y) {
        Dr(y), a.active && a._reject(new Z.Abort(s.error)), a.active = !1, a.on("abort").fire(y);
      }), s.oncomplete = Me(function() {
        a.active = !1, a._resolve(), "mutatedParts" in s && hn.storagemutated.fire(s.mutatedParts);
      }), this;
    }, jt.prototype._promise = function(s, a, u) {
      var p = this;
      if (s === "readwrite" && this.mode !== "readwrite")
        return $e(new Z.ReadOnly("Transaction is readonly"));
      if (!this.active)
        return $e(new Z.TransactionInactive());
      if (this._locked())
        return new J(function(v, k) {
          p._blockedFuncs.push([function() {
            p._promise(s, a, u).then(v, k);
          }, ie]);
        });
      if (u)
        return ln(function() {
          var v = new J(function(k, S) {
            p._lock();
            var x = a(k, S, p);
            x && x.then && x.then(k, S);
          });
          return v.finally(function() {
            return p._unlock();
          }), v._lib = !0, v;
        });
      var y = new J(function(v, k) {
        var S = a(v, k, p);
        S && S.then && S.then(v, k);
      });
      return y._lib = !0, y;
    }, jt.prototype._root = function() {
      return this.parent ? this.parent._root() : this;
    }, jt.prototype.waitFor = function(s) {
      var a, u = this._root(), p = J.resolve(s);
      u._waitingFor ? u._waitingFor = u._waitingFor.then(function() {
        return p;
      }) : (u._waitingFor = p, u._waitingQueue = [], a = u.idbtrans.objectStore(u.storeNames[0]), function v() {
        for (++u._spinCount; u._waitingQueue.length; )
          u._waitingQueue.shift()();
        u._waitingFor && (a.get(-1 / 0).onsuccess = v);
      }());
      var y = u._waitingFor;
      return new J(function(v, k) {
        p.then(function(S) {
          return u._waitingQueue.push(Me(v.bind(null, S)));
        }, function(S) {
          return u._waitingQueue.push(Me(k.bind(null, S)));
        }).finally(function() {
          u._waitingFor === y && (u._waitingFor = null);
        });
      });
    }, jt.prototype.abort = function() {
      this.active && (this.active = !1, this.idbtrans && this.idbtrans.abort(), this._reject(new Z.Abort()));
    }, jt.prototype.table = function(s) {
      var a = this._memoizedTables || (this._memoizedTables = {});
      if (g(a, s))
        return a[s];
      var u = this.schema[s];
      if (!u)
        throw new Z.NotFound("Table " + s + " not part of transaction");
      return u = new this.db.Table(s, u, this), u.core = this.db.core.table(s), a[s] = u;
    }, jt);
    function jt() {
    }
    function vo(s, a, u, p, y, v, k, S) {
      return { name: s, keyPath: a, unique: u, multi: p, auto: y, compound: v, src: (u && !k ? "&" : "") + (p ? "*" : "") + (y ? "++" : "") + Pc(a), type: S };
    }
    function Pc(s) {
      return typeof s == "string" ? s : s ? "[" + [].join.call(s, "+") + "]" : "";
    }
    function bo(s, a, u) {
      return { name: s, primKey: a, indexes: u, mappedClass: null, idxByName: (p = function(y) {
        return [y.name, y];
      }, u.reduce(function(y, v, k) {
        return k = p(v, k), k && (y[k[0]] = k[1]), y;
      }, {})) };
      var p;
    }
    var Rr = function(s) {
      try {
        return s.only([[]]), Rr = function() {
          return [[]];
        }, [[]];
      } catch {
        return Rr = function() {
          return An;
        }, An;
      }
    };
    function wo(s) {
      return s == null ? function() {
      } : typeof s == "string" ? (a = s).split(".").length === 1 ? function(u) {
        return u[a];
      } : function(u) {
        return te(u, a);
      } : function(u) {
        return te(u, s);
      };
      var a;
    }
    function Uc(s) {
      return [].slice.call(s);
    }
    var Qd = 0;
    function Pr(s) {
      return s == null ? ":id" : typeof s == "string" ? s : "[".concat(s.join("+"), "]");
    }
    function Zd(s, a, x) {
      function p(T) {
        if (T.type === 3)
          return null;
        if (T.type === 4)
          throw new Error("Cannot convert never type to IDBKeyRange");
        var C = T.lower, A = T.upper, R = T.lowerOpen, T = T.upperOpen;
        return C === void 0 ? A === void 0 ? null : a.upperBound(A, !!T) : A === void 0 ? a.lowerBound(C, !!R) : a.bound(C, A, !!R, !!T);
      }
      function y(P) {
        var C, A = P.name;
        return { name: A, schema: P, mutate: function(R) {
          var T = R.trans, U = R.type, N = R.keys, M = R.values, K = R.range;
          return new Promise(function(F, W) {
            F = Me(F);
            var q = T.objectStore(A), V = q.keyPath == null, G = U === "put" || U === "add";
            if (!G && U !== "delete" && U !== "deleteRange")
              throw new Error("Invalid operation type: " + U);
            var Y, X = (N || M || { length: 1 }).length;
            if (N && M && N.length !== M.length)
              throw new Error("Given keys array must have same length as given values array.");
            if (X === 0)
              return F({ numFailures: 0, failures: {}, results: [], lastResult: void 0 });
            function he(dt) {
              ++Be, Dr(dt);
            }
            var Ee = [], fe = [], Be = 0;
            if (U === "deleteRange") {
              if (K.type === 4)
                return F({ numFailures: Be, failures: fe, results: [], lastResult: void 0 });
              K.type === 3 ? Ee.push(Y = q.clear()) : Ee.push(Y = q.delete(p(K)));
            } else {
              var V = G ? V ? [M, N] : [M, null] : [N, null], le = V[0], at = V[1];
              if (G)
                for (var ct = 0; ct < X; ++ct)
                  Ee.push(Y = at && at[ct] !== void 0 ? q[U](le[ct], at[ct]) : q[U](le[ct])), Y.onerror = he;
              else
                for (ct = 0; ct < X; ++ct)
                  Ee.push(Y = q[U](le[ct])), Y.onerror = he;
            }
            function Gi(dt) {
              dt = dt.target.result, Ee.forEach(function(Pn, Mo) {
                return Pn.error != null && (fe[Mo] = Pn.error);
              }), F({ numFailures: Be, failures: fe, results: U === "delete" ? N : Ee.map(function(Pn) {
                return Pn.result;
              }), lastResult: dt });
            }
            Y.onerror = function(dt) {
              he(dt), Gi(dt);
            }, Y.onsuccess = Gi;
          });
        }, getMany: function(R) {
          var T = R.trans, U = R.keys;
          return new Promise(function(N, M) {
            N = Me(N);
            for (var K, F = T.objectStore(A), W = U.length, q = new Array(W), V = 0, G = 0, Y = function(Ee) {
              Ee = Ee.target, q[Ee._pos] = Ee.result, ++G === V && N(q);
            }, X = Ut(M), he = 0; he < W; ++he)
              U[he] != null && ((K = F.get(U[he]))._pos = he, K.onsuccess = Y, K.onerror = X, ++V);
            V === 0 && N(q);
          });
        }, get: function(R) {
          var T = R.trans, U = R.key;
          return new Promise(function(N, M) {
            N = Me(N);
            var K = T.objectStore(A).get(U);
            K.onsuccess = function(F) {
              return N(F.target.result);
            }, K.onerror = Ut(M);
          });
        }, query: (C = O, function(R) {
          return new Promise(function(T, U) {
            T = Me(T);
            var N, M, K, V = R.trans, F = R.values, W = R.limit, Y = R.query, q = W === 1 / 0 ? void 0 : W, G = Y.index, Y = Y.range, V = V.objectStore(A), G = G.isPrimaryKey ? V : V.index(G.name), Y = p(Y);
            if (W === 0)
              return T({ result: [] });
            C ? ((q = F ? G.getAll(Y, q) : G.getAllKeys(Y, q)).onsuccess = function(X) {
              return T({ result: X.target.result });
            }, q.onerror = Ut(U)) : (N = 0, M = !F && "openKeyCursor" in G ? G.openKeyCursor(Y) : G.openCursor(Y), K = [], M.onsuccess = function(X) {
              var he = M.result;
              return he ? (K.push(F ? he.value : he.primaryKey), ++N === W ? T({ result: K }) : void he.continue()) : T({ result: K });
            }, M.onerror = Ut(U));
          });
        }), openCursor: function(R) {
          var T = R.trans, U = R.values, N = R.query, M = R.reverse, K = R.unique;
          return new Promise(function(F, W) {
            F = Me(F);
            var G = N.index, q = N.range, V = T.objectStore(A), V = G.isPrimaryKey ? V : V.index(G.name), G = M ? K ? "prevunique" : "prev" : K ? "nextunique" : "next", Y = !U && "openKeyCursor" in V ? V.openKeyCursor(p(q), G) : V.openCursor(p(q), G);
            Y.onerror = Ut(W), Y.onsuccess = Me(function(X) {
              var he, Ee, fe, Be, le = Y.result;
              le ? (le.___id = ++Qd, le.done = !1, he = le.continue.bind(le), Ee = (Ee = le.continuePrimaryKey) && Ee.bind(le), fe = le.advance.bind(le), Be = function() {
                throw new Error("Cursor not stopped");
              }, le.trans = T, le.stop = le.continue = le.continuePrimaryKey = le.advance = function() {
                throw new Error("Cursor not started");
              }, le.fail = Me(W), le.next = function() {
                var at = this, ct = 1;
                return this.start(function() {
                  return ct-- ? at.continue() : at.stop();
                }).then(function() {
                  return at;
                });
              }, le.start = function(at) {
                function ct() {
                  if (Y.result)
                    try {
                      at();
                    } catch (dt) {
                      le.fail(dt);
                    }
                  else
                    le.done = !0, le.start = function() {
                      throw new Error("Cursor behind last entry");
                    }, le.stop();
                }
                var Gi = new Promise(function(dt, Pn) {
                  dt = Me(dt), Y.onerror = Ut(Pn), le.fail = Pn, le.stop = function(Mo) {
                    le.stop = le.continue = le.continuePrimaryKey = le.advance = Be, dt(Mo);
                  };
                });
                return Y.onsuccess = Me(function(dt) {
                  Y.onsuccess = ct, ct();
                }), le.continue = he, le.continuePrimaryKey = Ee, le.advance = fe, ct(), Gi;
              }, F(le)) : F(null);
            }, W);
          });
        }, count: function(R) {
          var T = R.query, U = R.trans, N = T.index, M = T.range;
          return new Promise(function(K, F) {
            var W = U.objectStore(A), q = N.isPrimaryKey ? W : W.index(N.name), W = p(M), q = W ? q.count(W) : q.count();
            q.onsuccess = Me(function(V) {
              return K(V.target.result);
            }), q.onerror = Ut(F);
          });
        } };
      }
      var v, k, S, D = (k = x, S = Uc((v = s).objectStoreNames), { schema: { name: v.name, tables: S.map(function(P) {
        return k.objectStore(P);
      }).map(function(P) {
        var C = P.keyPath, T = P.autoIncrement, A = l(C), R = {}, T = { name: P.name, primaryKey: { name: null, isPrimaryKey: !0, outbound: C == null, compound: A, keyPath: C, autoIncrement: T, unique: !0, extractKey: wo(C) }, indexes: Uc(P.indexNames).map(function(U) {
          return P.index(U);
        }).map(function(K) {
          var N = K.name, M = K.unique, F = K.multiEntry, K = K.keyPath, F = { name: N, compound: l(K), keyPath: K, unique: M, multiEntry: F, extractKey: wo(K) };
          return R[Pr(K)] = F;
        }), getIndexByKeyPath: function(U) {
          return R[Pr(U)];
        } };
        return R[":id"] = T.primaryKey, C != null && (R[Pr(C)] = T.primaryKey), T;
      }) }, hasGetAll: 0 < S.length && "getAll" in k.objectStore(S[0]) && !(typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) }), x = D.schema, O = D.hasGetAll, D = x.tables.map(y), E = {};
      return D.forEach(function(P) {
        return E[P.name] = P;
      }), { stack: "dbcore", transaction: s.transaction.bind(s), table: function(P) {
        if (!E[P])
          throw new Error("Table '".concat(P, "' not found"));
        return E[P];
      }, MIN_KEY: -1 / 0, MAX_KEY: Rr(a), schema: x };
    }
    function eh(s, a, u, p) {
      var y = u.IDBKeyRange;
      return u.indexedDB, { dbcore: (p = Zd(a, y, p), s.dbcore.reduce(function(v, k) {
        return k = k.create, r(r({}, v), k(v));
      }, p)) };
    }
    function Mi(s, p) {
      var u = p.db, p = eh(s._middlewares, u, s._deps, p);
      s.core = p.dbcore, s.tables.forEach(function(y) {
        var v = y.name;
        s.core.schema.tables.some(function(k) {
          return k.name === v;
        }) && (y.core = s.core.table(v), s[v] instanceof s.Table && (s[v].core = y.core));
      });
    }
    function Ki(s, a, u, p) {
      u.forEach(function(y) {
        var v = p[y];
        a.forEach(function(k) {
          var S = function x(O, D) {
            return j(O, D) || (O = h(O)) && x(O, D);
          }(k, y);
          (!S || "value" in S && S.value === void 0) && (k === s.Transaction.prototype || k instanceof s.Transaction ? w(k, y, { get: function() {
            return this.table(y);
          }, set: function(x) {
            b(this, y, { value: x, writable: !0, configurable: !0, enumerable: !0 });
          } }) : k[y] = new s.Table(y, v));
        });
      });
    }
    function _o(s, a) {
      a.forEach(function(u) {
        for (var p in u)
          u[p] instanceof s.Table && delete u[p];
      });
    }
    function th(s, a) {
      return s._cfg.version - a._cfg.version;
    }
    function nh(s, a, u, p) {
      var y = s._dbSchema;
      u.objectStoreNames.contains("$meta") && !y.$meta && (y.$meta = bo("$meta", Lc("")[0], []), s._storeNames.push("$meta"));
      var v = s._createTransaction("readwrite", s._storeNames, y);
      v.create(u), v._completion.catch(p);
      var k = v._reject.bind(v), S = ie.transless || ie;
      ln(function() {
        return ie.trans = v, ie.transless = S, a !== 0 ? (Mi(s, u), O = a, ((x = v).storeNames.includes("$meta") ? x.table("$meta").get("version").then(function(D) {
          return D ?? O;
        }) : J.resolve(O)).then(function(D) {
          return P = D, C = v, A = u, R = [], D = (E = s)._versions, T = E._dbSchema = $i(0, E.idbdb, A), (D = D.filter(function(U) {
            return U._cfg.version >= P;
          })).length !== 0 ? (D.forEach(function(U) {
            R.push(function() {
              var N = T, M = U._cfg.dbschema;
              Fi(E, N, A), Fi(E, M, A), T = E._dbSchema = M;
              var K = ko(N, M);
              K.add.forEach(function(G) {
                So(A, G[0], G[1].primKey, G[1].indexes);
              }), K.change.forEach(function(G) {
                if (G.recreate)
                  throw new Z.Upgrade("Not yet support for changing primary key");
                var Y = A.objectStore(G.name);
                G.add.forEach(function(X) {
                  return Bi(Y, X);
                }), G.change.forEach(function(X) {
                  Y.deleteIndex(X.name), Bi(Y, X);
                }), G.del.forEach(function(X) {
                  return Y.deleteIndex(X);
                });
              });
              var F = U._cfg.contentUpgrade;
              if (F && U._cfg.version > P) {
                Mi(E, A), C._memoizedTables = {};
                var W = je(M);
                K.del.forEach(function(G) {
                  W[G] = N[G];
                }), _o(E, [E.Transaction.prototype]), Ki(E, [E.Transaction.prototype], c(W), W), C.schema = W;
                var q, V = ue(F);
                return V && Yn(), K = J.follow(function() {
                  var G;
                  (q = F(C)) && V && (G = un.bind(null, null), q.then(G, G));
                }), q && typeof q.then == "function" ? J.resolve(q) : K.then(function() {
                  return q;
                });
              }
            }), R.push(function(N) {
              var M, K, F = U._cfg.dbschema;
              M = F, K = N, [].slice.call(K.db.objectStoreNames).forEach(function(W) {
                return M[W] == null && K.db.deleteObjectStore(W);
              }), _o(E, [E.Transaction.prototype]), Ki(E, [E.Transaction.prototype], E._storeNames, E._dbSchema), C.schema = E._dbSchema;
            }), R.push(function(N) {
              E.idbdb.objectStoreNames.contains("$meta") && (Math.ceil(E.idbdb.version / 10) === U._cfg.version ? (E.idbdb.deleteObjectStore("$meta"), delete E._dbSchema.$meta, E._storeNames = E._storeNames.filter(function(M) {
                return M !== "$meta";
              })) : N.objectStore("$meta").put(U._cfg.version, "version"));
            });
          }), function U() {
            return R.length ? J.resolve(R.shift()(C.idbtrans)).then(U) : J.resolve();
          }().then(function() {
            jc(T, A);
          })) : J.resolve();
          var E, P, C, A, R, T;
        }).catch(k)) : (c(y).forEach(function(D) {
          So(u, D, y[D].primKey, y[D].indexes);
        }), Mi(s, u), void J.follow(function() {
          return s.on.populate.fire(v);
        }).catch(k));
        var x, O;
      });
    }
    function rh(s, a) {
      jc(s._dbSchema, a), a.db.version % 10 != 0 || a.objectStoreNames.contains("$meta") || a.db.createObjectStore("$meta").add(Math.ceil(a.db.version / 10 - 1), "version");
      var u = $i(0, s.idbdb, a);
      Fi(s, s._dbSchema, a);
      for (var p = 0, y = ko(u, s._dbSchema).change; p < y.length; p++) {
        var v = function(k) {
          if (k.change.length || k.recreate)
            return console.warn("Unable to patch indexes of table ".concat(k.name, " because it has changes on the type of index or primary key.")), { value: void 0 };
          var S = a.objectStore(k.name);
          k.add.forEach(function(x) {
            Rt && console.debug("Dexie upgrade patch: Creating missing index ".concat(k.name, ".").concat(x.src)), Bi(S, x);
          });
        }(y[p]);
        if (typeof v == "object")
          return v.value;
      }
    }
    function ko(s, a) {
      var u, p = { del: [], add: [], change: [] };
      for (u in s)
        a[u] || p.del.push(u);
      for (u in a) {
        var y = s[u], v = a[u];
        if (y) {
          var k = { name: u, def: v, recreate: !1, del: [], add: [], change: [] };
          if ("" + (y.primKey.keyPath || "") != "" + (v.primKey.keyPath || "") || y.primKey.auto !== v.primKey.auto)
            k.recreate = !0, p.change.push(k);
          else {
            var S = y.idxByName, x = v.idxByName, O = void 0;
            for (O in S)
              x[O] || k.del.push(O);
            for (O in x) {
              var D = S[O], E = x[O];
              D ? D.src !== E.src && k.change.push(E) : k.add.push(E);
            }
            (0 < k.del.length || 0 < k.add.length || 0 < k.change.length) && p.change.push(k);
          }
        } else
          p.add.push([u, v]);
      }
      return p;
    }
    function So(s, a, u, p) {
      var y = s.db.createObjectStore(a, u.keyPath ? { keyPath: u.keyPath, autoIncrement: u.auto } : { autoIncrement: u.auto });
      return p.forEach(function(v) {
        return Bi(y, v);
      }), y;
    }
    function jc(s, a) {
      c(s).forEach(function(u) {
        a.db.objectStoreNames.contains(u) || (Rt && console.debug("Dexie: Creating missing table", u), So(a, u, s[u].primKey, s[u].indexes));
      });
    }
    function Bi(s, a) {
      s.createIndex(a.name, a.keyPath, { unique: a.unique, multiEntry: a.multi });
    }
    function $i(s, a, u) {
      var p = {};
      return B(a.objectStoreNames, 0).forEach(function(y) {
        for (var v = u.objectStore(y), k = vo(Pc(O = v.keyPath), O || "", !0, !1, !!v.autoIncrement, O && typeof O != "string", !0), S = [], x = 0; x < v.indexNames.length; ++x) {
          var D = v.index(v.indexNames[x]), O = D.keyPath, D = vo(D.name, O, !!D.unique, !!D.multiEntry, !1, O && typeof O != "string", !1);
          S.push(D);
        }
        p[y] = bo(y, k, S);
      }), p;
    }
    function Fi(s, a, u) {
      for (var p = u.db.objectStoreNames, y = 0; y < p.length; ++y) {
        var v = p[y], k = u.objectStore(v);
        s._hasGetAll = "getAll" in k;
        for (var S = 0; S < k.indexNames.length; ++S) {
          var x = k.indexNames[S], O = k.index(x).keyPath, D = typeof O == "string" ? O : "[" + B(O).join("+") + "]";
          !a[v] || (O = a[v].idxByName[D]) && (O.name = x, delete a[v].idxByName[D], a[v].idxByName[x] = O);
        }
      }
      typeof navigator < "u" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && o.WorkerGlobalScope && o instanceof o.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604 && (s._hasGetAll = !1);
    }
    function Lc(s) {
      return s.split(",").map(function(a, u) {
        var v = a.split(":"), p = (y = v[1]) === null || y === void 0 ? void 0 : y.trim(), y = (a = v[0].trim()).replace(/([&*]|\+\+)/g, ""), v = /^\[/.test(y) ? y.match(/^\[(.*)\]$/)[1].split("+") : y;
        return vo(y, v || null, /\&/.test(a), /\*/.test(a), /\+\+/.test(a), l(v), u === 0, p);
      });
    }
    var ih = (Qn.prototype._createTableSchema = bo, Qn.prototype._parseIndexSyntax = Lc, Qn.prototype._parseStoresSpec = function(s, a) {
      var u = this;
      c(s).forEach(function(p) {
        if (s[p] !== null) {
          var y = u._parseIndexSyntax(s[p]), v = y.shift();
          if (!v)
            throw new Z.Schema("Invalid schema for table " + p + ": " + s[p]);
          if (v.unique = !0, v.multi)
            throw new Z.Schema("Primary key cannot be multiEntry*");
          y.forEach(function(k) {
            if (k.auto)
              throw new Z.Schema("Only primary key can be marked as autoIncrement (++)");
            if (!k.keyPath)
              throw new Z.Schema("Index must have a name and cannot be an empty string");
          }), y = u._createTableSchema(p, v, y), a[p] = y;
        }
      });
    }, Qn.prototype.stores = function(u) {
      var a = this.db;
      this._cfg.storesSource = this._cfg.storesSource ? d(this._cfg.storesSource, u) : u;
      var u = a._versions, p = {}, y = {};
      return u.forEach(function(v) {
        d(p, v._cfg.storesSource), y = v._cfg.dbschema = {}, v._parseStoresSpec(p, y);
      }), a._dbSchema = y, _o(a, [a._allTables, a, a.Transaction.prototype]), Ki(a, [a._allTables, a, a.Transaction.prototype, this._cfg.tables], c(y), y), a._storeNames = c(y), this;
    }, Qn.prototype.upgrade = function(s) {
      return this._cfg.contentUpgrade = ro(this._cfg.contentUpgrade || ce, s), this;
    }, Qn);
    function Qn() {
    }
    function Eo(s, a) {
      var u = s._dbNamesDB;
      return u || (u = s._dbNamesDB = new zt(Ri, { addons: [], indexedDB: s, IDBKeyRange: a })).version(1).stores({ dbnames: "name" }), u.table("dbnames");
    }
    function xo(s) {
      return s && typeof s.databases == "function";
    }
    function Co(s) {
      return ln(function() {
        return ie.letThrough = !0, s();
      });
    }
    function Io(s) {
      return !("from" in s);
    }
    var ot = function(s, a) {
      if (!this) {
        var u = new ot();
        return s && "d" in s && d(u, s), u;
      }
      d(this, arguments.length ? { d: 1, from: s, to: 1 < arguments.length ? a : s } : { d: 0 });
    };
    function Ur(s, a, u) {
      var p = Se(a, u);
      if (!isNaN(p)) {
        if (0 < p)
          throw RangeError();
        if (Io(s))
          return d(s, { from: a, to: u, d: 1 });
        var y = s.l, p = s.r;
        if (Se(u, s.from) < 0)
          return y ? Ur(y, a, u) : s.l = { from: a, to: u, d: 1, l: null, r: null }, Mc(s);
        if (0 < Se(a, s.to))
          return p ? Ur(p, a, u) : s.r = { from: a, to: u, d: 1, l: null, r: null }, Mc(s);
        Se(a, s.from) < 0 && (s.from = a, s.l = null, s.d = p ? p.d + 1 : 1), 0 < Se(u, s.to) && (s.to = u, s.r = null, s.d = s.l ? s.l.d + 1 : 1), u = !s.r, y && !s.l && jr(s, y), p && u && jr(s, p);
      }
    }
    function jr(s, a) {
      Io(a) || function u(p, x) {
        var v = x.from, k = x.to, S = x.l, x = x.r;
        Ur(p, v, k), S && u(p, S), x && u(p, x);
      }(s, a);
    }
    function Nc(s, a) {
      var u = qi(a), p = u.next();
      if (p.done)
        return !1;
      for (var y = p.value, v = qi(s), k = v.next(y.from), S = k.value; !p.done && !k.done; ) {
        if (Se(S.from, y.to) <= 0 && 0 <= Se(S.to, y.from))
          return !0;
        Se(y.from, S.from) < 0 ? y = (p = u.next(S.from)).value : S = (k = v.next(y.from)).value;
      }
      return !1;
    }
    function qi(s) {
      var a = Io(s) ? null : { s: 0, n: s };
      return { next: function(u) {
        for (var p = 0 < arguments.length; a; )
          switch (a.s) {
            case 0:
              if (a.s = 1, p)
                for (; a.n.l && Se(u, a.n.from) < 0; )
                  a = { up: a, n: a.n.l, s: 1 };
              else
                for (; a.n.l; )
                  a = { up: a, n: a.n.l, s: 1 };
            case 1:
              if (a.s = 2, !p || Se(u, a.n.to) <= 0)
                return { value: a.n, done: !1 };
            case 2:
              if (a.n.r) {
                a.s = 3, a = { up: a, n: a.n.r, s: 0 };
                continue;
              }
            case 3:
              a = a.up;
          }
        return { done: !0 };
      } };
    }
    function Mc(s) {
      var a, u, p = (((a = s.r) === null || a === void 0 ? void 0 : a.d) || 0) - (((u = s.l) === null || u === void 0 ? void 0 : u.d) || 0), y = 1 < p ? "r" : p < -1 ? "l" : "";
      y && (a = y == "r" ? "l" : "r", u = r({}, s), p = s[y], s.from = p.from, s.to = p.to, s[y] = p[y], u[y] = p[a], (s[a] = u).d = Kc(u)), s.d = Kc(s);
    }
    function Kc(u) {
      var a = u.r, u = u.l;
      return (a ? u ? Math.max(a.d, u.d) : a.d : u ? u.d : 0) + 1;
    }
    function Vi(s, a) {
      return c(a).forEach(function(u) {
        s[u] ? jr(s[u], a[u]) : s[u] = function p(y) {
          var v, k, S = {};
          for (v in y)
            g(y, v) && (k = y[v], S[v] = !k || typeof k != "object" || H.has(k.constructor) ? k : p(k));
          return S;
        }(a[u]);
      }), s;
    }
    function Oo(s, a) {
      return s.all || a.all || Object.keys(s).some(function(u) {
        return a[u] && Nc(a[u], s[u]);
      });
    }
    m(ot.prototype, ((Et = { add: function(s) {
      return jr(this, s), this;
    }, addKey: function(s) {
      return Ur(this, s, s), this;
    }, addKeys: function(s) {
      var a = this;
      return s.forEach(function(u) {
        return Ur(a, u, u);
      }), this;
    }, hasKey: function(s) {
      var a = qi(this).next(s).value;
      return a && Se(a.from, s) <= 0 && 0 <= Se(a.to, s);
    } })[z] = function() {
      return qi(this);
    }, Et));
    var Tn = {}, Ao = {}, Do = !1;
    function Wi(s) {
      Vi(Ao, s), Do || (Do = !0, setTimeout(function() {
        Do = !1, To(Ao, !(Ao = {}));
      }, 0));
    }
    function To(s, a) {
      a === void 0 && (a = !1);
      var u = /* @__PURE__ */ new Set();
      if (s.all)
        for (var p = 0, y = Object.values(Tn); p < y.length; p++)
          Bc(k = y[p], s, u, a);
      else
        for (var v in s) {
          var k, S = /^idb\:\/\/(.*)\/(.*)\//.exec(v);
          S && (v = S[1], S = S[2], (k = Tn["idb://".concat(v, "/").concat(S)]) && Bc(k, s, u, a));
        }
      u.forEach(function(x) {
        return x();
      });
    }
    function Bc(s, a, u, p) {
      for (var y = [], v = 0, k = Object.entries(s.queries.query); v < k.length; v++) {
        for (var S = k[v], x = S[0], O = [], D = 0, E = S[1]; D < E.length; D++) {
          var P = E[D];
          Oo(a, P.obsSet) ? P.subscribers.forEach(function(T) {
            return u.add(T);
          }) : p && O.push(P);
        }
        p && y.push([x, O]);
      }
      if (p)
        for (var C = 0, A = y; C < A.length; C++) {
          var R = A[C], x = R[0], O = R[1];
          s.queries.query[x] = O;
        }
    }
    function sh(s) {
      var a = s._state, u = s._deps.indexedDB;
      if (a.isBeingOpened || s.idbdb)
        return a.dbReadyPromise.then(function() {
          return a.dbOpenError ? $e(a.dbOpenError) : s;
        });
      a.isBeingOpened = !0, a.dbOpenError = null, a.openComplete = !1;
      var p = a.openCanceller, y = Math.round(10 * s.verno), v = !1;
      function k() {
        if (a.openCanceller !== p)
          throw new Z.DatabaseClosed("db.open() was cancelled");
      }
      function S() {
        return new J(function(P, C) {
          if (k(), !u)
            throw new Z.MissingAPI();
          var A = s.name, R = a.autoSchema || !y ? u.open(A) : u.open(A, y);
          if (!R)
            throw new Z.MissingAPI();
          R.onerror = Ut(C), R.onblocked = Me(s._fireOnBlocked), R.onupgradeneeded = Me(function(T) {
            var U;
            D = R.transaction, a.autoSchema && !s._options.allowEmptyDB ? (R.onerror = Dr, D.abort(), R.result.close(), (U = u.deleteDatabase(A)).onsuccess = U.onerror = Me(function() {
              C(new Z.NoSuchDatabase("Database ".concat(A, " doesnt exist")));
            })) : (D.onerror = Ut(C), T = T.oldVersion > Math.pow(2, 62) ? 0 : T.oldVersion, E = T < 1, s.idbdb = R.result, v && rh(s, D), nh(s, T / 10, D, C));
          }, C), R.onsuccess = Me(function() {
            D = null;
            var T, U, N, M, K, F = s.idbdb = R.result, W = B(F.objectStoreNames);
            if (0 < W.length)
              try {
                var q = F.transaction((M = W).length === 1 ? M[0] : M, "readonly");
                if (a.autoSchema)
                  U = F, N = q, (T = s).verno = U.version / 10, N = T._dbSchema = $i(0, U, N), T._storeNames = B(U.objectStoreNames, 0), Ki(T, [T._allTables], c(N), N);
                else if (Fi(s, s._dbSchema, q), ((K = ko($i(0, (K = s).idbdb, q), K._dbSchema)).add.length || K.change.some(function(V) {
                  return V.add.length || V.change.length;
                })) && !v)
                  return console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this."), F.close(), y = F.version + 1, v = !0, P(S());
                Mi(s, q);
              } catch {
              }
            Gn.push(s), F.onversionchange = Me(function(V) {
              a.vcFired = !0, s.on("versionchange").fire(V);
            }), F.onclose = Me(function(V) {
              s.on("close").fire(V);
            }), E && (K = s._deps, q = A, F = K.indexedDB, K = K.IDBKeyRange, xo(F) || q === Ri || Eo(F, K).put({ name: q }).catch(ce)), P();
          }, C);
        }).catch(function(P) {
          switch (P == null ? void 0 : P.name) {
            case "UnknownError":
              if (0 < a.PR1398_maxLoop)
                return a.PR1398_maxLoop--, console.warn("Dexie: Workaround for Chrome UnknownError on open()"), S();
              break;
            case "VersionError":
              if (0 < y)
                return y = 0, S();
          }
          return J.reject(P);
        });
      }
      var x, O = a.dbReadyResolve, D = null, E = !1;
      return J.race([p, (typeof navigator > "u" ? J.resolve() : !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent) && indexedDB.databases ? new Promise(function(P) {
        function C() {
          return indexedDB.databases().finally(P);
        }
        x = setInterval(C, 100), C();
      }).finally(function() {
        return clearInterval(x);
      }) : Promise.resolve()).then(S)]).then(function() {
        return k(), a.onReadyBeingFired = [], J.resolve(Co(function() {
          return s.on.ready.fire(s.vip);
        })).then(function P() {
          if (0 < a.onReadyBeingFired.length) {
            var C = a.onReadyBeingFired.reduce(ro, ce);
            return a.onReadyBeingFired = [], J.resolve(Co(function() {
              return C(s.vip);
            })).then(P);
          }
        });
      }).finally(function() {
        a.openCanceller === p && (a.onReadyBeingFired = null, a.isBeingOpened = !1);
      }).catch(function(P) {
        a.dbOpenError = P;
        try {
          D && D.abort();
        } catch {
        }
        return p === a.openCanceller && s._close(), $e(P);
      }).finally(function() {
        a.openComplete = !0, O();
      }).then(function() {
        var P;
        return E && (P = {}, s.tables.forEach(function(C) {
          C.schema.indexes.forEach(function(A) {
            A.name && (P["idb://".concat(s.name, "/").concat(C.name, "/").concat(A.name)] = new ot(-1 / 0, [[[]]]));
          }), P["idb://".concat(s.name, "/").concat(C.name, "/")] = P["idb://".concat(s.name, "/").concat(C.name, "/:dels")] = new ot(-1 / 0, [[[]]]);
        }), hn(Tr).fire(P), To(P, !0)), s;
      });
    }
    function Ro(s) {
      function a(v) {
        return s.next(v);
      }
      var u = y(a), p = y(function(v) {
        return s.throw(v);
      });
      function y(v) {
        return function(x) {
          var S = v(x), x = S.value;
          return S.done ? x : x && typeof x.then == "function" ? x.then(u, p) : l(x) ? Promise.all(x).then(u, p) : u(x);
        };
      }
      return y(a)();
    }
    function Hi(s, a, u) {
      for (var p = l(s) ? s.slice() : [s], y = 0; y < u; ++y)
        p.push(a);
      return p;
    }
    var oh = { stack: "dbcore", name: "VirtualIndexMiddleware", level: 1, create: function(s) {
      return r(r({}, s), { table: function(a) {
        var u = s.table(a), p = u.schema, y = {}, v = [];
        function k(E, P, C) {
          var A = Pr(E), R = y[A] = y[A] || [], T = E == null ? 0 : typeof E == "string" ? 1 : E.length, U = 0 < P, U = r(r({}, C), { name: U ? "".concat(A, "(virtual-from:").concat(C.name, ")") : C.name, lowLevelIndex: C, isVirtual: U, keyTail: P, keyLength: T, extractKey: wo(E), unique: !U && C.unique });
          return R.push(U), U.isPrimaryKey || v.push(U), 1 < T && k(T === 2 ? E[0] : E.slice(0, T - 1), P + 1, C), R.sort(function(N, M) {
            return N.keyTail - M.keyTail;
          }), U;
        }
        a = k(p.primaryKey.keyPath, 0, p.primaryKey), y[":id"] = [a];
        for (var S = 0, x = p.indexes; S < x.length; S++) {
          var O = x[S];
          k(O.keyPath, 0, O);
        }
        function D(E) {
          var P, C = E.query.index;
          return C.isVirtual ? r(r({}, E), { query: { index: C.lowLevelIndex, range: (P = E.query.range, C = C.keyTail, { type: P.type === 1 ? 2 : P.type, lower: Hi(P.lower, P.lowerOpen ? s.MAX_KEY : s.MIN_KEY, C), lowerOpen: !0, upper: Hi(P.upper, P.upperOpen ? s.MIN_KEY : s.MAX_KEY, C), upperOpen: !0 }) } }) : E;
        }
        return r(r({}, u), { schema: r(r({}, p), { primaryKey: a, indexes: v, getIndexByKeyPath: function(E) {
          return (E = y[Pr(E)]) && E[0];
        } }), count: function(E) {
          return u.count(D(E));
        }, query: function(E) {
          return u.query(D(E));
        }, openCursor: function(E) {
          var P = E.query.index, C = P.keyTail, A = P.isVirtual, R = P.keyLength;
          return A ? u.openCursor(D(E)).then(function(U) {
            return U && T(U);
          }) : u.openCursor(E);
          function T(U) {
            return Object.create(U, { continue: { value: function(N) {
              N != null ? U.continue(Hi(N, E.reverse ? s.MAX_KEY : s.MIN_KEY, C)) : E.unique ? U.continue(U.key.slice(0, R).concat(E.reverse ? s.MIN_KEY : s.MAX_KEY, C)) : U.continue();
            } }, continuePrimaryKey: { value: function(N, M) {
              U.continuePrimaryKey(Hi(N, s.MAX_KEY, C), M);
            } }, primaryKey: { get: function() {
              return U.primaryKey;
            } }, key: { get: function() {
              var N = U.key;
              return R === 1 ? N[0] : N.slice(0, R);
            } }, value: { get: function() {
              return U.value;
            } } });
          }
        } });
      } });
    } };
    function Po(s, a, u, p) {
      return u = u || {}, p = p || "", c(s).forEach(function(y) {
        var v, k, S;
        g(a, y) ? (v = s[y], k = a[y], typeof v == "object" && typeof k == "object" && v && k ? (S = ke(v)) !== ke(k) ? u[p + y] = a[y] : S === "Object" ? Po(v, k, u, p + y + ".") : v !== k && (u[p + y] = a[y]) : v !== k && (u[p + y] = a[y])) : u[p + y] = void 0;
      }), c(a).forEach(function(y) {
        g(s, y) || (u[p + y] = a[y]);
      }), u;
    }
    function Uo(s, a) {
      return a.type === "delete" ? a.keys : a.keys || a.values.map(s.extractKey);
    }
    var ah = { stack: "dbcore", name: "HooksMiddleware", level: 2, create: function(s) {
      return r(r({}, s), { table: function(a) {
        var u = s.table(a), p = u.schema.primaryKey;
        return r(r({}, u), { mutate: function(y) {
          var v = ie.trans, k = v.table(a).hook, S = k.deleting, x = k.creating, O = k.updating;
          switch (y.type) {
            case "add":
              if (x.fire === ce)
                break;
              return v._promise("readwrite", function() {
                return D(y);
              }, !0);
            case "put":
              if (x.fire === ce && O.fire === ce)
                break;
              return v._promise("readwrite", function() {
                return D(y);
              }, !0);
            case "delete":
              if (S.fire === ce)
                break;
              return v._promise("readwrite", function() {
                return D(y);
              }, !0);
            case "deleteRange":
              if (S.fire === ce)
                break;
              return v._promise("readwrite", function() {
                return function E(P, C, A) {
                  return u.query({ trans: P, values: !1, query: { index: p, range: C }, limit: A }).then(function(R) {
                    var T = R.result;
                    return D({ type: "delete", keys: T, trans: P }).then(function(U) {
                      return 0 < U.numFailures ? Promise.reject(U.failures[0]) : T.length < A ? { failures: [], numFailures: 0, lastResult: void 0 } : E(P, r(r({}, C), { lower: T[T.length - 1], lowerOpen: !0 }), A);
                    });
                  });
                }(y.trans, y.range, 1e4);
              }, !0);
          }
          return u.mutate(y);
          function D(E) {
            var P, C, A, R = ie.trans, T = E.keys || Uo(p, E);
            if (!T)
              throw new Error("Keys missing");
            return (E = E.type === "add" || E.type === "put" ? r(r({}, E), { keys: T }) : r({}, E)).type !== "delete" && (E.values = i([], E.values, !0)), E.keys && (E.keys = i([], E.keys, !0)), P = u, A = T, ((C = E).type === "add" ? Promise.resolve([]) : P.getMany({ trans: C.trans, keys: A, cache: "immutable" })).then(function(U) {
              var N = T.map(function(M, K) {
                var F, W, q, V = U[K], G = { onerror: null, onsuccess: null };
                return E.type === "delete" ? S.fire.call(G, M, V, R) : E.type === "add" || V === void 0 ? (F = x.fire.call(G, M, E.values[K], R), M == null && F != null && (E.keys[K] = M = F, p.outbound || oe(E.values[K], p.keyPath, M))) : (F = Po(V, E.values[K]), (W = O.fire.call(G, F, M, V, R)) && (q = E.values[K], Object.keys(W).forEach(function(Y) {
                  g(q, Y) ? q[Y] = W[Y] : oe(q, Y, W[Y]);
                }))), G;
              });
              return u.mutate(E).then(function(M) {
                for (var K = M.failures, F = M.results, W = M.numFailures, M = M.lastResult, q = 0; q < T.length; ++q) {
                  var V = (F || T)[q], G = N[q];
                  V == null ? G.onerror && G.onerror(K[q]) : G.onsuccess && G.onsuccess(E.type === "put" && U[q] ? E.values[q] : V);
                }
                return { failures: K, results: F, numFailures: W, lastResult: M };
              }).catch(function(M) {
                return N.forEach(function(K) {
                  return K.onerror && K.onerror(M);
                }), Promise.reject(M);
              });
            });
          }
        } });
      } });
    } };
    function $c(s, a, u) {
      try {
        if (!a || a.keys.length < s.length)
          return null;
        for (var p = [], y = 0, v = 0; y < a.keys.length && v < s.length; ++y)
          Se(a.keys[y], s[v]) === 0 && (p.push(u ? me(a.values[y]) : a.values[y]), ++v);
        return p.length === s.length ? p : null;
      } catch {
        return null;
      }
    }
    var ch = { stack: "dbcore", level: -1, create: function(s) {
      return { table: function(a) {
        var u = s.table(a);
        return r(r({}, u), { getMany: function(p) {
          if (!p.cache)
            return u.getMany(p);
          var y = $c(p.keys, p.trans._cache, p.cache === "clone");
          return y ? J.resolve(y) : u.getMany(p).then(function(v) {
            return p.trans._cache = { keys: p.keys, values: p.cache === "clone" ? me(v) : v }, v;
          });
        }, mutate: function(p) {
          return p.type !== "add" && (p.trans._cache = null), u.mutate(p);
        } });
      } };
    } };
    function Fc(s, a) {
      return s.trans.mode === "readonly" && !!s.subscr && !s.trans.explicit && s.trans.db._options.cache !== "disabled" && !a.schema.primaryKey.outbound;
    }
    function qc(s, a) {
      switch (s) {
        case "query":
          return a.values && !a.unique;
        case "get":
        case "getMany":
        case "count":
        case "openCursor":
          return !1;
      }
    }
    var lh = { stack: "dbcore", level: 0, name: "Observability", create: function(s) {
      var a = s.schema.name, u = new ot(s.MIN_KEY, s.MAX_KEY);
      return r(r({}, s), { transaction: function(p, y, v) {
        if (ie.subscr && y !== "readonly")
          throw new Z.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(ie.querier));
        return s.transaction(p, y, v);
      }, table: function(p) {
        var y = s.table(p), v = y.schema, k = v.primaryKey, E = v.indexes, S = k.extractKey, x = k.outbound, O = k.autoIncrement && E.filter(function(C) {
          return C.compound && C.keyPath.includes(k.keyPath);
        }), D = r(r({}, y), { mutate: function(C) {
          function A(Y) {
            return Y = "idb://".concat(a, "/").concat(p, "/").concat(Y), M[Y] || (M[Y] = new ot());
          }
          var R, T, U, N = C.trans, M = C.mutatedParts || (C.mutatedParts = {}), K = A(""), F = A(":dels"), W = C.type, G = C.type === "deleteRange" ? [C.range] : C.type === "delete" ? [C.keys] : C.values.length < 50 ? [Uo(k, C).filter(function(Y) {
            return Y;
          }), C.values] : [], q = G[0], V = G[1], G = C.trans._cache;
          return l(q) ? (K.addKeys(q), (G = W === "delete" || q.length === V.length ? $c(q, G) : null) || F.addKeys(q), (G || V) && (R = A, T = G, U = V, v.indexes.forEach(function(Y) {
            var X = R(Y.name || "");
            function he(fe) {
              return fe != null ? Y.extractKey(fe) : null;
            }
            function Ee(fe) {
              return Y.multiEntry && l(fe) ? fe.forEach(function(Be) {
                return X.addKey(Be);
              }) : X.addKey(fe);
            }
            (T || U).forEach(function(fe, at) {
              var le = T && he(T[at]), at = U && he(U[at]);
              Se(le, at) !== 0 && (le != null && Ee(le), at != null && Ee(at));
            });
          }))) : q ? (V = { from: (V = q.lower) !== null && V !== void 0 ? V : s.MIN_KEY, to: (V = q.upper) !== null && V !== void 0 ? V : s.MAX_KEY }, F.add(V), K.add(V)) : (K.add(u), F.add(u), v.indexes.forEach(function(Y) {
            return A(Y.name).add(u);
          })), y.mutate(C).then(function(Y) {
            return !q || C.type !== "add" && C.type !== "put" || (K.addKeys(Y.results), O && O.forEach(function(X) {
              for (var he = C.values.map(function(le) {
                return X.extractKey(le);
              }), Ee = X.keyPath.findIndex(function(le) {
                return le === k.keyPath;
              }), fe = 0, Be = Y.results.length; fe < Be; ++fe)
                he[fe][Ee] = Y.results[fe];
              A(X.name).addKeys(he);
            })), N.mutatedParts = Vi(N.mutatedParts || {}, M), Y;
          });
        } }), E = function(A) {
          var R = A.query, A = R.index, R = R.range;
          return [A, new ot((A = R.lower) !== null && A !== void 0 ? A : s.MIN_KEY, (R = R.upper) !== null && R !== void 0 ? R : s.MAX_KEY)];
        }, P = { get: function(C) {
          return [k, new ot(C.key)];
        }, getMany: function(C) {
          return [k, new ot().addKeys(C.keys)];
        }, count: E, query: E, openCursor: E };
        return c(P).forEach(function(C) {
          D[C] = function(A) {
            var R = ie.subscr, T = !!R, U = Fc(ie, y) && qc(C, A) ? A.obsSet = {} : R;
            if (T) {
              var N = function(V) {
                return V = "idb://".concat(a, "/").concat(p, "/").concat(V), U[V] || (U[V] = new ot());
              }, M = N(""), K = N(":dels"), R = P[C](A), T = R[0], R = R[1];
              if ((C === "query" && T.isPrimaryKey && !A.values ? K : N(T.name || "")).add(R), !T.isPrimaryKey) {
                if (C !== "count") {
                  var F = C === "query" && x && A.values && y.query(r(r({}, A), { values: !1 }));
                  return y[C].apply(this, arguments).then(function(V) {
                    if (C === "query") {
                      if (x && A.values)
                        return F.then(function(he) {
                          return he = he.result, M.addKeys(he), V;
                        });
                      var G = A.values ? V.result.map(S) : V.result;
                      (A.values ? M : K).addKeys(G);
                    } else if (C === "openCursor") {
                      var Y = V, X = A.values;
                      return Y && Object.create(Y, { key: { get: function() {
                        return K.addKey(Y.primaryKey), Y.key;
                      } }, primaryKey: { get: function() {
                        var he = Y.primaryKey;
                        return K.addKey(he), he;
                      } }, value: { get: function() {
                        return X && M.addKey(Y.primaryKey), Y.value;
                      } } });
                    }
                    return V;
                  });
                }
                K.add(u);
              }
            }
            return y[C].apply(this, arguments);
          };
        }), D;
      } });
    } };
    function Vc(s, a, u) {
      if (u.numFailures === 0)
        return a;
      if (a.type === "deleteRange")
        return null;
      var p = a.keys ? a.keys.length : "values" in a && a.values ? a.values.length : 1;
      return u.numFailures === p ? null : (a = r({}, a), l(a.keys) && (a.keys = a.keys.filter(function(y, v) {
        return !(v in u.failures);
      })), "values" in a && l(a.values) && (a.values = a.values.filter(function(y, v) {
        return !(v in u.failures);
      })), a);
    }
    function jo(s, a) {
      return u = s, ((p = a).lower === void 0 || (p.lowerOpen ? 0 < Se(u, p.lower) : 0 <= Se(u, p.lower))) && (s = s, (a = a).upper === void 0 || (a.upperOpen ? Se(s, a.upper) < 0 : Se(s, a.upper) <= 0));
      var u, p;
    }
    function Wc(s, a, P, p, y, v) {
      if (!P || P.length === 0)
        return s;
      var k = a.query.index, S = k.multiEntry, x = a.query.range, O = p.schema.primaryKey.extractKey, D = k.extractKey, E = (k.lowLevelIndex || k).extractKey, P = P.reduce(function(C, A) {
        var R = C, T = [];
        if (A.type === "add" || A.type === "put")
          for (var U = new ot(), N = A.values.length - 1; 0 <= N; --N) {
            var M, K = A.values[N], F = O(K);
            U.hasKey(F) || (M = D(K), (S && l(M) ? M.some(function(Y) {
              return jo(Y, x);
            }) : jo(M, x)) && (U.addKey(F), T.push(K)));
          }
        switch (A.type) {
          case "add":
            var W = new ot().addKeys(a.values ? C.map(function(X) {
              return O(X);
            }) : C), R = C.concat(a.values ? T.filter(function(X) {
              return X = O(X), !W.hasKey(X) && (W.addKey(X), !0);
            }) : T.map(function(X) {
              return O(X);
            }).filter(function(X) {
              return !W.hasKey(X) && (W.addKey(X), !0);
            }));
            break;
          case "put":
            var q = new ot().addKeys(A.values.map(function(X) {
              return O(X);
            }));
            R = C.filter(function(X) {
              return !q.hasKey(a.values ? O(X) : X);
            }).concat(a.values ? T : T.map(function(X) {
              return O(X);
            }));
            break;
          case "delete":
            var V = new ot().addKeys(A.keys);
            R = C.filter(function(X) {
              return !V.hasKey(a.values ? O(X) : X);
            });
            break;
          case "deleteRange":
            var G = A.range;
            R = C.filter(function(X) {
              return !jo(O(X), G);
            });
        }
        return R;
      }, s);
      return P === s ? s : (P.sort(function(C, A) {
        return Se(E(C), E(A)) || Se(O(C), O(A));
      }), a.limit && a.limit < 1 / 0 && (P.length > a.limit ? P.length = a.limit : s.length === a.limit && P.length < a.limit && (y.dirty = !0)), v ? Object.freeze(P) : P);
    }
    function Hc(s, a) {
      return Se(s.lower, a.lower) === 0 && Se(s.upper, a.upper) === 0 && !!s.lowerOpen == !!a.lowerOpen && !!s.upperOpen == !!a.upperOpen;
    }
    function uh(s, a) {
      return function(u, p, y, v) {
        if (u === void 0)
          return p !== void 0 ? -1 : 0;
        if (p === void 0)
          return 1;
        if ((p = Se(u, p)) === 0) {
          if (y && v)
            return 0;
          if (y)
            return 1;
          if (v)
            return -1;
        }
        return p;
      }(s.lower, a.lower, s.lowerOpen, a.lowerOpen) <= 0 && 0 <= function(u, p, y, v) {
        if (u === void 0)
          return p !== void 0 ? 1 : 0;
        if (p === void 0)
          return -1;
        if ((p = Se(u, p)) === 0) {
          if (y && v)
            return 0;
          if (y)
            return -1;
          if (v)
            return 1;
        }
        return p;
      }(s.upper, a.upper, s.upperOpen, a.upperOpen);
    }
    function fh(s, a, u, p) {
      s.subscribers.add(u), p.addEventListener("abort", function() {
        var y, v;
        s.subscribers.delete(u), s.subscribers.size === 0 && (y = s, v = a, setTimeout(function() {
          y.subscribers.size === 0 && re(v, y);
        }, 3e3));
      });
    }
    var dh = { stack: "dbcore", level: 0, name: "Cache", create: function(s) {
      var a = s.schema.name;
      return r(r({}, s), { transaction: function(u, p, y) {
        var v, k, S = s.transaction(u, p, y);
        return p === "readwrite" && (k = (v = new AbortController()).signal, y = function(x) {
          return function() {
            if (v.abort(), p === "readwrite") {
              for (var O = /* @__PURE__ */ new Set(), D = 0, E = u; D < E.length; D++) {
                var P = E[D], C = Tn["idb://".concat(a, "/").concat(P)];
                if (C) {
                  var A = s.table(P), R = C.optimisticOps.filter(function(X) {
                    return X.trans === S;
                  });
                  if (S._explicit && x && S.mutatedParts)
                    for (var T = 0, U = Object.values(C.queries.query); T < U.length; T++)
                      for (var N = 0, M = (W = U[T]).slice(); N < M.length; N++)
                        Oo((q = M[N]).obsSet, S.mutatedParts) && (re(W, q), q.subscribers.forEach(function(X) {
                          return O.add(X);
                        }));
                  else if (0 < R.length) {
                    C.optimisticOps = C.optimisticOps.filter(function(X) {
                      return X.trans !== S;
                    });
                    for (var K = 0, F = Object.values(C.queries.query); K < F.length; K++)
                      for (var W, q, V, G = 0, Y = (W = F[K]).slice(); G < Y.length; G++)
                        (q = Y[G]).res != null && S.mutatedParts && (x && !q.dirty ? (V = Object.isFrozen(q.res), V = Wc(q.res, q.req, R, A, q, V), q.dirty ? (re(W, q), q.subscribers.forEach(function(X) {
                          return O.add(X);
                        })) : V !== q.res && (q.res = V, q.promise = J.resolve({ result: V }))) : (q.dirty && re(W, q), q.subscribers.forEach(function(X) {
                          return O.add(X);
                        })));
                  }
                }
              }
              O.forEach(function(X) {
                return X();
              });
            }
          };
        }, S.addEventListener("abort", y(!1), { signal: k }), S.addEventListener("error", y(!1), { signal: k }), S.addEventListener("complete", y(!0), { signal: k })), S;
      }, table: function(u) {
        var p = s.table(u), y = p.schema.primaryKey;
        return r(r({}, p), { mutate: function(v) {
          var k = ie.trans;
          if (y.outbound || k.db._options.cache === "disabled" || k.explicit || k.idbtrans.mode !== "readwrite")
            return p.mutate(v);
          var S = Tn["idb://".concat(a, "/").concat(u)];
          return S ? (k = p.mutate(v), v.type !== "add" && v.type !== "put" || !(50 <= v.values.length || Uo(y, v).some(function(x) {
            return x == null;
          })) ? (S.optimisticOps.push(v), v.mutatedParts && Wi(v.mutatedParts), k.then(function(x) {
            0 < x.numFailures && (re(S.optimisticOps, v), (x = Vc(0, v, x)) && S.optimisticOps.push(x), v.mutatedParts && Wi(v.mutatedParts));
          }), k.catch(function() {
            re(S.optimisticOps, v), v.mutatedParts && Wi(v.mutatedParts);
          })) : k.then(function(x) {
            var O = Vc(0, r(r({}, v), { values: v.values.map(function(D, E) {
              var P;
              return x.failures[E] ? D : (D = (P = y.keyPath) !== null && P !== void 0 && P.includes(".") ? me(D) : r({}, D), oe(D, y.keyPath, x.results[E]), D);
            }) }), x);
            S.optimisticOps.push(O), queueMicrotask(function() {
              return v.mutatedParts && Wi(v.mutatedParts);
            });
          }), k) : p.mutate(v);
        }, query: function(v) {
          if (!Fc(ie, p) || !qc("query", v))
            return p.query(v);
          var k = ((O = ie.trans) === null || O === void 0 ? void 0 : O.db._options.cache) === "immutable", E = ie, S = E.requery, x = E.signal, O = function(A, R, T, U) {
            var N = Tn["idb://".concat(A, "/").concat(R)];
            if (!N)
              return [];
            if (!(R = N.queries[T]))
              return [null, !1, N, null];
            var M = R[(U.query ? U.query.index.name : null) || ""];
            if (!M)
              return [null, !1, N, null];
            switch (T) {
              case "query":
                var K = M.find(function(F) {
                  return F.req.limit === U.limit && F.req.values === U.values && Hc(F.req.query.range, U.query.range);
                });
                return K ? [K, !0, N, M] : [M.find(function(F) {
                  return ("limit" in F.req ? F.req.limit : 1 / 0) >= U.limit && (!U.values || F.req.values) && uh(F.req.query.range, U.query.range);
                }), !1, N, M];
              case "count":
                return K = M.find(function(F) {
                  return Hc(F.req.query.range, U.query.range);
                }), [K, !!K, N, M];
            }
          }(a, u, "query", v), D = O[0], E = O[1], P = O[2], C = O[3];
          return D && E ? D.obsSet = v.obsSet : (E = p.query(v).then(function(A) {
            var R = A.result;
            if (D && (D.res = R), k) {
              for (var T = 0, U = R.length; T < U; ++T)
                Object.freeze(R[T]);
              Object.freeze(R);
            } else
              A.result = me(R);
            return A;
          }).catch(function(A) {
            return C && D && re(C, D), Promise.reject(A);
          }), D = { obsSet: v.obsSet, promise: E, subscribers: /* @__PURE__ */ new Set(), type: "query", req: v, dirty: !1 }, C ? C.push(D) : (C = [D], (P = P || (Tn["idb://".concat(a, "/").concat(u)] = { queries: { query: {}, count: {} }, objs: /* @__PURE__ */ new Map(), optimisticOps: [], unsignaledParts: {} })).queries.query[v.query.index.name || ""] = C)), fh(D, C, S, x), D.promise.then(function(A) {
            return { result: Wc(A.result, v, P == null ? void 0 : P.optimisticOps, p, D, k) };
          });
        } });
      } });
    } };
    function zi(s, a) {
      return new Proxy(s, { get: function(u, p, y) {
        return p === "db" ? a : Reflect.get(u, p, y);
      } });
    }
    var zt = (Fe.prototype.version = function(s) {
      if (isNaN(s) || s < 0.1)
        throw new Z.Type("Given version is not a positive number");
      if (s = Math.round(10 * s) / 10, this.idbdb || this._state.isBeingOpened)
        throw new Z.Schema("Cannot add version when database is open");
      this.verno = Math.max(this.verno, s);
      var a = this._versions, u = a.filter(function(p) {
        return p._cfg.version === s;
      })[0];
      return u || (u = new this.Version(s), a.push(u), a.sort(th), u.stores({}), this._state.autoSchema = !1, u);
    }, Fe.prototype._whenReady = function(s) {
      var a = this;
      return this.idbdb && (this._state.openComplete || ie.letThrough || this._vip) ? s() : new J(function(u, p) {
        if (a._state.openComplete)
          return p(new Z.DatabaseClosed(a._state.dbOpenError));
        if (!a._state.isBeingOpened) {
          if (!a._state.autoOpen)
            return void p(new Z.DatabaseClosed());
          a.open().catch(ce);
        }
        a._state.dbReadyPromise.then(u, p);
      }).then(s);
    }, Fe.prototype.use = function(s) {
      var a = s.stack, u = s.create, p = s.level, y = s.name;
      return y && this.unuse({ stack: a, name: y }), s = this._middlewares[a] || (this._middlewares[a] = []), s.push({ stack: a, create: u, level: p ?? 10, name: y }), s.sort(function(v, k) {
        return v.level - k.level;
      }), this;
    }, Fe.prototype.unuse = function(s) {
      var a = s.stack, u = s.name, p = s.create;
      return a && this._middlewares[a] && (this._middlewares[a] = this._middlewares[a].filter(function(y) {
        return p ? y.create !== p : !!u && y.name !== u;
      })), this;
    }, Fe.prototype.open = function() {
      var s = this;
      return On(cn, function() {
        return sh(s);
      });
    }, Fe.prototype._close = function() {
      this.on.close.fire(new CustomEvent("close"));
      var s = this._state, a = Gn.indexOf(this);
      if (0 <= a && Gn.splice(a, 1), this.idbdb) {
        try {
          this.idbdb.close();
        } catch {
        }
        this.idbdb = null;
      }
      s.isBeingOpened || (s.dbReadyPromise = new J(function(u) {
        s.dbReadyResolve = u;
      }), s.openCanceller = new J(function(u, p) {
        s.cancelOpen = p;
      }));
    }, Fe.prototype.close = function(u) {
      var a = (u === void 0 ? { disableAutoOpen: !0 } : u).disableAutoOpen, u = this._state;
      a ? (u.isBeingOpened && u.cancelOpen(new Z.DatabaseClosed()), this._close(), u.autoOpen = !1, u.dbOpenError = new Z.DatabaseClosed()) : (this._close(), u.autoOpen = this._options.autoOpen || u.isBeingOpened, u.openComplete = !1, u.dbOpenError = null);
    }, Fe.prototype.delete = function(s) {
      var a = this;
      s === void 0 && (s = { disableAutoOpen: !0 });
      var u = 0 < arguments.length && typeof arguments[0] != "object", p = this._state;
      return new J(function(y, v) {
        function k() {
          a.close(s);
          var S = a._deps.indexedDB.deleteDatabase(a.name);
          S.onsuccess = Me(function() {
            var x, O, D;
            x = a._deps, O = a.name, D = x.indexedDB, x = x.IDBKeyRange, xo(D) || O === Ri || Eo(D, x).delete(O).catch(ce), y();
          }), S.onerror = Ut(v), S.onblocked = a._fireOnBlocked;
        }
        if (u)
          throw new Z.InvalidArgument("Invalid closeOptions argument to db.delete()");
        p.isBeingOpened ? p.dbReadyPromise.then(k) : k();
      });
    }, Fe.prototype.backendDB = function() {
      return this.idbdb;
    }, Fe.prototype.isOpen = function() {
      return this.idbdb !== null;
    }, Fe.prototype.hasBeenClosed = function() {
      var s = this._state.dbOpenError;
      return s && s.name === "DatabaseClosed";
    }, Fe.prototype.hasFailed = function() {
      return this._state.dbOpenError !== null;
    }, Fe.prototype.dynamicallyOpened = function() {
      return this._state.autoSchema;
    }, Object.defineProperty(Fe.prototype, "tables", { get: function() {
      var s = this;
      return c(this._allTables).map(function(a) {
        return s._allTables[a];
      });
    }, enumerable: !1, configurable: !0 }), Fe.prototype.transaction = function() {
      var s = (function(a, u, p) {
        var y = arguments.length;
        if (y < 2)
          throw new Z.InvalidArgument("Too few arguments");
        for (var v = new Array(y - 1); --y; )
          v[y - 1] = arguments[y];
        return p = v.pop(), [a, De(v), p];
      }).apply(this, arguments);
      return this._transaction.apply(this, s);
    }, Fe.prototype._transaction = function(s, a, u) {
      var p = this, y = ie.trans;
      y && y.db === this && s.indexOf("!") === -1 || (y = null);
      var v, k, S = s.indexOf("?") !== -1;
      s = s.replace("!", "").replace("?", "");
      try {
        if (k = a.map(function(O) {
          if (O = O instanceof p.Table ? O.name : O, typeof O != "string")
            throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
          return O;
        }), s == "r" || s === ho)
          v = ho;
        else {
          if (s != "rw" && s != po)
            throw new Z.InvalidArgument("Invalid transaction mode: " + s);
          v = po;
        }
        if (y) {
          if (y.mode === ho && v === po) {
            if (!S)
              throw new Z.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
            y = null;
          }
          y && k.forEach(function(O) {
            if (y && y.storeNames.indexOf(O) === -1) {
              if (!S)
                throw new Z.SubTransaction("Table " + O + " not included in parent transaction.");
              y = null;
            }
          }), S && y && !y.active && (y = null);
        }
      } catch (O) {
        return y ? y._promise(null, function(D, E) {
          E(O);
        }) : $e(O);
      }
      var x = (function O(D, E, P, C, A) {
        return J.resolve().then(function() {
          var R = ie.transless || ie, T = D._createTransaction(E, P, D._dbSchema, C);
          if (T.explicit = !0, R = { trans: T, transless: R }, C)
            T.idbtrans = C.idbtrans;
          else
            try {
              T.create(), T.idbtrans._explicit = !0, D._state.PR1398_maxLoop = 3;
            } catch (M) {
              return M.name === st.InvalidState && D.isOpen() && 0 < --D._state.PR1398_maxLoop ? (console.warn("Dexie: Need to reopen db"), D.close({ disableAutoOpen: !1 }), D.open().then(function() {
                return O(D, E, P, null, A);
              })) : $e(M);
            }
          var U, N = ue(A);
          return N && Yn(), R = J.follow(function() {
            var M;
            (U = A.call(T, T)) && (N ? (M = un.bind(null, null), U.then(M, M)) : typeof U.next == "function" && typeof U.throw == "function" && (U = Ro(U)));
          }, R), (U && typeof U.then == "function" ? J.resolve(U).then(function(M) {
            return T.active ? M : $e(new Z.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
          }) : R.then(function() {
            return U;
          })).then(function(M) {
            return C && T._resolve(), T._completion.then(function() {
              return M;
            });
          }).catch(function(M) {
            return T._reject(M), $e(M);
          });
        });
      }).bind(null, this, v, k, y, u);
      return y ? y._promise(v, x, "lock") : ie.trans ? On(ie.transless, function() {
        return p._whenReady(x);
      }) : this._whenReady(x);
    }, Fe.prototype.table = function(s) {
      if (!g(this._allTables, s))
        throw new Z.InvalidTable("Table ".concat(s, " does not exist"));
      return this._allTables[s];
    }, Fe);
    function Fe(s, a) {
      var u = this;
      this._middlewares = {}, this.verno = 0;
      var p = Fe.dependencies;
      this._options = a = r({ addons: Fe.addons, autoOpen: !0, indexedDB: p.indexedDB, IDBKeyRange: p.IDBKeyRange, cache: "cloned" }, a), this._deps = { indexedDB: a.indexedDB, IDBKeyRange: a.IDBKeyRange }, p = a.addons, this._dbSchema = {}, this._versions = [], this._storeNames = [], this._allTables = {}, this.idbdb = null, this._novip = this;
      var y, v, k, S, x, O = { dbOpenError: null, isBeingOpened: !1, onReadyBeingFired: null, openComplete: !1, dbReadyResolve: ce, dbReadyPromise: null, cancelOpen: ce, openCanceller: null, autoSchema: !0, PR1398_maxLoop: 3, autoOpen: a.autoOpen };
      O.dbReadyPromise = new J(function(E) {
        O.dbReadyResolve = E;
      }), O.openCanceller = new J(function(E, P) {
        O.cancelOpen = P;
      }), this._state = O, this.name = s, this.on = Ir(this, "populate", "blocked", "versionchange", "close", { ready: [ro, ce] }), this.once = function(E, P) {
        var C = function() {
          for (var A = [], R = 0; R < arguments.length; R++)
            A[R] = arguments[R];
          u.on(E).unsubscribe(C), P.apply(u, A);
        };
        return u.on(E, C);
      }, this.on.ready.subscribe = L(this.on.ready.subscribe, function(E) {
        return function(P, C) {
          Fe.vip(function() {
            var A, R = u._state;
            R.openComplete ? (R.dbOpenError || J.resolve().then(P), C && E(P)) : R.onReadyBeingFired ? (R.onReadyBeingFired.push(P), C && E(P)) : (E(P), A = u, C || E(function T() {
              A.on.ready.unsubscribe(P), A.on.ready.unsubscribe(T);
            }));
          });
        };
      }), this.Collection = (y = this, Or(Yd.prototype, function(U, T) {
        this.db = y;
        var C = kc, A = null;
        if (T)
          try {
            C = T();
          } catch (N) {
            A = N;
          }
        var R = U._ctx, T = R.table, U = T.hook.reading.fire;
        this._ctx = { table: T, index: R.index, isPrimKey: !R.index || T.schema.primKey.keyPath && R.index === T.schema.primKey.name, range: C, keysOnly: !1, dir: "next", unique: "", algorithm: null, filter: null, replayFilter: null, justLimit: !0, isMatch: null, offset: 0, limit: 1 / 0, error: A, or: R.or, valueMapper: U !== _e ? U : null };
      })), this.Table = (v = this, Or(Cc.prototype, function(E, P, C) {
        this.db = v, this._tx = C, this.name = E, this.schema = P, this.hook = v._allTables[E] ? v._allTables[E].hook : Ir(null, { creating: [vt, ce], reading: [Ie, _e], updating: [Tt, ce], deleting: [En, ce] });
      })), this.Transaction = (k = this, Or(Xd.prototype, function(E, P, C, A, R) {
        var T = this;
        E !== "readonly" && P.forEach(function(U) {
          U = (U = C[U]) === null || U === void 0 ? void 0 : U.yProps, U && (P = P.concat(U.map(function(N) {
            return N.updatesTable;
          })));
        }), this.db = k, this.mode = E, this.storeNames = P, this.schema = C, this.chromeTransactionDurability = A, this.idbtrans = null, this.on = Ir(this, "complete", "error", "abort"), this.parent = R || null, this.active = !0, this._reculock = 0, this._blockedFuncs = [], this._resolve = null, this._reject = null, this._waitingFor = null, this._waitingQueue = null, this._spinCount = 0, this._completion = new J(function(U, N) {
          T._resolve = U, T._reject = N;
        }), this._completion.then(function() {
          T.active = !1, T.on.complete.fire();
        }, function(U) {
          var N = T.active;
          return T.active = !1, T.on.error.fire(U), T.parent ? T.parent._reject(U) : N && T.idbtrans && T.idbtrans.abort(), $e(U);
        });
      })), this.Version = (S = this, Or(ih.prototype, function(E) {
        this.db = S, this._cfg = { version: E, storesSource: null, dbschema: {}, tables: {}, contentUpgrade: null };
      })), this.WhereClause = (x = this, Or(Rc.prototype, function(E, P, C) {
        if (this.db = x, this._ctx = { table: E, index: P === ":id" ? null : P, or: C }, this._cmp = this._ascending = Se, this._descending = function(A, R) {
          return Se(R, A);
        }, this._max = function(A, R) {
          return 0 < Se(A, R) ? A : R;
        }, this._min = function(A, R) {
          return Se(A, R) < 0 ? A : R;
        }, this._IDBKeyRange = x._deps.IDBKeyRange, !this._IDBKeyRange)
          throw new Z.MissingAPI();
      })), this.on("versionchange", function(E) {
        0 < E.newVersion ? console.warn("Another connection wants to upgrade database '".concat(u.name, "'. Closing db now to resume the upgrade.")) : console.warn("Another connection wants to delete database '".concat(u.name, "'. Closing db now to resume the delete request.")), u.close({ disableAutoOpen: !1 });
      }), this.on("blocked", function(E) {
        !E.newVersion || E.newVersion < E.oldVersion ? console.warn("Dexie.delete('".concat(u.name, "') was blocked")) : console.warn("Upgrade '".concat(u.name, "' blocked by other connection holding version ").concat(E.oldVersion / 10));
      }), this._maxKey = Rr(a.IDBKeyRange), this._createTransaction = function(E, P, C, A) {
        return new u.Transaction(E, P, C, u._options.chromeTransactionDurability, A);
      }, this._fireOnBlocked = function(E) {
        u.on("blocked").fire(E), Gn.filter(function(P) {
          return P.name === u.name && P !== u && !P._state.vcFired;
        }).map(function(P) {
          return P.on("versionchange").fire(E);
        });
      }, this.use(ch), this.use(dh), this.use(lh), this.use(oh), this.use(ah);
      var D = new Proxy(this, { get: function(E, P, C) {
        if (P === "_vip")
          return !0;
        if (P === "table")
          return function(R) {
            return zi(u.table(R), D);
          };
        var A = Reflect.get(E, P, C);
        return A instanceof Cc ? zi(A, D) : P === "tables" ? A.map(function(R) {
          return zi(R, D);
        }) : P === "_createTransaction" ? function() {
          return zi(A.apply(this, arguments), D);
        } : A;
      } });
      this.vip = D, p.forEach(function(E) {
        return E(u);
      });
    }
    var Yi, Et = typeof Symbol < "u" && "observable" in Symbol ? Symbol.observable : "@@observable", hh = (Lo.prototype.subscribe = function(s, a, u) {
      return this._subscribe(s && typeof s != "function" ? s : { next: s, error: a, complete: u });
    }, Lo.prototype[Et] = function() {
      return this;
    }, Lo);
    function Lo(s) {
      this._subscribe = s;
    }
    try {
      Yi = { indexedDB: o.indexedDB || o.mozIndexedDB || o.webkitIndexedDB || o.msIndexedDB, IDBKeyRange: o.IDBKeyRange || o.webkitIDBKeyRange };
    } catch {
      Yi = { indexedDB: null, IDBKeyRange: null };
    }
    function zc(s) {
      var a, u = !1, p = new hh(function(y) {
        var v = ue(s), k, S = !1, x = {}, O = {}, D = { get closed() {
          return S;
        }, unsubscribe: function() {
          S || (S = !0, k && k.abort(), E && hn.storagemutated.unsubscribe(C));
        } };
        y.start && y.start(D);
        var E = !1, P = function() {
          return fo(A);
        }, C = function(R) {
          Vi(x, R), Oo(O, x) && P();
        }, A = function() {
          var R, T, U;
          !S && Yi.indexedDB && (x = {}, R = {}, k && k.abort(), k = new AbortController(), U = function(N) {
            var M = Hn();
            try {
              v && Yn();
              var K = ln(s, N);
              return K = v ? K.finally(un) : K;
            } finally {
              M && zn();
            }
          }(T = { subscr: R, signal: k.signal, requery: P, querier: s, trans: null }), Promise.resolve(U).then(function(N) {
            u = !0, a = N, S || T.signal.aborted || (x = {}, function(M) {
              for (var K in M)
                if (g(M, K))
                  return;
              return 1;
            }(O = R) || E || (hn(Tr, C), E = !0), fo(function() {
              return !S && y.next && y.next(N);
            }));
          }, function(N) {
            u = !1, ["DatabaseClosedError", "AbortError"].includes(N == null ? void 0 : N.name) || S || fo(function() {
              S || y.error && y.error(N);
            });
          }));
        };
        return setTimeout(P, 0), D;
      });
      return p.hasValue = function() {
        return u;
      }, p.getValue = function() {
        return a;
      }, p;
    }
    var Rn = zt;
    function No(s) {
      var a = pn;
      try {
        pn = !0, hn.storagemutated.fire(s), To(s, !0);
      } finally {
        pn = a;
      }
    }
    m(Rn, r(r({}, qe), { delete: function(s) {
      return new Rn(s, { addons: [] }).delete();
    }, exists: function(s) {
      return new Rn(s, { addons: [] }).open().then(function(a) {
        return a.close(), !0;
      }).catch("NoSuchDatabaseError", function() {
        return !1;
      });
    }, getDatabaseNames: function(s) {
      try {
        return a = Rn.dependencies, u = a.indexedDB, a = a.IDBKeyRange, (xo(u) ? Promise.resolve(u.databases()).then(function(p) {
          return p.map(function(y) {
            return y.name;
          }).filter(function(y) {
            return y !== Ri;
          });
        }) : Eo(u, a).toCollection().primaryKeys()).then(s);
      } catch {
        return $e(new Z.MissingAPI());
      }
      var a, u;
    }, defineClass: function() {
      return function(s) {
        d(this, s);
      };
    }, ignoreTransaction: function(s) {
      return ie.trans ? On(ie.transless, s) : s();
    }, vip: Co, async: function(s) {
      return function() {
        try {
          var a = Ro(s.apply(this, arguments));
          return a && typeof a.then == "function" ? a : J.resolve(a);
        } catch (u) {
          return $e(u);
        }
      };
    }, spawn: function(s, a, u) {
      try {
        var p = Ro(s.apply(u, a || []));
        return p && typeof p.then == "function" ? p : J.resolve(p);
      } catch (y) {
        return $e(y);
      }
    }, currentTransaction: { get: function() {
      return ie.trans || null;
    } }, waitFor: function(s, a) {
      return a = J.resolve(typeof s == "function" ? Rn.ignoreTransaction(s) : s).timeout(a || 6e4), ie.trans ? ie.trans.waitFor(a) : a;
    }, Promise: J, debug: { get: function() {
      return Rt;
    }, set: function(s) {
      yc(s);
    } }, derive: I, extend: d, props: m, override: L, Events: Ir, on: hn, liveQuery: zc, extendObservabilitySet: Vi, getByKeyPath: te, setByKeyPath: oe, delByKeyPath: function(s, a) {
      typeof a == "string" ? oe(s, a, void 0) : "length" in a && [].map.call(a, function(u) {
        oe(s, u, void 0);
      });
    }, shallowClone: je, deepClone: me, getObjectDiff: Po, cmp: Se, asap: se, minKey: -1 / 0, addons: [], connections: Gn, errnames: st, dependencies: Yi, cache: Tn, semVer: Pt, version: Pt.split(".").map(function(s) {
      return parseInt(s);
    }).reduce(function(s, a, u) {
      return s + a / Math.pow(10, 2 * u);
    }) })), Rn.maxKey = Rr(Rn.dependencies.IDBKeyRange), typeof dispatchEvent < "u" && typeof addEventListener < "u" && (hn(Tr, function(s) {
      pn || (s = new CustomEvent(mo, { detail: s }), pn = !0, dispatchEvent(s), pn = !1);
    }), addEventListener(mo, function(s) {
      s = s.detail, pn || No(s);
    }));
    var Zn, pn = !1, Yc = function() {
    };
    return typeof BroadcastChannel < "u" && ((Yc = function() {
      (Zn = new BroadcastChannel(mo)).onmessage = function(s) {
        return s.data && No(s.data);
      };
    })(), typeof Zn.unref == "function" && Zn.unref(), hn(Tr, function(s) {
      pn || Zn.postMessage(s);
    })), typeof addEventListener < "u" && (addEventListener("pagehide", function(s) {
      if (!zt.disableBfCache && s.persisted) {
        Rt && console.debug("Dexie: handling persisted pagehide"), Zn != null && Zn.close();
        for (var a = 0, u = Gn; a < u.length; a++)
          u[a].close({ disableAutoOpen: !1 });
      }
    }), addEventListener("pageshow", function(s) {
      !zt.disableBfCache && s.persisted && (Rt && console.debug("Dexie: handling persisted pageshow"), Yc(), No({ all: new ot(-1 / 0, [[]]) }));
    })), J.rejectionMapper = function(s, a) {
      return !s || s instanceof Ae || s instanceof TypeError || s instanceof SyntaxError || !s.name || !Le[s.name] ? s : (a = new Le[s.name](a || s.message, s), "stack" in s && w(a, "stack", { get: function() {
        return this.inner.stack;
      } }), a);
    }, yc(Rt), r(zt, Object.freeze({ __proto__: null, Dexie: zt, liveQuery: zc, Entity: Sc, cmp: Se, PropModification: Ar, replacePrefix: function(s, a) {
      return new Ar({ replacePrefix: [s, a] });
    }, add: function(s) {
      return new Ar({ add: s });
    }, remove: function(s) {
      return new Ar({ remove: s });
    }, default: zt, RangeSet: ot, mergeRanges: jr, rangesOverlap: Nc }), { default: zt }), zt;
  });
})(du);
var yh = du.exports;
const la = /* @__PURE__ */ ph(yh), Jc = Symbol.for("Dexie"), xe = globalThis[Jc] || (globalThis[Jc] = la);
if (la.semVer !== xe.semVer)
  throw new Error(`Two different versions of Dexie loaded in the same app: ${la.semVer} and ${xe.semVer}`);
const {
  liveQuery: vn,
  mergeRanges: mb,
  rangesOverlap: vb,
  RangeSet: gh,
  cmp: Ks,
  Entity: bb,
  PropModification: Xc,
  replacePrefix: wb,
  add: _b,
  remove: kb,
  DexieYProvider: Sb
} = xe;
var ua = function(t, e) {
  return ua = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(n, r) {
    n.__proto__ = r;
  } || function(n, r) {
    for (var i in r)
      Object.prototype.hasOwnProperty.call(r, i) && (n[i] = r[i]);
  }, ua(t, e);
};
function rn(t, e) {
  if (typeof e != "function" && e !== null)
    throw new TypeError("Class extends value " + String(e) + " is not a constructor or null");
  ua(t, e);
  function n() {
    this.constructor = t;
  }
  t.prototype = e === null ? Object.create(e) : (n.prototype = e.prototype, new n());
}
function mh(t, e, n, r) {
  function i(o) {
    return o instanceof n ? o : new n(function(c) {
      c(o);
    });
  }
  return new (n || (n = Promise))(function(o, c) {
    function l(f) {
      try {
        h(r.next(f));
      } catch (g) {
        c(g);
      }
    }
    function d(f) {
      try {
        h(r.throw(f));
      } catch (g) {
        c(g);
      }
    }
    function h(f) {
      f.done ? o(f.value) : i(f.value).then(l, d);
    }
    h((r = r.apply(t, e || [])).next());
  });
}
function hu(t, e) {
  var n = { label: 0, sent: function() {
    if (o[0] & 1)
      throw o[1];
    return o[1];
  }, trys: [], ops: [] }, r, i, o, c;
  return c = { next: l(0), throw: l(1), return: l(2) }, typeof Symbol == "function" && (c[Symbol.iterator] = function() {
    return this;
  }), c;
  function l(h) {
    return function(f) {
      return d([h, f]);
    };
  }
  function d(h) {
    if (r)
      throw new TypeError("Generator is already executing.");
    for (; n; )
      try {
        if (r = 1, i && (o = h[0] & 2 ? i.return : h[0] ? i.throw || ((o = i.return) && o.call(i), 0) : i.next) && !(o = o.call(i, h[1])).done)
          return o;
        switch (i = 0, o && (h = [h[0] & 2, o.value]), h[0]) {
          case 0:
          case 1:
            o = h;
            break;
          case 4:
            return n.label++, { value: h[1], done: !1 };
          case 5:
            n.label++, i = h[1], h = [0];
            continue;
          case 7:
            h = n.ops.pop(), n.trys.pop();
            continue;
          default:
            if (o = n.trys, !(o = o.length > 0 && o[o.length - 1]) && (h[0] === 6 || h[0] === 2)) {
              n = 0;
              continue;
            }
            if (h[0] === 3 && (!o || h[1] > o[0] && h[1] < o[3])) {
              n.label = h[1];
              break;
            }
            if (h[0] === 6 && n.label < o[1]) {
              n.label = o[1], o = h;
              break;
            }
            if (o && n.label < o[2]) {
              n.label = o[2], n.ops.push(h);
              break;
            }
            o[2] && n.ops.pop(), n.trys.pop();
            continue;
        }
        h = e.call(t, n);
      } catch (f) {
        h = [6, f], i = 0;
      } finally {
        r = o = 0;
      }
    if (h[0] & 5)
      throw h[1];
    return { value: h[0] ? h[1] : void 0, done: !0 };
  }
}
function cr(t) {
  var e = typeof Symbol == "function" && Symbol.iterator, n = e && t[e], r = 0;
  if (n)
    return n.call(t);
  if (t && typeof t.length == "number")
    return {
      next: function() {
        return t && r >= t.length && (t = void 0), { value: t && t[r++], done: !t };
      }
    };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function tn(t, e) {
  var n = typeof Symbol == "function" && t[Symbol.iterator];
  if (!n)
    return t;
  var r = n.call(t), i, o = [], c;
  try {
    for (; (e === void 0 || e-- > 0) && !(i = r.next()).done; )
      o.push(i.value);
  } catch (l) {
    c = { error: l };
  } finally {
    try {
      i && !i.done && (n = r.return) && n.call(r);
    } finally {
      if (c)
        throw c.error;
    }
  }
  return o;
}
function wn(t, e, n) {
  if (n || arguments.length === 2)
    for (var r = 0, i = e.length, o; r < i; r++)
      (o || !(r in e)) && (o || (o = Array.prototype.slice.call(e, 0, r)), o[r] = e[r]);
  return t.concat(o || Array.prototype.slice.call(e));
}
function rr(t) {
  return this instanceof rr ? (this.v = t, this) : new rr(t);
}
function vh(t, e, n) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var r = n.apply(t, e || []), i, o = [];
  return i = {}, c("next"), c("throw"), c("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function c(m) {
    r[m] && (i[m] = function(b) {
      return new Promise(function(w, I) {
        o.push([m, b, w, I]) > 1 || l(m, b);
      });
    });
  }
  function l(m, b) {
    try {
      d(r[m](b));
    } catch (w) {
      g(o[0][3], w);
    }
  }
  function d(m) {
    m.value instanceof rr ? Promise.resolve(m.value.v).then(h, f) : g(o[0][2], m);
  }
  function h(m) {
    l("next", m);
  }
  function f(m) {
    l("throw", m);
  }
  function g(m, b) {
    m(b), o.shift(), o.length && l(o[0][0], o[0][1]);
  }
}
function bh(t) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var e = t[Symbol.asyncIterator], n;
  return e ? e.call(t) : (t = typeof cr == "function" ? cr(t) : t[Symbol.iterator](), n = {}, r("next"), r("throw"), r("return"), n[Symbol.asyncIterator] = function() {
    return this;
  }, n);
  function r(o) {
    n[o] = t[o] && function(c) {
      return new Promise(function(l, d) {
        c = t[o](c), i(l, d, c.done, c.value);
      });
    };
  }
  function i(o, c, l, d) {
    Promise.resolve(d).then(function(h) {
      o({ value: h, done: l });
    }, c);
  }
}
function Te(t) {
  return typeof t == "function";
}
function Fa(t) {
  var e = function(r) {
    Error.call(r), r.stack = new Error().stack;
  }, n = t(e);
  return n.prototype = Object.create(Error.prototype), n.prototype.constructor = n, n;
}
var Ko = Fa(function(t) {
  return function(n) {
    t(this), this.message = n ? n.length + ` errors occurred during unsubscription:
` + n.map(function(r, i) {
      return i + 1 + ") " + r.toString();
    }).join(`
  `) : "", this.name = "UnsubscriptionError", this.errors = n;
  };
});
function gs(t, e) {
  if (t) {
    var n = t.indexOf(e);
    0 <= n && t.splice(n, 1);
  }
}
var gr = function() {
  function t(e) {
    this.initialTeardown = e, this.closed = !1, this._parentage = null, this._finalizers = null;
  }
  return t.prototype.unsubscribe = function() {
    var e, n, r, i, o;
    if (!this.closed) {
      this.closed = !0;
      var c = this._parentage;
      if (c)
        if (this._parentage = null, Array.isArray(c))
          try {
            for (var l = cr(c), d = l.next(); !d.done; d = l.next()) {
              var h = d.value;
              h.remove(this);
            }
          } catch (I) {
            e = { error: I };
          } finally {
            try {
              d && !d.done && (n = l.return) && n.call(l);
            } finally {
              if (e)
                throw e.error;
            }
          }
        else
          c.remove(this);
      var f = this.initialTeardown;
      if (Te(f))
        try {
          f();
        } catch (I) {
          o = I instanceof Ko ? I.errors : [I];
        }
      var g = this._finalizers;
      if (g) {
        this._finalizers = null;
        try {
          for (var m = cr(g), b = m.next(); !b.done; b = m.next()) {
            var w = b.value;
            try {
              Qc(w);
            } catch (I) {
              o = o ?? [], I instanceof Ko ? o = wn(wn([], tn(o)), tn(I.errors)) : o.push(I);
            }
          }
        } catch (I) {
          r = { error: I };
        } finally {
          try {
            b && !b.done && (i = m.return) && i.call(m);
          } finally {
            if (r)
              throw r.error;
          }
        }
      }
      if (o)
        throw new Ko(o);
    }
  }, t.prototype.add = function(e) {
    var n;
    if (e && e !== this)
      if (this.closed)
        Qc(e);
      else {
        if (e instanceof t) {
          if (e.closed || e._hasParent(this))
            return;
          e._addParent(this);
        }
        (this._finalizers = (n = this._finalizers) !== null && n !== void 0 ? n : []).push(e);
      }
  }, t.prototype._hasParent = function(e) {
    var n = this._parentage;
    return n === e || Array.isArray(n) && n.includes(e);
  }, t.prototype._addParent = function(e) {
    var n = this._parentage;
    this._parentage = Array.isArray(n) ? (n.push(e), n) : n ? [n, e] : e;
  }, t.prototype._removeParent = function(e) {
    var n = this._parentage;
    n === e ? this._parentage = null : Array.isArray(n) && gs(n, e);
  }, t.prototype.remove = function(e) {
    var n = this._finalizers;
    n && gs(n, e), e instanceof t && e._removeParent(this);
  }, t.EMPTY = function() {
    var e = new t();
    return e.closed = !0, e;
  }(), t;
}(), pu = gr.EMPTY;
function yu(t) {
  return t instanceof gr || t && "closed" in t && Te(t.remove) && Te(t.add) && Te(t.unsubscribe);
}
function Qc(t) {
  Te(t) ? t() : t.unsubscribe();
}
var gu = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1
}, fa = {
  setTimeout: function(t, e) {
    for (var n = [], r = 2; r < arguments.length; r++)
      n[r - 2] = arguments[r];
    var i = fa.delegate;
    return i != null && i.setTimeout ? i.setTimeout.apply(i, wn([t, e], tn(n))) : setTimeout.apply(void 0, wn([t, e], tn(n)));
  },
  clearTimeout: function(t) {
    var e = fa.delegate;
    return ((e == null ? void 0 : e.clearTimeout) || clearTimeout)(t);
  },
  delegate: void 0
};
function mu(t) {
  fa.setTimeout(function() {
    throw t;
  });
}
function da() {
}
function as(t) {
  t();
}
var qa = function(t) {
  rn(e, t);
  function e(n) {
    var r = t.call(this) || this;
    return r.isStopped = !1, n ? (r.destination = n, yu(n) && n.add(r)) : r.destination = Sh, r;
  }
  return e.create = function(n, r, i) {
    return new lr(n, r, i);
  }, e.prototype.next = function(n) {
    this.isStopped || this._next(n);
  }, e.prototype.error = function(n) {
    this.isStopped || (this.isStopped = !0, this._error(n));
  }, e.prototype.complete = function() {
    this.isStopped || (this.isStopped = !0, this._complete());
  }, e.prototype.unsubscribe = function() {
    this.closed || (this.isStopped = !0, t.prototype.unsubscribe.call(this), this.destination = null);
  }, e.prototype._next = function(n) {
    this.destination.next(n);
  }, e.prototype._error = function(n) {
    try {
      this.destination.error(n);
    } finally {
      this.unsubscribe();
    }
  }, e.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }, e;
}(gr), wh = Function.prototype.bind;
function Bo(t, e) {
  return wh.call(t, e);
}
var _h = function() {
  function t(e) {
    this.partialObserver = e;
  }
  return t.prototype.next = function(e) {
    var n = this.partialObserver;
    if (n.next)
      try {
        n.next(e);
      } catch (r) {
        Ji(r);
      }
  }, t.prototype.error = function(e) {
    var n = this.partialObserver;
    if (n.error)
      try {
        n.error(e);
      } catch (r) {
        Ji(r);
      }
    else
      Ji(e);
  }, t.prototype.complete = function() {
    var e = this.partialObserver;
    if (e.complete)
      try {
        e.complete();
      } catch (n) {
        Ji(n);
      }
  }, t;
}(), lr = function(t) {
  rn(e, t);
  function e(n, r, i) {
    var o = t.call(this) || this, c;
    if (Te(n) || !n)
      c = {
        next: n ?? void 0,
        error: r ?? void 0,
        complete: i ?? void 0
      };
    else {
      var l;
      o && gu.useDeprecatedNextContext ? (l = Object.create(n), l.unsubscribe = function() {
        return o.unsubscribe();
      }, c = {
        next: n.next && Bo(n.next, l),
        error: n.error && Bo(n.error, l),
        complete: n.complete && Bo(n.complete, l)
      }) : c = n;
    }
    return o.destination = new _h(c), o;
  }
  return e;
}(qa);
function Ji(t) {
  mu(t);
}
function kh(t) {
  throw t;
}
var Sh = {
  closed: !0,
  next: da,
  error: kh,
  complete: da
}, Va = function() {
  return typeof Symbol == "function" && Symbol.observable || "@@observable";
}();
function mr(t) {
  return t;
}
function Eh(t) {
  return t.length === 0 ? mr : t.length === 1 ? t[0] : function(n) {
    return t.reduce(function(r, i) {
      return i(r);
    }, n);
  };
}
var Ye = function() {
  function t(e) {
    e && (this._subscribe = e);
  }
  return t.prototype.lift = function(e) {
    var n = new t();
    return n.source = this, n.operator = e, n;
  }, t.prototype.subscribe = function(e, n, r) {
    var i = this, o = Ch(e) ? e : new lr(e, n, r);
    return as(function() {
      var c = i, l = c.operator, d = c.source;
      o.add(l ? l.call(o, d) : d ? i._subscribe(o) : i._trySubscribe(o));
    }), o;
  }, t.prototype._trySubscribe = function(e) {
    try {
      return this._subscribe(e);
    } catch (n) {
      e.error(n);
    }
  }, t.prototype.forEach = function(e, n) {
    var r = this;
    return n = Zc(n), new n(function(i, o) {
      var c = new lr({
        next: function(l) {
          try {
            e(l);
          } catch (d) {
            o(d), c.unsubscribe();
          }
        },
        error: o,
        complete: i
      });
      r.subscribe(c);
    });
  }, t.prototype._subscribe = function(e) {
    var n;
    return (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(e);
  }, t.prototype[Va] = function() {
    return this;
  }, t.prototype.pipe = function() {
    for (var e = [], n = 0; n < arguments.length; n++)
      e[n] = arguments[n];
    return Eh(e)(this);
  }, t.prototype.toPromise = function(e) {
    var n = this;
    return e = Zc(e), new e(function(r, i) {
      var o;
      n.subscribe(function(c) {
        return o = c;
      }, function(c) {
        return i(c);
      }, function() {
        return r(o);
      });
    });
  }, t.create = function(e) {
    return new t(e);
  }, t;
}();
function Zc(t) {
  var e;
  return (e = t ?? gu.Promise) !== null && e !== void 0 ? e : Promise;
}
function xh(t) {
  return t && Te(t.next) && Te(t.error) && Te(t.complete);
}
function Ch(t) {
  return t && t instanceof qa || xh(t) && yu(t);
}
function Ih(t) {
  return Te(t == null ? void 0 : t.lift);
}
function mt(t) {
  return function(e) {
    if (Ih(e))
      return e.lift(function(n) {
        try {
          return t(n, this);
        } catch (r) {
          this.error(r);
        }
      });
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
function gt(t, e, n, r, i) {
  return new Oh(t, e, n, r, i);
}
var Oh = function(t) {
  rn(e, t);
  function e(n, r, i, o, c, l) {
    var d = t.call(this, n) || this;
    return d.onFinalize = c, d.shouldUnsubscribe = l, d._next = r ? function(h) {
      try {
        r(h);
      } catch (f) {
        n.error(f);
      }
    } : t.prototype._next, d._error = o ? function(h) {
      try {
        o(h);
      } catch (f) {
        n.error(f);
      } finally {
        this.unsubscribe();
      }
    } : t.prototype._error, d._complete = i ? function() {
      try {
        i();
      } catch (h) {
        n.error(h);
      } finally {
        this.unsubscribe();
      }
    } : t.prototype._complete, d;
  }
  return e.prototype.unsubscribe = function() {
    var n;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var r = this.closed;
      t.prototype.unsubscribe.call(this), !r && ((n = this.onFinalize) === null || n === void 0 || n.call(this));
    }
  }, e;
}(qa), Ah = Fa(function(t) {
  return function() {
    t(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
  };
}), $n = function(t) {
  rn(e, t);
  function e() {
    var n = t.call(this) || this;
    return n.closed = !1, n.currentObservers = null, n.observers = [], n.isStopped = !1, n.hasError = !1, n.thrownError = null, n;
  }
  return e.prototype.lift = function(n) {
    var r = new el(this, this);
    return r.operator = n, r;
  }, e.prototype._throwIfClosed = function() {
    if (this.closed)
      throw new Ah();
  }, e.prototype.next = function(n) {
    var r = this;
    as(function() {
      var i, o;
      if (r._throwIfClosed(), !r.isStopped) {
        r.currentObservers || (r.currentObservers = Array.from(r.observers));
        try {
          for (var c = cr(r.currentObservers), l = c.next(); !l.done; l = c.next()) {
            var d = l.value;
            d.next(n);
          }
        } catch (h) {
          i = { error: h };
        } finally {
          try {
            l && !l.done && (o = c.return) && o.call(c);
          } finally {
            if (i)
              throw i.error;
          }
        }
      }
    });
  }, e.prototype.error = function(n) {
    var r = this;
    as(function() {
      if (r._throwIfClosed(), !r.isStopped) {
        r.hasError = r.isStopped = !0, r.thrownError = n;
        for (var i = r.observers; i.length; )
          i.shift().error(n);
      }
    });
  }, e.prototype.complete = function() {
    var n = this;
    as(function() {
      if (n._throwIfClosed(), !n.isStopped) {
        n.isStopped = !0;
        for (var r = n.observers; r.length; )
          r.shift().complete();
      }
    });
  }, e.prototype.unsubscribe = function() {
    this.isStopped = this.closed = !0, this.observers = this.currentObservers = null;
  }, Object.defineProperty(e.prototype, "observed", {
    get: function() {
      var n;
      return ((n = this.observers) === null || n === void 0 ? void 0 : n.length) > 0;
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype._trySubscribe = function(n) {
    return this._throwIfClosed(), t.prototype._trySubscribe.call(this, n);
  }, e.prototype._subscribe = function(n) {
    return this._throwIfClosed(), this._checkFinalizedStatuses(n), this._innerSubscribe(n);
  }, e.prototype._innerSubscribe = function(n) {
    var r = this, i = this, o = i.hasError, c = i.isStopped, l = i.observers;
    return o || c ? pu : (this.currentObservers = null, l.push(n), new gr(function() {
      r.currentObservers = null, gs(l, n);
    }));
  }, e.prototype._checkFinalizedStatuses = function(n) {
    var r = this, i = r.hasError, o = r.thrownError, c = r.isStopped;
    i ? n.error(o) : c && n.complete();
  }, e.prototype.asObservable = function() {
    var n = new Ye();
    return n.source = this, n;
  }, e.create = function(n, r) {
    return new el(n, r);
  }, e;
}(Ye), el = function(t) {
  rn(e, t);
  function e(n, r) {
    var i = t.call(this) || this;
    return i.destination = n, i.source = r, i;
  }
  return e.prototype.next = function(n) {
    var r, i;
    (i = (r = this.destination) === null || r === void 0 ? void 0 : r.next) === null || i === void 0 || i.call(r, n);
  }, e.prototype.error = function(n) {
    var r, i;
    (i = (r = this.destination) === null || r === void 0 ? void 0 : r.error) === null || i === void 0 || i.call(r, n);
  }, e.prototype.complete = function() {
    var n, r;
    (r = (n = this.destination) === null || n === void 0 ? void 0 : n.complete) === null || r === void 0 || r.call(n);
  }, e.prototype._subscribe = function(n) {
    var r, i;
    return (i = (r = this.source) === null || r === void 0 ? void 0 : r.subscribe(n)) !== null && i !== void 0 ? i : pu;
  }, e;
}($n), Dt = function(t) {
  rn(e, t);
  function e(n) {
    var r = t.call(this) || this;
    return r._value = n, r;
  }
  return Object.defineProperty(e.prototype, "value", {
    get: function() {
      return this.getValue();
    },
    enumerable: !1,
    configurable: !0
  }), e.prototype._subscribe = function(n) {
    var r = t.prototype._subscribe.call(this, n);
    return !r.closed && n.next(this._value), r;
  }, e.prototype.getValue = function() {
    var n = this, r = n.hasError, i = n.thrownError, o = n._value;
    if (r)
      throw i;
    return this._throwIfClosed(), o;
  }, e.prototype.next = function(n) {
    t.prototype.next.call(this, this._value = n);
  }, e;
}($n), vu = {
  now: function() {
    return (vu.delegate || Date).now();
  },
  delegate: void 0
}, Dh = function(t) {
  rn(e, t);
  function e(n, r) {
    return t.call(this) || this;
  }
  return e.prototype.schedule = function(n, r) {
    return this;
  }, e;
}(gr), ms = {
  setInterval: function(t, e) {
    for (var n = [], r = 2; r < arguments.length; r++)
      n[r - 2] = arguments[r];
    var i = ms.delegate;
    return i != null && i.setInterval ? i.setInterval.apply(i, wn([t, e], tn(n))) : setInterval.apply(void 0, wn([t, e], tn(n)));
  },
  clearInterval: function(t) {
    var e = ms.delegate;
    return ((e == null ? void 0 : e.clearInterval) || clearInterval)(t);
  },
  delegate: void 0
}, Th = function(t) {
  rn(e, t);
  function e(n, r) {
    var i = t.call(this, n, r) || this;
    return i.scheduler = n, i.work = r, i.pending = !1, i;
  }
  return e.prototype.schedule = function(n, r) {
    if (r === void 0 && (r = 0), this.closed)
      return this;
    this.state = n;
    var i = this.id, o = this.scheduler;
    return i != null && (this.id = this.recycleAsyncId(o, i, r)), this.pending = !0, this.delay = r, this.id = this.id || this.requestAsyncId(o, this.id, r), this;
  }, e.prototype.requestAsyncId = function(n, r, i) {
    return i === void 0 && (i = 0), ms.setInterval(n.flush.bind(n, this), i);
  }, e.prototype.recycleAsyncId = function(n, r, i) {
    if (i === void 0 && (i = 0), i != null && this.delay === i && this.pending === !1)
      return r;
    ms.clearInterval(r);
  }, e.prototype.execute = function(n, r) {
    if (this.closed)
      return new Error("executing a cancelled action");
    this.pending = !1;
    var i = this._execute(n, r);
    if (i)
      return i;
    this.pending === !1 && this.id != null && (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
  }, e.prototype._execute = function(n, r) {
    var i = !1, o;
    try {
      this.work(n);
    } catch (c) {
      i = !0, o = c || new Error("Scheduled action threw falsy error");
    }
    if (i)
      return this.unsubscribe(), o;
  }, e.prototype.unsubscribe = function() {
    if (!this.closed) {
      var n = this, r = n.id, i = n.scheduler, o = i.actions;
      this.work = this.state = this.scheduler = null, this.pending = !1, gs(o, this), r != null && (this.id = this.recycleAsyncId(i, r, null)), this.delay = null, t.prototype.unsubscribe.call(this);
    }
  }, e;
}(Dh), tl = function() {
  function t(e, n) {
    n === void 0 && (n = t.now), this.schedulerActionCtor = e, this.now = n;
  }
  return t.prototype.schedule = function(e, n, r) {
    return n === void 0 && (n = 0), new this.schedulerActionCtor(this, e).schedule(r, n);
  }, t.now = vu.now, t;
}(), Rh = function(t) {
  rn(e, t);
  function e(n, r) {
    r === void 0 && (r = tl.now);
    var i = t.call(this, n, r) || this;
    return i.actions = [], i._active = !1, i._scheduled = void 0, i;
  }
  return e.prototype.flush = function(n) {
    var r = this.actions;
    if (this._active) {
      r.push(n);
      return;
    }
    var i;
    this._active = !0;
    do
      if (i = n.execute(n.state, n.delay))
        break;
    while (n = r.shift());
    if (this._active = !1, i) {
      for (; n = r.shift(); )
        n.unsubscribe();
      throw i;
    }
  }, e;
}(tl), Wa = new Rh(Th), Ph = Wa, bu = new Ye(function(t) {
  return t.complete();
});
function wu(t) {
  return t && Te(t.schedule);
}
function Ha(t) {
  return t[t.length - 1];
}
function Uh(t) {
  return Te(Ha(t)) ? t.pop() : void 0;
}
function yi(t) {
  return wu(Ha(t)) ? t.pop() : void 0;
}
function jh(t, e) {
  return typeof Ha(t) == "number" ? t.pop() : e;
}
var za = function(t) {
  return t && typeof t.length == "number" && typeof t != "function";
};
function _u(t) {
  return Te(t == null ? void 0 : t.then);
}
function ku(t) {
  return Te(t[Va]);
}
function Su(t) {
  return Symbol.asyncIterator && Te(t == null ? void 0 : t[Symbol.asyncIterator]);
}
function Eu(t) {
  return new TypeError("You provided " + (t !== null && typeof t == "object" ? "an invalid object" : "'" + t + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
function Lh() {
  return typeof Symbol != "function" || !Symbol.iterator ? "@@iterator" : Symbol.iterator;
}
var xu = Lh();
function Cu(t) {
  return Te(t == null ? void 0 : t[xu]);
}
function Iu(t) {
  return vh(this, arguments, function() {
    var n, r, i, o;
    return hu(this, function(c) {
      switch (c.label) {
        case 0:
          n = t.getReader(), c.label = 1;
        case 1:
          c.trys.push([1, , 9, 10]), c.label = 2;
        case 2:
          return [4, rr(n.read())];
        case 3:
          return r = c.sent(), i = r.value, o = r.done, o ? [4, rr(void 0)] : [3, 5];
        case 4:
          return [2, c.sent()];
        case 5:
          return [4, rr(i)];
        case 6:
          return [4, c.sent()];
        case 7:
          return c.sent(), [3, 2];
        case 8:
          return [3, 10];
        case 9:
          return n.releaseLock(), [7];
        case 10:
          return [2];
      }
    });
  });
}
function Ou(t) {
  return Te(t == null ? void 0 : t.getReader);
}
function Wt(t) {
  if (t instanceof Ye)
    return t;
  if (t != null) {
    if (ku(t))
      return Nh(t);
    if (za(t))
      return Mh(t);
    if (_u(t))
      return Kh(t);
    if (Su(t))
      return Au(t);
    if (Cu(t))
      return Bh(t);
    if (Ou(t))
      return $h(t);
  }
  throw Eu(t);
}
function Nh(t) {
  return new Ye(function(e) {
    var n = t[Va]();
    if (Te(n.subscribe))
      return n.subscribe(e);
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function Mh(t) {
  return new Ye(function(e) {
    for (var n = 0; n < t.length && !e.closed; n++)
      e.next(t[n]);
    e.complete();
  });
}
function Kh(t) {
  return new Ye(function(e) {
    t.then(function(n) {
      e.closed || (e.next(n), e.complete());
    }, function(n) {
      return e.error(n);
    }).then(null, mu);
  });
}
function Bh(t) {
  return new Ye(function(e) {
    var n, r;
    try {
      for (var i = cr(t), o = i.next(); !o.done; o = i.next()) {
        var c = o.value;
        if (e.next(c), e.closed)
          return;
      }
    } catch (l) {
      n = { error: l };
    } finally {
      try {
        o && !o.done && (r = i.return) && r.call(i);
      } finally {
        if (n)
          throw n.error;
      }
    }
    e.complete();
  });
}
function Au(t) {
  return new Ye(function(e) {
    Fh(t, e).catch(function(n) {
      return e.error(n);
    });
  });
}
function $h(t) {
  return Au(Iu(t));
}
function Fh(t, e) {
  var n, r, i, o;
  return mh(this, void 0, void 0, function() {
    var c, l;
    return hu(this, function(d) {
      switch (d.label) {
        case 0:
          d.trys.push([0, 5, 6, 11]), n = bh(t), d.label = 1;
        case 1:
          return [4, n.next()];
        case 2:
          if (r = d.sent(), !!r.done)
            return [3, 4];
          if (c = r.value, e.next(c), e.closed)
            return [2];
          d.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          return l = d.sent(), i = { error: l }, [3, 11];
        case 6:
          return d.trys.push([6, , 9, 10]), r && !r.done && (o = n.return) ? [4, o.call(n)] : [3, 8];
        case 7:
          d.sent(), d.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (i)
            throw i.error;
          return [7];
        case 10:
          return [7];
        case 11:
          return e.complete(), [2];
      }
    });
  });
}
function Qt(t, e, n, r, i) {
  r === void 0 && (r = 0), i === void 0 && (i = !1);
  var o = e.schedule(function() {
    n(), i ? t.add(this.schedule(null, r)) : this.unsubscribe();
  }, r);
  if (t.add(o), !i)
    return o;
}
function Du(t, e) {
  return e === void 0 && (e = 0), mt(function(n, r) {
    n.subscribe(gt(r, function(i) {
      return Qt(r, t, function() {
        return r.next(i);
      }, e);
    }, function() {
      return Qt(r, t, function() {
        return r.complete();
      }, e);
    }, function(i) {
      return Qt(r, t, function() {
        return r.error(i);
      }, e);
    }));
  });
}
function Tu(t, e) {
  return e === void 0 && (e = 0), mt(function(n, r) {
    r.add(t.schedule(function() {
      return n.subscribe(r);
    }, e));
  });
}
function qh(t, e) {
  return Wt(t).pipe(Tu(e), Du(e));
}
function Vh(t, e) {
  return Wt(t).pipe(Tu(e), Du(e));
}
function Wh(t, e) {
  return new Ye(function(n) {
    var r = 0;
    return e.schedule(function() {
      r === t.length ? n.complete() : (n.next(t[r++]), n.closed || this.schedule());
    });
  });
}
function Hh(t, e) {
  return new Ye(function(n) {
    var r;
    return Qt(n, e, function() {
      r = t[xu](), Qt(n, e, function() {
        var i, o, c;
        try {
          i = r.next(), o = i.value, c = i.done;
        } catch (l) {
          n.error(l);
          return;
        }
        c ? n.complete() : n.next(o);
      }, 0, !0);
    }), function() {
      return Te(r == null ? void 0 : r.return) && r.return();
    };
  });
}
function Ru(t, e) {
  if (!t)
    throw new Error("Iterable cannot be null");
  return new Ye(function(n) {
    Qt(n, e, function() {
      var r = t[Symbol.asyncIterator]();
      Qt(n, e, function() {
        r.next().then(function(i) {
          i.done ? n.complete() : n.next(i.value);
        });
      }, 0, !0);
    });
  });
}
function zh(t, e) {
  return Ru(Iu(t), e);
}
function Yh(t, e) {
  if (t != null) {
    if (ku(t))
      return qh(t, e);
    if (za(t))
      return Wh(t, e);
    if (_u(t))
      return Vh(t, e);
    if (Su(t))
      return Ru(t, e);
    if (Cu(t))
      return Hh(t, e);
    if (Ou(t))
      return zh(t, e);
  }
  throw Eu(t);
}
function kt(t, e) {
  return e ? Yh(t, e) : Wt(t);
}
function Zt() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  var n = yi(t);
  return kt(t, n);
}
function nl(t, e) {
  var n = Te(t) ? t : function() {
    return t;
  }, r = function(i) {
    return i.error(n());
  };
  return new Ye(e ? function(i) {
    return e.schedule(r, 0, i);
  } : r);
}
var Gh = Fa(function(t) {
  return function() {
    t(this), this.name = "EmptyError", this.message = "no elements in sequence";
  };
});
function Ln(t, e) {
  var n = typeof e == "object";
  return new Promise(function(r, i) {
    var o = new lr({
      next: function(c) {
        r(c), o.unsubscribe();
      },
      error: i,
      complete: function() {
        n ? r(e.defaultValue) : i(new Gh());
      }
    });
    t.subscribe(o);
  });
}
function Jh(t) {
  return t instanceof Date && !isNaN(t);
}
function _t(t, e) {
  return mt(function(n, r) {
    var i = 0;
    n.subscribe(gt(r, function(o) {
      r.next(t.call(e, o, i++));
    }));
  });
}
var Xh = Array.isArray;
function Qh(t, e) {
  return Xh(e) ? t.apply(void 0, wn([], tn(e))) : t(e);
}
function Pu(t) {
  return _t(function(e) {
    return Qh(t, e);
  });
}
var Zh = Array.isArray, ep = Object.getPrototypeOf, tp = Object.prototype, np = Object.keys;
function rp(t) {
  if (t.length === 1) {
    var e = t[0];
    if (Zh(e))
      return { args: e, keys: null };
    if (ip(e)) {
      var n = np(e);
      return {
        args: n.map(function(r) {
          return e[r];
        }),
        keys: n
      };
    }
  }
  return { args: t, keys: null };
}
function ip(t) {
  return t && typeof t == "object" && ep(t) === tp;
}
function sp(t, e) {
  return t.reduce(function(n, r, i) {
    return n[r] = e[i], n;
  }, {});
}
function ti() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  var n = yi(t), r = Uh(t), i = rp(t), o = i.args, c = i.keys;
  if (o.length === 0)
    return kt([], n);
  var l = new Ye(op(o, n, c ? function(d) {
    return sp(c, d);
  } : mr));
  return r ? l.pipe(Pu(r)) : l;
}
function op(t, e, n) {
  return n === void 0 && (n = mr), function(r) {
    rl(e, function() {
      for (var i = t.length, o = new Array(i), c = i, l = i, d = function(f) {
        rl(e, function() {
          var g = kt(t[f], e), m = !1;
          g.subscribe(gt(r, function(b) {
            o[f] = b, m || (m = !0, l--), l || r.next(n(o.slice()));
          }, function() {
            --c || r.complete();
          }));
        }, r);
      }, h = 0; h < i; h++)
        d(h);
    }, r);
  };
}
function rl(t, e, n) {
  t ? Qt(n, t, e) : e();
}
function ap(t, e, n, r, i, o, c, l) {
  var d = [], h = 0, f = 0, g = !1, m = function() {
    g && !d.length && !h && e.complete();
  }, b = function(I) {
    return h < r ? w(I) : d.push(I);
  }, w = function(I) {
    o && e.next(I), h++;
    var j = !1;
    Wt(n(I, f++)).subscribe(gt(e, function($) {
      i == null || i($), o ? b($) : e.next($);
    }, function() {
      j = !0;
    }, void 0, function() {
      if (j)
        try {
          h--;
          for (var $ = function() {
            var B = d.shift();
            c ? Qt(e, c, function() {
              return w(B);
            }) : w(B);
          }; d.length && h < r; )
            $();
          m();
        } catch (B) {
          e.error(B);
        }
    }));
  };
  return t.subscribe(gt(e, b, function() {
    g = !0, m();
  })), function() {
    l == null || l();
  };
}
function gi(t, e, n) {
  return n === void 0 && (n = 1 / 0), Te(e) ? gi(function(r, i) {
    return _t(function(o, c) {
      return e(r, o, i, c);
    })(Wt(t(r, i)));
  }, n) : (typeof e == "number" && (n = e), mt(function(r, i) {
    return ap(r, i, t, n);
  }));
}
function Uu(t) {
  return t === void 0 && (t = 1 / 0), gi(mr, t);
}
function cp() {
  return Uu(1);
}
function ha() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  return cp()(kt(t, yi(t)));
}
var lp = ["addListener", "removeListener"], up = ["addEventListener", "removeEventListener"], fp = ["on", "off"];
function Kt(t, e, n, r) {
  if (Te(n) && (r = n, n = void 0), r)
    return Kt(t, e, n).pipe(Pu(r));
  var i = tn(pp(t) ? up.map(function(l) {
    return function(d) {
      return t[l](e, d, n);
    };
  }) : dp(t) ? lp.map(il(t, e)) : hp(t) ? fp.map(il(t, e)) : [], 2), o = i[0], c = i[1];
  if (!o && za(t))
    return gi(function(l) {
      return Kt(l, e, n);
    })(Wt(t));
  if (!o)
    throw new TypeError("Invalid event target");
  return new Ye(function(l) {
    var d = function() {
      for (var h = [], f = 0; f < arguments.length; f++)
        h[f] = arguments[f];
      return l.next(1 < h.length ? h : h[0]);
    };
    return o(d), function() {
      return c(d);
    };
  });
}
function il(t, e) {
  return function(n) {
    return function(r) {
      return t[n](e, r);
    };
  };
}
function dp(t) {
  return Te(t.addListener) && Te(t.removeListener);
}
function hp(t) {
  return Te(t.on) && Te(t.off);
}
function pp(t) {
  return Te(t.addEventListener) && Te(t.removeEventListener);
}
function ju(t, e, n) {
  t === void 0 && (t = 0), n === void 0 && (n = Ph);
  var r = -1;
  return e != null && (wu(e) ? n = e : r = e), new Ye(function(i) {
    var o = Jh(t) ? +t - n.now() : t;
    o < 0 && (o = 0);
    var c = 0;
    return n.schedule(function() {
      i.closed || (i.next(c++), 0 <= r ? this.schedule(void 0, r) : i.complete());
    }, o);
  });
}
function Bs() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  var n = yi(t), r = jh(t, 1 / 0), i = t;
  return i.length ? i.length === 1 ? Wt(i[0]) : Uu(r)(kt(i, n)) : bu;
}
function Ct(t, e) {
  return mt(function(n, r) {
    var i = 0;
    n.subscribe(gt(r, function(o) {
      return t.call(e, o, i++) && r.next(o);
    }));
  });
}
function pa(t) {
  return mt(function(e, n) {
    var r = null, i = !1, o;
    r = e.subscribe(gt(n, void 0, void 0, function(c) {
      o = Wt(t(c, pa(t)(e))), r ? (r.unsubscribe(), r = null, o.subscribe(n)) : i = !0;
    })), i && (r.unsubscribe(), r = null, o.subscribe(n));
  });
}
function sl(t, e) {
  return e === void 0 && (e = Wa), mt(function(n, r) {
    var i = null, o = null, c = null, l = function() {
      if (i) {
        i.unsubscribe(), i = null;
        var h = o;
        o = null, r.next(h);
      }
    };
    function d() {
      var h = c + t, f = e.now();
      if (f < h) {
        i = this.schedule(void 0, h - f), r.add(i);
        return;
      }
      l();
    }
    n.subscribe(gt(r, function(h) {
      o = h, c = e.now(), i || (i = e.schedule(d, t), r.add(i));
    }, function() {
      l(), r.complete();
    }, void 0, function() {
      o = i = null;
    }));
  });
}
function Un(t) {
  return t <= 0 ? function() {
    return bu;
  } : mt(function(e, n) {
    var r = 0;
    e.subscribe(gt(n, function(i) {
      ++r <= t && (n.next(i), t <= r && n.complete());
    }));
  });
}
function yp() {
  return mt(function(t, e) {
    t.subscribe(gt(e, da));
  });
}
function gp(t) {
  return _t(function() {
    return t;
  });
}
function Lu(t, e) {
  return e ? function(n) {
    return ha(e.pipe(Un(1), yp()), n.pipe(Lu(t)));
  } : gi(function(n, r) {
    return t(n, r).pipe(Un(1), gp(n));
  });
}
function Nu(t, e) {
  e === void 0 && (e = Wa);
  var n = ju(t, e);
  return Lu(function() {
    return n;
  });
}
function Mu(t, e) {
  return e === void 0 && (e = mr), t = t ?? mp, mt(function(n, r) {
    var i, o = !0;
    n.subscribe(gt(r, function(c) {
      var l = e(c);
      (o || !t(i, l)) && (o = !1, i = l, r.next(c));
    }));
  });
}
function mp(t, e) {
  return t === e;
}
function vp(t) {
  t === void 0 && (t = {});
  var e = t.connector, n = e === void 0 ? function() {
    return new $n();
  } : e, r = t.resetOnError, i = r === void 0 ? !0 : r, o = t.resetOnComplete, c = o === void 0 ? !0 : o, l = t.resetOnRefCountZero, d = l === void 0 ? !0 : l;
  return function(h) {
    var f, g, m, b = 0, w = !1, I = !1, j = function() {
      g == null || g.unsubscribe(), g = void 0;
    }, $ = function() {
      j(), f = m = void 0, w = I = !1;
    }, B = function() {
      var L = f;
      $(), L == null || L.unsubscribe();
    };
    return mt(function(L, Q) {
      b++, !I && !w && j();
      var se = m = m ?? n();
      Q.add(function() {
        b--, b === 0 && !I && !w && (g = $o(B, d));
      }), se.subscribe(Q), !f && b > 0 && (f = new lr({
        next: function(te) {
          return se.next(te);
        },
        error: function(te) {
          I = !0, j(), g = $o($, i, te), se.error(te);
        },
        complete: function() {
          w = !0, j(), g = $o($, c), se.complete();
        }
      }), Wt(L).subscribe(f));
    })(h);
  };
}
function $o(t, e) {
  for (var n = [], r = 2; r < arguments.length; r++)
    n[r - 2] = arguments[r];
  if (e === !0) {
    t();
    return;
  }
  if (e !== !1) {
    var i = new lr({
      next: function() {
        i.unsubscribe(), t();
      }
    });
    return e.apply(void 0, wn([], tn(n))).subscribe(i);
  }
}
function ol(t) {
  return Ct(function(e, n) {
    return t <= n;
  });
}
function Ku() {
  for (var t = [], e = 0; e < arguments.length; e++)
    t[e] = arguments[e];
  var n = yi(t);
  return mt(function(r, i) {
    (n ? ha(t, r, n) : ha(t, r)).subscribe(i);
  });
}
function lt(t, e) {
  return mt(function(n, r) {
    var i = null, o = 0, c = !1, l = function() {
      return c && !i && r.complete();
    };
    n.subscribe(gt(r, function(d) {
      i == null || i.unsubscribe();
      var h = 0, f = o++;
      Wt(t(d, f)).subscribe(i = gt(r, function(g) {
        return r.next(e ? e(d, g, f, h++) : g);
      }, function() {
        i = null, l();
      }));
    }, function() {
      c = !0, l();
    }));
  });
}
function ya(t, e, n) {
  var r = Te(t) || e || n ? { next: t, error: e, complete: n } : t;
  return r ? mt(function(i, o) {
    var c;
    (c = r.subscribe) === null || c === void 0 || c.call(r);
    var l = !0;
    i.subscribe(gt(o, function(d) {
      var h;
      (h = r.next) === null || h === void 0 || h.call(r, d), o.next(d);
    }, function() {
      var d;
      l = !1, (d = r.complete) === null || d === void 0 || d.call(r), o.complete();
    }, function(d) {
      var h;
      l = !1, (h = r.error) === null || h === void 0 || h.call(r, d), o.error(d);
    }, function() {
      var d, h;
      l && ((d = r.unsubscribe) === null || d === void 0 || d.call(r)), (h = r.finalize) === null || h === void 0 || h.call(r);
    }));
  }) : mr;
}
const vs = Math.floor, bp = Math.abs, wp = (t, e) => t < e ? t : e, Bu = (t, e) => t > e ? t : e, _p = (t) => t !== 0 ? t < 0 : 1 / t < 0, $u = 64, ur = 128, ga = 63, Mn = 127, kp = 2147483647, Fu = Number.MAX_SAFE_INTEGER, Sp = Number.isInteger || ((t) => typeof t == "number" && isFinite(t) && vs(t) === t), Ep = Array.isArray, xp = (t) => {
  const e = unescape(encodeURIComponent(t)), n = e.length, r = new Uint8Array(n);
  for (let i = 0; i < n; i++)
    r[i] = /** @type {number} */
    e.codePointAt(i);
  return r;
}, ni = (
  /** @type {TextEncoder} */
  typeof TextEncoder < "u" ? new TextEncoder() : null
), Cp = (t) => ni.encode(t), Ip = ni ? Cp : xp;
let Vr = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
Vr && Vr.decode(new Uint8Array()).length === 1 && (Vr = null);
let Op = class {
  constructor() {
    this.cpos = 0, this.cbuf = new Uint8Array(100), this.bufs = [];
  }
};
const Ap = (t) => {
  let e = t.cpos;
  for (let n = 0; n < t.bufs.length; n++)
    e += t.bufs[n].length;
  return e;
}, Dp = (t) => {
  const e = new Uint8Array(Ap(t));
  let n = 0;
  for (let r = 0; r < t.bufs.length; r++) {
    const i = t.bufs[r];
    e.set(i, n), n += i.length;
  }
  return e.set(new Uint8Array(t.cbuf.buffer, 0, t.cpos), n), e;
}, Tp = (t, e) => {
  const n = t.cbuf.length;
  n - t.cpos < e && (t.bufs.push(new Uint8Array(t.cbuf.buffer, 0, t.cpos)), t.cbuf = new Uint8Array(Bu(n, e) * 2), t.cpos = 0);
}, tt = (t, e) => {
  const n = t.cbuf.length;
  t.cpos === n && (t.bufs.push(t.cbuf), t.cbuf = new Uint8Array(n * 2), t.cpos = 0), t.cbuf[t.cpos++] = e;
}, ri = (t, e) => {
  for (; e > Mn; )
    tt(t, ur | Mn & e), e = vs(e / 128);
  tt(t, Mn & e);
}, Rp = (t, e) => {
  const n = _p(e);
  for (n && (e = -e), tt(t, (e > ga ? ur : 0) | (n ? $u : 0) | ga & e), e = vs(e / 64); e > 0; )
    tt(t, (e > Mn ? ur : 0) | Mn & e), e = vs(e / 128);
}, ma = new Uint8Array(3e4), Pp = ma.length / 3, Up = (t, e) => {
  if (e.length < Pp) {
    const n = ni.encodeInto(e, ma).written || 0;
    ri(t, n);
    for (let r = 0; r < n; r++)
      tt(t, ma[r]);
  } else
    nr(t, Ip(e));
}, jp = (t, e) => {
  const n = unescape(encodeURIComponent(e)), r = n.length;
  ri(t, r);
  for (let i = 0; i < r; i++)
    tt(
      t,
      /** @type {number} */
      n.codePointAt(i)
    );
}, jn = ni && /** @type {any} */
ni.encodeInto ? Up : jp, Lp = (t, e) => {
  const n = t.cbuf.length, r = t.cpos, i = wp(n - r, e.length), o = e.length - i;
  t.cbuf.set(e.subarray(0, i), r), t.cpos += i, o > 0 && (t.bufs.push(t.cbuf), t.cbuf = new Uint8Array(Bu(n * 2, o)), t.cbuf.set(e.subarray(i)), t.cpos = o);
}, nr = (t, e) => {
  ri(t, e.byteLength), Lp(t, e);
}, $s = (t, e) => {
  Tp(t, e);
  const n = new DataView(t.cbuf.buffer, t.cpos, e);
  return t.cpos += e, n;
}, Np = (t, e) => $s(t, 4).setFloat32(0, e, !1), Mp = (t, e) => $s(t, 8).setFloat64(0, e, !1), Kp = (t, e) => (
  /** @type {any} */
  $s(t, 8).setBigInt64(0, e, !1)
), al = (t, e) => (
  /** @type {any} */
  $s(t, 8).setBigUint64(0, e, !1)
), cl = new DataView(new ArrayBuffer(4)), Bp = (t) => (cl.setFloat32(0, t), cl.getFloat32(0) === t), Wr = (t, e) => {
  switch (typeof e) {
    case "string":
      tt(t, 119), jn(t, e);
      break;
    case "number":
      Sp(e) && bp(e) <= kp ? (tt(t, 125), Rp(t, e)) : Bp(e) ? (tt(t, 124), Np(t, e)) : (tt(t, 123), Mp(t, e));
      break;
    case "bigint":
      tt(t, 122), Kp(t, e);
      break;
    case "object":
      if (e === null)
        tt(t, 126);
      else if (Ep(e)) {
        tt(t, 117), ri(t, e.length);
        for (let n = 0; n < e.length; n++)
          Wr(t, e[n]);
      } else if (e instanceof Uint8Array)
        tt(t, 116), nr(t, e);
      else {
        tt(t, 118);
        const n = Object.keys(e);
        ri(t, n.length);
        for (let r = 0; r < n.length; r++) {
          const i = n[r];
          jn(t, i), Wr(t, e[i]);
        }
      }
      break;
    case "boolean":
      tt(t, e ? 120 : 121);
      break;
    default:
      tt(t, 127);
  }
}, qu = (t) => new Error(t), Vu = qu("Unexpected end of array"), Wu = qu("Integer out of Range");
let Hu = class {
  /**
   * @param {Uint8Array} uint8Array Binary data to decode
   */
  constructor(e) {
    this.arr = e, this.pos = 0;
  }
};
const $p = (t) => t.pos !== t.arr.length, Fp = (t, e) => {
  const n = new Uint8Array(t.arr.buffer, t.pos + t.arr.byteOffset, e);
  return t.pos += e, n;
}, Nn = (t) => Fp(t, ws(t)), bs = (t) => t.arr[t.pos++], ws = (t) => {
  let e = 0, n = 1;
  const r = t.arr.length;
  for (; t.pos < r; ) {
    const i = t.arr[t.pos++];
    if (e = e + (i & Mn) * n, n *= 128, i < ur)
      return e;
    if (e > Fu)
      throw Wu;
  }
  throw Vu;
}, qp = (t) => {
  let e = t.arr[t.pos++], n = e & ga, r = 64;
  const i = (e & $u) > 0 ? -1 : 1;
  if (!(e & ur))
    return i * n;
  const o = t.arr.length;
  for (; t.pos < o; ) {
    if (e = t.arr[t.pos++], n = n + (e & Mn) * r, r *= 128, e < ur)
      return i * n;
    if (n > Fu)
      throw Wu;
  }
  throw Vu;
}, Vp = (t) => {
  let e = ws(t);
  if (e === 0)
    return "";
  {
    let n = String.fromCodePoint(bs(t));
    if (--e < 100)
      for (; e--; )
        n += String.fromCodePoint(bs(t));
    else
      for (; e > 0; ) {
        const r = e < 1e4 ? e : 1e4, i = t.arr.subarray(t.pos, t.pos + r);
        t.pos += r, n += String.fromCodePoint.apply(
          null,
          /** @type {any} */
          i
        ), e -= r;
      }
    return decodeURIComponent(escape(n));
  }
}, Wp = (t) => (
  /** @type any */
  Vr.decode(Nn(t))
), Bt = Vr ? Wp : Vp, Fs = (t, e) => {
  const n = new DataView(t.arr.buffer, t.arr.byteOffset + t.pos, e);
  return t.pos += e, n;
}, Hp = (t) => Fs(t, 4).getFloat32(0, !1), zp = (t) => Fs(t, 8).getFloat64(0, !1), Yp = (t) => (
  /** @type {any} */
  Fs(t, 8).getBigInt64(0, !1)
), ll = (t) => (
  /** @type {any} */
  Fs(t, 8).getBigUint64(0, !1)
), Gp = [
  (t) => {
  },
  // CASE 127: undefined
  (t) => null,
  // CASE 126: null
  qp,
  // CASE 125: integer
  Hp,
  // CASE 124: float32
  zp,
  // CASE 123: float64
  Yp,
  // CASE 122: bigint
  (t) => !1,
  // CASE 121: boolean (false)
  (t) => !0,
  // CASE 120: boolean (true)
  Bt,
  // CASE 119: string
  (t) => {
    const e = ws(t), n = {};
    for (let r = 0; r < e; r++) {
      const i = Bt(t);
      n[i] = ir(t);
    }
    return n;
  },
  (t) => {
    const e = ws(t), n = [];
    for (let r = 0; r < e; r++)
      n.push(ir(t));
    return n;
  },
  Nn
  // CASE 116: Uint8Array
], ir = (t) => Gp[127 - bs(t)](t), pt = () => /* @__PURE__ */ new Map(), va = (t) => {
  const e = pt();
  return t.forEach((n, r) => {
    e.set(r, n);
  }), e;
}, sn = (t, e, n) => {
  let r = t.get(e);
  return r === void 0 && t.set(e, r = n()), r;
}, Jp = (t, e) => {
  const n = [];
  for (const [r, i] of t)
    n.push(e(i, r));
  return n;
}, Xp = (t, e) => {
  for (const [n, r] of t)
    if (e(r, n))
      return !0;
  return !1;
}, Fn = () => /* @__PURE__ */ new Set(), Fo = (t) => t[t.length - 1], Qp = (t, e) => {
  for (let n = 0; n < e.length; n++)
    t.push(e[n]);
}, _n = Array.from, Zp = Array.isArray;
class ey {
  constructor() {
    this._observers = pt();
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  on(e, n) {
    return sn(
      this._observers,
      /** @type {string} */
      e,
      Fn
    ).add(n), n;
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  once(e, n) {
    const r = (...i) => {
      this.off(
        e,
        /** @type {any} */
        r
      ), n(...i);
    };
    this.on(
      e,
      /** @type {any} */
      r
    );
  }
  /**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */
  off(e, n) {
    const r = this._observers.get(e);
    r !== void 0 && (r.delete(n), r.size === 0 && this._observers.delete(e));
  }
  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name The event name.
   * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
   */
  emit(e, n) {
    return _n((this._observers.get(e) || pt()).values()).forEach((r) => r(...n));
  }
  destroy() {
    this._observers = pt();
  }
}
class ty {
  constructor() {
    this._observers = pt();
  }
  /**
   * @param {N} name
   * @param {function} f
   */
  on(e, n) {
    sn(this._observers, e, Fn).add(n);
  }
  /**
   * @param {N} name
   * @param {function} f
   */
  once(e, n) {
    const r = (...i) => {
      this.off(e, r), n(...i);
    };
    this.on(e, r);
  }
  /**
   * @param {N} name
   * @param {function} f
   */
  off(e, n) {
    const r = this._observers.get(e);
    r !== void 0 && (r.delete(n), r.size === 0 && this._observers.delete(e));
  }
  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @param {N} name The event name.
   * @param {Array<any>} args The arguments that are applied to the event listener.
   */
  emit(e, n) {
    return _n((this._observers.get(e) || pt()).values()).forEach((r) => r(...n));
  }
  destroy() {
    this._observers = pt();
  }
}
const nn = Math.floor, cs = Math.abs, zu = (t, e) => t < e ? t : e, vr = (t, e) => t > e ? t : e, Yu = (t) => t !== 0 ? t < 0 : 1 / t < 0, ul = 1, fl = 2, qo = 4, Vo = 8, ii = 32, en = 64, St = 128, qs = 31, ba = 63, Kn = 127, ny = 2147483647, Gu = Number.MAX_SAFE_INTEGER, ry = Number.isInteger || ((t) => typeof t == "number" && isFinite(t) && nn(t) === t), iy = (t) => t.toLowerCase(), sy = /^\s*/g, oy = (t) => t.replace(sy, ""), ay = /([A-Z])/g, dl = (t, e) => oy(t.replace(ay, (n) => `${e}${iy(n)}`)), cy = (t) => {
  const e = unescape(encodeURIComponent(t)), n = e.length, r = new Uint8Array(n);
  for (let i = 0; i < n; i++)
    r[i] = /** @type {number} */
    e.codePointAt(i);
  return r;
}, si = (
  /** @type {TextEncoder} */
  typeof TextEncoder < "u" ? new TextEncoder() : null
), ly = (t) => si.encode(t), uy = si ? ly : cy;
let Hr = typeof TextDecoder > "u" ? null : new TextDecoder("utf-8", { fatal: !0, ignoreBOM: !0 });
Hr && Hr.decode(new Uint8Array()).length === 1 && (Hr = null);
class mi {
  constructor() {
    this.cpos = 0, this.cbuf = new Uint8Array(100), this.bufs = [];
  }
}
const br = () => new mi(), fy = (t) => {
  let e = t.cpos;
  for (let n = 0; n < t.bufs.length; n++)
    e += t.bufs[n].length;
  return e;
}, At = (t) => {
  const e = new Uint8Array(fy(t));
  let n = 0;
  for (let r = 0; r < t.bufs.length; r++) {
    const i = t.bufs[r];
    e.set(i, n), n += i.length;
  }
  return e.set(new Uint8Array(t.cbuf.buffer, 0, t.cpos), n), e;
}, dy = (t, e) => {
  const n = t.cbuf.length;
  n - t.cpos < e && (t.bufs.push(new Uint8Array(t.cbuf.buffer, 0, t.cpos)), t.cbuf = new Uint8Array(vr(n, e) * 2), t.cpos = 0);
}, Ze = (t, e) => {
  const n = t.cbuf.length;
  t.cpos === n && (t.bufs.push(t.cbuf), t.cbuf = new Uint8Array(n * 2), t.cpos = 0), t.cbuf[t.cpos++] = e;
}, wa = Ze, pe = (t, e) => {
  for (; e > Kn; )
    Ze(t, St | Kn & e), e = nn(e / 128);
  Ze(t, Kn & e);
}, Ya = (t, e) => {
  const n = Yu(e);
  for (n && (e = -e), Ze(t, (e > ba ? St : 0) | (n ? en : 0) | ba & e), e = nn(e / 64); e > 0; )
    Ze(t, (e > Kn ? St : 0) | Kn & e), e = nn(e / 128);
}, _a = new Uint8Array(3e4), hy = _a.length / 3, py = (t, e) => {
  if (e.length < hy) {
    const n = si.encodeInto(e, _a).written || 0;
    pe(t, n);
    for (let r = 0; r < n; r++)
      Ze(t, _a[r]);
  } else
    wt(t, uy(e));
}, yy = (t, e) => {
  const n = unescape(encodeURIComponent(e)), r = n.length;
  pe(t, r);
  for (let i = 0; i < r; i++)
    Ze(
      t,
      /** @type {number} */
      n.codePointAt(i)
    );
}, Bn = si && /** @type {any} */
si.encodeInto ? py : yy, gy = (t, e) => vi(t, At(e)), vi = (t, e) => {
  const n = t.cbuf.length, r = t.cpos, i = zu(n - r, e.length), o = e.length - i;
  t.cbuf.set(e.subarray(0, i), r), t.cpos += i, o > 0 && (t.bufs.push(t.cbuf), t.cbuf = new Uint8Array(vr(n * 2, o)), t.cbuf.set(e.subarray(i)), t.cpos = o);
}, wt = (t, e) => {
  pe(t, e.byteLength), vi(t, e);
}, Ga = (t, e) => {
  dy(t, e);
  const n = new DataView(t.cbuf.buffer, t.cpos, e);
  return t.cpos += e, n;
}, my = (t, e) => Ga(t, 4).setFloat32(0, e, !1), vy = (t, e) => Ga(t, 8).setFloat64(0, e, !1), by = (t, e) => (
  /** @type {any} */
  Ga(t, 8).setBigInt64(0, e, !1)
), hl = new DataView(new ArrayBuffer(4)), wy = (t) => (hl.setFloat32(0, t), hl.getFloat32(0) === t), oi = (t, e) => {
  switch (typeof e) {
    case "string":
      Ze(t, 119), Bn(t, e);
      break;
    case "number":
      ry(e) && cs(e) <= ny ? (Ze(t, 125), Ya(t, e)) : wy(e) ? (Ze(t, 124), my(t, e)) : (Ze(t, 123), vy(t, e));
      break;
    case "bigint":
      Ze(t, 122), by(t, e);
      break;
    case "object":
      if (e === null)
        Ze(t, 126);
      else if (Zp(e)) {
        Ze(t, 117), pe(t, e.length);
        for (let n = 0; n < e.length; n++)
          oi(t, e[n]);
      } else if (e instanceof Uint8Array)
        Ze(t, 116), wt(t, e);
      else {
        Ze(t, 118);
        const n = Object.keys(e);
        pe(t, n.length);
        for (let r = 0; r < n.length; r++) {
          const i = n[r];
          Bn(t, i), oi(t, e[i]);
        }
      }
      break;
    case "boolean":
      Ze(t, e ? 120 : 121);
      break;
    default:
      Ze(t, 127);
  }
};
class pl extends mi {
  /**
   * @param {function(Encoder, T):void} writer
   */
  constructor(e) {
    super(), this.w = e, this.s = null, this.count = 0;
  }
  /**
   * @param {T} v
   */
  write(e) {
    this.s === e ? this.count++ : (this.count > 0 && pe(this, this.count - 1), this.count = 1, this.w(this, e), this.s = e);
  }
}
const yl = (t) => {
  t.count > 0 && (Ya(t.encoder, t.count === 1 ? t.s : -t.s), t.count > 1 && pe(t.encoder, t.count - 2));
};
class ls {
  constructor() {
    this.encoder = new mi(), this.s = 0, this.count = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.s === e ? this.count++ : (yl(this), this.count = 1, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return yl(this), At(this.encoder);
  }
}
const gl = (t) => {
  if (t.count > 0) {
    const e = t.diff * 2 + (t.count === 1 ? 0 : 1);
    Ya(t.encoder, e), t.count > 1 && pe(t.encoder, t.count - 2);
  }
};
class Wo {
  constructor() {
    this.encoder = new mi(), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @param {number} v
   */
  write(e) {
    this.diff === e - this.s ? (this.s = e, this.count++) : (gl(this), this.count = 1, this.diff = e - this.s, this.s = e);
  }
  /**
   * Flush the encoded state and transform this to a Uint8Array.
   *
   * Note that this should only be called once.
   */
  toUint8Array() {
    return gl(this), At(this.encoder);
  }
}
class _y {
  constructor() {
    this.sarr = [], this.s = "", this.lensE = new ls();
  }
  /**
   * @param {string} string
   */
  write(e) {
    this.s += e, this.s.length > 19 && (this.sarr.push(this.s), this.s = ""), this.lensE.write(e.length);
  }
  toUint8Array() {
    const e = new mi();
    return this.sarr.push(this.s), this.s = "", Bn(e, this.sarr.join("")), vi(e, this.lensE.toUint8Array()), At(e);
  }
}
const kn = (t) => new Error(t), $t = () => {
  throw kn("Method unimplemented");
}, Ft = () => {
  throw kn("Unexpected case");
}, Ju = kn("Unexpected end of array"), Xu = kn("Integer out of Range");
class Vs {
  /**
   * @param {Uint8Array} uint8Array Binary data to decode
   */
  constructor(e) {
    this.arr = e, this.pos = 0;
  }
}
const bi = (t) => new Vs(t), ky = (t) => t.pos !== t.arr.length, Sy = (t, e) => {
  const n = new Uint8Array(t.arr.buffer, t.pos + t.arr.byteOffset, e);
  return t.pos += e, n;
}, xt = (t) => Sy(t, Pe(t)), ai = (t) => t.arr[t.pos++], Pe = (t) => {
  let e = 0, n = 1;
  const r = t.arr.length;
  for (; t.pos < r; ) {
    const i = t.arr[t.pos++];
    if (e = e + (i & Kn) * n, n *= 128, i < St)
      return e;
    if (e > Gu)
      throw Xu;
  }
  throw Ju;
}, Ja = (t) => {
  let e = t.arr[t.pos++], n = e & ba, r = 64;
  const i = (e & en) > 0 ? -1 : 1;
  if (!(e & St))
    return i * n;
  const o = t.arr.length;
  for (; t.pos < o; ) {
    if (e = t.arr[t.pos++], n = n + (e & Kn) * r, r *= 128, e < St)
      return i * n;
    if (n > Gu)
      throw Xu;
  }
  throw Ju;
}, Ey = (t) => {
  let e = Pe(t);
  if (e === 0)
    return "";
  {
    let n = String.fromCodePoint(ai(t));
    if (--e < 100)
      for (; e--; )
        n += String.fromCodePoint(ai(t));
    else
      for (; e > 0; ) {
        const r = e < 1e4 ? e : 1e4, i = t.arr.subarray(t.pos, t.pos + r);
        t.pos += r, n += String.fromCodePoint.apply(
          null,
          /** @type {any} */
          i
        ), e -= r;
      }
    return decodeURIComponent(escape(n));
  }
}, xy = (t) => (
  /** @type any */
  Hr.decode(xt(t))
), _s = Hr ? xy : Ey, Xa = (t, e) => {
  const n = new DataView(t.arr.buffer, t.arr.byteOffset + t.pos, e);
  return t.pos += e, n;
}, Cy = (t) => Xa(t, 4).getFloat32(0, !1), Iy = (t) => Xa(t, 8).getFloat64(0, !1), Oy = (t) => (
  /** @type {any} */
  Xa(t, 8).getBigInt64(0, !1)
), Ay = [
  (t) => {
  },
  // CASE 127: undefined
  (t) => null,
  // CASE 126: null
  Ja,
  // CASE 125: integer
  Cy,
  // CASE 124: float32
  Iy,
  // CASE 123: float64
  Oy,
  // CASE 122: bigint
  (t) => !1,
  // CASE 121: boolean (false)
  (t) => !0,
  // CASE 120: boolean (true)
  _s,
  // CASE 119: string
  (t) => {
    const e = Pe(t), n = {};
    for (let r = 0; r < e; r++) {
      const i = _s(t);
      n[i] = ks(t);
    }
    return n;
  },
  (t) => {
    const e = Pe(t), n = [];
    for (let r = 0; r < e; r++)
      n.push(ks(t));
    return n;
  },
  xt
  // CASE 116: Uint8Array
], ks = (t) => Ay[127 - ai(t)](t);
class ml extends Vs {
  /**
   * @param {Uint8Array} uint8Array
   * @param {function(Decoder):T} reader
   */
  constructor(e, n) {
    super(e), this.reader = n, this.s = null, this.count = 0;
  }
  read() {
    return this.count === 0 && (this.s = this.reader(this), ky(this) ? this.count = Pe(this) + 1 : this.count = -1), this.count--, /** @type {T} */
    this.s;
  }
}
class us extends Vs {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0;
  }
  read() {
    if (this.count === 0) {
      this.s = Ja(this);
      const e = Yu(this.s);
      this.count = 1, e && (this.s = -this.s, this.count = Pe(this) + 2);
    }
    return this.count--, /** @type {number} */
    this.s;
  }
}
class Ho extends Vs {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    super(e), this.s = 0, this.count = 0, this.diff = 0;
  }
  /**
   * @return {number}
   */
  read() {
    if (this.count === 0) {
      const e = Ja(this), n = e & 1;
      this.diff = nn(e / 2), this.count = 1, n && (this.count = Pe(this) + 2);
    }
    return this.s += this.diff, this.count--, this.s;
  }
}
class Dy {
  /**
   * @param {Uint8Array} uint8Array
   */
  constructor(e) {
    this.decoder = new us(e), this.str = _s(this.decoder), this.spos = 0;
  }
  /**
   * @return {string}
   */
  read() {
    const e = this.spos + this.decoder.read(), n = this.str.slice(this.spos, e);
    return this.spos = e, n;
  }
}
const Ty = crypto.getRandomValues.bind(crypto), Qu = () => Ty(new Uint32Array(1))[0], Ry = [1e7] + -1e3 + -4e3 + -8e3 + -1e11, Py = () => Ry.replace(
  /[018]/g,
  /** @param {number} c */
  (t) => (t ^ Qu() & 15 >> t / 4).toString(16)
), Ss = Date.now, vl = (t) => (
  /** @type {Promise<T>} */
  new Promise(t)
);
Promise.all.bind(Promise);
const bl = (t) => t === void 0 ? null : t;
class Uy {
  constructor() {
    this.map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {string} key
   * @param {any} newValue
   */
  setItem(e, n) {
    this.map.set(e, n);
  }
  /**
   * @param {string} key
   */
  getItem(e) {
    return this.map.get(e);
  }
}
let Zu = new Uy(), jy = !0;
try {
  typeof localStorage < "u" && localStorage && (Zu = localStorage, jy = !1);
} catch {
}
const Ly = Zu, Ny = Object.assign, ef = Object.keys, My = (t, e) => {
  for (const n in t)
    e(t[n], n);
}, wl = (t) => ef(t).length, _l = (t) => ef(t).length, Ky = (t) => {
  for (const e in t)
    return !1;
  return !0;
}, By = (t, e) => {
  for (const n in t)
    if (!e(t[n], n))
      return !1;
  return !0;
}, tf = (t, e) => Object.prototype.hasOwnProperty.call(t, e), $y = (t, e) => t === e || _l(t) === _l(e) && By(t, (n, r) => (n !== void 0 || tf(e, r)) && e[r] === n), Fy = Object.freeze, nf = (t) => {
  for (const e in t) {
    const n = t[e];
    (typeof n == "object" || typeof n == "function") && nf(t[e]);
  }
  return Fy(t);
}, Qa = (t, e, n = 0) => {
  try {
    for (; n < t.length; n++)
      t[n](...e);
  } finally {
    n < t.length && Qa(t, e, n + 1);
  }
}, qy = (t, e) => t === e, zr = (t, e) => {
  if (t == null || e == null)
    return qy(t, e);
  if (t.constructor !== e.constructor)
    return !1;
  if (t === e)
    return !0;
  switch (t.constructor) {
    case ArrayBuffer:
      t = new Uint8Array(t), e = new Uint8Array(e);
    case Uint8Array: {
      if (t.byteLength !== e.byteLength)
        return !1;
      for (let n = 0; n < t.length; n++)
        if (t[n] !== e[n])
          return !1;
      break;
    }
    case Set: {
      if (t.size !== e.size)
        return !1;
      for (const n of t)
        if (!e.has(n))
          return !1;
      break;
    }
    case Map: {
      if (t.size !== e.size)
        return !1;
      for (const n of t.keys())
        if (!e.has(n) || !zr(t.get(n), e.get(n)))
          return !1;
      break;
    }
    case Object:
      if (wl(t) !== wl(e))
        return !1;
      for (const n in t)
        if (!tf(t, n) || !zr(t[n], e[n]))
          return !1;
      break;
    case Array:
      if (t.length !== e.length)
        return !1;
      for (let n = 0; n < t.length; n++)
        if (!zr(t[n], e[n]))
          return !1;
      break;
    default:
      return !1;
  }
  return !0;
}, Vy = (t, e) => e.includes(t), ci = typeof process < "u" && process.release && /node|io\.js/.test(process.release.name) && Object.prototype.toString.call(typeof process < "u" ? process : 0) === "[object process]";
let Lt;
const Wy = () => {
  if (Lt === void 0)
    if (ci) {
      Lt = pt();
      const t = process.argv;
      let e = null;
      for (let n = 0; n < t.length; n++) {
        const r = t[n];
        r[0] === "-" ? (e !== null && Lt.set(e, ""), e = r) : e !== null && (Lt.set(e, r), e = null);
      }
      e !== null && Lt.set(e, "");
    } else
      typeof location == "object" ? (Lt = pt(), (location.search || "?").slice(1).split("&").forEach((t) => {
        if (t.length !== 0) {
          const [e, n] = t.split("=");
          Lt.set(`--${dl(e, "-")}`, n), Lt.set(`-${dl(e, "-")}`, n);
        }
      })) : Lt = pt();
  return Lt;
}, ka = (t) => Wy().has(t), Es = (t) => bl(ci ? process.env[t.toUpperCase().replaceAll("-", "_")] : Ly.getItem(t)), rf = (t) => ka("--" + t) || Es(t) !== null;
rf("production");
const Hy = ci && Vy(process.env.FORCE_COLOR, ["true", "1", "2"]), zy = Hy || !ka("--no-colors") && // @todo deprecate --no-colors
!rf("no-color") && (!ci || process.stdout.isTTY) && (!ci || ka("--color") || Es("COLORTERM") !== null || (Es("TERM") || "").includes("color"));
class Yy {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor(e, n) {
    this.left = e, this.right = n;
  }
}
const Yt = (t, e) => new Yy(t, e);
typeof DOMParser < "u" && new DOMParser();
const Gy = (t) => Jp(t, (e, n) => `${n}:${e};`).join(""), on = Symbol, sf = on(), of = on(), Jy = on(), Xy = on(), Qy = on(), af = on(), Zy = on(), Za = on(), eg = on(), tg = (t) => {
  var i;
  t.length === 1 && ((i = t[0]) == null ? void 0 : i.constructor) === Function && (t = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  t[0]());
  const e = [], n = [];
  let r = 0;
  for (; r < t.length; r++) {
    const o = t[r];
    if (o === void 0)
      break;
    if (o.constructor === String || o.constructor === Number)
      e.push(o);
    else if (o.constructor === Object)
      break;
  }
  for (r > 0 && n.push(e.join("")); r < t.length; r++) {
    const o = t[r];
    o instanceof Symbol || n.push(o);
  }
  return n;
}, ng = {
  [sf]: Yt("font-weight", "bold"),
  [of]: Yt("font-weight", "normal"),
  [Jy]: Yt("color", "blue"),
  [Qy]: Yt("color", "green"),
  [Xy]: Yt("color", "grey"),
  [af]: Yt("color", "red"),
  [Zy]: Yt("color", "purple"),
  [Za]: Yt("color", "orange"),
  // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [eg]: Yt("color", "black")
}, rg = (t) => {
  var c;
  t.length === 1 && ((c = t[0]) == null ? void 0 : c.constructor) === Function && (t = /** @type {Array<string|Symbol|Object|number>} */
  /** @type {[function]} */
  t[0]());
  const e = [], n = [], r = pt();
  let i = [], o = 0;
  for (; o < t.length; o++) {
    const l = t[o], d = ng[l];
    if (d !== void 0)
      r.set(d.left, d.right);
    else {
      if (l === void 0)
        break;
      if (l.constructor === String || l.constructor === Number) {
        const h = Gy(r);
        o > 0 || h.length > 0 ? (e.push("%c" + l), n.push(h)) : e.push(l);
      } else
        break;
    }
  }
  for (o > 0 && (i = n, i.unshift(e.join(""))); o < t.length; o++) {
    const l = t[o];
    l instanceof Symbol || i.push(l);
  }
  return i;
}, cf = zy ? rg : tg, ig = (...t) => {
  console.log(...cf(t)), lf.forEach((e) => e.print(t));
}, sg = (...t) => {
  console.warn(...cf(t)), t.unshift(Za), lf.forEach((e) => e.print(t));
}, lf = Fn(), uf = (t) => ({
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return this;
  },
  // @ts-ignore
  next: t
}), og = (t, e) => uf(() => {
  let n;
  do
    n = t.next();
  while (!n.done && !e(n.value));
  return n;
}), zo = (t, e) => uf(() => {
  const { done: n, value: r } = t.next();
  return { done: n, value: n ? void 0 : e(r) };
});
class ff {
  /**
   * @param {number} clock
   * @param {number} len
   */
  constructor(e, n) {
    this.clock = e, this.len = n;
  }
}
class Ws {
  constructor() {
    this.clients = /* @__PURE__ */ new Map();
  }
}
const df = (t, e, n) => e.clients.forEach((r, i) => {
  const o = (
    /** @type {Array<GC|Item>} */
    t.doc.store.clients.get(i)
  );
  if (o != null) {
    const c = o[o.length - 1], l = c.id.clock + c.length;
    for (let d = 0, h = r[d]; d < r.length && h.clock < l; h = r[++d])
      _f(t, o, h.clock, h.len, n);
  }
}), ag = (t, e) => {
  let n = 0, r = t.length - 1;
  for (; n <= r; ) {
    const i = nn((n + r) / 2), o = t[i], c = o.clock;
    if (c <= e) {
      if (e < c + o.len)
        return i;
      n = i + 1;
    } else
      r = i - 1;
  }
  return null;
}, hf = (t, e) => {
  const n = t.clients.get(e.client);
  return n !== void 0 && ag(n, e.clock) !== null;
}, ec = (t) => {
  t.clients.forEach((e) => {
    e.sort((i, o) => i.clock - o.clock);
    let n, r;
    for (n = 1, r = 1; n < e.length; n++) {
      const i = e[r - 1], o = e[n];
      i.clock + i.len >= o.clock ? i.len = vr(i.len, o.clock + o.len - i.clock) : (r < n && (e[r] = o), r++);
    }
    e.length = r;
  });
}, cg = (t) => {
  const e = new Ws();
  for (let n = 0; n < t.length; n++)
    t[n].clients.forEach((r, i) => {
      if (!e.clients.has(i)) {
        const o = r.slice();
        for (let c = n + 1; c < t.length; c++)
          Qp(o, t[c].clients.get(i) || []);
        e.clients.set(i, o);
      }
    });
  return ec(e), e;
}, xs = (t, e, n, r) => {
  sn(t.clients, e, () => (
    /** @type {Array<DeleteItem>} */
    []
  )).push(new ff(n, r));
}, tc = (t, e) => {
  pe(t.restEncoder, e.clients.size), _n(e.clients.entries()).sort((n, r) => r[0] - n[0]).forEach(([n, r]) => {
    t.resetDsCurVal(), pe(t.restEncoder, n);
    const i = r.length;
    pe(t.restEncoder, i);
    for (let o = 0; o < i; o++) {
      const c = r[o];
      t.writeDsClock(c.clock), t.writeDsLen(c.len);
    }
  });
}, lg = (t) => {
  const e = new Ws(), n = Pe(t.restDecoder);
  for (let r = 0; r < n; r++) {
    t.resetDsCurVal();
    const i = Pe(t.restDecoder), o = Pe(t.restDecoder);
    if (o > 0) {
      const c = sn(e.clients, i, () => (
        /** @type {Array<DeleteItem>} */
        []
      ));
      for (let l = 0; l < o; l++)
        c.push(new ff(t.readDsClock(), t.readDsLen()));
    }
  }
  return e;
}, kl = (t, e, n) => {
  const r = new Ws(), i = Pe(t.restDecoder);
  for (let o = 0; o < i; o++) {
    t.resetDsCurVal();
    const c = Pe(t.restDecoder), l = Pe(t.restDecoder), d = n.clients.get(c) || [], h = et(n, c);
    for (let f = 0; f < l; f++) {
      const g = t.readDsClock(), m = g + t.readDsLen();
      if (g < h) {
        h < m && xs(r, c, h, m - h);
        let b = qt(d, g), w = d[b];
        for (!w.deleted && w.id.clock < g && (d.splice(b + 1, 0, Rs(e, w, g - w.id.clock)), b++); b < d.length && (w = d[b++], w.id.clock < m); )
          w.deleted || (m < w.id.clock + w.length && d.splice(b, 0, Rs(e, w, m - w.id.clock)), w.delete(e));
      } else
        xs(r, c, g, m - g);
    }
  }
  if (r.clients.size > 0) {
    const o = new Hs();
    return pe(o.restEncoder, 0), tc(o, r), o.toUint8Array();
  }
  return null;
}, pf = Qu;
class wr extends ey {
  /**
   * @param {DocOpts} opts configuration
   */
  constructor({ guid: e = Py(), collectionid: n = null, gc: r = !0, gcFilter: i = () => !0, meta: o = null, autoLoad: c = !1, shouldLoad: l = !0 } = {}) {
    super(), this.gc = r, this.gcFilter = i, this.clientID = pf(), this.guid = e, this.collectionid = n, this.share = /* @__PURE__ */ new Map(), this.store = new bf(), this._transaction = null, this._transactionCleanups = [], this.subdocs = /* @__PURE__ */ new Set(), this._item = null, this.shouldLoad = l, this.autoLoad = c, this.meta = o, this.isLoaded = !1, this.isSynced = !1, this.isDestroyed = !1, this.whenLoaded = vl((h) => {
      this.on("load", () => {
        this.isLoaded = !0, h(this);
      });
    });
    const d = () => vl((h) => {
      const f = (g) => {
        (g === void 0 || g === !0) && (this.off("sync", f), h());
      };
      this.on("sync", f);
    });
    this.on("sync", (h) => {
      h === !1 && this.isSynced && (this.whenSynced = d()), this.isSynced = h === void 0 || h === !0, this.isSynced && !this.isLoaded && this.emit("load", [this]);
    }), this.whenSynced = d();
  }
  /**
   * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
   *
   * `load()` might be used in the future to request any provider to load the most current data.
   *
   * It is safe to call `load()` multiple times.
   */
  load() {
    const e = this._item;
    e !== null && !this.shouldLoad && Ue(
      /** @type {any} */
      e.parent.doc,
      (n) => {
        n.subdocsLoaded.add(this);
      },
      null,
      !0
    ), this.shouldLoad = !0;
  }
  getSubdocs() {
    return this.subdocs;
  }
  getSubdocGuids() {
    return new Set(_n(this.subdocs).map((e) => e.guid));
  }
  /**
   * Changes that happen inside of a transaction are bundled. This means that
   * the observer fires _after_ the transaction is finished and that all changes
   * that happened inside of the transaction are sent as one message to the
   * other peers.
   *
   * @template T
   * @param {function(Transaction):T} f The function that should be executed as a transaction
   * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
   * @return T
   *
   * @public
   */
  transact(e, n = null) {
    return Ue(this, e, n);
  }
  /**
   * Define a shared data type.
   *
   * Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
   * and do not overwrite each other. I.e.
   * `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
   *
   * After this method is called, the type is also available on `ydoc.share.get(name)`.
   *
   * *Best Practices:*
   * Define all types right after the Y.Doc instance is created and store them in a separate object.
   * Also use the typed methods `getText(name)`, `getArray(name)`, ..
   *
   * @template {typeof AbstractType<any>} Type
   * @example
   *   const ydoc = new Y.Doc(..)
   *   const appState = {
   *     document: ydoc.getText('document')
   *     comments: ydoc.getArray('comments')
   *   }
   *
   * @param {string} name
   * @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
   * @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
   *
   * @public
   */
  get(e, n = (
    /** @type {any} */
    rt
  )) {
    const r = sn(this.share, e, () => {
      const o = new n();
      return o._integrate(this, null), o;
    }), i = r.constructor;
    if (n !== rt && i !== n)
      if (i === rt) {
        const o = new n();
        o._map = r._map, r._map.forEach(
          /** @param {Item?} n */
          (c) => {
            for (; c !== null; c = c.left)
              c.parent = o;
          }
        ), o._start = r._start;
        for (let c = o._start; c !== null; c = c.right)
          c.parent = o;
        return o._length = r._length, this.share.set(e, o), o._integrate(this, null), /** @type {InstanceType<Type>} */
        o;
      } else
        throw new Error(`Type with the name ${e} has already been defined with a different constructor`);
    return (
      /** @type {InstanceType<Type>} */
      r
    );
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YArray<T>}
   *
   * @public
   */
  getArray(e = "") {
    return (
      /** @type {YArray<T>} */
      this.get(e, or)
    );
  }
  /**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */
  getText(e = "") {
    return this.get(e, dr);
  }
  /**
   * @template T
   * @param {string} [name]
   * @return {YMap<T>}
   *
   * @public
   */
  getMap(e = "") {
    return (
      /** @type {YMap<T>} */
      this.get(e, fr)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlElement}
   *
   * @public
   */
  getXmlElement(e = "") {
    return (
      /** @type {YXmlElement<{[key:string]:string}>} */
      this.get(e, hr)
    );
  }
  /**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */
  getXmlFragment(e = "") {
    return this.get(e, qn);
  }
  /**
   * Converts the entire document into a js object, recursively traversing each yjs type
   * Doesn't log types that have not been defined (using ydoc.getType(..)).
   *
   * @deprecated Do not use this method and rather call toJSON directly on the shared types.
   *
   * @return {Object<string, any>}
   */
  toJSON() {
    const e = {};
    return this.share.forEach((n, r) => {
      e[r] = n.toJSON();
    }), e;
  }
  /**
   * Emit `destroy` event and unregister all event handlers.
   */
  destroy() {
    this.isDestroyed = !0, _n(this.subdocs).forEach((n) => n.destroy());
    const e = this._item;
    if (e !== null) {
      this._item = null;
      const n = (
        /** @type {ContentDoc} */
        e.content
      );
      n.doc = new wr({ guid: this.guid, ...n.opts, shouldLoad: !1 }), n.doc._item = e, Ue(
        /** @type {any} */
        e.parent.doc,
        (r) => {
          const i = n.doc;
          e.deleted || r.subdocsAdded.add(i), r.subdocsRemoved.add(this);
        },
        null,
        !0
      );
    }
    this.emit("destroyed", [!0]), this.emit("destroy", [this]), super.destroy();
  }
}
class ug {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    this.dsCurrVal = 0, this.restDecoder = e;
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @return {number}
   */
  readDsClock() {
    return this.dsCurrVal += Pe(this.restDecoder), this.dsCurrVal;
  }
  /**
   * @return {number}
   */
  readDsLen() {
    const e = Pe(this.restDecoder) + 1;
    return this.dsCurrVal += e, e;
  }
}
class li extends ug {
  /**
   * @param {decoding.Decoder} decoder
   */
  constructor(e) {
    super(e), this.keys = [], Pe(e), this.keyClockDecoder = new Ho(xt(e)), this.clientDecoder = new us(xt(e)), this.leftClockDecoder = new Ho(xt(e)), this.rightClockDecoder = new Ho(xt(e)), this.infoDecoder = new ml(xt(e), ai), this.stringDecoder = new Dy(xt(e)), this.parentInfoDecoder = new ml(xt(e), ai), this.typeRefDecoder = new us(xt(e)), this.lenDecoder = new us(xt(e));
  }
  /**
   * @return {ID}
   */
  readLeftID() {
    return new sr(this.clientDecoder.read(), this.leftClockDecoder.read());
  }
  /**
   * @return {ID}
   */
  readRightID() {
    return new sr(this.clientDecoder.read(), this.rightClockDecoder.read());
  }
  /**
   * Read the next client id.
   * Use this in favor of readID whenever possible to reduce the number of objects created.
   */
  readClient() {
    return this.clientDecoder.read();
  }
  /**
   * @return {number} info An unsigned 8-bit integer
   */
  readInfo() {
    return (
      /** @type {number} */
      this.infoDecoder.read()
    );
  }
  /**
   * @return {string}
   */
  readString() {
    return this.stringDecoder.read();
  }
  /**
   * @return {boolean}
   */
  readParentInfo() {
    return this.parentInfoDecoder.read() === 1;
  }
  /**
   * @return {number} An unsigned 8-bit integer
   */
  readTypeRef() {
    return this.typeRefDecoder.read();
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @return {number}
   */
  readLen() {
    return this.lenDecoder.read();
  }
  /**
   * @return {any}
   */
  readAny() {
    return ks(this.restDecoder);
  }
  /**
   * @return {Uint8Array}
   */
  readBuf() {
    return xt(this.restDecoder);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @return {any}
   */
  readJSON() {
    return ks(this.restDecoder);
  }
  /**
   * @return {string}
   */
  readKey() {
    const e = this.keyClockDecoder.read();
    if (e < this.keys.length)
      return this.keys[e];
    {
      const n = this.stringDecoder.read();
      return this.keys.push(n), n;
    }
  }
}
class fg {
  constructor() {
    this.restEncoder = br();
  }
  toUint8Array() {
    return At(this.restEncoder);
  }
  resetDsCurVal() {
  }
  /**
   * @param {number} clock
   */
  writeDsClock(e) {
    pe(this.restEncoder, e);
  }
  /**
   * @param {number} len
   */
  writeDsLen(e) {
    pe(this.restEncoder, e);
  }
}
class dg extends fg {
  /**
   * @param {ID} id
   */
  writeLeftID(e) {
    pe(this.restEncoder, e.client), pe(this.restEncoder, e.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(e) {
    pe(this.restEncoder, e.client), pe(this.restEncoder, e.clock);
  }
  /**
   * Use writeClient and writeClock instead of writeID if possible.
   * @param {number} client
   */
  writeClient(e) {
    pe(this.restEncoder, e);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(e) {
    wa(this.restEncoder, e);
  }
  /**
   * @param {string} s
   */
  writeString(e) {
    Bn(this.restEncoder, e);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(e) {
    pe(this.restEncoder, e ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(e) {
    pe(this.restEncoder, e);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(e) {
    pe(this.restEncoder, e);
  }
  /**
   * @param {any} any
   */
  writeAny(e) {
    oi(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    wt(this.restEncoder, e);
  }
  /**
   * @param {any} embed
   */
  writeJSON(e) {
    Bn(this.restEncoder, JSON.stringify(e));
  }
  /**
   * @param {string} key
   */
  writeKey(e) {
    Bn(this.restEncoder, e);
  }
}
class yf {
  constructor() {
    this.restEncoder = br(), this.dsCurrVal = 0;
  }
  toUint8Array() {
    return At(this.restEncoder);
  }
  resetDsCurVal() {
    this.dsCurrVal = 0;
  }
  /**
   * @param {number} clock
   */
  writeDsClock(e) {
    const n = e - this.dsCurrVal;
    this.dsCurrVal = e, pe(this.restEncoder, n);
  }
  /**
   * @param {number} len
   */
  writeDsLen(e) {
    e === 0 && Ft(), pe(this.restEncoder, e - 1), this.dsCurrVal += e;
  }
}
class Hs extends yf {
  constructor() {
    super(), this.keyMap = /* @__PURE__ */ new Map(), this.keyClock = 0, this.keyClockEncoder = new Wo(), this.clientEncoder = new ls(), this.leftClockEncoder = new Wo(), this.rightClockEncoder = new Wo(), this.infoEncoder = new pl(wa), this.stringEncoder = new _y(), this.parentInfoEncoder = new pl(wa), this.typeRefEncoder = new ls(), this.lenEncoder = new ls();
  }
  toUint8Array() {
    const e = br();
    return pe(e, 0), wt(e, this.keyClockEncoder.toUint8Array()), wt(e, this.clientEncoder.toUint8Array()), wt(e, this.leftClockEncoder.toUint8Array()), wt(e, this.rightClockEncoder.toUint8Array()), wt(e, At(this.infoEncoder)), wt(e, this.stringEncoder.toUint8Array()), wt(e, At(this.parentInfoEncoder)), wt(e, this.typeRefEncoder.toUint8Array()), wt(e, this.lenEncoder.toUint8Array()), vi(e, At(this.restEncoder)), At(e);
  }
  /**
   * @param {ID} id
   */
  writeLeftID(e) {
    this.clientEncoder.write(e.client), this.leftClockEncoder.write(e.clock);
  }
  /**
   * @param {ID} id
   */
  writeRightID(e) {
    this.clientEncoder.write(e.client), this.rightClockEncoder.write(e.clock);
  }
  /**
   * @param {number} client
   */
  writeClient(e) {
    this.clientEncoder.write(e);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeInfo(e) {
    this.infoEncoder.write(e);
  }
  /**
   * @param {string} s
   */
  writeString(e) {
    this.stringEncoder.write(e);
  }
  /**
   * @param {boolean} isYKey
   */
  writeParentInfo(e) {
    this.parentInfoEncoder.write(e ? 1 : 0);
  }
  /**
   * @param {number} info An unsigned 8-bit integer
   */
  writeTypeRef(e) {
    this.typeRefEncoder.write(e);
  }
  /**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */
  writeLen(e) {
    this.lenEncoder.write(e);
  }
  /**
   * @param {any} any
   */
  writeAny(e) {
    oi(this.restEncoder, e);
  }
  /**
   * @param {Uint8Array} buf
   */
  writeBuf(e) {
    wt(this.restEncoder, e);
  }
  /**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */
  writeJSON(e) {
    oi(this.restEncoder, e);
  }
  /**
   * Property keys are often reused. For example, in y-prosemirror the key `bold` might
   * occur very often. For a 3d application, the key `position` might occur very often.
   *
   * We cache these keys in a Map and refer to them via a unique number.
   *
   * @param {string} key
   */
  writeKey(e) {
    const n = this.keyMap.get(e);
    n === void 0 ? (this.keyClockEncoder.write(this.keyClock++), this.stringEncoder.write(e)) : this.keyClockEncoder.write(n);
  }
}
const hg = (t, e, n, r) => {
  r = vr(r, e[0].id.clock);
  const i = qt(e, r);
  pe(t.restEncoder, e.length - i), t.writeClient(n), pe(t.restEncoder, r);
  const o = e[i];
  o.write(t, r - o.id.clock);
  for (let c = i + 1; c < e.length; c++)
    e[c].write(t, 0);
}, gf = (t, e, n) => {
  const r = /* @__PURE__ */ new Map();
  n.forEach((i, o) => {
    et(e, o) > i && r.set(o, i);
  }), nc(e).forEach((i, o) => {
    n.has(o) || r.set(o, 0);
  }), pe(t.restEncoder, r.size), _n(r.entries()).sort((i, o) => o[0] - i[0]).forEach(([i, o]) => {
    hg(
      t,
      /** @type {Array<GC|Item>} */
      e.clients.get(i),
      i,
      o
    );
  });
}, pg = (t, e) => {
  const n = pt(), r = Pe(t.restDecoder);
  for (let i = 0; i < r; i++) {
    const o = Pe(t.restDecoder), c = new Array(o), l = t.readClient();
    let d = Pe(t.restDecoder);
    n.set(l, { i: 0, refs: c });
    for (let h = 0; h < o; h++) {
      const f = t.readInfo();
      switch (qs & f) {
        case 0: {
          const g = t.readLen();
          c[h] = new It(Ce(l, d), g), d += g;
          break;
        }
        case 10: {
          const g = Pe(t.restDecoder);
          c[h] = new Ot(Ce(l, d), g), d += g;
          break;
        }
        default: {
          const g = (f & (en | St)) === 0, m = new ze(
            Ce(l, d),
            null,
            // left
            (f & St) === St ? t.readLeftID() : null,
            // origin
            null,
            // right
            (f & en) === en ? t.readRightID() : null,
            // right origin
            g ? t.readParentInfo() ? e.get(t.readString()) : t.readLeftID() : null,
            // parent
            g && (f & ii) === ii ? t.readString() : null,
            // parentSub
            Ff(t, f)
            // item content
          );
          c[h] = m, d += m.length;
        }
      }
    }
  }
  return n;
}, yg = (t, e, n) => {
  const r = [];
  let i = _n(n.keys()).sort((b, w) => b - w);
  if (i.length === 0)
    return null;
  const o = () => {
    if (i.length === 0)
      return null;
    let b = (
      /** @type {{i:number,refs:Array<GC|Item>}} */
      n.get(i[i.length - 1])
    );
    for (; b.refs.length === b.i; )
      if (i.pop(), i.length > 0)
        b = /** @type {{i:number,refs:Array<GC|Item>}} */
        n.get(i[i.length - 1]);
      else
        return null;
    return b;
  };
  let c = o();
  if (c === null)
    return null;
  const l = new bf(), d = /* @__PURE__ */ new Map(), h = (b, w) => {
    const I = d.get(b);
    (I == null || I > w) && d.set(b, w);
  };
  let f = (
    /** @type {any} */
    c.refs[
      /** @type {any} */
      c.i++
    ]
  );
  const g = /* @__PURE__ */ new Map(), m = () => {
    for (const b of r) {
      const w = b.id.client, I = n.get(w);
      I ? (I.i--, l.clients.set(w, I.refs.slice(I.i)), n.delete(w), I.i = 0, I.refs = []) : l.clients.set(w, [b]), i = i.filter((j) => j !== w);
    }
    r.length = 0;
  };
  for (; ; ) {
    if (f.constructor !== Ot) {
      const w = sn(g, f.id.client, () => et(e, f.id.client)) - f.id.clock;
      if (w < 0)
        r.push(f), h(f.id.client, f.id.clock - 1), m();
      else {
        const I = f.getMissing(t, e);
        if (I !== null) {
          r.push(f);
          const j = n.get(
            /** @type {number} */
            I
          ) || { refs: [], i: 0 };
          if (j.refs.length === j.i)
            h(
              /** @type {number} */
              I,
              et(e, I)
            ), m();
          else {
            f = j.refs[j.i++];
            continue;
          }
        } else
          (w === 0 || w < f.length) && (f.integrate(t, w), g.set(f.id.client, f.id.clock + f.length));
      }
    }
    if (r.length > 0)
      f = /** @type {GC|Item} */
      r.pop();
    else if (c !== null && c.i < c.refs.length)
      f = /** @type {GC|Item} */
      c.refs[c.i++];
    else {
      if (c = o(), c === null)
        break;
      f = /** @type {GC|Item} */
      c.refs[c.i++];
    }
  }
  if (l.clients.size > 0) {
    const b = new Hs();
    return gf(b, l, /* @__PURE__ */ new Map()), pe(b.restEncoder, 0), { missing: d, update: b.toUint8Array() };
  }
  return null;
}, gg = (t, e) => gf(t, e.doc.store, e.beforeState), mg = (t, e, n, r = new li(t)) => Ue(e, (i) => {
  i.local = !1;
  let o = !1;
  const c = i.doc, l = c.store, d = pg(r, c), h = yg(i, l, d), f = l.pendingStructs;
  if (f) {
    for (const [m, b] of f.missing)
      if (b < et(l, m)) {
        o = !0;
        break;
      }
    if (h) {
      for (const [m, b] of h.missing) {
        const w = f.missing.get(m);
        (w == null || w > b) && f.missing.set(m, b);
      }
      f.update = Cs([f.update, h.update]);
    }
  } else
    l.pendingStructs = h;
  const g = kl(r, i, l);
  if (l.pendingDs) {
    const m = new li(bi(l.pendingDs));
    Pe(m.restDecoder);
    const b = kl(m, i, l);
    g && b ? l.pendingDs = Cs([g, b]) : l.pendingDs = g || b;
  } else
    l.pendingDs = g;
  if (o) {
    const m = (
      /** @type {{update: Uint8Array}} */
      l.pendingStructs.update
    );
    l.pendingStructs = null, mf(i.doc, m);
  }
}, n, !1), mf = (t, e, n, r = li) => {
  const i = bi(e);
  mg(i, t, n, new r(i));
};
class vg {
  constructor() {
    this.l = [];
  }
}
const Sl = () => new vg(), El = (t, e) => t.l.push(e), xl = (t, e) => {
  const n = t.l, r = n.length;
  t.l = n.filter((i) => e !== i), r === t.l.length && console.error("[yjs] Tried to remove event handler that doesn't exist.");
}, vf = (t, e, n) => Qa(t.l, [e, n]);
class sr {
  /**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
  constructor(e, n) {
    this.client = e, this.clock = n;
  }
}
const Xi = (t, e) => t === e || t !== null && e !== null && t.client === e.client && t.clock === e.clock, Ce = (t, e) => new sr(t, e), bg = (t) => {
  for (const [e, n] of t.doc.share.entries())
    if (n === t)
      return e;
  throw Ft();
}, tr = (t, e) => e === void 0 ? !t.deleted : e.sv.has(t.id.client) && (e.sv.get(t.id.client) || 0) > t.id.clock && !hf(e.ds, t.id), Sa = (t, e) => {
  const n = sn(t.meta, Sa, Fn), r = t.doc.store;
  n.has(e) || (e.sv.forEach((i, o) => {
    i < et(r, o) && Sn(t, Ce(o, i));
  }), df(t, e.ds, (i) => {
  }), n.add(e));
};
class bf {
  constructor() {
    this.clients = /* @__PURE__ */ new Map(), this.pendingStructs = null, this.pendingDs = null;
  }
}
const nc = (t) => {
  const e = /* @__PURE__ */ new Map();
  return t.clients.forEach((n, r) => {
    const i = n[n.length - 1];
    e.set(r, i.id.clock + i.length);
  }), e;
}, et = (t, e) => {
  const n = t.clients.get(e);
  if (n === void 0)
    return 0;
  const r = n[n.length - 1];
  return r.id.clock + r.length;
}, wf = (t, e) => {
  let n = t.clients.get(e.id.client);
  if (n === void 0)
    n = [], t.clients.set(e.id.client, n);
  else {
    const r = n[n.length - 1];
    if (r.id.clock + r.length !== e.id.clock)
      throw Ft();
  }
  n.push(e);
}, qt = (t, e) => {
  let n = 0, r = t.length - 1, i = t[r], o = i.id.clock;
  if (o === e)
    return r;
  let c = nn(e / (o + i.length - 1) * r);
  for (; n <= r; ) {
    if (i = t[c], o = i.id.clock, o <= e) {
      if (e < o + i.length)
        return c;
      n = c + 1;
    } else
      r = c - 1;
    c = nn((n + r) / 2);
  }
  throw Ft();
}, wg = (t, e) => {
  const n = t.clients.get(e.client);
  return n[qt(n, e.clock)];
}, Yo = (
  /** @type {function(StructStore,ID):Item} */
  wg
), Ea = (t, e, n) => {
  const r = qt(e, n), i = e[r];
  return i.id.clock < n && i instanceof ze ? (e.splice(r + 1, 0, Rs(t, i, n - i.id.clock)), r + 1) : r;
}, Sn = (t, e) => {
  const n = (
    /** @type {Array<Item>} */
    t.doc.store.clients.get(e.client)
  );
  return n[Ea(t, n, e.clock)];
}, Cl = (t, e, n) => {
  const r = e.clients.get(n.client), i = qt(r, n.clock), o = r[i];
  return n.clock !== o.id.clock + o.length - 1 && o.constructor !== It && r.splice(i + 1, 0, Rs(t, o, n.clock - o.id.clock + 1)), o;
}, _g = (t, e, n) => {
  const r = (
    /** @type {Array<GC|Item>} */
    t.clients.get(e.id.client)
  );
  r[qt(r, e.id.clock)] = n;
}, _f = (t, e, n, r, i) => {
  if (r === 0)
    return;
  const o = n + r;
  let c = Ea(t, e, n), l;
  do
    l = e[c++], o < l.id.clock + l.length && Ea(t, e, o), i(l);
  while (c < e.length && e[c].id.clock < o);
};
class kg {
  /**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
  constructor(e, n, r) {
    this.doc = e, this.deleteSet = new Ws(), this.beforeState = nc(e.store), this.afterState = /* @__PURE__ */ new Map(), this.changed = /* @__PURE__ */ new Map(), this.changedParentTypes = /* @__PURE__ */ new Map(), this._mergeStructs = [], this.origin = n, this.meta = /* @__PURE__ */ new Map(), this.local = r, this.subdocsAdded = /* @__PURE__ */ new Set(), this.subdocsRemoved = /* @__PURE__ */ new Set(), this.subdocsLoaded = /* @__PURE__ */ new Set(), this._needFormattingCleanup = !1;
  }
}
const Il = (t, e) => e.deleteSet.clients.size === 0 && !Xp(e.afterState, (n, r) => e.beforeState.get(r) !== n) ? !1 : (ec(e.deleteSet), gg(t, e), tc(t, e.deleteSet), !0), Ol = (t, e, n) => {
  const r = e._item;
  (r === null || r.id.clock < (t.beforeState.get(r.id.client) || 0) && !r.deleted) && sn(t.changed, e, Fn).add(n);
}, fs = (t, e) => {
  let n = t[e], r = t[e - 1], i = e;
  for (; i > 0; n = r, r = t[--i - 1]) {
    if (r.deleted === n.deleted && r.constructor === n.constructor && r.mergeWith(n)) {
      n instanceof ze && n.parentSub !== null && /** @type {AbstractType<any>} */
      n.parent._map.get(n.parentSub) === n && n.parent._map.set(
        n.parentSub,
        /** @type {Item} */
        r
      );
      continue;
    }
    break;
  }
  const o = e - i;
  return o && t.splice(e + 1 - o, o), o;
}, Sg = (t, e, n) => {
  for (const [r, i] of t.clients.entries()) {
    const o = (
      /** @type {Array<GC|Item>} */
      e.clients.get(r)
    );
    for (let c = i.length - 1; c >= 0; c--) {
      const l = i[c], d = l.clock + l.len;
      for (let h = qt(o, l.clock), f = o[h]; h < o.length && f.id.clock < d; f = o[++h]) {
        const g = o[h];
        if (l.clock + l.len <= g.id.clock)
          break;
        g instanceof ze && g.deleted && !g.keep && n(g) && g.gc(e, !1);
      }
    }
  }
}, Eg = (t, e) => {
  t.clients.forEach((n, r) => {
    const i = (
      /** @type {Array<GC|Item>} */
      e.clients.get(r)
    );
    for (let o = n.length - 1; o >= 0; o--) {
      const c = n[o], l = zu(i.length - 1, 1 + qt(i, c.clock + c.len - 1));
      for (let d = l, h = i[d]; d > 0 && h.id.clock >= c.clock; h = i[d])
        d -= 1 + fs(i, d);
    }
  });
}, kf = (t, e) => {
  if (e < t.length) {
    const n = t[e], r = n.doc, i = r.store, o = n.deleteSet, c = n._mergeStructs;
    try {
      ec(o), n.afterState = nc(n.doc.store), r.emit("beforeObserverCalls", [n, r]);
      const l = [];
      n.changed.forEach(
        (d, h) => l.push(() => {
          (h._item === null || !h._item.deleted) && h._callObserver(n, d);
        })
      ), l.push(() => {
        n.changedParentTypes.forEach((d, h) => {
          h._dEH.l.length > 0 && (h._item === null || !h._item.deleted) && (d = d.filter(
            (f) => f.target._item === null || !f.target._item.deleted
          ), d.forEach((f) => {
            f.currentTarget = h, f._path = null;
          }), d.sort((f, g) => f.path.length - g.path.length), vf(h._dEH, d, n));
        });
      }), l.push(() => r.emit("afterTransaction", [n, r])), Qa(l, []), n._needFormattingCleanup && Fg(n);
    } finally {
      r.gc && Sg(o, i, r.gcFilter), Eg(o, i), n.afterState.forEach((f, g) => {
        const m = n.beforeState.get(g) || 0;
        if (m !== f) {
          const b = (
            /** @type {Array<GC|Item>} */
            i.clients.get(g)
          ), w = vr(qt(b, m), 1);
          for (let I = b.length - 1; I >= w; )
            I -= 1 + fs(b, I);
        }
      });
      for (let f = c.length - 1; f >= 0; f--) {
        const { client: g, clock: m } = c[f].id, b = (
          /** @type {Array<GC|Item>} */
          i.clients.get(g)
        ), w = qt(b, m);
        w + 1 < b.length && fs(b, w + 1) > 1 || w > 0 && fs(b, w);
      }
      if (!n.local && n.afterState.get(r.clientID) !== n.beforeState.get(r.clientID) && (ig(Za, sf, "[yjs] ", of, af, "Changed the client-id because another client seems to be using it."), r.clientID = pf()), r.emit("afterTransactionCleanup", [n, r]), r._observers.has("update")) {
        const f = new dg();
        Il(f, n) && r.emit("update", [f.toUint8Array(), n.origin, r, n]);
      }
      if (r._observers.has("updateV2")) {
        const f = new Hs();
        Il(f, n) && r.emit("updateV2", [f.toUint8Array(), n.origin, r, n]);
      }
      const { subdocsAdded: l, subdocsLoaded: d, subdocsRemoved: h } = n;
      (l.size > 0 || h.size > 0 || d.size > 0) && (l.forEach((f) => {
        f.clientID = r.clientID, f.collectionid == null && (f.collectionid = r.collectionid), r.subdocs.add(f);
      }), h.forEach((f) => r.subdocs.delete(f)), r.emit("subdocs", [{ loaded: d, added: l, removed: h }, r, n]), h.forEach((f) => f.destroy())), t.length <= e + 1 ? (r._transactionCleanups = [], r.emit("afterAllTransactions", [r, t])) : kf(t, e + 1);
    }
  }
}, Ue = (t, e, n = null, r = !0) => {
  const i = t._transactionCleanups;
  let o = !1, c = null;
  t._transaction === null && (o = !0, t._transaction = new kg(t, n, r), i.push(t._transaction), i.length === 1 && t.emit("beforeAllTransactions", [t]), t.emit("beforeTransaction", [t._transaction, t]));
  try {
    c = e(t._transaction);
  } finally {
    if (o) {
      const l = t._transaction === i[0];
      t._transaction = null, l && kf(i, 0);
    }
  }
  return c;
};
function* xg(t) {
  const e = Pe(t.restDecoder);
  for (let n = 0; n < e; n++) {
    const r = Pe(t.restDecoder), i = t.readClient();
    let o = Pe(t.restDecoder);
    for (let c = 0; c < r; c++) {
      const l = t.readInfo();
      if (l === 10) {
        const d = Pe(t.restDecoder);
        yield new Ot(Ce(i, o), d), o += d;
      } else if (qs & l) {
        const d = (l & (en | St)) === 0, h = new ze(
          Ce(i, o),
          null,
          // left
          (l & St) === St ? t.readLeftID() : null,
          // origin
          null,
          // right
          (l & en) === en ? t.readRightID() : null,
          // right origin
          // @ts-ignore Force writing a string here.
          d ? t.readParentInfo() ? t.readString() : t.readLeftID() : null,
          // parent
          d && (l & ii) === ii ? t.readString() : null,
          // parentSub
          Ff(t, l)
          // item content
        );
        yield h, o += h.length;
      } else {
        const d = t.readLen();
        yield new It(Ce(i, o), d), o += d;
      }
    }
  }
}
class Sf {
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
  constructor(e, n) {
    this.gen = xg(e), this.curr = null, this.done = !1, this.filterSkips = n, this.next();
  }
  /**
   * @return {Item | GC | Skip |null}
   */
  next() {
    do
      this.curr = this.gen.next().value || null;
    while (this.filterSkips && this.curr !== null && this.curr.constructor === Ot);
    return this.curr;
  }
}
class Cg {
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  constructor(e) {
    this.currClient = 0, this.startClock = 0, this.written = 0, this.encoder = e, this.clientStructs = [];
  }
}
const Ef = (t, e = yf, n = li) => {
  const r = new e(), i = new Sf(new n(bi(t)), !1);
  let o = i.curr;
  if (o !== null) {
    let c = 0, l = o.id.client, d = o.id.clock !== 0, h = d ? 0 : o.id.clock + o.length;
    for (; o !== null; o = i.next())
      l !== o.id.client && (h !== 0 && (c++, pe(r.restEncoder, l), pe(r.restEncoder, h)), l = o.id.client, h = 0, d = o.id.clock !== 0), o.constructor === Ot && (d = !0), d || (h = o.id.clock + o.length);
    h !== 0 && (c++, pe(r.restEncoder, l), pe(r.restEncoder, h));
    const f = br();
    return pe(f, c), gy(f, r.restEncoder), r.restEncoder = f, r.toUint8Array();
  } else
    return pe(r.restEncoder, 0), r.toUint8Array();
}, Ig = (t, e) => {
  if (t.constructor === It) {
    const { client: n, clock: r } = t.id;
    return new It(Ce(n, r + e), t.length - e);
  } else if (t.constructor === Ot) {
    const { client: n, clock: r } = t.id;
    return new Ot(Ce(n, r + e), t.length - e);
  } else {
    const n = (
      /** @type {Item} */
      t
    ), { client: r, clock: i } = n.id;
    return new ze(
      Ce(r, i + e),
      null,
      Ce(r, i + e - 1),
      null,
      n.rightOrigin,
      n.parent,
      n.parentSub,
      n.content.splice(e)
    );
  }
}, Cs = (t, e = li, n = Hs) => {
  if (t.length === 1)
    return t[0];
  const r = t.map((f) => new e(bi(f)));
  let i = r.map((f) => new Sf(f, !0)), o = null;
  const c = new n(), l = new Cg(c);
  for (; i = i.filter((m) => m.curr !== null), i.sort(
    /** @type {function(any,any):number} */
    (m, b) => {
      if (m.curr.id.client === b.curr.id.client) {
        const w = m.curr.id.clock - b.curr.id.clock;
        return w === 0 ? m.curr.constructor === b.curr.constructor ? 0 : m.curr.constructor === Ot ? 1 : -1 : w;
      } else
        return b.curr.id.client - m.curr.id.client;
    }
  ), i.length !== 0; ) {
    const f = i[0], g = (
      /** @type {Item | GC} */
      f.curr.id.client
    );
    if (o !== null) {
      let m = (
        /** @type {Item | GC | null} */
        f.curr
      ), b = !1;
      for (; m !== null && m.id.clock + m.length <= o.struct.id.clock + o.struct.length && m.id.client >= o.struct.id.client; )
        m = f.next(), b = !0;
      if (m === null || // current decoder is empty
      m.id.client !== g || // check whether there is another decoder that has has updates from `firstClient`
      b && m.id.clock > o.struct.id.clock + o.struct.length)
        continue;
      if (g !== o.struct.id.client)
        Lr(l, o.struct, o.offset), o = { struct: m, offset: 0 }, f.next();
      else if (o.struct.id.clock + o.struct.length < m.id.clock)
        if (o.struct.constructor === Ot)
          o.struct.length = m.id.clock + m.length - o.struct.id.clock;
        else {
          Lr(l, o.struct, o.offset);
          const w = m.id.clock - o.struct.id.clock - o.struct.length;
          o = { struct: new Ot(Ce(g, o.struct.id.clock + o.struct.length), w), offset: 0 };
        }
      else {
        const w = o.struct.id.clock + o.struct.length - m.id.clock;
        w > 0 && (o.struct.constructor === Ot ? o.struct.length -= w : m = Ig(m, w)), o.struct.mergeWith(
          /** @type {any} */
          m
        ) || (Lr(l, o.struct, o.offset), o = { struct: m, offset: 0 }, f.next());
      }
    } else
      o = { struct: (
        /** @type {Item | GC} */
        f.curr
      ), offset: 0 }, f.next();
    for (let m = f.curr; m !== null && m.id.client === g && m.id.clock === o.struct.id.clock + o.struct.length && m.constructor !== Ot; m = f.next())
      Lr(l, o.struct, o.offset), o = { struct: m, offset: 0 };
  }
  o !== null && (Lr(l, o.struct, o.offset), o = null), Og(l);
  const d = r.map((f) => lg(f)), h = cg(d);
  return tc(c, h), c.toUint8Array();
}, xf = (t) => {
  t.written > 0 && (t.clientStructs.push({ written: t.written, restEncoder: At(t.encoder.restEncoder) }), t.encoder.restEncoder = br(), t.written = 0);
}, Lr = (t, e, n) => {
  t.written > 0 && t.currClient !== e.id.client && xf(t), t.written === 0 && (t.currClient = e.id.client, t.encoder.writeClient(e.id.client), pe(t.encoder.restEncoder, e.id.clock + n)), e.write(t.encoder, n), t.written++;
}, Og = (t) => {
  xf(t);
  const e = t.encoder.restEncoder;
  pe(e, t.clientStructs.length);
  for (let n = 0; n < t.clientStructs.length; n++) {
    const r = t.clientStructs[n];
    pe(e, r.written), vi(e, r.restEncoder);
  }
}, Al = "You must not compute changes after the event-handler fired.";
class zs {
  /**
   * @param {T} target The changed type.
   * @param {Transaction} transaction
   */
  constructor(e, n) {
    this.target = e, this.currentTarget = e, this.transaction = n, this._changes = null, this._keys = null, this._delta = null, this._path = null;
  }
  /**
   * Computes the path from `y` to the changed type.
   *
   * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
   *
   * The following property holds:
   * @example
   *   let type = y
   *   event.path.forEach(dir => {
   *     type = type.get(dir)
   *   })
   *   type === event.target // => true
   */
  get path() {
    return this._path || (this._path = Ag(this.currentTarget, this.target));
  }
  /**
   * Check if a struct is deleted by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  deletes(e) {
    return hf(this.transaction.deleteSet, e.id);
  }
  /**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any, newValue: any }>}
   */
  get keys() {
    if (this._keys === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw kn(Al);
      const e = /* @__PURE__ */ new Map(), n = this.target;
      /** @type Set<string|null> */
      this.transaction.changed.get(n).forEach((i) => {
        if (i !== null) {
          const o = (
            /** @type {Item} */
            n._map.get(i)
          );
          let c, l;
          if (this.adds(o)) {
            let d = o.left;
            for (; d !== null && this.adds(d); )
              d = d.left;
            if (this.deletes(o))
              if (d !== null && this.deletes(d))
                c = "delete", l = Fo(d.content.getContent());
              else
                return;
            else
              d !== null && this.deletes(d) ? (c = "update", l = Fo(d.content.getContent())) : (c = "add", l = void 0);
          } else if (this.deletes(o))
            c = "delete", l = Fo(
              /** @type {Item} */
              o.content.getContent()
            );
          else
            return;
          e.set(i, { action: c, oldValue: l });
        }
      }), this._keys = e;
    }
    return this._keys;
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
   */
  get delta() {
    return this.changes.delta;
  }
  /**
   * Check if a struct is added by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */
  adds(e) {
    return e.id.clock >= (this.transaction.beforeState.get(e.id.client) || 0);
  }
  /**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    let e = this._changes;
    if (e === null) {
      if (this.transaction.doc._transactionCleanups.length === 0)
        throw kn(Al);
      const n = this.target, r = Fn(), i = Fn(), o = [];
      if (e = {
        added: r,
        deleted: i,
        delta: o,
        keys: this.keys
      }, /** @type Set<string|null> */
      this.transaction.changed.get(n).has(null)) {
        let l = null;
        const d = () => {
          l && o.push(l);
        };
        for (let h = n._start; h !== null; h = h.right)
          h.deleted ? this.deletes(h) && !this.adds(h) && ((l === null || l.delete === void 0) && (d(), l = { delete: 0 }), l.delete += h.length, i.add(h)) : this.adds(h) ? ((l === null || l.insert === void 0) && (d(), l = { insert: [] }), l.insert = l.insert.concat(h.content.getContent()), r.add(h)) : ((l === null || l.retain === void 0) && (d(), l = { retain: 0 }), l.retain += h.length);
        l !== null && l.retain === void 0 && d();
      }
      this._changes = e;
    }
    return (
      /** @type {any} */
      e
    );
  }
}
const Ag = (t, e) => {
  const n = [];
  for (; e._item !== null && e !== t; ) {
    if (e._item.parentSub !== null)
      n.unshift(e._item.parentSub);
    else {
      let r = 0, i = (
        /** @type {AbstractType<any>} */
        e._item.parent._start
      );
      for (; i !== e._item && i !== null; )
        !i.deleted && i.countable && (r += i.length), i = i.right;
      n.unshift(r);
    }
    e = /** @type {AbstractType<any>} */
    e._item.parent;
  }
  return n;
}, ft = () => {
  sg("Invalid access: Add Yjs type to a document before reading data.");
}, Cf = 80;
let rc = 0;
class Dg {
  /**
   * @param {Item} p
   * @param {number} index
   */
  constructor(e, n) {
    e.marker = !0, this.p = e, this.index = n, this.timestamp = rc++;
  }
}
const Tg = (t) => {
  t.timestamp = rc++;
}, If = (t, e, n) => {
  t.p.marker = !1, t.p = e, e.marker = !0, t.index = n, t.timestamp = rc++;
}, Rg = (t, e, n) => {
  if (t.length >= Cf) {
    const r = t.reduce((i, o) => i.timestamp < o.timestamp ? i : o);
    return If(r, e, n), r;
  } else {
    const r = new Dg(e, n);
    return t.push(r), r;
  }
}, Ys = (t, e) => {
  if (t._start === null || e === 0 || t._searchMarker === null)
    return null;
  const n = t._searchMarker.length === 0 ? null : t._searchMarker.reduce((o, c) => cs(e - o.index) < cs(e - c.index) ? o : c);
  let r = t._start, i = 0;
  for (n !== null && (r = n.p, i = n.index, Tg(n)); r.right !== null && i < e; ) {
    if (!r.deleted && r.countable) {
      if (e < i + r.length)
        break;
      i += r.length;
    }
    r = r.right;
  }
  for (; r.left !== null && i > e; )
    r = r.left, !r.deleted && r.countable && (i -= r.length);
  for (; r.left !== null && r.left.id.client === r.id.client && r.left.id.clock + r.left.length === r.id.clock; )
    r = r.left, !r.deleted && r.countable && (i -= r.length);
  return n !== null && cs(n.index - i) < /** @type {YText|YArray<any>} */
  r.parent.length / Cf ? (If(n, r, i), n) : Rg(t._searchMarker, r, i);
}, ui = (t, e, n) => {
  for (let r = t.length - 1; r >= 0; r--) {
    const i = t[r];
    if (n > 0) {
      let o = i.p;
      for (o.marker = !1; o && (o.deleted || !o.countable); )
        o = o.left, o && !o.deleted && o.countable && (i.index -= o.length);
      if (o === null || o.marker === !0) {
        t.splice(r, 1);
        continue;
      }
      i.p = o, o.marker = !0;
    }
    (e < i.index || n > 0 && e === i.index) && (i.index = vr(e, i.index + n));
  }
}, Gs = (t, e, n) => {
  const r = t, i = e.changedParentTypes;
  for (; sn(i, t, () => []).push(n), t._item !== null; )
    t = /** @type {AbstractType<any>} */
    t._item.parent;
  vf(r._eH, n, e);
};
class rt {
  constructor() {
    this._item = null, this._map = /* @__PURE__ */ new Map(), this._start = null, this.doc = null, this._length = 0, this._eH = Sl(), this._dEH = Sl(), this._searchMarker = null;
  }
  /**
   * @return {AbstractType<any>|null}
   */
  get parent() {
    return this._item ? (
      /** @type {AbstractType<any>} */
      this._item.parent
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item|null} item
   */
  _integrate(e, n) {
    this.doc = e, this._item = n;
  }
  /**
   * @return {AbstractType<EventType>}
   */
  _copy() {
    throw $t();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {AbstractType<EventType>}
   */
  clone() {
    throw $t();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
   */
  _write(e) {
  }
  /**
   * The first non-deleted item
   */
  get _first() {
    let e = this._start;
    for (; e !== null && e.deleted; )
      e = e.right;
    return e;
  }
  /**
   * Creates YEvent and calls all type observers.
   * Must be implemented by each type.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, n) {
    !e.local && this._searchMarker && (this._searchMarker.length = 0);
  }
  /**
   * Observe all events that are created on this type.
   *
   * @param {function(EventType, Transaction):void} f Observer function
   */
  observe(e) {
    El(this._eH, e);
  }
  /**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  observeDeep(e) {
    El(this._dEH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */
  unobserve(e) {
    xl(this._eH, e);
  }
  /**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */
  unobserveDeep(e) {
    xl(this._dEH, e);
  }
  /**
   * @abstract
   * @return {any}
   */
  toJSON() {
  }
}
const Of = (t, e, n) => {
  t.doc ?? ft(), e < 0 && (e = t._length + e), n < 0 && (n = t._length + n);
  let r = n - e;
  const i = [];
  let o = t._start;
  for (; o !== null && r > 0; ) {
    if (o.countable && !o.deleted) {
      const c = o.content.getContent();
      if (c.length <= e)
        e -= c.length;
      else {
        for (let l = e; l < c.length && r > 0; l++)
          i.push(c[l]), r--;
        e = 0;
      }
    }
    o = o.right;
  }
  return i;
}, Af = (t) => {
  t.doc ?? ft();
  const e = [];
  let n = t._start;
  for (; n !== null; ) {
    if (n.countable && !n.deleted) {
      const r = n.content.getContent();
      for (let i = 0; i < r.length; i++)
        e.push(r[i]);
    }
    n = n.right;
  }
  return e;
}, fi = (t, e) => {
  let n = 0, r = t._start;
  for (t.doc ?? ft(); r !== null; ) {
    if (r.countable && !r.deleted) {
      const i = r.content.getContent();
      for (let o = 0; o < i.length; o++)
        e(i[o], n++, t);
    }
    r = r.right;
  }
}, Df = (t, e) => {
  const n = [];
  return fi(t, (r, i) => {
    n.push(e(r, i, t));
  }), n;
}, Pg = (t) => {
  let e = t._start, n = null, r = 0;
  return {
    [Symbol.iterator]() {
      return this;
    },
    next: () => {
      if (n === null) {
        for (; e !== null && e.deleted; )
          e = e.right;
        if (e === null)
          return {
            done: !0,
            value: void 0
          };
        n = e.content.getContent(), r = 0, e = e.right;
      }
      const i = n[r++];
      return n.length <= r && (n = null), {
        done: !1,
        value: i
      };
    }
  };
}, Tf = (t, e) => {
  t.doc ?? ft();
  const n = Ys(t, e);
  let r = t._start;
  for (n !== null && (r = n.p, e -= n.index); r !== null; r = r.right)
    if (!r.deleted && r.countable) {
      if (e < r.length)
        return r.content.getContent()[e];
      e -= r.length;
    }
}, Is = (t, e, n, r) => {
  let i = n;
  const o = t.doc, c = o.clientID, l = o.store, d = n === null ? e._start : n.right;
  let h = [];
  const f = () => {
    h.length > 0 && (i = new ze(Ce(c, et(l, c)), i, i && i.lastId, d, d && d.id, e, null, new Vn(h)), i.integrate(t, 0), h = []);
  };
  r.forEach((g) => {
    if (g === null)
      h.push(g);
    else
      switch (g.constructor) {
        case Number:
        case Object:
        case Boolean:
        case Array:
        case String:
          h.push(g);
          break;
        default:
          switch (f(), g.constructor) {
            case Uint8Array:
            case ArrayBuffer:
              i = new ze(Ce(c, et(l, c)), i, i && i.lastId, d, d && d.id, e, null, new wi(new Uint8Array(
                /** @type {Uint8Array} */
                g
              ))), i.integrate(t, 0);
              break;
            case wr:
              i = new ze(Ce(c, et(l, c)), i, i && i.lastId, d, d && d.id, e, null, new _i(
                /** @type {Doc} */
                g
              )), i.integrate(t, 0);
              break;
            default:
              if (g instanceof rt)
                i = new ze(Ce(c, et(l, c)), i, i && i.lastId, d, d && d.id, e, null, new an(g)), i.integrate(t, 0);
              else
                throw new Error("Unexpected content type in insert operation");
          }
      }
  }), f();
}, Rf = () => kn("Length exceeded!"), Pf = (t, e, n, r) => {
  if (n > e._length)
    throw Rf();
  if (n === 0)
    return e._searchMarker && ui(e._searchMarker, n, r.length), Is(t, e, null, r);
  const i = n, o = Ys(e, n);
  let c = e._start;
  for (o !== null && (c = o.p, n -= o.index, n === 0 && (c = c.prev, n += c && c.countable && !c.deleted ? c.length : 0)); c !== null; c = c.right)
    if (!c.deleted && c.countable) {
      if (n <= c.length) {
        n < c.length && Sn(t, Ce(c.id.client, c.id.clock + n));
        break;
      }
      n -= c.length;
    }
  return e._searchMarker && ui(e._searchMarker, i, r.length), Is(t, e, c, r);
}, Ug = (t, e, n) => {
  let i = (e._searchMarker || []).reduce((o, c) => c.index > o.index ? c : o, { index: 0, p: e._start }).p;
  if (i)
    for (; i.right; )
      i = i.right;
  return Is(t, e, i, n);
}, Uf = (t, e, n, r) => {
  if (r === 0)
    return;
  const i = n, o = r, c = Ys(e, n);
  let l = e._start;
  for (c !== null && (l = c.p, n -= c.index); l !== null && n > 0; l = l.right)
    !l.deleted && l.countable && (n < l.length && Sn(t, Ce(l.id.client, l.id.clock + n)), n -= l.length);
  for (; r > 0 && l !== null; )
    l.deleted || (r < l.length && Sn(t, Ce(l.id.client, l.id.clock + r)), l.delete(t), r -= l.length), l = l.right;
  if (r > 0)
    throw Rf();
  e._searchMarker && ui(
    e._searchMarker,
    i,
    -o + r
    /* in case we remove the above exception */
  );
}, Os = (t, e, n) => {
  const r = e._map.get(n);
  r !== void 0 && r.delete(t);
}, ic = (t, e, n, r) => {
  const i = e._map.get(n) || null, o = t.doc, c = o.clientID;
  let l;
  if (r == null)
    l = new Vn([r]);
  else
    switch (r.constructor) {
      case Number:
      case Object:
      case Boolean:
      case Array:
      case String:
      case Date:
      case BigInt:
        l = new Vn([r]);
        break;
      case Uint8Array:
        l = new wi(
          /** @type {Uint8Array} */
          r
        );
        break;
      case wr:
        l = new _i(
          /** @type {Doc} */
          r
        );
        break;
      default:
        if (r instanceof rt)
          l = new an(r);
        else
          throw new Error("Unexpected content type");
    }
  new ze(Ce(c, et(o.store, c)), i, i && i.lastId, null, null, e, n, l).integrate(t, 0);
}, sc = (t, e) => {
  t.doc ?? ft();
  const n = t._map.get(e);
  return n !== void 0 && !n.deleted ? n.content.getContent()[n.length - 1] : void 0;
}, jf = (t) => {
  const e = {};
  return t.doc ?? ft(), t._map.forEach((n, r) => {
    n.deleted || (e[r] = n.content.getContent()[n.length - 1]);
  }), e;
}, Lf = (t, e) => {
  t.doc ?? ft();
  const n = t._map.get(e);
  return n !== void 0 && !n.deleted;
}, jg = (t, e) => {
  const n = {};
  return t._map.forEach((r, i) => {
    let o = r;
    for (; o !== null && (!e.sv.has(o.id.client) || o.id.clock >= (e.sv.get(o.id.client) || 0)); )
      o = o.left;
    o !== null && tr(o, e) && (n[i] = o.content.getContent()[o.length - 1]);
  }), n;
}, Qi = (t) => (t.doc ?? ft(), og(
  t._map.entries(),
  /** @param {any} entry */
  (e) => !e[1].deleted
));
class Lg extends zs {
}
class or extends rt {
  constructor() {
    super(), this._prelimContent = [], this._searchMarker = [];
  }
  /**
   * Construct a new YArray containing the specified items.
   * @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
   * @param {Array<T>} items
   * @return {YArray<T>}
   */
  static from(e) {
    const n = new or();
    return n.push(e), n;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, n) {
    super._integrate(e, n), this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    ), this._prelimContent = null;
  }
  /**
   * @return {YArray<T>}
   */
  _copy() {
    return new or();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YArray<T>}
   */
  clone() {
    const e = new or();
    return e.insert(0, this.toArray().map(
      (n) => n instanceof rt ? (
        /** @type {typeof el} */
        n.clone()
      ) : n
    )), e;
  }
  get length() {
    return this.doc ?? ft(), this._length;
  }
  /**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, n) {
    super._callObserver(e, n), Gs(this, e, new Lg(this, e));
  }
  /**
   * Inserts new content at an index.
   *
   * Important: This function expects an array of content. Not just a content
   * object. The reason for this "weirdness" is that inserting several elements
   * is very efficient when it is done as a single operation.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  yarray.insert(0, ['a'])
   *  // Insert numbers 1, 2 at position 1
   *  yarray.insert(1, [1, 2])
   *
   * @param {number} index The index to insert content at.
   * @param {Array<T>} content The array of content
   */
  insert(e, n) {
    this.doc !== null ? Ue(this.doc, (r) => {
      Pf(
        r,
        this,
        e,
        /** @type {any} */
        n
      );
    }) : this._prelimContent.splice(e, 0, ...n);
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<T>} content Array of content to append.
   *
   * @todo Use the following implementation in all types.
   */
  push(e) {
    this.doc !== null ? Ue(this.doc, (n) => {
      Ug(
        n,
        this,
        /** @type {any} */
        e
      );
    }) : this._prelimContent.push(...e);
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<T>} content Array of content to prepend.
   */
  unshift(e) {
    this.insert(0, e);
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} length The number of elements to remove. Defaults to 1.
   */
  delete(e, n = 1) {
    this.doc !== null ? Ue(this.doc, (r) => {
      Uf(r, this, e, n);
    }) : this._prelimContent.splice(e, n);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */
  get(e) {
    return Tf(this, e);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<T>}
   */
  toArray() {
    return Af(this);
  }
  /**
   * Returns a portion of this YArray into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<T>}
   */
  slice(e = 0, n = this.length) {
    return Of(this, e, n);
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Array<any>}
   */
  toJSON() {
    return this.map((e) => e instanceof rt ? e.toJSON() : e);
  }
  /**
   * Returns an Array with the result of calling a provided function on every
   * element of this YArray.
   *
   * @template M
   * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
   * @return {Array<M>} A new array with each element being the result of the
   *                 callback function
   */
  map(e) {
    return Df(
      this,
      /** @type {any} */
      e
    );
  }
  /**
   * Executes a provided function once on every element of this YArray.
   *
   * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    fi(this, e);
  }
  /**
   * @return {IterableIterator<T>}
   */
  [Symbol.iterator]() {
    return Pg(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(am);
  }
}
const Ng = (t) => new or();
class Mg extends zs {
  /**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
  constructor(e, n, r) {
    super(e, n), this.keysChanged = r;
  }
}
class fr extends rt {
  /**
   *
   * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
   */
  constructor(e) {
    super(), this._prelimContent = null, e === void 0 ? this._prelimContent = /* @__PURE__ */ new Map() : this._prelimContent = new Map(e);
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, n) {
    super._integrate(e, n), this._prelimContent.forEach((r, i) => {
      this.set(i, r);
    }), this._prelimContent = null;
  }
  /**
   * @return {YMap<MapType>}
   */
  _copy() {
    return new fr();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YMap<MapType>}
   */
  clone() {
    const e = new fr();
    return this.forEach((n, r) => {
      e.set(r, n instanceof rt ? (
        /** @type {typeof value} */
        n.clone()
      ) : n);
    }), e;
  }
  /**
   * Creates YMapEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, n) {
    Gs(this, e, new Mg(this, e, n));
  }
  /**
   * Transforms this Shared Type to a JSON object.
   *
   * @return {Object<string,any>}
   */
  toJSON() {
    this.doc ?? ft();
    const e = {};
    return this._map.forEach((n, r) => {
      if (!n.deleted) {
        const i = n.content.getContent()[n.length - 1];
        e[r] = i instanceof rt ? i.toJSON() : i;
      }
    }), e;
  }
  /**
   * Returns the size of the YMap (count of key/value pairs)
   *
   * @return {number}
   */
  get size() {
    return [...Qi(this)].length;
  }
  /**
   * Returns the keys for each element in the YMap Type.
   *
   * @return {IterableIterator<string>}
   */
  keys() {
    return zo(
      Qi(this),
      /** @param {any} v */
      (e) => e[0]
    );
  }
  /**
   * Returns the values for each element in the YMap Type.
   *
   * @return {IterableIterator<MapType>}
   */
  values() {
    return zo(
      Qi(this),
      /** @param {any} v */
      (e) => e[1].content.getContent()[e[1].length - 1]
    );
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  entries() {
    return zo(
      Qi(this),
      /** @param {any} v */
      (e) => (
        /** @type {any} */
        [e[0], e[1].content.getContent()[e[1].length - 1]]
      )
    );
  }
  /**
   * Executes a provided function on once on every key-value pair.
   *
   * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    this.doc ?? ft(), this._map.forEach((n, r) => {
      n.deleted || e(n.content.getContent()[n.length - 1], r, this);
    });
  }
  /**
   * Returns an Iterator of [key, value] pairs
   *
   * @return {IterableIterator<[string, MapType]>}
   */
  [Symbol.iterator]() {
    return this.entries();
  }
  /**
   * Remove a specified element from this YMap.
   *
   * @param {string} key The key of the element to remove.
   */
  delete(e) {
    this.doc !== null ? Ue(this.doc, (n) => {
      Os(n, this, e);
    }) : this._prelimContent.delete(e);
  }
  /**
   * Adds or updates an element with a specified key and value.
   * @template {MapType} VAL
   *
   * @param {string} key The key of the element to add to this YMap
   * @param {VAL} value The value of the element to add
   * @return {VAL}
   */
  set(e, n) {
    return this.doc !== null ? Ue(this.doc, (r) => {
      ic(
        r,
        this,
        e,
        /** @type {any} */
        n
      );
    }) : this._prelimContent.set(e, n), n;
  }
  /**
   * Returns a specified element from this YMap.
   *
   * @param {string} key
   * @return {MapType|undefined}
   */
  get(e) {
    return (
      /** @type {any} */
      sc(this, e)
    );
  }
  /**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */
  has(e) {
    return Lf(this, e);
  }
  /**
   * Removes all elements from this YMap.
   */
  clear() {
    this.doc !== null ? Ue(this.doc, (e) => {
      this.forEach(function(n, r, i) {
        Os(e, i, r);
      });
    }) : this._prelimContent.clear();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(cm);
  }
}
const Kg = (t) => new fr(), yn = (t, e) => t === e || typeof t == "object" && typeof e == "object" && t && e && $y(t, e);
class xa {
  /**
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {number} index
   * @param {Map<string,any>} currentAttributes
   */
  constructor(e, n, r, i) {
    this.left = e, this.right = n, this.index = r, this.currentAttributes = i;
  }
  /**
   * Only call this if you know that this.right is defined
   */
  forward() {
    switch (this.right === null && Ft(), this.right.content.constructor) {
      case Ge:
        this.right.deleted || _r(
          this.currentAttributes,
          /** @type {ContentFormat} */
          this.right.content
        );
        break;
      default:
        this.right.deleted || (this.index += this.right.length);
        break;
    }
    this.left = this.right, this.right = this.right.right;
  }
}
const Dl = (t, e, n) => {
  for (; e.right !== null && n > 0; ) {
    switch (e.right.content.constructor) {
      case Ge:
        e.right.deleted || _r(
          e.currentAttributes,
          /** @type {ContentFormat} */
          e.right.content
        );
        break;
      default:
        e.right.deleted || (n < e.right.length && Sn(t, Ce(e.right.id.client, e.right.id.clock + n)), e.index += e.right.length, n -= e.right.length);
        break;
    }
    e.left = e.right, e.right = e.right.right;
  }
  return e;
}, Zi = (t, e, n, r) => {
  const i = /* @__PURE__ */ new Map(), o = r ? Ys(e, n) : null;
  if (o) {
    const c = new xa(o.p.left, o.p, o.index, i);
    return Dl(t, c, n - o.index);
  } else {
    const c = new xa(null, e._start, 0, i);
    return Dl(t, c, n);
  }
}, Nf = (t, e, n, r) => {
  for (; n.right !== null && (n.right.deleted === !0 || n.right.content.constructor === Ge && yn(
    r.get(
      /** @type {ContentFormat} */
      n.right.content.key
    ),
    /** @type {ContentFormat} */
    n.right.content.value
  )); )
    n.right.deleted || r.delete(
      /** @type {ContentFormat} */
      n.right.content.key
    ), n.forward();
  const i = t.doc, o = i.clientID;
  r.forEach((c, l) => {
    const d = n.left, h = n.right, f = new ze(Ce(o, et(i.store, o)), d, d && d.lastId, h, h && h.id, e, null, new Ge(l, c));
    f.integrate(t, 0), n.right = f, n.forward();
  });
}, _r = (t, e) => {
  const { key: n, value: r } = e;
  r === null ? t.delete(n) : t.set(n, r);
}, Mf = (t, e) => {
  for (; t.right !== null; ) {
    if (!(t.right.deleted || t.right.content.constructor === Ge && yn(
      e[
        /** @type {ContentFormat} */
        t.right.content.key
      ] ?? null,
      /** @type {ContentFormat} */
      t.right.content.value
    )))
      break;
    t.forward();
  }
}, Kf = (t, e, n, r) => {
  const i = t.doc, o = i.clientID, c = /* @__PURE__ */ new Map();
  for (const l in r) {
    const d = r[l], h = n.currentAttributes.get(l) ?? null;
    if (!yn(h, d)) {
      c.set(l, h);
      const { left: f, right: g } = n;
      n.right = new ze(Ce(o, et(i.store, o)), f, f && f.lastId, g, g && g.id, e, null, new Ge(l, d)), n.right.integrate(t, 0), n.forward();
    }
  }
  return c;
}, Go = (t, e, n, r, i) => {
  n.currentAttributes.forEach((m, b) => {
    i[b] === void 0 && (i[b] = null);
  });
  const o = t.doc, c = o.clientID;
  Mf(n, i);
  const l = Kf(t, e, n, i), d = r.constructor === String ? new Vt(
    /** @type {string} */
    r
  ) : r instanceof rt ? new an(r) : new Wn(r);
  let { left: h, right: f, index: g } = n;
  e._searchMarker && ui(e._searchMarker, n.index, d.getLength()), f = new ze(Ce(c, et(o.store, c)), h, h && h.lastId, f, f && f.id, e, null, d), f.integrate(t, 0), n.right = f, n.index = g, n.forward(), Nf(t, e, n, l);
}, Tl = (t, e, n, r, i) => {
  const o = t.doc, c = o.clientID;
  Mf(n, i);
  const l = Kf(t, e, n, i);
  e:
    for (; n.right !== null && (r > 0 || l.size > 0 && (n.right.deleted || n.right.content.constructor === Ge)); ) {
      if (!n.right.deleted)
        switch (n.right.content.constructor) {
          case Ge: {
            const { key: d, value: h } = (
              /** @type {ContentFormat} */
              n.right.content
            ), f = i[d];
            if (f !== void 0) {
              if (yn(f, h))
                l.delete(d);
              else {
                if (r === 0)
                  break e;
                l.set(d, h);
              }
              n.right.delete(t);
            } else
              n.currentAttributes.set(d, h);
            break;
          }
          default:
            r < n.right.length && Sn(t, Ce(n.right.id.client, n.right.id.clock + r)), r -= n.right.length;
            break;
        }
      n.forward();
    }
  if (r > 0) {
    let d = "";
    for (; r > 0; r--)
      d += `
`;
    n.right = new ze(Ce(c, et(o.store, c)), n.left, n.left && n.left.lastId, n.right, n.right && n.right.id, e, null, new Vt(d)), n.right.integrate(t, 0), n.forward();
  }
  Nf(t, e, n, l);
}, Bf = (t, e, n, r, i) => {
  let o = e;
  const c = pt();
  for (; o && (!o.countable || o.deleted); ) {
    if (!o.deleted && o.content.constructor === Ge) {
      const h = (
        /** @type {ContentFormat} */
        o.content
      );
      c.set(h.key, h);
    }
    o = o.right;
  }
  let l = 0, d = !1;
  for (; e !== o; ) {
    if (n === e && (d = !0), !e.deleted) {
      const h = e.content;
      switch (h.constructor) {
        case Ge: {
          const { key: f, value: g } = (
            /** @type {ContentFormat} */
            h
          ), m = r.get(f) ?? null;
          (c.get(f) !== h || m === g) && (e.delete(t), l++, !d && (i.get(f) ?? null) === g && m !== g && (m === null ? i.delete(f) : i.set(f, m))), !d && !e.deleted && _r(
            i,
            /** @type {ContentFormat} */
            h
          );
          break;
        }
      }
    }
    e = /** @type {Item} */
    e.right;
  }
  return l;
}, Bg = (t, e) => {
  for (; e && e.right && (e.right.deleted || !e.right.countable); )
    e = e.right;
  const n = /* @__PURE__ */ new Set();
  for (; e && (e.deleted || !e.countable); ) {
    if (!e.deleted && e.content.constructor === Ge) {
      const r = (
        /** @type {ContentFormat} */
        e.content.key
      );
      n.has(r) ? e.delete(t) : n.add(r);
    }
    e = e.left;
  }
}, $g = (t) => {
  let e = 0;
  return Ue(
    /** @type {Doc} */
    t.doc,
    (n) => {
      let r = (
        /** @type {Item} */
        t._start
      ), i = t._start, o = pt();
      const c = va(o);
      for (; i; ) {
        if (i.deleted === !1)
          switch (i.content.constructor) {
            case Ge:
              _r(
                c,
                /** @type {ContentFormat} */
                i.content
              );
              break;
            default:
              e += Bf(n, r, i, o, c), o = va(c), r = i;
              break;
          }
        i = i.right;
      }
    }
  ), e;
}, Fg = (t) => {
  const e = /* @__PURE__ */ new Set(), n = t.doc;
  for (const [r, i] of t.afterState.entries()) {
    const o = t.beforeState.get(r) || 0;
    i !== o && _f(
      t,
      /** @type {Array<Item|GC>} */
      n.store.clients.get(r),
      o,
      i,
      (c) => {
        !c.deleted && /** @type {Item} */
        c.content.constructor === Ge && c.constructor !== It && e.add(
          /** @type {any} */
          c.parent
        );
      }
    );
  }
  Ue(n, (r) => {
    df(t, t.deleteSet, (i) => {
      if (i instanceof It || !/** @type {YText} */
      i.parent._hasFormatting || e.has(
        /** @type {YText} */
        i.parent
      ))
        return;
      const o = (
        /** @type {YText} */
        i.parent
      );
      i.content.constructor === Ge ? e.add(o) : Bg(r, i);
    });
    for (const i of e)
      $g(i);
  });
}, Rl = (t, e, n) => {
  const r = n, i = va(e.currentAttributes), o = e.right;
  for (; n > 0 && e.right !== null; ) {
    if (e.right.deleted === !1)
      switch (e.right.content.constructor) {
        case an:
        case Wn:
        case Vt:
          n < e.right.length && Sn(t, Ce(e.right.id.client, e.right.id.clock + n)), n -= e.right.length, e.right.delete(t);
          break;
      }
    e.forward();
  }
  o && Bf(t, o, e.right, i, e.currentAttributes);
  const c = (
    /** @type {AbstractType<any>} */
    /** @type {Item} */
    (e.left || e.right).parent
  );
  return c._searchMarker && ui(c._searchMarker, e.index, -r + n), e;
};
class qg extends zs {
  /**
   * @param {YText} ytext
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed
   */
  constructor(e, n, r) {
    super(e, n), this.childListChanged = !1, this.keysChanged = /* @__PURE__ */ new Set(), r.forEach((i) => {
      i === null ? this.childListChanged = !0 : this.keysChanged.add(i);
    });
  }
  /**
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */
  get changes() {
    if (this._changes === null) {
      const e = {
        keys: this.keys,
        delta: this.delta,
        added: /* @__PURE__ */ new Set(),
        deleted: /* @__PURE__ */ new Set()
      };
      this._changes = e;
    }
    return (
      /** @type {any} */
      this._changes
    );
  }
  /**
   * Compute the changes in the delta format.
   * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
   *
   * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
   *
   * @public
   */
  get delta() {
    if (this._delta === null) {
      const e = (
        /** @type {Doc} */
        this.target.doc
      ), n = [];
      Ue(e, (r) => {
        const i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map();
        let c = this.target._start, l = null;
        const d = {};
        let h = "", f = 0, g = 0;
        const m = () => {
          if (l !== null) {
            let b = null;
            switch (l) {
              case "delete":
                g > 0 && (b = { delete: g }), g = 0;
                break;
              case "insert":
                (typeof h == "object" || h.length > 0) && (b = { insert: h }, i.size > 0 && (b.attributes = {}, i.forEach((w, I) => {
                  w !== null && (b.attributes[I] = w);
                }))), h = "";
                break;
              case "retain":
                f > 0 && (b = { retain: f }, Ky(d) || (b.attributes = Ny({}, d))), f = 0;
                break;
            }
            b && n.push(b), l = null;
          }
        };
        for (; c !== null; ) {
          switch (c.content.constructor) {
            case an:
            case Wn:
              this.adds(c) ? this.deletes(c) || (m(), l = "insert", h = c.content.getContent()[0], m()) : this.deletes(c) ? (l !== "delete" && (m(), l = "delete"), g += 1) : c.deleted || (l !== "retain" && (m(), l = "retain"), f += 1);
              break;
            case Vt:
              this.adds(c) ? this.deletes(c) || (l !== "insert" && (m(), l = "insert"), h += /** @type {ContentString} */
              c.content.str) : this.deletes(c) ? (l !== "delete" && (m(), l = "delete"), g += c.length) : c.deleted || (l !== "retain" && (m(), l = "retain"), f += c.length);
              break;
            case Ge: {
              const { key: b, value: w } = (
                /** @type {ContentFormat} */
                c.content
              );
              if (this.adds(c)) {
                if (!this.deletes(c)) {
                  const I = i.get(b) ?? null;
                  yn(I, w) ? w !== null && c.delete(r) : (l === "retain" && m(), yn(w, o.get(b) ?? null) ? delete d[b] : d[b] = w);
                }
              } else if (this.deletes(c)) {
                o.set(b, w);
                const I = i.get(b) ?? null;
                yn(I, w) || (l === "retain" && m(), d[b] = I);
              } else if (!c.deleted) {
                o.set(b, w);
                const I = d[b];
                I !== void 0 && (yn(I, w) ? I !== null && c.delete(r) : (l === "retain" && m(), w === null ? delete d[b] : d[b] = w));
              }
              c.deleted || (l === "insert" && m(), _r(
                i,
                /** @type {ContentFormat} */
                c.content
              ));
              break;
            }
          }
          c = c.right;
        }
        for (m(); n.length > 0; ) {
          const b = n[n.length - 1];
          if (b.retain !== void 0 && b.attributes === void 0)
            n.pop();
          else
            break;
        }
      }), this._delta = n;
    }
    return (
      /** @type {any} */
      this._delta
    );
  }
}
class dr extends rt {
  /**
   * @param {String} [string] The initial value of the YText.
   */
  constructor(e) {
    super(), this._pending = e !== void 0 ? [() => this.insert(0, e)] : [], this._searchMarker = [], this._hasFormatting = !1;
  }
  /**
   * Number of characters of this text type.
   *
   * @type {number}
   */
  get length() {
    return this.doc ?? ft(), this._length;
  }
  /**
   * @param {Doc} y
   * @param {Item} item
   */
  _integrate(e, n) {
    super._integrate(e, n);
    try {
      this._pending.forEach((r) => r());
    } catch (r) {
      console.error(r);
    }
    this._pending = null;
  }
  _copy() {
    return new dr();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YText}
   */
  clone() {
    const e = new dr();
    return e.applyDelta(this.toDelta()), e;
  }
  /**
   * Creates YTextEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, n) {
    super._callObserver(e, n);
    const r = new qg(this, e, n);
    Gs(this, e, r), !e.local && this._hasFormatting && (e._needFormattingCleanup = !0);
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @public
   */
  toString() {
    this.doc ?? ft();
    let e = "", n = this._start;
    for (; n !== null; )
      !n.deleted && n.countable && n.content.constructor === Vt && (e += /** @type {ContentString} */
      n.content.str), n = n.right;
    return e;
  }
  /**
   * Returns the unformatted string representation of this YText type.
   *
   * @return {string}
   * @public
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Apply a {@link Delta} on this shared YText type.
   *
   * @param {Array<any>} delta The changes to apply on this element.
   * @param {object}  opts
   * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
   *
   *
   * @public
   */
  applyDelta(e, { sanitize: n = !0 } = {}) {
    this.doc !== null ? Ue(this.doc, (r) => {
      const i = new xa(null, this._start, 0, /* @__PURE__ */ new Map());
      for (let o = 0; o < e.length; o++) {
        const c = e[o];
        if (c.insert !== void 0) {
          const l = !n && typeof c.insert == "string" && o === e.length - 1 && i.right === null && c.insert.slice(-1) === `
` ? c.insert.slice(0, -1) : c.insert;
          (typeof l != "string" || l.length > 0) && Go(r, this, i, l, c.attributes || {});
        } else
          c.retain !== void 0 ? Tl(r, this, i, c.retain, c.attributes || {}) : c.delete !== void 0 && Rl(r, i, c.delete);
      }
    }) : this._pending.push(() => this.applyDelta(e));
  }
  /**
   * Returns the Delta representation of this YText type.
   *
   * @param {Snapshot} [snapshot]
   * @param {Snapshot} [prevSnapshot]
   * @param {function('removed' | 'added', ID):any} [computeYChange]
   * @return {any} The Delta representation of this type.
   *
   * @public
   */
  toDelta(e, n, r) {
    this.doc ?? ft();
    const i = [], o = /* @__PURE__ */ new Map(), c = (
      /** @type {Doc} */
      this.doc
    );
    let l = "", d = this._start;
    function h() {
      if (l.length > 0) {
        const g = {};
        let m = !1;
        o.forEach((w, I) => {
          m = !0, g[I] = w;
        });
        const b = { insert: l };
        m && (b.attributes = g), i.push(b), l = "";
      }
    }
    const f = () => {
      for (; d !== null; ) {
        if (tr(d, e) || n !== void 0 && tr(d, n))
          switch (d.content.constructor) {
            case Vt: {
              const g = o.get("ychange");
              e !== void 0 && !tr(d, e) ? (g === void 0 || g.user !== d.id.client || g.type !== "removed") && (h(), o.set("ychange", r ? r("removed", d.id) : { type: "removed" })) : n !== void 0 && !tr(d, n) ? (g === void 0 || g.user !== d.id.client || g.type !== "added") && (h(), o.set("ychange", r ? r("added", d.id) : { type: "added" })) : g !== void 0 && (h(), o.delete("ychange")), l += /** @type {ContentString} */
              d.content.str;
              break;
            }
            case an:
            case Wn: {
              h();
              const g = {
                insert: d.content.getContent()[0]
              };
              if (o.size > 0) {
                const m = (
                  /** @type {Object<string,any>} */
                  {}
                );
                g.attributes = m, o.forEach((b, w) => {
                  m[w] = b;
                });
              }
              i.push(g);
              break;
            }
            case Ge:
              tr(d, e) && (h(), _r(
                o,
                /** @type {ContentFormat} */
                d.content
              ));
              break;
          }
        d = d.right;
      }
      h();
    };
    return e || n ? Ue(c, (g) => {
      e && Sa(g, e), n && Sa(g, n), f();
    }, "cleanup") : f(), i;
  }
  /**
   * Insert text at a given index.
   *
   * @param {number} index The index at which to start inserting.
   * @param {String} text The text to insert at the specified position.
   * @param {TextAttributes} [attributes] Optionally define some formatting
   *                                    information to apply on the inserted
   *                                    Text.
   * @public
   */
  insert(e, n, r) {
    if (n.length <= 0)
      return;
    const i = this.doc;
    i !== null ? Ue(i, (o) => {
      const c = Zi(o, this, e, !r);
      r || (r = {}, c.currentAttributes.forEach((l, d) => {
        r[d] = l;
      })), Go(o, this, c, n, r);
    }) : this._pending.push(() => this.insert(e, n, r));
  }
  /**
   * Inserts an embed at a index.
   *
   * @param {number} index The index to insert the embed at.
   * @param {Object | AbstractType<any>} embed The Object that represents the embed.
   * @param {TextAttributes} [attributes] Attribute information to apply on the
   *                                    embed
   *
   * @public
   */
  insertEmbed(e, n, r) {
    const i = this.doc;
    i !== null ? Ue(i, (o) => {
      const c = Zi(o, this, e, !r);
      Go(o, this, c, n, r || {});
    }) : this._pending.push(() => this.insertEmbed(e, n, r || {}));
  }
  /**
   * Deletes text starting from an index.
   *
   * @param {number} index Index at which to start deleting.
   * @param {number} length The number of characters to remove. Defaults to 1.
   *
   * @public
   */
  delete(e, n) {
    if (n === 0)
      return;
    const r = this.doc;
    r !== null ? Ue(r, (i) => {
      Rl(i, Zi(i, this, e, !0), n);
    }) : this._pending.push(() => this.delete(e, n));
  }
  /**
   * Assigns properties to a range of text.
   *
   * @param {number} index The position where to start formatting.
   * @param {number} length The amount of characters to assign properties to.
   * @param {TextAttributes} attributes Attribute information to apply on the
   *                                    text.
   *
   * @public
   */
  format(e, n, r) {
    if (n === 0)
      return;
    const i = this.doc;
    i !== null ? Ue(i, (o) => {
      const c = Zi(o, this, e, !1);
      c.right !== null && Tl(o, this, c, n, r);
    }) : this._pending.push(() => this.format(e, n, r));
  }
  /**
   * Removes an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(e) {
    this.doc !== null ? Ue(this.doc, (n) => {
      Os(n, this, e);
    }) : this._pending.push(() => this.removeAttribute(e));
  }
  /**
   * Sets or updates an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be set.
   * @param {any} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(e, n) {
    this.doc !== null ? Ue(this.doc, (r) => {
      ic(r, this, e, n);
    }) : this._pending.push(() => this.setAttribute(e, n));
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {any} The queried attribute value.
   *
   * @public
   */
  getAttribute(e) {
    return (
      /** @type {any} */
      sc(this, e)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @return {Object<string, any>} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes() {
    return jf(this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(lm);
  }
}
const Vg = (t) => new dr();
class Jo {
  /**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
  constructor(e, n = () => !0) {
    this._filter = n, this._root = e, this._currentNode = /** @type {Item} */
    e._start, this._firstCall = !0, e.doc ?? ft();
  }
  [Symbol.iterator]() {
    return this;
  }
  /**
   * Get the next node.
   *
   * @return {IteratorResult<YXmlElement|YXmlText|YXmlHook>} The next node.
   *
   * @public
   */
  next() {
    let e = this._currentNode, n = e && e.content && /** @type {any} */
    e.content.type;
    if (e !== null && (!this._firstCall || e.deleted || !this._filter(n)))
      do
        if (n = /** @type {any} */
        e.content.type, !e.deleted && (n.constructor === hr || n.constructor === qn) && n._start !== null)
          e = n._start;
        else
          for (; e !== null; ) {
            const r = e.next;
            if (r !== null) {
              e = r;
              break;
            } else
              e.parent === this._root ? e = null : e = /** @type {AbstractType<any>} */
              e.parent._item;
          }
      while (e !== null && (e.deleted || !this._filter(
        /** @type {ContentType} */
        e.content.type
      )));
    return this._firstCall = !1, e === null ? { value: void 0, done: !0 } : (this._currentNode = e, { value: (
      /** @type {any} */
      e.content.type
    ), done: !1 });
  }
}
class qn extends rt {
  constructor() {
    super(), this._prelimContent = [];
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get firstChild() {
    const e = this._first;
    return e ? e.content.getContent()[0] : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, n) {
    super._integrate(e, n), this.insert(
      0,
      /** @type {Array<any>} */
      this._prelimContent
    ), this._prelimContent = null;
  }
  _copy() {
    return new qn();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlFragment}
   */
  clone() {
    const e = new qn();
    return e.insert(0, this.toArray().map((n) => n instanceof rt ? n.clone() : n)), e;
  }
  get length() {
    return this.doc ?? ft(), this._prelimContent === null ? this._length : this._prelimContent.length;
  }
  /**
   * Create a subtree of childNodes.
   *
   * @example
   * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
   * for (let node in walker) {
   *   // `node` is a div node
   *   nop(node)
   * }
   *
   * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
   *                          returns a Boolean indicating whether the child
   *                          is to be included in the subtree.
   * @return {YXmlTreeWalker} A subtree and a position within it.
   *
   * @public
   */
  createTreeWalker(e) {
    return new Jo(this, e);
  }
  /**
   * Returns the first YXmlElement that matches the query.
   * Similar to DOM's {@link querySelector}.
   *
   * Query support:
   *   - tagname
   * TODO:
   *   - id
   *   - attribute
   *
   * @param {CSS_Selector} query The query on the children.
   * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
   *
   * @public
   */
  querySelector(e) {
    e = e.toUpperCase();
    const r = new Jo(this, (i) => i.nodeName && i.nodeName.toUpperCase() === e).next();
    return r.done ? null : r.value;
  }
  /**
   * Returns all YXmlElements that match the query.
   * Similar to Dom's {@link querySelectorAll}.
   *
   * @todo Does not yet support all queries. Currently only query by tagName.
   *
   * @param {CSS_Selector} query The query on the children
   * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
   *
   * @public
   */
  querySelectorAll(e) {
    return e = e.toUpperCase(), _n(new Jo(this, (n) => n.nodeName && n.nodeName.toUpperCase() === e));
  }
  /**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */
  _callObserver(e, n) {
    Gs(this, e, new zg(this, n, e));
  }
  /**
   * Get the string representation of all the children of this YXmlFragment.
   *
   * @return {string} The string representation of all children.
   */
  toString() {
    return Df(this, (e) => e.toString()).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, n = {}, r) {
    const i = e.createDocumentFragment();
    return r !== void 0 && r._createAssociation(i, this), fi(this, (o) => {
      i.insertBefore(o.toDOM(e, n, r), null);
    }), i;
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {number} index The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insert(e, n) {
    this.doc !== null ? Ue(this.doc, (r) => {
      Pf(r, this, e, n);
    }) : this._prelimContent.splice(e, 0, ...n);
  }
  /**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */
  insertAfter(e, n) {
    if (this.doc !== null)
      Ue(this.doc, (r) => {
        const i = e && e instanceof rt ? e._item : e;
        Is(r, this, i, n);
      });
    else {
      const r = (
        /** @type {Array<any>} */
        this._prelimContent
      ), i = e === null ? 0 : r.findIndex((o) => o === e) + 1;
      if (i === 0 && e !== null)
        throw kn("Reference item not found");
      r.splice(i, 0, ...n);
    }
  }
  /**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} [length=1] The number of elements to remove. Defaults to 1.
   */
  delete(e, n = 1) {
    this.doc !== null ? Ue(this.doc, (r) => {
      Uf(r, this, e, n);
    }) : this._prelimContent.splice(e, n);
  }
  /**
   * Transforms this YArray to a JavaScript Array.
   *
   * @return {Array<YXmlElement|YXmlText|YXmlHook>}
   */
  toArray() {
    return Af(this);
  }
  /**
   * Appends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
   */
  push(e) {
    this.insert(this.length, e);
  }
  /**
   * Prepends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
   */
  unshift(e) {
    this.insert(0, e);
  }
  /**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {YXmlElement|YXmlText}
   */
  get(e) {
    return Tf(this, e);
  }
  /**
   * Returns a portion of this YXmlFragment into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<YXmlElement|YXmlText>}
   */
  slice(e = 0, n = this.length) {
    return Of(this, e, n);
  }
  /**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */
  forEach(e) {
    fi(this, e);
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(e) {
    e.writeTypeRef(fm);
  }
}
const Wg = (t) => new qn();
class hr extends qn {
  constructor(e = "UNDEFINED") {
    super(), this.nodeName = e, this._prelimAttrs = /* @__PURE__ */ new Map();
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const e = this._item ? this._item.next : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const e = this._item ? this._item.prev : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  /**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */
  _integrate(e, n) {
    super._integrate(e, n), /** @type {Map<string, any>} */
    this._prelimAttrs.forEach((r, i) => {
      this.setAttribute(i, r);
    }), this._prelimAttrs = null;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   *
   * @return {YXmlElement}
   */
  _copy() {
    return new hr(this.nodeName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlElement<KV>}
   */
  clone() {
    const e = new hr(this.nodeName), n = this.getAttributes();
    return My(n, (r, i) => {
      typeof r == "string" && e.setAttribute(i, r);
    }), e.insert(0, this.toArray().map((r) => r instanceof rt ? r.clone() : r)), e;
  }
  /**
   * Returns the XML serialization of this YXmlElement.
   * The attributes are ordered by attribute-name, so you can easily use this
   * method to compare YXmlElements
   *
   * @return {string} The string representation of this type.
   *
   * @public
   */
  toString() {
    const e = this.getAttributes(), n = [], r = [];
    for (const l in e)
      r.push(l);
    r.sort();
    const i = r.length;
    for (let l = 0; l < i; l++) {
      const d = r[l];
      n.push(d + '="' + e[d] + '"');
    }
    const o = this.nodeName.toLocaleLowerCase(), c = n.length > 0 ? " " + n.join(" ") : "";
    return `<${o}${c}>${super.toString()}</${o}>`;
  }
  /**
   * Removes an attribute from this YXmlElement.
   *
   * @param {string} attributeName The attribute name that is to be removed.
   *
   * @public
   */
  removeAttribute(e) {
    this.doc !== null ? Ue(this.doc, (n) => {
      Os(n, this, e);
    }) : this._prelimAttrs.delete(e);
  }
  /**
   * Sets or updates an attribute.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that is to be set.
   * @param {KV[KEY]} attributeValue The attribute value that is to be set.
   *
   * @public
   */
  setAttribute(e, n) {
    this.doc !== null ? Ue(this.doc, (r) => {
      ic(r, this, e, n);
    }) : this._prelimAttrs.set(e, n);
  }
  /**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {KV[KEY]|undefined} The queried attribute value.
   *
   * @public
   */
  getAttribute(e) {
    return (
      /** @type {any} */
      sc(this, e)
    );
  }
  /**
   * Returns whether an attribute exists
   *
   * @param {string} attributeName The attribute name to check for existence.
   * @return {boolean} whether the attribute exists.
   *
   * @public
   */
  hasAttribute(e) {
    return (
      /** @type {any} */
      Lf(this, e)
    );
  }
  /**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @param {Snapshot} [snapshot]
   * @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
   *
   * @public
   */
  getAttributes(e) {
    return (
      /** @type {any} */
      e ? jg(this, e) : jf(this)
    );
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, n = {}, r) {
    const i = e.createElement(this.nodeName), o = this.getAttributes();
    for (const c in o) {
      const l = o[c];
      typeof l == "string" && i.setAttribute(c, l);
    }
    return fi(this, (c) => {
      i.appendChild(c.toDOM(e, n, r));
    }), r !== void 0 && r._createAssociation(i, this), i;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(e) {
    e.writeTypeRef(um), e.writeKey(this.nodeName);
  }
}
const Hg = (t) => new hr(t.readKey());
class zg extends zs {
  /**
   * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
   * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
   *                   child list changed.
   * @param {Transaction} transaction The transaction instance with which the
   *                                  change was created.
   */
  constructor(e, n, r) {
    super(e, r), this.childListChanged = !1, this.attributesChanged = /* @__PURE__ */ new Set(), n.forEach((i) => {
      i === null ? this.childListChanged = !0 : this.attributesChanged.add(i);
    });
  }
}
class As extends fr {
  /**
   * @param {string} hookName nodeName of the Dom Node.
   */
  constructor(e) {
    super(), this.hookName = e;
  }
  /**
   * Creates an Item with the same effect as this Item (without position effect)
   */
  _copy() {
    return new As(this.hookName);
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlHook}
   */
  clone() {
    const e = new As(this.hookName);
    return this.forEach((n, r) => {
      e.set(r, n);
    }), e;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type
   * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, n = {}, r) {
    const i = n[this.hookName];
    let o;
    return i !== void 0 ? o = i.createDom(this) : o = document.createElement(this.hookName), o.setAttribute("data-yjs-hook", this.hookName), r !== void 0 && r._createAssociation(o, this), o;
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */
  _write(e) {
    e.writeTypeRef(dm), e.writeKey(this.hookName);
  }
}
const Yg = (t) => new As(t.readKey());
class Ds extends dr {
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get nextSibling() {
    const e = this._item ? this._item.next : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  /**
   * @type {YXmlElement|YXmlText|null}
   */
  get prevSibling() {
    const e = this._item ? this._item.prev : null;
    return e ? (
      /** @type {YXmlElement|YXmlText} */
      /** @type {ContentType} */
      e.content.type
    ) : null;
  }
  _copy() {
    return new Ds();
  }
  /**
   * Makes a copy of this data type that can be included somewhere else.
   *
   * Note that the content is only readable _after_ it has been included somewhere in the Ydoc.
   *
   * @return {YXmlText}
   */
  clone() {
    const e = new Ds();
    return e.applyDelta(this.toDelta()), e;
  }
  /**
   * Creates a Dom Element that mirrors this YXmlText.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */
  toDOM(e = document, n, r) {
    const i = e.createTextNode(this.toString());
    return r !== void 0 && r._createAssociation(i, this), i;
  }
  toString() {
    return this.toDelta().map((e) => {
      const n = [];
      for (const i in e.attributes) {
        const o = [];
        for (const c in e.attributes[i])
          o.push({ key: c, value: e.attributes[i][c] });
        o.sort((c, l) => c.key < l.key ? -1 : 1), n.push({ nodeName: i, attrs: o });
      }
      n.sort((i, o) => i.nodeName < o.nodeName ? -1 : 1);
      let r = "";
      for (let i = 0; i < n.length; i++) {
        const o = n[i];
        r += `<${o.nodeName}`;
        for (let c = 0; c < o.attrs.length; c++) {
          const l = o.attrs[c];
          r += ` ${l.key}="${l.value}"`;
        }
        r += ">";
      }
      r += e.insert;
      for (let i = n.length - 1; i >= 0; i--)
        r += `</${n[i].nodeName}>`;
      return r;
    }).join("");
  }
  /**
   * @return {string}
   */
  toJSON() {
    return this.toString();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
  _write(e) {
    e.writeTypeRef(hm);
  }
}
const Gg = (t) => new Ds();
class oc {
  /**
   * @param {ID} id
   * @param {number} length
   */
  constructor(e, n) {
    this.id = e, this.length = n;
  }
  /**
   * @type {boolean}
   */
  get deleted() {
    throw $t();
  }
  /**
   * Merge this struct with the item to the right.
   * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
   * Also this method does *not* remove right from StructStore!
   * @param {AbstractStruct} right
   * @return {boolean} whether this merged with right
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   * @param {number} encodingRef
   */
  write(e, n, r) {
    throw $t();
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, n) {
    throw $t();
  }
}
const Jg = 0;
class It extends oc {
  get deleted() {
    return !0;
  }
  delete() {
  }
  /**
   * @param {GC} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.constructor !== e.constructor ? !1 : (this.length += e.length, !0);
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, n) {
    n > 0 && (this.id.clock += n, this.length -= n), wf(e.doc.store, this);
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeInfo(Jg), e.writeLen(this.length - n);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, n) {
    return null;
  }
}
class wi {
  /**
   * @param {Uint8Array} content
   */
  constructor(e) {
    this.content = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.content];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentBinary}
   */
  copy() {
    return new wi(this.content);
  }
  /**
   * @param {number} offset
   * @return {ContentBinary}
   */
  splice(e) {
    throw $t();
  }
  /**
   * @param {ContentBinary} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeBuf(this.content);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 3;
  }
}
const Xg = (t) => new wi(t.readBuf());
class di {
  /**
   * @param {number} len
   */
  constructor(e) {
    this.len = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.len;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !1;
  }
  /**
   * @return {ContentDeleted}
   */
  copy() {
    return new di(this.len);
  }
  /**
   * @param {number} offset
   * @return {ContentDeleted}
   */
  splice(e) {
    const n = new di(this.len - e);
    return this.len = e, n;
  }
  /**
   * @param {ContentDeleted} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.len += e.len, !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
    xs(e.deleteSet, n.id.client, n.id.clock, this.len), n.markDeleted();
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeLen(this.len - n);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 1;
  }
}
const Qg = (t) => new di(t.readLen()), $f = (t, e) => new wr({ guid: t, ...e, shouldLoad: e.shouldLoad || e.autoLoad || !1 });
class _i {
  /**
   * @param {Doc} doc
   */
  constructor(e) {
    e._item && console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid."), this.doc = e;
    const n = {};
    this.opts = n, e.gc || (n.gc = !1), e.autoLoad && (n.autoLoad = !0), e.meta !== null && (n.meta = e.meta);
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.doc];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentDoc}
   */
  copy() {
    return new _i($f(this.doc.guid, this.opts));
  }
  /**
   * @param {number} offset
   * @return {ContentDoc}
   */
  splice(e) {
    throw $t();
  }
  /**
   * @param {ContentDoc} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
    this.doc._item = n, e.subdocsAdded.add(this.doc), this.doc.shouldLoad && e.subdocsLoaded.add(this.doc);
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
    e.subdocsAdded.has(this.doc) ? e.subdocsAdded.delete(this.doc) : e.subdocsRemoved.add(this.doc);
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeString(this.doc.guid), e.writeAny(this.opts);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 9;
  }
}
const Zg = (t) => new _i($f(t.readString(), t.readAny()));
class Wn {
  /**
   * @param {Object} embed
   */
  constructor(e) {
    this.embed = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.embed];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentEmbed}
   */
  copy() {
    return new Wn(this.embed);
  }
  /**
   * @param {number} offset
   * @return {ContentEmbed}
   */
  splice(e) {
    throw $t();
  }
  /**
   * @param {ContentEmbed} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeJSON(this.embed);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 5;
  }
}
const em = (t) => new Wn(t.readJSON());
class Ge {
  /**
   * @param {string} key
   * @param {Object} value
   */
  constructor(e, n) {
    this.key = e, this.value = n;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !1;
  }
  /**
   * @return {ContentFormat}
   */
  copy() {
    return new Ge(this.key, this.value);
  }
  /**
   * @param {number} _offset
   * @return {ContentFormat}
   */
  splice(e) {
    throw $t();
  }
  /**
   * @param {ContentFormat} _right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} _transaction
   * @param {Item} item
   */
  integrate(e, n) {
    const r = (
      /** @type {YText} */
      n.parent
    );
    r._searchMarker = null, r._hasFormatting = !0;
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeKey(this.key), e.writeJSON(this.value);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 6;
  }
}
const tm = (t) => new Ge(t.readKey(), t.readJSON());
class Ts {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentJSON}
   */
  copy() {
    return new Ts(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentJSON}
   */
  splice(e) {
    const n = new Ts(this.arr.slice(e));
    return this.arr = this.arr.slice(0, e), n;
  }
  /**
   * @param {ContentJSON} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.arr = this.arr.concat(e.arr), !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    const r = this.arr.length;
    e.writeLen(r - n);
    for (let i = n; i < r; i++) {
      const o = this.arr[i];
      e.writeString(o === void 0 ? "undefined" : JSON.stringify(o));
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 2;
  }
}
const nm = (t) => {
  const e = t.readLen(), n = [];
  for (let r = 0; r < e; r++) {
    const i = t.readString();
    i === "undefined" ? n.push(void 0) : n.push(JSON.parse(i));
  }
  return new Ts(n);
}, rm = Es("node_env") === "development";
class Vn {
  /**
   * @param {Array<any>} arr
   */
  constructor(e) {
    this.arr = e, rm && nf(e);
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.arr.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.arr;
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentAny}
   */
  copy() {
    return new Vn(this.arr);
  }
  /**
   * @param {number} offset
   * @return {ContentAny}
   */
  splice(e) {
    const n = new Vn(this.arr.slice(e));
    return this.arr = this.arr.slice(0, e), n;
  }
  /**
   * @param {ContentAny} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.arr = this.arr.concat(e.arr), !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    const r = this.arr.length;
    e.writeLen(r - n);
    for (let i = n; i < r; i++) {
      const o = this.arr[i];
      e.writeAny(o);
    }
  }
  /**
   * @return {number}
   */
  getRef() {
    return 8;
  }
}
const im = (t) => {
  const e = t.readLen(), n = [];
  for (let r = 0; r < e; r++)
    n.push(t.readAny());
  return new Vn(n);
};
class Vt {
  /**
   * @param {string} str
   */
  constructor(e) {
    this.str = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return this.str.length;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return this.str.split("");
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentString}
   */
  copy() {
    return new Vt(this.str);
  }
  /**
   * @param {number} offset
   * @return {ContentString}
   */
  splice(e) {
    const n = new Vt(this.str.slice(e));
    this.str = this.str.slice(0, e);
    const r = this.str.charCodeAt(e - 1);
    return r >= 55296 && r <= 56319 && (this.str = this.str.slice(0, e - 1) + "�", n.str = "�" + n.str.slice(1)), n;
  }
  /**
   * @param {ContentString} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.str += e.str, !0;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeString(n === 0 ? this.str : this.str.slice(n));
  }
  /**
   * @return {number}
   */
  getRef() {
    return 4;
  }
}
const sm = (t) => new Vt(t.readString()), om = [
  Ng,
  Kg,
  Vg,
  Hg,
  Wg,
  Yg,
  Gg
], am = 0, cm = 1, lm = 2, um = 3, fm = 4, dm = 5, hm = 6;
class an {
  /**
   * @param {AbstractType<any>} type
   */
  constructor(e) {
    this.type = e;
  }
  /**
   * @return {number}
   */
  getLength() {
    return 1;
  }
  /**
   * @return {Array<any>}
   */
  getContent() {
    return [this.type];
  }
  /**
   * @return {boolean}
   */
  isCountable() {
    return !0;
  }
  /**
   * @return {ContentType}
   */
  copy() {
    return new an(this.type._copy());
  }
  /**
   * @param {number} offset
   * @return {ContentType}
   */
  splice(e) {
    throw $t();
  }
  /**
   * @param {ContentType} right
   * @return {boolean}
   */
  mergeWith(e) {
    return !1;
  }
  /**
   * @param {Transaction} transaction
   * @param {Item} item
   */
  integrate(e, n) {
    this.type._integrate(e.doc, n);
  }
  /**
   * @param {Transaction} transaction
   */
  delete(e) {
    let n = this.type._start;
    for (; n !== null; )
      n.deleted ? n.id.clock < (e.beforeState.get(n.id.client) || 0) && e._mergeStructs.push(n) : n.delete(e), n = n.right;
    this.type._map.forEach((r) => {
      r.deleted ? r.id.clock < (e.beforeState.get(r.id.client) || 0) && e._mergeStructs.push(r) : r.delete(e);
    }), e.changed.delete(this.type);
  }
  /**
   * @param {StructStore} store
   */
  gc(e) {
    let n = this.type._start;
    for (; n !== null; )
      n.gc(e, !0), n = n.right;
    this.type._start = null, this.type._map.forEach(
      /** @param {Item | null} item */
      (r) => {
        for (; r !== null; )
          r.gc(e, !0), r = r.left;
      }
    ), this.type._map = /* @__PURE__ */ new Map();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    this.type._write(e);
  }
  /**
   * @return {number}
   */
  getRef() {
    return 7;
  }
}
const pm = (t) => new an(om[t.readTypeRef()](t)), Rs = (t, e, n) => {
  const { client: r, clock: i } = e.id, o = new ze(
    Ce(r, i + n),
    e,
    Ce(r, i + n - 1),
    e.right,
    e.rightOrigin,
    e.parent,
    e.parentSub,
    e.content.splice(n)
  );
  return e.deleted && o.markDeleted(), e.keep && (o.keep = !0), e.redone !== null && (o.redone = Ce(e.redone.client, e.redone.clock + n)), e.right = o, o.right !== null && (o.right.left = o), t._mergeStructs.push(o), o.parentSub !== null && o.right === null && o.parent._map.set(o.parentSub, o), e.length = n, o;
};
class ze extends oc {
  /**
   * @param {ID} id
   * @param {Item | null} left
   * @param {ID | null} origin
   * @param {Item | null} right
   * @param {ID | null} rightOrigin
   * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
   * @param {string | null} parentSub
   * @param {AbstractContent} content
   */
  constructor(e, n, r, i, o, c, l, d) {
    super(e, d.getLength()), this.origin = r, this.left = n, this.right = i, this.rightOrigin = o, this.parent = c, this.parentSub = l, this.redone = null, this.content = d, this.info = this.content.isCountable() ? fl : 0;
  }
  /**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */
  set marker(e) {
    (this.info & Vo) > 0 !== e && (this.info ^= Vo);
  }
  get marker() {
    return (this.info & Vo) > 0;
  }
  /**
   * If true, do not garbage collect this Item.
   */
  get keep() {
    return (this.info & ul) > 0;
  }
  set keep(e) {
    this.keep !== e && (this.info ^= ul);
  }
  get countable() {
    return (this.info & fl) > 0;
  }
  /**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */
  get deleted() {
    return (this.info & qo) > 0;
  }
  set deleted(e) {
    this.deleted !== e && (this.info ^= qo);
  }
  markDeleted() {
    this.info |= qo;
  }
  /**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, n) {
    if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= et(n, this.origin.client))
      return this.origin.client;
    if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= et(n, this.rightOrigin.client))
      return this.rightOrigin.client;
    if (this.parent && this.parent.constructor === sr && this.id.client !== this.parent.client && this.parent.clock >= et(n, this.parent.client))
      return this.parent.client;
    if (this.origin && (this.left = Cl(e, n, this.origin), this.origin = this.left.lastId), this.rightOrigin && (this.right = Sn(e, this.rightOrigin), this.rightOrigin = this.right.id), this.left && this.left.constructor === It || this.right && this.right.constructor === It)
      this.parent = null;
    else if (!this.parent)
      this.left && this.left.constructor === ze ? (this.parent = this.left.parent, this.parentSub = this.left.parentSub) : this.right && this.right.constructor === ze && (this.parent = this.right.parent, this.parentSub = this.right.parentSub);
    else if (this.parent.constructor === sr) {
      const r = Yo(n, this.parent);
      r.constructor === It ? this.parent = null : this.parent = /** @type {ContentType} */
      r.content.type;
    }
    return null;
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, n) {
    if (n > 0 && (this.id.clock += n, this.left = Cl(e, e.doc.store, Ce(this.id.client, this.id.clock - 1)), this.origin = this.left.lastId, this.content = this.content.splice(n), this.length -= n), this.parent) {
      if (!this.left && (!this.right || this.right.left !== null) || this.left && this.left.right !== this.right) {
        let r = this.left, i;
        if (r !== null)
          i = r.right;
        else if (this.parentSub !== null)
          for (i = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null; i !== null && i.left !== null; )
            i = i.left;
        else
          i = /** @type {AbstractType<any>} */
          this.parent._start;
        const o = /* @__PURE__ */ new Set(), c = /* @__PURE__ */ new Set();
        for (; i !== null && i !== this.right; ) {
          if (c.add(i), o.add(i), Xi(this.origin, i.origin)) {
            if (i.id.client < this.id.client)
              r = i, o.clear();
            else if (Xi(this.rightOrigin, i.rightOrigin))
              break;
          } else if (i.origin !== null && c.has(Yo(e.doc.store, i.origin)))
            o.has(Yo(e.doc.store, i.origin)) || (r = i, o.clear());
          else
            break;
          i = i.right;
        }
        this.left = r;
      }
      if (this.left !== null) {
        const r = this.left.right;
        this.right = r, this.left.right = this;
      } else {
        let r;
        if (this.parentSub !== null)
          for (r = /** @type {AbstractType<any>} */
          this.parent._map.get(this.parentSub) || null; r !== null && r.left !== null; )
            r = r.left;
        else
          r = /** @type {AbstractType<any>} */
          this.parent._start, this.parent._start = this;
        this.right = r;
      }
      this.right !== null ? this.right.left = this : this.parentSub !== null && (this.parent._map.set(this.parentSub, this), this.left !== null && this.left.delete(e)), this.parentSub === null && this.countable && !this.deleted && (this.parent._length += this.length), wf(e.doc.store, this), this.content.integrate(e, this), Ol(
        e,
        /** @type {AbstractType<any>} */
        this.parent,
        this.parentSub
      ), /** @type {AbstractType<any>} */
      (this.parent._item !== null && /** @type {AbstractType<any>} */
      this.parent._item.deleted || this.parentSub !== null && this.right !== null) && this.delete(e);
    } else
      new It(this.id, this.length).integrate(e, 0);
  }
  /**
   * Returns the next non-deleted item
   */
  get next() {
    let e = this.right;
    for (; e !== null && e.deleted; )
      e = e.right;
    return e;
  }
  /**
   * Returns the previous non-deleted item
   */
  get prev() {
    let e = this.left;
    for (; e !== null && e.deleted; )
      e = e.left;
    return e;
  }
  /**
   * Computes the last content address of this Item.
   */
  get lastId() {
    return this.length === 1 ? this.id : Ce(this.id.client, this.id.clock + this.length - 1);
  }
  /**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */
  mergeWith(e) {
    if (this.constructor === e.constructor && Xi(e.origin, this.lastId) && this.right === e && Xi(this.rightOrigin, e.rightOrigin) && this.id.client === e.id.client && this.id.clock + this.length === e.id.clock && this.deleted === e.deleted && this.redone === null && e.redone === null && this.content.constructor === e.content.constructor && this.content.mergeWith(e.content)) {
      const n = (
        /** @type {AbstractType<any>} */
        this.parent._searchMarker
      );
      return n && n.forEach((r) => {
        r.p === e && (r.p = this, !this.deleted && this.countable && (r.index -= this.length));
      }), e.keep && (this.keep = !0), this.right = e.right, this.right !== null && (this.right.left = this), this.length += e.length, !0;
    }
    return !1;
  }
  /**
   * Mark this Item as deleted.
   *
   * @param {Transaction} transaction
   */
  delete(e) {
    if (!this.deleted) {
      const n = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      this.countable && this.parentSub === null && (n._length -= this.length), this.markDeleted(), xs(e.deleteSet, this.id.client, this.id.clock, this.length), Ol(e, n, this.parentSub), this.content.delete(e);
    }
  }
  /**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */
  gc(e, n) {
    if (!this.deleted)
      throw Ft();
    this.content.gc(e), n ? _g(e, this, new It(this.id, this.length)) : this.content = new di(this.length);
  }
  /**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   */
  write(e, n) {
    const r = n > 0 ? Ce(this.id.client, this.id.clock + n - 1) : this.origin, i = this.rightOrigin, o = this.parentSub, c = this.content.getRef() & qs | (r === null ? 0 : St) | // origin is defined
    (i === null ? 0 : en) | // right origin is defined
    (o === null ? 0 : ii);
    if (e.writeInfo(c), r !== null && e.writeLeftID(r), i !== null && e.writeRightID(i), r === null && i === null) {
      const l = (
        /** @type {AbstractType<any>} */
        this.parent
      );
      if (l._item !== void 0) {
        const d = l._item;
        if (d === null) {
          const h = bg(l);
          e.writeParentInfo(!0), e.writeString(h);
        } else
          e.writeParentInfo(!1), e.writeLeftID(d.id);
      } else
        l.constructor === String ? (e.writeParentInfo(!0), e.writeString(l)) : l.constructor === sr ? (e.writeParentInfo(!1), e.writeLeftID(l)) : Ft();
      o !== null && e.writeString(o);
    }
    this.content.write(e, n);
  }
}
const Ff = (t, e) => ym[e & qs](t), ym = [
  () => {
    Ft();
  },
  // GC is not ItemContent
  Qg,
  // 1
  nm,
  // 2
  Xg,
  // 3
  sm,
  // 4
  em,
  // 5
  tm,
  // 6
  pm,
  // 7
  im,
  // 8
  Zg,
  // 9
  () => {
    Ft();
  }
  // 10 - Skip is not ItemContent
], gm = 10;
class Ot extends oc {
  get deleted() {
    return !0;
  }
  delete() {
  }
  /**
   * @param {Skip} right
   * @return {boolean}
   */
  mergeWith(e) {
    return this.constructor !== e.constructor ? !1 : (this.length += e.length, !0);
  }
  /**
   * @param {Transaction} transaction
   * @param {number} offset
   */
  integrate(e, n) {
    Ft();
  }
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */
  write(e, n) {
    e.writeInfo(gm), pe(e.restEncoder, this.length - n);
  }
  /**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */
  getMissing(e, n) {
    return null;
  }
}
const qf = (
  /** @type {any} */
  typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : {}
), Vf = "__ $YJS$ __";
qf[Vf] === !0 && console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");
qf[Vf] = !0;
const Xo = new FinalizationRegistry(({ cache: t, key: e }) => {
  delete t[e];
});
function Wf(t) {
  var e, n;
  return (e = (n = t._novip)._docCache) !== null && e !== void 0 ? e : n._docCache = {
    cache: {},
    get size() {
      return Object.keys(this.cache).length;
    },
    find(r, i, o) {
      const c = Qo(r, i, o), l = this.cache[c];
      return l ? l.deref() : void 0;
    },
    add(r) {
      var i;
      const { parentTable: o, parentId: c, parentProp: l } = r.meta;
      if (!o || !l || c == null)
        throw new Error("Missing Dexie-related metadata in Y.Doc");
      const d = Qo(o, c, l), h = (i = this.cache[d]) === null || i === void 0 ? void 0 : i.deref();
      h && Xo.unregister(h), this.cache[d] = new WeakRef(r), Xo.register(r, { cache: this.cache, key: d }, r);
    },
    delete(r) {
      Xo.unregister(r);
      const i = Qo(r.meta.parentTable, r.meta.parentId, r.meta.parentProp), o = this.cache[i];
      (o == null ? void 0 : o.deref()) === r && delete this.cache[i];
    }
  };
}
const Yr = /* @__PURE__ */ new WeakSet();
function Ca(t) {
  if (Yr.has(t))
    throw new Error(`Y.Doc ${t.meta.parentId} has been destroyed`);
}
function Qo(t, e, n) {
  return `${t}[${e}].${n}`;
}
function mm(t, e, n, r, i, o) {
  let c = e.find(n, o, r);
  return c || (c = new wr({
    meta: {
      db: t,
      updatesTable: i,
      parentProp: r,
      parentTable: n,
      parentId: o
    }
  }), e.add(c), c.on("destroy", () => {
    Yr.add(c), e.delete(c);
  }), c);
}
let Hf = null;
function Pl(t) {
  Hf = t;
}
function vm(t, e, n, r, i, o) {
  let c = 0, l = !0;
  const d = vn(() => {
    Ca(e);
    const g = n.table(i);
    return Promise.all([
      (c > 0 ? g.where("i").between(c, 1 / 0, !1).toArray().then((m) => m.filter((b) => Ks(b.k, o) === 0)) : g.where({ k: o }).toArray()).then((m) => m),
      n.table(r).where(":id").equals(o).toArray()
      // Why not just count() or get()? Because of cache only works with toArray() currently (optimization)
    ]);
  }).subscribe(([g, m]) => {
    if (g.length > 0 && (c = g[g.length - 1].i), m.length === 0) {
      e.destroy();
      return;
    }
    Ca(e), g.length > 0 && Ue(e, () => {
      g.forEach((b) => {
        try {
          Pl(b), mf(e, b.u);
        } finally {
          Pl(null);
        }
      });
    }, t, !1), l && (l = !1, e.emit("load", [e]));
  }, (g) => {
    t.on("error").fire(g);
  }), h = (g, m) => {
    m !== t && n.table(i).add({
      k: o,
      u: g,
      f: 1
      // Flag as local update (to be included when syncing)
    }).then((b) => {
      b === c - 1 && ++c;
    }).catch((b) => {
      t.on("error").fire(b);
    });
  }, f = () => {
    d.unsubscribe(), e.off("updateV2", h), e.off("destroy", f);
  };
  return e.on("updateV2", h), e.on("destroy", f), f;
}
function zf() {
}
function bm(t, e) {
  return t === zf ? e : function() {
    var n = t.apply(this, arguments);
    if (n && typeof n.then == "function") {
      for (var r = this, i = arguments.length, o = new Array(i); i--; )
        o[i] = arguments[i];
      return n.then(function() {
        return e.apply(r, o);
      });
    }
    return e.apply(this, arguments);
  };
}
function wm(t, e) {
  return t === zf ? e : function() {
    t.apply(this, arguments), e.apply(this, arguments);
  };
}
const Nr = /* @__PURE__ */ new WeakMap();
function Ul() {
  return xe.Events(null, "load", "sync", "error");
}
class ut {
  static getOrCreateDocument(e, n, r, i) {
    var o, c;
    const l = Wf(e), d = (c = (o = e.table(n).schema.yProps) === null || o === void 0 ? void 0 : o.find((h) => h.prop === r)) === null || c === void 0 ? void 0 : c.updatesTable;
    if (!d)
      throw new Error(`Updates table for ${n}.${r} not found`);
    return mm(e, l, n, r, d, i);
  }
  static load(e, n) {
    var r;
    let i = Nr.get(e);
    return i ? (++i.refCount, (n == null ? void 0 : n.gracePeriod) != null && i.graceTimeout < n.gracePeriod && (i.graceTimeout = n.gracePeriod), i.graceTimer && (clearTimeout(i.graceTimer), i.graceTimer = null)) : (i = new ut(e), i.graceTimeout = (r = n == null ? void 0 : n.gracePeriod) !== null && r !== void 0 ? r : -1, Nr.set(e, i)), i;
  }
  static release(e) {
    if (!e || Yr.has(e))
      return;
    const n = Nr.get(e);
    n ? --n.refCount <= 0 && (n.graceTimeout < 0 ? n._release() : n.graceTimer || (n.graceTimer = setTimeout(
      () => {
        n.graceTimer = null, n.refCount === 0 && n._release();
      },
      n.graceTimeout
      // Grace period to optimize for unload/reload scenarios
    ))) : e.destroy();
  }
  _release() {
    this.doc && Promise.resolve(ut.on("beforeunload").fire(this)).finally(() => {
      var e;
      this.refCount === 0 && ((e = this.doc) === null || e === void 0 || e.destroy());
    });
  }
  static for(e) {
    return Nr.get(e);
  }
  static get currentUpdateRow() {
    return Hf;
  }
  // Use a getter to avoid unhandled rejections when no one bothers about it.
  get whenLoaded() {
    return this._whenLoaded || (this._whenLoaded = new Promise((e, n) => {
      if (!this.doc) {
        n(new Error("No Y.Doc associated with this provider"));
        return;
      }
      this.doc.isLoaded ? e() : this._error ? n(this._error) : Yr.has(this.doc) ? n(new xe.AbortError("Document was destroyed before loaded")) : (this.on("load", e), this.on("error", n), this.doc.on("destroy", () => n(new xe.AbortError("Document was destroyed before loaded"))));
    })), this._whenLoaded;
  }
  // Use a getter to avoid unhandled rejections when no one bothers about it.
  get whenSynced() {
    return this._whenSynced || (this._whenSynced = new Promise((e, n) => {
      if (!this.doc) {
        n(new Error("No Y.Doc associated with this provider"));
        return;
      }
      this.doc.isSynced ? e() : this._error ? n(this._error) : Yr.has(this.doc) ? n(new xe.AbortError("Document was destroyed before synced")) : (this.on("sync", e), this.on("error", n), this.doc.on("destroy", () => n(new xe.AbortError("Document was destroyed before synced"))));
    })), this._whenSynced;
  }
  constructor(e) {
    this.refCount = 1, this.cleanupHandlers = [], this.graceTimeout = -1, this.doc = null, this.destroyed = !1, this.on = Ul(), this.doc = e, this.off = (c, l) => {
      var d;
      return (d = this.on[c]) === null || d === void 0 ? void 0 : d.unsubscribe(l);
    }, "dispose" in Symbol && (this[Symbol.dispose] = () => ut.release(e)), e.on("load", () => this.on("load").fire()), e.on("sync", (c) => c !== !1 && this.on("sync").fire()), e.on("destroy", this.destroy.bind(this)), this.on("error", (c) => {
      this._error = c;
    });
    const { db: n, parentTable: r, parentId: i, updatesTable: o } = e.meta || {};
    if (!n || !r || !o)
      throw new Error("Missing Dexie-related metadata in Y.Doc. Documents need to be obtained through Y.Doc properties from dexie queries.");
    if (!n.table(r) || !n.table(o))
      throw new Error(`Table ${r} or ${o} not found in db`);
    Ca(e), this.stopObserving = vm(this, e, n, r, o, i), ut.on("new").fire(this);
  }
  destroy() {
    var e, n, r;
    console.debug(`Y.Doc ${(n = (e = this.doc) === null || e === void 0 ? void 0 : e.meta) === null || n === void 0 ? void 0 : n.parentId} was destroyed`), Nr.delete(this.doc), this.doc = null, this.destroyed = !0, this.refCount = 0, (r = this.stopObserving) === null || r === void 0 || r.call(this), this.on = Ul(), this.cleanupHandlers.forEach((i) => i());
  }
  addCleanupHandler(e) {
    this.cleanupHandlers.push(typeof e == "function" ? e : () => e.unsubscribe());
  }
}
ut.on = xe.Events(null, {
  new: [wm],
  beforeunload: [bm]
});
ut.getDocCache = Wf;
xe.DexieYProvider ? ut = xe.DexieYProvider || ut : xe.DexieYProvider = ut;
const Zo = 3e4;
class _m extends ty {
  /**
   * @param {Y.Doc} doc
   */
  constructor(e) {
    super(), this.doc = e, this.clientID = e.clientID, this.states = /* @__PURE__ */ new Map(), this.meta = /* @__PURE__ */ new Map(), this._checkInterval = /** @type {any} */
    setInterval(() => {
      const n = Ss();
      this.getLocalState() !== null && Zo / 2 <= n - /** @type {{lastUpdated:number}} */
      this.meta.get(this.clientID).lastUpdated && this.setLocalState(this.getLocalState());
      const r = [];
      this.meta.forEach((i, o) => {
        o !== this.clientID && Zo <= n - i.lastUpdated && this.states.has(o) && r.push(o);
      }), r.length > 0 && Yf(this, r, "timeout");
    }, nn(Zo / 10)), e.on("destroy", () => {
      this.destroy();
    }), this.setLocalState({});
  }
  destroy() {
    this.emit("destroy", [this]), this.setLocalState(null), super.destroy(), clearInterval(this._checkInterval);
  }
  /**
   * @return {Object<string,any>|null}
   */
  getLocalState() {
    return this.states.get(this.clientID) || null;
  }
  /**
   * @param {Object<string,any>|null} state
   */
  setLocalState(e) {
    const n = this.clientID, r = this.meta.get(n), i = r === void 0 ? 0 : r.clock + 1, o = this.states.get(n);
    e === null ? this.states.delete(n) : this.states.set(n, e), this.meta.set(n, {
      clock: i,
      lastUpdated: Ss()
    });
    const c = [], l = [], d = [], h = [];
    e === null ? h.push(n) : o == null ? e != null && c.push(n) : (l.push(n), zr(o, e) || d.push(n)), (c.length > 0 || d.length > 0 || h.length > 0) && this.emit("change", [{ added: c, updated: d, removed: h }, "local"]), this.emit("update", [{ added: c, updated: l, removed: h }, "local"]);
  }
  /**
   * @param {string} field
   * @param {any} value
   */
  setLocalStateField(e, n) {
    const r = this.getLocalState();
    r !== null && this.setLocalState({
      ...r,
      [e]: n
    });
  }
  /**
   * @return {Map<number,Object<string,any>>}
   */
  getStates() {
    return this.states;
  }
}
const Yf = (t, e, n) => {
  const r = [];
  for (let i = 0; i < e.length; i++) {
    const o = e[i];
    if (t.states.has(o)) {
      if (t.states.delete(o), o === t.clientID) {
        const c = (
          /** @type {MetaClientState} */
          t.meta.get(o)
        );
        t.meta.set(o, {
          clock: c.clock + 1,
          lastUpdated: Ss()
        });
      }
      r.push(o);
    }
  }
  r.length > 0 && (t.emit("change", [{ added: [], updated: [], removed: r }, n]), t.emit("update", [{ added: [], updated: [], removed: r }, n]));
}, km = (t, e, n = t.states) => {
  const r = e.length, i = br();
  pe(i, r);
  for (let o = 0; o < r; o++) {
    const c = e[o], l = n.get(c) || null, d = (
      /** @type {MetaClientState} */
      t.meta.get(c).clock
    );
    pe(i, c), pe(i, d), Bn(i, JSON.stringify(l));
  }
  return At(i);
}, Sm = (t, e, n) => {
  const r = bi(e), i = Ss(), o = [], c = [], l = [], d = [], h = Pe(r);
  for (let f = 0; f < h; f++) {
    const g = Pe(r);
    let m = Pe(r);
    const b = JSON.parse(_s(r)), w = t.meta.get(g), I = t.states.get(g), j = w === void 0 ? 0 : w.clock;
    (j < m || j === m && b === null && t.states.has(g)) && (b === null ? g === t.clientID && t.getLocalState() != null ? m++ : t.states.delete(g) : t.states.set(g, b), t.meta.set(g, {
      clock: m,
      lastUpdated: i
    }), w === void 0 && b !== null ? o.push(g) : w !== void 0 && b === null ? d.push(g) : b !== null && (zr(b, I) || l.push(g), c.push(g)));
  }
  (o.length > 0 || l.length > 0 || d.length > 0) && t.emit("change", [{
    added: o,
    updated: l,
    removed: d
  }, n]), (o.length > 0 || c.length > 0 || d.length > 0) && t.emit("update", [{
    added: o,
    updated: c,
    removed: d
  }, n]);
};
function ee(t, e, n, r) {
  return new (n || (n = Promise))(function(i, o) {
    function c(h) {
      try {
        d(r.next(h));
      } catch (f) {
        o(f);
      }
    }
    function l(h) {
      try {
        d(r.throw(h));
      } catch (f) {
        o(f);
      }
    }
    function d(h) {
      var f;
      h.done ? i(h.value) : (f = h.value, f instanceof n ? f : new n(function(g) {
        g(f);
      })).then(c, l);
    }
    d((r = r.apply(t, e || [])).next());
  });
}
function Em(t) {
  var e = typeof Symbol == "function" && Symbol.iterator, n = e && t[e], r = 0;
  if (n)
    return n.call(t);
  if (t && typeof t.length == "number")
    return { next: function() {
      return t && r >= t.length && (t = void 0), { value: t && t[r++], done: !t };
    } };
  throw new TypeError(e ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function nt(t) {
  return this instanceof nt ? (this.v = t, this) : new nt(t);
}
function Ia(t, e, n) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var r, i = n.apply(t, e || []), o = [];
  return r = {}, c("next"), c("throw"), c("return"), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function c(g) {
    i[g] && (r[g] = function(m) {
      return new Promise(function(b, w) {
        o.push([g, m, b, w]) > 1 || l(g, m);
      });
    });
  }
  function l(g, m) {
    try {
      (function(b) {
        b.value instanceof nt ? Promise.resolve(b.value.v).then(d, h) : f(o[0][2], b);
      })(i[g](m));
    } catch (b) {
      f(o[0][3], b);
    }
  }
  function d(g) {
    l("next", g);
  }
  function h(g) {
    l("throw", g);
  }
  function f(g, m) {
    g(m), o.shift(), o.length && l(o[0][0], o[0][1]);
  }
}
function Oa(t) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var e, n = t[Symbol.asyncIterator];
  return n ? n.call(t) : (t = Em(t), e = {}, r("next"), r("throw"), r("return"), e[Symbol.asyncIterator] = function() {
    return this;
  }, e);
  function r(i) {
    e[i] = t[i] && function(o) {
      return new Promise(function(c, l) {
        (function(d, h, f, g) {
          Promise.resolve(g).then(function(m) {
            d({ value: m, done: f });
          }, h);
        })(c, l, (o = t[i](o)).done, o.value);
      });
    };
  }
}
const ht = { userId: "unauthorized", name: "Unauthorized", claims: { sub: "unauthorized" }, lastLogin: /* @__PURE__ */ new Date(0) };
try {
  Object.freeze(ht), Object.freeze(ht.claims);
} catch {
}
const Aa = {}, Gr = typeof self < "u" && self.document && typeof navigator < "u" && navigator.serviceWorker;
Gr && Gr.ready.then((t) => Aa.registration = t), typeof self < "u" && "clients" in self && !self.document && addEventListener("message", (t) => {
  var e, n;
  !((n = (e = t.data) === null || e === void 0 ? void 0 : e.type) === null || n === void 0) && n.startsWith("sw-broadcast-") && [...self.clients.matchAll({ includeUncontrolled: !0 })].forEach((r) => {
    var i;
    return r.id !== ((i = t.source) === null || i === void 0 ? void 0 : i.id) && r.postMessage(t.data);
  });
});
class ea {
  constructor(e) {
    this.name = e;
  }
  subscribe(e) {
    if (!Gr)
      return () => {
      };
    const n = (r) => {
      var i;
      ((i = r.data) === null || i === void 0 ? void 0 : i.type) === `sw-broadcast-${this.name}` && e(r.data.message);
    };
    return Gr.addEventListener("message", n), () => Gr.removeEventListener("message", n);
  }
  postMessage(e) {
    var n;
    typeof self.clients == "object" ? [...self.clients.matchAll({ includeUncontrolled: !0 })].forEach((r) => r.postMessage({ type: `sw-broadcast-${this.name}`, message: e })) : Aa.registration && ((n = Aa.registration.active) === null || n === void 0 || n.postMessage({ type: `sw-broadcast-${this.name}`, message: e }));
  }
}
const Mr = globalThis["lbc-events"] || (globalThis["lbc-events"] = /* @__PURE__ */ new Map());
class es extends Ye {
  constructor(e) {
    const n = typeof BroadcastChannel > "u" ? new ea(e) : new BroadcastChannel(e);
    super((r) => {
      function i(l) {
        r.next(l.detail);
      }
      function o(l) {
        r.next(l.data);
      }
      let c;
      (function(l, d) {
        Mr.has(l) ? Mr.get(l).push(d) : Mr.set(l, [d]);
      })(`lbc-${e}`, i);
      try {
        n instanceof ea ? c = n.subscribe((l) => r.next(l)) : n.addEventListener("message", o);
      } catch {
      }
      return () => {
        (function(l, d) {
          const h = Mr.get(l);
          if (h) {
            const f = h.indexOf(d);
            f !== -1 && h.splice(f, 1);
          }
        })(`lbc-${e}`, i), n instanceof ea ? c() : n.removeEventListener("message", o);
      };
    }), this.name = e, this.bc = n;
  }
  next(e) {
    this.bc.postMessage(e), function(n) {
      const r = Mr.get(n.type);
      r && r.forEach((i) => {
        try {
          i(n);
        } catch {
        }
      });
    }(new CustomEvent(`lbc-${this.name}`, { detail: e }));
  }
}
function Gf(t, e) {
  return ee(this, void 0, void 0, function* () {
    try {
      const n = yield navigator.serviceWorker.ready;
      if (e === "push" && n.sync && (yield n.sync.register(`dexie-cloud:${t.name}`)), !n.active)
        throw new Error("Failed to trigger sync - there's no active service worker");
      return void n.active.postMessage({ type: "dexie-cloud-sync", dbName: t.name, purpose: e });
    } catch {
    }
  });
}
function Xt(t, e) {
  t.cloud.usingServiceWorker ? Gf(t, e) : t.localSyncEvent.next({ purpose: e });
}
const xm = "fromBase64" in Uint8Array, Cm = "toBase64" in Uint8Array.prototype, ac = typeof Buffer < "u" ? (t) => Buffer.from(t, "base64") : xm ? (t) => Uint8Array.fromBase64(t) : (t) => {
  const e = atob(t), n = e.length, r = new Uint8Array(n);
  for (var i = 0; i < n; i++)
    r[i] = e.charCodeAt(i);
  return r;
}, kr = typeof Buffer < "u" ? (t) => ArrayBuffer.isView(t) ? Buffer.from(t.buffer, t.byteOffset, t.byteLength).toString("base64") : Buffer.from(t).toString("base64") : Cm ? (t) => (ArrayBuffer.isView(t) ? t : new Uint8Array(t)).toBase64() : (t) => {
  const e = ArrayBuffer.isView(t) ? t : new Uint8Array(t), n = [];
  for (let r = 0, i = e.length; r < i; r += 4096) {
    const o = e.subarray(r, r + 4096);
    n.push(String.fromCharCode.apply(null, o));
  }
  return btoa(n.join(""));
};
function Da(t) {
  return ee(this, arguments, void 0, function* ({ realms: e, inviteRealms: n }) {
    const r = JSON.stringify([...e.map((c) => ({ realmId: c, accepted: !0 })), ...n.map((c) => ({ realmId: c, accepted: !1 }))].sort((c, l) => c.realmId < l.realmId ? -1 : c.realmId > l.realmId ? 1 : 0)), i = new TextEncoder().encode(r), o = yield crypto.subtle.digest("SHA-1", i);
    return kr(o);
  });
}
function ds(t) {
  return Object.entries(t.cloud.schema || {}).filter(([, { markedForSync: e }]) => e).map(([e]) => t.tables.filter(({ name: n }) => n === e)[0]).filter((e) => e);
}
function cc(t) {
  return `$${t}_mutations`;
}
function Jf(t) {
  var e;
  const n = (e = /^\$(.*)_mutations$/.exec(t)) === null || e === void 0 ? void 0 : e[1];
  if (!n)
    throw new Error(`Given mutationTable ${t} is not correct`);
  return n;
}
const Im = [].concat;
function lc(t) {
  return Im.apply([], t);
}
function Ta(t, e) {
  return ee(this, arguments, void 0, function* (n, r, { since: i = {}, limit: o = 1 / 0 } = {}) {
    const c = lc(yield Promise.all(n.map((f) => ee(this, void 0, void 0, function* () {
      const g = Jf(f.name), m = i[g];
      let b = m ? f.where("rev").above(m) : f;
      return o < 1 / 0 && (b = b.limit(o)), (yield b.toArray()).map((w) => ({ table: g, mut: w }));
    })))).sort((f, g) => f.mut.txid === g.mut.txid ? f.mut.opNo - g.mut.opNo : f.mut.ts - g.mut.ts), l = [];
    let d = null, h = null;
    for (const { table: f, mut: g } of c)
      d && d.table === f && h === g.txid ? d.muts.push(g) : (d = { table: f, muts: [g] }, h = g.txid, l.push(d));
    return l;
  });
}
function Xf(t) {
  const e = new Uint8Array(t);
  if (typeof crypto < "u")
    crypto.getRandomValues(e);
  else
    for (let n = 0; n < t; n++)
      e[n] = Math.floor(256 * Math.random());
  if (typeof Buffer < "u" && Buffer.from)
    return Buffer.from(e).toString("base64");
  if (typeof btoa < "u")
    return btoa(String.fromCharCode.apply(null, e));
  throw new Error("No btoa or Buffer available");
}
const Om = {}.hasOwnProperty;
function Ps(t, e, n) {
  if (t && e !== void 0 && (!("isFrozen" in Object) || !Object.isFrozen(t)))
    if (typeof e != "string" && "length" in e) {
      (function(h) {
        if (!h)
          throw new Error("Assertion Failed");
      })(typeof n != "string" && "length" in n);
      for (var r = 0, i = e.length; r < i; ++r)
        Ps(t, e[r], n[r]);
    } else {
      var o = e.indexOf(".");
      if (o !== -1) {
        var c = e.substr(0, o), l = e.substr(o + 1);
        if (l === "")
          n === void 0 ? Array.isArray(t) ? isNaN(parseInt(c)) || t.splice(parseInt(c), 1) : delete t[c] : t[c] = n;
        else {
          var d = t[c];
          d && function(h, f) {
            return Om.call(h, f);
          }(t, c) || (d = t[c] = {}), Ps(d, l, n);
        }
      } else
        n === void 0 ? Array.isArray(t) && !isNaN(parseInt(e)) ? t.splice(e, 1) : delete t[e] : t[e] = n;
    }
}
const Qf = typeof self < "u" && typeof crypto < "u" ? (t, e = crypto.getRandomValues.bind(crypto)) => {
  const n = new Uint8Array(t);
  return e(n), self.btoa(String.fromCharCode.apply(null, n));
} : typeof Buffer < "u" ? (t, e = Am) => {
  const n = Buffer.alloc(t);
  return e(n), n.toString("base64");
} : () => {
  throw new Error("No implementation of randomString was found");
};
function Am(t) {
  for (let e = 0; e < t.length; ++e)
    t[e] = Math.floor(256 * Math.random());
}
function uc(t) {
  return typeof t == "string" || !!(Array.isArray(t) && t.some((e) => uc(e)) && t.every(Zf));
}
function Zf(t) {
  return typeof t == "string" || typeof t == "number" || Array.isArray(t) && t.every(Zf);
}
function Dm(t, e, n) {
  const r = t[e] || (t[e] = {}), i = n.keys.map((o) => typeof o == "string" ? o : JSON.stringify(o));
  switch (n.type) {
    case "insert":
    case "upsert":
      i.forEach((o, c) => {
        r[o] = { type: "ups", val: n.values[c] };
      });
      break;
    case "update":
    case "modify":
      i.forEach((o, c) => {
        const l = n.type === "update" ? n.changeSpecs[c] : n.changeSpec, d = r[o];
        if (d)
          switch (d.type) {
            case "ups":
              for (const [h, f] of Object.entries(l))
                Ps(d.val, h, f);
              break;
            case "del":
              break;
            case "upd":
              Object.assign(d.mod, l);
          }
        else
          r[o] = { type: "upd", mod: l };
      });
      break;
    case "delete":
      i.forEach((o) => {
        r[o] = { type: "del" };
      });
  }
  return t;
}
function jl(t, e) {
  for (const { table: n, muts: r } of e)
    for (const i of r)
      Dm(t, n, i);
}
function Tm(t) {
  return Ia(this, arguments, function* () {
    var e, n, r, i;
    let o = 0, c = new Uint8Array(4), l = 0, d = [], h = 0;
    try {
      for (var f, g = !0, m = Oa(t); !(e = (f = yield nt(m.next())).done); g = !0) {
        i = f.value, g = !1;
        const b = i, w = new DataView(b.buffer, b.byteOffset, b.byteLength);
        let I = 0;
        for (; I < b.byteLength; )
          switch (o) {
            case 0:
              if (I + 4 > b.byteLength) {
                for (const j of b.slice(I)) {
                  if (l === 4)
                    break;
                  c[l++] = j, ++I;
                }
                if (l < 4)
                  break;
              } else if (l > 0 && l < 4)
                for (const j of b.slice(I, I + 4 - l))
                  c[l++] = j, ++I;
            case 1:
              h = l === 4 ? new DataView(c.buffer, 0, 4).getUint32(0, !1) : w.getUint32(I, !1), l ? l = 0 : I += 4;
            case 2:
              if (I >= b.byteLength) {
                o = 2;
                break;
              }
              if (I + h > b.byteLength)
                d.push(b.slice(I)), h -= b.byteLength - I, o = 2, I = b.byteLength;
              else {
                if (d.length > 0) {
                  const j = new Uint8Array(d.reduce((B, L) => B + L.byteLength, h));
                  let $ = 0;
                  for (const B of d)
                    j.set(B, $), $ += B.byteLength;
                  j.set(b.slice(I, I + h), $), d = [], yield yield nt(j);
                } else
                  yield yield nt(b.slice(I, I + h));
                I += h, o = 0;
              }
          }
      }
    } catch (b) {
      n = { error: b };
    } finally {
      try {
        g || e || !(r = m.return) || (yield nt(r.call(m)));
      } finally {
        if (n)
          throw n.error;
      }
    }
  });
}
class Ra extends Error {
  constructor({ title: e, message: n, messageCode: r, messageParams: i }) {
    super(n), this.name = "TokenErrorResponseError", this.title = e, this.messageCode = r, this.messageParams = i;
  }
}
function ki(t, e) {
  return new Promise((n, r) => {
    const i = Object.assign(Object.assign({ submitLabel: "Submit", cancelLabel: "Cancel" }, e), { onSubmit: (o) => {
      t.next(void 0), n(o);
    }, onCancel: () => {
      t.next(void 0), r(new xe.AbortError("User cancelled"));
    } });
    t.next(i);
  });
}
function Pa(t, e, ...n) {
  return ki(t, { type: "message-alert", title: e, alerts: n, fields: {}, submitLabel: "OK", cancelLabel: null });
}
function Ll(t, e, n) {
  return ee(this, void 0, void 0, function* () {
    let r = n || "";
    for (; !r || !/^[\w-+.]+@([\w-]+\.)+[\w-]{2,10}(\sas\s[\w-+.]+@([\w-]+\.)+[\w-]{2,10})?$/.test(r); )
      r = (yield ki(t, { type: "email", title: e, alerts: r ? [{ type: "error", messageCode: "INVALID_EMAIL", message: "Please enter a valid email address", messageParams: {} }] : [], fields: { email: { type: "email", placeholder: "you@somedomain.com" } } })).email;
    return r;
  });
}
function Nl(t, e, n) {
  return ee(this, void 0, void 0, function* () {
    const r = [{ type: "info", messageCode: "OTP_SENT", message: "A One-Time password has been sent to {email}", messageParams: { email: e } }];
    n && r.push(n);
    const { otp: i } = yield ki(t, { type: "otp", title: "Enter OTP", alerts: r, fields: { otp: { type: "otp", label: "OTP", placeholder: "Paste OTP here" } } });
    return i;
  });
}
function Js(t) {
  return ee(this, void 0, void 0, function* () {
    var e, n, r;
    const i = yield t.getCurrentUser(), { accessToken: o, accessTokenExpiration: c, refreshToken: l, refreshTokenExpiration: d, claims: h } = i;
    if (!o)
      return null;
    if (((e = c == null ? void 0 : c.getTime()) !== null && e !== void 0 ? e : 1 / 0) > Date.now() && (((n = i.license) === null || n === void 0 ? void 0 : n.status) || "ok") === "ok")
      return i;
    if (!l)
      throw new Error("Refresh token missing");
    if (((r = d == null ? void 0 : d.getTime()) !== null && r !== void 0 ? r : 1 / 0) <= Date.now())
      throw new Error("Refresh token has expired");
    const f = yield Xs(t.cloud.options.databaseUrl, i);
    return yield t.table("$logins").update(h.sub, { accessToken: f.accessToken, accessTokenExpiration: f.accessTokenExpiration, claims: f.claims, license: f.license, data: f.data }), f;
  });
}
function Rm(t, e, n, r, i) {
  return ee(this, void 0, void 0, function* () {
    return e.accessToken && e.accessTokenExpiration.getTime() > Date.now() ? e : e.refreshToken && (!e.refreshTokenExpiration || e.refreshTokenExpiration.getTime() > Date.now()) ? yield Xs(t, e) : yield function(o, c, l, d) {
      return ee(this, void 0, void 0, function* () {
        if (!crypto.subtle)
          throw typeof location < "u" && location.protocol === "http:" ? new Error("Dexie Cloud Addon needs to use WebCrypto, but your browser has disabled it due to being served from an insecure location. Please serve it from https or http://localhost:<port> (See https://stackoverflow.com/questions/46670556/how-to-enable-crypto-subtle-for-unsecure-origins-in-chrome/46671627#46671627)") : new Error("This browser does not support WebCrypto.");
        const { privateKey: h, publicKey: f } = yield crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: { name: "SHA-256" } }, !1, ["sign", "verify"]);
        if (!h || !f)
          throw new Error("Could not generate RSA keypair");
        o.nonExportablePrivateKey = h;
        const g = function(m) {
          const b = kr(m);
          return function(w) {
            let I = `-----BEGIN PUBLIC KEY-----
`;
            for (; w.length > 0; )
              I += w.substring(0, 64) + `
`, w = w.substring(64);
            return I += "-----END PUBLIC KEY-----", I;
          }(b);
        }(yield crypto.subtle.exportKey("spki", f));
        o.publicKey = f;
        try {
          const m = yield c({ public_key: g, hints: d });
          if (m.type === "error")
            throw new Ra(m);
          if (m.type !== "tokens")
            throw new Error(`Unexpected response type from token endpoint: ${m.type}`);
          return o.accessToken = m.accessToken, o.accessTokenExpiration = new Date(m.accessTokenExpiration), o.refreshToken = m.refreshToken, m.refreshTokenExpiration && (o.refreshTokenExpiration = new Date(m.refreshTokenExpiration)), o.userId = m.claims.sub, o.email = m.claims.email, o.name = m.claims.name, o.claims = m.claims, o.license = { type: m.userType, status: m.claims.license || "ok" }, o.data = m.data, m.evalDaysLeft != null && (o.license.evalDaysLeft = m.evalDaysLeft), m.userValidUntil != null && (o.license.validUntil = new Date(m.userValidUntil)), m.alerts && m.alerts.length > 0 && (yield ki(l, { type: "message-alert", title: "Authentication Alert", fields: {}, alerts: m.alerts })), o;
        } catch (m) {
          if (m instanceof Ra)
            throw yield Pa(l, m.title, { type: "error", messageCode: m.messageCode, message: m.message, messageParams: {} }), m;
          let b = "We're having a problem authenticating right now.";
          throw m instanceof TypeError && (b = typeof navigator !== void 0 && !navigator.onLine ? "You seem to be offline. Please connect to the internet and try again." : xe.debug || typeof location < "u" && (location.hostname === "localhost" || location.hostname === "127.0.0.1") ? `Could not connect to server. Please verify that your origin '${location.origin}' is whitelisted using \`npx dexie-cloud whitelist\`` : "Could not connect to server. Please verify the connection.", yield Pa(l, "Authentication Failed", { type: "error", messageCode: "GENERIC_ERROR", message: b, messageParams: {} }).catch(() => {
          })), m;
        }
      });
    }(e, n, r, i);
  });
}
function Xs(t, e) {
  return ee(this, void 0, void 0, function* () {
    if (!e.refreshToken)
      throw new Error("Cannot refresh token - refresh token is missing.");
    if (!e.nonExportablePrivateKey)
      throw new Error("login.nonExportablePrivateKey is missing - cannot sign refresh token without a private key.");
    const n = Date.now(), r = "RSASSA-PKCS1-v1_5", i = new TextEncoder().encode(e.refreshToken + n), o = yield crypto.subtle.sign(r, e.nonExportablePrivateKey, i), c = kr(o), l = { grant_type: "refresh_token", refresh_token: e.refreshToken, scopes: ["ACCESS_DB"], signature: c, signing_algorithm: r, time_stamp: n }, d = yield fetch(`${t}/token`, { body: JSON.stringify(l), method: "post", headers: { "Content-Type": "application/json" }, mode: "cors" });
    if (d.status !== 200)
      throw new Error(`RefreshToken: Status ${d.status} from ${t}/token`);
    const h = yield d.json();
    if (h.type === "error")
      throw new Ra(h);
    return e.accessToken = h.accessToken, e.accessTokenExpiration = h.accessTokenExpiration ? new Date(h.accessTokenExpiration) : void 0, e.claims = h.claims, e.license = { type: h.userType, status: h.claims.license || "ok" }, h.evalDaysLeft != null && (e.license.evalDaysLeft = h.evalDaysLeft), h.userValidUntil != null && (e.license.validUntil = new Date(h.userValidUntil)), h.data && (e.data = h.data), e;
  });
}
const { toString: Pm } = {}, Ml = { replace: function(t) {
  const e = Object.keys(t);
  let n = null;
  for (let i = 0, o = e.length; i < o; ++i)
    e[i][0] === "$" && (n = n || [], n.push(e[i]));
  if (!n)
    return t;
  const r = { ...t };
  for (const i of n)
    delete r[i];
  for (const i of n)
    r["$" + i] = t[i];
  return r;
} };
function ed(...t) {
  const e = t.reduce((r, i) => ({ ...r, ...i }), t.reduce((r, i) => ({ ...i, ...r }), {})), n = /* @__PURE__ */ new WeakMap();
  return { stringify(r, i, o) {
    return JSON.stringify(r, function(l) {
      const d = this[l], h = function(f) {
        const g = typeof f;
        switch (typeof f) {
          case "object":
          case "function": {
            if (f === null)
              return null;
            const b = Object.getPrototypeOf(f);
            if (!b)
              return Ml;
            let w = n.get(b);
            if (w !== void 0)
              return w;
            const I = (m = f, Pm.call(m).slice(8, -1)), j = Object.entries(e).find(([$, B]) => {
              var L, Q;
              return (Q = (L = B == null ? void 0 : B.test) === null || L === void 0 ? void 0 : L.call(B, f, I)) !== null && Q !== void 0 ? Q : $ === I;
            });
            return w = j == null ? void 0 : j[1], w || (w = Array.isArray(f) ? null : typeof f == "function" ? e.function || null : Ml), n.set(b, w), w;
          }
          default:
            return e[g];
        }
        var m;
      }(d);
      return h ? h.replace(d, i, e) : d;
    }, o);
  }, parse(r, i) {
    const o = [];
    return JSON.parse(r, function(c, l) {
      const d = l == null ? void 0 : l.$t;
      if (d) {
        const f = e[d];
        l = f ? f.revive(l, i, e) : l;
      }
      let h = o[o.length - 1];
      if (h && h[0] === l) {
        l = { ...l };
        for (const f of h[1])
          delete l[f];
        for (const [f, g] of Object.entries(h[2]))
          l[f] = g;
        o.pop();
      }
      if (l === void 0 || c[0] === "$" && c !== "$t") {
        let f, g;
        h = o[o.length - 1], h && h[0] === this ? (f = h[1], g = h[2]) : o.push([this, f = [], g = {}]), c[0] === "$" && c !== "$t" ? (f.push(c), g[c.substr(1)] = l) : g[c] = void 0;
      }
      return l;
    });
  } };
}
const Um = { Blob: { test: (t, e) => e === "Blob", replace: (t, e) => {
  const n = e.length;
  return e.push(t), { $t: "Blob", mimeType: t.type, i: n };
}, revive: ({ i: t, mimeType: e }, n) => new Blob([n[t]], { type: e }) } };
var jm = { number: { replace: (t) => {
  switch (!0) {
    case isNaN(t):
      return { $t: "number", v: "NaN" };
    case t === 1 / 0:
      return { $t: "number", v: "Infinity" };
    case t === -1 / 0:
      return { $t: "number", v: "-Infinity" };
    default:
      return t;
  }
}, revive: ({ v: t }) => Number(t) } };
const Lm = { bigint: { replace: (t) => ({ $t: "bigint", v: "" + t }), revive: (t) => BigInt(t.v) } };
var Nm = { Date: { replace: (t) => ({ $t: "Date", v: isNaN(t.getTime()) ? "NaN" : t.toISOString() }), revive: ({ v: t }) => new Date(t === "NaN" ? NaN : Date.parse(t)) } }, Mm = { Set: { replace: (t) => ({ $t: "Set", v: Array.from(t.entries()) }), revive: ({ v: t }) => new Set(t) } }, Km = { Map: { replace: (t) => ({ $t: "Map", v: Array.from(t.entries()) }), revive: ({ v: t }) => new Map(t) } };
const Bm = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof global < "u" ? global : void 0;
var $m = ["Int8Array", "Uint8Array", "Uint8ClampedArray", "Int16Array", "Uint16Array", "Int32Array", "Uint32Array", "Float32Array", "Float64Array", "DataView", "BigInt64Array", "BigUint64Array"].reduce((t, e) => ({ ...t, [e]: { replace: (n, r, i) => ({ $t: e, v: i.ArrayBuffer.replace(n.byteOffset === 0 && n.byteLength === n.buffer.byteLength ? n.buffer : n.buffer.slice(n.byteOffset, n.byteOffset + n.byteLength), r, i).v }), revive: ({ v: n }, r, i) => {
  const o = Bm[e];
  return o && new o(i.ArrayBuffer.revive({ v: n }, r, i));
} } }), {});
function td(t) {
  return function(e) {
    for (var n = "", r = 0, i = e.length; r < i; r++)
      n += nd[e[r]];
    return n;
  }(kr(t));
}
function Fm(t) {
  return ac(function(e) {
    if (typeof e != "string")
      throw new Error("invalid decoder input: " + e);
    for (var n = "", r = 0, i = e.length; r < i; r++)
      n += Ua[e[r]];
    return n;
  }(t));
}
const Ua = { "-": "=", 0: "A", 1: "B", 2: "C", 3: "D", 4: "E", 5: "F", 6: "G", 7: "H", 8: "I", 9: "J", A: "K", B: "L", C: "M", D: "N", E: "O", F: "P", G: "Q", H: "R", I: "S", J: "T", K: "U", L: "V", M: "W", N: "X", O: "Y", P: "Z", Q: "a", R: "b", S: "c", T: "d", U: "e", V: "f", W: "g", X: "h", Y: "i", Z: "j", _: "k", a: "l", b: "m", c: "n", d: "o", e: "p", f: "q", g: "r", h: "s", i: "t", j: "u", k: "v", l: "w", m: "x", n: "y", o: "z", p: "0", q: "1", r: "2", s: "3", t: "4", u: "5", v: "6", w: "7", x: "8", y: "9", z: "+", "|": "/" }, nd = {};
for (const t of Object.keys(Ua))
  nd[Ua[t]] = t;
var qm = { ArrayBuffer: { replace: (t) => ({ $t: "ArrayBuffer", v: td(t) }), revive: ({ v: t }) => {
  const e = Fm(t);
  return e.buffer.byteLength === e.byteLength ? e.buffer : e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength);
} } };
class ta {
  constructor(e, n) {
    this.buf = e, this.type = n;
  }
}
function rd(t) {
  const e = new XMLHttpRequest();
  if (e.overrideMimeType("text/plain; charset=x-user-defined"), e.open("GET", URL.createObjectURL(t), !1), e.send(), e.status !== 200 && e.status !== 0)
    throw new Error("Bad Blob access: " + e.status);
  return e.responseText;
}
function id(t) {
  const e = new Uint8Array(t.length);
  for (let n = 0; n < t.length; ++n)
    e[n] = t.charCodeAt(n);
  return e.buffer;
}
var Vm = { Blob: { test: (t, e) => e === "Blob" || t instanceof ta, replace: (t) => ({ $t: "Blob", v: kr(t instanceof ta ? t.buf : id(rd(t))), type: t.type }), revive: ({ type: t, v: e }) => {
  const n = ac(e);
  return typeof Blob !== void 0 ? new Blob([n]) : new ta(n.buffer, t);
} } };
const sd = { ...jm, ...Lm, ...Nm, ...Mm, ...Km, ...$m, ...qm, ...Vm };
function Kl(t) {
  return new Promise((e, n) => {
    const r = new FileReader();
    r.onabort = (i) => n(new Error("file read aborted")), r.onerror = (i) => n(i.target.error), r.onload = (i) => e(i.target.result), r.readAsArrayBuffer(t);
  });
}
var Wm = { undefined: { replace: () => ({ $t: "undefined" }), revive: () => {
} } }, Hm = { File: { test: (t, e) => e === "File", replace: (t) => ({ $t: "File", v: kr(id(rd(t))), type: t.type, name: t.name, lastModified: new Date(t.lastModified).toISOString() }), revive: ({ type: t, v: e, name: n, lastModified: r }) => {
  const i = ac(e);
  return new File([i], n, { type: t, lastModified: new Date(r).getTime() });
} } };
const zm = typeof BigInt == "function" && typeof BigInt(0) == "bigint";
class Bl {
  toString() {
    return this.v;
  }
  constructor(e) {
    this.v = e;
  }
}
const Ym = zm ? {} : { bigint: { test: (t) => t instanceof Bl, replace: (t) => Object.assign({ $t: "bigint" }, t), revive: ({ v: t }) => new Bl(t) } }, od = Object.assign(Object.assign(Object.assign(Object.assign({}, Wm), Ym), Hm), { PropModification: { test: (t) => t instanceof Xc, replace: (t) => Object.assign({ $t: "PropModification" }, t["@@propmod"]), revive: (t) => {
  var e = function(n, r) {
    var i = {};
    for (var o in n)
      Object.prototype.hasOwnProperty.call(n, o) && r.indexOf(o) < 0 && (i[o] = n[o]);
    if (n != null && typeof Object.getOwnPropertySymbols == "function") {
      var c = 0;
      for (o = Object.getOwnPropertySymbols(n); c < o.length; c++)
        r.indexOf(o[c]) < 0 && Object.prototype.propertyIsEnumerable.call(n, o[c]) && (i[o[c]] = n[o[c]]);
    }
    return i;
  }(t, ["$t"]);
  return new Xc(e);
} } }), hi = ed(sd, od), Gm = function(...t) {
  const e = ed(sd, Um, ...t);
  return { toBinary(n) {
    const [r, i] = this.stringify(n), o = new ArrayBuffer(4);
    return new DataView(o).setUint32(0, r.size), new Blob([o, r, i]);
  }, stringify(n) {
    const r = [], i = e.stringify(n, r);
    return [new Blob(r.map((c) => {
      const l = new ArrayBuffer(4);
      return new DataView(l).setUint32(0, "byteLength" in c ? c.byteLength : c.size), new Blob([l, c]);
    })), i];
  }, async parse(n, r) {
    let i = 0;
    const o = [], c = await Kl(r), l = new DataView(c);
    for (; i < c.byteLength; ) {
      const d = l.getUint32(i);
      i += 4;
      const h = c.slice(i, i + d);
      i += d, o.push(h);
    }
    return e.parse(n, o);
  }, async fromBinary(n) {
    const r = new DataView(await Kl(n.slice(0, 4))).getUint32(0), i = n.slice(4, r + 4), o = await function(c) {
      return new Promise((l, d) => {
        const h = new FileReader();
        h.onabort = (f) => d(new Error("file read aborted")), h.onerror = (f) => d(f.target.error), h.onload = (f) => l(f.target.result), h.readAsText(c);
      });
    }(n.slice(r + 4));
    return await this.parse(o, i);
  } };
}(od);
class ja extends Error {
  constructor(e, n) {
    super(n || `${e.status} ${e.statusText}`), this.httpStatus = e.status;
  }
  get name() {
    return "HttpError";
  }
}
function Jm(t, e, n) {
  const r = [];
  for (let i of n) {
    const { table: o, muts: c } = i, l = t.tables.find((f) => f.name === o);
    if (!l)
      throw new Error(`Internal error: table ${o} not found in DBCore schema`);
    const { primaryKey: d } = l;
    let h = i;
    c.forEach((f, g) => {
      const m = !d.outbound && (f.type === "upsert" || f.type === "insert");
      f.keys.forEach((b, w) => {
        if (Array.isArray(b)) {
          h === i && (h = $l(i, m));
          const I = h.muts[g], j = JSON.stringify(b);
          I.keys[w] = j;
        } else if (b[0] === "#") {
          h === i && (h = $l(i, m));
          const I = h.muts[g];
          if (!e.isLoggedIn)
            throw new Error("Internal error: Cannot sync private IDs before authenticated");
          const j = `${b}:${e.userId}`;
          I.keys[w] = j, m && xe.setByKeyPath(I.values[w], d.keyPath, j);
        }
      });
    }), r.push(h);
  }
  return r;
}
function $l(t, e) {
  return Object.assign(Object.assign({}, t), { muts: e ? t.muts.map((n) => n.type !== "insert" && n.type !== "upsert" || !n.values ? Object.assign(Object.assign({}, n), { keys: n.keys.slice() }) : Object.assign(Object.assign({}, n), { keys: n.keys.slice(), values: n.values.slice() })) : t.muts.map((n) => Object.assign(Object.assign({}, n), { keys: n.keys.slice() })) });
}
let La = /* @__PURE__ */ new WeakMap();
function ad(t) {
  return ee(this, void 0, void 0, function* () {
    var e, n;
    const r = ((n = (e = La.get(t)) === null || e === void 0 ? void 0 : e.getTime()) !== null && n !== void 0 ? n : 0) - Date.now();
    r > 0 && (yield new Promise((i) => setTimeout(i, r)));
  });
}
function Xm(t, e, n, r, i, o, c, l, d) {
  return ee(this, void 0, void 0, function* () {
    const h = { Accept: "application/json, application/x-bison, application/x-bison-stream", "Content-Type": "application/tson" }, f = yield Js(i), g = f == null ? void 0 : f.accessToken;
    g && (h.Authorization = `Bearer ${g}`);
    const m = { v: 2, dbID: n == null ? void 0 : n.remoteDbId, clientIdentity: l, schema: c || {}, lastPull: n ? { serverRevision: n.serverRevision, yServerRevision: n.yServerRevision, realms: n.realms, inviteRealms: n.inviteRealms } : void 0, baseRevs: r, changes: Jm(i.dx.core.schema, d, t), y: e, dxcv: i.cloud.version };
    i.syncStateChangedEvent.next({ phase: "pushing" });
    const b = hi.stringify(m), w = yield fetch(`${o}/sync`, { method: "post", headers: h, credentials: "include", body: b });
    if (i.syncStateChangedEvent.next({ phase: "pulling" }), function(I, j) {
      const $ = j.headers.get("Ratelimit-Limit"), B = j.headers.get("Ratelimit-Remaining"), L = j.headers.get("Ratelimit-Reset");
      if ($ && B && L) {
        const Q = Number($), se = Math.max(0, Number(B)), te = Number(L);
        if (se < Q / 2) {
          const oe = Math.ceil(te / (se + 1));
          La.set(I, new Date(Date.now() + 1e3 * oe));
        } else
          La.delete(I);
      }
    }(i, w), !w.ok)
      throw new ja(w);
    if (w.headers.get("content-type") === "application/x-bison")
      return Gm.fromBinary(yield w.blob());
    {
      const I = yield w.text();
      return hi.parse(I);
    }
  });
}
function Kr(t) {
  if (t != null && t.cancelled)
    throw new xe.AbortError("Operation was cancelled");
}
let ar = !1;
function cd(t, e, n, r) {
  return ee(this, void 0, void 0, function* () {
    yield t.$baseRevs.bulkPut(Object.keys(e).filter((i) => e[i].markedForSync).map((i) => ({ tableName: i, clientRev: (n[i] || 0) + 1, serverRev: r }))), yield t.$baseRevs.where("tableName").noneOf(Object.keys(e).filter((i) => e[i].markedForSync)).delete();
  });
}
function Na(t, e = {}) {
  for (const { table: n, muts: r } of t) {
    const i = r.length > 0 ? r[r.length - 1].rev : null;
    e[n] = i || e[n] || 0;
  }
  return e;
}
function Qm(t, e, n) {
  return ee(this, void 0, void 0, function* () {
    const r = yield t.bulkGet(e), i = [], o = [];
    e.forEach((c, l) => {
      const d = r[l];
      if (d) {
        for (const [h, f] of Object.entries(n[l]))
          if (h === t.schema.primKey.keyPath) {
            if (Ks(f, c) !== 0)
              throw new Error("Cannot change primary key");
          } else
            xe.setByKeyPath(d, h, f);
        i.push(c), o.push(d);
      }
    }), yield t.schema.primKey.keyPath == null ? t.bulkPut(o, i) : t.bulkPut(o);
  });
}
function ld(t, e) {
  return ee(this, void 0, void 0, function* () {
    for (const { table: n, muts: r } of t) {
      if (!e.dx._allTables[n])
        continue;
      const i = e.table(n), { primaryKey: o } = i.core.schema, c = (l) => {
        switch (l[0]) {
          case "[":
            if (l.endsWith("]"))
              try {
                return JSON.parse(l);
              } catch {
              }
            return l;
          case "#":
            return l.endsWith(":" + e.cloud.currentUserId) ? l.substr(0, l.length - e.cloud.currentUserId.length - 1) : l;
          default:
            return l;
        }
      };
      for (const l of r) {
        const d = l.keys.map(c);
        switch (l.type) {
          case "insert":
            o.outbound ? yield i.bulkAdd(l.values, d) : (d.forEach((h, f) => {
              xe.setByKeyPath(l.values[f], o.keyPath, h);
            }), yield i.bulkAdd(l.values));
            break;
          case "upsert":
            o.outbound ? yield i.bulkPut(l.values, d) : (d.forEach((h, f) => {
              xe.setByKeyPath(l.values[f], o.keyPath, h);
            }), yield i.bulkPut(l.values));
            break;
          case "modify":
            d.length === 1 ? yield i.update(d[0], l.changeSpec) : yield i.where(":id").anyOf(d).modify(l.changeSpec);
            break;
          case "update":
            yield Qm(i, d, l.changeSpecs);
            break;
          case "delete":
            yield i.bulkDelete(d);
        }
      }
    }
  });
}
typeof self < "u" && typeof navigator < "u" && (ar = navigator.onLine, self.addEventListener("online", () => ar = !0), self.addEventListener("offline", () => ar = !1));
const bn = "dexie-cloud-syncer";
function ud(t, e) {
  return t.where("i").between(e, 1 / 0, !0).toArray();
}
function Jr(t, e, n) {
  var r, i, o;
  if (!t.dx._allTables[e])
    return;
  const c = (o = (i = (r = t.table(e)) === null || r === void 0 ? void 0 : r.schema.yProps) === null || i === void 0 ? void 0 : i.find((l) => l.prop === n)) === null || o === void 0 ? void 0 : o.updatesTable;
  return c && t.dx._allTables[c] ? t.table(c) : void 0;
}
function fd(t, e) {
  return ee(this, void 0, void 0, function* () {
    var n;
    const r = {};
    let i, o = !1;
    for (const c of t)
      try {
        switch (c.type) {
          case "u-s": {
            const l = Jr(e, c.table, c.prop);
            if (l) {
              const d = { k: c.k, u: c.u };
              c.r && (d.r = c.r, i = c.r), r[l.name] = yield l.add(d);
            }
            break;
          }
          case "u-ack": {
            const l = Jr(e, c.table, c.prop);
            l && (yield e.transaction("rw", l, (d) => ee(this, void 0, void 0, function* () {
              let h = yield d.table(l.name).get(bn);
              yield d.table(l.name).put(Object.assign(Object.assign({}, h || { i: bn }), { unsentFrom: Math.max((h == null ? void 0 : h.unsentFrom) || 1, c.i + 1) }));
            })));
            break;
          }
          case "u-reject": {
            const l = Jr(e, c.table, c.prop);
            if (!l)
              break;
            const d = (n = yield l.get(c.i)) === null || n === void 0 ? void 0 : n.k;
            if (d != null) {
              yield e.transaction("rw", l, (f) => (f.idbtrans._rejecting_y_ypdate = !0, l.where("i").aboveOrEqual(c.i).filter((g) => Ks(g.k, d) === 0 && (1 & (g.f || 0)) == 1).delete()));
              const h = ut.getDocCache(e.dx).find(c.table, d, c.prop);
              h && h.destroy();
            }
            break;
          }
          case "in-sync": {
            const l = ut.getDocCache(e.dx).find(c.table, c.k, c.prop);
            l && !l.isSynced && l.emit("sync", [!0, l]);
            break;
          }
          case "y-complete-sync-done":
            i = c.yServerRev;
            break;
          case "outdated-server-rev":
            o = !0;
        }
      } catch {
      }
    return { receivedUntils: r, resyncNeeded: o, yServerRevision: i };
  });
}
const Zm = 1, ev = 2, tv = 3;
function nv(t, e, n) {
  return ee(this, arguments, void 0, function* (r, i, { yDownloadedRealms: o, realms: c }) {
    if (o && c && c.every((f) => o[f] === "*"))
      return;
    const l = yield Js(r), d = { "Content-Type": "application/json", Accept: "application/octet-stream" };
    l && (d.Authorization = `Bearer ${l.accessToken}`);
    const h = yield fetch(`${i}/y/download`, { body: hi.stringify({ downloadedRealms: o || {} }), method: "POST", headers: d, credentials: "include" });
    if (!h.ok)
      throw new Error(`Failed to download Yjs documents from server. Status: ${h.status}`);
    yield async function(f, ...g) {
      var m, b, w;
      let I = f();
      for (let L = 0; L < g.length; L++)
        I = g[L](I);
      try {
        for (var j, $ = !0, B = Oa(I); !(m = (j = await B.next()).done); $ = !0)
          j.value, $ = !1;
      } catch (L) {
        b = { error: L };
      } finally {
        try {
          $ || m || !(w = B.return) || await w.call(B);
        } finally {
          if (b)
            throw b.error;
        }
      }
    }(function(f) {
      return function() {
        return Ia(this, arguments, function* () {
          if (!f.body)
            throw new Error("Response body is not readable");
          const g = f.body.getReader();
          try {
            for (; ; ) {
              const { done: m, value: b } = yield nt(g.read());
              if (m)
                return yield nt(void 0);
              yield yield nt(b);
            }
          } finally {
            g.releaseLock();
          }
        });
      };
    }(h), Tm, function(f) {
      return Ia(this, arguments, function* () {
        var g, m, b, w;
        let I = null, j = null, $ = null, B = [];
        function L(oe) {
          return ee(this, void 0, void 0, function* () {
            const je = B[B.length - 1];
            if (B.length > 0) {
              if (!I || !j || !$)
                throw new Error(`Protocol error from ${i}/y/download`);
              const ye = Jr(r, j, $);
              ye && (yield ye.bulkAdd(B)), B = [];
            }
            I && (j && $ && je || oe) && (yield r.$syncState.update("syncState", (ye) => {
              const De = ye.yDownloadedRealms || {};
              De[I] = oe ? "*" : { tbl: j, prop: $, key: je.k }, ye.yDownloadedRealms = De;
            }));
          });
        }
        try {
          try {
            for (var Q, se = !0, te = Oa(f); !(g = (Q = yield nt(te.next())).done); se = !0) {
              w = Q.value, se = !1;
              const oe = new Hu(w);
              for (; $p(oe); )
                switch (bs(oe)) {
                  case Zm:
                    yield nt(L(!0)), I = Bt(oe);
                    break;
                  case ev:
                    yield nt(L(!1)), j = Bt(oe), $ = Bt(oe);
                    break;
                  case tv: {
                    const je = ir(oe), ye = Nn(oe);
                    B.push({ k: je, u: ye });
                    break;
                  }
                }
              yield nt(L(!1));
            }
          } catch (oe) {
            m = { error: oe };
          } finally {
            try {
              se || g || !(b = te.return) || (yield nt(b.call(te)));
            } finally {
              if (m)
                throw m.error;
            }
          }
          yield nt(L(!0));
        } catch (oe) {
          throw oe instanceof xe.DexieError || (yield nt(L(!1))), oe;
        }
      });
    });
  });
}
const dd = "currentSyncWorker";
function Qs(t, e, n, r) {
  return hd(t, e, n, r).then((i) => (r != null && r.justCheckIfNeeded || t.syncStateChangedEvent.next({ phase: "in-sync" }), i)).catch((i) => ee(this, void 0, void 0, function* () {
    return r != null && r.justCheckIfNeeded ? Promise.reject(i) : ar && (r != null && r.retryImmediatelyOnFetchError) && (i == null ? void 0 : i.name) === "TypeError" && /fetch/.test(i == null ? void 0 : i.message) ? (t.syncStateChangedEvent.next({ phase: "error", error: i }), yield new Promise((o) => setTimeout(o, 500)), yield Qs(t, e, n, Object.assign(Object.assign({}, r), { retryImmediatelyOnFetchError: !1 }))) : (yield t.$syncState.update("syncState", { timestamp: /* @__PURE__ */ new Date(), error: "" + i }), t.syncStateChangedEvent.next({ phase: ar ? "error" : "offline", error: new Error("" + (i == null ? void 0 : i.message) || i) }), Promise.reject(i));
  }));
}
function hd(t, e, n) {
  return ee(this, arguments, void 0, function* (r, i, o, { isInitialSync: c, cancelToken: l, justCheckIfNeeded: d, purpose: h } = { isInitialSync: !1 }) {
    var f;
    if (!(!((f = r.cloud.options) === null || f === void 0) && f.databaseUrl))
      throw new Error("Internal error: sync must not be called when no databaseUrl is configured");
    const { databaseUrl: g } = i, m = yield r.getCurrentUser(), b = m.isLoggedIn ? ds(r) : [], w = b.map((z) => r.table(cc(z.name))), I = yield r.getPersistedSyncState(), j = m.isLoggedIn, $ = j ? function(z, ne) {
      const re = (ne == null ? void 0 : ne.syncedTables) || [];
      return ds(z).filter((ge) => !re.includes(ge.name));
    }(r, I) : [];
    Kr(l);
    const B = $.length > 0;
    if (B) {
      if (d)
        return !0;
      yield r.transaction("rw", $, (z) => ee(this, void 0, void 0, function* () {
        z.idbtrans.disableChangeTracking = !0, z.idbtrans.disableAccessControl = !0, yield function(ne, re, ge) {
          return ee(this, void 0, void 0, function* () {
            const be = new Set(ge || []);
            for (const ue of ne)
              ue.name === "members" ? yield ue.toCollection().modify((ae) => {
                be.has(ae.realmId) || ae.userId && ae.userId !== ht.userId || (ae.userId = re.userId);
              }) : ue.name === "roles" || (ue.name === "realms" ? yield ue.toCollection().modify((ae) => {
                be.has(ae.realmId) || ae.owner !== void 0 && ae.owner !== ht.userId || (ae.owner = re.userId);
              }) : yield ue.toCollection().modify((ae) => {
                ae.realmId && be.has(ae.realmId) || (ae.owner && ae.owner !== ht.userId || (ae.owner = re.userId), ae.realmId && ae.realmId !== ht.userId || (ae.realmId = re.userId));
              }));
          });
        }($, m, I == null ? void 0 : I.realms);
      })), Kr(l);
    }
    const [L, Q, se, { yMessages: te, lastUpdateIds: oe }] = yield r.transaction("r", r.tables, () => ee(this, void 0, void 0, function* () {
      const z = yield r.getPersistedSyncState();
      let ne = yield r.$baseRevs.toArray();
      ne = ne.filter((be) => b.some((ue) => ue.name === be.tableName));
      let re = yield Ta(w, r);
      const ge = yield function(be, ue) {
        return ee(this, void 0, void 0, function* () {
          const ae = [], Ae = {};
          for (const it of ue)
            if (it.schema.yProps)
              for (const Je of it.schema.yProps) {
                const Ke = be.table(Je.updatesTable), st = yield Ke.get(bn), Ve = (st == null ? void 0 : st.unsentFrom) || 1, Z = (st == null ? void 0 : st.receivedUntil) || 0, Le = Math.min(Ve, Z + 1), qe = yield ud(Ke, Le);
                qe.length > 0 && (Ae[Ke.name] = qe[qe.length - 1].i);
                const ce = {};
                for (const _e of qe) {
                  const Ie = (1 & (_e.f || 0)) == 1;
                  if (Ie && _e.i < Ve)
                    continue;
                  const Re = JSON.stringify(_e.k) + "/" + Ie;
                  let vt = ce[Re];
                  vt ? (vt.u.push(_e.u), vt.i = Math.max(_e.i, vt.i)) : (ce[Re] = vt = { i: _e.i, k: _e.k, isLocal: Ie, u: [] }, vt.u.push(_e.u));
                }
                for (const { k: _e, isLocal: Ie, u: Re, i: vt } of Object.values(ce)) {
                  const En = Re.length === 1 ? Re[0] : Cs(Re);
                  if (Ie)
                    ae.push({ type: "u-c", table: it.name, prop: Je.prop, k: _e, u: En, i: vt });
                  else {
                    const Tt = Ef(En);
                    ae.push({ type: "sv", table: it.name, prop: Je.prop, k: _e, sv: Tt });
                  }
                }
              }
          return { yMessages: ae, lastUpdateIds: Ae };
        });
      }(r, b);
      if (Kr(l), B) {
        const be = [...(I == null ? void 0 : I.realms) || [], ...(I == null ? void 0 : I.inviteRealms) || []], ue = yield function(ae, Ae, it, Je) {
          return ee(this, void 0, void 0, function* () {
            const Ke = `upload-${Xf(8)}`;
            if (Ae.isLoggedIn && ae.length > 0) {
              const st = new Set(Je || []);
              return (yield Promise.all(ae.map((Ve) => ee(this, void 0, void 0, function* () {
                const { extractKey: Z } = Ve.core.schema.primaryKey;
                if (!Z)
                  return { table: Ve.name, muts: [] };
                const Le = it[Ve.name], qe = Le != null && Le.generatedGlobalId ? Ve.filter((_e) => {
                  return Z(_e), !st.has(_e.realmId || "") && (Ie = Z(_e), !(Re = Le == null ? void 0 : Le.idPrefix) || typeof Ie == "string" && Ie.startsWith(Re));
                  var Ie, Re;
                }) : Ve.filter((_e) => {
                  const Ie = Z(_e);
                  return !st.has(_e.realmId || "") && uc(Ie);
                }), ce = yield qe.toArray();
                if (ce.length > 0) {
                  const _e = { type: "upsert", values: ce, keys: ce.map(Z), userId: Ae.userId, txid: Ke };
                  return { table: Ve.name, muts: [_e] };
                }
                return { table: Ve.name, muts: [] };
              })))).filter((Ve) => Ve.muts.length > 0);
            }
            return [];
          });
        }($, m, o, be);
        return Kr(l), re = re.concat(ue), [re, z, ne, ge];
      }
      return [re, z, ne, ge];
    })), je = L.some((z) => z.muts.some((ne) => ne.keys.length > 0)) || te.some((z) => z.type === "u-c");
    if (d)
      return je;
    if (h === "push" && !je)
      return !1;
    const ye = Na(L, Q == null ? void 0 : Q.latestRevisions), De = (Q == null ? void 0 : Q.clientIdentity) || Qf(16);
    Kr(l);
    const H = yield Xm(L, te, Q, se, r, g, o, De, m), { done: de, newSyncState: me } = yield r.transaction("rw", r.tables, (z) => ee(this, void 0, void 0, function* () {
      z.idbtrans.disableChangeTracking = !0, z.idbtrans.disableAccessControl = !0;
      for (const ue of Object.keys(o))
        H.schema[ue] && (o[ue] = H.schema[ue]);
      yield r.$syncState.put(o, "schema");
      const ne = yield Ta(w, r, { since: ye });
      for (const ue of w) {
        const ae = Jf(ue.name);
        if (ne.some((Ae) => Ae.table === ae && Ae.muts.length > 0)) {
          if (ye[ae]) {
            const Ae = ye[ae] || 0;
            yield Promise.all([ue.where("rev").belowOrEqual(Ae).delete(), r.$baseRevs.where(":id").between([ae, -1 / 0], [ae, Ae + 1], !0, !0).reverse().offset(1).delete()]);
          }
        } else
          yield Promise.all([ue.clear(), r.$baseRevs.where({ tableName: ae }).delete()]);
      }
      Na(ne, ye), yield cd(r, o, ye, H.serverRevision);
      const re = yield r.getPersistedSyncState();
      yield function(ue, ae, Ae) {
        return ee(this, void 0, void 0, function* () {
          const it = /* @__PURE__ */ new Set(), Je = /* @__PURE__ */ new Set(), Ke = Ae ? Ae.realms : [], st = Ae ? Ae.inviteRealms : [], Ve = new Set(ae.realms), Z = new Set(ae.realms.concat(ae.inviteRealms));
          for (const Le of Ke)
            Ve.has(Le) || (Je.add(Le), Z.has(Le) || it.add(Le));
          for (const Le of st.concat(Ke))
            Z.has(Le) || it.add(Le);
          if (it.size > 0 || Je.size > 0) {
            const Le = ds(ue);
            for (const qe of Le) {
              let ce = ["realms", "members", "roles"].includes(qe.name) ? it : Je;
              ce.size !== 0 && (qe.schema.indexes.some((_e) => _e.keyPath === "realmId" || Array.isArray(_e.keyPath) && _e.keyPath[0] === "realmId") ? yield qe.where("realmId").anyOf([...ce]).delete() : yield qe.filter((_e) => !!(_e != null && _e.realmId) && ce.has(_e.realmId)).delete());
            }
          }
          if (Je.size > 0 && (Ae != null && Ae.yDownloadedRealms))
            for (const Le of Je)
              delete Ae.yDownloadedRealms[Le];
        });
      }(r, H, re);
      const ge = re || { syncedTables: [], latestRevisions: {}, realms: [], inviteRealms: [], clientIdentity: De };
      j && (ge.syncedTables = b.map((ue) => ue.name).concat($.map((ue) => ue.name))), ge.latestRevisions = ye, ge.remoteDbId = H.dbId, ge.initiallySynced = !0, ge.realms = H.realms, ge.inviteRealms = H.inviteRealms, ge.serverRevision = H.serverRevision, ge.yServerRevision = H.serverRevision, ge.timestamp = /* @__PURE__ */ new Date(), delete ge.error;
      const be = pd(H.changes, ne);
      if (yield ld(be, r), H.yMessages) {
        const { receivedUntils: ue, resyncNeeded: ae, yServerRevision: Ae } = yield fd(H.yMessages, r);
        Ae && (ge.yServerRevision = Ae), yield function(it, Je, Ke) {
          return ee(this, void 0, void 0, function* () {
            var st, Ve, Z, Le, qe;
            const ce = {};
            for (const [Ie, Re] of Object.entries(it))
              (st = ce[Ie]) !== null && st !== void 0 || (ce[Ie] = {}), ce[Ie].unsentFrom = Re + 1;
            for (const [Ie, Re] of Object.entries(Je))
              (Ve = ce[Ie]) !== null && Ve !== void 0 || (ce[Ie] = {}), ce[Ie].receivedUntil = Re;
            const _e = Object.values(Ke.dx._dbSchema).filter((Ie) => Ie.yProps).map((Ie) => Ie.yProps.map((Re) => Re.updatesTable)).flat();
            for (const Ie of _e) {
              const Re = ce[Ie], vt = (Z = Re == null ? void 0 : Re.unsentFrom) !== null && Z !== void 0 ? Z : 1, En = (qe = (Le = Re == null ? void 0 : Re.receivedUntil) !== null && Le !== void 0 ? Le : (yield Ke.table(Ie).where("i").between(1, 1 / 0).reverse().limit(1).primaryKeys())[0]) !== null && qe !== void 0 ? qe : 0;
              yield Ke.transaction("rw", Ie, () => ee(this, void 0, void 0, function* () {
                const Tt = yield Ke.table(Ie).get(bn);
                Tt ? (Tt.unsentFrom = Math.max(vt, Tt.unsentFrom || 1), Tt.receivedUntil = Math.max(En, Tt.receivedUntil || 0), yield Ke.table(Ie).put(Tt)) : yield Ke.table(Ie).add({ i: bn, unsentFrom: vt, receivedUntil: En });
              }));
            }
          });
        }(oe, ue, r), ae && (ge.yDownloadedRealms = {});
      }
      return r.$syncState.put(ge, "syncState"), { done: ne.length === 0, newSyncState: ge };
    }));
    if (!de)
      return yield ad(r), yield hd(r, i, o, { isInitialSync: c, cancelToken: l });
    const we = Object.values(o).some((z) => {
      var ne;
      return (ne = z.yProps) === null || ne === void 0 ? void 0 : ne.length;
    }), ke = !!H.yMessages;
    if (we && ke)
      try {
        yield nv(r, g, me);
      } catch {
      }
    return r.syncCompleteEvent.next(), !1;
  });
}
function pd(t, e) {
  const n = {};
  jl(n, t);
  const r = {};
  return jl(r, e), function(i, o) {
    var c, l, d;
    for (const [h, f] of Object.entries(o))
      for (const [g, m] of Object.entries(f))
        switch (m.type) {
          case "ups":
            {
              const b = (c = i[h]) === null || c === void 0 ? void 0 : c[g];
              if (b)
                switch (b.type) {
                  case "ups":
                  case "upd":
                    delete i[h][g];
                }
            }
            break;
          case "del":
            (l = i[h]) === null || l === void 0 || delete l[g];
            break;
          case "upd": {
            const b = (d = i[h]) === null || d === void 0 ? void 0 : d[g];
            if (b)
              switch (b.type) {
                case "ups":
                  for (const [w, I] of Object.entries(m.mod))
                    Ps(b.val, w, I);
                  break;
                case "del":
                  break;
                case "upd":
                  for (const w of Object.keys(m.mod))
                    delete b.mod[w];
              }
            break;
          }
        }
  }(n, r), function(i, o = "") {
    o || (o = Qf(16));
    const c = {};
    for (const [d, h] of Object.entries(i))
      for (const [f, g] of Object.entries(h)) {
        const m = c[d] || (c[d] = {});
        (m[g.type] || (m[g.type] = [])).push(Object.assign({ key: f }, g));
      }
    const l = [];
    for (const [d, h] of Object.entries(c)) {
      const f = { table: d, muts: [] };
      for (const [g, m] of Object.entries(h))
        switch (g) {
          case "ups": {
            const b = { type: "upsert", keys: m.map((w) => w.key), values: m.map((w) => w.val), txid: o };
            f.muts.push(b);
            break;
          }
          case "upd": {
            const b = { type: "update", keys: m.map((w) => w.key), changeSpecs: m.map((w) => w.mod), txid: o };
            f.muts.push(b);
            break;
          }
          case "del": {
            const b = { type: "delete", keys: m.map((w) => w.key), txid: o };
            f.muts.push(b);
            break;
          }
        }
      l.push(f);
    }
    return l;
  }(n);
}
const rv = 10, iv = 1e4, sv = 1e3;
function ov(t) {
  const e = [], n = new Dt(!0), r = new Dt(null);
  let i = !1, o = new Array(rv).fill(0);
  return r.subscribe(() => ee(this, void 0, void 0, function* () {
    if (!i && e.length > 0) {
      i = !0, o.shift(), o.push(Date.now()), n.next(!1);
      try {
        yield function() {
          return ee(this, void 0, void 0, function* () {
            for (var c, l, d, h, f, g; e.length > 0; ) {
              const m = e.shift();
              try {
                yield Ln(t.cloud.syncState.pipe(Ct(({ phase: w }) => w === "in-sync" || w === "error")));
                const b = t.cloud.persistedSyncState.value;
                if (!m)
                  continue;
                switch (m.type) {
                  case "token-expired":
                    const w = t.cloud.currentUser.value, I = yield Xs(t.cloud.options.databaseUrl, w);
                    yield t.table("$logins").update(w.userId, { accessToken: I.accessToken, accessTokenExpiration: I.accessTokenExpiration, claims: I.claims, license: I.license, data: I.data });
                    break;
                  case "realm-added":
                    !((c = b == null ? void 0 : b.realms) === null || c === void 0) && c.includes(m.realm) || !((l = b == null ? void 0 : b.inviteRealms) === null || l === void 0) && l.includes(m.realm) || (yield t.cloud.sync({ purpose: "pull", wait: !0 }));
                    break;
                  case "realm-accepted":
                    !((d = b == null ? void 0 : b.realms) === null || d === void 0) && d.includes(m.realm) || (yield t.cloud.sync({ purpose: "pull", wait: !0 }));
                    break;
                  case "realm-removed":
                    (!((h = b == null ? void 0 : b.realms) === null || h === void 0) && h.includes(m.realm) || !((f = b == null ? void 0 : b.inviteRealms) === null || f === void 0) && f.includes(m.realm)) && (yield t.cloud.sync({ purpose: "pull", wait: !0 }));
                    break;
                  case "realms-changed":
                    yield t.cloud.sync({ purpose: "pull", wait: !0 });
                    break;
                  case "changes":
                    if (((g = t.cloud.syncState.value) === null || g === void 0 ? void 0 : g.phase) === "error") {
                      Xt(t, "pull");
                      break;
                    }
                    yield t.transaction("rw", t.dx.tables, (j) => ee(this, void 0, void 0, function* () {
                      j.idbtrans.disableChangeTracking = !0, j.idbtrans.disableAccessControl = !0;
                      const [$, B, L] = yield Promise.all([t.getSchema(), t.getPersistedSyncState(), t.getCurrentUser()]);
                      if (!B || !$ || !L)
                        return;
                      if (m.baseRev !== B.serverRevision)
                        return void (typeof m.baseRev != "string" || typeof B.serverRevision != "bigint" && typeof B.serverRevision != "object" || Xt(t, "pull"));
                      if ((yield xe.waitFor(Da(B))) !== m.realmSetHash)
                        return void Xt(t, "pull");
                      let Q = [];
                      if (L.isLoggedIn) {
                        const se = ds(t).map((te) => t.table(cc(te.name)));
                        Q = yield Ta(se, t);
                      }
                      if (m.changes.length > 0) {
                        const se = pd(m.changes, Q);
                        yield ld(se, t);
                      }
                      B.latestRevisions = Na(Q, B.latestRevisions), B.serverRevision = m.newRev, yield cd(t, $, B.latestRevisions, m.newRev), yield t.$syncState.put(B, "syncState");
                    }));
                }
              } catch {
              }
            }
          });
        }();
      } finally {
        o[o.length - 1] - o[0] < iv && (yield new Promise((c) => setTimeout(c, sv))), i = !1, n.next(!0);
      }
    }
  })), { enqueue: function(c) {
    e.push(c), r.next(null);
  }, readyToServe: n };
}
const Fl = /* @__PURE__ */ new WeakMap(), ts = { members: "@id, [userId+realmId], [email+realmId], realmId", roles: "[realmId+name]", realms: "@realmId", $jobs: "", $syncState: "", $baseRevs: "[tableName+clientRev]", $logins: "claims.sub, lastLogin" };
let av = 0;
function Nt(t) {
  "vip" in t && (t = t.vip);
  let e = Fl.get(t.cloud);
  if (!e) {
    const n = new $n();
    let r = new es(`syncstatechanged-${t.name}`), i = new es(`synccomplete-${t.name}`);
    n.id = ++av;
    let o = !1;
    e = { get name() {
      return t.name;
    }, close: () => t.close(), transaction: t.transaction.bind(t), table: t.table.bind(t), get tables() {
      return t.tables;
    }, cloud: t.cloud, get $jobs() {
      return t.table("$jobs");
    }, get $syncState() {
      return t.table("$syncState");
    }, get $baseRevs() {
      return t.table("$baseRevs");
    }, get $logins() {
      return t.table("$logins");
    }, get realms() {
      return t.realms;
    }, get members() {
      return t.members;
    }, get roles() {
      return t.roles;
    }, get initiallySynced() {
      return o;
    }, localSyncEvent: n, get syncStateChangedEvent() {
      return r;
    }, get syncCompleteEvent() {
      return i;
    }, dx: t }, Object.assign(e, { getCurrentUser: () => e.$logins.toArray().then((l) => l.find((d) => d.isLoggedIn) || ht), getPersistedSyncState: () => e.$syncState.get("syncState"), getSchema: () => e.$syncState.get("schema").then((l) => {
      if (l)
        for (const h of e.tables)
          h.schema.primKey && h.schema.primKey.keyPath && l[h.name] && (l[h.name].primaryKey = typeof (d = h.schema.primKey.keyPath) == "string" ? d : d ? "[" + [].join.call(d, "+") + "]" : "");
      var d;
      return l;
    }), getOptions: () => e.$syncState.get("options"), setInitiallySynced(l) {
      o = l;
    }, reconfigure() {
      r = new es(`syncstatechanged-${t.name}`), i = new es(`synccomplete-${t.name}`);
    } }), e.messageConsumer = ov(e), e.messageProducer = new $n(), Fl.set(t.cloud, e);
  }
  return e;
}
const ql = /* @__PURE__ */ new WeakMap();
class fc {
  constructor(e, n) {
    ql.set(this, e), Object.assign(this, n);
  }
  static load(e, n) {
    return e.table("$logins").get(n).then((r) => new fc(e, r || { userId: n, claims: { sub: n }, lastLogin: /* @__PURE__ */ new Date(0) }));
  }
  save() {
    return ee(this, void 0, void 0, function* () {
      ql.get(this).table("$logins").put(this);
    });
  }
}
function yd(t, e) {
  return Ln(kt(t).pipe(Ct(e)));
}
function gd(t) {
  return ee(this, void 0, void 0, function* () {
    const e = yield Ma(t);
    if (e) {
      if (!(yield function(n, r, i) {
        return ee(this, void 0, void 0, function* () {
          const o = [{ type: "warning", messageCode: "LOGOUT_CONFIRMATION", message: `{numUnsyncedChanges} unsynced changes will get lost!
                Logout anyway?`, messageParams: { currentUserId: r, numUnsyncedChanges: i.toString() } }];
          return yield ki(n, { type: "logout-confirmation", title: "Confirm Logout", alerts: o, fields: {}, submitLabel: "Confirm logout", cancelLabel: "Cancel" }).then(() => !0).catch(() => !1);
        });
      }(t.cloud.userInteraction, t.cloud.currentUserId, e)))
        throw new Error("User cancelled logout due to unsynced changes");
      yield Ma(t, { deleteUnsyncedData: !0 });
    }
  });
}
function Ma(t) {
  return ee(this, arguments, void 0, function* (e, { deleteUnsyncedData: n = !1 } = {}) {
    const [r, i] = yield e.dx.transaction("rw", e.dx.tables, (o) => ee(this, void 0, void 0, function* () {
      const c = o.idbtrans;
      c.disableChangeTracking = !0, c.disableAccessControl = !0;
      const l = o.storeNames.filter((h) => h.endsWith("_mutations")), d = (yield Promise.all(l.map((h) => o.table(h).count()))).reduce((h, f) => h + f, 0);
      if (d > 0 && !n)
        return [d, !1];
      e.$syncState.delete("syncState");
      for (const h of e.dx.tables)
        h.name !== "$jobs" && h.name !== "$syncState" && h.clear();
      return [d, !0];
    }));
    return i && (yield yd(e.cloud.currentUser, (o) => o.userId === ht.userId), yield e.cloud.sync({ purpose: "pull", wait: !0 })), r;
  });
}
function ns(t, ...e) {
  globalThis.console[t](...e);
}
function na(t, e) {
  return ee(this, void 0, void 0, function* () {
    var n;
    const r = yield t.getCurrentUser(), i = r.userId;
    if (r.isLoggedIn && (!e || !e.email && !e.userId)) {
      if ((((n = r.license) === null || n === void 0 ? void 0 : n.status) || "ok") === "ok" && r.accessToken && (!r.accessTokenExpiration || r.accessTokenExpiration.getTime() > Date.now()))
        return !1;
      if (r.refreshToken && (!r.refreshTokenExpiration || r.refreshTokenExpiration.getTime() > Date.now()))
        return yield Js(t), !1;
    }
    const o = new fc(t, { claims: {}, lastLogin: /* @__PURE__ */ new Date(0) });
    return yield Rm(t.cloud.options.databaseUrl, o, t.cloud.options.fetchTokens || function(c) {
      const { userInteraction: l } = c.cloud;
      return function(d) {
        return ee(this, arguments, void 0, function* ({ public_key: h, hints: f }) {
          var g;
          let m;
          const b = (g = c.cloud.options) === null || g === void 0 ? void 0 : g.databaseUrl;
          if (!b)
            throw new Error("No database URL given.");
          if ((f == null ? void 0 : f.grant_type) === "demo")
            m = { demo_user: yield Ll(l, "Enter a demo user email", (f == null ? void 0 : f.email) || (f == null ? void 0 : f.userId)), grant_type: "demo", scopes: ["ACCESS_DB"], public_key: h };
          else if (f != null && f.otpId && f.otp)
            m = { grant_type: "otp", otp_id: f.otpId, otp: f.otp, scopes: ["ACCESS_DB"], public_key: h };
          else {
            const j = yield Ll(l, "Enter email address", f == null ? void 0 : f.email);
            m = /@demo.local$/.test(j) ? { demo_user: j, grant_type: "demo", scopes: ["ACCESS_DB"], public_key: h } : { email: j, grant_type: "otp", scopes: ["ACCESS_DB"] };
          }
          const w = yield fetch(`${b}/token`, { body: JSON.stringify(m), method: "post", headers: { "Content-Type": "application/json", mode: "cors" } });
          if (w.status !== 200) {
            const j = yield w.text();
            throw yield Pa(l, "Token request failed", { type: "error", messageCode: "GENERIC_ERROR", message: j, messageParams: {} }).catch(() => {
            }), new ja(w, j);
          }
          const I = yield w.json();
          if (I.type === "tokens" || I.type === "error")
            return I;
          if (m.grant_type === "otp" && "email" in m) {
            if (I.type !== "otp-sent")
              throw new Error(`Unexpected response from ${b}/token`);
            const j = yield Nl(l, m.email), $ = Object.assign(Object.assign({}, m), { otp: j || "", otp_id: I.otp_id, public_key: h });
            let B = yield fetch(`${b}/token`, { body: JSON.stringify($), method: "post", headers: { "Content-Type": "application/json" }, mode: "cors" });
            for (; B.status === 401; ) {
              const L = yield B.text();
              $.otp = yield Nl(l, m.email, { type: "error", messageCode: "INVALID_OTP", message: L, messageParams: {} }), B = yield fetch(`${b}/token`, { body: JSON.stringify($), method: "post", headers: { "Content-Type": "application/json" }, mode: "cors" });
            }
            if (B.status !== 200) {
              const L = yield B.text();
              throw new ja(B, L);
            }
            return yield B.json();
          }
          throw new Error(`Unexpected response from ${b}/token`);
        });
      };
    }(t), t.cloud.userInteraction, e), i !== ht.userId && o.userId !== i && (yield gd(t)), yield function(c, l) {
      return ee(this, void 0, void 0, function* () {
        const d = c.table("$logins");
        yield c.transaction("rw", d, (h) => ee(this, void 0, void 0, function* () {
          const f = yield d.toArray();
          yield Promise.all(f.filter((g) => g.userId !== l.userId && g.isLoggedIn).map((g) => (g.isLoggedIn = !1, d.put(g)))), l.isLoggedIn = !0, l.lastLogin = /* @__PURE__ */ new Date();
          try {
            yield l.save();
          } catch (g) {
            try {
              g.name === "DataCloneError" && (ns("debug", "Login context property names:", Object.keys(l)), ns("debug", "Login context property names:", Object.keys(l)), ns("debug", "Login context:", l), ns("debug", "Login context JSON:", JSON.stringify(l)));
            } catch {
            }
            throw g;
          }
        })), yield yd(c.cloud.currentUser, (h) => h.userId === l.userId);
      });
    }(t, o), Xt(t, "pull"), o.userId !== i;
  });
}
const cv = typeof InstallTrigger < "u", md = typeof navigator < "u" && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\/|Edge\//.test(navigator.userAgent), lv = md ? [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] : NaN, vd = md && lv <= 605 || cv, uv = typeof self < "u" && "clients" in self && !self.document, { toString: fv } = {};
function Vl(t) {
  return fv.call(t).slice(8, -1);
}
function ra(t, e) {
  var n;
  return e.type === "delete" ? e.keys : ((n = e.keys) === null || n === void 0 ? void 0 : n.slice()) || e.values.map(t.extractKey);
}
const dv = /b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|x|y|z/i;
let Gt = 0;
function bd(t, e) {
  const n = new Uint8Array(18), r = new Uint8Array(n.buffer, 0, 6), i = Date.now();
  Gt >= i ? ++Gt : Gt = i, r[0] = Gt / 1099511627776, r[1] = Gt / 4294967296, r[2] = Gt / 16777216, r[3] = Gt / 65536, r[4] = Gt / 256, r[5] = Gt;
  const o = new Uint8Array(n.buffer, 6);
  return crypto.getRandomValues(o), t + td(new Uint8Array(n.buffer)) + (e || "");
}
function hv(t) {
  return { stack: "dbcore", name: "idGenerationMiddleware", level: 1, create: (e) => Object.assign(Object.assign({}, e), { table: (n) => {
    const r = e.table(n);
    return Object.assign(Object.assign({}, r), { mutate: (i) => {
      var o, c;
      const l = i.trans;
      if (l.mode === "versionchange" && (l.disableChangeTracking = !0, l.disableAccessControl = !0), l.disableChangeTracking)
        return r.mutate(i);
      if (i.type === "add" || i.type === "put") {
        const d = (o = t.cloud.schema) === null || o === void 0 ? void 0 : o[n];
        if (d != null && d.generatedGlobalId) {
          if (!((c = t.cloud.options) === null || c === void 0) && c.databaseUrl && !t.initiallySynced) {
            const h = ra(r.schema.primaryKey, i);
            return r.getMany({ keys: h, trans: i.trans, cache: "immutable" }).then((f) => {
              if (f.length < h.length)
                throw new Error("Unable to create new objects without an initial sync having been performed.");
              return r.mutate(i);
            });
          }
          return function(h, f) {
            let g = null;
            const m = ra(r.schema.primaryKey, h);
            return m.forEach((b, w) => {
              if (b === void 0) {
                const I = h.values[w].realmId || t.cloud.currentUserId, j = I.substr(I.length - 3);
                m[w] = bd(f, j), r.schema.primaryKey.outbound || (g || (g = h.values.slice()), g[w] = xe.deepClone(g[w]), xe.setByKeyPath(g[w], r.schema.primaryKey.keyPath, m[w]));
              } else if (typeof b != "string" || !b.startsWith(f) && !b.startsWith("#" + f))
                throw new xe.ConstraintError(`The ID "${b}" is not valid for table "${n}". Primary '@' keys requires the key to be prefixed with "${f}" (or "#${f}).
If you want to generate IDs programmatically, remove '@' from the schema to get rid of this constraint. Dexie Cloud supports custom IDs as long as they are random and globally unique.`);
            }), r.mutate(Object.assign(Object.assign({}, h), { keys: m, values: g || h.values }));
          }(i, d.idPrefix);
        }
        d != null && d.markedForSync && ra(r.schema.primaryKey, i).forEach((h, f) => {
          if (!uc(h)) {
            const g = Array.isArray(h) ? h.map(Vl).join(",") : Vl(h);
            throw new xe.ConstraintError(`Invalid primary key type ${g} for table ${n}. Tables marked for sync has primary keys of type string or Array of string (and optional numbers)`);
          }
        });
      }
      return r.mutate(i);
    } });
  } }) };
}
let pv = 0;
function Br(t, e) {
  return function(n) {
    const { readers: r, writers: i } = n.trans[e] || (n.trans[e] = { writers: [], readers: [] }), o = i.length, c = (o > 0 ? i[o - 1].then(() => t(n), () => t(n)) : t(n)).finally(() => {
      r.splice(r.indexOf(c));
    });
    return r.push(c), c;
  };
}
function yv(t, e) {
  return function(n) {
    const { readers: r, writers: i } = n.trans[e] || (n.trans[e] = { writers: [], readers: [] });
    let o = (i.length > 0 ? i[i.length - 1].then(() => t(n), () => t(n)) : r.length > 0 ? (c = r, new Promise((l) => {
      c.length === 0 && l([]);
      let d = c.length;
      const h = new Array(d);
      c.forEach((f, g) => Promise.resolve(f).then((m) => h[g] = { status: "fulfilled", value: m }, (m) => h[g] = { status: "rejected", reason: m }).then(() => --d || l(h)));
    })).then(() => t(n)) : t(n)).finally(() => {
      i.shift();
    });
    var c;
    return i.push(o), o;
  };
}
const er = new Dt(/* @__PURE__ */ new Set());
function pi(t) {
  var e, n, r, i;
  return ((e = t.cloud.options) === null || e === void 0 ? void 0 : e.disableEagerSync) || ((r = (n = t.cloud.currentUser.value) === null || n === void 0 ? void 0 : n.license) === null || r === void 0 ? void 0 : r.status) !== "ok" || !(!((i = t.cloud.options) === null || i === void 0) && i.databaseUrl);
}
function gv({ currentUserObservable: t, db: e }) {
  return { stack: "dbcore", name: "MutationTrackingMiddleware", level: 1, create: (n) => {
    const r = new Set(n.schema.tables.map((c) => c.name)), i = n.schema.tables.filter((c) => !/^\$/.test(c.name)), o = /* @__PURE__ */ new Map();
    for (const c of i) {
      const l = `$${c.name}_mutations`;
      r.has(l) && o.set(c.name, n.table(l));
    }
    return Object.assign(Object.assign({}, n), { transaction: (c, l) => {
      let d;
      if (l === "readwrite") {
        const h = c.filter((f) => {
          var g, m;
          return (m = (g = e.cloud.schema) === null || g === void 0 ? void 0 : g[f]) === null || m === void 0 ? void 0 : m.markedForSync;
        }).map((f) => cc(f));
        d = n.transaction([...c, ...h], l);
      } else
        d = n.transaction(c, l);
      if (l === "readwrite") {
        d.txid = Xf(16), d.opCount = 0, d.currentUser = t.value, er.value.add(d), er.next(er.value);
        const h = () => {
          d.removeEventListener("complete", f), d.removeEventListener("error", h), d.removeEventListener("abort", h), er.value.delete(d), er.next(er.value);
        }, f = () => {
          d.mutationsAdded && !pi(e) && Xt(e, "push"), h();
        };
        d.addEventListener("complete", f), d.addEventListener("error", h), d.addEventListener("abort", h);
      }
      return d;
    }, table: (c) => {
      const l = n.table(c);
      if (/^\$/.test(c))
        return c.endsWith("_mutations") ? Object.assign(Object.assign({}, l), { mutate: (g) => (g.type !== "add" && g.type !== "put" || (g.trans.mutationsAdded = !0), l.mutate(g)) }) : c === "$logins" ? Object.assign(Object.assign({}, l), { mutate: (g) => l.mutate(g).then((m) => (g.trans.mutationsAdded = !0, m)).catch((m) => Promise.reject(m)) }) : l;
      const { schema: d } = l, h = o.get(c);
      return h ? function(g) {
        const m = "$lock" + ++pv;
        return Object.assign(Object.assign({}, g), { count: Br(g.count, m), get: Br(g.get, m), getMany: Br(g.getMany, m), openCursor: Br(g.openCursor, m), query: Br(g.query, m), mutate: yv(g.mutate, m) });
      }(Object.assign(Object.assign({}, l), { mutate: (g) => {
        var m, b, w;
        const I = g.trans;
        return I.txid ? I.disableChangeTracking ? l.mutate(g) : !((b = (m = e.cloud.schema) === null || m === void 0 ? void 0 : m[c]) === null || b === void 0) && b.markedForSync && (!((w = I.currentUser) === null || w === void 0) && w.isLoggedIn) ? g.type === "deleteRange" ? l.query({ query: { range: g.range, index: d.primaryKey }, trans: g.trans, values: !1 }).then((j) => f({ type: "delete", keys: j.result, trans: g.trans, criteria: { index: null, range: g.range } })) : f(g) : l.mutate(g) : l.mutate(g);
      } })) : l;
      function f(g) {
        var m, b;
        const w = g.trans, I = (b = (m = e.cloud.options) === null || m === void 0 ? void 0 : m.unsyncedProperties) === null || b === void 0 ? void 0 : b[c], { txid: j, currentUser: { userId: $ } } = w, { type: B } = g, L = ++w.opCount;
        function Q(se) {
          if (!I)
            return se;
          let te = se;
          for (const oe of Object.keys(se))
            I.some((je) => oe === je || oe.startsWith(je + ".")) && (te === se && (te = Object.assign({}, se)), delete te[oe]);
          return te;
        }
        return l.mutate(g).then((se) => {
          var te;
          const { numFailures: oe, failures: je } = se;
          let ye = B === "delete" ? g.keys : se.results, De = "values" in g ? g.values : [], H = "changeSpec" in g ? g.changeSpec : void 0, de = "updates" in g ? g.updates : void 0;
          if (oe && (ye = ye.filter((z, ne) => !je[ne]), De = De.filter((z, ne) => !je[ne])), I) {
            if (De = De.map((z) => {
              const ne = Object.assign({}, z);
              for (const re of I)
                delete ne[re];
              return ne;
            }), H && (H = Q(H), Object.keys(H).length === 0))
              return se;
            if (de) {
              let z = de.changeSpecs.map(Q), ne = { keys: [], changeSpecs: [] };
              const re = new gh();
              let ge = !1;
              for (let be = 0, ue = z.length; be < ue; ++be)
                Object.keys(z[be]).length > 0 ? (ne.keys.push(de.keys[be]), ne.changeSpecs.push(z[be]), re.addKey(de.keys[be])) : ge = !0;
              if (de = ne, ge) {
                let be = [], ue = [];
                for (let ae = 0, Ae = ye.length; ae < Ae; ++ae)
                  re.hasKey(ye[ae]) && (be.push(ye[ae]), ue.push(De[ae]));
                ye = be, De = ue;
              }
            }
          }
          const me = Date.now();
          let we = "criteria" in g && g.criteria ? Object.assign(Object.assign({}, g.criteria), { index: g.criteria.index === d.primaryKey.keyPath ? null : g.criteria.index }) : void 0;
          if (I && (we != null && we.index)) {
            const z = (te = d.indexes.find((ne) => ne.name === we.index)) === null || te === void 0 ? void 0 : te.keyPath;
            (z ? typeof z == "string" ? [z] : z : []).some((ne) => I == null ? void 0 : I.includes(ne)) && (we = void 0);
          }
          const ke = g.type === "delete" ? { type: "delete", ts: me, opNo: L, keys: ye, criteria: we, txid: j, userId: $ } : g.type === "add" ? { type: "insert", ts: me, opNo: L, keys: ye, txid: j, userId: $, values: De } : we && H ? { type: "modify", ts: me, opNo: L, keys: ye, criteria: we, changeSpec: H, txid: j, userId: $ } : H ? { type: "update", ts: me, opNo: L, keys: ye, changeSpecs: ye.map(() => H), txid: j, userId: $ } : de ? { type: "update", ts: me, opNo: L, keys: de.keys, changeSpecs: de.changeSpecs, txid: j, userId: $ } : { type: "upsert", ts: me, opNo: L, keys: ye, values: De, txid: j, userId: $ };
          return "isAdditionalChunk" in g && g.isAdditionalChunk && (ke.isAdditionalChunk = !0), ye.length > 0 || we ? h.mutate({ type: "add", trans: w, values: [ke] }).then(() => (w.mutationsAdded = !0, se)) : se;
        });
      }
    } });
  } };
}
function mv(t, e) {
  return function(n, r) {
    var i;
    const o = Object.assign(Object.assign({}, ts), n);
    Object.keys(ts).forEach((h) => {
      const f = o[h];
      if (f == null)
        throw new Error(`Cannot delete table ${h} as it is needed for access control of Dexie Cloud`);
      if (!n[h])
        return;
      const g = f.split(",").map((w) => w.trim()), m = ts[h].split(",").map((w) => w.trim()), b = new Set(g.map((w) => w.replace(/([&*]|\+\+)/g, "")));
      if (g[0] !== m[0])
        throw new Error(`Cannot override primary key of table ${h}. Please declare it as {${h}: ${JSON.stringify(ts[h])}`);
      for (let w = 1; w < m.length; ++w) {
        const I = m[w];
        b.has(I.replace(/([&*]|\+\+)/g, "")) || (o[h] += `,${I}`);
      }
    });
    const c = e.cloud.schema || (e.cloud.schema = {}), l = /* @__PURE__ */ new Set();
    Object.keys(o).forEach((h) => {
      const f = o[h], g = c[h] || (c[h] = {});
      f != null ? (/^\@/.test(f) && (o[h] = o[h].substr(1), g.generatedGlobalId = !0, g.idPrefix = function(m, b) {
        let w = m[0].toLocaleLowerCase();
        for (let B = 1, L = m.length; B < L && w.length < 3; ++B)
          (dv.test(m[B]) || (I = m[B]) >= "A" && I <= "Z") && (w += m[B].toLowerCase());
        for (var I, j, $; b.has(w); ) {
          if (/\d/g.test(w)) {
            if (w = w.substr(0, w.length - 1) + (w[w.length - 1] + 1), !(w.length > 3))
              continue;
            w = w.substr(0, 3);
          } else if (w.length < 3) {
            w += "2";
            continue;
          }
          let B = 1, L = w;
          for (; b.has(L) && B < 8; )
            j = w, L = (1 & ($ = B) ? j[0].toUpperCase() : j[0].toLowerCase()) + (2 & $ ? j[1].toUpperCase() : j[1].toLowerCase()) + (4 & $ ? j[2].toUpperCase() : j[2].toLowerCase()), ++B;
          if (B < 8)
            w = L;
          else {
            let Q = w.charCodeAt(2) + 1 & 127;
            w = w.substr(0, 2) + String.fromCharCode(Q);
          }
        }
        return w;
      }(h, l), l.add(g.idPrefix)), /^\$/.test(h) || (o[`$${h}_mutations`] = "++rev", g.markedForSync = !0), g.deleted && (g.deleted = !1)) : (g.deleted = !0, g.markedForSync = !1, o[`$${h}_mutations`] = null);
    });
    const d = t.call(this, o, r);
    for (const [h, f] of Object.entries(r))
      if (!((i = f.yProps) === null || i === void 0) && i.length) {
        const g = c[h];
        g && (g.yProps = f.yProps.map((m) => m.prop));
      }
    return d;
  };
}
function wd(t, e, n) {
  return typeof navigator < "u" && navigator.locks ? navigator.locks.request(t.name + "|" + e, () => n()) : n();
}
const Xr = new Dt(!0), Ka = new Dt(!0);
Xr.pipe(lt((t) => t ? Zt(!0) : Zt(!1).pipe(Nu(2e4))), Mu()).subscribe(Ka);
const _d = typeof document < "u" ? Kt(document, "visibilitychange") : Zt({}), vv = _d.pipe(Ct(() => document.visibilityState === "hidden")), bv = _d.pipe(Ct(() => document.visibilityState === "visible")), kd = typeof window < "u" ? Bs(bv, Kt(window, "mousedown"), Kt(window, "mousemove"), Kt(window, "keydown"), Kt(window, "wheel"), Kt(window, "touchmove")) : Zt({});
typeof document < "u" && Bs(Zt(!0), vv, kd).pipe(_t(() => document.visibilityState === "visible"), ya((t) => {
  Xr.value !== t && Xr.next(t);
}), lt((t) => t ? Zt(0).pipe(Nu(16e4), ya(() => Xr.next(!1))) : Zt(0))).subscribe(() => {
});
class wv extends Error {
  constructor() {
    super(...arguments), this.name = "TokenExpiredError";
  }
}
const Sd = /* @__PURE__ */ new WeakMap(), Wl = /* @__PURE__ */ new WeakMap();
function Ed(t) {
  let e = Wl.get(t);
  return e || (e = new $n(), Wl.set(t, e)), e;
}
class _v extends Ye {
  constructor(e, n, r, i, o, c, l, d) {
    super((h) => new Sv(e, n, r, i, o, d, h, c, l));
  }
}
let kv = 0;
class Sv extends gr {
  constructor(e, n, r, i, o, c, l, d, h) {
    super(() => this.teardown()), this.id = ++kv, this.subscriptions = /* @__PURE__ */ new Set(), this.reconnecting = !1, this.db = e, this.databaseUrl = e.cloud.options.databaseUrl, this.rev = n, this.yrev = r, this.realmSetHash = i, this.clientIdentity = o, this.user = c, this.subscriber = l, this.lastUserActivity = /* @__PURE__ */ new Date(), this.messageProducer = d, this.webSocketStatus = h, this.connect();
  }
  teardown() {
    this.disconnect();
  }
  disconnect() {
    if (this.webSocketStatus.next("disconnected"), this.pinger && (clearInterval(this.pinger), this.pinger = null), this.ws)
      try {
        this.ws.close();
      } catch {
      }
    this.ws = null;
    for (const e of this.subscriptions)
      e.unsubscribe();
    this.subscriptions.clear();
  }
  reconnect() {
    if (!this.reconnecting) {
      this.reconnecting = !0;
      try {
        this.disconnect();
      } catch {
      }
      this.connect().catch(() => {
      }).then(() => this.reconnecting = !1);
    }
  }
  connect() {
    return ee(this, void 0, void 0, function* () {
      if (this.lastServerActivity = /* @__PURE__ */ new Date(), this.pauseUntil && this.pauseUntil > /* @__PURE__ */ new Date())
        return;
      if (this.ws)
        throw new Error("Called connect() when a connection is already open");
      if (!this.databaseUrl)
        throw new Error("Cannot connect without a database URL");
      if (this.closed)
        return;
      const e = this.user.accessTokenExpiration;
      if (e && e < /* @__PURE__ */ new Date())
        return void this.subscriber.error(new wv());
      this.webSocketStatus.next("connecting"), this.pinger = setInterval(() => ee(this, void 0, void 0, function* () {
        if (this.closed)
          this.teardown();
        else if (this.ws)
          try {
            this.ws.send(JSON.stringify({ type: "ping" })), setTimeout(() => {
              this.pinger && (this.closed ? this.teardown() : this.lastServerActivity < new Date(Date.now() - 2e4) && this.reconnect());
            }, 2e4);
          } catch {
            this.reconnect();
          }
        else
          this.reconnect();
      }), 3e4);
      const n = new URL(this.databaseUrl);
      n.protocol = n.protocol === "http:" ? "ws" : "wss";
      const r = new URLSearchParams();
      if (this.subscriber.closed)
        return;
      r.set("v", "2"), this.rev && r.set("rev", this.rev), this.yrev && r.set("yrev", this.yrev), r.set("realmsHash", this.realmSetHash), r.set("clientId", this.clientIdentity), r.set("dxcv", this.db.cloud.version), this.user.accessToken && r.set("token", this.user.accessToken);
      const i = this.ws = new WebSocket(`${n}/changes?${r}`);
      i.binaryType = "arraybuffer", i.onclose = (o) => {
        this.pinger && this.reconnect();
      }, i.onmessage = (o) => {
        if (this.pinger) {
          this.lastServerActivity = /* @__PURE__ */ new Date();
          try {
            const c = typeof o.data == "string" ? hi.parse(o.data) : function(l) {
              const d = new Hu(l), h = Bt(d);
              if (h === "outdated-server-rev")
                return { type: h };
              if (h === "y-complete-sync-done")
                return { type: h, yServerRev: Bt(d) };
              const f = Bt(d), g = Bt(d);
              switch (h) {
                case "u-ack":
                case "u-reject":
                  return { type: h, table: f, prop: g, i: Number(ll(d)) };
                default: {
                  const m = ir(d);
                  switch (h) {
                    case "in-sync":
                    case "doc-close":
                      return { type: h, table: f, prop: g, k: m };
                    case "aware":
                      return { type: h, table: f, prop: g, k: m, u: Nn(d) };
                    case "doc-open":
                      return { type: h, table: f, prop: g, k: m, serverRev: ir(d), sv: ir(d) };
                    case "sv":
                      return { type: h, table: f, prop: g, k: m, sv: Nn(d) };
                    case "u-c":
                      return { type: h, table: f, prop: g, k: m, u: Nn(d), i: Number(ll(d)) };
                    case "u-s":
                      return { type: h, table: f, prop: g, k: m, u: Nn(d), r: d.pos < d.arr.length && Bt(d) || void 0 };
                    default:
                      throw new TypeError(`Unknown message type: ${h}`);
                  }
                }
              }
            }(new Uint8Array(o.data));
            if (c.type === "error")
              throw new Error(`Error message from dexie-cloud: ${c.error}`);
            if (c.type === "aware") {
              const l = ut.getDocCache(this.db.dx).find(c.table, c.k, c.prop);
              if (l) {
                const d = ((h) => Sd.get(h))(l);
                d && Sm(d, c.u, "server");
              }
            } else if (c.type !== "pong")
              if (c.type === "doc-open") {
                const l = ut.getDocCache(this.db.dx).find(c.table, c.k, c.prop);
                l && Ed(l).next();
              } else
                c.type === "u-ack" || c.type === "u-reject" || c.type === "u-s" || c.type === "in-sync" || c.type === "outdated-server-rev" || c.type === "y-complete-sync-done" ? fd([c], this.db).then((l) => ee(this, [l], void 0, function* ({ resyncNeeded: d, yServerRevision: h, receivedUntils: f }) {
                  if (h && (yield this.db.$syncState.update("syncState", { yServerRevision: h })), c.type === "u-s" && f) {
                    const g = Jr(this.db, c.table, c.prop);
                    if (g) {
                      const m = f[g.name];
                      m && (yield g.update(bn, { receivedUntil: m }));
                    }
                  }
                  d && (yield this.db.cloud.sync({ purpose: "pull", wait: !0 }));
                })) : this.subscriber.next(c);
          } catch (c) {
            this.subscriber.error(c);
          }
        }
      };
      try {
        let o = !1;
        yield new Promise((c, l) => {
          i.onopen = (d) => {
            o = !0, c(null);
          }, i.onerror = (d) => {
            if (o)
              this.reconnect();
            else {
              const h = d.error || new Error("WebSocket Error");
              this.subscriber.error(h), this.webSocketStatus.next("error"), l(h);
            }
          };
        }), this.subscriptions.add(this.messageProducer.subscribe((c) => {
          var l, d;
          this.closed || (c.type === "ready" && this.webSocketStatus.value !== "connected" && this.webSocketStatus.next("connected"), c.type === "ready" ? (this.rev = c.rev, (l = this.ws) === null || l === void 0 || l.send(hi.stringify(c))) : (d = this.ws) === null || d === void 0 || d.send(function(h) {
            const f = new Op();
            switch (jn(f, h.type), "table" in h && jn(f, h.table), "prop" in h && jn(f, h.prop), h.type) {
              case "u-ack":
              case "u-reject":
                al(f, BigInt(h.i));
                break;
              case "outdated-server-rev":
                break;
              case "y-complete-sync-done":
                jn(f, h.yServerRev);
                break;
              default:
                switch (Wr(f, h.k), h.type) {
                  case "aware":
                    nr(f, h.u);
                    break;
                  case "doc-open":
                    Wr(f, h.serverRev), Wr(f, h.sv);
                    break;
                  case "doc-close":
                    break;
                  case "sv":
                    nr(f, h.sv);
                    break;
                  case "u-c":
                    nr(f, h.u), al(f, BigInt(h.i));
                    break;
                  case "u-s":
                    nr(f, h.u), jn(f, h.r || "");
                }
            }
            return Dp(f);
          }(c)));
        })), this.user.isLoggedIn && !pi(this.db) && this.subscriptions.add(function(c) {
          const l = lc(c.tables.filter((d) => {
            var h, f;
            return ((f = (h = c.cloud.schema) === null || h === void 0 ? void 0 : h[d.name]) === null || f === void 0 ? void 0 : f.markedForSync) && d.schema.yProps;
          }).map((d) => d.schema.yProps.map((h) => ({ table: d.name, ydocProp: h.prop, updatesTable: h.updatesTable }))));
          return Bs(...l.map(({ table: d, ydocProp: h, updatesTable: f }) => {
            const g = c.table(f);
            return kt(g.get(bn)).pipe(lt((m) => {
              let b = (m == null ? void 0 : m.unsentFrom) || 1;
              return kt(vn(() => ee(this, void 0, void 0, function* () {
                return (yield ud(g, b)).filter((w) => w.f && 1 & w.f).map((w) => ({ type: "u-c", table: d, prop: h, k: w.k, u: w.u, i: w.i }));
              }))).pipe(ya((w) => {
                w.length > 0 && (b = w.at(-1).i + 1);
              }));
            }));
          })).pipe(gi((d) => d));
        }(this.db).subscribe(this.db.messageProducer));
      } catch {
        this.pauseUntil = new Date(Date.now() + 6e4);
      }
    });
  }
}
class Ev extends Error {
  constructor(e) {
    super(e === "expired" ? "License expired" : e === "deactivated" ? "User deactivated" : "Invalid license"), this.name = "InvalidLicenseError", e && (this.license = e);
  }
}
function xv(t) {
  return ee(this, void 0, void 0, function* () {
    var e;
    yield (e = 3e3, new Promise((n) => setTimeout(n, e))), yield Ln(kd);
  });
}
function Hl(t) {
  return ee(this, void 0, void 0, function* () {
    var e;
    return !(!(!((e = t.cloud.options) === null || e === void 0) && e.databaseUrl) || !t.cloud.schema) && (yield Qs(t, t.cloud.options, t.cloud.schema, { justCheckIfNeeded: !0 }));
  });
}
const rs = /* @__PURE__ */ new WeakMap();
function dc(t, e, n, r) {
  const i = rs.get(t);
  if (i) {
    if (i.pull || (r == null ? void 0 : r.purpose) === "push")
      return i.promise;
    {
      let c = !1;
      const l = t.cloud.syncState.subscribe((d) => {
        d.phase === "pulling" && (c = !0);
      });
      return i.promise.then(() => {
        l.unsubscribe();
      }).catch((d) => (l.unsubscribe(), Promise.reject(d))).then(() => {
        if (!c)
          return dc(t, e, n, r);
      });
    }
  }
  const o = function() {
    return ee(this, void 0, void 0, function* () {
      try {
        yield ad(t), yield wd(t, dd, () => Qs(t, e, n, r)), rs.delete(t);
      } catch (c) {
        throw rs.delete(t), c;
      }
    });
  }();
  return rs.set(t, { promise: o, pull: (r == null ? void 0 : r.purpose) !== "push" }), o;
}
const Cv = 1e3;
function Iv(t, e, n) {
  let r = null, i = { cancelled: !1 }, o = 0, c = 0;
  function l(b = 1) {
    setTimeout(() => {
      const w = d ? "pull" : "push";
      c = Date.now(), dc(t, e, n, { cancelToken: i, retryImmediatelyOnFetchError: !0, purpose: w }).then(() => {
        if (i.cancelled)
          m();
        else if (d || h)
          return d = !1, h = !1, l();
        f = !1, o = 0, c = 0;
      }).catch((I) => {
        if (i.cancelled)
          m(), f = !1, o = 0, c = 0;
        else if (b < 5) {
          const j = [0, 20, 40, 300, 900][b] * Cv;
          o = Date.now() + j, c = 0, setTimeout(() => l(b + 1), j);
        } else
          f = !1, o = 0, c = 0;
      });
    }, 0);
  }
  let d = !1, h = !1, f = !1;
  const g = (b) => {
    i.cancelled || (b === "pull" && (d = !0), b === "push" && (h = !0), f ? o || c > 0 && Date.now() : (f = !0, l()));
  }, m = () => {
    i.cancelled = !0, r && r.unsubscribe();
  };
  return { start: () => {
    r = t.localSyncEvent.subscribe(({ purpose: b }) => {
      g(b || "pull");
    });
  }, stop: m };
}
function ia(t, e) {
  if (t && e && e.unsyncedTables)
    for (const n of e.unsyncedTables)
      t[n] && (t[n].markedForSync = !1);
}
var Zs, ve, xd, Qr, zl, Us = {}, Cd = [], Ov = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
function gn(t, e) {
  for (var n in e)
    t[n] = e[n];
  return t;
}
function Id(t) {
  var e = t.parentNode;
  e && e.removeChild(t);
}
function We(t, e, n) {
  var r, i, o, c = {};
  for (o in e)
    o == "key" ? r = e[o] : o == "ref" ? i = e[o] : c[o] = e[o];
  if (arguments.length > 2 && (c.children = arguments.length > 3 ? Zs.call(arguments, 2) : n), typeof t == "function" && t.defaultProps != null)
    for (o in t.defaultProps)
      c[o] === void 0 && (c[o] = t.defaultProps[o]);
  return hs(t, c, r, i, null);
}
function hs(t, e, n, r, i) {
  var o = { type: t, props: e, key: n, ref: r, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: i ?? ++xd };
  return i == null && ve.vnode != null && ve.vnode(o), o;
}
function pr(t) {
  return t.children;
}
function Zr(t, e) {
  this.props = t, this.context = e;
}
function yr(t, e) {
  if (e == null)
    return t.__ ? yr(t.__, t.__.__k.indexOf(t) + 1) : null;
  for (var n; e < t.__k.length; e++)
    if ((n = t.__k[e]) != null && n.__e != null)
      return n.__e;
  return typeof t.type == "function" ? yr(t) : null;
}
function Od(t) {
  var e, n;
  if ((t = t.__) != null && t.__c != null) {
    for (t.__e = t.__c.base = null, e = 0; e < t.__k.length; e++)
      if ((n = t.__k[e]) != null && n.__e != null) {
        t.__e = t.__c.base = n.__e;
        break;
      }
    return Od(t);
  }
}
function Yl(t) {
  (!t.__d && (t.__d = !0) && Qr.push(t) && !js.__r++ || zl !== ve.debounceRendering) && ((zl = ve.debounceRendering) || setTimeout)(js);
}
function js() {
  for (var t; js.__r = Qr.length; )
    t = Qr.sort(function(e, n) {
      return e.__v.__b - n.__v.__b;
    }), Qr = [], t.some(function(e) {
      var n, r, i, o, c, l;
      e.__d && (c = (o = (n = e).__v).__e, (l = n.__P) && (r = [], (i = gn({}, o)).__v = o.__v + 1, hc(l, o, i, n.__n, l.ownerSVGElement !== void 0, o.__h != null ? [c] : null, r, c ?? yr(o), o.__h), Rd(r, o), o.__e != c && Od(o)));
    });
}
function Ad(t, e, n, r, i, o, c, l, d, h) {
  var f, g, m, b, w, I, j, $ = r && r.__k || Cd, B = $.length;
  for (n.__k = [], f = 0; f < e.length; f++)
    if ((b = n.__k[f] = (b = e[f]) == null || typeof b == "boolean" ? null : typeof b == "string" || typeof b == "number" || typeof b == "bigint" ? hs(null, b, null, null, b) : Array.isArray(b) ? hs(pr, { children: b }, null, null, null) : b.__b > 0 ? hs(b.type, b.props, b.key, null, b.__v) : b) != null) {
      if (b.__ = n, b.__b = n.__b + 1, (m = $[f]) === null || m && b.key == m.key && b.type === m.type)
        $[f] = void 0;
      else
        for (g = 0; g < B; g++) {
          if ((m = $[g]) && b.key == m.key && b.type === m.type) {
            $[g] = void 0;
            break;
          }
          m = null;
        }
      hc(t, b, m = m || Us, i, o, c, l, d, h), w = b.__e, (g = b.ref) && m.ref != g && (j || (j = []), m.ref && j.push(m.ref, null, b), j.push(g, b.__c || w, b)), w != null ? (I == null && (I = w), typeof b.type == "function" && b.__k === m.__k ? b.__d = d = Dd(b, d, t) : d = Td(t, b, m, $, w, d), typeof n.type == "function" && (n.__d = d)) : d && m.__e == d && d.parentNode != t && (d = yr(m));
    }
  for (n.__e = I, f = B; f--; )
    $[f] != null && (typeof n.type == "function" && $[f].__e != null && $[f].__e == n.__d && (n.__d = yr(r, f + 1)), Ud($[f], $[f]));
  if (j)
    for (f = 0; f < j.length; f++)
      Pd(j[f], j[++f], j[++f]);
}
function Dd(t, e, n) {
  for (var r, i = t.__k, o = 0; i && o < i.length; o++)
    (r = i[o]) && (r.__ = t, e = typeof r.type == "function" ? Dd(r, e, n) : Td(n, r, r, i, r.__e, e));
  return e;
}
function Td(t, e, n, r, i, o) {
  var c, l, d;
  if (e.__d !== void 0)
    c = e.__d, e.__d = void 0;
  else if (n == null || i != o || i.parentNode == null)
    e:
      if (o == null || o.parentNode !== t)
        t.appendChild(i), c = null;
      else {
        for (l = o, d = 0; (l = l.nextSibling) && d < r.length; d += 2)
          if (l == i)
            break e;
        t.insertBefore(i, o), c = o;
      }
  return c !== void 0 ? c : i.nextSibling;
}
function Gl(t, e, n) {
  e[0] === "-" ? t.setProperty(e, n) : t[e] = n == null ? "" : typeof n != "number" || Ov.test(e) ? n : n + "px";
}
function is(t, e, n, r, i) {
  var o;
  e:
    if (e === "style")
      if (typeof n == "string")
        t.style.cssText = n;
      else {
        if (typeof r == "string" && (t.style.cssText = r = ""), r)
          for (e in r)
            n && e in n || Gl(t.style, e, "");
        if (n)
          for (e in n)
            r && n[e] === r[e] || Gl(t.style, e, n[e]);
      }
    else if (e[0] === "o" && e[1] === "n")
      o = e !== (e = e.replace(/Capture$/, "")), e = e.toLowerCase() in t ? e.toLowerCase().slice(2) : e.slice(2), t.l || (t.l = {}), t.l[e + o] = n, n ? r || t.addEventListener(e, o ? Xl : Jl, o) : t.removeEventListener(e, o ? Xl : Jl, o);
    else if (e !== "dangerouslySetInnerHTML") {
      if (i)
        e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if (e !== "href" && e !== "list" && e !== "form" && e !== "tabIndex" && e !== "download" && e in t)
        try {
          t[e] = n ?? "";
          break e;
        } catch {
        }
      typeof n == "function" || (n != null && (n !== !1 || e[0] === "a" && e[1] === "r") ? t.setAttribute(e, n) : t.removeAttribute(e));
    }
}
function Jl(t) {
  this.l[t.type + !1](ve.event ? ve.event(t) : t);
}
function Xl(t) {
  this.l[t.type + !0](ve.event ? ve.event(t) : t);
}
function hc(t, e, n, r, i, o, c, l, d) {
  var h, f, g, m, b, w, I, j, $, B, L, Q, se, te = e.type;
  if (e.constructor !== void 0)
    return null;
  n.__h != null && (d = n.__h, l = e.__e = n.__e, e.__h = null, o = [l]), (h = ve.__b) && h(e);
  try {
    e:
      if (typeof te == "function") {
        if (j = e.props, $ = (h = te.contextType) && r[h.__c], B = h ? $ ? $.props.value : h.__ : r, n.__c ? I = (f = e.__c = n.__c).__ = f.__E : ("prototype" in te && te.prototype.render ? e.__c = f = new te(j, B) : (e.__c = f = new Zr(j, B), f.constructor = te, f.render = Dv), $ && $.sub(f), f.props = j, f.state || (f.state = {}), f.context = B, f.__n = r, g = f.__d = !0, f.__h = []), f.__s == null && (f.__s = f.state), te.getDerivedStateFromProps != null && (f.__s == f.state && (f.__s = gn({}, f.__s)), gn(f.__s, te.getDerivedStateFromProps(j, f.__s))), m = f.props, b = f.state, g)
          te.getDerivedStateFromProps == null && f.componentWillMount != null && f.componentWillMount(), f.componentDidMount != null && f.__h.push(f.componentDidMount);
        else {
          if (te.getDerivedStateFromProps == null && j !== m && f.componentWillReceiveProps != null && f.componentWillReceiveProps(j, B), !f.__e && f.shouldComponentUpdate != null && f.shouldComponentUpdate(j, f.__s, B) === !1 || e.__v === n.__v) {
            f.props = j, f.state = f.__s, e.__v !== n.__v && (f.__d = !1), f.__v = e, e.__e = n.__e, e.__k = n.__k, e.__k.forEach(function(oe) {
              oe && (oe.__ = e);
            }), f.__h.length && c.push(f);
            break e;
          }
          f.componentWillUpdate != null && f.componentWillUpdate(j, f.__s, B), f.componentDidUpdate != null && f.__h.push(function() {
            f.componentDidUpdate(m, b, w);
          });
        }
        if (f.context = B, f.props = j, f.__v = e, f.__P = t, L = ve.__r, Q = 0, "prototype" in te && te.prototype.render)
          f.state = f.__s, f.__d = !1, L && L(e), h = f.render(f.props, f.state, f.context);
        else
          do
            f.__d = !1, L && L(e), h = f.render(f.props, f.state, f.context), f.state = f.__s;
          while (f.__d && ++Q < 25);
        f.state = f.__s, f.getChildContext != null && (r = gn(gn({}, r), f.getChildContext())), g || f.getSnapshotBeforeUpdate == null || (w = f.getSnapshotBeforeUpdate(m, b)), se = h != null && h.type === pr && h.key == null ? h.props.children : h, Ad(t, Array.isArray(se) ? se : [se], e, n, r, i, o, c, l, d), f.base = e.__e, e.__h = null, f.__h.length && c.push(f), I && (f.__E = f.__ = null), f.__e = !1;
      } else
        o == null && e.__v === n.__v ? (e.__k = n.__k, e.__e = n.__e) : e.__e = Av(n.__e, e, n, r, i, o, c, d);
    (h = ve.diffed) && h(e);
  } catch (oe) {
    e.__v = null, (d || o != null) && (e.__e = l, e.__h = !!d, o[o.indexOf(l)] = null), ve.__e(oe, e, n);
  }
}
function Rd(t, e) {
  ve.__c && ve.__c(e, t), t.some(function(n) {
    try {
      t = n.__h, n.__h = [], t.some(function(r) {
        r.call(n);
      });
    } catch (r) {
      ve.__e(r, n.__v);
    }
  });
}
function Av(t, e, n, r, i, o, c, l) {
  var d, h, f, g = n.props, m = e.props, b = e.type, w = 0;
  if (b === "svg" && (i = !0), o != null) {
    for (; w < o.length; w++)
      if ((d = o[w]) && "setAttribute" in d == !!b && (b ? d.localName === b : d.nodeType === 3)) {
        t = d, o[w] = null;
        break;
      }
  }
  if (t == null) {
    if (b === null)
      return document.createTextNode(m);
    t = i ? document.createElementNS("http://www.w3.org/2000/svg", b) : document.createElement(b, m.is && m), o = null, l = !1;
  }
  if (b === null)
    g === m || l && t.data === m || (t.data = m);
  else {
    if (o = o && Zs.call(t.childNodes), h = (g = n.props || Us).dangerouslySetInnerHTML, f = m.dangerouslySetInnerHTML, !l) {
      if (o != null)
        for (g = {}, w = 0; w < t.attributes.length; w++)
          g[t.attributes[w].name] = t.attributes[w].value;
      (f || h) && (f && (h && f.__html == h.__html || f.__html === t.innerHTML) || (t.innerHTML = f && f.__html || ""));
    }
    if (function(I, j, $, B, L) {
      var Q;
      for (Q in $)
        Q === "children" || Q === "key" || Q in j || is(I, Q, null, $[Q], B);
      for (Q in j)
        L && typeof j[Q] != "function" || Q === "children" || Q === "key" || Q === "value" || Q === "checked" || $[Q] === j[Q] || is(I, Q, j[Q], $[Q], B);
    }(t, m, g, i, l), f)
      e.__k = [];
    else if (w = e.props.children, Ad(t, Array.isArray(w) ? w : [w], e, n, r, i && b !== "foreignObject", o, c, o ? o[0] : n.__k && yr(n, 0), l), o != null)
      for (w = o.length; w--; )
        o[w] != null && Id(o[w]);
    l || ("value" in m && (w = m.value) !== void 0 && (w !== t.value || b === "progress" && !w || b === "option" && w !== g.value) && is(t, "value", w, g.value, !1), "checked" in m && (w = m.checked) !== void 0 && w !== t.checked && is(t, "checked", w, g.checked, !1));
  }
  return t;
}
function Pd(t, e, n) {
  try {
    typeof t == "function" ? t(e) : t.current = e;
  } catch (r) {
    ve.__e(r, n);
  }
}
function Ud(t, e, n) {
  var r, i;
  if (ve.unmount && ve.unmount(t), (r = t.ref) && (r.current && r.current !== t.__e || Pd(r, null, e)), (r = t.__c) != null) {
    if (r.componentWillUnmount)
      try {
        r.componentWillUnmount();
      } catch (o) {
        ve.__e(o, e);
      }
    r.base = r.__P = null;
  }
  if (r = t.__k)
    for (i = 0; i < r.length; i++)
      r[i] && Ud(r[i], e, typeof t.type != "function");
  n || t.__e == null || Id(t.__e), t.__e = t.__d = void 0;
}
function Dv(t, e, n) {
  return this.constructor(t, n);
}
function Ql(t, e, n) {
  var r, i, o;
  ve.__ && ve.__(t, e), i = (r = typeof n == "function") ? null : n && n.__k || e.__k, o = [], hc(e, t = (!r && n || e).__k = We(pr, null, [t]), i || Us, Us, e.ownerSVGElement !== void 0, !r && n ? [n] : i ? null : e.firstChild ? Zs.call(e.childNodes) : null, o, !r && n ? n : i ? i.__e : e.firstChild, r), Rd(o, t);
}
Zs = Cd.slice, ve = { __e: function(t, e, n, r) {
  for (var i, o, c; e = e.__; )
    if ((i = e.__c) && !i.__)
      try {
        if ((o = i.constructor) && o.getDerivedStateFromError != null && (i.setState(o.getDerivedStateFromError(t)), c = i.__d), i.componentDidCatch != null && (i.componentDidCatch(t, r || {}), c = i.__d), c)
          return i.__E = i;
      } catch (l) {
        t = l;
      }
  throw t;
} }, xd = 0, Zr.prototype.setState = function(t, e) {
  var n;
  n = this.__s != null && this.__s !== this.state ? this.__s : this.__s = gn({}, this.state), typeof t == "function" && (t = t(gn({}, n), this.props)), t && gn(n, t), t != null && this.__v && (e && this.__h.push(e), Yl(this));
}, Zr.prototype.forceUpdate = function(t) {
  this.__v && (this.__e = !0, t && this.__h.push(t), Yl(this));
}, Zr.prototype.render = pr, Qr = [], js.__r = 0;
const Mt = { Error: { color: "red" }, Alert: { error: { color: "red", fontWeight: "bold" }, warning: { color: "#f80", fontWeight: "bold" }, info: { color: "black" } }, Darken: { position: "fixed", top: 0, left: 0, opacity: 0.5, backgroundColor: "#000", width: "100vw", height: "100vh", zIndex: 150, webkitBackdropFilter: "blur(2px)", backdropFilter: "blur(2px)" }, DialogOuter: { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 150, alignItems: "center", display: "flex", justifyContent: "center" }, DialogInner: { position: "relative", color: "#222", backgroundColor: "#fff", padding: "30px", marginBottom: "2em", maxWidth: "90%", maxHeight: "90%", overflowY: "auto", border: "3px solid #3d3d5d", borderRadius: "8px", boxShadow: "0 0 80px 10px #666", width: "auto", fontFamily: "sans-serif" }, Input: { height: "35px", width: "17em", borderColor: "#ccf4", outline: "none", fontSize: "17pt", padding: "8px" } };
function Tv({ children: t, className: e }) {
  return We("div", { className: e }, We("div", { style: Mt.Darken }), We("div", { style: Mt.DialogOuter }, We("div", { style: Mt.DialogInner }, t)));
}
var eo, He, sa, Zl, Ls = 0, jd = [], ps = [], eu = ve.__b, tu = ve.__r, nu = ve.diffed, ru = ve.__c, iu = ve.unmount;
function pc(t, e) {
  ve.__h && ve.__h(He, t, Ls || e), Ls = 0;
  var n = He.__H || (He.__H = { __: [], __h: [] });
  return t >= n.__.length && n.__.push({ __V: ps }), n.__[t];
}
function Rv(t) {
  return Ls = 1, function(e, n, r) {
    var i = pc(eo++, 2);
    if (i.t = e, !i.__c && (i.__ = [r ? r(n) : ou(void 0, n), function(c) {
      var l = i.__N ? i.__N[0] : i.__[0], d = i.t(l, c);
      l !== d && (i.__N = [d, i.__[1]], i.__c.setState({}));
    }], i.__c = He, !He.u)) {
      He.u = !0;
      var o = He.shouldComponentUpdate;
      He.shouldComponentUpdate = function(c, l, d) {
        if (!i.__c.__H)
          return !0;
        var h = i.__c.__H.__.filter(function(g) {
          return g.__c;
        });
        if (h.every(function(g) {
          return !g.__N;
        }))
          return !o || o.call(this, c, l, d);
        var f = !1;
        return h.forEach(function(g) {
          if (g.__N) {
            var m = g.__[0];
            g.__ = g.__N, g.__N = void 0, m !== g.__[0] && (f = !0);
          }
        }), !!f && (!o || o.call(this, c, l, d));
      };
    }
    return i.__N || i.__;
  }(ou, t);
}
function Pv(t) {
  return Ls = 5, function(e, n) {
    var r = pc(eo++, 7);
    return Ld(r.__H, n) ? (r.__V = e(), r.i = n, r.__h = e, r.__V) : r.__;
  }(function() {
    return { current: t };
  }, []);
}
function Uv() {
  for (var t; t = jd.shift(); )
    if (t.__P && t.__H)
      try {
        t.__H.__h.forEach(ys), t.__H.__h.forEach(Ba), t.__H.__h = [];
      } catch (e) {
        t.__H.__h = [], ve.__e(e, t.__v);
      }
}
ve.__b = function(t) {
  He = null, eu && eu(t);
}, ve.__r = function(t) {
  tu && tu(t), eo = 0;
  var e = (He = t.__c).__H;
  e && (sa === He ? (e.__h = [], He.__h = [], e.__.forEach(function(n) {
    n.__N && (n.__ = n.__N), n.__V = ps, n.__N = n.i = void 0;
  })) : (e.__h.forEach(ys), e.__h.forEach(Ba), e.__h = [])), sa = He;
}, ve.diffed = function(t) {
  nu && nu(t);
  var e = t.__c;
  e && e.__H && (e.__H.__h.length && (jd.push(e) !== 1 && Zl === ve.requestAnimationFrame || ((Zl = ve.requestAnimationFrame) || function(n) {
    var r, i = function() {
      clearTimeout(o), su && cancelAnimationFrame(r), setTimeout(n);
    }, o = setTimeout(i, 100);
    su && (r = requestAnimationFrame(i));
  })(Uv)), e.__H.__.forEach(function(n) {
    n.i && (n.__H = n.i), n.__V !== ps && (n.__ = n.__V), n.i = void 0, n.__V = ps;
  })), sa = He = null;
}, ve.__c = function(t, e) {
  e.some(function(n) {
    try {
      n.__h.forEach(ys), n.__h = n.__h.filter(function(r) {
        return !r.__ || Ba(r);
      });
    } catch (r) {
      e.some(function(i) {
        i.__h && (i.__h = []);
      }), e = [], ve.__e(r, n.__v);
    }
  }), ru && ru(t, e);
}, ve.unmount = function(t) {
  iu && iu(t);
  var e, n = t.__c;
  n && n.__H && (n.__H.__.forEach(function(r) {
    try {
      ys(r);
    } catch (i) {
      e = i;
    }
  }), e && ve.__e(e, n.__v));
};
var su = typeof requestAnimationFrame == "function";
function ys(t) {
  var e = He, n = t.__c;
  typeof n == "function" && (t.__c = void 0, n()), He = e;
}
function Ba(t) {
  var e = He;
  t.__c = t.__(), He = e;
}
function Ld(t, e) {
  return !t || t.length !== e.length || e.some(function(n, r) {
    return n !== t[r];
  });
}
function ou(t, e) {
  return typeof e == "function" ? e(t) : e;
}
function jv({ title: t, type: e, alerts: n, fields: r, submitLabel: i, cancelLabel: o, onCancel: c, onSubmit: l }) {
  const [d, h] = Rv({}), f = Pv(null);
  return function(g, m) {
    var b = pc(eo++, 4);
    !ve.__s && Ld(b.__H, m) && (b.__ = g, b.i = m, He.__h.push(b));
  }(() => {
    var g;
    return (g = f.current) === null || g === void 0 ? void 0 : g.focus();
  }, []), We(Tv, { className: "dxc-login-dlg" }, We(pr, null, We("h3", { style: Mt.WindowHeader }, t), n.map((g) => We("p", { style: Mt.Alert[g.type] }, function({ message: m, messageCode: b, messageParams: w }) {
    return m.replace(/\{\w+\}/gi, (I) => w[I.substring(1, I.length - 1)]);
  }(g))), We("form", { onSubmit: (g) => {
    g.preventDefault(), l(d);
  } }, Object.entries(r).map(([g, { type: m, label: b, placeholder: w }], I) => We("label", { style: Mt.Label, key: I }, b ? `${b}: ` : "", We("input", { ref: I === 0 ? f : void 0, type: m, name: g, autoComplete: "on", style: Mt.Input, autoFocus: !0, placeholder: w, value: d[g] || "", onInput: (j) => {
    var $;
    const B = function(Q, se) {
      switch (Q) {
        case "email":
          return se.toLowerCase();
        case "otp":
          return se.toUpperCase();
        default:
          return se;
      }
    }(m, ($ = j.target) === null || $ === void 0 ? void 0 : $.value);
    let L = Object.assign(Object.assign({}, d), { [g]: B });
    h(L), m === "otp" && (B == null ? void 0 : B.trim().length) === 8 && l(L);
  } }))))), We("div", { style: Mt.ButtonsDiv }, We(pr, null, We("button", { type: "submit", style: Mt.Button, onClick: () => l(d) }, i), o && We("button", { style: Mt.Button, onClick: c }, o))));
}
class au extends Zr {
  constructor(e) {
    super(e), this.observer = (n) => this.setState({ userInteraction: n }), this.state = { userInteraction: void 0 };
  }
  componentDidMount() {
    this.subscription = kt(this.props.db.cloud.userInteraction).subscribe(this.observer);
  }
  componentWillUnmount() {
    this.subscription && (this.subscription.unsubscribe(), delete this.subscription);
  }
  render(e, { userInteraction: n }) {
    return n ? We(jv, Object.assign({}, n)) : null;
  }
}
function Si(t) {
  const e = /* @__PURE__ */ new WeakMap();
  return (n) => {
    let r = e.get(n);
    return r || (r = t(n), e.set(n, r)), r;
  };
}
const Ns = Si((t) => new Dt(ht));
function to(t, e) {
  let n = e, r = kt(t).pipe(_t((o) => n = o), vp({ resetOnRefCountZero: () => ju(1e3) }));
  const i = new Ye((o) => {
    let c = !1;
    const l = r.subscribe({ next(d) {
      c = !0, o.next(d);
    }, error(d) {
      o.error(d);
    }, complete() {
      o.complete();
    } });
    return c || l.closed || o.next(n), l;
  });
  return i.getValue = () => n, i;
}
const Nd = Si((t) => to(vn(() => t.roles.where({ realmId: "rlm-public" }).toArray().then((e) => {
  const n = {};
  for (const r of e.slice().sort((i, o) => (i.sortOrder || 0) - (o.sortOrder || 0)))
    n[r.name] = r;
  return n;
})), {})), Md = Si((t) => to(Ns(t._novip).pipe(lt((e) => vn(() => t.transaction("r", "realms", "members", () => Promise.all([t.members.where({ userId: e.userId }).toArray(), t.realms.toArray(), e.userId]).then(([n, r, i]) => ({ selfMembers: n, realms: r, userId: i })))))), { selfMembers: [], realms: [], get userId() {
  return t.cloud.currentUserId;
} }));
function Lv(...t) {
  return t.length === 0 ? {} : t.reduce((n, r) => {
    const i = Object.assign({}, n);
    for (const [o, c] of Object.entries(r))
      if (o in i && i[o]) {
        if (i[o] === "*")
          continue;
        if (c === "*")
          i[o] = "*";
        else if (Array.isArray(c) && Array.isArray(i[o])) {
          const l = i, d = l[o];
          l[o] = [.../* @__PURE__ */ new Set([...d, ...c])];
        } else if (typeof c == "object" && c && typeof i[o] == "object") {
          const l = i[o];
          for (const [d, h] of Object.entries(c))
            l[d] !== "*" && (h === "*" ? l[d] = "*" : Array.isArray(l[d]) && Array.isArray(h) && (l[d] = [.../* @__PURE__ */ new Set([...l[d], ...h])]));
        }
      } else
        i[o] = r[o];
    return i;
  });
}
const Kd = Si((t) => function(e, n) {
  let r;
  const i = e.pipe(_t((o) => r = n(o)));
  return i.getValue = () => r !== void 0 ? r : r = n(e.getValue()), i;
}(to(ti([Md(t._novip), Nd(t._novip)]).pipe(_t(([{ selfMembers: e, realms: n, userId: r }, i]) => ({ selfMembers: e, realms: n, userId: r, globalRoles: i }))), { selfMembers: [], realms: [], userId: ht.userId, globalRoles: {} }), ({ selfMembers: e, realms: n, userId: r, globalRoles: i }) => n.map((c) => {
  const l = e.filter((f) => f.realmId === c.realmId), d = l.map((f) => f.permissions).filter((f) => f), h = lc(l.map((f) => f.roles).filter((f) => f)).map((f) => i[f]).filter((f) => f).map((f) => f.permissions);
  return Object.assign(Object.assign({}, c), { permissions: c.owner === r ? { manage: "*" } : Lv(...d, ...h) });
}).reduce((c, l) => Object.assign(Object.assign({}, c), { [l.realmId]: l }), { [r]: { realmId: r, owner: r, name: r, permissions: { manage: "*" } } })));
class cu {
  constructor(e, n, r) {
    this.permissions = e || {}, this.tableName = n, this.isOwner = r;
  }
  add(...e) {
    var n;
    return this.permissions.manage === "*" || !!(!((n = this.permissions.manage) === null || n === void 0) && n.includes(this.tableName)) || this.permissions.add === "*" || !!e.every((r) => {
      var i;
      return (i = this.permissions.add) === null || i === void 0 ? void 0 : i.includes(r);
    });
  }
  update(...e) {
    var n, r;
    if (this.isOwner || this.permissions.manage === "*" || !((n = this.permissions.manage) === null || n === void 0) && n.includes(this.tableName))
      return !0;
    if (this.permissions.update === "*")
      return e.every((o) => o !== "owner");
    const i = (r = this.permissions.update) === null || r === void 0 ? void 0 : r[this.tableName];
    return i === "*" ? e.every((o) => o !== "owner") : e.every((o) => i == null ? void 0 : i.some((c) => c === o || c === "*" && o !== "owner"));
  }
  delete() {
    var e;
    return !(!this.isOwner && this.permissions.manage !== "*") || !!(!((e = this.permissions.manage) === null || e === void 0) && e.includes(this.tableName));
  }
}
const Nv = Si((t) => {
  const e = Ns(t._novip).pipe(lt((i) => vn(() => t.members.where({ email: i.email || "" }).toArray()))), n = Kd(t._novip), r = Md(t._novip);
  return to(ti([e, r, n]).pipe(_t(([i, o, c]) => {
    const l = (f, g) => Object.assign(Object.assign({}, f), { [g.id]: Object.assign(Object.assign({}, g), { realm: c[g.realmId] }) }), d = i.reduce(l, {}), h = o.selfMembers.reduce(l, d);
    return Object.values(h).filter((f) => !f.accepted).map((f) => Object.assign(Object.assign({}, f), { accept() {
      return ee(this, void 0, void 0, function* () {
        yield t.members.update(f.id, { accepted: /* @__PURE__ */ new Date() });
      });
    }, reject() {
      return ee(this, void 0, void 0, function* () {
        yield t.members.update(f.id, { rejected: /* @__PURE__ */ new Date() });
      });
    } }));
  })), []);
});
function Mv(t) {
  return (e) => {
    var n;
    const r = e.doc;
    if (!r)
      throw new Error("Internal error: DexieYProvider.createYHandler called without a doc. This is unexpected.");
    const { parentTable: i } = r.meta || {};
    if (!(!((n = t.cloud.schema) === null || n === void 0) && n[i].markedForSync))
      return;
    let o;
    Object.defineProperty(e, "awareness", { get: () => o || (o = function(c, l, d) {
      const { parentTable: h, parentId: f, parentProp: g, updatesTable: m } = l.meta, b = new _m(l), w = Ed(l);
      return b.on("update", ({ added: I, updated: j, removed: $ }, B) => {
        const L = I.concat(j).concat($), Q = c.cloud.currentUser.value;
        if (B !== "server" && Q.isLoggedIn && !pi(c)) {
          const se = km(b, L);
          c.messageProducer.next({ type: "aware", table: h, prop: g, k: l.meta.parentId, u: se }), d.destroyed && c.messageProducer.next({ type: "doc-close", table: h, prop: g, k: l.meta.parentId });
        }
      }), b.on("destroy", () => {
        Yf(b, [l.clientID], "provider destroyed");
      }), ee(this, void 0, void 0, function* () {
        if (d.destroyed)
          return;
        let I = !1, j = 1;
        const $ = ti([c.cloud.webSocketStatus, w.pipe(Ku(null))]).subscribe(([L]) => {
          if (d.destroyed)
            return;
          I = L === "connected";
          const Q = c.cloud.currentUser.value;
          L === "connected" && Q.isLoggedIn && !pi(c) && (++j, B().catch((se) => {
          }));
        });
        function B() {
          return ee(this, void 0, void 0, function* () {
            const L = j, Q = c.table(m), se = c.$syncState, [te, oe] = yield c.transaction("r", se, Q, () => ee(this, void 0, void 0, function* () {
              const De = yield Q.get(bn), H = yield se.get("syncState");
              return [(De == null ? void 0 : De.receivedUntil) || 0, (H == null ? void 0 : H.yServerRevision) || (H == null ? void 0 : H.serverRevision)];
            }));
            if (d.destroyed || j !== L || !I)
              return;
            const je = { type: "doc-open", table: h, prop: g, k: f, serverRev: oe }, ye = yield Q.where("i").between(te, 1 / 0, !1).filter((De) => Ks(De.k, f) === 0 && (1 & (De.f || 0)) == 0).toArray();
            if (!d.destroyed && j === L && I) {
              if (ye.length > 0) {
                const De = Cs(ye.map((de) => de.u)), H = Ef(De);
                je.sv = H;
              }
              c.messageProducer.next(je);
            }
          });
        }
        d.addCleanupHandler($);
      }), b;
    }(t, r, e), Sd.set(r, o), o) });
  };
}
const Kv = { nameSuffix: !0 };
function $a(t) {
  const e = t.name, n = Ns(t), r = [];
  let i = !1, o = null;
  t.on("ready", (f) => ee(this, void 0, void 0, function* () {
    try {
      yield function(g) {
        return ee(this, void 0, void 0, function* () {
          var m, b, w, I, j, $, B;
          c = !1;
          const L = Nt(g);
          typeof window < "u" && typeof document < "u" && (!((m = L.cloud.options) === null || m === void 0) && m.customLoginGui || r.push(function(H) {
            let de = !1;
            const me = document.createElement("div");
            return document.body ? (document.body.appendChild(me), Ql(We(au, { db: H.vip }), me)) : addEventListener("DOMContentLoaded", () => {
              de || (document.body.appendChild(me), Ql(We(au, { db: H.vip }), me));
            }), { unsubscribe() {
              try {
                me.remove();
              } catch {
              }
              de = !0;
            }, get closed() {
              return de;
            } };
          }(g))), L.cloud.isServiceWorkerDB || r.push(function(H) {
            let de = H.cloud.webSocketStatus.value;
            const me = H.cloud.webSocketStatus.pipe(lt((we) => {
              const ke = de;
              de = we;
              const z = Zt(we);
              switch (we) {
                case "disconnected":
                  return Xr.value ? z.pipe(sl(500)) : z;
                case "connecting":
                  return ke === "not-started" || ke === "error" ? z : z.pipe(sl(4e3));
                default:
                  return z;
              }
            }));
            return ti([me, H.syncStateChangedEvent.pipe(Ku({ phase: "initial" })), Ns(H.dx._novip), Ka]).pipe(_t(([we, ke, z, ne]) => {
              var re;
              if (!((re = z.license) === null || re === void 0) && re.status && z.license.status !== "ok")
                return { phase: "offline", status: "offline", license: z.license.status };
              let { phase: ge, error: be, progress: ue } = ke, ae = we;
              return ge === "error" && (ae = "error"), we === "not-started" && (ge !== "pushing" && ge !== "pulling" || (ae = "connecting")), H.cloud.syncState.value.phase !== "error" || ke.phase !== "pushing" && ke.phase !== "pulling" || (ae = "connecting"), ne || (ae = "disconnected"), { phase: ge, error: be, progress: ue, status: ar ? ae : "offline", license: "ok" };
            }));
          }(L).subscribe(g.cloud.syncState)), r.push(L.syncCompleteEvent.subscribe(d)), L.tables.every((H) => H.core) || function() {
            throw new xe.SchemaError("Version increment needed to allow dexie-cloud change tracking");
          }();
          const Q = "serviceWorker" in navigator ? yield navigator.serviceWorker.getRegistrations() : [], [se, te] = yield L.transaction("rw", L.$syncState, () => ee(this, void 0, void 0, function* () {
            var H, de;
            const { options: me, schema: we } = L.cloud, [ke, z, ne] = yield Promise.all([L.getOptions(), L.getSchema(), L.getPersistedSyncState()]);
            if (i) {
              if (!ke || JSON.stringify(ke) !== JSON.stringify(me)) {
                if (!me)
                  throw new Error("Internal error");
                const re = Object.assign({}, me);
                delete re.fetchTokens, delete re.awarenessProtocol, yield L.$syncState.put(re, "options");
              }
            } else
              L.cloud.options = ke || null;
            if (!((H = L.cloud.options) === null || H === void 0) && H.tryUseServiceWorker && "serviceWorker" in navigator && Q.length > 0 && !vd ? L.cloud.usingServiceWorker = !0 : (!((de = L.cloud.options) === null || de === void 0) && de.tryUseServiceWorker && L.cloud.isServiceWorkerDB, L.cloud.usingServiceWorker = !1), ia(we, L.cloud.options), ia(z, L.cloud.options), we) {
              if (!z || JSON.stringify(z) !== JSON.stringify(we)) {
                const re = z || {};
                for (const [ge, be] of Object.entries(we)) {
                  const ue = re[ge];
                  ue ? (ue.markedForSync = be.markedForSync, be.deleted = ue.deleted, ue.generatedGlobalId = be.generatedGlobalId) : re[ge] = Object.assign({}, be);
                }
                yield L.$syncState.put(re, "schema"), Object.assign(we, re);
              }
            } else
              L.cloud.schema = z || null;
            return [ne == null ? void 0 : ne.initiallySynced, ne == null ? void 0 : ne.realms];
          }));
          if (se && L.setInitiallySynced(!0), function(H) {
            var de, me;
            for (const we of H.tables)
              if (!((me = (de = H.cloud.schema) === null || de === void 0 ? void 0 : de[we.name]) === null || me === void 0) && me.markedForSync) {
                if (we.schema.primKey.auto)
                  throw new xe.SchemaError(`Table ${we.name} is both autoIncremented and synced. Use db.cloud.configure({unsyncedTables: [${JSON.stringify(we.name)}]}) to blacklist it from sync`);
                if (!we.schema.primKey.keyPath)
                  throw new xe.SchemaError(`Table ${we.name} cannot be both synced and outbound. Use db.cloud.configure({unsyncedTables: [${JSON.stringify(we.name)}]}) to blacklist it from sync`);
              }
          }(L), l(), !L.cloud.isServiceWorkerDB) {
            r.push(vn(() => L.getCurrentUser()).subscribe(n)), r.push(vn(() => L.getPersistedSyncState()).subscribe(L.cloud.persistedSyncState)), yield Ln(ti([n.pipe(ol(1), Un(1)), L.cloud.persistedSyncState.pipe(ol(1), Un(1))]));
            const H = Mv(L);
            ut.on.new.subscribe(H), L.dx.once("close", () => {
              ut.on.new.unsubscribe(H);
            });
          }
          let oe = !1;
          const je = yield L.getCurrentUser(), ye = (b = L.cloud.options) === null || b === void 0 ? void 0 : b.requireAuth;
          ye && (L.cloud.isServiceWorkerDB ? yield Ln(n.pipe(Ct((H) => !!H.isLoggedIn), Un(1))) : typeof ye == "object" ? (!je.isLoggedIn || ye.userId && je.userId !== ye.userId || ye.email && je.email !== ye.email) && (oe = yield na(L, ye)) : je.isLoggedIn || (oe = yield na(L))), !je.isLoggedIn || te && te.includes(je.userId) || (oe = !0), o && o.stop(), o = null, l();
          const De = ((w = L.cloud.options) === null || w === void 0 ? void 0 : w.databaseUrl) && (!se || oe);
          De && (yield function(H, de, me) {
            return ee(this, void 0, void 0, function* () {
              yield wd(H, dd, () => Qs(H, de, me, { isInitialSync: !0 }));
            });
          }(L, L.cloud.options, L.cloud.schema), L.setInitiallySynced(!0)), l(), L.cloud.usingServiceWorker && (!((I = L.cloud.options) === null || I === void 0) && I.databaseUrl) ? (De || Gf(L, "push").catch(() => {
          }), function(H) {
            return ee(this, void 0, void 0, function* () {
              var de;
              try {
                const { periodicSync: me } = yield navigator.serviceWorker.ready;
                if (me)
                  try {
                    yield me.register(`dexie-cloud:${H.name}`, (de = H.cloud.options) === null || de === void 0 ? void 0 : de.periodicSync);
                  } catch {
                  }
              } catch {
              }
            });
          }(L).catch(() => {
          })) : !((j = L.cloud.options) === null || j === void 0) && j.databaseUrl && L.cloud.schema && !L.cloud.isServiceWorkerDB && (o = Iv(L, L.cloud.options, L.cloud.schema), o.start(), De || Xt(L, "push")), l(), L.cloud.isServiceWorkerDB || r.push(Kt(self, "online").subscribe(() => {
            L.syncStateChangedEvent.next({ phase: "not-in-sync" }), pi(L) || Xt(L, "push");
          }), Kt(self, "offline").subscribe(() => {
            L.syncStateChangedEvent.next({ phase: "offline" });
          })), !(!(($ = L.cloud.options) === null || $ === void 0) && $.databaseUrl) || !((B = L.cloud.options) === null || B === void 0) && B.disableWebSocket || uv || r.push(function(H) {
            var de;
            if (!(!((de = H.cloud.options) === null || de === void 0) && de.databaseUrl))
              throw new Error("No database URL to connect WebSocket to");
            const me = H.messageConsumer.readyToServe.pipe(Ct((ke) => ke), lt(() => H.getPersistedSyncState()), Ct((ke) => ke && ke.serverRevision), lt((ke) => ee(this, void 0, void 0, function* () {
              return { type: "ready", rev: ke.serverRevision, realmSetHash: yield Da(ke) };
            }))), we = Bs(me, H.messageProducer);
            return function ke() {
              return H.cloud.persistedSyncState.pipe(Ct((z) => z == null ? void 0 : z.serverRevision), Un(1), lt((z) => H.cloud.currentUser.pipe(_t((ne) => [ne, z]))), lt(([z, ne]) => Ka.pipe(_t((re) => [re ? z : null, ne]))), lt(([z, ne]) => z != null && z.isLoggedIn && !(ne != null && ne.realms.includes(z.userId)) ? H.cloud.persistedSyncState.pipe(Ct((re) => (re == null ? void 0 : re.realms.includes(z.userId)) || !1), Un(1), _t((re) => [z, re])) : new Dt([z, ne])), lt((z) => ee(this, [z], void 0, function* ([ne, re]) {
                return [ne, yield Da(re)];
              })), Mu(([z, ne], [re, ge]) => z === re && ne === ge), lt(([z, ne]) => {
                var re;
                return !((re = H.cloud.persistedSyncState) === null || re === void 0) && re.value ? z ? new _v(H, H.cloud.persistedSyncState.value.serverRevision, H.cloud.persistedSyncState.value.yServerRevision, ne, H.cloud.persistedSyncState.value.clientIdentity, we, H.cloud.webSocketStatus, z) : kt([]) : ke();
              }), pa((z) => (z == null ? void 0 : z.name) === "TokenExpiredError" ? Zt(!0).pipe(lt(() => ee(this, void 0, void 0, function* () {
                const ne = yield H.getCurrentUser(), re = yield Xs(H.cloud.options.databaseUrl, ne);
                yield H.table("$logins").update(ne.userId, { accessToken: re.accessToken, accessTokenExpiration: re.accessTokenExpiration, claims: re.claims, license: re.license, data: re.data });
              })), lt(() => ke())) : nl(() => z)), pa((z) => (H.cloud.webSocketStatus.next("error"), z instanceof Ev ? nl(() => z) : kt(xv()).pipe(lt(() => ke())))));
            }().subscribe({ next: (ke) => {
              ke && H.messageConsumer.enqueue(ke);
            }, error: (ke) => {
            }, complete: () => {
            } });
          }(L));
        });
      }(f);
    } catch {
    }
  }), !0);
  let c = !1;
  function l() {
    if (c)
      throw new xe.DatabaseClosedError();
  }
  t.once("close", () => {
    r.forEach((f) => f.unsubscribe()), r.splice(0, r.length), c = !0, o && o.stop(), o = null, n.next(ht);
  });
  const d = new $n();
  var h;
  t.cloud = { version: "4.2.0-alpha.7", options: Object.assign({}, Kv), schema: null, get currentUserId() {
    return n.value.userId || ht.userId;
  }, currentUser: n, syncState: new Dt({ phase: "initial", status: "not-started" }), events: { syncComplete: d }, persistedSyncState: new Dt(void 0), userInteraction: new Dt(void 0), webSocketStatus: new Dt("not-started"), login(f) {
    return ee(this, void 0, void 0, function* () {
      const g = Nt(t);
      yield g.cloud.sync(), yield na(g, f);
    });
  }, invites: Nv(t), roles: Nd(t), configure(f) {
    f = t.cloud.options = Object.assign(Object.assign({}, t.cloud.options), f), i = !0, f.databaseUrl && f.nameSuffix && (t.name = `${e}-${function(g) {
      const m = new URL(g);
      return m.pathname === "/" ? m.hostname.split(".")[0] : m.pathname.split("/")[1];
    }(f.databaseUrl)}`, Nt(t).reconfigure()), ia(t.cloud.schema, t.cloud.options);
  }, logout() {
    return ee(this, arguments, void 0, function* ({ force: f } = {}) {
      f ? yield Ma(Nt(t), { deleteUnsyncedData: !0 }) : yield gd(Nt(t));
    });
  }, sync() {
    return ee(this, arguments, void 0, function* ({ wait: f, purpose: g } = { wait: !0, purpose: "push" }) {
      var m;
      f === void 0 && (f = !0);
      const b = Nt(t);
      if ((((m = b.cloud.currentUser.value.license) === null || m === void 0 ? void 0 : m.status) || "ok") !== "ok" && (yield Js(b)), g === "pull") {
        const w = b.cloud.persistedSyncState.value;
        if (Xt(b, g), f) {
          const I = yield Ln(b.cloud.persistedSyncState.pipe(Ct((j) => (j == null ? void 0 : j.timestamp) != null && (!w || j.timestamp > w.timestamp))));
          if (I != null && I.error)
            throw new Error("Sync error: " + I.error);
        }
      } else if (yield Hl(b)) {
        const w = b.cloud.persistedSyncState.value;
        Xt(b, g), f && (yield Ln(kt(vn(() => ee(this, void 0, void 0, function* () {
          const I = yield Hl(b), j = yield b.getPersistedSyncState();
          if ((j == null ? void 0 : j.timestamp) !== (w == null ? void 0 : w.timestamp) && (j != null && j.error))
            throw new Error("Sync error: " + j.error);
          return I;
        }))).pipe(Ct((I) => !I))));
      }
    });
  }, permissions: (f, g) => function(m, b, w) {
    if (!b)
      throw new TypeError("Cannot check permissions of undefined or null. A Dexie Cloud object with realmId and owner expected.");
    const { owner: I, realmId: j } = b;
    if (!w) {
      if (typeof b.table != "function")
        throw new TypeError("Missing 'table' argument to permissions and table could not be extracted from entity");
      w = b.table();
    }
    const $ = Kd(m), B = (Q) => {
      const se = Q[j || m.cloud.currentUserId];
      return se ? new cu(se.permissions, w, j === void 0 || j === m.cloud.currentUserId || I === m.cloud.currentUserId) : new cu({}, w, !I || I === m.cloud.currentUserId);
    }, L = $.pipe(_t(B));
    return L.getValue = () => B($.getValue()), L;
  }(t._novip, f, g) }, t.Version.prototype._parseStoresSpec = xe.override(t.Version.prototype._parseStoresSpec, (f) => mv(f, t)), t.Table.prototype.newId = function({ colocateWith: f } = {}) {
    const g = f && f.substr(f.length - 3);
    return bd(t.cloud.schema[this.name].idPrefix || "", g);
  }, t.Table.prototype.idPrefix = function() {
    var f, g;
    return ((g = (f = this.db.cloud.schema) === null || f === void 0 ? void 0 : f[this.name]) === null || g === void 0 ? void 0 : g.idPrefix) || "";
  }, t.use(gv({ currentUserObservable: t.cloud.currentUser, db: Nt(t) })), t.use((h = Nt(t), { stack: "dbcore", name: "implicitPropSetterMiddleware", level: 1, create: (f) => Object.assign(Object.assign({}, f), { table: (g) => {
    const m = f.table(g);
    return Object.assign(Object.assign({}, m), { mutate: (b) => {
      var w, I, j, $, B, L;
      const Q = b.trans;
      if (Q.disableChangeTracking)
        return m.mutate(b);
      const se = (I = (w = Q.currentUser) === null || w === void 0 ? void 0 : w.userId) !== null && I !== void 0 ? I : ht.userId;
      if (!(($ = (j = h.cloud.schema) === null || j === void 0 ? void 0 : j[g]) === null || $ === void 0) && $.markedForSync && (b.type === "add" || b.type === "put")) {
        if (g === "members")
          for (const te of b.values)
            typeof te.email == "string" && (te.email = te.email.trim().toLowerCase());
        for (const te of b.values) {
          te.owner || (te.owner = se), te.realmId || (te.realmId = se);
          const oe = (L = (B = m.schema.primaryKey).extractKey) === null || L === void 0 ? void 0 : L.call(B, te);
          typeof oe == "string" && oe[0] === "#" && b.type === "put" && (delete b.criteria, delete b.changeSpec, delete b.updates, te.$ts = Date.now());
        }
      }
      return m.mutate(b);
    } });
  } }) })), t.use(hv(Nt(t)));
}
$a.version = "4.2.0-alpha.7", xe.Cloud = $a;
const $r = /* @__PURE__ */ new Map();
function lu(t) {
  return t.startsWith("dexie-cloud:") && t.split(":")[1];
}
const ss = /* @__PURE__ */ new Map();
function oa(t, e) {
  let n = ss.get(t + "/" + e);
  return n || (n = function r(i, o) {
    return ee(this, void 0, void 0, function* () {
      var c;
      let l = $r.get(i);
      if (!l) {
        const h = new xe(i, { addons: [$a] });
        if (l = Nt(h), l.cloud.isServiceWorkerDB = !0, h.on("versionchange", d), yield l.dx.open(), $r.get(i))
          return l.close(), yield r(i, o);
        $r.set(i, l);
      }
      if (!((c = l.cloud.options) === null || c === void 0) && c.databaseUrl && l.cloud.schema)
        try {
          yield dc(l, l.cloud.options, l.cloud.schema, { retryImmediatelyOnFetchError: !0, purpose: o });
        } catch (h) {
          if (d(), h.name !== xe.errnames.NoSuchDatabase)
            throw h;
        }
      function d() {
        return l.dx.on.versionchange.unsubscribe(d), $r.get(l.name) === l && $r.delete(l.name), l.dx.close(), !1;
      }
    });
  }(t, e).then(() => {
    ss.delete(t + "/" + e);
  }).catch((r) => (ss.delete(t + "/" + e), Promise.reject(r))), ss.set(t + "/" + e, n)), n;
}
vd || (self.addEventListener("sync", (t) => {
  const e = lu(t.tag);
  e && t.waitUntil(oa(e, "push"));
}), self.addEventListener("periodicsync", (t) => {
  const e = lu(t.tag);
  e && t.waitUntil(oa(e, "pull"));
}), self.addEventListener("message", (t) => {
  if (t.data.type === "dexie-cloud-sync") {
    const { dbName: e } = t.data, n = (r = 1) => oa(e, t.data.purpose || "pull").catch((i) => ee(void 0, void 0, void 0, function* () {
      if (r === 3)
        throw i;
      var o;
      yield (o = 6e4, new Promise((c) => setTimeout(c, o))), n(r + 1);
    }));
    "waitUntil" in t ? t.waitUntil(n().catch((r) => {
    })) : n().catch((r) => {
    });
  }
}));
try {
  self["workbox:core:7.2.0"] && _();
} catch {
}
const Bv = (t, ...e) => {
  let n = t;
  return e.length > 0 && (n += ` :: ${JSON.stringify(e)}`), n;
}, $v = Bv;
class yt extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(e, n) {
    const r = $v(e, n);
    super(r), this.name = e, this.details = n;
  }
}
const Jt = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, aa = (t) => [Jt.prefix, t, Jt.suffix].filter((e) => e && e.length > 0).join("-"), Fv = (t) => {
  for (const e of Object.keys(Jt))
    t(e);
}, no = {
  updateDetails: (t) => {
    Fv((e) => {
      typeof t[e] == "string" && (Jt[e] = t[e]);
    });
  },
  getGoogleAnalyticsName: (t) => t || aa(Jt.googleAnalytics),
  getPrecacheName: (t) => t || aa(Jt.precache),
  getPrefix: () => Jt.prefix,
  getRuntimeName: (t) => t || aa(Jt.runtime),
  getSuffix: () => Jt.suffix
};
function uu(t, e) {
  const n = e();
  return t.waitUntil(n), n;
}
try {
  self["workbox:precaching:7.2.0"] && _();
} catch {
}
const qv = "__WB_REVISION__";
function Vv(t) {
  if (!t)
    throw new yt("add-to-cache-list-unexpected-type", { entry: t });
  if (typeof t == "string") {
    const o = new URL(t, location.href);
    return {
      cacheKey: o.href,
      url: o.href
    };
  }
  const { revision: e, url: n } = t;
  if (!n)
    throw new yt("add-to-cache-list-unexpected-type", { entry: t });
  if (!e) {
    const o = new URL(n, location.href);
    return {
      cacheKey: o.href,
      url: o.href
    };
  }
  const r = new URL(n, location.href), i = new URL(n, location.href);
  return r.searchParams.set(qv, e), {
    cacheKey: r.href,
    url: i.href
  };
}
class Wv {
  constructor() {
    this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({ request: e, state: n }) => {
      n && (n.originalRequest = e);
    }, this.cachedResponseWillBeUsed = async ({ event: e, state: n, cachedResponse: r }) => {
      if (e.type === "install" && n && n.originalRequest && n.originalRequest instanceof Request) {
        const i = n.originalRequest.url;
        r ? this.notUpdatedURLs.push(i) : this.updatedURLs.push(i);
      }
      return r;
    };
  }
}
class Hv {
  constructor({ precacheController: e }) {
    this.cacheKeyWillBeUsed = async ({ request: n, params: r }) => {
      const i = (r == null ? void 0 : r.cacheKey) || this._precacheController.getCacheKeyForURL(n.url);
      return i ? new Request(i, { headers: n.headers }) : n;
    }, this._precacheController = e;
  }
}
let Fr;
function zv() {
  if (Fr === void 0) {
    const t = new Response("");
    if ("body" in t)
      try {
        new Response(t.body), Fr = !0;
      } catch {
        Fr = !1;
      }
    Fr = !1;
  }
  return Fr;
}
async function Yv(t, e) {
  let n = null;
  if (t.url && (n = new URL(t.url).origin), n !== self.location.origin)
    throw new yt("cross-origin-copy-response", { origin: n });
  const r = t.clone(), i = {
    headers: new Headers(r.headers),
    status: r.status,
    statusText: r.statusText
  }, o = e ? e(i) : i, c = zv() ? r.body : await r.blob();
  return new Response(c, o);
}
const Gv = (t) => new URL(String(t), location.href).href.replace(new RegExp(`^${location.origin}`), "");
function fu(t, e) {
  const n = new URL(t);
  for (const r of e)
    n.searchParams.delete(r);
  return n.href;
}
async function Jv(t, e, n, r) {
  const i = fu(e.url, n);
  if (e.url === i)
    return t.match(e, r);
  const o = Object.assign(Object.assign({}, r), { ignoreSearch: !0 }), c = await t.keys(e, o);
  for (const l of c) {
    const d = fu(l.url, n);
    if (i === d)
      return t.match(l, r);
  }
}
class Xv {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((e, n) => {
      this.resolve = e, this.reject = n;
    });
  }
}
const Qv = /* @__PURE__ */ new Set();
async function Zv() {
  for (const t of Qv)
    await t();
}
function eb(t) {
  return new Promise((e) => setTimeout(e, t));
}
try {
  self["workbox:strategies:7.2.0"] && _();
} catch {
}
function os(t) {
  return typeof t == "string" ? new Request(t) : t;
}
class tb {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(e, n) {
    this._cacheKeys = {}, Object.assign(this, n), this.event = n.event, this._strategy = e, this._handlerDeferred = new Xv(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const r of this._plugins)
      this._pluginStateMap.set(r, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(e) {
    const { event: n } = this;
    let r = os(e);
    if (r.mode === "navigate" && n instanceof FetchEvent && n.preloadResponse) {
      const c = await n.preloadResponse;
      if (c)
        return c;
    }
    const i = this.hasCallback("fetchDidFail") ? r.clone() : null;
    try {
      for (const c of this.iterateCallbacks("requestWillFetch"))
        r = await c({ request: r.clone(), event: n });
    } catch (c) {
      if (c instanceof Error)
        throw new yt("plugin-error-request-will-fetch", {
          thrownErrorMessage: c.message
        });
    }
    const o = r.clone();
    try {
      let c;
      c = await fetch(r, r.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
      for (const l of this.iterateCallbacks("fetchDidSucceed"))
        c = await l({
          event: n,
          request: o,
          response: c
        });
      return c;
    } catch (c) {
      throw i && await this.runCallbacks("fetchDidFail", {
        error: c,
        event: n,
        originalRequest: i.clone(),
        request: o.clone()
      }), c;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(e) {
    const n = await this.fetch(e), r = n.clone();
    return this.waitUntil(this.cachePut(e, r)), n;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillBeUsed()
   * - cachedResponseWillBeUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(e) {
    const n = os(e);
    let r;
    const { cacheName: i, matchOptions: o } = this._strategy, c = await this.getCacheKey(n, "read"), l = Object.assign(Object.assign({}, o), { cacheName: i });
    r = await caches.match(c, l);
    for (const d of this.iterateCallbacks("cachedResponseWillBeUsed"))
      r = await d({
        cacheName: i,
        matchOptions: o,
        cachedResponse: r,
        request: c,
        event: this.event
      }) || void 0;
    return r;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillBeUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(e, n) {
    const r = os(e);
    await eb(0);
    const i = await this.getCacheKey(r, "write");
    if (!n)
      throw new yt("cache-put-with-no-response", {
        url: Gv(i.url)
      });
    const o = await this._ensureResponseSafeToCache(n);
    if (!o)
      return !1;
    const { cacheName: c, matchOptions: l } = this._strategy, d = await self.caches.open(c), h = this.hasCallback("cacheDidUpdate"), f = h ? await Jv(
      // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
      // feature. Consider into ways to only add this behavior if using
      // precaching.
      d,
      i.clone(),
      ["__WB_REVISION__"],
      l
    ) : null;
    try {
      await d.put(i, h ? o.clone() : o);
    } catch (g) {
      if (g instanceof Error)
        throw g.name === "QuotaExceededError" && await Zv(), g;
    }
    for (const g of this.iterateCallbacks("cacheDidUpdate"))
      await g({
        cacheName: c,
        oldResponse: f,
        newResponse: o.clone(),
        request: i,
        event: this.event
      });
    return !0;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(e, n) {
    const r = `${e.url} | ${n}`;
    if (!this._cacheKeys[r]) {
      let i = e;
      for (const o of this.iterateCallbacks("cacheKeyWillBeUsed"))
        i = os(await o({
          mode: n,
          request: i,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params
          // eslint-disable-line
        }));
      this._cacheKeys[r] = i;
    }
    return this._cacheKeys[r];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(e) {
    for (const n of this._strategy.plugins)
      if (e in n)
        return !0;
    return !1;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(e, n) {
    for (const r of this.iterateCallbacks(e))
      await r(n);
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(e) {
    for (const n of this._strategy.plugins)
      if (typeof n[e] == "function") {
        const r = this._pluginStateMap.get(n);
        yield (o) => {
          const c = Object.assign(Object.assign({}, o), { state: r });
          return n[e](c);
        };
      }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread my be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    let e;
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(e) {
    let n = e, r = !1;
    for (const i of this.iterateCallbacks("cacheWillUpdate"))
      if (n = await i({
        request: this.request,
        response: n,
        event: this.event
      }) || void 0, r = !0, !n)
        break;
    return r || n && n.status !== 200 && (n = void 0), n;
  }
}
class nb {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor(e = {}) {
    this.cacheName = no.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(e) {
    const [n] = this.handleAll(e);
    return n;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const n = e.event, r = typeof e.request == "string" ? new Request(e.request) : e.request, i = "params" in e ? e.params : void 0, o = new tb(this, { event: n, request: r, params: i }), c = this._getResponse(o, r, n), l = this._awaitComplete(c, o, r, n);
    return [c, l];
  }
  async _getResponse(e, n, r) {
    await e.runCallbacks("handlerWillStart", { event: r, request: n });
    let i;
    try {
      if (i = await this._handle(n, e), !i || i.type === "error")
        throw new yt("no-response", { url: n.url });
    } catch (o) {
      if (o instanceof Error) {
        for (const c of e.iterateCallbacks("handlerDidError"))
          if (i = await c({ error: o, event: r, request: n }), i)
            break;
      }
      if (!i)
        throw o;
    }
    for (const o of e.iterateCallbacks("handlerWillRespond"))
      i = await o({ event: r, request: n, response: i });
    return i;
  }
  async _awaitComplete(e, n, r, i) {
    let o, c;
    try {
      o = await e;
    } catch {
    }
    try {
      await n.runCallbacks("handlerDidRespond", {
        event: i,
        request: r,
        response: o
      }), await n.doneWaiting();
    } catch (l) {
      l instanceof Error && (c = l);
    }
    if (await n.runCallbacks("handlerDidComplete", {
      event: i,
      request: r,
      response: o,
      error: c
    }), n.destroy(), c)
      throw c;
  }
}
class mn extends nb {
  /**
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
   * of all fetch() requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor(e = {}) {
    e.cacheName = no.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(mn.copyRedirectedCacheableResponsesPlugin);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, n) {
    const r = await n.cacheMatch(e);
    return r || (n.event && n.event.type === "install" ? await this._handleInstall(e, n) : await this._handleFetch(e, n));
  }
  async _handleFetch(e, n) {
    let r;
    const i = n.params || {};
    if (this._fallbackToNetwork) {
      const o = i.integrity, c = e.integrity, l = !c || c === o;
      r = await n.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? c || o : void 0
      })), o && l && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await n.cachePut(e, r.clone()));
    } else
      throw new yt("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    return r;
  }
  async _handleInstall(e, n) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const r = await n.fetch(e);
    if (!await n.cachePut(e, r.clone()))
      throw new yt("bad-precaching-response", {
        url: e.url,
        status: r.status
      });
    return r;
  }
  /**
   * This method is complex, as there a number of things to account for:
   *
   * The `plugins` array can be set at construction, and/or it might be added to
   * to at any time before the strategy is used.
   *
   * At the time the strategy is used (i.e. during an `install` event), there
   * needs to be at least one plugin that implements `cacheWillUpdate` in the
   * array, other than `copyRedirectedCacheableResponsesPlugin`.
   *
   * - If this method is called and there are no suitable `cacheWillUpdate`
   * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
   *
   * - If this method is called and there is exactly one `cacheWillUpdate`, then
   * we don't have to do anything (this might be a previously added
   * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
   *
   * - If this method is called and there is more than one `cacheWillUpdate`,
   * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
   * we need to remove it. (This situation is unlikely, but it could happen if
   * the strategy is used multiple times, the first without a `cacheWillUpdate`,
   * and then later on after manually adding a custom `cacheWillUpdate`.)
   *
   * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
   *
   * @private
   */
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, n = 0;
    for (const [r, i] of this.plugins.entries())
      i !== mn.copyRedirectedCacheableResponsesPlugin && (i === mn.defaultPrecacheCacheabilityPlugin && (e = r), i.cacheWillUpdate && n++);
    n === 0 ? this.plugins.push(mn.defaultPrecacheCacheabilityPlugin) : n > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
mn.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate({ response: t }) {
    return !t || t.status >= 400 ? null : t;
  }
};
mn.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate({ response: t }) {
    return t.redirected ? await Yv(t) : t;
  }
};
class rb {
  /**
   * Create a new PrecacheController.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] The cache to use for precaching.
   * @param {string} [options.plugins] Plugins to use when precaching as well
   * as responding to fetch events for precached assets.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor({ cacheName: e, plugins: n = [], fallbackToNetwork: r = !0 } = {}) {
    this._urlsToCacheKeys = /* @__PURE__ */ new Map(), this._urlsToCacheModes = /* @__PURE__ */ new Map(), this._cacheKeysToIntegrities = /* @__PURE__ */ new Map(), this._strategy = new mn({
      cacheName: no.getPrecacheName(e),
      plugins: [
        ...n,
        new Hv({ precacheController: this })
      ],
      fallbackToNetwork: r
    }), this.install = this.install.bind(this), this.activate = this.activate.bind(this);
  }
  /**
   * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
   * used to cache assets and respond to fetch events.
   */
  get strategy() {
    return this._strategy;
  }
  /**
   * Adds items to the precache list, removing any duplicates and
   * stores the files in the
   * {@link workbox-core.cacheNames|"precache cache"} when the service
   * worker installs.
   *
   * This method can be called multiple times.
   *
   * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
   */
  precache(e) {
    this.addToCacheList(e), this._installAndActiveListenersAdded || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this._installAndActiveListenersAdded = !0);
  }
  /**
   * This method will add items to the precache list, removing duplicates
   * and ensuring the information is valid.
   *
   * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
   *     Array of entries to precache.
   */
  addToCacheList(e) {
    const n = [];
    for (const r of e) {
      typeof r == "string" ? n.push(r) : r && r.revision === void 0 && n.push(r.url);
      const { cacheKey: i, url: o } = Vv(r), c = typeof r != "string" && r.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(o) && this._urlsToCacheKeys.get(o) !== i)
        throw new yt("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(o),
          secondEntry: i
        });
      if (typeof r != "string" && r.integrity) {
        if (this._cacheKeysToIntegrities.has(i) && this._cacheKeysToIntegrities.get(i) !== r.integrity)
          throw new yt("add-to-cache-list-conflicting-integrities", {
            url: o
          });
        this._cacheKeysToIntegrities.set(i, r.integrity);
      }
      if (this._urlsToCacheKeys.set(o, i), this._urlsToCacheModes.set(o, c), n.length > 0) {
        const l = `Workbox is precaching URLs without revision info: ${n.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
        console.warn(l);
      }
    }
  }
  /**
   * Precaches new and updated assets. Call this method from the service worker
   * install event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.InstallResult>}
   */
  install(e) {
    return uu(e, async () => {
      const n = new Wv();
      this.strategy.plugins.push(n);
      for (const [o, c] of this._urlsToCacheKeys) {
        const l = this._cacheKeysToIntegrities.get(c), d = this._urlsToCacheModes.get(o), h = new Request(o, {
          integrity: l,
          cache: d,
          credentials: "same-origin"
        });
        await Promise.all(this.strategy.handleAll({
          params: { cacheKey: c },
          request: h,
          event: e
        }));
      }
      const { updatedURLs: r, notUpdatedURLs: i } = n;
      return { updatedURLs: r, notUpdatedURLs: i };
    });
  }
  /**
   * Deletes assets that are no longer present in the current precache manifest.
   * Call this method from the service worker activate event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.CleanupResult>}
   */
  activate(e) {
    return uu(e, async () => {
      const n = await self.caches.open(this.strategy.cacheName), r = await n.keys(), i = new Set(this._urlsToCacheKeys.values()), o = [];
      for (const c of r)
        i.has(c.url) || (await n.delete(c), o.push(c.url));
      return { deletedURLs: o };
    });
  }
  /**
   * Returns a mapping of a precached URL to the corresponding cache key, taking
   * into account the revision information for the URL.
   *
   * @return {Map<string, string>} A URL to cache key mapping.
   */
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  /**
   * Returns a list of all the URLs that have been precached by the current
   * service worker.
   *
   * @return {Array<string>} The precached URLs.
   */
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  /**
   * Returns the cache key used for storing a given URL. If that URL is
   * unversioned, like `/index.html', then the cache key will be the original
   * URL with a search parameter appended to it.
   *
   * @param {string} url A URL whose cache key you want to look up.
   * @return {string} The versioned URL that corresponds to a cache key
   * for the original URL, or undefined if that URL isn't precached.
   */
  getCacheKeyForURL(e) {
    const n = new URL(e, location.href);
    return this._urlsToCacheKeys.get(n.href);
  }
  /**
   * @param {string} url A cache key whose SRI you want to look up.
   * @return {string} The subresource integrity associated with the cache key,
   * or undefined if it's not set.
   */
  getIntegrityForCacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  /**
   * This acts as a drop-in replacement for
   * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
   * with the following differences:
   *
   * - It knows what the name of the precache is, and only checks in that cache.
   * - It allows you to pass in an "original" URL without versioning parameters,
   * and it will automatically look up the correct cache key for the currently
   * active revision of that URL.
   *
   * E.g., `matchPrecache('index.html')` will find the correct precached
   * response for the currently active service worker, even if the actual cache
   * key is `'/index.html?__WB_REVISION__=1234abcd'`.
   *
   * @param {string|Request} request The key (without revisioning parameters)
   * to look up in the precache.
   * @return {Promise<Response|undefined>}
   */
  async matchPrecache(e) {
    const n = e instanceof Request ? e.url : e, r = this.getCacheKeyForURL(n);
    if (r)
      return (await self.caches.open(this.strategy.cacheName)).match(r);
  }
  /**
   * Returns a function that looks up `url` in the precache (taking into
   * account revision information), and returns the corresponding `Response`.
   *
   * @param {string} url The precached URL which will be used to lookup the
   * `Response`.
   * @return {workbox-routing~handlerCallback}
   */
  createHandlerBoundToURL(e) {
    const n = this.getCacheKeyForURL(e);
    if (!n)
      throw new yt("non-precached-url", { url: e });
    return (r) => (r.request = new Request(e), r.params = Object.assign({ cacheKey: n }, r.params), this.strategy.handle(r));
  }
}
let ca;
const Bd = () => (ca || (ca = new rb()), ca);
try {
  self["workbox:routing:7.2.0"] && _();
} catch {
}
const $d = "GET", Ms = (t) => t && typeof t == "object" ? t : { handle: t };
class ei {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, n, r = $d) {
    this.handler = Ms(n), this.match = e, this.method = r;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(e) {
    this.catchHandler = Ms(e);
  }
}
class ib extends ei {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, n, r) {
    const i = ({ url: o }) => {
      const c = e.exec(o.href);
      if (c && !(o.origin !== location.origin && c.index !== 0))
        return c.slice(1);
    };
    super(i, n, r);
  }
}
class sb {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: n } = e, r = this.handleRequest({ request: n, event: e });
      r && e.respondWith(r);
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: n } = e.data, r = Promise.all(n.urlsToCache.map((i) => {
          typeof i == "string" && (i = [i]);
          const o = new Request(...i);
          return this.handleRequest({ request: o, event: e });
        }));
        e.waitUntil(r), e.ports && e.ports[0] && r.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest({ request: e, event: n }) {
    const r = new URL(e.url, location.href);
    if (!r.protocol.startsWith("http"))
      return;
    const i = r.origin === location.origin, { params: o, route: c } = this.findMatchingRoute({
      event: n,
      request: e,
      sameOrigin: i,
      url: r
    });
    let l = c && c.handler;
    const d = e.method;
    if (!l && this._defaultHandlerMap.has(d) && (l = this._defaultHandlerMap.get(d)), !l)
      return;
    let h;
    try {
      h = l.handle({ url: r, request: e, event: n, params: o });
    } catch (g) {
      h = Promise.reject(g);
    }
    const f = c && c.catchHandler;
    return h instanceof Promise && (this._catchHandler || f) && (h = h.catch(async (g) => {
      if (f)
        try {
          return await f.handle({ url: r, request: e, event: n, params: o });
        } catch (m) {
          m instanceof Error && (g = m);
        }
      if (this._catchHandler)
        return this._catchHandler.handle({ url: r, request: e, event: n });
      throw g;
    })), h;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute({ url: e, sameOrigin: n, request: r, event: i }) {
    const o = this._routes.get(r.method) || [];
    for (const c of o) {
      let l;
      const d = c.match({ url: e, sameOrigin: n, request: r, event: i });
      if (d)
        return l = d, (Array.isArray(l) && l.length === 0 || d.constructor === Object && // eslint-disable-line
        Object.keys(d).length === 0 || typeof d == "boolean") && (l = void 0), { route: c, params: l };
    }
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(e, n = $d) {
    this._defaultHandlerMap.set(n, Ms(e));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(e) {
    this._catchHandler = Ms(e);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(e) {
    this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new yt("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const n = this._routes.get(e.method).indexOf(e);
    if (n > -1)
      this._routes.get(e.method).splice(n, 1);
    else
      throw new yt("unregister-route-route-not-registered");
  }
}
let qr;
const ob = () => (qr || (qr = new sb(), qr.addFetchListener(), qr.addCacheListener()), qr);
function ab(t, e, n) {
  let r;
  if (typeof t == "string") {
    const o = new URL(t, location.href), c = ({ url: l }) => l.href === o.href;
    r = new ei(c, e, n);
  } else if (t instanceof RegExp)
    r = new ib(t, e, n);
  else if (typeof t == "function")
    r = new ei(t, e, n);
  else if (t instanceof ei)
    r = t;
  else
    throw new yt("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return ob().registerRoute(r), r;
}
function cb(t, e = []) {
  for (const n of [...t.searchParams.keys()])
    e.some((r) => r.test(n)) && t.searchParams.delete(n);
  return t;
}
function* lb(t, { ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/], directoryIndex: n = "index.html", cleanURLs: r = !0, urlManipulation: i } = {}) {
  const o = new URL(t, location.href);
  o.hash = "", yield o.href;
  const c = cb(o, e);
  if (yield c.href, n && c.pathname.endsWith("/")) {
    const l = new URL(c.href);
    l.pathname += n, yield l.href;
  }
  if (r) {
    const l = new URL(c.href);
    l.pathname += ".html", yield l.href;
  }
  if (i) {
    const l = i({ url: o });
    for (const d of l)
      yield d.href;
  }
}
class ub extends ei {
  /**
   * @param {PrecacheController} precacheController A `PrecacheController`
   * instance used to both match requests and respond to fetch events.
   * @param {Object} [options] Options to control how requests are matched
   * against the list of precached URLs.
   * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
   * check cache entries for a URLs ending with '/' to see if there is a hit when
   * appending the `directoryIndex` value.
   * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
   * array of regex's to remove search params when looking for a cache match.
   * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
   * check the cache for the URL with a `.html` added to the end of the end.
   * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
   * This is a function that should take a URL and return an array of
   * alternative URLs that should be checked for precache matches.
   */
  constructor(e, n) {
    const r = ({ request: i }) => {
      const o = e.getURLsToCacheKeys();
      for (const c of lb(i.url, n)) {
        const l = o.get(c);
        if (l) {
          const d = e.getIntegrityForCacheKey(l);
          return { cacheKey: l, integrity: d };
        }
      }
    };
    super(r, e.strategy);
  }
}
function fb(t) {
  const e = Bd(), n = new ub(e, t);
  ab(n);
}
const db = "-precache-", hb = async (t, e = db) => {
  const r = (await self.caches.keys()).filter((i) => i.includes(e) && i.includes(self.registration.scope) && i !== t);
  return await Promise.all(r.map((i) => self.caches.delete(i))), r;
};
function pb() {
  self.addEventListener("activate", (t) => {
    const e = no.getPrecacheName();
    t.waitUntil(hb(e).then((n) => {
    }));
  });
}
function yb(t) {
  Bd().precache(t);
}
function gb(t, e) {
  yb(t), fb(e);
}
console.log("🚀 Service Worker starting (built at 2025-09-29T16:48:18.126Z)");
gb([{"revision":null,"url":"assets/index-0fb16d74.js"},{"revision":null,"url":"assets/index-44b953c9.css"},{"revision":null,"url":"assets/web-vitals-dfcc5b9a.js"},{"revision":"d059445cb31e01851fed767fabd60853","url":"index.html"},{"revision":"fc723c843a0b8a137167d3d63dda4e28","url":"./dexie-icon-64x64.gif"},{"revision":"0ea25c17ba9443457d913d6be03fea55","url":"./dexie-icon-192x192.png"},{"revision":"f1749b24004626d4cb2f90aee4e442d2","url":"./dexie-icon-512x512.png"},{"revision":"2482ade6e4b177e1de1473f83be15e59","url":"manifest.webmanifest"}]);
pb();
self.addEventListener("install", (t) => {
  self.skipWaiting();
});
//# sourceMappingURL=sw.js.map
