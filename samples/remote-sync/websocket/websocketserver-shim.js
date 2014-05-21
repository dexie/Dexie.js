/* This shim helps you unit test both WebSocket client and a websocket server in the browser.
   
   This shim will implement a simple web socket server with same API as "nodejs-websocket".
   It will also replace the browser's WebSocket class with a emulated WebSocket class that
   will only communicate with instances of the emulated websocket server.

   You can then unit test your WebSocket client and server in the same browser without relying
   on any network card or TCP stack.
*/

(function () {

    // To be able to test both server and client in a browser, emulate a WebSocketServer in the browser, and replace the
    // WebSocket api with an emulated WebSocket that communicates with emulated WebSocketServer.
    function EmulatedWebSocketServerFactory() {
        this.createServer = function (connectCallback) {
            var server = {
                _connect: function (socket) {
                    var conn = {
                        _client: socket,
                        _listeners: { "text": [], "close": [] },
                        on: function (type, listener) {
                            conn._listeners[type].push(listener);
                        },
                        _fire: function (type, args) {
                            conn._listeners[type].forEach(function (listener) {
                                listener.apply(null, args);
                            });
                        },

                        _text: function (msg) {
                            conn._fire("text", [msg]);
                        },
                        sendText: function (msg) {
                            setTimeout(function () {
                                conn._client._text(msg);
                            }, 0);
                        },
                        close: function (code, reason) {
                            setTimeout(function () {
                                conn._client._disconnect(code, reason);
                            }, 0);
                        },
                        _disconnect: function (code, reason) {
                            conn._fire("close", [code, reason]);
                        }
                    };
                    connectCallback(conn);
                    return conn;
                },
                listen: function (port) {
                    EmulatedWebSocketServerFactory.listeners[port] = this;
                    return this;
                }
            }
            return server;
        }
    }
    EmulatedWebSocketServerFactory.listeners = {};

    function EmulatedWebSocket(url) {
        var uri = parseURL(url);
        var self = this;
        this.conn = null;
        this.send = function (msg) {
            if (!this.conn) throw "Not connected";
            setTimeout(function () {
                self.conn._text(msg);
            }, 0);
        }
        this.close = function (code, reason) {
            setTimeout(function () {
                if (self.conn) self.conn._disconnect(code, reason);
                self.conn = null;
            }, 0);
        }
        this._text = function (msg) {
            if (this.onmessage) {
                this.onmessage({ target: this, data: msg });
            }
        }
        this._disconnect = function (code, reason) {
            if (this.onclose) {
                this.onclose({code: code, reason: reason, wasClean: true });
            }
        }
        setTimeout(function () {
            try {
                if (EmulatedWebSocketServerFactory.listeners[uri.port]) {
                    var server = EmulatedWebSocketServerFactory.listeners[uri.port];
                    var conn = server._connect(self);
                    self.conn = conn;
                    if (self.onopen) {
                        self.onopen({ target: self });
                    }
                } else {
                    throw "Could not connect";
                }
            } catch (e) {
                if (self.onerror) {
                    self.onerror({
                        target: self,
                        message: e.toString()
                    });
                }
            }
        }, 0);
    }

    function parseURL(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function () {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length, i = 0, s;
                for (; i < len; i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    }

    function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
    }

    window.require = override(window.require, function (origFunc) {
        return function (module) {
            if (module == "nodejs-websocket")
                return new EmulatedWebSocketServerFactory();
            else
                return origFunc.apply(this, arguments);
        }
    });

    window.WebSocket = EmulatedWebSocket;

})();
