(function (window) {
    var watt = {
        version: 0.1
    };

    /**
     * @param pka string of namespace
     * @return {*}
     */
    function NS(pka) {
        var space = watt;
        for (var i = 0; i < pka.length; i++) {
            space = (space[pka[i]] = space[pka[i]] || {});
        }
        return space;
    }

    watt.apply = function (d, e) {
        if (d && e && typeof e == "object") {
            for (var a in e) {
                if (typeof e[a] != 'undefined')
                    d[a] = e[a]
            }
        }
        return d
    }

    /**
     * namespace manager
     * @param ns
     * @param func
     * @return {*}
     */
    watt.ns = function (ns, func) {
        var target = (typeof ns == "string") ? NS(ns.split(".")) : watt;

        watt.apply(target, ns);

        if (func && typeof func == "function") {
            func = func.apply(target, [watt]);
        }

        return watt.apply(target, func);
    }

    /**
     * Watt Virtual Stack.hold all inner instance of watt.
     * @type {{}}
     */
    watt.WVS = {}


    window.watt = watt;
})(window);

/**
 * bus.js - The browser-bus
 * @author wanghe
 */
watt.ns('bus', function (watt) {

    watt.WVS.BUS = {};

    var Bus = function (ns) {
        this.ns = ns || this._DEF_NAMESPACE;
        this.events = {};
        if (watt.WVS.BUS[this.ns])
            return watt.WVS.BUS[this.ns];
        watt.WVS.BUS[this.ns] = this;
        return this;
    }

    Bus.prototype = {
        _DEF_NAMESPACE: '_defaultNS',
        /**
         * Bind events
         * @param name A string containing One or more space-separated event types.
         * @param callback A function to execute at the time the event is triggered.
         * @return {*}
         */
        on: function (name, callback) {
            var events = name.split(/\s+/), event;
            if (callback && typeof callback == "function") {
                while (event = events.shift()) {
                    (this.events[event] || (this.events[event] = [])).push(callback);
                }
            }
            return this;
        },
        /**
         * Remove events.
         * If `callback` is undefined, remove all callbacks for the event types.
         * If `name` and `callback` are both undefined, remove all callbacks for all event types
         * @param name name of events
         * @param callback the handler of given event types.
         * @return {*}
         */
        off: function (name, callback) {
            if (!(name || callback)) {
                this.events = {};
            } else {
                var events = name.split(/\s+/), event, calls;
                while (event = events.shift()) {
                    calls = this.events[event];
                    if (calls) {
                        if (callback) {
                            for (var i = calls.length - 1; i >= 0; i--) {
                                if (calls[i] === callback) {
                                    calls.splice(i, 1)
                                }
                            }
                        }
                        else {
                            delete this.events[event];
                        }
                    }
                }
            }
            return this
        },
        /**
         * Bind once events
         * The handler is executed at most once per event type.
         * @param name A string containing One or more space-separated event types.
         * @param callback A function to execute at the time the event is triggered.
         */
        one: function (name, callback) {
            var that = this;
            var cb = function () {
                that.off(name, cb);
                callback.apply(this, arguments);
            }
            this.on(name, cb);
        },
        /**
         * Execute all handlers for the given event types.
         * @param name A string containing One or more space-separated event types
         * @param data Additional parameters to pass along to the event handler.
         * @param scope context of handler when it was executed.
         * @return {*}
         */
        emit: function (name, data, scope) {
            var events = name.split(/\s+/), event, calls, call;

            while (event = events.shift()) {
                //Copy callback lists to prevent modification.
                calls = (this.events[event] || []).slice();
                while (call = calls.shift()) {
                    //aop------filter?
                    call.apply(scope || this, data || []);
                }
            }
            return this;
        }
    }

    var handler = function (args, handler) {
        if (args.length == 4) {
            //ns,name,data ,scope
            if (typeof args[1] != "string") {
                args[3] = args[2];
                args[2] = args[1];
                args[1] = args[0];
                args[0] = watt['bus'].Bus._DEF_NAMESPACE;
            }
        } else {
            //ns, name, callback
            if (typeof args[1] == "function") {
                args[2] = args[1];
                args[1] = args[0];
                args[0] = watt['bus'].Bus._DEF_NAMESPACE;
            }
        }
        var buses = args.shift().split(/\s+/g), bus, _bus;
        while (bus = buses.shift()) {
            _bus = watt.WVS.BUS[bus || watt['bus'].Bus._DEF_NAMESPACE];
            if (_bus) {
                _bus[handler].apply(_bus, args);
            }
        }
    }

    watt.ns({
        /**
         * Bind events
         * @param ns namespace of bus.
         * @param name A string containing One or more space-separated event types.
         * @param callback A function to execute at the time the event is triggered.
         * @return {*}
         */
        on: function (ns, name, callback) {
            handler([ns, name, callback], 'on');
            return this;
        },
        /**
         * Remove events.
         * If `callback` is undefined, remove all callbacks for the event types.
         * If `name` and `callback` are both undefined, remove all callbacks for all event types
         * @param ns namespace of bus.
         * @param name name of events
         * @param callback the handler of given event types.
         * @return {*}
         */
        off: function (ns, name, callback) {
            handler([ns, name, callback], 'off');
            return this
        },
        /**
         * Bind once events
         * The handler is executed at most once per event type.
         * @param ns namespace of bus.
         * @param name A string containing One or more space-separated event types.
         * @param callback A function to execute at the time the event is triggered.
         */
        one: function (ns, name, callback) {
            handler([ns, name, callback], 'one');
            return this;
        },
        /**
         * Execute all handlers for the given event types.
         * @param ns namespace of bus.
         * @param name A string containing One or more space-separated event types
         * @param data A array.Additional parameters to pass along to the event handler.
         * @param scope context of handler when it was executed.
         * @return {*}
         */
        emit: function (ns, name, data, scope) {
            handler([ns, name, data, scope], 'emit');
            return this;
        },
        Bus: function (ns) {
            new watt['bus'].Bus(ns);
        }
    }, 0);

    /**
     * build a bus use default namespace
     */
    return {Bus: new Bus()};
});

var N = {
    apply: function (d, e) {
        if (d && e && typeof e == "object") {
            for (var a in e) {
                if (typeof e[a] != 'undefined')
                    d[a] = e[a]
            }
        }
        return d
    },
    override: function (e, D) {
        N.apply(e.prototype, D);
    },
    extend: function () {
        var C = function (E) {
            for (var D in E) {
                this[D] = E[D];
            }
        };
        var e = Object.prototype.constructor;
        return function (G, S, O) {
            var J = function () {
                G.apply(this, arguments);
                S.apply(this, arguments);
            }
            var E = function () {
            }, H, D = G.prototype;
            E.prototype = D;
            H = J.prototype = new E();
            H.constructor = J;
            J.superclass = D;
            if (D.constructor == e) {
                D.constructor = G;
            }
            J.override = function (F) {
                N.override(J, F);
            };
            H.superclass = (function () {
                return D;
            });
            H.override = C;
            N.override(J, O);
            J.extend = function (F) {
                return N.extend(J, F)
            };
            return J;
        }
    }()
}

var isSupportOnline = 'onLine' in navigator;

N.NetDaemon = {
    _connection: undefined,
    _netStatus: 3,

    STATUS_ONLINE: 0,
    STATUS_OFFLINE: 1,
    STATUS_PING_SUCCESS: 2,
    STATUS_PING_FAIL: 3,

    EVENT_ONLINE: 0,
    EVENT_OFFLINE: 1,
    EVENT_PING_SUCCESS: 2,
    EVENT_PING_FAIL: 3,

    INTERVAL_TIME: 10 * 1000,
    PING_TIMEOUT: 30 * 1000,
    PING_FAIL_DELAY: 10 * 1000,

    _onOffline: function (description) {
        //this._connection = null;
        this._netStatus = this.STATUS_OFFLINE;
        console.log('Net status change. from ' + description + ' to STATUS_OFFLINE================');
        if (this._connection) {
            this._connection.stopHeartBeat();
        }
    },

    _onPingSuccess: function (description) {
        this._netStatus = this.STATUS_PING_SUCCESS;
        console.log('Net status change. from ' + description + ' to STATUS_PING_SUCCESS================');
        watt.emit('pingSuccess');
    },

    _onPingFail: function (delay, description) {
        this._netStatus = this.STATUS_PING_FAIL;
        //this._connection = null;
        console.log('Net status change. from ' + description + ' to  STATUS_PING_FAIL, reconnect ' + delay / 1000 + 's later==============');
        this.reconnect(delay);
    },

    _onEvents: [
        function (event) {
            var description = 'STATUS_ONLINE';
            switch (event) {
                case this.EVENT_ONLINE:
                {
                    console.log('Net status change. unexpected event. on ' + description + ', and comes a EVENT_ONLINE===========');
                }
                    ;
                    break;
                case this.EVENT_OFFLINE:
                {
                    this._onOffline(description);
                }
                    ;
                    break;
                case this.EVENT_PING_SUCCESS:
                {
                    this._onPingSuccess(description);
                }
                    ;
                    break;
                case this.EVENT_PING_FAIL:
                {
                    this._onPingFail(this.PING_FAIL_DELAY, description);
                }
                    ;
            }
        },

        function (event) {
            var description = 'STATUS_OFFLINE';
            switch (event) {
                case this.EVENT_ONLINE:
                {
                    this._netStatus = this.STATUS_ONLINE;
                    console.log('Net status change. from ' + description + ' to STATUS_ONLINE, reconnecting===================');
                    watt.emit('online');
                    this.reconnect(0);
                }
                    ;
                    break;
                case this.EVENT_OFFLINE:
                {
                    console.log('Net status change. unexpected event. on ' + description + ', and comes a EVENT_OFFLINE');
                }
                    ;
                    break;
                case this.EVENT_PING_SUCCESS:
                {
                    console.log('Net status change. unexpected event. on ' + description + ', and comes a EVENT_PING_SUCCESS');
                    this._onPingSuccess(description);
                }
                    ;
                    break;
                case this.EVENT_PING_FAIL:
                {
                    console.log('Net status change. from ' + description + ' to STATUS_ONLINE, reconnecting===================');
                }
                    ;
            }
        },

        function (event) {
            var description = 'STATUS_PING_SUCCESS';
            switch (event) {
                case this.EVENT_ONLINE:
                {
                    console.log('Net status change. unexpected event. on ' + description + ', and comes a EVENT_ONLINE');
                }
                    ;
                    break;
                case this.EVENT_OFFLINE:
                {
                    this._onOffline('STATUS_PING_SUCCESS');
                }
                    ;
                    break;
                case this.EVENT_PING_SUCCESS:
                {
                    console.log('Net status change. from ' + description + ' to STATUS_PING_SUCCESS.');
                }
                    ;
                    break;
                case this.EVENT_PING_FAIL:
                {
                    this._onPingFail(this.PING_FAIL_DELAY, description);
                }
                    ;
            }
        },

        function (event) {
            var description = 'STATUS_PING_FAIL';
            switch (event) {
                case this.EVENT_ONLINE:
                {
                    console.log('Net status change. unexpected event. on ' + description + ', and comes a EVENT_ONLINE');
                }
                    ;
                    break;
                case this.EVENT_OFFLINE:
                {
                    this._onOffline(description);
                }
                    ;
                    break;
                case this.EVENT_PING_SUCCESS:
                {
                    this._onPingSuccess(description);
                }
                    ;
                    break;
                case this.EVENT_PING_FAIL:
                {
                    console.log('Net status change. from STATUS_PING_FAIL to ' + description + '. reconnect ' + this.PING_FAIL_DELAY / 1000 + 's later.==========');
                    this.reconnect(this.PING_FAIL_DELAY);
                }
                    ;
            }
        }
    ],

    changeStatus: function (event) {
        this._onEvents[this._netStatus].call(this, event);
    },

    reconnect: function (delay) {
//        setTimeout(function () {
//            N.connect('reconnect');
//        }, delay||5000);
        if (this._connection) {
            this._connection.reconnect(delay);
        }

    },

    created: function (connection) {
        this._connection = connection;
    },

    connected: function (connection) {
        this._connection = connection;
        this.changeStatus(this.STATUS_PING_SUCCESS);
    },

    isConnected: function () {
        return this.STATUS_PING_SUCCESS === this._netStatus;
    },

    init: function () {
        var _this = this;
        if (isSupportOnline) {
            window.addEventListener('online', function () {
                _this.changeStatus(_this.STATUS_ONLINE)
            });
            window.addEventListener('offline', function () {
                _this.changeStatus(_this.STATUS_OFFLINE);
            });
        }

        watt.on('created', function (connection) {
            _this.created(connection);
        });

        watt.on('connected', function (connection) {
            _this.connected(connection);
        });

        watt.on('connectFail', function () {
            _this.changeStatus(_this.STATUS_PING_FAIL);
        });

        watt.on('onMessage onAck', function () {
            if (!_this._connection) {
                _this._connection = N['connection'];
                _this.changeStatus(_this.STATUS_PING_SUCCESS);
            }
        });
    }
};

N.NetDaemon.init();

var last_health = -1;
var health_timeout = 3000;
window.heartBeatResult = true;
window.heartbeat_timer = 0;
window.retryConnect_timer = 0;
window.socket;
window.onMsgListeners = [];
window.onOpenListeners = [];
window.onCloseListeners = [];
window.onErrorListeners = [];

<!-- new socket -->
function Socket(url) {
    this.url = url;
}

Socket.prototype.connect = function () {
    if (this.connection) {
        try {
            this.connection.onclose = null;
            this.connection.close();
        } catch (e) {
        }
    }

    this.connection = new WebSocket(this.url);
    watt.emit("created", [window.socket]);

    this.connection.onmessage = function (event) {
        if (event == null || event.data == null || event.data == 'HB') {
            if (event.data == 'HB') {
                window.heartBeatResult = true;
                N.NetDaemon.changeStatus(N.NetDaemon.STATUS_PING_SUCCESS);
            }
            return;
        }
        var msg = decodeURIComponent(event.data);
        for (var i = 0; i < window.onMsgListeners.length; i++) {
            window.onMsgListeners[i](msg);
        }
    }

    this.connection.onopen = function (event) {
        var that = this;
        if (window.heartbeat_timer) {
            clearInterval(window.heartbeat_timer)
        }

        window.heartBeatResult = true;
        window.heartbeat_timer = setInterval(
            function () {//心跳
                keepAlive(that);
            }, 10000);

        if (window.retryConnect_timer) {
            clearInterval(window.retryConnect_timer);
        }

        for (var i = 0; i < window.onOpenListeners.length; i++) {
            window.onOpenListeners[i](event);
        }

        watt.emit("connected", [window.socket]);
    }
    this.connection.onerror = function (event) {
        clearInterval(window.heartbeat_timer);
        for (var i = 0; i < window.onErrorListeners.length; i++) {
            window.onErrorListeners[i](event);
        }
    }
    this.connection.onclose = function (event) {
        var that = this;
        clearInterval(window.heartbeat_timer);
        for (var i = 0; i < window.onCloseListeners.length; i++) {
            window.onCloseListeners[i](event);
        }

        N.NetDaemon.changeStatus(N.NetDaemon.STATUS_PING_FAIL);
//        window.retryConnect_timer=setInterval(
//            function () {//掉线或关闭了，10s重试一次
//                retryConnect(that);
//            }, 10000);
    }
};

Socket.prototype.reconnect = function (delay) {
    clearInterval(window.retryConnect_timer);
    var that = this;
    window.retryConnect_timer = setInterval(
        function () {//掉线或关闭了，10s重试一次
            retryConnect(that);
        }, delay);
};

Socket.prototype.stopHeartBeat = function () {
    clearInterval(window.heartbeat_timer);
}

WebSocketClient.prototype = {
    onMessageListener: function (func) {
        window.onMsgListeners.push(func);
    },
    onOpenListener: function (func) {
        window.onOpenListeners.push(func);
    },
    onErrorListener: function (func) {
        window.onErrorListeners.push(func);
    },
    onCloseListener: function (func) {
        window.onCloseListeners.push(func);
    }
}


<!-- online server -->
function WebSocketClient(appKey, clientId) {
    var url = getCookie("wpush_server_url");
    if ('' == url || 'undefined' == url) {
//        url= 'wss://push.ndpmedia.com';//在机器上绑host
        url = 'ws://172.30.30.231:8379';//在机器上绑hosmt
    }
    this.socket = window.socket;
    if (this.socket == null || this.socket == undefined) {
        this.socket = new Socket(url + "/websocket/" + appKey + "/" + clientId);
        window.socket = this.socket;
        this.socket.connect();
    }
}

WebSocketClient.prototype.send = function (msg) {
    this.socket.connection.send(msg);
};

WebSocketClient.prototype.close = function (msg) {
    if (this.socket.connection) {
        this.socket.connection.close();
    }
};

function keepAlive(socket) {
    var time = new Date();
    if (last_health != -1 && ( time.getTime() - last_health > health_timeout )) {
        //此时即可以认为连接断开，可设置重连或者关闭连接
        console.log("服务器没有响应");
        socket.close();
    } else {
//        if( socket.bufferedAmount == 0 ){
        sendHB(socket);
//        }
    }
}

function sendHB(socket) {
    if (!window.heartBeatResult) {
        N.NetDaemon.changeStatus(N.NetDaemon.STATUS_PING_FAIL);
    }

    if (N.NetDaemon.isConnected()) {
        try {
            socket.send('~#HHHBBB#~');
        } catch (e) {
        }
    }

    window.heartBeatResult = false;
}

function retryConnect(socket) {
    socket.connect();
}


function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=")
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1
            c_end = document.cookie.indexOf(";", c_start)
            if (c_end == -1) c_end = document.cookie.length
            return unescape(document.cookie.substring(c_start, c_end))
        }
    }
    return ""
}