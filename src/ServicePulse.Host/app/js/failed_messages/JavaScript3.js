﻿function FastClick(t) {
    "use strict";
    var e, n = this;
    if (this.trackingClick = !1, this.trackingClickStart = 0, this.targetElement = null, this.touchStartX = 0, this.touchStartY = 0, this.lastTouchIdentifier = 0, this.touchBoundary = 10, this.layer = t, !t || !t.nodeType)throw new TypeError("Layer must be a document node");
    this.onClick = function() { return FastClick.prototype.onClick.apply(n, arguments); }, this.onMouse = function() { return FastClick.prototype.onMouse.apply(n, arguments); }, this.onTouchStart = function() { return FastClick.prototype.onTouchStart.apply(n, arguments); }, this.onTouchMove = function() { return FastClick.prototype.onTouchMove.apply(n, arguments); }, this.onTouchEnd = function() { return FastClick.prototype.onTouchEnd.apply(n, arguments); }, this.onTouchCancel = function() { return FastClick.prototype.onTouchCancel.apply(n, arguments); }, FastClick.notNeeded(t) || (this.deviceIsAndroid && (t.addEventListener("mouseover", this.onMouse, !0), t.addEventListener("mousedown", this.onMouse, !0), t.addEventListener("mouseup", this.onMouse, !0)), t.addEventListener("click", this.onClick, !0), t.addEventListener("touchstart", this.onTouchStart, !1), t.addEventListener("touchmove", this.onTouchMove, !1), t.addEventListener("touchend", this.onTouchEnd, !1), t.addEventListener("touchcancel", this.onTouchCancel, !1), Event.prototype.stopImmediatePropagation || (t.removeEventListener = function(e, n, r) {
        var i = Node.prototype.removeEventListener;
        "click" === e ? i.call(t, e, n.hijacked || n, r) : i.call(t, e, n, r);
    }, t.addEventListener = function(e, n, r) {
        var i = Node.prototype.addEventListener;
        "click" === e ? i.call(t, e, n.hijacked || (n.hijacked = function(t) { t.propagationStopped || n(t); }), r) : i.call(t, e, n, r);
    }), "function" == typeof t.onclick && (e = t.onclick, t.addEventListener("click", function(t) { e(t); }, !1), t.onclick = null));
}

!function(t, e) {

    function n(t) {
        var e = t.length, n = oe.type(t);
        return oe.isWindow(t) ? !1 : 1 === t.nodeType && e ? !0 : "array" === n || "function" !== n && (0 === e || "number" == typeof e && e > 0 && e - 1 in t);
    }

    function r(t) {
        var e = pe[t] = {};
        return oe.each(t.match(se) || [], function(t, n) { e[n] = !0; }), e;
    }

    function i() { Object.defineProperty(this.cache = {}, 0, { get: function() { return{}; } }), this.expando = oe.expando + Math.random(); }

    function o(t, n, r) {
        var i;
        if (r === e && 1 === t.nodeType)
            if (i = "data-" + n.replace(ye, "-$1").toLowerCase(), r = t.getAttribute(i), "string" == typeof r) {
                try {
                    r = "true" === r ? !0 : "false" === r ? !1 : "null" === r ? null : +r + "" === r ? +r : ve.test(r) ? JSON.parse(r) : r;
                } catch (o) {
                }
                ge.set(t, n, r);
            } else r = e;
        return r;
    }

    function a() { return!0; }

    function s() { return!1; }

    function u() {
        try {
            return U.activeElement;
        } catch (t) {
        }
    }

    function c(t, e) {
        for (; (t = t[e]) && 1 !== t.nodeType;);
        return t;
    }

    function l(t, e, n) {
        if (oe.isFunction(e))return oe.grep(t, function(t, r) { return!!e.call(t, r, t) !== n; });
        if (e.nodeType)return oe.grep(t, function(t) { return t === e !== n; });
        if ("string" == typeof e) {
            if (Ce.test(e))return oe.filter(e, t, n);
            e = oe.filter(e, t);
        }
        return oe.grep(t, function(t) { return ee.call(e, t) >= 0 !== n; });
    }

    function f(t, e) { return oe.nodeName(t, "table") && oe.nodeName(1 === e.nodeType ? e : e.firstChild, "tr") ? t.getElementsByTagName("tbody")[0] || t.appendChild(t.ownerDocument.createElement("tbody")) : t; }

    function h(t) { return t.type = (null !== t.getAttribute("type")) + "/" + t.type, t; }

    function d(t) {
        var e = ze.exec(t.type);
        return e ? t.type = e[1] : t.removeAttribute("type"), t;
    }

    function p(t, e) { for (var n = t.length, r = 0; n > r; r++)me.set(t[r], "globalEval", !e || me.get(e[r], "globalEval")); }

    function g(t, e) {
        var n, r, i, o, a, s, u, c;
        if (1 === e.nodeType) {
            if (me.hasData(t) && (o = me.access(t), a = me.set(e, o), c = o.events)) {
                delete a.handle, a.events = {};
                for (i in c)for (n = 0, r = c[i].length; r > n; n++)oe.event.add(e, i, c[i][n]);
            }
            ge.hasData(t) && (s = ge.access(t), u = oe.extend({}, s), ge.set(e, u));
        }
    }

    function m(t, n) {
        var r = t.getElementsByTagName ? t.getElementsByTagName(n || "*") : t.querySelectorAll ? t.querySelectorAll(n || "*") : [];
        return n === e || n && oe.nodeName(t, n) ? oe.merge([t], r) : r;
    }

    function v(t, e) {
        var n = e.nodeName.toLowerCase();
        "input" === n && Fe.test(t.type) ? e.checked = t.checked : ("input" === n || "textarea" === n) && (e.defaultValue = t.defaultValue);
    }

    function y(t, e) {
        if (e in t)return e;
        for (var n = e.charAt(0).toUpperCase() + e.slice(1), r = e, i = Qe.length; i--;)if (e = Qe[i] + n, e in t)return e;
        return r;
    }

    function b(t, e) { return t = e || t, "none" === oe.css(t, "display") || !oe.contains(t.ownerDocument, t); }

    function x(e) { return t.getComputedStyle(e, null); }

    function w(t, e) {
        for (var n, r, i, o = [], a = 0, s = t.length; s > a; a++)r = t[a], r.style && (o[a] = me.get(r, "olddisplay"), n = r.style.display, e ? (o[a] || "none" !== n || (r.style.display = ""), "" === r.style.display && b(r) && (o[a] = me.access(r, "olddisplay", S(r.nodeName)))) : o[a] || (i = b(r), (n && "none" !== n || !i) && me.set(r, "olddisplay", i ? n : oe.css(r, "display"))));
        for (a = 0; s > a; a++)r = t[a], r.style && (e && "none" !== r.style.display && "" !== r.style.display || (r.style.display = e ? o[a] || "" : "none"));
        return t;
    }

    function _(t, e, n) {
        var r = We.exec(e);
        return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : e;
    }

    function M(t, e, n, r, i) {
        for (var o = n === (r ? "border" : "content") ? 4 : "width" === e ? 1 : 0, a = 0; 4 > o; o += 2)"margin" === n && (a += oe.css(t, n + Je[o], !0, i)), r ? ("content" === n && (a -= oe.css(t, "padding" + Je[o], !0, i)), "margin" !== n && (a -= oe.css(t, "border" + Je[o] + "Width", !0, i))) : (a += oe.css(t, "padding" + Je[o], !0, i), "padding" !== n && (a += oe.css(t, "border" + Je[o] + "Width", !0, i)));
        return a;
    }

    function k(t, e, n) {
        var r = !0, i = "width" === e ? t.offsetWidth : t.offsetHeight, o = x(t), a = oe.support.boxSizing && "border-box" === oe.css(t, "boxSizing", !1, o);
        if (0 >= i || null == i) {
            if (i = He(t, e, o), (0 > i || null == i) && (i = t.style[e]), Ve.test(i))return i;
            r = a && (oe.support.boxSizingReliable || i === t.style[e]), i = parseFloat(i) || 0;
        }
        return i + M(t, e, n || (a ? "border" : "content"), r, o) + "px";
    }

    function S(t) {
        var e = U, n = Ze[t];
        return n || (n = T(t, e), "none" !== n && n || (Ye = (Ye || oe("<iframe frameborder='0' width='0' height='0'/>").css("cssText", "display:block !important")).appendTo(e.documentElement), e = (Ye[0].contentWindow || Ye[0].contentDocument).document, e.write("<!doctype html><html><body>"), e.close(), n = T(t, e), Ye.detach()), Ze[t] = n), n;
    }

    function T(t, e) {
        var n = oe(e.createElement(t)).appendTo(e.body), r = oe.css(n[0], "display");
        return n.remove(), r;
    }

    function E(t, e, n, r) {
        var i;
        if (oe.isArray(e))oe.each(e, function(e, i) { n || en.test(t) ? r(t, i) : E(t + "[" + ("object" == typeof i ? e : "") + "]", i, n, r); });
        else if (n || "object" !== oe.type(e))r(t, e);
        else for (i in e)E(t + "[" + i + "]", e[i], n, r);
    }

    function C(t) {
        return function(e, n) {
            "string" != typeof e && (n = e, e = "*");
            var r, i = 0, o = e.toLowerCase().match(se) || [];
            if (oe.isFunction(n))for (; r = o[i++];)"+" === r[0] ? (r = r.slice(1) || "*", (t[r] = t[r] || []).unshift(n)) : (t[r] = t[r] || []).push(n);
        };
    }

    function D(t, e, n, r) {

        function i(s) {
            var u;
            return o[s] = !0, oe.each(t[s] || [], function(t, s) {
                var c = s(e, n, r);
                return"string" != typeof c || a || o[c] ? a ? !(u = c) : void 0 : (e.dataTypes.unshift(c), i(c), !1);
            }), u;
        }

        var o = {}, a = t === bn;
        return i(e.dataTypes[0]) || !o["*"] && i("*");
    }

    function $(t, n) {
        var r, i, o = oe.ajaxSettings.flatOptions || {};
        for (r in n)n[r] !== e && ((o[r] ? t : i || (i = {}))[r] = n[r]);
        return i && oe.extend(!0, t, i), t;
    }

    function A(t, n, r) {
        for (var i, o, a, s, u = t.contents, c = t.dataTypes; "*" === c[0];)c.shift(), i === e && (i = t.mimeType || n.getResponseHeader("Content-Type"));
        if (i)
            for (o in u)
                if (u[o] && u[o].test(i)) {
                    c.unshift(o);
                    break;
                }
        if (c[0] in r)a = c[0];
        else {
            for (o in r) {
                if (!c[0] || t.converters[o + " " + c[0]]) {
                    a = o;
                    break;
                }
                s || (s = o);
            }
            a = a || s;
        }
        return a ? (a !== c[0] && c.unshift(a), r[a]) : void 0;
    }

    function N(t, e, n, r) {
        var i, o, a, s, u, c = {}, l = t.dataTypes.slice();
        if (l[1])for (a in t.converters)c[a.toLowerCase()] = t.converters[a];
        for (o = l.shift(); o;)
            if (t.responseFields[o] && (n[t.responseFields[o]] = e), !u && r && t.dataFilter && (e = t.dataFilter(e, t.dataType)), u = o, o = l.shift())
                if ("*" === o)o = u;
                else if ("*" !== u && u !== o) {
                    if (a = c[u + " " + o] || c["* " + o], !a)
                        for (i in c)
                            if (s = i.split(" "), s[1] === o && (a = c[u + " " + s[0]] || c["* " + s[0]])) {
                                a === !0 ? a = c[i] : c[i] !== !0 && (o = s[0], l.unshift(s[1]));
                                break;
                            }
                    if (a !== !0)
                        if (a && t["throws"])e = a(e);
                        else
                            try {
                                e = a(e);
                            } catch (f) {
                                return{ state: "parsererror", error: a ? f : "No conversion from " + u + " to " + o };
                            }
                }
        return{ state: "success", data: e };
    }

    function L() { return setTimeout(function() { Cn = e; }), Cn = oe.now(); }

    function j(t, e, n) { for (var r, i = (jn[e] || []).concat(jn["*"]), o = 0, a = i.length; a > o; o++)if (r = i[o].call(n, e, t))return r; }

    function O(t, e, n) {
        var r,
            i,
            o = 0,
            a = Ln.length,
            s = oe.Deferred().always(function() { delete u.elem; }),
            u = function() {
                if (i)return!1;
                for (var e = Cn || L(), n = Math.max(0, c.startTime + c.duration - e), r = n / c.duration || 0, o = 1 - r, a = 0, u = c.tweens.length; u > a; a++)c.tweens[a].run(o);
                return s.notifyWith(t, [c, o, n]), 1 > o && u ? n : (s.resolveWith(t, [c]), !1);
            },
            c = s.promise({
                elem: t,
                props: oe.extend({}, e),
                opts: oe.extend(!0, { specialEasing: {} }, n),
                originalProperties: e,
                originalOptions: n,
                startTime: Cn || L(),
                duration: n.duration,
                tweens: [],
                createTween: function(e, n) {
                    var r = oe.Tween(t, c.opts, e, n, c.opts.specialEasing[e] || c.opts.easing);
                    return c.tweens.push(r), r;
                },
                stop: function(e) {
                    var n = 0, r = e ? c.tweens.length : 0;
                    if (i)return this;
                    for (i = !0; r > n; n++)c.tweens[n].run(1);
                    return e ? s.resolveWith(t, [c, e]) : s.rejectWith(t, [c, e]), this;
                }
            }),
            l = c.props;
        for (F(l, c.opts.specialEasing); a > o; o++)if (r = Ln[o].call(c, t, l, c.opts))return r;
        return oe.map(l, j, c), oe.isFunction(c.opts.start) && c.opts.start.call(t, c), oe.fx.timer(oe.extend(u, { elem: t, anim: c, queue: c.opts.queue })), c.progress(c.opts.progress).done(c.opts.done, c.opts.complete).fail(c.opts.fail).always(c.opts.always);
    }

    function F(t, e) {
        var n, r, i, o, a;
        for (n in t)
            if (r = oe.camelCase(n), i = e[r], o = t[n], oe.isArray(o) && (i = o[1], o = t[n] = o[0]), n !== r && (t[r] = o, delete t[n]), a = oe.cssHooks[r], a && "expand" in a) {
                o = a.expand(o), delete t[r];
                for (n in o)n in t || (t[n] = o[n], e[n] = i);
            } else e[r] = i;
    }

    function P(t, n, r) {
        var i, o, a, s, u, c, l = this, f = {}, h = t.style, d = t.nodeType && b(t), p = me.get(t, "fxshow");
        r.queue || (u = oe._queueHooks(t, "fx"), null == u.unqueued && (u.unqueued = 0, c = u.empty.fire, u.empty.fire = function() { u.unqueued || c(); }), u.unqueued++, l.always(function() { l.always(function() { u.unqueued--, oe.queue(t, "fx").length || u.empty.fire(); }); })), 1 === t.nodeType && ("height" in n || "width" in n) && (r.overflow = [h.overflow, h.overflowX, h.overflowY], "inline" === oe.css(t, "display") && "none" === oe.css(t, "float") && (h.display = "inline-block")), r.overflow && (h.overflow = "hidden", l.always(function() { h.overflow = r.overflow[0], h.overflowX = r.overflow[1], h.overflowY = r.overflow[2]; }));
        for (i in n)
            if (o = n[i], $n.exec(o)) {
                if (delete n[i], a = a || "toggle" === o, o === (d ? "hide" : "show")) {
                    if ("show" !== o || !p || p[i] === e)continue;
                    d = !0;
                }
                f[i] = p && p[i] || oe.style(t, i);
            }
        if (!oe.isEmptyObject(f)) {
            p ? "hidden" in p && (d = p.hidden) : p = me.access(t, "fxshow", {}), a && (p.hidden = !d), d ? oe(t).show() : l.done(function() { oe(t).hide(); }), l.done(function() {
                var e;
                me.remove(t, "fxshow");
                for (e in f)oe.style(t, e, f[e]);
            });
            for (i in f)s = j(d ? p[i] : 0, i, l), i in p || (p[i] = s.start, d && (s.end = s.start, s.start = "width" === i || "height" === i ? 1 : 0));
        }
    }

    function R(t, e, n, r, i) { return new R.prototype.init(t, e, n, r, i); }

    function z(t, e) {
        var n, r = { height: t }, i = 0;
        for (e = e ? 1 : 0; 4 > i; i += 2 - e)n = Je[i], r["margin" + n] = r["padding" + n] = t;
        return e && (r.opacity = r.width = t), r;
    }

    function I(t) { return oe.isWindow(t) ? t : 9 === t.nodeType && t.defaultView; }

    var q, H, Y = typeof e, B = t.location, U = t.document, W = U.documentElement, V = t.jQuery, X = t.$, Z = {}, G = [], K = "2.0.3", J = G.concat, Q = G.push, te = G.slice, ee = G.indexOf, ne = Z.toString, re = Z.hasOwnProperty, ie = K.trim, oe = function(t, e) { return new oe.fn.init(t, e, q); }, ae = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, se = /\S+/g, ue = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, ce = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, le = /^-ms-/, fe = /-([\da-z])/gi, he = function(t, e) { return e.toUpperCase(); }, de = function() { U.removeEventListener("DOMContentLoaded", de, !1), t.removeEventListener("load", de, !1), oe.ready(); };
    oe.fn = oe.prototype = {
        jquery: K,
        constructor: oe,
        init: function(t, n, r) {
            var i, o;
            if (!t)return this;
            if ("string" == typeof t) {
                if (i = "<" === t.charAt(0) && ">" === t.charAt(t.length - 1) && t.length >= 3 ? [null, t, null] : ue.exec(t), !i || !i[1] && n)return!n || n.jquery ? (n || r).find(t) : this.constructor(n).find(t);
                if (i[1]) {
                    if (n = n instanceof oe ? n[0] : n, oe.merge(this, oe.parseHTML(i[1], n && n.nodeType ? n.ownerDocument || n : U, !0)), ce.test(i[1]) && oe.isPlainObject(n))for (i in n)oe.isFunction(this[i]) ? this[i](n[i]) : this.attr(i, n[i]);
                    return this;
                }
                return o = U.getElementById(i[2]), o && o.parentNode && (this.length = 1, this[0] = o), this.context = U, this.selector = t, this;
            }
            return t.nodeType ? (this.context = this[0] = t, this.length = 1, this) : oe.isFunction(t) ? r.ready(t) : (t.selector !== e && (this.selector = t.selector, this.context = t.context), oe.makeArray(t, this));
        },
        selector: "",
        length: 0,
        toArray: function() { return te.call(this); },
        get: function(t) { return null == t ? this.toArray() : 0 > t ? this[this.length + t] : this[t]; },
        pushStack: function(t) {
            var e = oe.merge(this.constructor(), t);
            return e.prevObject = this, e.context = this.context, e;
        },
        each: function(t, e) { return oe.each(this, t, e); },
        ready: function(t) { return oe.ready.promise().done(t), this; },
        slice: function() { return this.pushStack(te.apply(this, arguments)); },
        first: function() { return this.eq(0); },
        last: function() { return this.eq(-1); },
        eq: function(t) {
            var e = this.length, n = +t + (0 > t ? e : 0);
            return this.pushStack(n >= 0 && e > n ? [this[n]] : []);
        },
        map: function(t) { return this.pushStack(oe.map(this, function(e, n) { return t.call(e, n, e); })); },
        end: function() { return this.prevObject || this.constructor(null); },
        push: Q,
        sort: [].sort,
        splice: [].splice
    }, oe.fn.init.prototype = oe.fn, oe.extend = oe.fn.extend = function() {
        var t, n, r, i, o, a, s = arguments[0] || {}, u = 1, c = arguments.length, l = !1;
        for ("boolean" == typeof s && (l = s, s = arguments[1] || {}, u = 2), "object" == typeof s || oe.isFunction(s) || (s = {}), c === u && (s = this, --u); c > u; u++)if (null != (t = arguments[u]))for (n in t)r = s[n], i = t[n], s !== i && (l && i && (oe.isPlainObject(i) || (o = oe.isArray(i))) ? (o ? (o = !1, a = r && oe.isArray(r) ? r : []) : a = r && oe.isPlainObject(r) ? r : {}, s[n] = oe.extend(l, a, i)) : i !== e && (s[n] = i));
        return s;
    }, oe.extend({
        expando: "jQuery" + (K + Math.random()).replace(/\D/g, ""),
        noConflict: function(e) { return t.$ === oe && (t.$ = X), e && t.jQuery === oe && (t.jQuery = V), oe; },
        isReady: !1,
        readyWait: 1,
        holdReady: function(t) { t ? oe.readyWait++ : oe.ready(!0); },
        ready: function(t) { (t === !0 ? --oe.readyWait : oe.isReady) || (oe.isReady = !0, t !== !0 && --oe.readyWait > 0 || (H.resolveWith(U, [oe]), oe.fn.trigger && oe(U).trigger("ready").off("ready"))); },
        isFunction: function(t) { return"function" === oe.type(t); },
        isArray: Array.isArray,
        isWindow: function(t) { return null != t && t === t.window; },
        isNumeric: function(t) { return!isNaN(parseFloat(t)) && isFinite(t); },
        type: function(t) { return null == t ? String(t) : "object" == typeof t || "function" == typeof t ? Z[ne.call(t)] || "object" : typeof t; },
        isPlainObject: function(t) {
            if ("object" !== oe.type(t) || t.nodeType || oe.isWindow(t))return!1;
            try {
                if (t.constructor && !re.call(t.constructor.prototype, "isPrototypeOf"))return!1;
            } catch (e) {
                return!1;
            }
            return!0;
        },
        isEmptyObject: function(t) {
            var e;
            for (e in t)return!1;
            return!0;
        },
        error: function(t) { throw new Error(t); },
        parseHTML: function(t, e, n) {
            if (!t || "string" != typeof t)return null;
            "boolean" == typeof e && (n = e, e = !1), e = e || U;
            var r = ce.exec(t), i = !n && [];
            return r ? [e.createElement(r[1])] : (r = oe.buildFragment([t], e, i), i && oe(i).remove(), oe.merge([], r.childNodes));
        },
        parseJSON: JSON.parse,
        parseXML: function(t) {
            var n, r;
            if (!t || "string" != typeof t)return null;
            try {
                r = new DOMParser, n = r.parseFromString(t, "text/xml");
            } catch (i) {
                n = e;
            }
            return(!n || n.getElementsByTagName("parsererror").length) && oe.error("Invalid XML: " + t), n;
        },
        noop: function() {},
        globalEval: function(t) {
            var e, n = eval;
            t = oe.trim(t), t && (1 === t.indexOf("use strict") ? (e = U.createElement("script"), e.text = t, U.head.appendChild(e).parentNode.removeChild(e)) : n(t));
        },
        camelCase: function(t) { return t.replace(le, "ms-").replace(fe, he); },
        nodeName: function(t, e) { return t.nodeName && t.nodeName.toLowerCase() === e.toLowerCase(); },
        each: function(t, e, r) {
            var i, o = 0, a = t.length, s = n(t);
            if (r) {
                if (s)for (; a > o && (i = e.apply(t[o], r), i !== !1); o++);
                else for (o in t)if (i = e.apply(t[o], r), i === !1)break;
            } else if (s)for (; a > o && (i = e.call(t[o], o, t[o]), i !== !1); o++);
            else for (o in t)if (i = e.call(t[o], o, t[o]), i === !1)break;
            return t;
        },
        trim: function(t) { return null == t ? "" : ie.call(t); },
        makeArray: function(t, e) {
            var r = e || [];
            return null != t && (n(Object(t)) ? oe.merge(r, "string" == typeof t ? [t] : t) : Q.call(r, t)), r;
        },
        inArray: function(t, e, n) { return null == e ? -1 : ee.call(e, t, n); },
        merge: function(t, n) {
            var r = n.length, i = t.length, o = 0;
            if ("number" == typeof r)for (; r > o; o++)t[i++] = n[o];
            else for (; n[o] !== e;)t[i++] = n[o++];
            return t.length = i, t;
        },
        grep: function(t, e, n) {
            var r, i = [], o = 0, a = t.length;
            for (n = !!n; a > o; o++)r = !!e(t[o], o), n !== r && i.push(t[o]);
            return i;
        },
        map: function(t, e, r) {
            var i, o = 0, a = t.length, s = n(t), u = [];
            if (s)for (; a > o; o++)i = e(t[o], o, r), null != i && (u[u.length] = i);
            else for (o in t)i = e(t[o], o, r), null != i && (u[u.length] = i);
            return J.apply([], u);
        },
        guid: 1,
        proxy: function(t, n) {
            var r, i, o;
            return"string" == typeof n && (r = t[n], n = t, t = r), oe.isFunction(t) ? (i = te.call(arguments, 2), o = function() { return t.apply(n || this, i.concat(te.call(arguments))); }, o.guid = t.guid = t.guid || oe.guid++, o) : e;
        },
        access: function(t, n, r, i, o, a, s) {
            var u = 0, c = t.length, l = null == r;
            if ("object" === oe.type(r)) {
                o = !0;
                for (u in r)oe.access(t, n, u, r[u], !0, a, s);
            } else if (i !== e && (o = !0, oe.isFunction(i) || (s = !0), l && (s ? (n.call(t, i), n = null) : (l = n, n = function(t, e, n) { return l.call(oe(t), n); })), n))for (; c > u; u++)n(t[u], r, s ? i : i.call(t[u], u, n(t[u], r)));
            return o ? t : l ? n.call(t) : c ? n(t[0], r) : a;
        },
        now: Date.now,
        swap: function(t, e, n, r) {
            var i, o, a = {};
            for (o in e)a[o] = t.style[o], t.style[o] = e[o];
            i = n.apply(t, r || []);
            for (o in e)t.style[o] = a[o];
            return i;
        }
    }), oe.ready.promise = function(e) { return H || (H = oe.Deferred(), "complete" === U.readyState ? setTimeout(oe.ready) : (U.addEventListener("DOMContentLoaded", de, !1), t.addEventListener("load", de, !1))), H.promise(e); }, oe.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(t, e) { Z["[object " + e + "]"] = e.toLowerCase(); }), q = oe(U), function(t, e) {

        function n(t, e, n, r) {
            var i, o, a, s, u, c, l, f, p, g;
            if ((e ? e.ownerDocument || e : I) !== N && A(e), e = e || N, n = n || [], !t || "string" != typeof t)return n;
            if (1 !== (s = e.nodeType) && 9 !== s)return[];
            if (j && !r) {
                if (i = be.exec(t))
                    if (a = i[1]) {
                        if (9 === s) {
                            if (o = e.getElementById(a), !o || !o.parentNode)return n;
                            if (o.id === a)return n.push(o), n;
                        } else if (e.ownerDocument && (o = e.ownerDocument.getElementById(a)) && R(e, o) && o.id === a)return n.push(o), n;
                    } else {
                        if (i[2])return te.apply(n, e.getElementsByTagName(t)), n;
                        if ((a = i[3]) && M.getElementsByClassName && e.getElementsByClassName)return te.apply(n, e.getElementsByClassName(a)), n;
                    }
                if (M.qsa && (!O || !O.test(t))) {
                    if (f = l = z, p = e, g = 9 === s && t, 1 === s && "object" !== e.nodeName.toLowerCase()) {
                        for (c = h(t), (l = e.getAttribute("id")) ? f = l.replace(_e, "\\$&") : e.setAttribute("id", f), f = "[id='" + f + "'] ", u = c.length; u--;)c[u] = f + d(c[u]);
                        p = de.test(t) && e.parentNode || e, g = c.join(",");
                    }
                    if (g)
                        try {
                            return te.apply(n, p.querySelectorAll(g)), n;
                        } catch (m) {
                        } finally {
                            l || e.removeAttribute("id");
                        }
                }
            }
            return w(t.replace(le, "$1"), e, n, r);
        }

        function r() {

            function t(n, r) { return e.push(n += " ") > S.cacheLength && delete t[e.shift()], t[n] = r; }

            var e = [];
            return t;
        }

        function i(t) { return t[z] = !0, t; }

        function o(t) {
            var e = N.createElement("div");
            try {
                return!!t(e);
            } catch (n) {
                return!1;
            } finally {
                e.parentNode && e.parentNode.removeChild(e), e = null;
            }
        }

        function a(t, e) { for (var n = t.split("|"), r = t.length; r--;)S.attrHandle[n[r]] = e; }

        function s(t, e) {
            var n = e && t, r = n && 1 === t.nodeType && 1 === e.nodeType && (~e.sourceIndex || Z) - (~t.sourceIndex || Z);
            if (r)return r;
            if (n)for (; n = n.nextSibling;)if (n === e)return-1;
            return t ? 1 : -1;
        }

        function u(t) {
            return function(e) {
                var n = e.nodeName.toLowerCase();
                return"input" === n && e.type === t;
            };
        }

        function c(t) {
            return function(e) {
                var n = e.nodeName.toLowerCase();
                return("input" === n || "button" === n) && e.type === t;
            };
        }

        function l(t) { return i(function(e) { return e = +e, i(function(n, r) { for (var i, o = t([], n.length, e), a = o.length; a--;)n[i = o[a]] && (n[i] = !(r[i] = n[i])); }); }); }

        function f() {}

        function h(t, e) {
            var r, i, o, a, s, u, c, l = B[t + " "];
            if (l)return e ? 0 : l.slice(0);
            for (s = t, u = [], c = S.preFilter; s;) {
                (!r || (i = fe.exec(s))) && (i && (s = s.slice(i[0].length) || s), u.push(o = [])), r = !1, (i = he.exec(s)) && (r = i.shift(), o.push({ value: r, type: i[0].replace(le, " ") }), s = s.slice(r.length));
                for (a in S.filter)!(i = ve[a].exec(s)) || c[a] && !(i = c[a](i)) || (r = i.shift(), o.push({ value: r, type: a, matches: i }), s = s.slice(r.length));
                if (!r)break;
            }
            return e ? s.length : s ? n.error(t) : B(t, u).slice(0);
        }

        function d(t) {
            for (var e = 0, n = t.length, r = ""; n > e; e++)r += t[e].value;
            return r;
        }

        function p(t, e, n) {
            var r = e.dir, i = n && "parentNode" === r, o = H++;
            return e.first ? function(e, n, o) { for (; e = e[r];)if (1 === e.nodeType || i)return t(e, n, o); } : function(e, n, a) {
                var s, u, c, l = q + " " + o;
                if (a) {
                    for (; e = e[r];)if ((1 === e.nodeType || i) && t(e, n, a))return!0;
                } else
                    for (; e = e[r];)
                        if (1 === e.nodeType || i)
                            if (c = e[z] || (e[z] = {}), (u = c[r]) && u[0] === l) {
                                if ((s = u[1]) === !0 || s === k)return s === !0;
                            } else if (u = c[r] = [l], u[1] = t(e, n, a) || k, u[1] === !0)return!0;
            };
        }

        function g(t) {
            return t.length > 1 ? function(e, n, r) {
                for (var i = t.length; i--;)if (!t[i](e, n, r))return!1;
                return!0;
            } : t[0];
        }

        function m(t, e, n, r, i) {
            for (var o, a = [], s = 0, u = t.length, c = null != e; u > s; s++)(o = t[s]) && (!n || n(o, r, i)) && (a.push(o), c && e.push(s));
            return a;
        }

        function v(t, e, n, r, o, a) {
            return r && !r[z] && (r = v(r)), o && !o[z] && (o = v(o, a)), i(function(i, a, s, u) {
                var c, l, f, h = [], d = [], p = a.length, g = i || x(e || "*", s.nodeType ? [s] : s, []), v = !t || !i && e ? g : m(g, h, t, s, u), y = n ? o || (i ? t : p || r) ? [] : a : v;
                if (n && n(v, y, s, u), r)for (c = m(y, d), r(c, [], s, u), l = c.length; l--;)(f = c[l]) && (y[d[l]] = !(v[d[l]] = f));
                if (i) {
                    if (o || t) {
                        if (o) {
                            for (c = [], l = y.length; l--;)(f = y[l]) && c.push(v[l] = f);
                            o(null, y = [], c, u);
                        }
                        for (l = y.length; l--;)(f = y[l]) && (c = o ? ne.call(i, f) : h[l]) > -1 && (i[c] = !(a[c] = f));
                    }
                } else y = m(y === a ? y.splice(p, y.length) : y), o ? o(null, a, y, u) : te.apply(a, y);
            });
        }

        function y(t) {
            for (var e, n, r, i = t.length, o = S.relative[t[0].type], a = o || S.relative[" "], s = o ? 1 : 0, u = p(function(t) { return t === e; }, a, !0), c = p(function(t) { return ne.call(e, t) > -1; }, a, !0), l = [function(t, n, r) { return!o && (r || n !== D) || ((e = n).nodeType ? u(t, n, r) : c(t, n, r)); }]; i > s; s++)
                if (n = S.relative[t[s].type])l = [p(g(l), n)];
                else {
                    if (n = S.filter[t[s].type].apply(null, t[s].matches), n[z]) {
                        for (r = ++s; i > r && !S.relative[t[r].type]; r++);
                        return v(s > 1 && g(l), s > 1 && d(t.slice(0, s - 1).concat({ value: " " === t[s - 2].type ? "*" : "" })).replace(le, "$1"), n, r > s && y(t.slice(s, r)), i > r && y(t = t.slice(r)), i > r && d(t));
                    }
                    l.push(n);
                }
            return g(l);
        }

        function b(t, e) {
            var r = 0,
                o = e.length > 0,
                a = t.length > 0,
                s = function(i, s, u, c, l) {
                    var f, h, d, p = [], g = 0, v = "0", y = i && [], b = null != l, x = D, w = i || a && S.find.TAG("*", l && s.parentNode || s), _ = q += null == x ? 1 : Math.random() || .1;
                    for (b && (D = s !== N && s, k = r); null != (f = w[v]); v++) {
                        if (a && f) {
                            for (h = 0; d = t[h++];)
                                if (d(f, s, u)) {
                                    c.push(f);
                                    break;
                                }
                            b && (q = _, k = ++r);
                        }
                        o && ((f = !d && f) && g--, i && y.push(f));
                    }
                    if (g += v, o && v !== g) {
                        for (h = 0; d = e[h++];)d(y, p, s, u);
                        if (i) {
                            if (g > 0)for (; v--;)y[v] || p[v] || (p[v] = J.call(c));
                            p = m(p);
                        }
                        te.apply(c, p), b && !i && p.length > 0 && g + e.length > 1 && n.uniqueSort(c);
                    }
                    return b && (q = _, D = x), y;
                };
            return o ? i(s) : s;
        }

        function x(t, e, r) {
            for (var i = 0, o = e.length; o > i; i++)n(t, e[i], r);
            return r;
        }

        function w(t, e, n, r) {
            var i, o, a, s, u, c = h(t);
            if (!r && 1 === c.length) {
                if (o = c[0] = c[0].slice(0), o.length > 2 && "ID" === (a = o[0]).type && M.getById && 9 === e.nodeType && j && S.relative[o[1].type]) {
                    if (e = (S.find.ID(a.matches[0].replace(Me, ke), e) || [])[0], !e)return n;
                    t = t.slice(o.shift().value.length);
                }
                for (i = ve.needsContext.test(t) ? 0 : o.length; i-- && (a = o[i], !S.relative[s = a.type]);)
                    if ((u = S.find[s]) && (r = u(a.matches[0].replace(Me, ke), de.test(o[0].type) && e.parentNode || e))) {
                        if (o.splice(i, 1), t = r.length && d(o), !t)return te.apply(n, r), n;
                        break;
                    }
            }
            return C(t, c)(r, e, !j, n, de.test(t)), n;
        }

        var _,
            M,
            k,
            S,
            T,
            E,
            C,
            D,
            $,
            A,
            N,
            L,
            j,
            O,
            F,
            P,
            R,
            z = "sizzle" + -new Date,
            I = t.document,
            q = 0,
            H = 0,
            Y = r(),
            B = r(),
            U = r(),
            W = !1,
            V = function(t, e) { return t === e ? (W = !0, 0) : 0; },
            X = typeof e,
            Z = 1 << 31,
            G = {}.hasOwnProperty,
            K = [],
            J = K.pop,
            Q = K.push,
            te = K.push,
            ee = K.slice,
            ne = K.indexOf || function(t) {
                for (var e = 0, n = this.length; n > e; e++)if (this[e] === t)return e;
                return-1;
            },
            re = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
            ie = "[\\x20\\t\\r\\n\\f]",
            ae = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
            se = ae.replace("w", "w#"),
            ue = "\\[" + ie + "*(" + ae + ")" + ie + "*(?:([*^$|!~]?=)" + ie + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + se + ")|)|)" + ie + "*\\]",
            ce = ":(" + ae + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + ue.replace(3, 8) + ")*)|.*)\\)|)",
            le = new RegExp("^" + ie + "+|((?:^|[^\\\\])(?:\\\\.)*)" + ie + "+$", "g"),
            fe = new RegExp("^" + ie + "*," + ie + "*"),
            he = new RegExp("^" + ie + "*([>+~]|" + ie + ")" + ie + "*"),
            de = new RegExp(ie + "*[+~]"),
            pe = new RegExp("=" + ie + "*([^\\]'\"]*)" + ie + "*\\]", "g"),
            ge = new RegExp(ce),
            me = new RegExp("^" + se + "$"),
            ve = { ID: new RegExp("^#(" + ae + ")"), CLASS: new RegExp("^\\.(" + ae + ")"), TAG: new RegExp("^(" + ae.replace("w", "w*") + ")"), ATTR: new RegExp("^" + ue), PSEUDO: new RegExp("^" + ce), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + ie + "*(even|odd|(([+-]|)(\\d*)n|)" + ie + "*(?:([+-]|)" + ie + "*(\\d+)|))" + ie + "*\\)|)", "i"), bool: new RegExp("^(?:" + re + ")$", "i"), needsContext: new RegExp("^" + ie + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + ie + "*((?:-\\d)?\\d*)" + ie + "*\\)|)(?=[^-]|$)", "i") },
            ye = /^[^{]+\{\s*\[native \w/,
            be = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            xe = /^(?:input|select|textarea|button)$/i,
            we = /^h\d$/i,
            _e = /'|\\/g,
            Me = new RegExp("\\\\([\\da-f]{1,6}" + ie + "?|(" + ie + ")|.)", "ig"),
            ke = function(t, e, n) {
                var r = "0x" + e - 65536;
                return r !== r || n ? e : 0 > r ? String.fromCharCode(r + 65536) : String.fromCharCode(55296 | r >> 10, 56320 | 1023 & r);
            };
        try {
            te.apply(K = ee.call(I.childNodes), I.childNodes), K[I.childNodes.length].nodeType;
        } catch (Se) {
            te = {
                apply: K.length ? function(t, e) { Q.apply(t, ee.call(e)); } : function(t, e) {
                    for (var n = t.length, r = 0; t[n++] = e[r++];);
                    t.length = n - 1;
                }
            };
        }
        E = n.isXML = function(t) {
            var e = t && (t.ownerDocument || t).documentElement;
            return e ? "HTML" !== e.nodeName : !1;
        }, M = n.support = {}, A = n.setDocument = function(t) {
            var e = t ? t.ownerDocument || t : I, n = e.defaultView;
            return e !== N && 9 === e.nodeType && e.documentElement ? (N = e, L = e.documentElement, j = !E(e), n && n.attachEvent && n !== n.top && n.attachEvent("onbeforeunload", function() { A(); }), M.attributes = o(function(t) { return t.className = "i", !t.getAttribute("className"); }), M.getElementsByTagName = o(function(t) { return t.appendChild(e.createComment("")), !t.getElementsByTagName("*").length; }), M.getElementsByClassName = o(function(t) { return t.innerHTML = "<div class='a'></div><div class='a i'></div>", t.firstChild.className = "i", 2 === t.getElementsByClassName("i").length; }), M.getById = o(function(t) { return L.appendChild(t).id = z, !e.getElementsByName || !e.getElementsByName(z).length; }), M.getById ? (S.find.ID = function(t, e) {
                if (typeof e.getElementById !== X && j) {
                    var n = e.getElementById(t);
                    return n && n.parentNode ? [n] : [];
                }
            }, S.filter.ID = function(t) {
                var e = t.replace(Me, ke);
                return function(t) { return t.getAttribute("id") === e; };
            }) : (delete S.find.ID, S.filter.ID = function(t) {
                var e = t.replace(Me, ke);
                return function(t) {
                    var n = typeof t.getAttributeNode !== X && t.getAttributeNode("id");
                    return n && n.value === e;
                };
            }), S.find.TAG = M.getElementsByTagName ? function(t, e) { return typeof e.getElementsByTagName !== X ? e.getElementsByTagName(t) : void 0; } : function(t, e) {
                var n, r = [], i = 0, o = e.getElementsByTagName(t);
                if ("*" === t) {
                    for (; n = o[i++];)1 === n.nodeType && r.push(n);
                    return r;
                }
                return o;
            }, S.find.CLASS = M.getElementsByClassName && function(t, e) { return typeof e.getElementsByClassName !== X && j ? e.getElementsByClassName(t) : void 0; }, F = [], O = [], (M.qsa = ye.test(e.querySelectorAll)) && (o(function(t) { t.innerHTML = "<select><option selected=''></option></select>", t.querySelectorAll("[selected]").length || O.push("\\[" + ie + "*(?:value|" + re + ")"), t.querySelectorAll(":checked").length || O.push(":checked"); }), o(function(t) {
                var n = e.createElement("input");
                n.setAttribute("type", "hidden"), t.appendChild(n).setAttribute("t", ""), t.querySelectorAll("[t^='']").length && O.push("[*^$]=" + ie + "*(?:''|\"\")"), t.querySelectorAll(":enabled").length || O.push(":enabled", ":disabled"), t.querySelectorAll("*,:x"), O.push(",.*:");
            })), (M.matchesSelector = ye.test(P = L.webkitMatchesSelector || L.mozMatchesSelector || L.oMatchesSelector || L.msMatchesSelector)) && o(function(t) { M.disconnectedMatch = P.call(t, "div"), P.call(t, "[s!='']:x"), F.push("!=", ce); }), O = O.length && new RegExp(O.join("|")), F = F.length && new RegExp(F.join("|")), R = ye.test(L.contains) || L.compareDocumentPosition ? function(t, e) {
                var n = 9 === t.nodeType ? t.documentElement : t, r = e && e.parentNode;
                return t === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : t.compareDocumentPosition && 16 & t.compareDocumentPosition(r)));
            } : function(t, e) {
                if (e)for (; e = e.parentNode;)if (e === t)return!0;
                return!1;
            }, V = L.compareDocumentPosition ? function(t, n) {
                if (t === n)return W = !0, 0;
                var r = n.compareDocumentPosition && t.compareDocumentPosition && t.compareDocumentPosition(n);
                return r ? 1 & r || !M.sortDetached && n.compareDocumentPosition(t) === r ? t === e || R(I, t) ? -1 : n === e || R(I, n) ? 1 : $ ? ne.call($, t) - ne.call($, n) : 0 : 4 & r ? -1 : 1 : t.compareDocumentPosition ? -1 : 1;
            } : function(t, n) {
                var r, i = 0, o = t.parentNode, a = n.parentNode, u = [t], c = [n];
                if (t === n)return W = !0, 0;
                if (!o || !a)return t === e ? -1 : n === e ? 1 : o ? -1 : a ? 1 : $ ? ne.call($, t) - ne.call($, n) : 0;
                if (o === a)return s(t, n);
                for (r = t; r = r.parentNode;)u.unshift(r);
                for (r = n; r = r.parentNode;)c.unshift(r);
                for (; u[i] === c[i];)i++;
                return i ? s(u[i], c[i]) : u[i] === I ? -1 : c[i] === I ? 1 : 0;
            }, e) : N;
        }, n.matches = function(t, e) { return n(t, null, null, e); }, n.matchesSelector = function(t, e) {
            if ((t.ownerDocument || t) !== N && A(t), e = e.replace(pe, "='$1']"), !(!M.matchesSelector || !j || F && F.test(e) || O && O.test(e)))
                try {
                    var r = P.call(t, e);
                    if (r || M.disconnectedMatch || t.document && 11 !== t.document.nodeType)return r;
                } catch (i) {
                }
            return n(e, N, null, [t]).length > 0;
        }, n.contains = function(t, e) { return(t.ownerDocument || t) !== N && A(t), R(t, e); }, n.attr = function(t, n) {
            (t.ownerDocument || t) !== N && A(t);
            var r = S.attrHandle[n.toLowerCase()], i = r && G.call(S.attrHandle, n.toLowerCase()) ? r(t, n, !j) : e;
            return i === e ? M.attributes || !j ? t.getAttribute(n) : (i = t.getAttributeNode(n)) && i.specified ? i.value : null : i;
        }, n.error = function(t) { throw new Error("Syntax error, unrecognized expression: " + t); }, n.uniqueSort = function(t) {
            var e, n = [], r = 0, i = 0;
            if (W = !M.detectDuplicates, $ = !M.sortStable && t.slice(0), t.sort(V), W) {
                for (; e = t[i++];)e === t[i] && (r = n.push(i));
                for (; r--;)t.splice(n[r], 1);
            }
            return t;
        }, T = n.getText = function(t) {
            var e, n = "", r = 0, i = t.nodeType;
            if (i) {
                if (1 === i || 9 === i || 11 === i) {
                    if ("string" == typeof t.textContent)return t.textContent;
                    for (t = t.firstChild; t; t = t.nextSibling)n += T(t);
                } else if (3 === i || 4 === i)return t.nodeValue;
            } else for (; e = t[r]; r++)n += T(e);
            return n;
        }, S = n.selectors = {
            cacheLength: 50,
            createPseudo: i,
            match: ve,
            attrHandle: {},
            find: {},
            relative: { ">": { dir: "parentNode", first: !0 }, " ": { dir: "parentNode" }, "+": { dir: "previousSibling", first: !0 }, "~": { dir: "previousSibling" } },
            preFilter: {
                ATTR: function(t) { return t[1] = t[1].replace(Me, ke), t[3] = (t[4] || t[5] || "").replace(Me, ke), "~=" === t[2] && (t[3] = " " + t[3] + " "), t.slice(0, 4); },
                CHILD: function(t) { return t[1] = t[1].toLowerCase(), "nth" === t[1].slice(0, 3) ? (t[3] || n.error(t[0]), t[4] = +(t[4] ? t[5] + (t[6] || 1) : 2 * ("even" === t[3] || "odd" === t[3])), t[5] = +(t[7] + t[8] || "odd" === t[3])) : t[3] && n.error(t[0]), t; },
                PSEUDO: function(t) {
                    var n, r = !t[5] && t[2];
                    return ve.CHILD.test(t[0]) ? null : (t[3] && t[4] !== e ? t[2] = t[4] : r && ge.test(r) && (n = h(r, !0)) && (n = r.indexOf(")", r.length - n) - r.length) && (t[0] = t[0].slice(0, n), t[2] = r.slice(0, n)), t.slice(0, 3));
                }
            },
            filter: {
                TAG: function(t) {
                    var e = t.replace(Me, ke).toLowerCase();
                    return"*" === t ? function() { return!0; } : function(t) { return t.nodeName && t.nodeName.toLowerCase() === e; };
                },
                CLASS: function(t) {
                    var e = Y[t + " "];
                    return e || (e = new RegExp("(^|" + ie + ")" + t + "(" + ie + "|$)")) && Y(t, function(t) { return e.test("string" == typeof t.className && t.className || typeof t.getAttribute !== X && t.getAttribute("class") || ""); });
                },
                ATTR: function(t, e, r) {
                    return function(i) {
                        var o = n.attr(i, t);
                        return null == o ? "!=" === e : e ? (o += "", "=" === e ? o === r : "!=" === e ? o !== r : "^=" === e ? r && 0 === o.indexOf(r) : "*=" === e ? r && o.indexOf(r) > -1 : "$=" === e ? r && o.slice(-r.length) === r : "~=" === e ? (" " + o + " ").indexOf(r) > -1 : "|=" === e ? o === r || o.slice(0, r.length + 1) === r + "-" : !1) : !0;
                    };
                },
                CHILD: function(t, e, n, r, i) {
                    var o = "nth" !== t.slice(0, 3), a = "last" !== t.slice(-4), s = "of-type" === e;
                    return 1 === r && 0 === i ? function(t) { return!!t.parentNode; } : function(e, n, u) {
                        var c, l, f, h, d, p, g = o !== a ? "nextSibling" : "previousSibling", m = e.parentNode, v = s && e.nodeName.toLowerCase(), y = !u && !s;
                        if (m) {
                            if (o) {
                                for (; g;) {
                                    for (f = e; f = f[g];)if (s ? f.nodeName.toLowerCase() === v : 1 === f.nodeType)return!1;
                                    p = g = "only" === t && !p && "nextSibling";
                                }
                                return!0;
                            }
                            if (p = [a ? m.firstChild : m.lastChild], a && y) {
                                for (l = m[z] || (m[z] = {}), c = l[t] || [], d = c[0] === q && c[1], h = c[0] === q && c[2], f = d && m.childNodes[d]; f = ++d && f && f[g] || (h = d = 0) || p.pop();)
                                    if (1 === f.nodeType && ++h && f === e) {
                                        l[t] = [q, d, h];
                                        break;
                                    }
                            } else if (y && (c = (e[z] || (e[z] = {}))[t]) && c[0] === q)h = c[1];
                            else for (; (f = ++d && f && f[g] || (h = d = 0) || p.pop()) && ((s ? f.nodeName.toLowerCase() !== v : 1 !== f.nodeType) || !++h || (y && ((f[z] || (f[z] = {}))[t] = [q, h]), f !== e)););
                            return h -= i, h === r || 0 === h % r && h / r >= 0;
                        }
                    };
                },
                PSEUDO: function(t, e) {
                    var r, o = S.pseudos[t] || S.setFilters[t.toLowerCase()] || n.error("unsupported pseudo: " + t);
                    return o[z] ? o(e) : o.length > 1 ? (r = [t, t, "", e], S.setFilters.hasOwnProperty(t.toLowerCase()) ? i(function(t, n) { for (var r, i = o(t, e), a = i.length; a--;)r = ne.call(t, i[a]), t[r] = !(n[r] = i[a]); }) : function(t) { return o(t, 0, r); }) : o;
                }
            },
            pseudos: {
                not: i(function(t) {
                    var e = [], n = [], r = C(t.replace(le, "$1"));
                    return r[z] ? i(function(t, e, n, i) { for (var o, a = r(t, null, i, []), s = t.length; s--;)(o = a[s]) && (t[s] = !(e[s] = o)); }) : function(t, i, o) { return e[0] = t, r(e, null, o, n), !n.pop(); };
                }),
                has: i(function(t) { return function(e) { return n(t, e).length > 0; }; }),
                contains: i(function(t) { return function(e) { return(e.textContent || e.innerText || T(e)).indexOf(t) > -1; }; }),
                lang: i(function(t) {
                    return me.test(t || "") || n.error("unsupported lang: " + t), t = t.replace(Me, ke).toLowerCase(), function(e) {
                        var n;
                        do if (n = j ? e.lang : e.getAttribute("xml:lang") || e.getAttribute("lang"))return n = n.toLowerCase(), n === t || 0 === n.indexOf(t + "-");
                        while ((e = e.parentNode) && 1 === e.nodeType);
                        return!1;
                    };
                }),
                target: function(e) {
                    var n = t.location && t.location.hash;
                    return n && n.slice(1) === e.id;
                },
                root: function(t) { return t === L; },
                focus: function(t) { return t === N.activeElement && (!N.hasFocus || N.hasFocus()) && !!(t.type || t.href || ~t.tabIndex); },
                enabled: function(t) { return t.disabled === !1; },
                disabled: function(t) { return t.disabled === !0; },
                checked: function(t) {
                    var e = t.nodeName.toLowerCase();
                    return"input" === e && !!t.checked || "option" === e && !!t.selected;
                },
                selected: function(t) {
                    return t.parentNode && t.parentNode.selectedIndex, t.selected === !0;
                },
                empty: function(t) {
                    for (t = t.firstChild; t; t = t.nextSibling)if (t.nodeName > "@" || 3 === t.nodeType || 4 === t.nodeType)return!1;
                    return!0;
                },
                parent: function(t) { return!S.pseudos.empty(t); },
                header: function(t) { return we.test(t.nodeName); },
                input: function(t) { return xe.test(t.nodeName); },
                button: function(t) {
                    var e = t.nodeName.toLowerCase();
                    return"input" === e && "button" === t.type || "button" === e;
                },
                text: function(t) {
                    var e;
                    return"input" === t.nodeName.toLowerCase() && "text" === t.type && (null == (e = t.getAttribute("type")) || e.toLowerCase() === t.type);
                },
                first: l(function() { return[0]; }),
                last: l(function(t, e) { return[e - 1]; }),
                eq: l(function(t, e, n) { return[0 > n ? n + e : n]; }),
                even: l(function(t, e) {
                    for (var n = 0; e > n; n += 2)t.push(n);
                    return t;
                }),
                odd: l(function(t, e) {
                    for (var n = 1; e > n; n += 2)t.push(n);
                    return t;
                }),
                lt: l(function(t, e, n) {
                    for (var r = 0 > n ? n + e : n; --r >= 0;)t.push(r);
                    return t;
                }),
                gt: l(function(t, e, n) {
                    for (var r = 0 > n ? n + e : n; ++r < e;)t.push(r);
                    return t;
                })
            }
        }, S.pseudos.nth = S.pseudos.eq;
        for (_ in{ radio: !0, checkbox: !0, file: !0, password: !0, image: !0 })S.pseudos[_] = u(_);
        for (_ in{ submit: !0, reset: !0 })S.pseudos[_] = c(_);
        f.prototype = S.filters = S.pseudos, S.setFilters = new f, C = n.compile = function(t, e) {
            var n, r = [], i = [], o = U[t + " "];
            if (!o) {
                for (e || (e = h(t)), n = e.length; n--;)o = y(e[n]), o[z] ? r.push(o) : i.push(o);
                o = U(t, b(i, r));
            }
            return o;
        }, M.sortStable = z.split("").sort(V).join("") === z, M.detectDuplicates = W, A(), M.sortDetached = o(function(t) { return 1 & t.compareDocumentPosition(N.createElement("div")); }), o(function(t) { return t.innerHTML = "<a href='#'></a>", "#" === t.firstChild.getAttribute("href"); }) || a("type|href|height|width", function(t, e, n) { return n ? void 0 : t.getAttribute(e, "type" === e.toLowerCase() ? 1 : 2); }), M.attributes && o(function(t) { return t.innerHTML = "<input/>", t.firstChild.setAttribute("value", ""), "" === t.firstChild.getAttribute("value"); }) || a("value", function(t, e, n) { return n || "input" !== t.nodeName.toLowerCase() ? void 0 : t.defaultValue; }), o(function(t) { return null == t.getAttribute("disabled"); }) || a(re, function(t, e, n) {
            var r;
            return n ? void 0 : (r = t.getAttributeNode(e)) && r.specified ? r.value : t[e] === !0 ? e.toLowerCase() : null;
        }), oe.find = n, oe.expr = n.selectors, oe.expr[":"] = oe.expr.pseudos, oe.unique = n.uniqueSort, oe.text = n.getText, oe.isXMLDoc = n.isXML, oe.contains = n.contains;
    }(t);
    var pe = {};
    oe.Callbacks = function(t) {
        t = "string" == typeof t ? pe[t] || r(t) : oe.extend({}, t);
        var n,
            i,
            o,
            a,
            s,
            u,
            c = [],
            l = !t.once && [],
            f = function(e) {
                for (n = t.memory && e, i = !0, u = a || 0, a = 0, s = c.length, o = !0; c && s > u; u++)
                    if (c[u].apply(e[0], e[1]) === !1 && t.stopOnFalse) {
                        n = !1;
                        break;
                    }
                o = !1, c && (l ? l.length && f(l.shift()) : n ? c = [] : h.disable());
            },
            h = {
                add: function() {
                    if (c) {
                        var e = c.length;
                        !function r(e) {
                            oe.each(e, function(e, n) {
                                var i = oe.type(n);
                                "function" === i ? t.unique && h.has(n) || c.push(n) : n && n.length && "string" !== i && r(n);
                            });
                        }(arguments), o ? s = c.length : n && (a = e, f(n));
                    }
                    return this;
                },
                remove: function() { return c && oe.each(arguments, function(t, e) { for (var n; (n = oe.inArray(e, c, n)) > -1;)c.splice(n, 1), o && (s >= n && s--, u >= n && u--); }), this; },
                has: function(t) { return t ? oe.inArray(t, c) > -1 : !(!c || !c.length); },
                empty: function() { return c = [], s = 0, this; },
                disable: function() { return c = l = n = e, this; },
                disabled: function() { return!c; },
                lock: function() { return l = e, n || h.disable(), this; },
                locked: function() { return!l; },
                fireWith: function(t, e) { return!c || i && !l || (e = e || [], e = [t, e.slice ? e.slice() : e], o ? l.push(e) : f(e)), this; },
                fire: function() { return h.fireWith(this, arguments), this; },
                fired: function() { return!!i; }
            };
        return h;
    }, oe.extend({
        Deferred: function(t) {
            var e = [["resolve", "done", oe.Callbacks("once memory"), "resolved"], ["reject", "fail", oe.Callbacks("once memory"), "rejected"], ["notify", "progress", oe.Callbacks("memory")]],
                n = "pending",
                r = {
                    state: function() { return n; },
                    always: function() { return i.done(arguments).fail(arguments), this; },
                    then: function() {
                        var t = arguments;
                        return oe.Deferred(function(n) {
                            oe.each(e, function(e, o) {
                                var a = o[0], s = oe.isFunction(t[e]) && t[e];
                                i[o[1]](function() {
                                    var t = s && s.apply(this, arguments);
                                    t && oe.isFunction(t.promise) ? t.promise().done(n.resolve).fail(n.reject).progress(n.notify) : n[a + "With"](this === r ? n.promise() : this, s ? [t] : arguments);
                                });
                            }), t = null;
                        }).promise();
                    },
                    promise: function(t) { return null != t ? oe.extend(t, r) : r; }
                },
                i = {};
            return r.pipe = r.then, oe.each(e, function(t, o) {
                var a = o[2], s = o[3];
                r[o[1]] = a.add, s && a.add(function() { n = s; }, e[1 ^ t][2].disable, e[2][2].lock), i[o[0]] = function() { return i[o[0] + "With"](this === i ? r : this, arguments), this; }, i[o[0] + "With"] = a.fireWith;
            }), r.promise(i), t && t.call(i, i), i;
        },
        when: function(t) {
            var e, n, r, i = 0, o = te.call(arguments), a = o.length, s = 1 !== a || t && oe.isFunction(t.promise) ? a : 0, u = 1 === s ? t : oe.Deferred(), c = function(t, n, r) { return function(i) { n[t] = this, r[t] = arguments.length > 1 ? te.call(arguments) : i, r === e ? u.notifyWith(n, r) : --s || u.resolveWith(n, r); }; };
            if (a > 1)for (e = new Array(a), n = new Array(a), r = new Array(a); a > i; i++)o[i] && oe.isFunction(o[i].promise) ? o[i].promise().done(c(i, r, o)).fail(u.reject).progress(c(i, n, e)) : --s;
            return s || u.resolveWith(r, o), u.promise();
        }
    }), oe.support = function(e) {
        var n = U.createElement("input"), r = U.createDocumentFragment(), i = U.createElement("div"), o = U.createElement("select"), a = o.appendChild(U.createElement("option"));
        return n.type ? (n.type = "checkbox", e.checkOn = "" !== n.value, e.optSelected = a.selected, e.reliableMarginRight = !0, e.boxSizingReliable = !0, e.pixelPosition = !1, n.checked = !0, e.noCloneChecked = n.cloneNode(!0).checked, o.disabled = !0, e.optDisabled = !a.disabled, n = U.createElement("input"), n.value = "t", n.type = "radio", e.radioValue = "t" === n.value, n.setAttribute("checked", "t"), n.setAttribute("name", "t"), r.appendChild(n), e.checkClone = r.cloneNode(!0).cloneNode(!0).lastChild.checked, e.focusinBubbles = "onfocusin" in t, i.style.backgroundClip = "content-box", i.cloneNode(!0).style.backgroundClip = "", e.clearCloneStyle = "content-box" === i.style.backgroundClip, oe(function() {
            var n, r, o = "padding:0;margin:0;border:0;display:block;-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box", a = U.getElementsByTagName("body")[0];
            a && (n = U.createElement("div"), n.style.cssText = "border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px", a.appendChild(n).appendChild(i), i.innerHTML = "", i.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%", oe.swap(a, null != a.style.zoom ? { zoom: 1 } : {}, function() { e.boxSizing = 4 === i.offsetWidth; }), t.getComputedStyle && (e.pixelPosition = "1%" !== (t.getComputedStyle(i, null) || {}).top, e.boxSizingReliable = "4px" === (t.getComputedStyle(i, null) || { width: "4px" }).width, r = i.appendChild(U.createElement("div")), r.style.cssText = i.style.cssText = o, r.style.marginRight = r.style.width = "0", i.style.width = "1px", e.reliableMarginRight = !parseFloat((t.getComputedStyle(r, null) || {}).marginRight)), a.removeChild(n));
        }), e) : e;
    }({});
    var ge, me, ve = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/, ye = /([A-Z])/g;
    i.uid = 1, i.accepts = function(t) { return t.nodeType ? 1 === t.nodeType || 9 === t.nodeType : !0; }, i.prototype = {
        key: function(t) {
            if (!i.accepts(t))return 0;
            var e = {}, n = t[this.expando];
            if (!n) {
                n = i.uid++;
                try {
                    e[this.expando] = { value: n }, Object.defineProperties(t, e);
                } catch (r) {
                    e[this.expando] = n, oe.extend(t, e);
                }
            }
            return this.cache[n] || (this.cache[n] = {}), n;
        },
        set: function(t, e, n) {
            var r, i = this.key(t), o = this.cache[i];
            if ("string" == typeof e)o[e] = n;
            else if (oe.isEmptyObject(o))oe.extend(this.cache[i], e);
            else for (r in e)o[r] = e[r];
            return o;
        },
        get: function(t, n) {
            var r = this.cache[this.key(t)];
            return n === e ? r : r[n];
        },
        access: function(t, n, r) {
            var i;
            return n === e || n && "string" == typeof n && r === e ? (i = this.get(t, n), i !== e ? i : this.get(t, oe.camelCase(n))) : (this.set(t, n, r), r !== e ? r : n);
        },
        remove: function(t, n) {
            var r, i, o, a = this.key(t), s = this.cache[a];
            if (n === e)this.cache[a] = {};
            else {
                oe.isArray(n) ? i = n.concat(n.map(oe.camelCase)) : (o = oe.camelCase(n), n in s ? i = [n, o] : (i = o, i = i in s ? [i] : i.match(se) || [])), r = i.length;
                for (; r--;)delete s[i[r]];
            }
        },
        hasData: function(t) { return!oe.isEmptyObject(this.cache[t[this.expando]] || {}); },
        discard: function(t) { t[this.expando] && delete this.cache[t[this.expando]]; }
    }, ge = new i, me = new i, oe.extend({ acceptData: i.accepts, hasData: function(t) { return ge.hasData(t) || me.hasData(t); }, data: function(t, e, n) { return ge.access(t, e, n); }, removeData: function(t, e) { ge.remove(t, e); }, _data: function(t, e, n) { return me.access(t, e, n); }, _removeData: function(t, e) { me.remove(t, e); } }), oe.fn.extend({
        data: function(t, n) {
            var r, i, a = this[0], s = 0, u = null;
            if (t === e) {
                if (this.length && (u = ge.get(a), 1 === a.nodeType && !me.get(a, "hasDataAttrs"))) {
                    for (r = a.attributes; s < r.length; s++)i = r[s].name, 0 === i.indexOf("data-") && (i = oe.camelCase(i.slice(5)), o(a, i, u[i]));
                    me.set(a, "hasDataAttrs", !0);
                }
                return u;
            }
            return"object" == typeof t ? this.each(function() { ge.set(this, t); }) : oe.access(this, function(n) {
                var r, i = oe.camelCase(t);
                if (a && n === e) {
                    if (r = ge.get(a, t), r !== e)return r;
                    if (r = ge.get(a, i), r !== e)return r;
                    if (r = o(a, i, e), r !== e)return r;
                } else
                    this.each(function() {
                        var r = ge.get(this, i);
                        ge.set(this, i, n), -1 !== t.indexOf("-") && r !== e && ge.set(this, t, n);
                    });
            }, null, n, arguments.length > 1, null, !0);
        },
        removeData: function(t) { return this.each(function() { ge.remove(this, t); }); }
    }), oe.extend({
        queue: function(t, e, n) {
            var r;
            return t ? (e = (e || "fx") + "queue", r = me.get(t, e), n && (!r || oe.isArray(n) ? r = me.access(t, e, oe.makeArray(n)) : r.push(n)), r || []) : void 0;
        },
        dequeue: function(t, e) {
            e = e || "fx";
            var n = oe.queue(t, e), r = n.length, i = n.shift(), o = oe._queueHooks(t, e), a = function() { oe.dequeue(t, e); };
            "inprogress" === i && (i = n.shift(), r--), i && ("fx" === e && n.unshift("inprogress"), delete o.stop, i.call(t, a, o)), !r && o && o.empty.fire();
        },
        _queueHooks: function(t, e) {
            var n = e + "queueHooks";
            return me.get(t, n) || me.access(t, n, { empty: oe.Callbacks("once memory").add(function() { me.remove(t, [e + "queue", n]); }) });
        }
    }), oe.fn.extend({
        queue: function(t, n) {
            var r = 2;
            return"string" != typeof t && (n = t, t = "fx", r--), arguments.length < r ? oe.queue(this[0], t) : n === e ? this : this.each(function() {
                var e = oe.queue(this, t, n);
                oe._queueHooks(this, t), "fx" === t && "inprogress" !== e[0] && oe.dequeue(this, t);
            });
        },
        dequeue: function(t) { return this.each(function() { oe.dequeue(this, t); }); },
        delay: function(t, e) {
            return t = oe.fx ? oe.fx.speeds[t] || t : t, e = e || "fx", this.queue(e, function(e, n) {
                var r = setTimeout(e, t);
                n.stop = function() { clearTimeout(r); };
            });
        },
        clearQueue: function(t) { return this.queue(t || "fx", []); },
        promise: function(t, n) {
            var r, i = 1, o = oe.Deferred(), a = this, s = this.length, u = function() { --i || o.resolveWith(a, [a]); };
            for ("string" != typeof t && (n = t, t = e), t = t || "fx"; s--;)r = me.get(a[s], t + "queueHooks"), r && r.empty && (i++, r.empty.add(u));
            return u(), o.promise(n);
        }
    });
    var be, xe, we = /[\t\r\n\f]/g, _e = /\r/g, Me = /^(?:input|select|textarea|button)$/i;
    oe.fn.extend({
        attr: function(t, e) { return oe.access(this, oe.attr, t, e, arguments.length > 1); },
        removeAttr: function(t) { return this.each(function() { oe.removeAttr(this, t); }); },
        prop: function(t, e) { return oe.access(this, oe.prop, t, e, arguments.length > 1); },
        removeProp: function(t) { return this.each(function() { delete this[oe.propFix[t] || t]; }); },
        addClass: function(t) {
            var e, n, r, i, o, a = 0, s = this.length, u = "string" == typeof t && t;
            if (oe.isFunction(t))return this.each(function(e) { oe(this).addClass(t.call(this, e, this.className)); });
            if (u)
                for (e = (t || "").match(se) || []; s > a; a++)
                    if (n = this[a], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(we, " ") : " ")) {
                        for (o = 0; i = e[o++];)r.indexOf(" " + i + " ") < 0 && (r += i + " ");
                        n.className = oe.trim(r);
                    }
            return this;
        },
        removeClass: function(t) {
            var e, n, r, i, o, a = 0, s = this.length, u = 0 === arguments.length || "string" == typeof t && t;
            if (oe.isFunction(t))return this.each(function(e) { oe(this).removeClass(t.call(this, e, this.className)); });
            if (u)
                for (e = (t || "").match(se) || []; s > a; a++)
                    if (n = this[a], r = 1 === n.nodeType && (n.className ? (" " + n.className + " ").replace(we, " ") : "")) {
                        for (o = 0; i = e[o++];)for (; r.indexOf(" " + i + " ") >= 0;)r = r.replace(" " + i + " ", " ");
                        n.className = t ? oe.trim(r) : "";
                    }
            return this;
        },
        toggleClass: function(t, e) {
            var n = typeof t;
            return"boolean" == typeof e && "string" === n ? e ? this.addClass(t) : this.removeClass(t) : oe.isFunction(t) ? this.each(function(n) { oe(this).toggleClass(t.call(this, n, this.className, e), e); }) : this.each(function() {
                if ("string" === n)for (var e, r = 0, i = oe(this), o = t.match(se) || []; e = o[r++];)i.hasClass(e) ? i.removeClass(e) : i.addClass(e);
                else(n === Y || "boolean" === n) && (this.className && me.set(this, "__className__", this.className), this.className = this.className || t === !1 ? "" : me.get(this, "__className__") || "");
            });
        },
        hasClass: function(t) {
            for (var e = " " + t + " ", n = 0, r = this.length; r > n; n++)if (1 === this[n].nodeType && (" " + this[n].className + " ").replace(we, " ").indexOf(e) >= 0)return!0;
            return!1;
        },
        val: function(t) {
            var n, r, i, o = this[0];
            {
                if (arguments.length)
                    return i = oe.isFunction(t), this.each(function(r) {
                        var o;
                        1 === this.nodeType && (o = i ? t.call(this, r, oe(this).val()) : t, null == o ? o = "" : "number" == typeof o ? o += "" : oe.isArray(o) && (o = oe.map(o, function(t) { return null == t ? "" : t + ""; })), n = oe.valHooks[this.type] || oe.valHooks[this.nodeName.toLowerCase()], n && "set" in n && n.set(this, o, "value") !== e || (this.value = o));
                    });
                if (o)return n = oe.valHooks[o.type] || oe.valHooks[o.nodeName.toLowerCase()], n && "get" in n && (r = n.get(o, "value")) !== e ? r : (r = o.value, "string" == typeof r ? r.replace(_e, "") : null == r ? "" : r);
            }
        }
    }), oe.extend({
        valHooks: {
            option: {
                get: function(t) {
                    var e = t.attributes.value;
                    return!e || e.specified ? t.value : t.text;
                }
            },
            select: {
                get: function(t) {
                    for (var e, n, r = t.options, i = t.selectedIndex, o = "select-one" === t.type || 0 > i, a = o ? null : [], s = o ? i + 1 : r.length, u = 0 > i ? s : o ? i : 0; s > u; u++)
                        if (n = r[u], !(!n.selected && u !== i || (oe.support.optDisabled ? n.disabled : null !== n.getAttribute("disabled")) || n.parentNode.disabled && oe.nodeName(n.parentNode, "optgroup"))) {
                            if (e = oe(n).val(), o)return e;
                            a.push(e);
                        }
                    return a;
                },
                set: function(t, e) {
                    for (var n, r, i = t.options, o = oe.makeArray(e), a = i.length; a--;)r = i[a], (r.selected = oe.inArray(oe(r).val(), o) >= 0) && (n = !0);
                    return n || (t.selectedIndex = -1), o;
                }
            }
        },
        attr: function(t, n, r) {
            var i, o, a = t.nodeType;
            if (t && 3 !== a && 8 !== a && 2 !== a)return typeof t.getAttribute === Y ? oe.prop(t, n, r) : (1 === a && oe.isXMLDoc(t) || (n = n.toLowerCase(), i = oe.attrHooks[n] || (oe.expr.match.bool.test(n) ? xe : be)), r === e ? i && "get" in i && null !== (o = i.get(t, n)) ? o : (o = oe.find.attr(t, n), null == o ? e : o) : null !== r ? i && "set" in i && (o = i.set(t, r, n)) !== e ? o : (t.setAttribute(n, r + ""), r) : (oe.removeAttr(t, n), void 0));
        },
        removeAttr: function(t, e) {
            var n, r, i = 0, o = e && e.match(se);
            if (o && 1 === t.nodeType)for (; n = o[i++];)r = oe.propFix[n] || n, oe.expr.match.bool.test(n) && (t[r] = !1), t.removeAttribute(n);
        },
        attrHooks: {
            type: {
                set: function(t, e) {
                    if (!oe.support.radioValue && "radio" === e && oe.nodeName(t, "input")) {
                        var n = t.value;
                        return t.setAttribute("type", e), n && (t.value = n), e;
                    }
                }
            }
        },
        propFix: { "for": "htmlFor", "class": "className" },
        prop: function(t, n, r) {
            var i, o, a, s = t.nodeType;
            if (t && 3 !== s && 8 !== s && 2 !== s)return a = 1 !== s || !oe.isXMLDoc(t), a && (n = oe.propFix[n] || n, o = oe.propHooks[n]), r !== e ? o && "set" in o && (i = o.set(t, r, n)) !== e ? i : t[n] = r : o && "get" in o && null !== (i = o.get(t, n)) ? i : t[n];
        },
        propHooks: { tabIndex: { get: function(t) { return t.hasAttribute("tabindex") || Me.test(t.nodeName) || t.href ? t.tabIndex : -1; } } }
    }), xe = { set: function(t, e, n) { return e === !1 ? oe.removeAttr(t, n) : t.setAttribute(n, n), n; } }, oe.each(oe.expr.match.bool.source.match(/\w+/g), function(t, n) {
        var r = oe.expr.attrHandle[n] || oe.find.attr;
        oe.expr.attrHandle[n] = function(t, n, i) {
            var o = oe.expr.attrHandle[n], a = i ? e : (oe.expr.attrHandle[n] = e) != r(t, n, i) ? n.toLowerCase() : null;
            return oe.expr.attrHandle[n] = o, a;
        };
    }), oe.support.optSelected || (oe.propHooks.selected = {
        get: function(t) {
            var e = t.parentNode;
            return e && e.parentNode && e.parentNode.selectedIndex, null;
        }
    }), oe.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function() { oe.propFix[this.toLowerCase()] = this; }), oe.each(["radio", "checkbox"], function() { oe.valHooks[this] = { set: function(t, e) { return oe.isArray(e) ? t.checked = oe.inArray(oe(t).val(), e) >= 0 : void 0; } }, oe.support.checkOn || (oe.valHooks[this].get = function(t) { return null === t.getAttribute("value") ? "on" : t.value; }); });
    var ke = /^key/, Se = /^(?:mouse|contextmenu)|click/, Te = /^(?:focusinfocus|focusoutblur)$/, Ee = /^([^.]*)(?:\.(.+)|)$/;
    oe.event = {
        global: {},
        add: function(t, n, r, i, o) {
            var a, s, u, c, l, f, h, d, p, g, m, v = me.get(t);
            if (v) {
                for (r.handler && (a = r, r = a.handler, o = a.selector), r.guid || (r.guid = oe.guid++), (c = v.events) || (c = v.events = {}), (s = v.handle) || (s = v.handle = function(t) { return typeof oe === Y || t && oe.event.triggered === t.type ? e : oe.event.dispatch.apply(s.elem, arguments); }, s.elem = t), n = (n || "").match(se) || [""], l = n.length; l--;)u = Ee.exec(n[l]) || [], p = m = u[1], g = (u[2] || "").split(".").sort(), p && (h = oe.event.special[p] || {}, p = (o ? h.delegateType : h.bindType) || p, h = oe.event.special[p] || {}, f = oe.extend({ type: p, origType: m, data: i, handler: r, guid: r.guid, selector: o, needsContext: o && oe.expr.match.needsContext.test(o), namespace: g.join(".") }, a), (d = c[p]) || (d = c[p] = [], d.delegateCount = 0, h.setup && h.setup.call(t, i, g, s) !== !1 || t.addEventListener && t.addEventListener(p, s, !1)), h.add && (h.add.call(t, f), f.handler.guid || (f.handler.guid = r.guid)), o ? d.splice(d.delegateCount++, 0, f) : d.push(f), oe.event.global[p] = !0);
                t = null;
            }
        },
        remove: function(t, e, n, r, i) {
            var o, a, s, u, c, l, f, h, d, p, g, m = me.hasData(t) && me.get(t);
            if (m && (u = m.events)) {
                for (e = (e || "").match(se) || [""], c = e.length; c--;)
                    if (s = Ee.exec(e[c]) || [], d = g = s[1], p = (s[2] || "").split(".").sort(), d) {
                        for (f = oe.event.special[d] || {}, d = (r ? f.delegateType : f.bindType) || d, h = u[d] || [], s = s[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), a = o = h.length; o--;)l = h[o], !i && g !== l.origType || n && n.guid !== l.guid || s && !s.test(l.namespace) || r && r !== l.selector && ("**" !== r || !l.selector) || (h.splice(o, 1), l.selector && h.delegateCount--, f.remove && f.remove.call(t, l));
                        a && !h.length && (f.teardown && f.teardown.call(t, p, m.handle) !== !1 || oe.removeEvent(t, d, m.handle), delete u[d]);
                    } else for (d in u)oe.event.remove(t, d + e[c], n, r, !0);
                oe.isEmptyObject(u) && (delete m.handle, me.remove(t, "events"));
            }
        },
        trigger: function(n, r, i, o) {
            var a, s, u, c, l, f, h, d = [i || U], p = re.call(n, "type") ? n.type : n, g = re.call(n, "namespace") ? n.namespace.split(".") : [];
            if (s = u = i = i || U, 3 !== i.nodeType && 8 !== i.nodeType && !Te.test(p + oe.event.triggered) && (p.indexOf(".") >= 0 && (g = p.split("."), p = g.shift(), g.sort()), l = p.indexOf(":") < 0 && "on" + p, n = n[oe.expando] ? n : new oe.Event(p, "object" == typeof n && n), n.isTrigger = o ? 2 : 3, n.namespace = g.join("."), n.namespace_re = n.namespace ? new RegExp("(^|\\.)" + g.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, n.result = e, n.target || (n.target = i), r = null == r ? [n] : oe.makeArray(r, [n]), h = oe.event.special[p] || {}, o || !h.trigger || h.trigger.apply(i, r) !== !1)) {
                if (!o && !h.noBubble && !oe.isWindow(i)) {
                    for (c = h.delegateType || p, Te.test(c + p) || (s = s.parentNode); s; s = s.parentNode)d.push(s), u = s;
                    u === (i.ownerDocument || U) && d.push(u.defaultView || u.parentWindow || t);
                }
                for (a = 0; (s = d[a++]) && !n.isPropagationStopped();)n.type = a > 1 ? c : h.bindType || p, f = (me.get(s, "events") || {})[n.type] && me.get(s, "handle"), f && f.apply(s, r), f = l && s[l], f && oe.acceptData(s) && f.apply && f.apply(s, r) === !1 && n.preventDefault();
                return n.type = p, o || n.isDefaultPrevented() || h._default && h._default.apply(d.pop(), r) !== !1 || !oe.acceptData(i) || l && oe.isFunction(i[p]) && !oe.isWindow(i) && (u = i[l], u && (i[l] = null), oe.event.triggered = p, i[p](), oe.event.triggered = e, u && (i[l] = u)), n.result;
            }
        },
        dispatch: function(t) {
            t = oe.event.fix(t);
            var n, r, i, o, a, s = [], u = te.call(arguments), c = (me.get(this, "events") || {})[t.type] || [], l = oe.event.special[t.type] || {};
            if (u[0] = t, t.delegateTarget = this, !l.preDispatch || l.preDispatch.call(this, t) !== !1) {
                for (s = oe.event.handlers.call(this, t, c), n = 0; (o = s[n++]) && !t.isPropagationStopped();)for (t.currentTarget = o.elem, r = 0; (a = o.handlers[r++]) && !t.isImmediatePropagationStopped();)(!t.namespace_re || t.namespace_re.test(a.namespace)) && (t.handleObj = a, t.data = a.data, i = ((oe.event.special[a.origType] || {}).handle || a.handler).apply(o.elem, u), i !== e && (t.result = i) === !1 && (t.preventDefault(), t.stopPropagation()));
                return l.postDispatch && l.postDispatch.call(this, t), t.result;
            }
        },
        handlers: function(t, n) {
            var r, i, o, a, s = [], u = n.delegateCount, c = t.target;
            if (u && c.nodeType && (!t.button || "click" !== t.type))
                for (; c !== this; c = c.parentNode || this)
                    if (c.disabled !== !0 || "click" !== t.type) {
                        for (i = [], r = 0; u > r; r++)a = n[r], o = a.selector + " ", i[o] === e && (i[o] = a.needsContext ? oe(o, this).index(c) >= 0 : oe.find(o, this, null, [c]).length), i[o] && i.push(a);
                        i.length && s.push({ elem: c, handlers: i });
                    }
            return u < n.length && s.push({ elem: this, handlers: n.slice(u) }), s;
        },
        props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: { props: "char charCode key keyCode".split(" "), filter: function(t, e) { return null == t.which && (t.which = null != e.charCode ? e.charCode : e.keyCode), t; } },
        mouseHooks: {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(t, n) {
                var r, i, o, a = n.button;
                return null == t.pageX && null != n.clientX && (r = t.target.ownerDocument || U, i = r.documentElement, o = r.body, t.pageX = n.clientX + (i && i.scrollLeft || o && o.scrollLeft || 0) - (i && i.clientLeft || o && o.clientLeft || 0), t.pageY = n.clientY + (i && i.scrollTop || o && o.scrollTop || 0) - (i && i.clientTop || o && o.clientTop || 0)), t.which || a === e || (t.which = 1 & a ? 1 : 2 & a ? 3 : 4 & a ? 2 : 0), t;
            }
        },
        fix: function(t) {
            if (t[oe.expando])return t;
            var e, n, r, i = t.type, o = t, a = this.fixHooks[i];
            for (a || (this.fixHooks[i] = a = Se.test(i) ? this.mouseHooks : ke.test(i) ? this.keyHooks : {}), r = a.props ? this.props.concat(a.props) : this.props, t = new oe.Event(o), e = r.length; e--;)n = r[e], t[n] = o[n];
            return t.target || (t.target = U), 3 === t.target.nodeType && (t.target = t.target.parentNode), a.filter ? a.filter(t, o) : t;
        },
        special: { load: { noBubble: !0 }, focus: { trigger: function() { return this !== u() && this.focus ? (this.focus(), !1) : void 0; }, delegateType: "focusin" }, blur: { trigger: function() { return this === u() && this.blur ? (this.blur(), !1) : void 0; }, delegateType: "focusout" }, click: { trigger: function() { return"checkbox" === this.type && this.click && oe.nodeName(this, "input") ? (this.click(), !1) : void 0; }, _default: function(t) { return oe.nodeName(t.target, "a"); } }, beforeunload: { postDispatch: function(t) { t.result !== e && (t.originalEvent.returnValue = t.result); } } },
        simulate: function(t, e, n, r) {
            var i = oe.extend(new oe.Event, n, { type: t, isSimulated: !0, originalEvent: {} });
            r ? oe.event.trigger(i, null, e) : oe.event.dispatch.call(e, i), i.isDefaultPrevented() && n.preventDefault();
        }
    }, oe.removeEvent = function(t, e, n) { t.removeEventListener && t.removeEventListener(e, n, !1); }, oe.Event = function(t, e) { return this instanceof oe.Event ? (t && t.type ? (this.originalEvent = t, this.type = t.type, this.isDefaultPrevented = t.defaultPrevented || t.getPreventDefault && t.getPreventDefault() ? a : s) : this.type = t, e && oe.extend(this, e), this.timeStamp = t && t.timeStamp || oe.now(), this[oe.expando] = !0, void 0) : new oe.Event(t, e); }, oe.Event.prototype = {
        isDefaultPrevented: s,
        isPropagationStopped: s,
        isImmediatePropagationStopped: s,
        preventDefault: function() {
            var t = this.originalEvent;
            this.isDefaultPrevented = a, t && t.preventDefault && t.preventDefault();
        },
        stopPropagation: function() {
            var t = this.originalEvent;
            this.isPropagationStopped = a, t && t.stopPropagation && t.stopPropagation();
        },
        stopImmediatePropagation: function() { this.isImmediatePropagationStopped = a, this.stopPropagation(); }
    }, oe.each({ mouseenter: "mouseover", mouseleave: "mouseout" }, function(t, e) {
        oe.event.special[t] = {
            delegateType: e,
            bindType: e,
            handle: function(t) {
                var n, r = this, i = t.relatedTarget, o = t.handleObj;
                return(!i || i !== r && !oe.contains(r, i)) && (t.type = o.origType, n = o.handler.apply(this, arguments), t.type = e), n;
            }
        };
    }), oe.support.focusinBubbles || oe.each({ focus: "focusin", blur: "focusout" }, function(t, e) {
        var n = 0, r = function(t) { oe.event.simulate(e, t.target, oe.event.fix(t), !0); };
        oe.event.special[e] = { setup: function() { 0 === n++ && U.addEventListener(t, r, !0); }, teardown: function() { 0 === --n && U.removeEventListener(t, r, !0); } };
    }), oe.fn.extend({
        on: function(t, n, r, i, o) {
            var a, u;
            if ("object" == typeof t) {
                "string" != typeof n && (r = r || n, n = e);
                for (u in t)this.on(u, n, r, t[u], o);
                return this;
            }
            if (null == r && null == i ? (i = n, r = n = e) : null == i && ("string" == typeof n ? (i = r, r = e) : (i = r, r = n, n = e)), i === !1)i = s;
            else if (!i)return this;
            return 1 === o && (a = i, i = function(t) { return oe().off(t), a.apply(this, arguments); }, i.guid = a.guid || (a.guid = oe.guid++)), this.each(function() { oe.event.add(this, t, i, r, n); });
        },
        one: function(t, e, n, r) { return this.on(t, e, n, r, 1); },
        off: function(t, n, r) {
            var i, o;
            if (t && t.preventDefault && t.handleObj)return i = t.handleObj, oe(t.delegateTarget).off(i.namespace ? i.origType + "." + i.namespace : i.origType, i.selector, i.handler), this;
            if ("object" == typeof t) {
                for (o in t)this.off(o, n, t[o]);
                return this;
            }
            return(n === !1 || "function" == typeof n) && (r = n, n = e), r === !1 && (r = s), this.each(function() { oe.event.remove(this, t, r, n); });
        },
        trigger: function(t, e) { return this.each(function() { oe.event.trigger(t, e, this); }); },
        triggerHandler: function(t, e) {
            var n = this[0];
            return n ? oe.event.trigger(t, e, n, !0) : void 0;
        }
    });
    var Ce = /^.[^:#\[\.,]*$/, De = /^(?:parents|prev(?:Until|All))/, $e = oe.expr.match.needsContext, Ae = { children: !0, contents: !0, next: !0, prev: !0 };
    oe.fn.extend({
        find: function(t) {
            var e, n = [], r = this, i = r.length;
            if ("string" != typeof t)return this.pushStack(oe(t).filter(function() { for (e = 0; i > e; e++)if (oe.contains(r[e], this))return!0; }));
            for (e = 0; i > e; e++)oe.find(t, r[e], n);
            return n = this.pushStack(i > 1 ? oe.unique(n) : n), n.selector = this.selector ? this.selector + " " + t : t, n;
        },
        has: function(t) {
            var e = oe(t, this), n = e.length;
            return this.filter(function() { for (var t = 0; n > t; t++)if (oe.contains(this, e[t]))return!0; });
        },
        not: function(t) { return this.pushStack(l(this, t || [], !0)); },
        filter: function(t) { return this.pushStack(l(this, t || [], !1)); },
        is: function(t) { return!!l(this, "string" == typeof t && $e.test(t) ? oe(t) : t || [], !1).length; },
        closest: function(t, e) {
            for (var n, r = 0, i = this.length, o = [], a = $e.test(t) || "string" != typeof t ? oe(t, e || this.context) : 0; i > r; r++)
                for (n = this[r]; n && n !== e; n = n.parentNode)
                    if (n.nodeType < 11 && (a ? a.index(n) > -1 : 1 === n.nodeType && oe.find.matchesSelector(n, t))) {
                        n = o.push(n);
                        break;
                    }
            return this.pushStack(o.length > 1 ? oe.unique(o) : o);
        },
        index: function(t) { return t ? "string" == typeof t ? ee.call(oe(t), this[0]) : ee.call(this, t.jquery ? t[0] : t) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1; },
        add: function(t, e) {
            var n = "string" == typeof t ? oe(t, e) : oe.makeArray(t && t.nodeType ? [t] : t), r = oe.merge(this.get(), n);
            return this.pushStack(oe.unique(r));
        },
        addBack: function(t) { return this.add(null == t ? this.prevObject : this.prevObject.filter(t)); }
    }), oe.each({
        parent: function(t) {
            var e = t.parentNode;
            return e && 11 !== e.nodeType ? e : null;
        },
        parents: function(t) { return oe.dir(t, "parentNode"); },
        parentsUntil: function(t, e, n) { return oe.dir(t, "parentNode", n); },
        next: function(t) { return c(t, "nextSibling"); },
        prev: function(t) { return c(t, "previousSibling"); },
        nextAll: function(t) { return oe.dir(t, "nextSibling"); },
        prevAll: function(t) { return oe.dir(t, "previousSibling"); },
        nextUntil: function(t, e, n) { return oe.dir(t, "nextSibling", n); },
        prevUntil: function(t, e, n) { return oe.dir(t, "previousSibling", n); },
        siblings: function(t) { return oe.sibling((t.parentNode || {}).firstChild, t); },
        children: function(t) { return oe.sibling(t.firstChild); },
        contents: function(t) { return t.contentDocument || oe.merge([], t.childNodes); }
    }, function(t, e) {
        oe.fn[t] = function(n, r) {
            var i = oe.map(this, e, n);
            return"Until" !== t.slice(-5) && (r = n), r && "string" == typeof r && (i = oe.filter(r, i)), this.length > 1 && (Ae[t] || oe.unique(i), De.test(t) && i.reverse()), this.pushStack(i);
        };
    }), oe.extend({
        filter: function(t, e, n) {
            var r = e[0];
            return n && (t = ":not(" + t + ")"), 1 === e.length && 1 === r.nodeType ? oe.find.matchesSelector(r, t) ? [r] : [] : oe.find.matches(t, oe.grep(e, function(t) { return 1 === t.nodeType; }));
        },
        dir: function(t, n, r) {
            for (var i = [], o = r !== e; (t = t[n]) && 9 !== t.nodeType;)
                if (1 === t.nodeType) {
                    if (o && oe(t).is(r))break;
                    i.push(t);
                }
            return i;
        },
        sibling: function(t, e) {
            for (var n = []; t; t = t.nextSibling)1 === t.nodeType && t !== e && n.push(t);
            return n;
        }
    });
    var Ne = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, Le = /<([\w:]+)/, je = /<|&#?\w+;/, Oe = /<(?:script|style|link)/i, Fe = /^(?:checkbox|radio)$/i, Pe = /checked\s*(?:[^=]|=\s*.checked.)/i, Re = /^$|\/(?:java|ecma)script/i, ze = /^true\/(.*)/, Ie = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, qe = { option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""] };
    qe.optgroup = qe.option, qe.tbody = qe.tfoot = qe.colgroup = qe.caption = qe.thead, qe.th = qe.td, oe.fn.extend({
        text: function(t) { return oe.access(this, function(t) { return t === e ? oe.text(this) : this.empty().append((this[0] && this[0].ownerDocument || U).createTextNode(t)); }, null, t, arguments.length); },
        append: function() {
            return this.domManip(arguments, function(t) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var e = f(this, t);
                    e.appendChild(t);
                }
            });
        },
        prepend: function() {
            return this.domManip(arguments, function(t) {
                if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                    var e = f(this, t);
                    e.insertBefore(t, e.firstChild);
                }
            });
        },
        before: function() { return this.domManip(arguments, function(t) { this.parentNode && this.parentNode.insertBefore(t, this); }); },
        after: function() { return this.domManip(arguments, function(t) { this.parentNode && this.parentNode.insertBefore(t, this.nextSibling); }); },
        remove: function(t, e) {
            for (var n, r = t ? oe.filter(t, this) : this, i = 0; null != (n = r[i]); i++)e || 1 !== n.nodeType || oe.cleanData(m(n)), n.parentNode && (e && oe.contains(n.ownerDocument, n) && p(m(n, "script")), n.parentNode.removeChild(n));
            return this;
        },
        empty: function() {
            for (var t, e = 0; null != (t = this[e]); e++)1 === t.nodeType && (oe.cleanData(m(t, !1)), t.textContent = "");
            return this;
        },
        clone: function(t, e) { return t = null == t ? !1 : t, e = null == e ? t : e, this.map(function() { return oe.clone(this, t, e); }); },
        html: function(t) {
            return oe.access(this, function(t) {
                var n = this[0] || {}, r = 0, i = this.length;
                if (t === e && 1 === n.nodeType)return n.innerHTML;
                if ("string" == typeof t && !Oe.test(t) && !qe[(Le.exec(t) || ["", ""])[1].toLowerCase()]) {
                    t = t.replace(Ne, "<$1></$2>");
                    try {
                        for (; i > r; r++)n = this[r] || {}, 1 === n.nodeType && (oe.cleanData(m(n, !1)), n.innerHTML = t);
                        n = 0;
                    } catch (o) {
                    }
                }
                n && this.empty().append(t);
            }, null, t, arguments.length);
        },
        replaceWith: function() {
            var t = oe.map(this, function(t) { return[t.nextSibling, t.parentNode]; }), e = 0;
            return this.domManip(arguments, function(n) {
                var r = t[e++], i = t[e++];
                i && (r && r.parentNode !== i && (r = this.nextSibling), oe(this).remove(), i.insertBefore(n, r));
            }, !0), e ? this : this.remove();
        },
        detach: function(t) { return this.remove(t, !0); },
        domManip: function(t, e, n) {
            t = J.apply([], t);
            var r, i, o, a, s, u, c = 0, l = this.length, f = this, p = l - 1, g = t[0], v = oe.isFunction(g);
            if (v || !(1 >= l || "string" != typeof g || oe.support.checkClone) && Pe.test(g))
                return this.each(function(r) {
                    var i = f.eq(r);
                    v && (t[0] = g.call(this, r, i.html())), i.domManip(t, e, n);
                });
            if (l && (r = oe.buildFragment(t, this[0].ownerDocument, !1, !n && this), i = r.firstChild, 1 === r.childNodes.length && (r = i), i)) {
                for (o = oe.map(m(r, "script"), h), a = o.length; l > c; c++)s = r, c !== p && (s = oe.clone(s, !0, !0), a && oe.merge(o, m(s, "script"))), e.call(this[c], s, c);
                if (a)for (u = o[o.length - 1].ownerDocument, oe.map(o, d), c = 0; a > c; c++)s = o[c], Re.test(s.type || "") && !me.access(s, "globalEval") && oe.contains(u, s) && (s.src ? oe._evalUrl(s.src) : oe.globalEval(s.textContent.replace(Ie, "")));
            }
            return this;
        }
    }), oe.each({ appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith" }, function(t, e) {
        oe.fn[t] = function(t) {
            for (var n, r = [], i = oe(t), o = i.length - 1, a = 0; o >= a; a++)n = a === o ? this : this.clone(!0), oe(i[a])[e](n), Q.apply(r, n.get());
            return this.pushStack(r);
        };
    }), oe.extend({
        clone: function(t, e, n) {
            var r, i, o, a, s = t.cloneNode(!0), u = oe.contains(t.ownerDocument, t);
            if (!(oe.support.noCloneChecked || 1 !== t.nodeType && 11 !== t.nodeType || oe.isXMLDoc(t)))for (a = m(s), o = m(t), r = 0, i = o.length; i > r; r++)v(o[r], a[r]);
            if (e)
                if (n)for (o = o || m(t), a = a || m(s), r = 0, i = o.length; i > r; r++)g(o[r], a[r]);
                else g(t, s);
            return a = m(s, "script"), a.length > 0 && p(a, !u && m(t, "script")), s;
        },
        buildFragment: function(t, e, n, r) {
            for (var i, o, a, s, u, c, l = 0, f = t.length, h = e.createDocumentFragment(), d = []; f > l; l++)
                if (i = t[l], i || 0 === i)
                    if ("object" === oe.type(i))oe.merge(d, i.nodeType ? [i] : i);
                    else if (je.test(i)) {
                        for (o = o || h.appendChild(e.createElement("div")), a = (Le.exec(i) || ["", ""])[1].toLowerCase(), s = qe[a] || qe._default, o.innerHTML = s[1] + i.replace(Ne, "<$1></$2>") + s[2], c = s[0]; c--;)o = o.lastChild;
                        oe.merge(d, o.childNodes), o = h.firstChild, o.textContent = "";
                    } else d.push(e.createTextNode(i));
            for (h.textContent = "", l = 0; i = d[l++];)if ((!r || -1 === oe.inArray(i, r)) && (u = oe.contains(i.ownerDocument, i), o = m(h.appendChild(i), "script"), u && p(o), n))for (c = 0; i = o[c++];)Re.test(i.type || "") && n.push(i);
            return h;
        },
        cleanData: function(t) {
            for (var n, r, o, a, s, u, c = oe.event.special, l = 0; (r = t[l]) !== e; l++) {
                if (i.accepts(r) && (s = r[me.expando], s && (n = me.cache[s]))) {
                    if (o = Object.keys(n.events || {}), o.length)for (u = 0; (a = o[u]) !== e; u++)c[a] ? oe.event.remove(r, a) : oe.removeEvent(r, a, n.handle);
                    me.cache[s] && delete me.cache[s];
                }
                delete ge.cache[r[ge.expando]];
            }
        },
        _evalUrl: function(t) { return oe.ajax({ url: t, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0 }); }
    }), oe.fn.extend({
        wrapAll: function(t) {
            var e;
            return oe.isFunction(t) ? this.each(function(e) { oe(this).wrapAll(t.call(this, e)); }) : (this[0] && (e = oe(t, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && e.insertBefore(this[0]), e.map(function() {
                for (var t = this; t.firstElementChild;)t = t.firstElementChild;
                return t;
            }).append(this)), this);
        },
        wrapInner: function(t) {
            return oe.isFunction(t) ? this.each(function(e) { oe(this).wrapInner(t.call(this, e)); }) : this.each(function() {
                var e = oe(this), n = e.contents();
                n.length ? n.wrapAll(t) : e.append(t);
            });
        },
        wrap: function(t) {
            var e = oe.isFunction(t);
            return this.each(function(n) { oe(this).wrapAll(e ? t.call(this, n) : t); });
        },
        unwrap: function() { return this.parent().each(function() { oe.nodeName(this, "body") || oe(this).replaceWith(this.childNodes); }).end(); }
    });
    var He, Ye, Be = /^(none|table(?!-c[ea]).+)/, Ue = /^margin/, We = new RegExp("^(" + ae + ")(.*)$", "i"), Ve = new RegExp("^(" + ae + ")(?!px)[a-z%]+$", "i"), Xe = new RegExp("^([+-])=(" + ae + ")", "i"), Ze = { BODY: "block" }, Ge = { position: "absolute", visibility: "hidden", display: "block" }, Ke = { letterSpacing: 0, fontWeight: 400 }, Je = ["Top", "Right", "Bottom", "Left"], Qe = ["Webkit", "O", "Moz", "ms"];
    oe.fn.extend({
        css: function(t, n) {
            return oe.access(this, function(t, n, r) {
                var i, o, a = {}, s = 0;
                if (oe.isArray(n)) {
                    for (i = x(t), o = n.length; o > s; s++)a[n[s]] = oe.css(t, n[s], !1, i);
                    return a;
                }
                return r !== e ? oe.style(t, n, r) : oe.css(t, n);
            }, t, n, arguments.length > 1);
        },
        show: function() { return w(this, !0); },
        hide: function() { return w(this); },
        toggle: function(t) { return"boolean" == typeof t ? t ? this.show() : this.hide() : this.each(function() { b(this) ? oe(this).show() : oe(this).hide(); }); }
    }), oe.extend({
        cssHooks: {
            opacity: {
                get: function(t, e) {
                    if (e) {
                        var n = He(t, "opacity");
                        return"" === n ? "1" : n;
                    }
                }
            }
        },
        cssNumber: { columnCount: !0, fillOpacity: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0 },
        cssProps: { "float": "cssFloat" },
        style: function(t, n, r, i) {
            if (t && 3 !== t.nodeType && 8 !== t.nodeType && t.style) {
                var o, a, s, u = oe.camelCase(n), c = t.style;
                return n = oe.cssProps[u] || (oe.cssProps[u] = y(c, u)), s = oe.cssHooks[n] || oe.cssHooks[u], r === e ? s && "get" in s && (o = s.get(t, !1, i)) !== e ? o : c[n] : (a = typeof r, "string" === a && (o = Xe.exec(r)) && (r = (o[1] + 1) * o[2] + parseFloat(oe.css(t, n)), a = "number"), null == r || "number" === a && isNaN(r) || ("number" !== a || oe.cssNumber[u] || (r += "px"), oe.support.clearCloneStyle || "" !== r || 0 !== n.indexOf("background") || (c[n] = "inherit"), s && "set" in s && (r = s.set(t, r, i)) === e || (c[n] = r)), void 0);
            }
        },
        css: function(t, n, r, i) {
            var o, a, s, u = oe.camelCase(n);
            return n = oe.cssProps[u] || (oe.cssProps[u] = y(t.style, u)), s = oe.cssHooks[n] || oe.cssHooks[u], s && "get" in s && (o = s.get(t, !0, r)), o === e && (o = He(t, n, i)), "normal" === o && n in Ke && (o = Ke[n]), "" === r || r ? (a = parseFloat(o), r === !0 || oe.isNumeric(a) ? a || 0 : o) : o;
        }
    }), He = function(t, n, r) {
        var i, o, a, s = r || x(t), u = s ? s.getPropertyValue(n) || s[n] : e, c = t.style;
        return s && ("" !== u || oe.contains(t.ownerDocument, t) || (u = oe.style(t, n)), Ve.test(u) && Ue.test(n) && (i = c.width, o = c.minWidth, a = c.maxWidth, c.minWidth = c.maxWidth = c.width = u, u = s.width, c.width = i, c.minWidth = o, c.maxWidth = a)), u;
    }, oe.each(["height", "width"], function(t, e) {
        oe.cssHooks[e] = {
            get: function(t, n, r) { return n ? 0 === t.offsetWidth && Be.test(oe.css(t, "display")) ? oe.swap(t, Ge, function() { return k(t, e, r); }) : k(t, e, r) : void 0; },
            set: function(t, n, r) {
                var i = r && x(t);
                return _(t, n, r ? M(t, e, r, oe.support.boxSizing && "border-box" === oe.css(t, "boxSizing", !1, i), i) : 0);
            }
        };
    }), oe(function() { oe.support.reliableMarginRight || (oe.cssHooks.marginRight = { get: function(t, e) { return e ? oe.swap(t, { display: "inline-block" }, He, [t, "marginRight"]) : void 0; } }), !oe.support.pixelPosition && oe.fn.position && oe.each(["top", "left"], function(t, e) { oe.cssHooks[e] = { get: function(t, n) { return n ? (n = He(t, e), Ve.test(n) ? oe(t).position()[e] + "px" : n) : void 0; } }; }); }), oe.expr && oe.expr.filters && (oe.expr.filters.hidden = function(t) { return t.offsetWidth <= 0 && t.offsetHeight <= 0; }, oe.expr.filters.visible = function(t) { return!oe.expr.filters.hidden(t); }), oe.each({ margin: "", padding: "", border: "Width" }, function(t, e) {
        oe.cssHooks[t + e] = {
            expand: function(n) {
                for (var r = 0, i = {}, o = "string" == typeof n ? n.split(" ") : [n]; 4 > r; r++)i[t + Je[r] + e] = o[r] || o[r - 2] || o[0];
                return i;
            }
        }, Ue.test(t) || (oe.cssHooks[t + e].set = _);
    });
    var tn = /%20/g, en = /\[\]$/, nn = /\r?\n/g, rn = /^(?:submit|button|image|reset|file)$/i, on = /^(?:input|select|textarea|keygen)/i;
    oe.fn.extend({
        serialize: function() { return oe.param(this.serializeArray()); },
        serializeArray: function() {
            return this.map(function() {
                var t = oe.prop(this, "elements");
                return t ? oe.makeArray(t) : this;
            }).filter(function() {
                var t = this.type;
                return this.name && !oe(this).is(":disabled") && on.test(this.nodeName) && !rn.test(t) && (this.checked || !Fe.test(t));
            }).map(function(t, e) {
                var n = oe(this).val();
                return null == n ? null : oe.isArray(n) ? oe.map(n, function(t) { return{ name: e.name, value: t.replace(nn, "\r\n") }; }) : { name: e.name, value: n.replace(nn, "\r\n") };
            }).get();
        }
    }), oe.param = function(t, n) {
        var r, i = [], o = function(t, e) { e = oe.isFunction(e) ? e() : null == e ? "" : e, i[i.length] = encodeURIComponent(t) + "=" + encodeURIComponent(e); };
        if (n === e && (n = oe.ajaxSettings && oe.ajaxSettings.traditional), oe.isArray(t) || t.jquery && !oe.isPlainObject(t))oe.each(t, function() { o(this.name, this.value); });
        else for (r in t)E(r, t[r], n, o);
        return i.join("&").replace(tn, "+");
    }, oe.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(t, e) { oe.fn[e] = function(t, n) { return arguments.length > 0 ? this.on(e, null, t, n) : this.trigger(e); }; }), oe.fn.extend({ hover: function(t, e) { return this.mouseenter(t).mouseleave(e || t); }, bind: function(t, e, n) { return this.on(t, null, e, n); }, unbind: function(t, e) { return this.off(t, null, e); }, delegate: function(t, e, n, r) { return this.on(e, t, n, r); }, undelegate: function(t, e, n) { return 1 === arguments.length ? this.off(t, "**") : this.off(e, t || "**", n); } });
    var an, sn, un = oe.now(), cn = /\?/, ln = /#.*$/, fn = /([?&])_=[^&]*/, hn = /^(.*?):[ \t]*([^\r\n]*)$/gm, dn = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, pn = /^(?:GET|HEAD)$/, gn = /^\/\//, mn = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/, vn = oe.fn.load, yn = {}, bn = {}, xn = "*/".concat("*");
    try {
        sn = B.href;
    } catch (wn) {
        sn = U.createElement("a"), sn.href = "", sn = sn.href;
    }
    an = mn.exec(sn.toLowerCase()) || [], oe.fn.load = function(t, n, r) {
        if ("string" != typeof t && vn)return vn.apply(this, arguments);
        var i, o, a, s = this, u = t.indexOf(" ");
        return u >= 0 && (i = t.slice(u), t = t.slice(0, u)), oe.isFunction(n) ? (r = n, n = e) : n && "object" == typeof n && (o = "POST"), s.length > 0 && oe.ajax({ url: t, type: o, dataType: "html", data: n }).done(function(t) { a = arguments, s.html(i ? oe("<div>").append(oe.parseHTML(t)).find(i) : t); }).complete(r && function(t, e) { s.each(r, a || [t.responseText, e, t]); }), this;
    }, oe.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(t, e) { oe.fn[e] = function(t) { return this.on(e, t); }; }), oe.extend({
        active: 0,
        lastModified: {},
        etag: {},
        ajaxSettings: { url: sn, type: "GET", isLocal: dn.test(an[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: { "*": xn, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript" }, contents: { xml: /xml/, html: /html/, json: /json/ }, responseFields: { xml: "responseXML", text: "responseText", json: "responseJSON" }, converters: { "* text": String, "text html": !0, "text json": oe.parseJSON, "text xml": oe.parseXML }, flatOptions: { url: !0, context: !0 } },
        ajaxSetup: function(t, e) { return e ? $($(t, oe.ajaxSettings), e) : $(oe.ajaxSettings, t); },
        ajaxPrefilter: C(yn),
        ajaxTransport: C(bn),
        ajax: function(t, n) {

            function r(t, n, r, s) {
                var c, f, y, b, w, M = n;
                2 !== x && (x = 2, u && clearTimeout(u), i = e, a = s || "", _.readyState = t > 0 ? 4 : 0, c = t >= 200 && 300 > t || 304 === t, r && (b = A(h, _, r)), b = N(h, b, _, c), c ? (h.ifModified && (w = _.getResponseHeader("Last-Modified"), w && (oe.lastModified[o] = w), w = _.getResponseHeader("etag"), w && (oe.etag[o] = w)), 204 === t || "HEAD" === h.type ? M = "nocontent" : 304 === t ? M = "notmodified" : (M = b.state, f = b.data, y = b.error, c = !y)) : (y = M, (t || !M) && (M = "error", 0 > t && (t = 0))), _.status = t, _.statusText = (n || M) + "", c ? g.resolveWith(d, [f, M, _]) : g.rejectWith(d, [_, M, y]), _.statusCode(v), v = e, l && p.trigger(c ? "ajaxSuccess" : "ajaxError", [_, h, c ? f : y]), m.fireWith(d, [_, M]), l && (p.trigger("ajaxComplete", [_, h]), --oe.active || oe.event.trigger("ajaxStop")));
            }

            "object" == typeof t && (n = t, t = e), n = n || {};
            var i,
                o,
                a,
                s,
                u,
                c,
                l,
                f,
                h = oe.ajaxSetup({}, n),
                d = h.context || h,
                p = h.context && (d.nodeType || d.jquery) ? oe(d) : oe.event,
                g = oe.Deferred(),
                m = oe.Callbacks("once memory"),
                v = h.statusCode || {},
                y = {},
                b = {},
                x = 0,
                w = "canceled",
                _ = {
                    readyState: 0,
                    getResponseHeader: function(t) {
                        var e;
                        if (2 === x) {
                            if (!s)for (s = {}; e = hn.exec(a);)s[e[1].toLowerCase()] = e[2];
                            e = s[t.toLowerCase()];
                        }
                        return null == e ? null : e;
                    },
                    getAllResponseHeaders: function() { return 2 === x ? a : null; },
                    setRequestHeader: function(t, e) {
                        var n = t.toLowerCase();
                        return x || (t = b[n] = b[n] || t, y[t] = e), this;
                    },
                    overrideMimeType: function(t) { return x || (h.mimeType = t), this; },
                    statusCode: function(t) {
                        var e;
                        if (t)
                            if (2 > x)for (e in t)v[e] = [v[e], t[e]];
                            else _.always(t[_.status]);
                        return this;
                    },
                    abort: function(t) {
                        var e = t || w;
                        return i && i.abort(e), r(0, e), this;
                    }
                };
            if (g.promise(_).complete = m.add, _.success = _.done, _.error = _.fail, h.url = ((t || h.url || sn) + "").replace(ln, "").replace(gn, an[1] + "//"), h.type = n.method || n.type || h.method || h.type, h.dataTypes = oe.trim(h.dataType || "*").toLowerCase().match(se) || [""], null == h.crossDomain && (c = mn.exec(h.url.toLowerCase()), h.crossDomain = !(!c || c[1] === an[1] && c[2] === an[2] && (c[3] || ("http:" === c[1] ? "80" : "443")) === (an[3] || ("http:" === an[1] ? "80" : "443")))), h.data && h.processData && "string" != typeof h.data && (h.data = oe.param(h.data, h.traditional)), D(yn, h, n, _), 2 === x)return _;
            l = h.global, l && 0 === oe.active++ && oe.event.trigger("ajaxStart"), h.type = h.type.toUpperCase(), h.hasContent = !pn.test(h.type), o = h.url, h.hasContent || (h.data && (o = h.url += (cn.test(o) ? "&" : "?") + h.data, delete h.data), h.cache === !1 && (h.url = fn.test(o) ? o.replace(fn, "$1_=" + un++) : o + (cn.test(o) ? "&" : "?") + "_=" + un++)), h.ifModified && (oe.lastModified[o] && _.setRequestHeader("If-Modified-Since", oe.lastModified[o]), oe.etag[o] && _.setRequestHeader("If-None-Match", oe.etag[o])), (h.data && h.hasContent && h.contentType !== !1 || n.contentType) && _.setRequestHeader("Content-Type", h.contentType), _.setRequestHeader("Accept", h.dataTypes[0] && h.accepts[h.dataTypes[0]] ? h.accepts[h.dataTypes[0]] + ("*" !== h.dataTypes[0] ? ", " + xn + "; q=0.01" : "") : h.accepts["*"]);
            for (f in h.headers)_.setRequestHeader(f, h.headers[f]);
            if (h.beforeSend && (h.beforeSend.call(d, _, h) === !1 || 2 === x))return _.abort();
            w = "abort";
            for (f in{ success: 1, error: 1, complete: 1 })_[f](h[f]);
            if (i = D(bn, h, n, _)) {
                _.readyState = 1, l && p.trigger("ajaxSend", [_, h]), h.async && h.timeout > 0 && (u = setTimeout(function() { _.abort("timeout"); }, h.timeout));
                try {
                    x = 1, i.send(y, r);
                } catch (M) {
                    if (!(2 > x))throw M;
                    r(-1, M);
                }
            } else r(-1, "No Transport");
            return _;
        },
        getJSON: function(t, e, n) { return oe.get(t, e, n, "json"); },
        getScript: function(t, n) { return oe.get(t, e, n, "script"); }
    }), oe.each(["get", "post"], function(t, n) { oe[n] = function(t, r, i, o) { return oe.isFunction(r) && (o = o || i, i = r, r = e), oe.ajax({ url: t, type: n, dataType: o, data: r, success: i }); }; }), oe.ajaxSetup({ accepts: { script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript" }, contents: { script: /(?:java|ecma)script/ }, converters: { "text script": function(t) { return oe.globalEval(t), t; } } }), oe.ajaxPrefilter("script", function(t) { t.cache === e && (t.cache = !1), t.crossDomain && (t.type = "GET"); }), oe.ajaxTransport("script", function(t) {
        if (t.crossDomain) {
            var e, n;
            return{ send: function(r, i) { e = oe("<script>").prop({ async: !0, charset: t.scriptCharset, src: t.url }).on("load error", n = function(t) { e.remove(), n = null, t && i("error" === t.type ? 404 : 200, t.type); }), U.head.appendChild(e[0]); }, abort: function() { n && n(); } };
        }
    });
    var _n = [], Mn = /(=)\?(?=&|$)|\?\?/;
    oe.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            var t = _n.pop() || oe.expando + "_" + un++;
            return this[t] = !0, t;
        }
    }), oe.ajaxPrefilter("json jsonp", function(n, r, i) {
        var o, a, s, u = n.jsonp !== !1 && (Mn.test(n.url) ? "url" : "string" == typeof n.data && !(n.contentType || "").indexOf("application/x-www-form-urlencoded") && Mn.test(n.data) && "data");
        return u || "jsonp" === n.dataTypes[0] ? (o = n.jsonpCallback = oe.isFunction(n.jsonpCallback) ? n.jsonpCallback() : n.jsonpCallback, u ? n[u] = n[u].replace(Mn, "$1" + o) : n.jsonp !== !1 && (n.url += (cn.test(n.url) ? "&" : "?") + n.jsonp + "=" + o), n.converters["script json"] = function() { return s || oe.error(o + " was not called"), s[0]; }, n.dataTypes[0] = "json", a = t[o], t[o] = function() { s = arguments; }, i.always(function() { t[o] = a, n[o] && (n.jsonpCallback = r.jsonpCallback, _n.push(o)), s && oe.isFunction(a) && a(s[0]), s = a = e; }), "script") : void 0;
    }), oe.ajaxSettings.xhr = function() {
        try {
            return new XMLHttpRequest;
        } catch (t) {
        }
    };
    var kn = oe.ajaxSettings.xhr(), Sn = { 0: 200, 1223: 204 }, Tn = 0, En = {};
    t.ActiveXObject && oe(t).on("unload", function() {
        for (var t in En)En[t]();
        En = e;
    }), oe.support.cors = !!kn && "withCredentials" in kn, oe.support.ajax = kn = !!kn, oe.ajaxTransport(function(t) {
        var n;
        return oe.support.cors || kn && !t.crossDomain ? {
            send: function(r, i) {
                var o, a, s = t.xhr();
                if (s.open(t.type, t.url, t.async, t.username, t.password), t.xhrFields)for (o in t.xhrFields)s[o] = t.xhrFields[o];
                t.mimeType && s.overrideMimeType && s.overrideMimeType(t.mimeType), t.crossDomain || r["X-Requested-With"] || (r["X-Requested-With"] = "XMLHttpRequest");
                for (o in r)s.setRequestHeader(o, r[o]);
                n = function(t) { return function() { n && (delete En[a], n = s.onload = s.onerror = null, "abort" === t ? s.abort() : "error" === t ? i(s.status || 404, s.statusText) : i(Sn[s.status] || s.status, s.statusText, "string" == typeof s.responseText ? { text: s.responseText } : e, s.getAllResponseHeaders())); }; }, s.onload = n(), s.onerror = n("error"), n = En[a = Tn++] = n("abort"), s.send(t.hasContent && t.data || null);
            },
            abort: function() { n && n(); }
        } : void 0;
    });
    var Cn,
        Dn,
        $n = /^(?:toggle|show|hide)$/,
        An = new RegExp("^(?:([+-])=|)(" + ae + ")([a-z%]*)$", "i"),
        Nn = /queueHooks$/,
        Ln = [P],
        jn = {
            "*": [
                function(t, e) {
                    var n = this.createTween(t, e), r = n.cur(), i = An.exec(e), o = i && i[3] || (oe.cssNumber[t] ? "" : "px"), a = (oe.cssNumber[t] || "px" !== o && +r) && An.exec(oe.css(n.elem, t)), s = 1, u = 20;
                    if (a && a[3] !== o) {
                        o = o || a[3], i = i || [], a = +r || 1;
                        do s = s || ".5", a /= s, oe.style(n.elem, t, a + o);
                        while (s !== (s = n.cur() / r) && 1 !== s && --u);
                    }
                    return i && (a = n.start = +a || +r || 0, n.unit = o, n.end = i[1] ? a + (i[1] + 1) * i[2] : +i[2]), n;
                }
            ]
        };
    oe.Animation = oe.extend(O, {
        tweener: function(t, e) {
            oe.isFunction(t) ? (e = t, t = ["*"]) : t = t.split(" ");
            for (var n, r = 0, i = t.length; i > r; r++)n = t[r], jn[n] = jn[n] || [], jn[n].unshift(e);
        },
        prefilter: function(t, e) { e ? Ln.unshift(t) : Ln.push(t); }
    }), oe.Tween = R, R.prototype = {
        constructor: R,
        init: function(t, e, n, r, i, o) { this.elem = t, this.prop = n, this.easing = i || "swing", this.options = e, this.start = this.now = this.cur(), this.end = r, this.unit = o || (oe.cssNumber[n] ? "" : "px"); },
        cur: function() {
            var t = R.propHooks[this.prop];
            return t && t.get ? t.get(this) : R.propHooks._default.get(this);
        },
        run: function(t) {
            var e, n = R.propHooks[this.prop];
            return this.pos = e = this.options.duration ? oe.easing[this.easing](t, this.options.duration * t, 0, 1, this.options.duration) : t, this.now = (this.end - this.start) * e + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : R.propHooks._default.set(this), this;
        }
    }, R.prototype.init.prototype = R.prototype, R.propHooks = {
        _default: {
            get: function(t) {
                var e;
                return null == t.elem[t.prop] || t.elem.style && null != t.elem.style[t.prop] ? (e = oe.css(t.elem, t.prop, ""), e && "auto" !== e ? e : 0) : t.elem[t.prop];
            },
            set: function(t) { oe.fx.step[t.prop] ? oe.fx.step[t.prop](t) : t.elem.style && (null != t.elem.style[oe.cssProps[t.prop]] || oe.cssHooks[t.prop]) ? oe.style(t.elem, t.prop, t.now + t.unit) : t.elem[t.prop] = t.now; }
        }
    }, R.propHooks.scrollTop = R.propHooks.scrollLeft = { set: function(t) { t.elem.nodeType && t.elem.parentNode && (t.elem[t.prop] = t.now); } }, oe.each(["toggle", "show", "hide"], function(t, e) {
        var n = oe.fn[e];
        oe.fn[e] = function(t, r, i) { return null == t || "boolean" == typeof t ? n.apply(this, arguments) : this.animate(z(e, !0), t, r, i); };
    }), oe.fn.extend({
        fadeTo: function(t, e, n, r) { return this.filter(b).css("opacity", 0).show().end().animate({ opacity: e }, t, n, r); },
        animate: function(t, e, n, r) {
            var i = oe.isEmptyObject(t),
                o = oe.speed(e, n, r),
                a = function() {
                    var e = O(this, oe.extend({}, t), o);
                    (i || me.get(this, "finish")) && e.stop(!0);
                };
            return a.finish = a, i || o.queue === !1 ? this.each(a) : this.queue(o.queue, a);
        },
        stop: function(t, n, r) {
            var i = function(t) {
                var e = t.stop;
                delete t.stop, e(r);
            };
            return"string" != typeof t && (r = n, n = t, t = e), n && t !== !1 && this.queue(t || "fx", []), this.each(function() {
                var e = !0, n = null != t && t + "queueHooks", o = oe.timers, a = me.get(this);
                if (n)a[n] && a[n].stop && i(a[n]);
                else for (n in a)a[n] && a[n].stop && Nn.test(n) && i(a[n]);
                for (n = o.length; n--;)o[n].elem !== this || null != t && o[n].queue !== t || (o[n].anim.stop(r), e = !1, o.splice(n, 1));
                (e || !r) && oe.dequeue(this, t);
            });
        },
        finish: function(t) {
            return t !== !1 && (t = t || "fx"), this.each(function() {
                var e, n = me.get(this), r = n[t + "queue"], i = n[t + "queueHooks"], o = oe.timers, a = r ? r.length : 0;
                for (n.finish = !0, oe.queue(this, t, []), i && i.stop && i.stop.call(this, !0), e = o.length; e--;)o[e].elem === this && o[e].queue === t && (o[e].anim.stop(!0), o.splice(e, 1));
                for (e = 0; a > e; e++)r[e] && r[e].finish && r[e].finish.call(this);
                delete n.finish;
            });
        }
    }), oe.each({ slideDown: z("show"), slideUp: z("hide"), slideToggle: z("toggle"), fadeIn: { opacity: "show" }, fadeOut: { opacity: "hide" }, fadeToggle: { opacity: "toggle" } }, function(t, e) { oe.fn[t] = function(t, n, r) { return this.animate(e, t, n, r); }; }), oe.speed = function(t, e, n) {
        var r = t && "object" == typeof t ? oe.extend({}, t) : { complete: n || !n && e || oe.isFunction(t) && t, duration: t, easing: n && e || e && !oe.isFunction(e) && e };
        return r.duration = oe.fx.off ? 0 : "number" == typeof r.duration ? r.duration : r.duration in oe.fx.speeds ? oe.fx.speeds[r.duration] : oe.fx.speeds._default, (null == r.queue || r.queue === !0) && (r.queue = "fx"), r.old = r.complete, r.complete = function() { oe.isFunction(r.old) && r.old.call(this), r.queue && oe.dequeue(this, r.queue); }, r;
    }, oe.easing = { linear: function(t) { return t; }, swing: function(t) { return .5 - Math.cos(t * Math.PI) / 2; } }, oe.timers = [], oe.fx = R.prototype.init, oe.fx.tick = function() {
        var t, n = oe.timers, r = 0;
        for (Cn = oe.now(); r < n.length; r++)t = n[r], t() || n[r] !== t || n.splice(r--, 1);
        n.length || oe.fx.stop(), Cn = e;
    }, oe.fx.timer = function(t) { t() && oe.timers.push(t) && oe.fx.start(); }, oe.fx.interval = 13, oe.fx.start = function() { Dn || (Dn = setInterval(oe.fx.tick, oe.fx.interval)); }, oe.fx.stop = function() { clearInterval(Dn), Dn = null; }, oe.fx.speeds = { slow: 600, fast: 200, _default: 400 }, oe.fx.step = {}, oe.expr && oe.expr.filters && (oe.expr.filters.animated = function(t) { return oe.grep(oe.timers, function(e) { return t === e.elem; }).length; }), oe.fn.offset = function(t) {
        if (arguments.length)return t === e ? this : this.each(function(e) { oe.offset.setOffset(this, t, e); });
        var n, r, i = this[0], o = { top: 0, left: 0 }, a = i && i.ownerDocument;
        if (a)return n = a.documentElement, oe.contains(n, i) ? (typeof i.getBoundingClientRect !== Y && (o = i.getBoundingClientRect()), r = I(a), { top: o.top + r.pageYOffset - n.clientTop, left: o.left + r.pageXOffset - n.clientLeft }) : o;
    }, oe.offset = {
        setOffset: function(t, e, n) {
            var r, i, o, a, s, u, c, l = oe.css(t, "position"), f = oe(t), h = {};
            "static" === l && (t.style.position = "relative"), s = f.offset(), o = oe.css(t, "top"), u = oe.css(t, "left"), c = ("absolute" === l || "fixed" === l) && (o + u).indexOf("auto") > -1, c ? (r = f.position(), a = r.top, i = r.left) : (a = parseFloat(o) || 0, i = parseFloat(u) || 0), oe.isFunction(e) && (e = e.call(t, n, s)), null != e.top && (h.top = e.top - s.top + a), null != e.left && (h.left = e.left - s.left + i), "using" in e ? e.using.call(t, h) : f.css(h);
        }
    }, oe.fn.extend({
        position: function() {
            if (this[0]) {
                var t, e, n = this[0], r = { top: 0, left: 0 };
                return"fixed" === oe.css(n, "position") ? e = n.getBoundingClientRect() : (t = this.offsetParent(), e = this.offset(), oe.nodeName(t[0], "html") || (r = t.offset()), r.top += oe.css(t[0], "borderTopWidth", !0), r.left += oe.css(t[0], "borderLeftWidth", !0)), { top: e.top - r.top - oe.css(n, "marginTop", !0), left: e.left - r.left - oe.css(n, "marginLeft", !0) };
            }
        },
        offsetParent: function() {
            return this.map(function() {
                for (var t = this.offsetParent || W; t && !oe.nodeName(t, "html") && "static" === oe.css(t, "position");)t = t.offsetParent;
                return t || W;
            });
        }
    }), oe.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(n, r) {
        var i = "pageYOffset" === r;
        oe.fn[n] = function(o) {
            return oe.access(this, function(n, o, a) {
                var s = I(n);
                return a === e ? s ? s[r] : n[o] : (s ? s.scrollTo(i ? t.pageXOffset : a, i ? a : t.pageYOffset) : n[o] = a, void 0);
            }, n, o, arguments.length, null);
        };
    }), oe.each({ Height: "height", Width: "width" }, function(t, n) {
        oe.each({ padding: "inner" + t, content: n, "": "outer" + t }, function(r, i) {
            oe.fn[i] = function(i, o) {
                var a = arguments.length && (r || "boolean" != typeof i), s = r || (i === !0 || o === !0 ? "margin" : "border");
                return oe.access(this, function(n, r, i) {
                    var o;
                    return oe.isWindow(n) ? n.document.documentElement["client" + t] : 9 === n.nodeType ? (o = n.documentElement, Math.max(n.body["scroll" + t], o["scroll" + t], n.body["offset" + t], o["offset" + t], o["client" + t])) : i === e ? oe.css(n, r, s) : oe.style(n, r, i, s);
                }, n, a ? i : e, a, null);
            };
        });
    }), oe.fn.size = function() { return this.length; }, oe.fn.andSelf = oe.fn.addBack, "object" == typeof module && module && "object" == typeof module.exports ? module.exports = oe : "function" == typeof define && define.amd && define("jquery", [], function() { return oe; }), "object" == typeof t && "object" == typeof t.document && (t.jQuery = t.$ = oe);
}(window), function(t) {
    "use strict";

    function e() { return this instanceof e ? (this.size = 0, this.uid = 0, this.selectors = [], this.indexes = Object.create(this.indexes), this.activeIndexes = {}, void 0) : new e; }

    function n(t, e) { return t.id - e.id; }

    var r = t.document.documentElement, i = r.webkitMatchesSelector || r.mozMatchesSelector || r.oMatchesSelector || r.msMatchesSelector;
    e.prototype.matchesSelector = function(t, e) { return i.call(t, e); }, e.prototype.querySelectorAll = function(t, e) { return e.querySelectorAll(t); }, e.prototype.indexes = [];
    var o = /^#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
    e.prototype.indexes.push({
        name: "ID",
        selector: function(t) {
            var e;
            return(e = t.match(o)) ? e[0].slice(1) : void 0;
        },
        element: function(t) { return t.id ? [t.id] : void 0; }
    });
    var a = /^\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
    e.prototype.indexes.push({
        name: "CLASS",
        selector: function(t) {
            var e;
            return(e = t.match(a)) ? e[0].slice(1) : void 0;
        },
        element: function(t) {
            var e = t.className;
            if (e) {
                if ("string" == typeof e)return e.split(/\s/);
                if (e instanceof SVGAnimatedString)return e.baseVal.split(/\s/);
            }
        }
    });
    var s = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)/g;
    e.prototype.indexes.push({
        name: "TAG",
        selector: function(t) {
            var e;
            return(e = t.match(s)) ? e[0].toUpperCase() : void 0;
        },
        element: function(t) { return[t.nodeName.toUpperCase()]; }
    }), e.prototype.indexes["default"] = { name: "UNIVERSAL", selector: function() { return!0; }, element: function() { return[!0]; } };
    var u;
    u = "function" == typeof t.Map ? t.Map : function() {

        function t() { this.map = {}; }

        return t.prototype.get = function(t) { return this.map[t + " "]; }, t.prototype.set = function(t, e) { this.map[t + " "] = e; }, t;
    }();
    var c = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g;
    e.prototype.selectorIndexes = function(t) {
        var e, n, r, i, o = this.indexes.slice(0).concat(this.indexes["default"]), a = o.length, s = t, u = [];
        do
            if (c.exec(""), (n = c.exec(s)) && (s = n[3], n[2] || !s))
                for (e = 0; a > e; e++)
                    if (i = o[e], r = i.selector(n[1])) {
                        u.push({ index: i, key: r });
                        break;
                    }
        while (n);
        return u;
    }, e.prototype.logDefaultIndexUsed = function() {}, e.prototype.add = function(t, e) {
        var n, r, i, o, a, s, c, l, f = this.activeIndexes, h = this.selectors;
        if ("string" == typeof t) {
            for (n = { id: this.uid++, selector: t, data: e }, c = this.selectorIndexes(t), r = 0; r < c.length; r++)l = c[r], o = l.key, i = l.index, a = f[i.name], a || (a = f[i.name] = Object.create(i), a.keys = new u), i === this.indexes["default"] && this.logDefaultIndexUsed(n), s = a.keys.get(o), s || (s = [], a.keys.set(o, s)), s.push(n);
            this.size++, h.push(t);
        }
    }, e.prototype.remove = function(t, e) {
        if ("string" == typeof t) {
            var n, r, i, o, a, s, u, c, l, f = this.activeIndexes, h = {}, d = 1 === arguments.length;
            for (n = this.selectorIndexes(t), i = 0; i < n.length; i++)if (r = n[i], a = r.key, s = r.index, u = f[s.name], u && (c = u.keys.get(a)))for (o = c.length; o--;)l = c[o], l.selector !== t || !d && l.data !== e || (c.splice(o, 1), h[l.id] = !0);
            this.size -= Object.keys(h).length;
        }
    }, e.prototype.queryAll = function(t) {
        if (!this.selectors.length)return[];
        var e, r, i, o, a, s, u, c = {}, l = this.querySelectorAll(this.selectors.join(", "), t);
        for (e = 0, i = l.length; i > e; e++)for (a = l[e], s = this.matches(a), r = 0, o = s.length; o > r; r++)u = s[r], c[u.id] || (c[u.id] = { id: u.id, selector: u.selector, data: u.data, elements: [] }), c[u.id].elements.push(a);
        var f = [];
        for (s in c)f.push(c[s]);
        return f.sort(n);
    }, e.prototype.matches = function(t) {
        if (!t)return[];
        var e, r, i, o, a, s, u, c, l, f, h = this.activeIndexes, d = {}, p = [];
        for (a in h)if (s = h[a], u = s.element(t))for (e = 0, i = u.length; i > e; e++)if (c = s.keys.get(u[e]))for (r = 0, o = c.length; o > r; r++)l = c[r], f = l.id, !d[f] && this.matchesSelector(t, l.selector) && (d[f] = !0, p.push(l));
        return p.sort(n);
    }, t.SelectorSet = e;
}(window), function(t, e) {

    function n(t) {
        var e = [], n = t.target, r = t.handleObj.selectorSet;
        do {
            if (1 !== n.nodeType)break;
            var i = r.matches(n);
            i.length && e.push({ elem: n, handlers: i });
        } while (n = n.parentElement);
        return e;
    }

    function r(t) {
        for (var e, r = n(t), i = 0; (e = r[i++]) && !t.isPropagationStopped();) {
            t.currentTarget = e.elem;
            for (var o, a = 0; (o = e.handlers[a++]) && !t.isImmediatePropagationStopped();) {
                var s = o.data.apply(e.elem, arguments);
                void 0 !== s && (t.result = s, s === !1 && (t.preventDefault(), t.stopPropagation()));
            }
        }
    }

    function i(t, n) {
        var r, i, o;
        for (t = t.match(/\S+/g), r = t.length; r--;)i = t[r], o = e.event.special[i] || {}, i = o.delegateType || i, n(i);
    }

    var o = t.document, a = t.SelectorSet, s = e.event.add, u = e.event.remove, c = {};
    if (!a)throw"SelectorSet undefined - https://github.com/josh/jquery-selector-set";
    e.event.add = function(t, n, u, l, f) {
        var h = this;
        t !== o || n.match(/\./) || l || !f ? s.call(h, t, n, u, l, f) : i(n, function(n) {
            var i = c[n];
            i || (i = c[n] = { handler: r, selectorSet: new a }, i.selectorSet.matchesSelector = e.find.matchesSelector, s.call(h, t, n, i)), i.selectorSet.add(f, u), e.expr.cacheLength++, e.find.compile(f);
        });
    }, e.event.remove = function(t, e, n, r, a) {
        var s = this;
        t === o && !e.match(/\./) && r && i(e, function(t) {
            var e = c[t];
            e && e.selectorSet.remove(r, n);
        }), u.call(s, t, e, n, r, a);
    };
}(window, jQuery), function() { window.staff = $.Deferred(); }.call(this), function() {
    var t;
    t = /id|data-(hotkey|gotokey|remote)/, SelectorSet.prototype.logDefaultIndexUsed = function(e) { return e.selector.match(t) ? void 0 : staff.done(function() { return console.warn(e.selector, "could not be indexed"); }); };
}.call(this), function(t) {

    function e(e, r, i) {
        var o = this;
        return this.on("click.pjax", e, function(e) {
            var a = t.extend({}, h(r, i));
            a.container || (a.container = t(this).attr("data-pjax") || o), n(e, a);
        });
    }

    function n(e, n, r) {
        r = h(n, r);
        var o = e.currentTarget;
        if ("A" !== o.tagName.toUpperCase())throw"$.fn.pjax or $.pjax.click requires an anchor element";
        if (!(e.which > 1 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || location.protocol !== o.protocol || location.hostname !== o.hostname || o.hash && o.href.replace(o.hash, "") === location.href.replace(location.hash, "") || o.href === location.href + "#")) {
            var a = { url: o.href, container: t(o).attr("data-pjax"), target: o }, s = t.extend({}, a, r), u = t.Event("pjax:click");
            t(o).trigger(u, [s]), u.isDefaultPrevented() || (i(s), e.preventDefault());
        }
    }

    function r(e, n, r) {
        r = h(n, r);
        var o = e.currentTarget;
        if ("FORM" !== o.tagName.toUpperCase())throw"$.pjax.submit requires a form element";
        var a = { type: o.method.toUpperCase(), url: o.action, data: t(o).serializeArray(), container: t(o).attr("data-pjax"), target: o };
        i(t.extend({}, a, r)), e.preventDefault();
    }

    function i(e) {

        function n(e, n) {
            var i = t.Event(e, { relatedTarget: r });
            return s.trigger(i, n), !i.isDefaultPrevented();
        }

        e = t.extend(!0, {}, t.ajaxSettings, i.defaults, e), t.isFunction(e.url) && (e.url = e.url());
        var r = e.target, o = f(e.url).hash, s = e.context = d(e.container);
        e.data || (e.data = {}), e.data._pjax = s.selector;
        var u;
        e.beforeSend = function(t, r) { return"GET" !== r.type && (r.timeout = 0), t.setRequestHeader("X-PJAX", "true"), t.setRequestHeader("X-PJAX-Container", s.selector), n("pjax:beforeSend", [t, r]) ? (r.timeout > 0 && (u = setTimeout(function() { n("pjax:timeout", [t, e]) && t.abort("timeout"); }, r.timeout), r.timeout = 0), e.requestUrl = f(r.url).href, void 0) : !1; }, e.complete = function(t, r) { u && clearTimeout(u), n("pjax:complete", [t, r, e]), n("pjax:end", [t, e]); }, e.error = function(t, r, i) {
            var o = m("", t, e), s = n("pjax:error", [t, r, i, e]);
            "GET" == e.type && "abort" !== r && s && a(o.url);
        }, e.success = function(r, u, l) {
            var h = "function" == typeof t.pjax.defaults.version ? t.pjax.defaults.version() : t.pjax.defaults.version, d = l.getResponseHeader("X-PJAX-Version"), p = m(r, l, e);
            if (h && d && h !== d)return a(p.url), void 0;
            if (!p.contents)return a(p.url), void 0;
            i.state = { id: e.id || c(), url: p.url, title: p.title, container: s.selector, fragment: e.fragment, timeout: e.timeout }, (e.push || e.replace) && window.history.replaceState(i.state, p.title, p.url), document.activeElement.blur(), p.title && (document.title = p.title), s.html(p.contents);
            var g = s.find("input[autofocus], textarea[autofocus]").last()[0];
            if (g && document.activeElement !== g && g.focus(), v(p.scripts), "number" == typeof e.scrollTo && t(window).scrollTop(e.scrollTo), "" !== o) {
                var y = f(p.url);
                y.hash = o, i.state.url = y.href, window.history.replaceState(i.state, p.title, y.href);
                var b = t(y.hash);
                b.length && t(window).scrollTop(b.offset().top);
            }
            n("pjax:success", [r, u, l, e]);
        }, i.state || (i.state = { id: c(), url: window.location.href, title: document.title, container: s.selector, fragment: e.fragment, timeout: e.timeout }, window.history.replaceState(i.state, document.title));
        var h = i.xhr;
        h && h.readyState < 4 && (h.onreadystatechange = t.noop, h.abort()), i.options = e;
        var h = i.xhr = t.ajax(e);
        return h.readyState > 0 && (e.push && !e.replace && (y(i.state.id, s.clone().contents()), window.history.pushState(null, "", l(e.requestUrl))), n("pjax:start", [h, e]), n("pjax:send", [h, e])), i.xhr;
    }

    function o(e, n) {
        var r = { url: window.location.href, push: !1, replace: !0, scrollTo: !1 };
        return i(t.extend(r, h(e, n)));
    }

    function a(t) { window.history.replaceState(null, "", "#"), window.location.replace(t); }

    function s(e) {
        var n = e.state;
        if (n && n.container) {
            if (M && k == n.url)return;
            if (i.state.id === n.id)return;
            var r = t(n.container);
            if (r.length) {
                var o, s = T[n.id];
                i.state && (o = i.state.id < n.id ? "forward" : "back", b(o, i.state.id, r.clone().contents()));
                var u = t.Event("pjax:popstate", { state: n, direction: o });
                r.trigger(u);
                var c = { id: n.id, url: n.url, container: r, push: !1, fragment: n.fragment, timeout: n.timeout, scrollTo: !1 };
                s ? (r.trigger("pjax:start", [null, c]), n.title && (document.title = n.title), r.html(s), i.state = n, r.trigger("pjax:end", [null, c])) : i(c), r[0].offsetHeight;
            } else a(location.href);
        }
        M = !1;
    }

    function u(e) {
        var n = t.isFunction(e.url) ? e.url() : e.url, r = e.type ? e.type.toUpperCase() : "GET", i = t("<form>", { method: "GET" === r ? "GET" : "POST", action: n, style: "display:none" });
        "GET" !== r && "POST" !== r && i.append(t("<input>", { type: "hidden", name: "_method", value: r.toLowerCase() }));
        var o = e.data;
        if ("string" == typeof o)
            t.each(o.split("&"), function(e, n) {
                var r = n.split("=");
                i.append(t("<input>", { type: "hidden", name: r[0], value: r[1] }));
            });
        else if ("object" == typeof o)for (key in o)i.append(t("<input>", { type: "hidden", name: key, value: o[key] }));
        t(document.body).append(i), i.submit();
    }

    function c() { return(new Date).getTime(); }

    function l(t) { return t.replace(/\?_pjax=[^&]+&?/, "?").replace(/_pjax=[^&]+&?/, "").replace(/[\?&]$/, ""); }

    function f(t) {
        var e = document.createElement("a");
        return e.href = t, e;
    }

    function h(e, n) { return e && n ? n.container = e : n = t.isPlainObject(e) ? e : { container: e }, n.container && (n.container = d(n.container)), n; }

    function d(e) {
        if (e = t(e), e.length) {
            if ("" !== e.selector && e.context === document)return e;
            if (e.attr("id"))return t("#" + e.attr("id"));
            throw"cant get selector for pjax container!";
        }
        throw"no pjax container for " + e.selector;
    }

    function p(t, e) { return t.filter(e).add(t.find(e)); }

    function g(e) { return t.parseHTML(e, document, !0); }

    function m(e, n, r) {
        var i = {};
        if (i.url = l(n.getResponseHeader("X-PJAX-URL") || r.requestUrl), /<html/i.test(e))var o = t(g(e.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0])), a = t(g(e.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]));
        else var o = a = t(g(e));
        if (0 === a.length)return i;
        if (i.title = p(o, "title").last().text(), r.fragment) {
            if ("body" === r.fragment)var s = a;
            else var s = p(a, r.fragment).first();
            s.length && (i.contents = s.contents(), i.title || (i.title = s.attr("title") || s.data("title")));
        } else/<html/i.test(e) || (i.contents = a);
        return i.contents && (i.contents = i.contents.not(function() { return t(this).is("title"); }), i.contents.find("title").remove(), i.scripts = p(i.contents, "script[src]").remove(), i.contents = i.contents.not(i.scripts)), i.title && (i.title = t.trim(i.title)), i;
    }

    function v(e) {
        if (e) {
            var n = t("script[src]");
            e.each(function() {
                var e = this.src, r = n.filter(function() { return this.src === e; });
                if (!r.length) {
                    var i = document.createElement("script");
                    i.type = t(this).attr("type"), i.src = t(this).attr("src"), document.head.appendChild(i);
                }
            });
        }
    }

    function y(t, e) {
        for (T[t] = e, C.push(t); E.length;)delete T[E.shift()];
        for (; C.length > i.defaults.maxCacheLength;)delete T[C.shift()];
    }

    function b(t, e, n) {
        var r, i;
        T[e] = n, "forward" === t ? (r = C, i = E) : (r = E, i = C), r.push(e), (e = i.pop()) && delete T[e];
    }

    function x() {
        return t("meta").filter(function() {
            var e = t(this).attr("http-equiv");
            return e && "X-PJAX-VERSION" === e.toUpperCase();
        }).attr("content");
    }

    function w() { t.fn.pjax = e, t.pjax = i, t.pjax.enable = t.noop, t.pjax.disable = _, t.pjax.click = n, t.pjax.submit = r, t.pjax.reload = o, t.pjax.defaults = { timeout: 650, push: !0, replace: !1, type: "GET", dataType: "html", scrollTo: 0, maxCacheLength: 20, version: x }, t(window).on("popstate.pjax", s); }

    function _() { t.fn.pjax = function() { return this; }, t.pjax = u, t.pjax.enable = w, t.pjax.disable = t.noop, t.pjax.click = t.noop, t.pjax.submit = t.noop, t.pjax.reload = function() { window.location.reload(); }, t(window).off("popstate.pjax", s); }

    var M = !0, k = window.location.href, S = window.history.state;
    S && S.container && (i.state = S), "state" in window.history && (M = !1);
    var T = {}, E = [], C = [];
    t.inArray("state", t.event.props) < 0 && t.event.props.push("state"), t.support.pjax = window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/), t.support.pjax ? w() : _();
}(jQuery), function() {
    ("undefined" == typeof Zepto || null === Zepto) && $.ajaxSetup({
        beforeSend: function(t, e) {
            var n, r;
            if (e.global)return n = e.context || document, r = $.Event("ajaxBeforeSend"), $(n).trigger(r, [t, e]), r.isDefaultPrevented() ? !1 : r.result;
        }
    });
}.call(this), function() {
    var t, e, n, r, i;
    "undefined" != typeof Zepto && null !== Zepto ? (t = function(t) {
        var e, n, r, i;
        n = document.createEvent("Events");
        for (r in t)i = t[r], n[r] = i;
        return n.initEvent("" + t.type + ":prepare", !0, !0), e = function(e, r) { return function() { return e.apply(t), r.apply(n); }; }, n.preventDefault = e(t.preventDefault, n.preventDefault), n.stopPropagation = e(t.stopPropagation, n.stopPropagation), n.stopImmediatePropagation = e(t.stopImmediatePropagation, n.stopImmediatePropagation), t.target.dispatchEvent(n), n.result;
    }, window.addEventListener("click", t, !0), window.addEventListener("submit", t, !0)) : (e = null, n = function(t) {
        var n;
        t.timeStamp !== e && (n = t.type, t.type = "" + n + ":prepare", $.event.trigger(t, [], t.target, !1), t.type = n, e = t.timeStamp);
    }, r = function(t) { return function() { $(this).on("" + t + ".prepare", function() {}); }; }, i = function(t) {
        return function() {
            $(this).off("" + t + ".prepare", function() {});
        };
    }, $.event.special.click = { preDispatch: n }, $.event.special.submit = { preDispatch: n }, $.event.special["click:prepare"] = { setup: r("click"), teardown: i("click") }, $.event.special["submit:prepare"] = { setup: r("submit"), teardown: i("submit") });
}.call(this), function() { $(document).on("ajaxBeforeSend", function(t, e, n) { return n.dataType ? void 0 : e.setRequestHeader("Accept", "*/*;q=0.5, " + n.accepts.script); }); }.call(this), function() {
    $(document).on("click:prepare", "a[data-confirm], button[data-confirm]", function(t) {
        var e;
        (e = $(this).attr("data-confirm")) && (confirm(e) || (t.stopImmediatePropagation(), t.preventDefault()));
    });
}.call(this), function() {
    var t;
    $(document).on("ajaxBeforeSend", function(t, e, n) {
        var r;
        if (!n.crossDomain && "GET" !== n.type)return(r = $('meta[name="csrf-token"]').attr("content")) ? e.setRequestHeader("X-CSRF-Token", r) : void 0;
    }), $(document).on("submit:prepare", "form", function() {
        var e, n, r, i;
        e = $(this), e.is("form[data-remote]") || this.method && "GET" !== this.method.toUpperCase() && t(e.attr("action")) && (r = $('meta[name="csrf-param"]').attr("content"), i = $('meta[name="csrf-token"]').attr("content"), null != r && null != i && (e.find("input[name=" + r + "]")[0] || (n = document.createElement("input"), n.setAttribute("type", "hidden"), n.setAttribute("name", r), n.setAttribute("value", i), e.prepend(n))));
    }), t = function(t) {
        var e, n;
        return e = document.createElement("a"), e.href = t, n = e.href.split("/", 3).join("/"), 0 === location.href.indexOf(n);
    };
}.call(this), function() {
    $(document).on("submit:prepare", "form", function() {
        var t, e, n, r, i, o, a, s, u;
        for (s = $(this).find("input[type=submit][data-disable-with]"), r = 0, o = s.length; o > r; r++)e = s[r], e = $(e), e.attr("data-enable-with", e.val() || "Submit"), (n = e.attr("data-disable-with")) && e.val(n), e[0].disabled = !0;
        for (u = $(this).find("button[type=submit][data-disable-with]"), i = 0, a = u.length; a > i; i++)t = u[i], t = $(t), t.attr("data-enable-with", t.html() || ""), (n = t.attr("data-disable-with")) && t.html(n), t[0].disabled = !0;
    }), $(document).on("ajaxComplete", "form", function() {
        var t, e, n, r, i, o, a, s;
        for (a = $(this).find("input[type=submit][data-enable-with]"), n = 0, i = a.length; i > n; n++)e = a[n], $(e).val($(e).attr("data-enable-with")), e.disabled = !1;
        for (s = $(this).find("button[type=submit][data-enable-with]"), r = 0, o = s.length; o > r; r++)t = s[r], $(t).html($(t).attr("data-enable-with")), t.disabled = !1;
    });
}.call(this), function() {
    $(document).on("click", "a[data-method]", function(t) {
        var e, n, r, i;
        return e = $(this), e.is("a[data-remote]") || (i = e.attr("data-method").toLowerCase(), "get" === i) ? void 0 : (n = document.createElement("form"), n.method = "POST", n.action = e.attr("href"), n.style.display = "none", "post" !== i && (r = document.createElement("input"), r.setAttribute("type", "hidden"), r.setAttribute("name", "_method"), r.setAttribute("value", i), n.appendChild(r)), document.body.appendChild(n), $(n).submit(), t.preventDefault(), !1);
    });
}.call(this), function() {
    $(document).on("click", "a[data-remote]", function(t) {
        var e, n, r, i, o;
        return n = $(this), r = {}, r.context = this, (i = n.attr("data-method")) && (r.type = i), (o = this.href) && (r.url = o), (e = n.attr("data-type")) && (r.dataType = e), $.ajax(r), t.preventDefault(), !1;
    }), $(document).on("submit", "form[data-remote]", function(t) {
        var e, n, r, i, o, a;
        return r = $(this), i = {}, i.context = this, (o = r.attr("method")) && (i.type = o), (a = this.action) && (i.url = a), (e = r.serializeArray()) && (i.data = e), (n = r.attr("data-type")) && (i.dataType = n), $.ajax(i), t.preventDefault(), !1;
    }), $(document).on("ajaxSend", "[data-remote]", function(t, e) { $(this).data("remote-xhr", e); }), $(document).on("ajaxComplete", "[data-remote]", function() {
        var t;
        "function" == typeof(t = $(this)).removeData && t.removeData("remote-xhr");
    });
}.call(this), function() {
    var t;
    t = "form[data-remote] input[type=submit],\nform[data-remote] button[type=submit],\nform[data-remote] button:not([type]),\nform[data-remote-submit] input[type=submit],\nform[data-remote-submit] button[type=submit],\nform[data-remote-submit] button:not([type])", $(document).on("click", t, function() {
        var t, e, n, r, i, o;
        i = $(this), e = i.closest("form"), n = e.find(".js-submit-button-value"), (r = i.attr("name")) ? (t = i.is("input[type=submit]") ? "Submit" : "", o = i.val() || t, n[0] ? (n.attr("name", r), n.attr("value", o)) : (n = document.createElement("input"), n.setAttribute("type", "hidden"), n.setAttribute("name", r), n.setAttribute("value", o), n.setAttribute("class", "js-submit-button-value"), e.prepend(n))) : n.remove();
    });
}.call(this), function() {

    function t(e, n) { e instanceof t ? (this.enc = e.enc, this.pos = e.pos) : (this.enc = e, this.pos = n); }

    function e(t, e, n, r, i) { this.stream = t, this.header = e, this.length = n, this.tag = r, this.sub = i; }

    function n(t) {
        var e, n, r = "";
        for (e = 0; e + 3 <= t.length; e += 3)n = parseInt(t.substring(e, e + 3), 16), r += re.charAt(n >> 6) + re.charAt(63 & n);
        for (e + 1 == t.length ? (n = parseInt(t.substring(e, e + 1), 16), r += re.charAt(n << 2)) : e + 2 == t.length && (n = parseInt(t.substring(e, e + 2), 16), r += re.charAt(n >> 2) + re.charAt((3 & n) << 4)); (3 & r.length) > 0;)r += ie;
        return r;
    }

    function r(t) {
        var e, n, r = "", i = 0;
        for (e = 0; e < t.length && t.charAt(e) != ie; ++e)v = re.indexOf(t.charAt(e)), 0 > v || (0 == i ? (r += l(v >> 2), n = 3 & v, i = 1) : 1 == i ? (r += l(n << 2 | v >> 4), n = 15 & v, i = 2) : 2 == i ? (r += l(n), r += l(v >> 2), n = 3 & v, i = 3) : (r += l(n << 2 | v >> 4), r += l(15 & v), i = 0));
        return 1 == i && (r += l(n << 2)), r;
    }

    function i(t) {
        var e, n = r(t), i = new Array;
        for (e = 0; 2 * e < n.length; ++e)i[e] = parseInt(n.substring(2 * e, 2 * e + 2), 16);
        return i;
    }

    function o(t, e, n) { null != t && ("number" == typeof t ? this.fromNumber(t, e, n) : null == e && "string" != typeof t ? this.fromString(t, 256) : this.fromString(t, e)); }

    function a() { return new o(null); }

    function s(t, e, n, r, i, o) {
        for (; --o >= 0;) {
            var a = e * this[t++] + n[r] + i;
            i = Math.floor(a / 67108864), n[r++] = 67108863 & a;
        }
        return i;
    }

    function u(t, e, n, r, i, o) {
        for (var a = 32767 & e, s = e >> 15; --o >= 0;) {
            var u = 32767 & this[t], c = this[t++] >> 15, l = s * u + c * a;
            u = a * u + ((32767 & l) << 15) + n[r] + (1073741823 & i), i = (u >>> 30) + (l >>> 15) + s * c + (i >>> 30), n[r++] = 1073741823 & u;
        }
        return i;
    }

    function c(t, e, n, r, i, o) {
        for (var a = 16383 & e, s = e >> 14; --o >= 0;) {
            var u = 16383 & this[t], c = this[t++] >> 14, l = s * u + c * a;
            u = a * u + ((16383 & l) << 14) + n[r] + i, i = (u >> 28) + (l >> 14) + s * c, n[r++] = 268435455 & u;
        }
        return i;
    }

    function l(t) { return le.charAt(t); }

    function f(t, e) {
        var n = fe[t.charCodeAt(e)];
        return null == n ? -1 : n;
    }

    function h(t) {
        for (var e = this.t - 1; e >= 0; --e)t[e] = this[e];
        t.t = this.t, t.s = this.s;
    }

    function d(t) { this.t = 1, this.s = 0 > t ? -1 : 0, t > 0 ? this[0] = t : -1 > t ? this[0] = t + DV : this.t = 0; }

    function p(t) {
        var e = a();
        return e.fromInt(t), e;
    }

    function g(t, e) {
        var n;
        if (16 == e)n = 4;
        else if (8 == e)n = 3;
        else if (256 == e)n = 8;
        else if (2 == e)n = 1;
        else if (32 == e)n = 5;
        else {
            if (4 != e)return this.fromRadix(t, e), void 0;
            n = 2;
        }
        this.t = 0, this.s = 0;
        for (var r = t.length, i = !1, a = 0; --r >= 0;) {
            var s = 8 == n ? 255 & t[r] : f(t, r);
            0 > s ? "-" == t.charAt(r) && (i = !0) : (i = !1, 0 == a ? this[this.t++] = s : a + n > this.DB ? (this[this.t - 1] |= (s & (1 << this.DB - a) - 1) << a, this[this.t++] = s >> this.DB - a) : this[this.t - 1] |= s << a, a += n, a >= this.DB && (a -= this.DB));
        }
        8 == n && 0 != (128 & t[0]) && (this.s = -1, a > 0 && (this[this.t - 1] |= (1 << this.DB - a) - 1 << a)), this.clamp(), i && o.ZERO.subTo(this, this);
    }

    function m() { for (var t = this.s & this.DM; this.t > 0 && this[this.t - 1] == t;)--this.t; }

    function y(t) {
        if (this.s < 0)return"-" + this.negate().toString(t);
        var e;
        if (16 == t)e = 4;
        else if (8 == t)e = 3;
        else if (2 == t)e = 1;
        else if (32 == t)e = 5;
        else {
            if (4 != t)return this.toRadix(t);
            e = 2;
        }
        var n, r = (1 << e) - 1, i = !1, o = "", a = this.t, s = this.DB - a * this.DB % e;
        if (a-- > 0)for (s < this.DB && (n = this[a] >> s) > 0 && (i = !0, o = l(n)); a >= 0;)e > s ? (n = (this[a] & (1 << s) - 1) << e - s, n |= this[--a] >> (s += this.DB - e)) : (n = this[a] >> (s -= e) & r, 0 >= s && (s += this.DB, --a)), n > 0 && (i = !0), i && (o += l(n));
        return i ? o : "0";
    }

    function b() {
        var t = a();
        return o.ZERO.subTo(this, t), t;
    }

    function x() { return this.s < 0 ? this.negate() : this; }

    function w(t) {
        var e = this.s - t.s;
        if (0 != e)return e;
        var n = this.t;
        if (e = n - t.t, 0 != e)return this.s < 0 ? -e : e;
        for (; --n >= 0;)if (0 != (e = this[n] - t[n]))return e;
        return 0;
    }

    function _(t) {
        var e, n = 1;
        return 0 != (e = t >>> 16) && (t = e, n += 16), 0 != (e = t >> 8) && (t = e, n += 8), 0 != (e = t >> 4) && (t = e, n += 4), 0 != (e = t >> 2) && (t = e, n += 2), 0 != (e = t >> 1) && (t = e, n += 1), n;
    }

    function M() { return this.t <= 0 ? 0 : this.DB * (this.t - 1) + _(this[this.t - 1] ^ this.s & this.DM); }

    function k(t, e) {
        var n;
        for (n = this.t - 1; n >= 0; --n)e[n + t] = this[n];
        for (n = t - 1; n >= 0; --n)e[n] = 0;
        e.t = this.t + t, e.s = this.s;
    }

    function S(t, e) {
        for (var n = t; n < this.t; ++n)e[n - t] = this[n];
        e.t = Math.max(this.t - t, 0), e.s = this.s;
    }

    function T(t, e) {
        var n, r = t % this.DB, i = this.DB - r, o = (1 << i) - 1, a = Math.floor(t / this.DB), s = this.s << r & this.DM;
        for (n = this.t - 1; n >= 0; --n)e[n + a + 1] = this[n] >> i | s, s = (this[n] & o) << r;
        for (n = a - 1; n >= 0; --n)e[n] = 0;
        e[a] = s, e.t = this.t + a + 1, e.s = this.s, e.clamp();
    }

    function E(t, e) {
        e.s = this.s;
        var n = Math.floor(t / this.DB);
        if (n >= this.t)return e.t = 0, void 0;
        var r = t % this.DB, i = this.DB - r, o = (1 << r) - 1;
        e[0] = this[n] >> r;
        for (var a = n + 1; a < this.t; ++a)e[a - n - 1] |= (this[a] & o) << i, e[a - n] = this[a] >> r;
        r > 0 && (e[this.t - n - 1] |= (this.s & o) << i), e.t = this.t - n, e.clamp();
    }

    function C(t, e) {
        for (var n = 0, r = 0, i = Math.min(t.t, this.t); i > n;)r += this[n] - t[n], e[n++] = r & this.DM, r >>= this.DB;
        if (t.t < this.t) {
            for (r -= t.s; n < this.t;)r += this[n], e[n++] = r & this.DM, r >>= this.DB;
            r += this.s;
        } else {
            for (r += this.s; n < t.t;)r -= t[n], e[n++] = r & this.DM, r >>= this.DB;
            r -= t.s;
        }
        e.s = 0 > r ? -1 : 0, -1 > r ? e[n++] = this.DV + r : r > 0 && (e[n++] = r), e.t = n, e.clamp();
    }

    function D(t, e) {
        var n = this.abs(), r = t.abs(), i = n.t;
        for (e.t = i + r.t; --i >= 0;)e[i] = 0;
        for (i = 0; i < r.t; ++i)e[i + n.t] = n.am(0, r[i], e, i, 0, n.t);
        e.s = 0, e.clamp(), this.s != t.s && o.ZERO.subTo(e, e);
    }

    function $(t) {
        for (var e = this.abs(), n = t.t = 2 * e.t; --n >= 0;)t[n] = 0;
        for (n = 0; n < e.t - 1; ++n) {
            var r = e.am(n, e[n], t, 2 * n, 0, 1);
            (t[n + e.t] += e.am(n + 1, 2 * e[n], t, 2 * n + 1, r, e.t - n - 1)) >= e.DV && (t[n + e.t] -= e.DV, t[n + e.t + 1] = 1);
        }
        t.t > 0 && (t[t.t - 1] += e.am(n, e[n], t, 2 * n, 0, 1)), t.s = 0, t.clamp();
    }

    function A(t, e, n) {
        var r = t.abs();
        if (!(r.t <= 0)) {
            var i = this.abs();
            if (i.t < r.t)return null != e && e.fromInt(0), null != n && this.copyTo(n), void 0;
            null == n && (n = a());
            var s = a(), u = this.s, c = t.s, l = this.DB - _(r[r.t - 1]);
            l > 0 ? (r.lShiftTo(l, s), i.lShiftTo(l, n)) : (r.copyTo(s), i.copyTo(n));
            var f = s.t, h = s[f - 1];
            if (0 != h) {
                var d = h * (1 << this.F1) + (f > 1 ? s[f - 2] >> this.F2 : 0), p = this.FV / d, g = (1 << this.F1) / d, m = 1 << this.F2, v = n.t, y = v - f, b = null == e ? a() : e;
                for (s.dlShiftTo(y, b), n.compareTo(b) >= 0 && (n[n.t++] = 1, n.subTo(b, n)), o.ONE.dlShiftTo(f, b), b.subTo(s, s); s.t < f;)s[s.t++] = 0;
                for (; --y >= 0;) {
                    var x = n[--v] == h ? this.DM : Math.floor(n[v] * p + (n[v - 1] + m) * g);
                    if ((n[v] += s.am(0, x, n, y, 0, f)) < x)for (s.dlShiftTo(y, b), n.subTo(b, n); n[v] < --x;)n.subTo(b, n);
                }
                null != e && (n.drShiftTo(f, e), u != c && o.ZERO.subTo(e, e)), n.t = f, n.clamp(), l > 0 && n.rShiftTo(l, n), 0 > u && o.ZERO.subTo(n, n);
            }
        }
    }

    function N(t) {
        var e = a();
        return this.abs().divRemTo(t, null, e), this.s < 0 && e.compareTo(o.ZERO) > 0 && t.subTo(e, e), e;
    }

    function L(t) { this.m = t; }

    function j(t) { return t.s < 0 || t.compareTo(this.m) >= 0 ? t.mod(this.m) : t; }

    function O(t) { return t; }

    function F(t) { t.divRemTo(this.m, null, t); }

    function P(t, e, n) { t.multiplyTo(e, n), this.reduce(n); }

    function R(t, e) { t.squareTo(e), this.reduce(e); }

    function z() {
        if (this.t < 1)return 0;
        var t = this[0];
        if (0 == (1 & t))return 0;
        var e = 3 & t;
        return e = 15 & e * (2 - (15 & t) * e), e = 255 & e * (2 - (255 & t) * e), e = 65535 & e * (2 - (65535 & (65535 & t) * e)), e = e * (2 - t * e % this.DV) % this.DV, e > 0 ? this.DV - e : -e;
    }

    function I(t) { this.m = t, this.mp = t.invDigit(), this.mpl = 32767 & this.mp, this.mph = this.mp >> 15, this.um = (1 << t.DB - 15) - 1, this.mt2 = 2 * t.t; }

    function q(t) {
        var e = a();
        return t.abs().dlShiftTo(this.m.t, e), e.divRemTo(this.m, null, e), t.s < 0 && e.compareTo(o.ZERO) > 0 && this.m.subTo(e, e), e;
    }

    function H(t) {
        var e = a();
        return t.copyTo(e), this.reduce(e), e;
    }

    function Y(t) {
        for (; t.t <= this.mt2;)t[t.t++] = 0;
        for (var e = 0; e < this.m.t; ++e) {
            var n = 32767 & t[e], r = n * this.mpl + ((n * this.mph + (t[e] >> 15) * this.mpl & this.um) << 15) & t.DM;
            for (n = e + this.m.t, t[n] += this.m.am(0, r, t, e, 0, this.m.t); t[n] >= t.DV;)t[n] -= t.DV, t[++n]++;
        }
        t.clamp(), t.drShiftTo(this.m.t, t), t.compareTo(this.m) >= 0 && t.subTo(this.m, t);
    }

    function B(t, e) { t.squareTo(e), this.reduce(e); }

    function U(t, e, n) { t.multiplyTo(e, n), this.reduce(n); }

    function W() { return 0 == (this.t > 0 ? 1 & this[0] : this.s); }

    function V(t, e) {
        if (t > 4294967295 || 1 > t)return o.ONE;
        var n = a(), r = a(), i = e.convert(this), s = _(t) - 1;
        for (i.copyTo(n); --s >= 0;)
            if (e.sqrTo(n, r), (t & 1 << s) > 0)e.mulTo(r, i, n);
            else {
                var u = n;
                n = r, r = u;
            }
        return e.revert(n);
    }

    function X(t, e) {
        var n;
        return n = 256 > t || e.isEven() ? new L(e) : new I(e), this.exp(t, n);
    }

    function Z(t, e) { return new o(t, e); }

    function G(t, e) {
        if (e < t.length + 11)return alert("Message too long for RSA"), null;
        for (var n = new Array, r = t.length - 1; r >= 0 && e > 0;) {
            var i = t.charCodeAt(r--);
            128 > i ? n[--e] = i : i > 127 && 2048 > i ? (n[--e] = 128 | 63 & i, n[--e] = 192 | i >> 6) : (n[--e] = 128 | 63 & i, n[--e] = 128 | 63 & i >> 6, n[--e] = 224 | i >> 12);
        }
        n[--e] = 0;
        for (var a = 0, s = 0, u = 0; e > 2;)0 == u && (s = he.random.randomWords(1, 0)[0]), a = 255 & s >> u, u = (u + 8) % 32, 0 != a && (n[--e] = a);
        return n[--e] = 2, n[--e] = 0, new o(n);
    }

    function K() { this.n = null, this.e = 0, this.d = null, this.p = null, this.q = null, this.dmp1 = null, this.dmq1 = null, this.coeff = null; }

    function J(t, e) { null != t && null != e && t.length > 0 && e.length > 0 ? (this.n = Z(t, 16), this.e = parseInt(e, 16)) : alert("Invalid RSA public key"); }

    function Q(t) { return t.modPowInt(this.e, this.n); }

    function te(t) {
        var e = G(t, this.n.bitLength() + 7 >> 3);
        if (null == e)return null;
        var n = this.doPublic(e);
        if (null == n)return null;
        var r = n.toString(16);
        return 0 == (1 & r.length) ? r : "0" + r;
    }

    function ee(t) {
        var e = this.encrypt(t);
        return e ? n(e) : null;
    }

    t.prototype.get = function(t) {
        if (void 0 == t && (t = this.pos++), t >= this.enc.length)throw"Requesting byte offset " + t + " on a stream of length " + this.enc.length;
        return this.enc[t];
    }, t.prototype.hexDigits = "0123456789ABCDEF", t.prototype.hexByte = function(t) { return this.hexDigits.charAt(15 & t >> 4) + this.hexDigits.charAt(15 & t); }, t.prototype.hexDump = function(t, e) {
        for (var n = "", r = t; e > r; ++r)
            switch (n += this.hexByte(this.get(r)), 15 & r) {
            case 7:
                n += "  ";
                break;
            case 15:
                n += "\n";
                break;
            default:
                n += " ";
            }
        return n;
    }, t.prototype.parseStringISO = function(t, e) {
        for (var n = "", r = t; e > r; ++r)n += String.fromCharCode(this.get(r));
        return n;
    }, t.prototype.parseStringUTF = function(t, e) {
        for (var n = "", r = 0, i = t; e > i;) {
            var r = this.get(i++);
            n += 128 > r ? String.fromCharCode(r) : r > 191 && 224 > r ? String.fromCharCode((31 & r) << 6 | 63 & this.get(i++)) : String.fromCharCode((15 & r) << 12 | (63 & this.get(i++)) << 6 | 63 & this.get(i++));
        }
        return n;
    }, t.prototype.reTime = /^((?:1[89]|2\d)?\d\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])([01]\d|2[0-3])(?:([0-5]\d)(?:([0-5]\d)(?:[.,](\d{1,3}))?)?)?(Z|[-+](?:[0]\d|1[0-2])([0-5]\d)?)?$/, t.prototype.parseTime = function(t, e) {
        var n = this.parseStringISO(t, e), r = this.reTime.exec(n);
        return r ? (n = r[1] + "-" + r[2] + "-" + r[3] + " " + r[4], r[5] && (n += ":" + r[5], r[6] && (n += ":" + r[6], r[7] && (n += "." + r[7]))), r[8] && (n += " UTC", "Z" != r[8] && (n += r[8], r[9] && (n += ":" + r[9]))), n) : "Unrecognized time: " + n;
    }, t.prototype.parseInteger = function(t, e) {
        var n = e - t;
        if (n > 4) {
            n <<= 3;
            var r = this.get(t);
            if (0 == r)n -= 8;
            else for (; 128 > r;)r <<= 1, --n;
            return"(" + n + " bit)";
        }
        for (var i = 0, o = t; e > o; ++o)i = i << 8 | this.get(o);
        return i;
    }, t.prototype.parseBitString = function(t, e) {
        var n = this.get(t), r = (e - t - 1 << 3) - n, i = "(" + r + " bit)";
        if (20 >= r) {
            var o = n;
            i += " ";
            for (var a = e - 1; a > t; --a) {
                for (var s = this.get(a), u = o; 8 > u; ++u)i += 1 & s >> u ? "1" : "0";
                o = 0;
            }
        }
        return i;
    }, t.prototype.parseOctetString = function(t, e) {
        var n = e - t, r = "(" + n + " byte) ";
        n > 20 && (e = t + 20);
        for (var i = t; e > i; ++i)r += this.hexByte(this.get(i));
        return n > 20 && (r += String.fromCharCode(8230)), r;
    }, t.prototype.parseOID = function(t, e) {
        for (var n, r = 0, i = 0, o = t; e > o; ++o) {
            var a = this.get(o);
            r = r << 7 | 127 & a, i += 7, 128 & a || (void 0 == n ? n = parseInt(r / 40) + "." + r % 40 : n += "." + (i >= 31 ? "bigint" : r), r = i = 0), n += String.fromCharCode();
        }
        return n;
    }, e.prototype.typeName = function() {
        if (void 0 == this.tag)return"unknown";
        var t = this.tag >> 6;
        1 & this.tag >> 5;
        var e = 31 & this.tag;
        switch (t) {
        case 0:
            switch (e) {
            case 0:
                return"EOC";
            case 1:
                return"BOOLEAN";
            case 2:
                return"INTEGER";
            case 3:
                return"BIT_STRING";
            case 4:
                return"OCTET_STRING";
            case 5:
                return"NULL";
            case 6:
                return"OBJECT_IDENTIFIER";
            case 7:
                return"ObjectDescriptor";
            case 8:
                return"EXTERNAL";
            case 9:
                return"REAL";
            case 10:
                return"ENUMERATED";
            case 11:
                return"EMBEDDED_PDV";
            case 12:
                return"UTF8String";
            case 16:
                return"SEQUENCE";
            case 17:
                return"SET";
            case 18:
                return"NumericString";
            case 19:
                return"PrintableString";
            case 20:
                return"TeletexString";
            case 21:
                return"VideotexString";
            case 22:
                return"IA5String";
            case 23:
                return"UTCTime";
            case 24:
                return"GeneralizedTime";
            case 25:
                return"GraphicString";
            case 26:
                return"VisibleString";
            case 27:
                return"GeneralString";
            case 28:
                return"UniversalString";
            case 30:
                return"BMPString";
            default:
                return"Universal_" + e.toString(16);
            }
        case 1:
            return"Application_" + e.toString(16);
        case 2:
            return"[" + e + "]";
        case 3:
            return"Private_" + e.toString(16);
        }
    }, e.prototype.content = function() {
        if (void 0 == this.tag)return null;
        var t = this.tag >> 6;
        if (0 != t)return null == this.sub ? null : "(" + this.sub.length + ")";
        var e = 31 & this.tag, n = this.posContent(), r = Math.abs(this.length);
        switch (e) {
        case 1:
            return 0 == this.stream.get(n) ? "false" : "true";
        case 2:
            return this.stream.parseInteger(n, n + r);
        case 3:
            return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseBitString(n, n + r);
        case 4:
            return this.sub ? "(" + this.sub.length + " elem)" : this.stream.parseOctetString(n, n + r);
        case 6:
            return this.stream.parseOID(n, n + r);
        case 16:
        case 17:
            return"(" + this.sub.length + " elem)";
        case 12:
            return this.stream.parseStringUTF(n, n + r);
        case 18:
        case 19:
        case 20:
        case 21:
        case 22:
        case 26:
            return this.stream.parseStringISO(n, n + r);
        case 23:
        case 24:
            return this.stream.parseTime(n, n + r);
        }
        return null;
    }, e.prototype.toString = function() { return this.typeName() + "@" + this.stream.pos + "[header:" + this.header + ",length:" + this.length + ",sub:" + (null == this.sub ? "null" : this.sub.length) + "]"; }, e.prototype.print = function(t) {
        if (void 0 == t && (t = ""), document.writeln(t + this), null != this.sub) {
            t += "  ";
            for (var e = 0, n = this.sub.length; n > e; ++e)this.sub[e].print(t);
        }
    }, e.prototype.toPrettyString = function(t) {
        void 0 == t && (t = "");
        var e = t + this.typeName() + " @" + this.stream.pos;
        if (this.length >= 0 && (e += "+"), e += this.length, 32 & this.tag ? e += " (constructed)" : 3 != this.tag && 4 != this.tag || null == this.sub || (e += " (encapsulates)"), e += "\n", null != this.sub) {
            t += "  ";
            for (var n = 0, r = this.sub.length; r > n; ++n)e += this.sub[n].toPrettyString(t);
        }
        return e;
    }, e.prototype.posStart = function() { return this.stream.pos; }, e.prototype.posContent = function() { return this.stream.pos + this.header; }, e.prototype.posEnd = function() { return this.stream.pos + this.header + Math.abs(this.length); }, e.decodeLength = function(t) {
        var e = t.get(), n = 127 & e;
        if (n == e)return n;
        if (n > 3)throw"Length over 24 bits not supported at position " + (t.pos - 1);
        if (0 == n)return-1;
        e = 0;
        for (var r = 0; n > r; ++r)e = e << 8 | t.get();
        return e;
    }, e.hasContent = function(n, r, i) {
        if (32 & n)return!0;
        if (3 > n || n > 4)return!1;
        var o = new t(i);
        3 == n && o.get();
        var a = o.get();
        if (1 & a >> 6)return!1;
        try {
            var s = e.decodeLength(o);
            return o.pos - i.pos + s == r;
        } catch (u) {
            return!1;
        }
    }, e.decode = function(n) {
        n instanceof t || (n = new t(n, 0));
        var r = new t(n), i = n.get(), o = e.decodeLength(n), a = n.pos - r.pos, s = null;
        if (e.hasContent(i, o, n)) {
            var u = n.pos;
            if (3 == i && n.get(), s = [], o >= 0) {
                for (var c = u + o; n.pos < c;)s[s.length] = e.decode(n);
                if (n.pos != c)throw"Content size is not correct for container starting at offset " + u;
            } else
                try {
                    for (;;) {
                        var l = e.decode(n);
                        if (0 == l.tag)break;
                        s[s.length] = l;
                    }
                    o = u - n.pos;
                } catch (f) {
                    throw"Exception while decoding undefined length content: " + f;
                }
        } else n.pos += o;
        return new e(r, a, o, i, s);
    };
    var ne, re = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ie = "=", oe = 0xdeadbeefcafe, ae = 15715070 == (16777215 & oe);
    ae && "Microsoft Internet Explorer" == navigator.appName ? (o.prototype.am = u, ne = 30) : ae && "Netscape" != navigator.appName ? (o.prototype.am = s, ne = 26) : (o.prototype.am = c, ne = 28), o.prototype.DB = ne, o.prototype.DM = (1 << ne) - 1, o.prototype.DV = 1 << ne;
    var se = 52;
    o.prototype.FV = Math.pow(2, se), o.prototype.F1 = se - ne, o.prototype.F2 = 2 * ne - se;
    var ue, ce, le = "0123456789abcdefghijklmnopqrstuvwxyz", fe = new Array;
    for (ue = "0".charCodeAt(0), ce = 0; 9 >= ce; ++ce)fe[ue++] = ce;
    for (ue = "a".charCodeAt(0), ce = 10; 36 > ce; ++ce)fe[ue++] = ce;
    for (ue = "A".charCodeAt(0), ce = 10; 36 > ce; ++ce)fe[ue++] = ce;
    L.prototype.convert = j, L.prototype.revert = O, L.prototype.reduce = F, L.prototype.mulTo = P, L.prototype.sqrTo = R, I.prototype.convert = q, I.prototype.revert = H, I.prototype.reduce = Y, I.prototype.mulTo = U, I.prototype.sqrTo = B, o.prototype.copyTo = h, o.prototype.fromInt = d, o.prototype.fromString = g, o.prototype.clamp = m, o.prototype.dlShiftTo = k, o.prototype.drShiftTo = S, o.prototype.lShiftTo = T, o.prototype.rShiftTo = E, o.prototype.subTo = C, o.prototype.multiplyTo = D, o.prototype.squareTo = $, o.prototype.divRemTo = A, o.prototype.invDigit = z, o.prototype.isEven = W, o.prototype.exp = V, o.prototype.toString = y, o.prototype.negate = b, o.prototype.abs = x, o.prototype.compareTo = w, o.prototype.bitLength = M, o.prototype.mod = N, o.prototype.modPowInt = X, o.ZERO = p(0), o.ONE = p(1), K.prototype.doPublic = Q, K.prototype.setPublic = J, K.prototype.encrypt = te, K.prototype.encrypt_b64 = ee;
    var he = { cipher: {}, hash: {}, keyexchange: {}, mode: {}, misc: {}, codec: {}, exception: { corrupt: function(t) { this.toString = function() { return"CORRUPT: " + this.message; }, this.message = t; }, invalid: function(t) { this.toString = function() { return"INVALID: " + this.message; }, this.message = t; }, bug: function(t) { this.toString = function() { return"BUG: " + this.message; }, this.message = t; }, notReady: function(t) { this.toString = function() { return"NOT READY: " + this.message; }, this.message = t; } } };
    "undefined" != typeof module && module.exports && (module.exports = he), he.cipher.aes = function(t) {
        this._tables[0][0][0] || this._precompute();
        var e, n, r, i, o, a = this._tables[0][4], s = this._tables[1], u = t.length, c = 1;
        if (4 !== u && 6 !== u && 8 !== u)throw new he.exception.invalid("invalid aes key size");
        for (this._key = [i = t.slice(0), o = []], e = u; 4 * u + 28 > e; e++)r = i[e - 1], (0 === e % u || 8 === u && 4 === e % u) && (r = a[r >>> 24] << 24 ^ a[255 & r >> 16] << 16 ^ a[255 & r >> 8] << 8 ^ a[255 & r], 0 === e % u && (r = r << 8 ^ r >>> 24 ^ c << 24, c = c << 1 ^ 283 * (c >> 7))), i[e] = i[e - u] ^ r;
        for (n = 0; e; n++, e--)r = i[3 & n ? e : e - 4], o[n] = 4 >= e || 4 > n ? r : s[0][a[r >>> 24]] ^ s[1][a[255 & r >> 16]] ^ s[2][a[255 & r >> 8]] ^ s[3][a[255 & r]];
    }, he.cipher.aes.prototype = {
        encrypt: function(t) { return this._crypt(t, 0); },
        decrypt: function(t) { return this._crypt(t, 1); },
        _tables: [[[], [], [], [], []], [[], [], [], [], []]],
        _precompute: function() {
            var t, e, n, r, i, o, a, s, u, c = this._tables[0], l = this._tables[1], f = c[4], h = l[4], d = [], p = [];
            for (t = 0; 256 > t; t++)p[(d[t] = t << 1 ^ 283 * (t >> 7)) ^ t] = t;
            for (e = n = 0; !f[e]; e ^= r || 1, n = p[n] || 1)for (a = n ^ n << 1 ^ n << 2 ^ n << 3 ^ n << 4, a = 99 ^ (a >> 8 ^ 255 & a), f[e] = a, h[a] = e, o = d[i = d[r = d[e]]], u = 16843009 * o ^ 65537 * i ^ 257 * r ^ 16843008 * e, s = 257 * d[a] ^ 16843008 * a, t = 0; 4 > t; t++)c[t][e] = s = s << 24 ^ s >>> 8, l[t][a] = u = u << 24 ^ u >>> 8;
            for (t = 0; 5 > t; t++)c[t] = c[t].slice(0), l[t] = l[t].slice(0);
        },
        _crypt: function(t, e) {
            if (4 !== t.length)throw new he.exception.invalid("invalid aes block size");
            var n, r, i, o, a = this._key[e], s = t[0] ^ a[0], u = t[e ? 3 : 1] ^ a[1], c = t[2] ^ a[2], l = t[e ? 1 : 3] ^ a[3], f = a.length / 4 - 2, h = 4, d = [0, 0, 0, 0], p = this._tables[e], g = p[0], m = p[1], v = p[2], y = p[3], b = p[4];
            for (o = 0; f > o; o++)n = g[s >>> 24] ^ m[255 & u >> 16] ^ v[255 & c >> 8] ^ y[255 & l] ^ a[h], r = g[u >>> 24] ^ m[255 & c >> 16] ^ v[255 & l >> 8] ^ y[255 & s] ^ a[h + 1], i = g[c >>> 24] ^ m[255 & l >> 16] ^ v[255 & s >> 8] ^ y[255 & u] ^ a[h + 2], l = g[l >>> 24] ^ m[255 & s >> 16] ^ v[255 & u >> 8] ^ y[255 & c] ^ a[h + 3], h += 4, s = n, u = r, c = i;
            for (o = 0; 4 > o; o++)d[e ? 3 & -o : o] = b[s >>> 24] << 24 ^ b[255 & u >> 16] << 16 ^ b[255 & c >> 8] << 8 ^ b[255 & l] ^ a[h++], n = s, s = u, u = c, c = l, l = n;
            return d;
        }
    }, he.bitArray = {
        bitSlice: function(t, e, n) { return t = he.bitArray._shiftRight(t.slice(e / 32), 32 - (31 & e)).slice(1), void 0 === n ? t : he.bitArray.clamp(t, n - e); },
        extract: function(t, e, n) {
            var r, i = Math.floor(31 & -e - n);
            return r = -32 & (e + n - 1 ^ e) ? t[0 | e / 32] << 32 - i ^ t[0 | e / 32 + 1] >>> i : t[0 | e / 32] >>> i, r & (1 << n) - 1;
        },
        concat: function(t, e) {
            if (0 === t.length || 0 === e.length)return t.concat(e);
            var n = t[t.length - 1], r = he.bitArray.getPartial(n);
            return 32 === r ? t.concat(e) : he.bitArray._shiftRight(e, r, 0 | n, t.slice(0, t.length - 1));
        },
        bitLength: function(t) {
            var e, n = t.length;
            return 0 === n ? 0 : (e = t[n - 1], 32 * (n - 1) + he.bitArray.getPartial(e));
        },
        clamp: function(t, e) {
            if (32 * t.length < e)return t;
            t = t.slice(0, Math.ceil(e / 32));
            var n = t.length;
            return e = 31 & e, n > 0 && e && (t[n - 1] = he.bitArray.partial(e, t[n - 1] & 2147483648 >> e - 1, 1)), t;
        },
        partial: function(t, e, n) { return 32 === t ? e : (n ? 0 | e : e << 32 - t) + 1099511627776 * t; },
        getPartial: function(t) { return Math.round(t / 1099511627776) || 32; },
        equal: function(t, e) {
            if (he.bitArray.bitLength(t) !== he.bitArray.bitLength(e))return!1;
            var n, r = 0;
            for (n = 0; n < t.length; n++)r |= t[n] ^ e[n];
            return 0 === r;
        },
        _shiftRight: function(t, e, n, r) {
            var i, o, a = 0;
            for (void 0 === r && (r = []); e >= 32; e -= 32)r.push(n), n = 0;
            if (0 === e)return r.concat(t);
            for (i = 0; i < t.length; i++)r.push(n | t[i] >>> e), n = t[i] << 32 - e;
            return a = t.length ? t[t.length - 1] : 0, o = he.bitArray.getPartial(a), r.push(he.bitArray.partial(31 & e + o, e + o > 32 ? n : r.pop(), 1)), r;
        },
        _xor4: function(t, e) { return[t[0] ^ e[0], t[1] ^ e[1], t[2] ^ e[2], t[3] ^ e[3]]; }
    }, he.codec.hex = {
        fromBits: function(t) {
            var e, n = "";
            for (e = 0; e < t.length; e++)n += ((0 | t[e]) + 0xf00000000000).toString(16).substr(4);
            return n.substr(0, he.bitArray.bitLength(t) / 4);
        },
        toBits: function(t) {
            var e, n, r = [];
            for (t = t.replace(/\s|0x/g, ""), n = t.length, t += "00000000", e = 0; e < t.length; e += 8)r.push(0 ^ parseInt(t.substr(e, 8), 16));
            return he.bitArray.clamp(r, 4 * n);
        }
    }, he.codec.utf8String = {
        fromBits: function(t) {
            var e, n, r = "", i = he.bitArray.bitLength(t);
            for (e = 0; i / 8 > e; e++)0 === (3 & e) && (n = t[e / 4]), r += String.fromCharCode(n >>> 24), n <<= 8;
            return decodeURIComponent(escape(r));
        },
        toBits: function(t) {
            t = unescape(encodeURIComponent(t));
            var e, n = [], r = 0;
            for (e = 0; e < t.length; e++)r = r << 8 | t.charCodeAt(e), 3 === (3 & e) && (n.push(r), r = 0);
            return 3 & e && n.push(he.bitArray.partial(8 * (3 & e), r)), n;
        }
    }, he.codec.base64 = {
        _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        fromBits: function(t, e, n) {
            var r, i = "", o = 0, a = he.codec.base64._chars, s = 0, u = he.bitArray.bitLength(t);
            for (n && (a = a.substr(0, 62) + "-_"), r = 0; 6 * i.length < u;)i += a.charAt((s ^ t[r] >>> o) >>> 26), 6 > o ? (s = t[r] << 6 - o, o += 26, r++) : (s <<= 6, o -= 6);
            for (; 3 & i.length && !e;)i += "=";
            return i;
        },
        toBits: function(t, e) {
            t = t.replace(/\s|=/g, "");
            var n, r, i = [], o = 0, a = he.codec.base64._chars, s = 0;
            for (e && (a = a.substr(0, 62) + "-_"), n = 0; n < t.length; n++) {
                if (r = a.indexOf(t.charAt(n)), 0 > r)throw new he.exception.invalid("this isn't base64!");
                o > 26 ? (o -= 26, i.push(s ^ r >>> o), s = r << 32 - o) : (o += 6, s ^= r << 32 - o);
            }
            return 56 & o && i.push(he.bitArray.partial(56 & o, s, 1)), i;
        }
    }, he.codec.base64url = { fromBits: function(t) { return he.codec.base64.fromBits(t, 1, 1); }, toBits: function(t) { return he.codec.base64.toBits(t, 1); } }, void 0 === he.beware && (he.beware = {}), he.beware["CBC mode is dangerous because it doesn't protect message integrity."] = function() {
        he.mode.cbc = {
            name: "cbc",
            encrypt: function(t, e, n, r) {
                if (r && r.length)throw new he.exception.invalid("cbc can't authenticate data");
                if (128 !== he.bitArray.bitLength(n))throw new he.exception.invalid("cbc iv must be 128 bits");
                var i, o = he.bitArray, a = o._xor4, s = o.bitLength(e), u = 0, c = [];
                if (7 & s)throw new he.exception.invalid("pkcs#5 padding only works for multiples of a byte");
                for (i = 0; s >= u + 128; i += 4, u += 128)n = t.encrypt(a(n, e.slice(i, i + 4))), c.splice(i, 0, n[0], n[1], n[2], n[3]);
                return s = 16843009 * (16 - (15 & s >> 3)), n = t.encrypt(a(n, o.concat(e, [s, s, s, s]).slice(i, i + 4))), c.splice(i, 0, n[0], n[1], n[2], n[3]), c;
            },
            decrypt: function(t, e, n, r) {
                if (r && r.length)throw new he.exception.invalid("cbc can't authenticate data");
                if (128 !== he.bitArray.bitLength(n))throw new he.exception.invalid("cbc iv must be 128 bits");
                if (127 & he.bitArray.bitLength(e) || !e.length)throw new he.exception.corrupt("cbc ciphertext must be a positive multiple of the block size");
                var i, o, a, s = he.bitArray, u = s._xor4, c = [];
                for (r = r || [], i = 0; i < e.length; i += 4)o = e.slice(i, i + 4), a = u(n, t.decrypt(o)), c.splice(i, 0, a[0], a[1], a[2], a[3]), n = o;
                if (o = 255 & c[i - 1], 0 == o || o > 16)throw new he.exception.corrupt("pkcs#5 padding corrupt");
                if (a = 16843009 * o, !s.equal(s.bitSlice([a, a, a, a], 0, 8 * o), s.bitSlice(c, 32 * c.length - 8 * o, 32 * c.length)))throw new he.exception.corrupt("pkcs#5 padding corrupt");
                return s.bitSlice(c, 0, 32 * c.length - 8 * o);
            }
        };
    }, he.misc.hmac = function(t, e) {
        this._hash = e = e || he.hash.sha256;
        var n, r = [[], []], i = e.prototype.blockSize / 32;
        for (this._baseHash = [new e, new e], t.length > i && (t = e.hash(t)), n = 0; i > n; n++)r[0][n] = 909522486 ^ t[n], r[1][n] = 1549556828 ^ t[n];
        this._baseHash[0].update(r[0]), this._baseHash[1].update(r[1]);
    }, he.misc.hmac.prototype.encrypt = he.misc.hmac.prototype.mac = function(t, e) {
        var n = new this._hash(this._baseHash[0]).update(t, e).finalize();
        return new this._hash(this._baseHash[1]).update(n).finalize();
    }, he.hash.sha256 = function(t) { this._key[0] || this._precompute(), t ? (this._h = t._h.slice(0), this._buffer = t._buffer.slice(0), this._length = t._length) : this.reset(); }, he.hash.sha256.hash = function(t) { return(new he.hash.sha256).update(t).finalize(); }, he.hash.sha256.prototype = {
        blockSize: 512,
        reset: function() { return this._h = this._init.slice(0), this._buffer = [], this._length = 0, this; },
        update: function(t) {
            "string" == typeof t && (t = he.codec.utf8String.toBits(t));
            var e, n = this._buffer = he.bitArray.concat(this._buffer, t), r = this._length, i = this._length = r + he.bitArray.bitLength(t);
            for (e = -512 & 512 + r; i >= e; e += 512)this._block(n.splice(0, 16));
            return this;
        },
        finalize: function() {
            var t, e = this._buffer, n = this._h;
            for (e = he.bitArray.concat(e, [he.bitArray.partial(1, 1)]), t = e.length + 2; 15 & t; t++)e.push(0);
            for (e.push(Math.floor(this._length / 4294967296)), e.push(0 | this._length); e.length;)this._block(e.splice(0, 16));
            return this.reset(), n;
        },
        _init: [],
        _key: [],
        _precompute: function() {

            function t(t) { return 0 | 4294967296 * (t - Math.floor(t)); }

            var e, n = 0, r = 2;
            t:for (; 64 > n; r++) {
                for (e = 2; r >= e * e; e++)if (0 === r % e)continue t;
                8 > n && (this._init[n] = t(Math.pow(r, .5))), this._key[n] = t(Math.pow(r, 1 / 3)), n++;
            }
        },
        _block: function(t) {
            var e, n, r, i, o = t.slice(0), a = this._h, s = this._key, u = a[0], c = a[1], l = a[2], f = a[3], h = a[4], d = a[5], p = a[6], g = a[7];
            for (e = 0; 64 > e; e++)16 > e ? n = o[e] : (r = o[15 & e + 1], i = o[15 & e + 14], n = o[15 & e] = 0 | (r >>> 7 ^ r >>> 18 ^ r >>> 3 ^ r << 25 ^ r << 14) + (i >>> 17 ^ i >>> 19 ^ i >>> 10 ^ i << 15 ^ i << 13) + o[15 & e] + o[15 & e + 9]), n = n + g + (h >>> 6 ^ h >>> 11 ^ h >>> 25 ^ h << 26 ^ h << 21 ^ h << 7) + (p ^ h & (d ^ p)) + s[e], g = p, p = d, d = h, h = 0 | f + n, f = l, l = c, c = u, u = 0 | n + (c & l ^ f & (c ^ l)) + (c >>> 2 ^ c >>> 13 ^ c >>> 22 ^ c << 30 ^ c << 19 ^ c << 10);
            a[0] = 0 | a[0] + u, a[1] = 0 | a[1] + c, a[2] = 0 | a[2] + l, a[3] = 0 | a[3] + f, a[4] = 0 | a[4] + h, a[5] = 0 | a[5] + d, a[6] = 0 | a[6] + p, a[7] = 0 | a[7] + g;
        }
    }, he.random = {
        randomWords: function(t, e) {
            var n, r, i = [], o = this.isReady(e);
            if (o === this._NOT_READY)throw new he.exception.notReady("generator isn't seeded");
            for (o & this._REQUIRES_RESEED && this._reseedFromPools(!(o & this._READY)), n = 0; t > n; n += 4)0 === (n + 1) % this._MAX_WORDS_PER_BURST && this._gate(), r = this._gen4words(), i.push(r[0], r[1], r[2], r[3]);
            return this._gate(), i.slice(0, t);
        },
        setDefaultParanoia: function(t) { this._defaultParanoia = t; },
        addEntropy: function(t, e, n) {
            n = n || "user";
            var r, i, o, a = (new Date).valueOf(), s = this._robins[n], u = this.isReady(), c = 0;
            switch (r = this._collectorIds[n], void 0 === r && (r = this._collectorIds[n] = this._collectorIdNext++), void 0 === s && (s = this._robins[n] = 0), this._robins[n] = (this._robins[n] + 1) % this._pools.length, typeof t) {
            case"number":
                void 0 === e && (e = 1), this._pools[s].update([r, this._eventId++, 1, e, a, 1, 0 | t]);
                break;
            case"object":
                var l = Object.prototype.toString.call(t);
                if ("[object Uint32Array]" === l) {
                    for (o = [], i = 0; i < t.length; i++)o.push(t[i]);
                    t = o;
                } else for ("[object Array]" !== l && (c = 1), i = 0; i < t.length && !c; i++)"number" != typeof t[i] && (c = 1);
                if (!c) {
                    if (void 0 === e)for (e = 0, i = 0; i < t.length; i++)for (o = t[i]; o > 0;)e++, o >>>= 1;
                    this._pools[s].update([r, this._eventId++, 2, e, a, t.length].concat(t));
                }
                break;
            case"string":
                void 0 === e && (e = t.length), this._pools[s].update([r, this._eventId++, 3, e, a, t.length]), this._pools[s].update(t);
                break;
            default:
                c = 1;
            }
            if (c)throw new he.exception.bug("random: addEntropy only supports number, array of numbers or string");
            this._poolEntropy[s] += e, this._poolStrength += e, u === this._NOT_READY && (this.isReady() !== this._NOT_READY && this._fireEvent("seeded", Math.max(this._strength, this._poolStrength)), this._fireEvent("progress", this.getProgress()));
        },
        isReady: function(t) {
            var e = this._PARANOIA_LEVELS[void 0 !== t ? t : this._defaultParanoia];
            return this._strength && this._strength >= e ? this._poolEntropy[0] > this._BITS_PER_RESEED && (new Date).valueOf() > this._nextReseed ? this._REQUIRES_RESEED | this._READY : this._READY : this._poolStrength >= e ? this._REQUIRES_RESEED | this._NOT_READY : this._NOT_READY;
        },
        getProgress: function(t) {
            var e = this._PARANOIA_LEVELS[t ? t : this._defaultParanoia];
            return this._strength >= e ? 1 : this._poolStrength > e ? 1 : this._poolStrength / e;
        },
        startCollectors: function() {
            if (!this._collectorsStarted) {
                if (window.addEventListener)window.addEventListener("load", this._loadTimeCollector, !1), window.addEventListener("mousemove", this._mouseCollector, !1);
                else {
                    if (!document.attachEvent)throw new he.exception.bug("can't attach event");
                    document.attachEvent("onload", this._loadTimeCollector), document.attachEvent("onmousemove", this._mouseCollector);
                }
                this._collectorsStarted = !0;
            }
        },
        stopCollectors: function() { this._collectorsStarted && (window.removeEventListener ? (window.removeEventListener("load", this._loadTimeCollector, !1), window.removeEventListener("mousemove", this._mouseCollector, !1)) : window.detachEvent && (window.detachEvent("onload", this._loadTimeCollector), window.detachEvent("onmousemove", this._mouseCollector)), this._collectorsStarted = !1); },
        addEventListener: function(t, e) { this._callbacks[t][this._callbackI++] = e; },
        removeEventListener: function(t, e) {
            var n, r, i = this._callbacks[t], o = [];
            for (r in i)i.hasOwnProperty(r) && i[r] === e && o.push(r);
            for (n = 0; n < o.length; n++)r = o[n], delete i[r];
        },
        _pools: [new he.hash.sha256],
        _poolEntropy: [0],
        _reseedCount: 0,
        _robins: {},
        _eventId: 0,
        _collectorIds: {},
        _collectorIdNext: 0,
        _strength: 0,
        _poolStrength: 0,
        _nextReseed: 0,
        _key: [0, 0, 0, 0, 0, 0, 0, 0],
        _counter: [0, 0, 0, 0],
        _cipher: void 0,
        _defaultParanoia: 6,
        _collectorsStarted: !1,
        _callbacks: { progress: {}, seeded: {} },
        _callbackI: 0,
        _NOT_READY: 0,
        _READY: 1,
        _REQUIRES_RESEED: 2,
        _MAX_WORDS_PER_BURST: 65536,
        _PARANOIA_LEVELS: [0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024],
        _MILLISECONDS_PER_RESEED: 3e4,
        _BITS_PER_RESEED: 80,
        _gen4words: function() {
            for (var t = 0; 4 > t && (this._counter[t] = 0 | this._counter[t] + 1, !this._counter[t]); t++);
            return this._cipher.encrypt(this._counter);
        },
        _gate: function() { this._key = this._gen4words().concat(this._gen4words()), this._cipher = new he.cipher.aes(this._key); },
        _reseed: function(t) {
            this._key = he.hash.sha256.hash(this._key.concat(t)), this._cipher = new he.cipher.aes(this._key);
            for (var e = 0; 4 > e && (this._counter[e] = 0 | this._counter[e] + 1, !this._counter[e]); e++);
        },
        _reseedFromPools: function(t) {
            var e, n = [], r = 0;
            for (this._nextReseed = n[0] = (new Date).valueOf() + this._MILLISECONDS_PER_RESEED, e = 0; 16 > e; e++)n.push(0 | 4294967296 * Math.random());
            for (e = 0; e < this._pools.length && (n = n.concat(this._pools[e].finalize()), r += this._poolEntropy[e], this._poolEntropy[e] = 0, t || !(this._reseedCount & 1 << e)); e++);
            this._reseedCount >= 1 << this._pools.length && (this._pools.push(new he.hash.sha256), this._poolEntropy.push(0)), this._poolStrength -= r, r > this._strength && (this._strength = r), this._reseedCount++, this._reseed(n);
        },
        _mouseCollector: function(t) {
            var e = t.x || t.clientX || t.offsetX || 0, n = t.y || t.clientY || t.offsetY || 0;
            he.random.addEntropy([e, n], 2, "mouse");
        },
        _loadTimeCollector: function() { he.random.addEntropy((new Date).valueOf(), 2, "loadtime"); },
        _fireEvent: function(t, e) {
            var n, r = he.random._callbacks[t], i = [];
            for (n in r)r.hasOwnProperty(n) && i.push(r[n]);
            for (n = 0; n < i.length; n++)i[n](e);
        }
    }, function() {
        try {
            var t = new Uint32Array(32);
            crypto.getRandomValues(t), he.random.addEntropy(t, 1024, "crypto.getRandomValues");
        } catch (e) {
        }
    }(), function() { for (var t in he.beware)he.beware.hasOwnProperty(t) && he.beware[t](); }();
    var de = { sjcl: he, version: "1.3.3" };
    de.generateAesKey = function() {
        return{
            key: he.random.randomWords(8, 0),
            encrypt: function(t) { return this.encryptWithIv(t, he.random.randomWords(4, 0)); },
            encryptWithIv: function(t, e) {
                var n = new he.cipher.aes(this.key), r = he.codec.utf8String.toBits(t), i = he.mode.cbc.encrypt(n, r, e), o = he.bitArray.concat(e, i);
                return he.codec.base64.fromBits(o);
            }
        };
    }, de.create = function(t) { return new de.EncryptionClient(t); }, de.EncryptionClient = function(t) {
        var n = this, r = [];
        n.publicKey = t, n.version = de.version;
        var o = function(t, e) {
                var n, r, i;
                n = document.createElement(t);
                for (r in e)e.hasOwnProperty(r) && (i = e[r], n.setAttribute(r, i));
                return n;
            },
            a = function(t) { return window.jQuery && t instanceof jQuery ? t[0] : t.nodeType && 1 === t.nodeType ? t : document.getElementById(t); },
            s = function(t) {
                var e, n, r, i, o = [];
                if ("INTEGER" === t.typeName() && (e = t.posContent(), n = t.posEnd(), r = t.stream.hexDump(e, n).replace(/[ \n]/g, ""), o.push(r)), null !== t.sub)for (i = 0; i < t.sub.length; i++)o = o.concat(s(t.sub[i]));
                return o;
            },
            u = function(t) {
                var e, n, r = [], i = t.children;
                for (n = 0; n < i.length; n++)e = i[n], e.attributes["data-encrypted-name"] ? r.push(e) : e.children.length > 0 && (r = r.concat(u(e)));
                return r;
            },
            c = function() {
                var n, r, o, a, u;
                try {
                    n = i(t), r = e.decode(n);
                } catch (c) {
                    throw"Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'";
                }
                if (o = s(r), 2 !== o.length)throw"Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'";
                return a = o[0], u = o[1], rsa = new K, rsa.setPublic(a, u), rsa;
            },
            l = function() {
                return{
                    key: he.random.randomWords(8, 0),
                    sign: function(t) {
                        var e = new he.misc.hmac(this.key, he.hash.sha256), n = e.encrypt(t);
                        return he.codec.base64.fromBits(n);
                    }
                };
            };
        n.encrypt = function(t) {
            var e = c();
            return aes = de.generateAesKey(), hmac = l(), ciphertext = aes.encrypt(t), signature = hmac.sign(he.codec.base64.toBits(ciphertext)), combinedKey = he.bitArray.concat(aes.key, hmac.key), encodedKey = he.codec.base64.fromBits(combinedKey), encryptedKey = e.encrypt_b64(encodedKey), prefix = "$bt4|javascript_" + n.version.replace(/\./g, "_") + "$", prefix + encryptedKey + "$" + ciphertext + "$" + signature;
        }, n.encryptForm = function(t) {
            var e, i, s, c, l, f;
            for (t = a(t), f = u(t); r.length > 0;)t.removeChild(r[0]), r.splice(0, 1);
            for (l = 0; l < f.length; l++)e = f[l], s = e.getAttribute("data-encrypted-name"), i = n.encrypt(e.value), e.removeAttribute("name"), c = o("input", { value: i, type: "hidden", name: s }), r.push(c), t.appendChild(c);
        }, n.onSubmitEncryptForm = function(t, e) {
            var r;
            t = a(t), r = function(r) { return n.encryptForm(t), e ? e(r) : r; }, window.jQuery ? window.jQuery(t).submit(r) : t.addEventListener ? t.addEventListener("submit", r, !1) : t.attachEvent && t.attachEvent("onsubmit", r);
        }, n.formEncrypter = { encryptForm: n.encryptForm, extractForm: a, onSubmitEncryptForm: n.onSubmitEncryptForm }, he.random.startCollectors();
    }, window.Braintree = de, "function" == typeof define && define("braintree", function() { return de; });
}(), d3 = function() {

    function t(t) { return null != t && !isNaN(t); }

    function e(t) { return t.length; }

    function n(t) {
        for (var e = 1; t * e % 1;)e *= 10;
        return e;
    }

    function r(t, e) {
        try {
            for (var n in e)Object.defineProperty(t.prototype, n, { value: e[n], enumerable: !1 });
        } catch (r) {
            t.prototype = e;
        }
    }

    function i() {}

    function o() {}

    function a(t, e, n) {
        return function() {
            var r = n.apply(e, arguments);
            return r === e ? t : r;
        };
    }

    function s(t, e) {
        if (e in t)return e;
        e = e.charAt(0).toUpperCase() + e.substring(1);
        for (var n = 0, r = fs.length; r > n; ++n) {
            var i = fs[n] + e;
            if (i in t)return i;
        }
    }

    function u() {}

    function c() {}

    function l(t) {

        function e() {
            for (var e, r = n, i = -1, o = r.length; ++i < o;)(e = r[i].on) && e.apply(this, arguments);
            return t;
        }

        var n = [], r = new i;
        return e.on = function(e, i) {
            var o, a = r.get(e);
            return arguments.length < 2 ? a && a.on : (a && (a.on = null, n = n.slice(0, o = n.indexOf(a)).concat(n.slice(o + 1)), r.remove(e)), i && n.push(r.set(e, { on: i })), t);
        }, e;
    }

    function f() { Xa.event.preventDefault(); }

    function h() {
        for (var t, e = Xa.event; t = e.sourceEvent;)e = t;
        return e;
    }

    function d(t) {
        for (var e = new c, n = 0, r = arguments.length; ++n < r;)e[arguments[n]] = l(e);
        return e.of = function(n, r) {
            return function(i) {
                try {
                    var o = i.sourceEvent = Xa.event;
                    i.target = t, Xa.event = i, e[i.type].apply(n, r);
                } finally {
                    Xa.event = o;
                }
            };
        }, e;
    }

    function p(t) { return ds(t, ys), t; }

    function g(t) { return"function" == typeof t ? t : function() { return ps(t, this); }; }

    function m(t) { return"function" == typeof t ? t : function() { return gs(t, this); }; }

    function v(t, e) {

        function n() { this.removeAttribute(t); }

        function r() { this.removeAttributeNS(t.space, t.local); }

        function i() { this.setAttribute(t, e); }

        function o() { this.setAttributeNS(t.space, t.local, e); }

        function a() {
            var n = e.apply(this, arguments);
            null == n ? this.removeAttribute(t) : this.setAttribute(t, n);
        }

        function s() {
            var n = e.apply(this, arguments);
            null == n ? this.removeAttributeNS(t.space, t.local) : this.setAttributeNS(t.space, t.local, n);
        }

        return t = Xa.ns.qualify(t), null == e ? t.local ? r : n : "function" == typeof e ? t.local ? s : a : t.local ? o : i;
    }

    function y(t) { return t.trim().replace(/\s+/g, " "); }

    function b(t) { return new RegExp("(?:^|\\s+)" + Xa.requote(t) + "(?:\\s+|$)", "g"); }

    function x(t, e) {

        function n() { for (var n = -1; ++n < i;)t[n](this, e); }

        function r() { for (var n = -1, r = e.apply(this, arguments); ++n < i;)t[n](this, r); }

        t = t.trim().split(/\s+/).map(w);
        var i = t.length;
        return"function" == typeof e ? r : n;
    }

    function w(t) {
        var e = b(t);
        return function(n, r) {
            if (i = n.classList)return r ? i.add(t) : i.remove(t);
            var i = n.getAttribute("class") || "";
            r ? (e.lastIndex = 0, e.test(i) || n.setAttribute("class", y(i + " " + t))) : n.setAttribute("class", y(i.replace(e, " ")));
        };
    }

    function _(t, e, n) {

        function r() { this.style.removeProperty(t); }

        function i() { this.style.setProperty(t, e, n); }

        function o() {
            var r = e.apply(this, arguments);
            null == r ? this.style.removeProperty(t) : this.style.setProperty(t, r, n);
        }

        return null == e ? r : "function" == typeof e ? o : i;
    }

    function M(t, e) {

        function n() { delete this[t]; }

        function r() { this[t] = e; }

        function i() {
            var n = e.apply(this, arguments);
            null == n ? delete this[t] : this[t] = n;
        }

        return null == e ? n : "function" == typeof e ? i : r;
    }

    function k(t) { return"function" == typeof t ? t : (t = Xa.ns.qualify(t)).local ? function() { return this.ownerDocument.createElementNS(t.space, t.local); } : function() { return this.ownerDocument.createElementNS(this.namespaceURI, t); }; }

    function S(t) { return{ __data__: t }; }

    function T(t) { return function() { return vs(this, t); }; }

    function E(t) { return arguments.length || (t = Xa.ascending), function(e, n) { return e && n ? t(e.__data__, n.__data__) : !e - !n; }; }

    function C(t, e) {
        for (var n = 0, r = t.length; r > n; n++)for (var i, o = t[n], a = 0, s = o.length; s > a; a++)(i = o[a]) && e(i, a, n);
        return t;
    }

    function D(t) { return ds(t, xs), t; }

    function $(t) {
        var e, n;
        return function(r, i, o) {
            var a, s = t[o].update, u = s.length;
            for (o != n && (n = o, e = 0), i >= e && (e = i + 1); !(a = s[e]) && ++e < u;);
            return a;
        };
    }

    function A() {
        var t = this.__transition__;
        t && ++t.active;
    }

    function N(t, e, n) {

        function r() {
            var e = this[a];
            e && (this.removeEventListener(t, e, e.$), delete this[a]);
        }

        function i() {
            var i = c(e, Ga(arguments));
            r.call(this), this.addEventListener(t, this[a] = i, i.$ = n), i._ = e;
        }

        function o() {
            var e, n = new RegExp("^__on([^.]+)" + Xa.requote(t) + "$");
            for (var r in this)
                if (e = r.match(n)) {
                    var i = this[r];
                    this.removeEventListener(e[1], i, i.$), delete this[r];
                }
        }

        var a = "__on" + t, s = t.indexOf("."), c = L;
        s > 0 && (t = t.substring(0, s));
        var l = _s.get(t);
        return l && (t = l, c = j), s ? e ? i : r : e ? u : o;
    }

    function L(t, e) {
        return function(n) {
            var r = Xa.event;
            Xa.event = n, e[0] = this.__data__;
            try {
                t.apply(this, e);
            } finally {
                Xa.event = r;
            }
        };
    }

    function j(t, e) {
        var n = L(t, e);
        return function(t) {
            var e = this, r = t.relatedTarget;
            r && (r === e || 8 & r.compareDocumentPosition(e)) || n.call(e, t);
        };
    }

    function O() {
        var t = ".dragsuppress-" + ++ks, e = "click" + t, n = Xa.select(Qa).on("touchmove" + t, f).on("dragstart" + t, f).on("selectstart" + t, f);
        if (Ms) {
            var r = Ja.style, i = r[Ms];
            r[Ms] = "none";
        }
        return function(o) {

            function a() { n.on(e, null); }

            n.on(t, null), Ms && (r[Ms] = i), o && (n.on(e, function() { f(), a(); }, !0), setTimeout(a, 0));
        };
    }

    function F(t, e) {
        e.changedTouches && (e = e.changedTouches[0]);
        var n = t.ownerSVGElement || t;
        if (n.createSVGPoint) {
            var r = n.createSVGPoint();
            if (0 > Ss && (Qa.scrollX || Qa.scrollY)) {
                n = Xa.select("body").append("svg").style({ position: "absolute", top: 0, left: 0, margin: 0, padding: 0, border: "none" }, "important");
                var i = n[0][0].getScreenCTM();
                Ss = !(i.f || i.e), n.remove();
            }
            return Ss ? (r.x = e.pageX, r.y = e.pageY) : (r.x = e.clientX, r.y = e.clientY), r = r.matrixTransform(t.getScreenCTM().inverse()), [r.x, r.y];
        }
        var o = t.getBoundingClientRect();
        return[e.clientX - o.left - t.clientLeft, e.clientY - o.top - t.clientTop];
    }

    function P(t) { return t > 0 ? 1 : 0 > t ? -1 : 0; }

    function R(t) { return t > 1 ? 0 : -1 > t ? Ts : Math.acos(t); }

    function z(t) { return t > 1 ? Cs : -1 > t ? -Cs : Math.asin(t); }

    function I(t) { return((t = Math.exp(t)) - 1 / t) / 2; }

    function q(t) { return((t = Math.exp(t)) + 1 / t) / 2; }

    function H(t) { return((t = Math.exp(2 * t)) - 1) / (t + 1); }

    function Y(t) { return(t = Math.sin(t / 2)) * t; }

    function B() {}

    function U(t, e, n) { return new W(t, e, n); }

    function W(t, e, n) { this.h = t, this.s = e, this.l = n; }

    function V(t, e, n) {

        function r(t) { return t > 360 ? t -= 360 : 0 > t && (t += 360), 60 > t ? o + (a - o) * t / 60 : 180 > t ? a : 240 > t ? o + (a - o) * (240 - t) / 60 : o; }

        function i(t) { return Math.round(255 * r(t)); }

        var o, a;
        return t = isNaN(t) ? 0 : (t %= 360) < 0 ? t + 360 : t, e = isNaN(e) ? 0 : 0 > e ? 0 : e > 1 ? 1 : e, n = 0 > n ? 0 : n > 1 ? 1 : n, a = .5 >= n ? n * (1 + e) : n + e - n * e, o = 2 * n - a, ae(i(t + 120), i(t), i(t - 120));
    }

    function X(t, e, n) { return new Z(t, e, n); }

    function Z(t, e, n) { this.h = t, this.c = e, this.l = n; }

    function G(t, e, n) { return isNaN(t) && (t = 0), isNaN(e) && (e = 0), K(n, Math.cos(t *= As) * e, Math.sin(t) * e); }

    function K(t, e, n) { return new J(t, e, n); }

    function J(t, e, n) { this.l = t, this.a = e, this.b = n; }

    function Q(t, e, n) {
        var r = (t + 16) / 116, i = r + e / 500, o = r - n / 200;
        return i = ee(i) * Hs, r = ee(r) * Ys, o = ee(o) * Bs, ae(re(3.2404542 * i - 1.5371385 * r - .4985314 * o), re(-.969266 * i + 1.8760108 * r + .041556 * o), re(.0556434 * i - .2040259 * r + 1.0572252 * o));
    }

    function te(t, e, n) { return t > 0 ? X(Math.atan2(n, e) * Ns, Math.sqrt(e * e + n * n), t) : X(0 / 0, 0 / 0, t); }

    function ee(t) { return t > .206893034 ? t * t * t : (t - 4 / 29) / 7.787037; }

    function ne(t) { return t > .008856 ? Math.pow(t, 1 / 3) : 7.787037 * t + 4 / 29; }

    function re(t) { return Math.round(255 * (.00304 >= t ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - .055)); }

    function ie(t) { return ae(t >> 16, 255 & t >> 8, 255 & t); }

    function oe(t) { return ie(t) + ""; }

    function ae(t, e, n) { return new se(t, e, n); }

    function se(t, e, n) { this.r = t, this.g = e, this.b = n; }

    function ue(t) { return 16 > t ? "0" + Math.max(0, t).toString(16) : Math.min(255, t).toString(16); }

    function ce(t, e, n) {
        var r, i, o, a = 0, s = 0, u = 0;
        if (r = /([a-z]+)\((.*)\)/i.exec(t))
            switch (i = r[2].split(","), r[1]) {
            case"hsl":
                return n(parseFloat(i[0]), parseFloat(i[1]) / 100, parseFloat(i[2]) / 100);
            case"rgb":
                return e(de(i[0]), de(i[1]), de(i[2]));
            }
        return(o = Vs.get(t)) ? e(o.r, o.g, o.b) : (null != t && "#" === t.charAt(0) && (4 === t.length ? (a = t.charAt(1), a += a, s = t.charAt(2), s += s, u = t.charAt(3), u += u) : 7 === t.length && (a = t.substring(1, 3), s = t.substring(3, 5), u = t.substring(5, 7)), a = parseInt(a, 16), s = parseInt(s, 16), u = parseInt(u, 16)), e(a, s, u));
    }

    function le(t, e, n) {
        var r, i, o = Math.min(t /= 255, e /= 255, n /= 255), a = Math.max(t, e, n), s = a - o, u = (a + o) / 2;
        return s ? (i = .5 > u ? s / (a + o) : s / (2 - a - o), r = t == a ? (e - n) / s + (n > e ? 6 : 0) : e == a ? (n - t) / s + 2 : (t - e) / s + 4, r *= 60) : (r = 0 / 0, i = u > 0 && 1 > u ? 0 : r), U(r, i, u);
    }

    function fe(t, e, n) {
        t = he(t), e = he(e), n = he(n);
        var r = ne((.4124564 * t + .3575761 * e + .1804375 * n) / Hs), i = ne((.2126729 * t + .7151522 * e + .072175 * n) / Ys), o = ne((.0193339 * t + .119192 * e + .9503041 * n) / Bs);
        return K(116 * i - 16, 500 * (r - i), 200 * (i - o));
    }

    function he(t) { return(t /= 255) <= .04045 ? t / 12.92 : Math.pow((t + .055) / 1.055, 2.4); }

    function de(t) {
        var e = parseFloat(t);
        return"%" === t.charAt(t.length - 1) ? Math.round(2.55 * e) : e;
    }

    function pe(t) { return"function" == typeof t ? t : function() { return t; }; }

    function ge(t) { return t; }

    function me(t) { return function(e, n, r) { return 2 === arguments.length && "function" == typeof n && (r = n, n = null), ve(e, n, t, r); }; }

    function ve(t, e, n, r) {

        function i() {
            var t, e = u.status;
            if (!e && u.responseText || e >= 200 && 300 > e || 304 === e) {
                try {
                    t = n.call(o, u);
                } catch (r) {
                    return a.error.call(o, r), void 0;
                }
                a.load.call(o, t);
            } else a.error.call(o, u);
        }

        var o = {}, a = Xa.dispatch("beforesend", "progress", "load", "error"), s = {}, u = new XMLHttpRequest, c = null;
        return!Qa.XDomainRequest || "withCredentials" in u || !/^(http(s)?:)?\/\//.test(t) || (u = new XDomainRequest), "onload" in u ? u.onload = u.onerror = i : u.onreadystatechange = function() { u.readyState > 3 && i(); }, u.onprogress = function(t) {
            var e = Xa.event;
            Xa.event = t;
            try {
                a.progress.call(o, u);
            } finally {
                Xa.event = e;
            }
        }, o.header = function(t, e) { return t = (t + "").toLowerCase(), arguments.length < 2 ? s[t] : (null == e ? delete s[t] : s[t] = e + "", o); }, o.mimeType = function(t) { return arguments.length ? (e = null == t ? null : t + "", o) : e; }, o.responseType = function(t) { return arguments.length ? (c = t, o) : c; }, o.response = function(t) { return n = t, o; }, ["get", "post"].forEach(function(t) { o[t] = function() { return o.send.apply(o, [t].concat(Ga(arguments))); }; }), o.send = function(n, r, i) {
            if (2 === arguments.length && "function" == typeof r && (i = r, r = null), u.open(n, t, !0), null == e || "accept" in s || (s.accept = e + ",*/*"), u.setRequestHeader)for (var l in s)u.setRequestHeader(l, s[l]);
            return null != e && u.overrideMimeType && u.overrideMimeType(e), null != c && (u.responseType = c), null != i && o.on("error", i).on("load", function(t) { i(null, t); }), a.beforesend.call(o, u), u.send(null == r ? null : r), o;
        }, o.abort = function() { return u.abort(), o; }, Xa.rebind(o, a, "on"), null == r ? o : o.get(ye(r));
    }

    function ye(t) { return 1 === t.length ? function(e, n) { t(null == e ? n : null); } : t; }

    function be() {
        var t = xe(), e = we() - t;
        e > 24 ? (isFinite(e) && (clearTimeout(Ks), Ks = setTimeout(be, e)), Gs = 0) : (Gs = 1, Qs(be));
    }

    function xe() {
        var t = Date.now();
        for (Js = Xs; Js;)t >= Js.t && (Js.f = Js.c(t - Js.t)), Js = Js.n;
        return t;
    }

    function we() {
        for (var t, e = Xs, n = 1 / 0; e;)e.f ? e = t ? t.n = e.n : Xs = e.n : (e.t < n && (n = e.t), e = (t = e).n);
        return Zs = t, n;
    }

    function _e(t, e) {
        var n = Math.pow(10, 3 * us(8 - e));
        return{ scale: e > 8 ? function(t) { return t / n; } : function(t) { return t * n; }, symbol: t };
    }

    function Me(t, e) { return e - (t ? Math.ceil(Math.log(t) / Math.LN10) : 1); }

    function ke(t) { return t + ""; }

    function Se() {}

    function Te(t, e, n) {
        var r = n.s = t + e, i = r - t, o = r - i;
        n.t = t - o + (e - i);
    }

    function Ee(t, e) { t && fu.hasOwnProperty(t.type) && fu[t.type](t, e); }

    function Ce(t, e, n) {
        var r, i = -1, o = t.length - n;
        for (e.lineStart(); ++i < o;)r = t[i], e.point(r[0], r[1], r[2]);
        e.lineEnd();
    }

    function De(t, e) {
        var n = -1, r = t.length;
        for (e.polygonStart(); ++n < r;)Ce(t[n], e, 1);
        e.polygonEnd();
    }

    function $e() {

        function t(t, e) {
            t *= As, e = e * As / 2 + Ts / 4;
            var n = t - r, a = Math.cos(e), s = Math.sin(e), u = o * s, c = i * a + u * Math.cos(n), l = u * Math.sin(n);
            du.add(Math.atan2(l, c)), r = t, i = a, o = s;
        }

        var e, n, r, i, o;
        pu.point = function(a, s) { pu.point = t, r = (e = a) * As, i = Math.cos(s = (n = s) * As / 2 + Ts / 4), o = Math.sin(s); }, pu.lineEnd = function() { t(e, n); };
    }

    function Ae(t) {
        var e = t[0], n = t[1], r = Math.cos(n);
        return[r * Math.cos(e), r * Math.sin(e), Math.sin(n)];
    }

    function Ne(t, e) { return t[0] * e[0] + t[1] * e[1] + t[2] * e[2]; }

    function Le(t, e) { return[t[1] * e[2] - t[2] * e[1], t[2] * e[0] - t[0] * e[2], t[0] * e[1] - t[1] * e[0]]; }

    function je(t, e) { t[0] += e[0], t[1] += e[1], t[2] += e[2]; }

    function Oe(t, e) { return[t[0] * e, t[1] * e, t[2] * e]; }

    function Fe(t) {
        var e = Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2]);
        t[0] /= e, t[1] /= e, t[2] /= e;
    }

    function Pe(t) { return[Math.atan2(t[1], t[0]), z(t[2])]; }

    function Re(t, e) { return us(t[0] - e[0]) < Ds && us(t[1] - e[1]) < Ds; }

    function ze(t, e) {
        t *= As;
        var n = Math.cos(e *= As);
        Ie(n * Math.cos(t), n * Math.sin(t), Math.sin(e));
    }

    function Ie(t, e, n) { ++gu, vu += (t - vu) / gu, yu += (e - yu) / gu, bu += (n - bu) / gu; }

    function qe() {

        function t(t, i) {
            t *= As;
            var o = Math.cos(i *= As), a = o * Math.cos(t), s = o * Math.sin(t), u = Math.sin(i), c = Math.atan2(Math.sqrt((c = n * u - r * s) * c + (c = r * a - e * u) * c + (c = e * s - n * a) * c), e * a + n * s + r * u);
            mu += c, xu += c * (e + (e = a)), wu += c * (n + (n = s)), _u += c * (r + (r = u)), Ie(e, n, r);
        }

        var e, n, r;
        Tu.point = function(i, o) {
            i *= As;
            var a = Math.cos(o *= As);
            e = a * Math.cos(i), n = a * Math.sin(i), r = Math.sin(o), Tu.point = t, Ie(e, n, r);
        };
    }

    function He() { Tu.point = ze; }

    function Ye() {

        function t(t, e) {
            t *= As;
            var n = Math.cos(e *= As), a = n * Math.cos(t), s = n * Math.sin(t), u = Math.sin(e), c = i * u - o * s, l = o * a - r * u, f = r * s - i * a, h = Math.sqrt(c * c + l * l + f * f), d = r * a + i * s + o * u, p = h && -R(d) / h, g = Math.atan2(h, d);
            Mu += p * c, ku += p * l, Su += p * f, mu += g, xu += g * (r + (r = a)), wu += g * (i + (i = s)), _u += g * (o + (o = u)), Ie(r, i, o);
        }

        var e, n, r, i, o;
        Tu.point = function(a, s) {
            e = a, n = s, Tu.point = t, a *= As;
            var u = Math.cos(s *= As);
            r = u * Math.cos(a), i = u * Math.sin(a), o = Math.sin(s), Ie(r, i, o);
        }, Tu.lineEnd = function() { t(e, n), Tu.lineEnd = He, Tu.point = ze; };
    }

    function Be() { return!0; }

    function Ue(t, e, n, r, i) {
        var o = [], a = [];
        if (t.forEach(function(t) {
            if (!((e = t.length - 1) <= 0)) {
                var e, n = t[0], r = t[e];
                if (Re(n, r)) {
                    i.lineStart();
                    for (var s = 0; e > s; ++s)i.point((n = t[s])[0], n[1]);
                    return i.lineEnd(), void 0;
                }
                var u = new Ve(n, t, null, !0), c = new Ve(n, null, u, !1);
                u.o = c, o.push(u), a.push(c), u = new Ve(r, t, null, !1), c = new Ve(r, null, u, !0), u.o = c, o.push(u), a.push(c);
            }
        }), a.sort(e), We(o), We(a), o.length) {
            for (var s = 0, u = n, c = a.length; c > s; ++s)a[s].e = u = !u;
            for (var l, f, h = o[0];;) {
                for (var d = h, p = !0; d.v;)if ((d = d.n) === h)return;
                l = d.z, i.lineStart();
                do {
                    if (d.v = d.o.v = !0, d.e) {
                        if (p)for (var s = 0, c = l.length; c > s; ++s)i.point((f = l[s])[0], f[1]);
                        else r(d.x, d.n.x, 1, i);
                        d = d.n;
                    } else {
                        if (p) {
                            l = d.p.z;
                            for (var s = l.length - 1; s >= 0; --s)i.point((f = l[s])[0], f[1]);
                        } else r(d.x, d.p.x, -1, i);
                        d = d.p;
                    }
                    d = d.o, l = d.z, p = !p;
                } while (!d.v);
                i.lineEnd();
            }
        }
    }

    function We(t) {
        if (e = t.length) {
            for (var e, n, r = 0, i = t[0]; ++r < e;)i.n = n = t[r], n.p = i, i = n;
            i.n = n = t[0], n.p = i;
        }
    }

    function Ve(t, e, n, r) { this.x = t, this.z = e, this.o = n, this.e = r, this.v = !1, this.n = this.p = null; }

    function Xe(t, e, n, r) {
        return function(i, o) {

            function a(e, n) {
                var r = i(e, n);
                t(e = r[0], n = r[1]) && o.point(e, n);
            }

            function s(t, e) {
                var n = i(t, e);
                m.point(n[0], n[1]);
            }

            function u() { y.point = s, m.lineStart(); }

            function c() { y.point = a, m.lineEnd(); }

            function l(t, e) {
                g.push([t, e]);
                var n = i(t, e);
                x.point(n[0], n[1]);
            }

            function f() { x.lineStart(), g = []; }

            function h() {
                l(g[0][0], g[0][1]), x.lineEnd();
                var t, e = x.clean(), n = b.buffer(), r = n.length;
                if (g.pop(), p.push(g), g = null, r) {
                    if (1 & e) {
                        t = n[0];
                        var i, r = t.length - 1, a = -1;
                        for (o.lineStart(); ++a < r;)o.point((i = t[a])[0], i[1]);
                        return o.lineEnd(), void 0;
                    }
                    r > 1 && 2 & e && n.push(n.pop().concat(n.shift())), d.push(n.filter(Ze));
                }
            }

            var d,
                p,
                g,
                m = e(o),
                v = i.invert(r[0], r[1]),
                y = {
                    point: a,
                    lineStart: u,
                    lineEnd: c,
                    polygonStart: function() { y.point = l, y.lineStart = f, y.lineEnd = h, d = [], p = [], o.polygonStart(); },
                    polygonEnd: function() {
                        y.point = a, y.lineStart = u, y.lineEnd = c, d = Xa.merge(d);
                        var t = Je(v, p);
                        d.length ? Ue(d, Ke, t, n, o) : t && (o.lineStart(), n(null, null, 1, o), o.lineEnd()), o.polygonEnd(), d = p = null;
                    },
                    sphere: function() { o.polygonStart(), o.lineStart(), n(null, null, 1, o), o.lineEnd(), o.polygonEnd(); }
                },
                b = Ge(),
                x = e(b);
            return y;
        };
    }

    function Ze(t) { return t.length > 1; }

    function Ge() {
        var t, e = [];
        return{
            lineStart: function() { e.push(t = []); },
            point: function(e, n) { t.push([e, n]); },
            lineEnd: u,
            buffer: function() {
                var n = e;
                return e = [], t = null, n;
            },
            rejoin: function() { e.length > 1 && e.push(e.pop().concat(e.shift())); }
        };
    }

    function Ke(t, e) { return((t = t.x)[0] < 0 ? t[1] - Cs - Ds : Cs - t[1]) - ((e = e.x)[0] < 0 ? e[1] - Cs - Ds : Cs - e[1]); }

    function Je(t, e) {
        var n = t[0], r = t[1], i = [Math.sin(n), -Math.cos(n), 0], o = 0, a = 0;
        du.reset();
        for (var s = 0, u = e.length; u > s; ++s) {
            var c = e[s], l = c.length;
            if (l)
                for (var f = c[0], h = f[0], d = f[1] / 2 + Ts / 4, p = Math.sin(d), g = Math.cos(d), m = 1;;) {
                    m === l && (m = 0), t = c[m];
                    var v = t[0], y = t[1] / 2 + Ts / 4, b = Math.sin(y), x = Math.cos(y), w = v - h, _ = us(w) > Ts, M = p * b;
                    if (du.add(Math.atan2(M * Math.sin(w), g * x + M * Math.cos(w))), o += _ ? w + (w >= 0 ? Es : -Es) : w, _ ^ h >= n ^ v >= n) {
                        var k = Le(Ae(f), Ae(t));
                        Fe(k);
                        var S = Le(i, k);
                        Fe(S);
                        var T = (_ ^ w >= 0 ? -1 : 1) * z(S[2]);
                        (r > T || r === T && (k[0] || k[1])) && (a += _ ^ w >= 0 ? 1 : -1);
                    }
                    if (!m++)break;
                    h = v, p = b, g = x, f = t;
                }
        }
        return(-Ds > o || Ds > o && 0 > du) ^ 1 & a;
    }

    function Qe(t) {
        var e, n = 0 / 0, r = 0 / 0, i = 0 / 0;
        return{
            lineStart: function() { t.lineStart(), e = 1; },
            point: function(o, a) {
                var s = o > 0 ? Ts : -Ts, u = us(o - n);
                us(u - Ts) < Ds ? (t.point(n, r = (r + a) / 2 > 0 ? Cs : -Cs), t.point(i, r), t.lineEnd(), t.lineStart(), t.point(s, r), t.point(o, r), e = 0) : i !== s && u >= Ts && (us(n - i) < Ds && (n -= i * Ds), us(o - s) < Ds && (o -= s * Ds), r = tn(n, r, o, a), t.point(i, r), t.lineEnd(), t.lineStart(), t.point(s, r), e = 0), t.point(n = o, r = a), i = s;
            },
            lineEnd: function() { t.lineEnd(), n = r = 0 / 0; },
            clean: function() { return 2 - e; }
        };
    }

    function tn(t, e, n, r) {
        var i, o, a = Math.sin(t - n);
        return us(a) > Ds ? Math.atan((Math.sin(e) * (o = Math.cos(r)) * Math.sin(n) - Math.sin(r) * (i = Math.cos(e)) * Math.sin(t)) / (i * o * a)) : (e + r) / 2;
    }

    function en(t, e, n, r) {
        var i;
        if (null == t)i = n * Cs, r.point(-Ts, i), r.point(0, i), r.point(Ts, i), r.point(Ts, 0), r.point(Ts, -i), r.point(0, -i), r.point(-Ts, -i), r.point(-Ts, 0), r.point(-Ts, i);
        else if (us(t[0] - e[0]) > Ds) {
            var o = t[0] < e[0] ? Ts : -Ts;
            i = n * o / 2, r.point(-o, i), r.point(0, i), r.point(o, i);
        } else r.point(e[0], e[1]);
    }

    function nn(t) {

        function e(t, e) { return Math.cos(t) * Math.cos(e) > o; }

        function n(t) {
            var n, o, u, c, l;
            return{
                lineStart: function() { c = u = !1, l = 1; },
                point: function(f, h) {
                    var d, p = [f, h], g = e(f, h), m = a ? g ? 0 : i(f, h) : g ? i(f + (0 > f ? Ts : -Ts), h) : 0;
                    if (!n && (c = u = g) && t.lineStart(), g !== u && (d = r(n, p), (Re(n, d) || Re(p, d)) && (p[0] += Ds, p[1] += Ds, g = e(p[0], p[1]))), g !== u)l = 0, g ? (t.lineStart(), d = r(p, n), t.point(d[0], d[1])) : (d = r(n, p), t.point(d[0], d[1]), t.lineEnd()), n = d;
                    else if (s && n && a ^ g) {
                        var v;
                        m & o || !(v = r(p, n, !0)) || (l = 0, a ? (t.lineStart(), t.point(v[0][0], v[0][1]), t.point(v[1][0], v[1][1]), t.lineEnd()) : (t.point(v[1][0], v[1][1]), t.lineEnd(), t.lineStart(), t.point(v[0][0], v[0][1])));
                    }
                    !g || n && Re(n, p) || t.point(p[0], p[1]), n = p, u = g, o = m;
                },
                lineEnd: function() { u && t.lineEnd(), n = null; },
                clean: function() { return l | (c && u) << 1; }
            };
        }

        function r(t, e, n) {
            var r = Ae(t), i = Ae(e), a = [1, 0, 0], s = Le(r, i), u = Ne(s, s), c = s[0], l = u - c * c;
            if (!l)return!n && t;
            var f = o * u / l, h = -o * c / l, d = Le(a, s), p = Oe(a, f), g = Oe(s, h);
            je(p, g);
            var m = d, v = Ne(p, m), y = Ne(m, m), b = v * v - y * (Ne(p, p) - 1);
            if (!(0 > b)) {
                var x = Math.sqrt(b), w = Oe(m, (-v - x) / y);
                if (je(w, p), w = Pe(w), !n)return w;
                var _, M = t[0], k = e[0], S = t[1], T = e[1];
                M > k && (_ = M, M = k, k = _);
                var E = k - M, C = us(E - Ts) < Ds, D = C || Ds > E;
                if (!C && S > T && (_ = S, S = T, T = _), D ? C ? S + T > 0 ^ w[1] < (us(w[0] - M) < Ds ? S : T) : S <= w[1] && w[1] <= T : E > Ts ^ (M <= w[0] && w[0] <= k)) {
                    var $ = Oe(m, (-v + x) / y);
                    return je($, p), [w, Pe($)];
                }
            }
        }

        function i(e, n) {
            var r = a ? t : Ts - t, i = 0;
            return-r > e ? i |= 1 : e > r && (i |= 2), -r > n ? i |= 4 : n > r && (i |= 8), i;
        }

        var o = Math.cos(t), a = o > 0, s = us(o) > Ds, u = An(t, 6 * As);
        return Xe(e, n, u, a ? [0, -t] : [-Ts, t - Ts]);
    }

    function rn(t, e, n, r) {
        return function(i) {
            var o, a = i.a, s = i.b, u = a.x, c = a.y, l = s.x, f = s.y, h = 0, d = 1, p = l - u, g = f - c;
            if (o = t - u, p || !(o > 0)) {
                if (o /= p, 0 > p) {
                    if (h > o)return;
                    d > o && (d = o);
                } else if (p > 0) {
                    if (o > d)return;
                    o > h && (h = o);
                }
                if (o = n - u, p || !(0 > o)) {
                    if (o /= p, 0 > p) {
                        if (o > d)return;
                        o > h && (h = o);
                    } else if (p > 0) {
                        if (h > o)return;
                        d > o && (d = o);
                    }
                    if (o = e - c, g || !(o > 0)) {
                        if (o /= g, 0 > g) {
                            if (h > o)return;
                            d > o && (d = o);
                        } else if (g > 0) {
                            if (o > d)return;
                            o > h && (h = o);
                        }
                        if (o = r - c, g || !(0 > o)) {
                            if (o /= g, 0 > g) {
                                if (o > d)return;
                                o > h && (h = o);
                            } else if (g > 0) {
                                if (h > o)return;
                                d > o && (d = o);
                            }
                            return h > 0 && (i.a = { x: u + h * p, y: c + h * g }), 1 > d && (i.b = { x: u + d * p, y: c + d * g }), i;
                        }
                    }
                }
            }
        };
    }

    function on(t, e, n, r) {

        function i(r, i) { return us(r[0] - t) < Ds ? i > 0 ? 0 : 3 : us(r[0] - n) < Ds ? i > 0 ? 2 : 1 : us(r[1] - e) < Ds ? i > 0 ? 1 : 0 : i > 0 ? 3 : 2; }

        function o(t, e) { return a(t.x, e.x); }

        function a(t, e) {
            var n = i(t, 1), r = i(e, 1);
            return n !== r ? n - r : 0 === n ? e[1] - t[1] : 1 === n ? t[0] - e[0] : 2 === n ? t[1] - e[1] : e[0] - t[0];
        }

        return function(s) {

            function u(t) {
                for (var e = 0, n = v.length, r = t[1], i = 0; n > i; ++i)for (var o, a = 1, s = v[i], u = s.length, l = s[0]; u > a; ++a)o = s[a], l[1] <= r ? o[1] > r && c(l, o, t) > 0 && ++e : o[1] <= r && c(l, o, t) < 0 && --e, l = o;
                return 0 !== e;
            }

            function c(t, e, n) { return(e[0] - t[0]) * (n[1] - t[1]) - (n[0] - t[0]) * (e[1] - t[1]); }

            function l(o, s, u, c) {
                var l = 0, f = 0;
                if (null == o || (l = i(o, u)) !== (f = i(s, u)) || a(o, s) < 0 ^ u > 0) {
                    do c.point(0 === l || 3 === l ? t : n, l > 1 ? r : e);
                    while ((l = (l + u + 4) % 4) !== f);
                } else c.point(s[0], s[1]);
            }

            function f(i, o) { return i >= t && n >= i && o >= e && r >= o; }

            function h(t, e) { f(t, e) && s.point(t, e); }

            function d() { $.point = g, v && v.push(y = []), S = !0, k = !1, _ = M = 0 / 0; }

            function p() { m && (g(b, x), w && k && C.rejoin(), m.push(C.buffer())), $.point = h, k && s.lineEnd(); }

            function g(t, e) {
                t = Math.max(-Cu, Math.min(Cu, t)), e = Math.max(-Cu, Math.min(Cu, e));
                var n = f(t, e);
                if (v && y.push([t, e]), S)b = t, x = e, w = n, S = !1, n && (s.lineStart(), s.point(t, e));
                else if (n && k)s.point(t, e);
                else {
                    var r = { a: { x: _, y: M }, b: { x: t, y: e } };
                    D(r) ? (k || (s.lineStart(), s.point(r.a.x, r.a.y)), s.point(r.b.x, r.b.y), n || s.lineEnd(), T = !1) : n && (s.lineStart(), s.point(t, e), T = !1);
                }
                _ = t, M = e, k = n;
            }

            var m,
                v,
                y,
                b,
                x,
                w,
                _,
                M,
                k,
                S,
                T,
                E = s,
                C = Ge(),
                D = rn(t, e, n, r),
                $ = {
                    point: h,
                    lineStart: d,
                    lineEnd: p,
                    polygonStart: function() { s = C, m = [], v = [], T = !0; },
                    polygonEnd: function() {
                        s = E, m = Xa.merge(m);
                        var e = u([t, r]), n = T && e, i = m.length;
                        (n || i) && (s.polygonStart(), n && (s.lineStart(), l(null, null, 1, s), s.lineEnd()), i && Ue(m, o, e, l, s), s.polygonEnd()), m = v = y = null;
                    }
                };
            return $;
        };
    }

    function an(t, e) {

        function n(n, r) { return n = t(n, r), e(n[0], n[1]); }

        return t.invert && e.invert && (n.invert = function(n, r) { return n = e.invert(n, r), n && t.invert(n[0], n[1]); }), n;
    }

    function sn(t) {
        var e = 0, n = Ts / 3, r = Mn(t), i = r(e, n);
        return i.parallels = function(t) { return arguments.length ? r(e = t[0] * Ts / 180, n = t[1] * Ts / 180) : [180 * (e / Ts), 180 * (n / Ts)]; }, i;
    }

    function un(t, e) {

        function n(t, e) {
            var n = Math.sqrt(o - 2 * i * Math.sin(e)) / i;
            return[n * Math.sin(t *= i), a - n * Math.cos(t)];
        }

        var r = Math.sin(t), i = (r + Math.sin(e)) / 2, o = 1 + r * (2 * i - r), a = Math.sqrt(o) / i;
        return n.invert = function(t, e) {
            var n = a - e;
            return[Math.atan2(t, n) / i, z((o - (t * t + n * n) * i * i) / (2 * i))];
        }, n;
    }

    function cn() {

        function t(t, e) { $u += i * t - r * e, r = t, i = e; }

        var e, n, r, i;
        Ou.point = function(o, a) { Ou.point = t, e = r = o, n = i = a; }, Ou.lineEnd = function() { t(e, n); };
    }

    function ln(t, e) { Au > t && (Au = t), t > Lu && (Lu = t), Nu > e && (Nu = e), e > ju && (ju = e); }

    function fn() {

        function t(t, e) { a.push("M", t, ",", e, o); }

        function e(t, e) { a.push("M", t, ",", e), s.point = n; }

        function n(t, e) { a.push("L", t, ",", e); }

        function r() { s.point = t; }

        function i() { a.push("Z"); }

        var o = hn(4.5),
            a = [],
            s = {
                point: t,
                lineStart: function() { s.point = e; },
                lineEnd: r,
                polygonStart: function() { s.lineEnd = i; },
                polygonEnd: function() { s.lineEnd = r, s.point = t; },
                pointRadius: function(t) { return o = hn(t), s; },
                result: function() {
                    if (a.length) {
                        var t = a.join("");
                        return a = [], t;
                    }
                }
            };
        return s;
    }

    function hn(t) { return"m0," + t + "a" + t + "," + t + " 0 1,1 0," + -2 * t + "a" + t + "," + t + " 0 1,1 0," + 2 * t + "z"; }

    function dn(t, e) { vu += t, yu += e, ++bu; }

    function pn() {

        function t(t, r) {
            var i = t - e, o = r - n, a = Math.sqrt(i * i + o * o);
            xu += a * (e + t) / 2, wu += a * (n + r) / 2, _u += a, dn(e = t, n = r);
        }

        var e, n;
        Pu.point = function(r, i) { Pu.point = t, dn(e = r, n = i); };
    }

    function gn() { Pu.point = dn; }

    function mn() {

        function t(t, e) {
            var n = t - r, o = e - i, a = Math.sqrt(n * n + o * o);
            xu += a * (r + t) / 2, wu += a * (i + e) / 2, _u += a, a = i * t - r * e, Mu += a * (r + t), ku += a * (i + e), Su += 3 * a, dn(r = t, i = e);
        }

        var e, n, r, i;
        Pu.point = function(o, a) { Pu.point = t, dn(e = r = o, n = i = a); }, Pu.lineEnd = function() { t(e, n); };
    }

    function vn(t) {

        function e(e, n) { t.moveTo(e, n), t.arc(e, n, a, 0, Es); }

        function n(e, n) { t.moveTo(e, n), s.point = r; }

        function r(e, n) { t.lineTo(e, n); }

        function i() { s.point = e; }

        function o() { t.closePath(); }

        var a = 4.5, s = { point: e, lineStart: function() { s.point = n; }, lineEnd: i, polygonStart: function() { s.lineEnd = o; }, polygonEnd: function() { s.lineEnd = i, s.point = e; }, pointRadius: function(t) { return a = t, s; }, result: u };
        return s;
    }

    function yn(t) {

        function e(t) { return(s ? r : n)(t); }

        function n(e) { return wn(e, function(n, r) { n = t(n, r), e.point(n[0], n[1]); }); }

        function r(e) {

            function n(n, r) { n = t(n, r), e.point(n[0], n[1]); }

            function r() { b = 0 / 0, k.point = o, e.lineStart(); }

            function o(n, r) {
                var o = Ae([n, r]), a = t(n, r);
                i(b, x, y, w, _, M, b = a[0], x = a[1], y = n, w = o[0], _ = o[1], M = o[2], s, e), e.point(b, x);
            }

            function a() { k.point = n, e.lineEnd(); }

            function u() { r(), k.point = c, k.lineEnd = l; }

            function c(t, e) { o(f = t, h = e), d = b, p = x, g = w, m = _, v = M, k.point = o; }

            function l() { i(b, x, y, w, _, M, d, p, f, g, m, v, s, e), k.lineEnd = a, a(); }

            var f, h, d, p, g, m, v, y, b, x, w, _, M, k = { point: n, lineStart: r, lineEnd: a, polygonStart: function() { e.polygonStart(), k.lineStart = u; }, polygonEnd: function() { e.polygonEnd(), k.lineStart = r; } };
            return k;
        }

        function i(e, n, r, s, u, c, l, f, h, d, p, g, m, v) {
            var y = l - e, b = f - n, x = y * y + b * b;
            if (x > 4 * o && m--) {
                var w = s + d, _ = u + p, M = c + g, k = Math.sqrt(w * w + _ * _ + M * M), S = Math.asin(M /= k), T = us(us(M) - 1) < Ds ? (r + h) / 2 : Math.atan2(_, w), E = t(T, S), C = E[0], D = E[1], $ = C - e, A = D - n, N = b * $ - y * A;
                (N * N / x > o || us((y * $ + b * A) / x - .5) > .3 || a > s * d + u * p + c * g) && (i(e, n, r, s, u, c, C, D, T, w /= k, _ /= k, M, m, v), v.point(C, D), i(C, D, T, w, _, M, l, f, h, d, p, g, m, v));
            }
        }

        var o = .5, a = Math.cos(30 * As), s = 16;
        return e.precision = function(t) { return arguments.length ? (s = (o = t * t) > 0 && 16, e) : Math.sqrt(o); }, e;
    }

    function bn(t) {
        var e = yn(function(e, n) { return t([e * Ns, n * Ns]); });
        return function(t) { return kn(e(t)); };
    }

    function xn(t) { this.stream = t; }

    function wn(t, e) { return{ point: e, sphere: function() { t.sphere(); }, lineStart: function() { t.lineStart(); }, lineEnd: function() { t.lineEnd(); }, polygonStart: function() { t.polygonStart(); }, polygonEnd: function() { t.polygonEnd(); } }; }

    function _n(t) { return Mn(function() { return t; })(); }

    function Mn(t) {

        function e(t) { return t = s(t[0] * As, t[1] * As), [t[0] * h + u, c - t[1] * h]; }

        function n(t) { return t = s.invert((t[0] - u) / h, (c - t[1]) / h), t && [t[0] * Ns, t[1] * Ns]; }

        function r() {
            s = an(a = En(v, y, b), o);
            var t = o(g, m);
            return u = d - t[0] * h, c = p + t[1] * h, i();
        }

        function i() { return l && (l.valid = !1, l = null), e; }

        var o, a, s, u, c, l, f = yn(function(t, e) { return t = o(t, e), [t[0] * h + u, c - t[1] * h]; }), h = 150, d = 480, p = 250, g = 0, m = 0, v = 0, y = 0, b = 0, x = Eu, w = ge, _ = null, M = null;
        return e.stream = function(t) { return l && (l.valid = !1), l = kn(x(a, f(w(t)))), l.valid = !0, l; }, e.clipAngle = function(t) { return arguments.length ? (x = null == t ? (_ = t, Eu) : nn((_ = +t) * As), i()) : _; }, e.clipExtent = function(t) { return arguments.length ? (M = t, w = t ? on(t[0][0], t[0][1], t[1][0], t[1][1]) : ge, i()) : M; }, e.scale = function(t) { return arguments.length ? (h = +t, r()) : h; }, e.translate = function(t) { return arguments.length ? (d = +t[0], p = +t[1], r()) : [d, p]; }, e.center = function(t) { return arguments.length ? (g = t[0] % 360 * As, m = t[1] % 360 * As, r()) : [g * Ns, m * Ns]; }, e.rotate = function(t) { return arguments.length ? (v = t[0] % 360 * As, y = t[1] % 360 * As, b = t.length > 2 ? t[2] % 360 * As : 0, r()) : [v * Ns, y * Ns, b * Ns]; }, Xa.rebind(e, f, "precision"), function() { return o = t.apply(this, arguments), e.invert = o.invert && n, r(); };
    }

    function kn(t) { return wn(t, function(e, n) { t.point(e * As, n * As); }); }

    function Sn(t, e) { return[t, e]; }

    function Tn(t, e) { return[t > Ts ? t - Es : -Ts > t ? t + Es : t, e]; }

    function En(t, e, n) { return t ? e || n ? an(Dn(t), $n(e, n)) : Dn(t) : e || n ? $n(e, n) : Tn; }

    function Cn(t) { return function(e, n) { return e += t, [e > Ts ? e - Es : -Ts > e ? e + Es : e, n]; }; }

    function Dn(t) {
        var e = Cn(t);
        return e.invert = Cn(-t), e;
    }

    function $n(t, e) {

        function n(t, e) {
            var n = Math.cos(e), s = Math.cos(t) * n, u = Math.sin(t) * n, c = Math.sin(e), l = c * r + s * i;
            return[Math.atan2(u * o - l * a, s * r - c * i), z(l * o + u * a)];
        }

        var r = Math.cos(t), i = Math.sin(t), o = Math.cos(e), a = Math.sin(e);
        return n.invert = function(t, e) {
            var n = Math.cos(e), s = Math.cos(t) * n, u = Math.sin(t) * n, c = Math.sin(e), l = c * o - u * a;
            return[Math.atan2(u * o + c * a, s * r + l * i), z(l * r - s * i)];
        }, n;
    }

    function An(t, e) {
        var n = Math.cos(t), r = Math.sin(t);
        return function(i, o, a, s) {
            var u = a * e;
            null != i ? (i = Nn(n, i), o = Nn(n, o), (a > 0 ? o > i : i > o) && (i += a * Es)) : (i = t + a * Es, o = t - .5 * u);
            for (var c, l = i; a > 0 ? l > o : o > l; l -= u)s.point((c = Pe([n, -r * Math.cos(l), -r * Math.sin(l)]))[0], c[1]);
        };
    }

    function Nn(t, e) {
        var n = Ae(e);
        n[0] -= t, Fe(n);
        var r = R(-n[1]);
        return((-n[2] < 0 ? -r : r) + 2 * Math.PI - Ds) % (2 * Math.PI);
    }

    function Ln(t, e, n) {
        var r = Xa.range(t, e - Ds, n).concat(e);
        return function(t) { return r.map(function(e) { return[t, e]; }); };
    }

    function jn(t, e, n) {
        var r = Xa.range(t, e - Ds, n).concat(e);
        return function(t) { return r.map(function(e) { return[e, t]; }); };
    }

    function On(t) { return t.source; }

    function Fn(t) { return t.target; }

    function Pn(t, e, n, r) {
        var i = Math.cos(e),
            o = Math.sin(e),
            a = Math.cos(r),
            s = Math.sin(r),
            u = i * Math.cos(t),
            c = i * Math.sin(t),
            l = a * Math.cos(n),
            f = a * Math.sin(n),
            h = 2 * Math.asin(Math.sqrt(Y(r - e) + i * a * Y(n - t))),
            d = 1 / Math.sin(h),
            p = h ? function(t) {
                var e = Math.sin(t *= h) * d, n = Math.sin(h - t) * d, r = n * u + e * l, i = n * c + e * f, a = n * o + e * s;
                return[Math.atan2(i, r) * Ns, Math.atan2(a, Math.sqrt(r * r + i * i)) * Ns];
            } : function() { return[t * Ns, e * Ns]; };
        return p.distance = h, p;
    }

    function Rn() {

        function t(t, i) {
            var o = Math.sin(i *= As), a = Math.cos(i), s = us((t *= As) - e), u = Math.cos(s);
            Ru += Math.atan2(Math.sqrt((s = a * Math.sin(s)) * s + (s = r * o - n * a * u) * s), n * o + r * a * u), e = t, n = o, r = a;
        }

        var e, n, r;
        zu.point = function(i, o) { e = i * As, n = Math.sin(o *= As), r = Math.cos(o), zu.point = t; }, zu.lineEnd = function() { zu.point = zu.lineEnd = u; };
    }

    function zn(t, e) {

        function n(e, n) {
            var r = Math.cos(e), i = Math.cos(n), o = t(r * i);
            return[o * i * Math.sin(e), o * Math.sin(n)];
        }

        return n.invert = function(t, n) {
            var r = Math.sqrt(t * t + n * n), i = e(r), o = Math.sin(i), a = Math.cos(i);
            return[Math.atan2(t * o, r * a), Math.asin(r && n * o / r)];
        }, n;
    }

    function In(t, e) {

        function n(t, e) {
            var n = us(us(e) - Cs) < Ds ? 0 : a / Math.pow(i(e), o);
            return[n * Math.sin(o * t), a - n * Math.cos(o * t)];
        }

        var r = Math.cos(t), i = function(t) { return Math.tan(Ts / 4 + t / 2); }, o = t === e ? Math.sin(t) : Math.log(r / Math.cos(e)) / Math.log(i(e) / i(t)), a = r * Math.pow(i(t), o) / o;
        return o ? (n.invert = function(t, e) {
            var n = a - e, r = P(o) * Math.sqrt(t * t + n * n);
            return[Math.atan2(t, n) / o, 2 * Math.atan(Math.pow(a / r, 1 / o)) - Cs];
        }, n) : Hn;
    }

    function qn(t, e) {

        function n(t, e) {
            var n = o - e;
            return[n * Math.sin(i * t), o - n * Math.cos(i * t)];
        }

        var r = Math.cos(t), i = t === e ? Math.sin(t) : (r - Math.cos(e)) / (e - t), o = r / i + t;
        return us(i) < Ds ? Sn : (n.invert = function(t, e) {
            var n = o - e;
            return[Math.atan2(t, n) / i, o - P(i) * Math.sqrt(t * t + n * n)];
        }, n);
    }

    function Hn(t, e) { return[t, Math.log(Math.tan(Ts / 4 + e / 2))]; }

    function Yn(t) {
        var e, n = _n(t), r = n.scale, i = n.translate, o = n.clipExtent;
        return n.scale = function() {
            var t = r.apply(n, arguments);
            return t === n ? e ? n.clipExtent(null) : n : t;
        }, n.translate = function() {
            var t = i.apply(n, arguments);
            return t === n ? e ? n.clipExtent(null) : n : t;
        }, n.clipExtent = function(t) {
            var a = o.apply(n, arguments);
            if (a === n) {
                if (e = null == t) {
                    var s = Ts * r(), u = i();
                    o([[u[0] - s, u[1] - s], [u[0] + s, u[1] + s]]);
                }
            } else e && (a = null);
            return a;
        }, n.clipExtent(null);
    }

    function Bn(t, e) {
        var n = Math.cos(e) * Math.sin(t);
        return[Math.log((1 + n) / (1 - n)) / 2, Math.atan2(Math.tan(e), Math.cos(t))];
    }

    function Un(t) { return t[0]; }

    function Wn(t) { return t[1]; }

    function Vn(t, e, n, r) {
        var i, o, a, s, u, c, l;
        return i = r[t], o = i[0], a = i[1], i = r[e], s = i[0], u = i[1], i = r[n], c = i[0], l = i[1], (l - a) * (s - o) - (u - a) * (c - o) > 0;
    }

    function Xn(t, e, n) { return(n[0] - e[0]) * (t[1] - e[1]) < (n[1] - e[1]) * (t[0] - e[0]); }

    function Zn(t, e, n, r) {
        var i = t[0], o = n[0], a = e[0] - i, s = r[0] - o, u = t[1], c = n[1], l = e[1] - u, f = r[1] - c, h = (s * (u - c) - f * (i - o)) / (f * a - s * l);
        return[i + h * a, u + h * l];
    }

    function Gn(t) {
        var e = t[0], n = t[t.length - 1];
        return!(e[0] - n[0] || e[1] - n[1]);
    }

    function Kn() { yr(this), this.edge = this.site = this.circle = null; }

    function Jn(t) {
        var e = Ku.pop() || new Kn;
        return e.site = t, e;
    }

    function Qn(t) { cr(t), Xu.remove(t), Ku.push(t), yr(t); }

    function tr(t) {
        var e = t.circle, n = e.x, r = e.cy, i = { x: n, y: r }, o = t.P, a = t.N, s = [t];
        Qn(t);
        for (var u = o; u.circle && us(n - u.circle.x) < Ds && us(r - u.circle.cy) < Ds;)o = u.P, s.unshift(u), Qn(u), u = o;
        s.unshift(u), cr(u);
        for (var c = a; c.circle && us(n - c.circle.x) < Ds && us(r - c.circle.cy) < Ds;)a = c.N, s.push(c), Qn(c), c = a;
        s.push(c), cr(c);
        var l, f = s.length;
        for (l = 1; f > l; ++l)c = s[l], u = s[l - 1], gr(c.edge, u.site, c.site, i);
        u = s[0], c = s[f - 1], c.edge = dr(u.site, c.site, null, i), ur(u), ur(c);
    }

    function er(t) {
        for (var e, n, r, i, o = t.x, a = t.y, s = Xu._; s;)
            if (r = nr(s, a) - o, r > Ds)s = s.L;
            else {
                if (i = o - rr(s, a), !(i > Ds)) {
                    r > -Ds ? (e = s.P, n = s) : i > -Ds ? (e = s, n = s.N) : e = n = s;
                    break;
                }
                if (!s.R) {
                    e = s;
                    break;
                }
                s = s.R;
            }
        var u = Jn(t);
        if (Xu.insert(e, u), e || n) {
            if (e === n)return cr(e), n = Jn(e.site), Xu.insert(u, n), u.edge = n.edge = dr(e.site, u.site), ur(e), ur(n), void 0;
            if (!n)return u.edge = dr(e.site, u.site), void 0;
            cr(e), cr(n);
            var c = e.site, l = c.x, f = c.y, h = t.x - l, d = t.y - f, p = n.site, g = p.x - l, m = p.y - f, v = 2 * (h * m - d * g), y = h * h + d * d, b = g * g + m * m, x = { x: (m * y - d * b) / v + l, y: (h * b - g * y) / v + f };
            gr(n.edge, c, p, x), u.edge = dr(c, t, null, x), n.edge = dr(t, p, null, x), ur(e), ur(n);
        }
    }

    function nr(t, e) {
        var n = t.site, r = n.x, i = n.y, o = i - e;
        if (!o)return r;
        var a = t.P;
        if (!a)return-1 / 0;
        n = a.site;
        var s = n.x, u = n.y, c = u - e;
        if (!c)return s;
        var l = s - r, f = 1 / o - 1 / c, h = l / c;
        return f ? (-h + Math.sqrt(h * h - 2 * f * (l * l / (-2 * c) - u + c / 2 + i - o / 2))) / f + r : (r + s) / 2;
    }

    function rr(t, e) {
        var n = t.N;
        if (n)return nr(n, e);
        var r = t.site;
        return r.y === e ? r.x : 1 / 0;
    }

    function ir(t) { this.site = t, this.edges = []; }

    function or(t) { for (var e, n, r, i, o, a, s, u, c, l, f = t[0][0], h = t[1][0], d = t[0][1], p = t[1][1], g = Vu, m = g.length; m--;)if (o = g[m], o && o.prepare())for (s = o.edges, u = s.length, a = 0; u > a;)l = s[a].end(), r = l.x, i = l.y, c = s[++a % u].start(), e = c.x, n = c.y, (us(r - e) > Ds || us(i - n) > Ds) && (s.splice(a, 0, new mr(pr(o.site, l, us(r - f) < Ds && p - i > Ds ? { x: f, y: us(e - f) < Ds ? n : p } : us(i - p) < Ds && h - r > Ds ? { x: us(n - p) < Ds ? e : h, y: p } : us(r - h) < Ds && i - d > Ds ? { x: h, y: us(e - h) < Ds ? n : d } : us(i - d) < Ds && r - f > Ds ? { x: us(n - d) < Ds ? e : f, y: d } : null), o.site, null)), ++u); }

    function ar(t, e) { return e.angle - t.angle; }

    function sr() { yr(this), this.x = this.y = this.arc = this.site = this.cy = null; }

    function ur(t) {
        var e = t.P, n = t.N;
        if (e && n) {
            var r = e.site, i = t.site, o = n.site;
            if (r !== o) {
                var a = i.x, s = i.y, u = r.x - a, c = r.y - s, l = o.x - a, f = o.y - s, h = 2 * (u * f - c * l);
                if (!(h >= -$s)) {
                    var d = u * u + c * c, p = l * l + f * f, g = (f * d - c * p) / h, m = (u * p - l * d) / h, f = m + s, v = Ju.pop() || new sr;
                    v.arc = t, v.site = i, v.x = g + a, v.y = f + Math.sqrt(g * g + m * m), v.cy = f, t.circle = v;
                    for (var y = null, b = Gu._; b;)
                        if (v.y < b.y || v.y === b.y && v.x <= b.x) {
                            if (!b.L) {
                                y = b.P;
                                break;
                            }
                            b = b.L;
                        } else {
                            if (!b.R) {
                                y = b;
                                break;
                            }
                            b = b.R;
                        }
                    Gu.insert(y, v), y || (Zu = v);
                }
            }
        }
    }

    function cr(t) {
        var e = t.circle;
        e && (e.P || (Zu = e.N), Gu.remove(e), Ju.push(e), yr(e), t.circle = null);
    }

    function lr(t) { for (var e, n = Wu, r = rn(t[0][0], t[0][1], t[1][0], t[1][1]), i = n.length; i--;)e = n[i], (!fr(e, t) || !r(e) || us(e.a.x - e.b.x) < Ds && us(e.a.y - e.b.y) < Ds) && (e.a = e.b = null, n.splice(i, 1)); }

    function fr(t, e) {
        var n = t.b;
        if (n)return!0;
        var r, i, o = t.a, a = e[0][0], s = e[1][0], u = e[0][1], c = e[1][1], l = t.l, f = t.r, h = l.x, d = l.y, p = f.x, g = f.y, m = (h + p) / 2, v = (d + g) / 2;
        if (g === d) {
            if (a > m || m >= s)return;
            if (h > p) {
                if (o) {
                    if (o.y >= c)return;
                } else o = { x: m, y: u };
                n = { x: m, y: c };
            } else {
                if (o) {
                    if (o.y < u)return;
                } else o = { x: m, y: c };
                n = { x: m, y: u };
            }
        } else if (r = (h - p) / (g - d), i = v - r * m, -1 > r || r > 1)
            if (h > p) {
                if (o) {
                    if (o.y >= c)return;
                } else o = { x: (u - i) / r, y: u };
                n = { x: (c - i) / r, y: c };
            } else {
                if (o) {
                    if (o.y < u)return;
                } else o = { x: (c - i) / r, y: c };
                n = { x: (u - i) / r, y: u };
            }
        else if (g > d) {
            if (o) {
                if (o.x >= s)return;
            } else o = { x: a, y: r * a + i };
            n = { x: s, y: r * s + i };
        } else {
            if (o) {
                if (o.x < a)return;
            } else o = { x: s, y: r * s + i };
            n = { x: a, y: r * a + i };
        }
        return t.a = o, t.b = n, !0;
    }

    function hr(t, e) { this.l = t, this.r = e, this.a = this.b = null; }

    function dr(t, e, n, r) {
        var i = new hr(t, e);
        return Wu.push(i), n && gr(i, t, e, n), r && gr(i, e, t, r), Vu[t.i].edges.push(new mr(i, t, e)), Vu[e.i].edges.push(new mr(i, e, t)), i;
    }

    function pr(t, e, n) {
        var r = new hr(t, null);
        return r.a = e, r.b = n, Wu.push(r), r;
    }

    function gr(t, e, n, r) { t.a || t.b ? t.l === n ? t.b = r : t.a = r : (t.a = r, t.l = e, t.r = n); }

    function mr(t, e, n) {
        var r = t.a, i = t.b;
        this.edge = t, this.site = e, this.angle = n ? Math.atan2(n.y - e.y, n.x - e.x) : t.l === e ? Math.atan2(i.x - r.x, r.y - i.y) : Math.atan2(r.x - i.x, i.y - r.y);
    }

    function vr() { this._ = null; }

    function yr(t) { t.U = t.C = t.L = t.R = t.P = t.N = null; }

    function br(t, e) {
        var n = e, r = e.R, i = n.U;
        i ? i.L === n ? i.L = r : i.R = r : t._ = r, r.U = i, n.U = r, n.R = r.L, n.R && (n.R.U = n), r.L = n;
    }

    function xr(t, e) {
        var n = e, r = e.L, i = n.U;
        i ? i.L === n ? i.L = r : i.R = r : t._ = r, r.U = i, n.U = r, n.L = r.R, n.L && (n.L.U = n), r.R = n;
    }

    function wr(t) {
        for (; t.L;)t = t.L;
        return t;
    }

    function _r(t, e) {
        var n, r, i, o = t.sort(Mr).pop();
        for (Wu = [], Vu = new Array(t.length), Xu = new vr, Gu = new vr;;)
            if (i = Zu, o && (!i || o.y < i.y || o.y === i.y && o.x < i.x))(o.x !== n || o.y !== r) && (Vu[o.i] = new ir(o), er(o), n = o.x, r = o.y), o = t.pop();
            else {
                if (!i)break;
                tr(i.arc);
            }
        e && (lr(e), or(e));
        var a = { cells: Vu, edges: Wu };
        return Xu = Gu = Wu = Vu = null, a;
    }

    function Mr(t, e) { return e.y - t.y || e.x - t.x; }

    function kr(t, e, n) { return(t.x - n.x) * (e.y - t.y) - (t.x - e.x) * (n.y - t.y); }

    function Sr(t) { return t.x; }

    function Tr(t) { return t.y; }

    function Er() { return{ leaf: !0, nodes: [], point: null, x: null, y: null }; }

    function Cr(t, e, n, r, i, o) {
        if (!t(e, n, r, i, o)) {
            var a = .5 * (n + i), s = .5 * (r + o), u = e.nodes;
            u[0] && Cr(t, u[0], n, r, a, s), u[1] && Cr(t, u[1], a, r, i, s), u[2] && Cr(t, u[2], n, s, a, o), u[3] && Cr(t, u[3], a, s, i, o);
        }
    }

    function Dr(t, e) {
        t = Xa.rgb(t), e = Xa.rgb(e);
        var n = t.r, r = t.g, i = t.b, o = e.r - n, a = e.g - r, s = e.b - i;
        return function(t) { return"#" + ue(Math.round(n + o * t)) + ue(Math.round(r + a * t)) + ue(Math.round(i + s * t)); };
    }

    function $r(t, e) {
        var n, r = {}, i = {};
        for (n in t)n in e ? r[n] = Lr(t[n], e[n]) : i[n] = t[n];
        for (n in e)n in t || (i[n] = e[n]);
        return function(t) {
            for (n in r)i[n] = r[n](t);
            return i;
        };
    }

    function Ar(t, e) { return e -= t = +t, function(n) { return t + e * n; }; }

    function Nr(t, e) {
        var n, r, i, o, a, s = 0, u = 0, c = [], l = [];
        for (t += "", e += "", tc.lastIndex = 0, r = 0; n = tc.exec(e); ++r)n.index && c.push(e.substring(s, u = n.index)), l.push({ i: c.length, x: n[0] }), c.push(null), s = tc.lastIndex;
        for (s < e.length && c.push(e.substring(s)), r = 0, o = l.length; (n = tc.exec(t)) && o > r; ++r)
            if (a = l[r], a.x == n[0]) {
                if (a.i)
                    if (null == c[a.i + 1])for (c[a.i - 1] += a.x, c.splice(a.i, 1), i = r + 1; o > i; ++i)l[i].i--;
                    else for (c[a.i - 1] += a.x + c[a.i + 1], c.splice(a.i, 2), i = r + 1; o > i; ++i)l[i].i -= 2;
                else if (null == c[a.i + 1])c[a.i] = a.x;
                else for (c[a.i] = a.x + c[a.i + 1], c.splice(a.i + 1, 1), i = r + 1; o > i; ++i)l[i].i--;
                l.splice(r, 1), o--, r--;
            } else a.x = Ar(parseFloat(n[0]), parseFloat(a.x));
        for (; o > r;)a = l.pop(), null == c[a.i + 1] ? c[a.i] = a.x : (c[a.i] = a.x + c[a.i + 1], c.splice(a.i + 1, 1)), o--;
        return 1 === c.length ? null == c[0] ? (a = l[0].x, function(t) { return a(t) + ""; }) : function() { return e; } : function(t) {
            for (r = 0; o > r; ++r)c[(a = l[r]).i] = a.x(t);
            return c.join("");
        };
    }

    function Lr(t, e) {
        for (var n, r = Xa.interpolators.length; --r >= 0 && !(n = Xa.interpolators[r](t, e)););
        return n;
    }

    function jr(t, e) {
        var n, r = [], i = [], o = t.length, a = e.length, s = Math.min(t.length, e.length);
        for (n = 0; s > n; ++n)r.push(Lr(t[n], e[n]));
        for (; o > n; ++n)i[n] = t[n];
        for (; a > n; ++n)i[n] = e[n];
        return function(t) {
            for (n = 0; s > n; ++n)i[n] = r[n](t);
            return i;
        };
    }

    function Or(t) { return function(e) { return 0 >= e ? 0 : e >= 1 ? 1 : t(e); }; }

    function Fr(t) { return function(e) { return 1 - t(1 - e); }; }

    function Pr(t) { return function(e) { return .5 * (.5 > e ? t(2 * e) : 2 - t(2 - 2 * e)); }; }

    function Rr(t) { return t * t; }

    function zr(t) { return t * t * t; }

    function Ir(t) {
        if (0 >= t)return 0;
        if (t >= 1)return 1;
        var e = t * t, n = e * t;
        return 4 * (.5 > t ? n : 3 * (t - e) + n - .75);
    }

    function qr(t) { return function(e) { return Math.pow(e, t); }; }

    function Hr(t) { return 1 - Math.cos(t * Cs); }

    function Yr(t) { return Math.pow(2, 10 * (t - 1)); }

    function Br(t) { return 1 - Math.sqrt(1 - t * t); }

    function Ur(t, e) {
        var n;
        return arguments.length < 2 && (e = .45), arguments.length ? n = e / Es * Math.asin(1 / t) : (t = 1, n = e / 4), function(r) { return 1 + t * Math.pow(2, -10 * r) * Math.sin((r - n) * Es / e); };
    }

    function Wr(t) { return t || (t = 1.70158), function(e) { return e * e * ((t + 1) * e - t); }; }

    function Vr(t) { return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375; }

    function Xr(t, e) {
        t = Xa.hcl(t), e = Xa.hcl(e);
        var n = t.h, r = t.c, i = t.l, o = e.h - n, a = e.c - r, s = e.l - i;
        return isNaN(a) && (a = 0, r = isNaN(r) ? e.c : r), isNaN(o) ? (o = 0, n = isNaN(n) ? e.h : n) : o > 180 ? o -= 360 : -180 > o && (o += 360), function(t) { return G(n + o * t, r + a * t, i + s * t) + ""; };
    }

    function Zr(t, e) {
        t = Xa.hsl(t), e = Xa.hsl(e);
        var n = t.h, r = t.s, i = t.l, o = e.h - n, a = e.s - r, s = e.l - i;
        return isNaN(a) && (a = 0, r = isNaN(r) ? e.s : r), isNaN(o) ? (o = 0, n = isNaN(n) ? e.h : n) : o > 180 ? o -= 360 : -180 > o && (o += 360), function(t) { return V(n + o * t, r + a * t, i + s * t) + ""; };
    }

    function Gr(t, e) {
        t = Xa.lab(t), e = Xa.lab(e);
        var n = t.l, r = t.a, i = t.b, o = e.l - n, a = e.a - r, s = e.b - i;
        return function(t) { return Q(n + o * t, r + a * t, i + s * t) + ""; };
    }

    function Kr(t, e) { return e -= t, function(n) { return Math.round(t + e * n); }; }

    function Jr(t) {
        var e = [t.a, t.b], n = [t.c, t.d], r = ti(e), i = Qr(e, n), o = ti(ei(n, e, -i)) || 0;
        e[0] * n[1] < n[0] * e[1] && (e[0] *= -1, e[1] *= -1, r *= -1, i *= -1), this.rotate = (r ? Math.atan2(e[1], e[0]) : Math.atan2(-n[0], n[1])) * Ns, this.translate = [t.e, t.f], this.scale = [r, o], this.skew = o ? Math.atan2(i, o) * Ns : 0;
    }

    function Qr(t, e) { return t[0] * e[0] + t[1] * e[1]; }

    function ti(t) {
        var e = Math.sqrt(Qr(t, t));
        return e && (t[0] /= e, t[1] /= e), e;
    }

    function ei(t, e, n) { return t[0] += n * e[0], t[1] += n * e[1], t; }

    function ni(t, e) {
        var n, r = [], i = [], o = Xa.transform(t), a = Xa.transform(e), s = o.translate, u = a.translate, c = o.rotate, l = a.rotate, f = o.skew, h = a.skew, d = o.scale, p = a.scale;
        return s[0] != u[0] || s[1] != u[1] ? (r.push("translate(", null, ",", null, ")"), i.push({ i: 1, x: Ar(s[0], u[0]) }, { i: 3, x: Ar(s[1], u[1]) })) : u[0] || u[1] ? r.push("translate(" + u + ")") : r.push(""), c != l ? (c - l > 180 ? l += 360 : l - c > 180 && (c += 360), i.push({ i: r.push(r.pop() + "rotate(", null, ")") - 2, x: Ar(c, l) })) : l && r.push(r.pop() + "rotate(" + l + ")"), f != h ? i.push({ i: r.push(r.pop() + "skewX(", null, ")") - 2, x: Ar(f, h) }) : h && r.push(r.pop() + "skewX(" + h + ")"), d[0] != p[0] || d[1] != p[1] ? (n = r.push(r.pop() + "scale(", null, ",", null, ")"), i.push({ i: n - 4, x: Ar(d[0], p[0]) }, { i: n - 2, x: Ar(d[1], p[1]) })) : (1 != p[0] || 1 != p[1]) && r.push(r.pop() + "scale(" + p + ")"), n = i.length, function(t) {
            for (var e, o = -1; ++o < n;)r[(e = i[o]).i] = e.x(t);
            return r.join("");
        };
    }

    function ri(t, e) { return e = e - (t = +t) ? 1 / (e - t) : 0, function(n) { return(n - t) * e; }; }

    function ii(t, e) { return e = e - (t = +t) ? 1 / (e - t) : 0, function(n) { return Math.max(0, Math.min(1, (n - t) * e)); }; }

    function oi(t) {
        for (var e = t.source, n = t.target, r = si(e, n), i = [e]; e !== r;)e = e.parent, i.push(e);
        for (var o = i.length; n !== r;)i.splice(o, 0, n), n = n.parent;
        return i;
    }

    function ai(t) {
        for (var e = [], n = t.parent; null != n;)e.push(t), t = n, n = n.parent;
        return e.push(t), e;
    }

    function si(t, e) {
        if (t === e)return t;
        for (var n = ai(t), r = ai(e), i = n.pop(), o = r.pop(), a = null; i === o;)a = i, i = n.pop(), o = r.pop();
        return a;
    }

    function ui(t) { t.fixed |= 2; }

    function ci(t) { t.fixed &= -7; }

    function li(t) { t.fixed |= 4, t.px = t.x, t.py = t.y; }

    function fi(t) { t.fixed &= -5; }

    function hi(t, e, n) {
        var r = 0, i = 0;
        if (t.charge = 0, !t.leaf)for (var o, a = t.nodes, s = a.length, u = -1; ++u < s;)o = a[u], null != o && (hi(o, e, n), t.charge += o.charge, r += o.charge * o.cx, i += o.charge * o.cy);
        if (t.point) {
            t.leaf || (t.point.x += Math.random() - .5, t.point.y += Math.random() - .5);
            var c = e * n[t.point.index];
            t.charge += t.pointCharge = c, r += c * t.point.x, i += c * t.point.y;
        }
        t.cx = r / t.charge, t.cy = i / t.charge;
    }

    function di(t, e) { return Xa.rebind(t, e, "sort", "children", "value"), t.nodes = t, t.links = vi, t; }

    function pi(t) { return t.children; }

    function gi(t) { return t.value; }

    function mi(t, e) { return e.value - t.value; }

    function vi(t) { return Xa.merge(t.map(function(t) { return(t.children || []).map(function(e) { return{ source: t, target: e }; }); })); }

    function yi(t) { return t.x; }

    function bi(t) { return t.y; }

    function xi(t, e, n) { t.y0 = e, t.y = n; }

    function wi(t) { return Xa.range(t.length); }

    function _i(t) {
        for (var e = -1, n = t[0].length, r = []; ++e < n;)r[e] = 0;
        return r;
    }

    function Mi(t) {
        for (var e, n = 1, r = 0, i = t[0][1], o = t.length; o > n; ++n)(e = t[n][1]) > i && (r = n, i = e);
        return r;
    }

    function ki(t) { return t.reduce(Si, 0); }

    function Si(t, e) { return t + e[1]; }

    function Ti(t, e) { return Ei(t, Math.ceil(Math.log(e.length) / Math.LN2 + 1)); }

    function Ei(t, e) {
        for (var n = -1, r = +t[0], i = (t[1] - r) / e, o = []; ++n <= e;)o[n] = i * n + r;
        return o;
    }

    function Ci(t) { return[Xa.min(t), Xa.max(t)]; }

    function Di(t, e) { return t.parent == e.parent ? 1 : 2; }

    function $i(t) {
        var e = t.children;
        return e && e.length ? e[0] : t._tree.thread;
    }

    function Ai(t) {
        var e, n = t.children;
        return n && (e = n.length) ? n[e - 1] : t._tree.thread;
    }

    function Ni(t, e) {
        var n = t.children;
        if (n && (i = n.length))for (var r, i, o = -1; ++o < i;)e(r = Ni(n[o], e), t) > 0 && (t = r);
        return t;
    }

    function Li(t, e) { return t.x - e.x; }

    function ji(t, e) { return e.x - t.x; }

    function Oi(t, e) { return t.depth - e.depth; }

    function Fi(t, e) {

        function n(t, r) {
            var i = t.children;
            if (i && (a = i.length))for (var o, a, s = null, u = -1; ++u < a;)o = i[u], n(o, s), s = o;
            e(t, r);
        }

        n(t, null);
    }

    function Pi(t) { for (var e, n = 0, r = 0, i = t.children, o = i.length; --o >= 0;)e = i[o]._tree, e.prelim += n, e.mod += n, n += e.shift + (r += e.change); }

    function Ri(t, e, n) {
        t = t._tree, e = e._tree;
        var r = n / (e.number - t.number);
        t.change += r, e.change -= r, e.shift += n, e.prelim += n, e.mod += n;
    }

    function zi(t, e, n) { return t._tree.ancestor.parent == e.parent ? t._tree.ancestor : n; }

    function Ii(t, e) { return t.value - e.value; }

    function qi(t, e) {
        var n = t._pack_next;
        t._pack_next = e, e._pack_prev = t, e._pack_next = n, n._pack_prev = e;
    }

    function Hi(t, e) { t._pack_next = e, e._pack_prev = t; }

    function Yi(t, e) {
        var n = e.x - t.x, r = e.y - t.y, i = t.r + e.r;
        return .999 * i * i > n * n + r * r;
    }

    function Bi(t) {

        function e(t) { l = Math.min(t.x - t.r, l), f = Math.max(t.x + t.r, f), h = Math.min(t.y - t.r, h), d = Math.max(t.y + t.r, d); }

        if ((n = t.children) && (c = n.length)) {
            var n, r, i, o, a, s, u, c, l = 1 / 0, f = -1 / 0, h = 1 / 0, d = -1 / 0;
            if (n.forEach(Ui), r = n[0], r.x = -r.r, r.y = 0, e(r), c > 1 && (i = n[1], i.x = i.r, i.y = 0, e(i), c > 2))
                for (o = n[2], Xi(r, i, o), e(o), qi(r, o), r._pack_prev = o, qi(o, i), i = r._pack_next, a = 3; c > a; a++) {
                    Xi(r, i, o = n[a]);
                    var p = 0, g = 1, m = 1;
                    for (s = i._pack_next; s !== i; s = s._pack_next, g++)
                        if (Yi(s, o)) {
                            p = 1;
                            break;
                        }
                    if (1 == p)for (u = r._pack_prev; u !== s._pack_prev && !Yi(u, o); u = u._pack_prev, m++);
                    p ? (m > g || g == m && i.r < r.r ? Hi(r, i = s) : Hi(r = u, i), a--) : (qi(r, o), i = o, e(o));
                }
            var v = (l + f) / 2, y = (h + d) / 2, b = 0;
            for (a = 0; c > a; a++)o = n[a], o.x -= v, o.y -= y, b = Math.max(b, o.r + Math.sqrt(o.x * o.x + o.y * o.y));
            t.r = b, n.forEach(Wi);
        }
    }

    function Ui(t) { t._pack_next = t._pack_prev = t; }

    function Wi(t) { delete t._pack_next, delete t._pack_prev; }

    function Vi(t, e, n, r) {
        var i = t.children;
        if (t.x = e += r * t.x, t.y = n += r * t.y, t.r *= r, i)for (var o = -1, a = i.length; ++o < a;)Vi(i[o], e, n, r);
    }

    function Xi(t, e, n) {
        var r = t.r + n.r, i = e.x - t.x, o = e.y - t.y;
        if (r && (i || o)) {
            var a = e.r + n.r, s = i * i + o * o;
            a *= a, r *= r;
            var u = .5 + (r - a) / (2 * s), c = Math.sqrt(Math.max(0, 2 * a * (r + s) - (r -= s) * r - a * a)) / (2 * s);
            n.x = t.x + u * i + c * o, n.y = t.y + u * o - c * i;
        } else n.x = t.x + r, n.y = t.y;
    }

    function Zi(t) { return 1 + Xa.max(t, function(t) { return t.y; }); }

    function Gi(t) { return t.reduce(function(t, e) { return t + e.x; }, 0) / t.length; }

    function Ki(t) {
        var e = t.children;
        return e && e.length ? Ki(e[0]) : t;
    }

    function Ji(t) {
        var e, n = t.children;
        return n && (e = n.length) ? Ji(n[e - 1]) : t;
    }

    function Qi(t) { return{ x: t.x, y: t.y, dx: t.dx, dy: t.dy }; }

    function to(t, e) {
        var n = t.x + e[3], r = t.y + e[0], i = t.dx - e[1] - e[3], o = t.dy - e[0] - e[2];
        return 0 > i && (n += i / 2, i = 0), 0 > o && (r += o / 2, o = 0), { x: n, y: r, dx: i, dy: o };
    }

    function eo(t) {
        var e = t[0], n = t[t.length - 1];
        return n > e ? [e, n] : [n, e];
    }

    function no(t) { return t.rangeExtent ? t.rangeExtent() : eo(t.range()); }

    function ro(t, e, n, r) {
        var i = n(t[0], t[1]), o = r(e[0], e[1]);
        return function(t) { return o(i(t)); };
    }

    function io(t, e) {
        var n, r = 0, i = t.length - 1, o = t[r], a = t[i];
        return o > a && (n = r, r = i, i = n, n = o, o = a, a = n), t[r] = e.floor(o), t[i] = e.ceil(a), t;
    }

    function oo(t) { return t ? { floor: function(e) { return Math.floor(e / t) * t; }, ceil: function(e) { return Math.ceil(e / t) * t; } } : lc; }

    function ao(t, e, n, r) {
        var i = [], o = [], a = 0, s = Math.min(t.length, e.length) - 1;
        for (t[s] < t[0] && (t = t.slice().reverse(), e = e.slice().reverse()); ++a <= s;)i.push(n(t[a - 1], t[a])), o.push(r(e[a - 1], e[a]));
        return function(e) {
            var n = Xa.bisect(t, e, 1, s) - 1;
            return o[n](i[n](e));
        };
    }

    function so(t, e, n, r) {

        function i() {
            var i = Math.min(t.length, e.length) > 2 ? ao : ro, u = r ? ii : ri;
            return a = i(t, e, u, n), s = i(e, t, u, Lr), o;
        }

        function o(t) { return a(t); }

        var a, s;
        return o.invert = function(t) { return s(t); }, o.domain = function(e) { return arguments.length ? (t = e.map(Number), i()) : t; }, o.range = function(t) { return arguments.length ? (e = t, i()) : e; }, o.rangeRound = function(t) { return o.range(t).interpolate(Kr); }, o.clamp = function(t) { return arguments.length ? (r = t, i()) : r; }, o.interpolate = function(t) { return arguments.length ? (n = t, i()) : n; }, o.ticks = function(e) { return fo(t, e); }, o.tickFormat = function(e, n) { return ho(t, e, n); }, o.nice = function(e) { return co(t, e), i(); }, o.copy = function() { return so(t, e, n, r); }, i();
    }

    function uo(t, e) { return Xa.rebind(t, e, "range", "rangeRound", "interpolate", "clamp"); }

    function co(t, e) { return io(t, oo(lo(t, e)[2])); }

    function lo(t, e) {
        null == e && (e = 10);
        var n = eo(t), r = n[1] - n[0], i = Math.pow(10, Math.floor(Math.log(r / e) / Math.LN10)), o = e / r * i;
        return .15 >= o ? i *= 10 : .35 >= o ? i *= 5 : .75 >= o && (i *= 2), n[0] = Math.ceil(n[0] / i) * i, n[1] = Math.floor(n[1] / i) * i + .5 * i, n[2] = i, n;
    }

    function fo(t, e) { return Xa.range.apply(Xa, lo(t, e)); }

    function ho(t, e, n) {
        var r = lo(t, e);
        return Xa.format(n ? n.replace(ou, function(t, e, n, i, o, a, s, u, c, l) { return[e, n, i, o, a, s, u, c || "." + go(l, r), l].join(""); }) : ",." + po(r[2]) + "f");
    }

    function po(t) { return-Math.floor(Math.log(t) / Math.LN10 + .01); }

    function go(t, e) {
        var n = po(e[2]);
        return t in fc ? Math.abs(n - po(Math.max(Math.abs(e[0]), Math.abs(e[1])))) + +("e" !== t) : n - 2 * ("%" === t);
    }

    function mo(t, e, n, r) {

        function i(t) { return(n ? Math.log(0 > t ? 0 : t) : -Math.log(t > 0 ? 0 : -t)) / Math.log(e); }

        function o(t) { return n ? Math.pow(e, t) : -Math.pow(e, -t); }

        function a(e) { return t(i(e)); }

        return a.invert = function(e) { return o(t.invert(e)); }, a.domain = function(e) { return arguments.length ? (n = e[0] >= 0, t.domain((r = e.map(Number)).map(i)), a) : r; }, a.base = function(n) { return arguments.length ? (e = +n, t.domain(r.map(i)), a) : e; }, a.nice = function() {
            var e = io(r.map(i), n ? Math : dc);
            return t.domain(e), r = e.map(o), a;
        }, a.ticks = function() {
            var t = eo(r), a = [], s = t[0], u = t[1], c = Math.floor(i(s)), l = Math.ceil(i(u)), f = e % 1 ? 2 : e;
            if (isFinite(l - c)) {
                if (n) {
                    for (; l > c; c++)for (var h = 1; f > h; h++)a.push(o(c) * h);
                    a.push(o(c));
                } else for (a.push(o(c)); c++ < l;)for (var h = f - 1; h > 0; h--)a.push(o(c) * h);
                for (c = 0; a[c] < s; c++);
                for (l = a.length; a[l - 1] > u; l--);
                a = a.slice(c, l);
            }
            return a;
        }, a.tickFormat = function(t, e) {
            if (!arguments.length)return hc;
            arguments.length < 2 ? e = hc : "function" != typeof e && (e = Xa.format(e));
            var r, s = Math.max(.1, t / a.ticks().length), u = n ? (r = 1e-12, Math.ceil) : (r = -1e-12, Math.floor);
            return function(t) { return t / o(u(i(t) + r)) <= s ? e(t) : ""; };
        }, a.copy = function() { return mo(t.copy(), e, n, r); }, uo(a, t);
    }

    function vo(t, e, n) {

        function r(e) { return t(i(e)); }

        var i = yo(e), o = yo(1 / e);
        return r.invert = function(e) { return o(t.invert(e)); }, r.domain = function(e) { return arguments.length ? (t.domain((n = e.map(Number)).map(i)), r) : n; }, r.ticks = function(t) { return fo(n, t); }, r.tickFormat = function(t, e) { return ho(n, t, e); }, r.nice = function(t) { return r.domain(co(n, t)); }, r.exponent = function(a) { return arguments.length ? (i = yo(e = a), o = yo(1 / e), t.domain(n.map(i)), r) : e; }, r.copy = function() { return vo(t.copy(), e, n); }, uo(r, t);
    }

    function yo(t) { return function(e) { return 0 > e ? -Math.pow(-e, t) : Math.pow(e, t); }; }

    function bo(t, e) {

        function n(n) { return a[((o.get(n) || "range" === e.t && o.set(n, t.push(n))) - 1) % a.length]; }

        function r(e, n) { return Xa.range(t.length).map(function(t) { return e + n * t; }); }

        var o, a, s;
        return n.domain = function(r) {
            if (!arguments.length)return t;
            t = [], o = new i;
            for (var a, s = -1, u = r.length; ++s < u;)o.has(a = r[s]) || o.set(a, t.push(a));
            return n[e.t].apply(n, e.a);
        }, n.range = function(t) { return arguments.length ? (a = t, s = 0, e = { t: "range", a: arguments }, n) : a; }, n.rangePoints = function(i, o) {
            arguments.length < 2 && (o = 0);
            var u = i[0], c = i[1], l = (c - u) / (Math.max(1, t.length - 1) + o);
            return a = r(t.length < 2 ? (u + c) / 2 : u + l * o / 2, l), s = 0, e = { t: "rangePoints", a: arguments }, n;
        }, n.rangeBands = function(i, o, u) {
            arguments.length < 2 && (o = 0), arguments.length < 3 && (u = o);
            var c = i[1] < i[0], l = i[c - 0], f = i[1 - c], h = (f - l) / (t.length - o + 2 * u);
            return a = r(l + h * u, h), c && a.reverse(), s = h * (1 - o), e = { t: "rangeBands", a: arguments }, n;
        }, n.rangeRoundBands = function(i, o, u) {
            arguments.length < 2 && (o = 0), arguments.length < 3 && (u = o);
            var c = i[1] < i[0], l = i[c - 0], f = i[1 - c], h = Math.floor((f - l) / (t.length - o + 2 * u)), d = f - l - (t.length - o) * h;
            return a = r(l + Math.round(d / 2), h), c && a.reverse(), s = Math.round(h * (1 - o)), e = { t: "rangeRoundBands", a: arguments }, n;
        }, n.rangeBand = function() { return s; }, n.rangeExtent = function() { return eo(e.a[0]); }, n.copy = function() { return bo(t, e); }, n.domain(t);
    }

    function xo(t, e) {

        function n() {
            var n = 0, o = e.length;
            for (i = []; ++n < o;)i[n - 1] = Xa.quantile(t, n / o);
            return r;
        }

        function r(t) { return isNaN(t = +t) ? void 0 : e[Xa.bisect(i, t)]; }

        var i;
        return r.domain = function(e) { return arguments.length ? (t = e.filter(function(t) { return!isNaN(t); }).sort(Xa.ascending), n()) : t; }, r.range = function(t) { return arguments.length ? (e = t, n()) : e; }, r.quantiles = function() { return i; }, r.invertExtent = function(n) { return n = e.indexOf(n), 0 > n ? [0 / 0, 0 / 0] : [n > 0 ? i[n - 1] : t[0], n < i.length ? i[n] : t[t.length - 1]]; }, r.copy = function() { return xo(t, e); }, n();
    }

    function wo(t, e, n) {

        function r(e) { return n[Math.max(0, Math.min(a, Math.floor(o * (e - t))))]; }

        function i() { return o = n.length / (e - t), a = n.length - 1, r; }

        var o, a;
        return r.domain = function(n) { return arguments.length ? (t = +n[0], e = +n[n.length - 1], i()) : [t, e]; }, r.range = function(t) { return arguments.length ? (n = t, i()) : n; }, r.invertExtent = function(e) { return e = n.indexOf(e), e = 0 > e ? 0 / 0 : e / o + t, [e, e + 1 / o]; }, r.copy = function() { return wo(t, e, n); }, i();
    }

    function _o(t, e) {

        function n(n) { return n >= n ? e[Xa.bisect(t, n)] : void 0; }

        return n.domain = function(e) { return arguments.length ? (t = e, n) : t; }, n.range = function(t) { return arguments.length ? (e = t, n) : e; }, n.invertExtent = function(n) { return n = e.indexOf(n), [t[n - 1], t[n]]; }, n.copy = function() { return _o(t, e); }, n;
    }

    function Mo(t) {

        function e(t) { return+t; }

        return e.invert = e, e.domain = e.range = function(n) { return arguments.length ? (t = n.map(e), e) : t; }, e.ticks = function(e) { return fo(t, e); }, e.tickFormat = function(e, n) { return ho(t, e, n); }, e.copy = function() { return Mo(t); }, e;
    }

    function ko(t) { return t.innerRadius; }

    function So(t) { return t.outerRadius; }

    function To(t) { return t.startAngle; }

    function Eo(t) { return t.endAngle; }

    function Co(t) {

        function e(e) {

            function a() { c.push("M", o(t(l), s)); }

            for (var u, c = [], l = [], f = -1, h = e.length, d = pe(n), p = pe(r); ++f < h;)i.call(this, u = e[f], f) ? l.push([+d.call(this, u, f), +p.call(this, u, f)]) : l.length && (a(), l = []);
            return l.length && a(), c.length ? c.join("") : null;
        }

        var n = Un, r = Wn, i = Be, o = Do, a = o.key, s = .7;
        return e.x = function(t) { return arguments.length ? (n = t, e) : n; }, e.y = function(t) { return arguments.length ? (r = t, e) : r; }, e.defined = function(t) { return arguments.length ? (i = t, e) : i; }, e.interpolate = function(t) { return arguments.length ? (a = "function" == typeof t ? o = t : (o = xc.get(t) || Do).key, e) : a; }, e.tension = function(t) { return arguments.length ? (s = t, e) : s; }, e;
    }

    function Do(t) { return t.join("L"); }

    function $o(t) { return Do(t) + "Z"; }

    function Ao(t) {
        for (var e = 0, n = t.length, r = t[0], i = [r[0], ",", r[1]]; ++e < n;)i.push("H", (r[0] + (r = t[e])[0]) / 2, "V", r[1]);
        return n > 1 && i.push("H", r[0]), i.join("");
    }

    function No(t) {
        for (var e = 0, n = t.length, r = t[0], i = [r[0], ",", r[1]]; ++e < n;)i.push("V", (r = t[e])[1], "H", r[0]);
        return i.join("");
    }

    function Lo(t) {
        for (var e = 0, n = t.length, r = t[0], i = [r[0], ",", r[1]]; ++e < n;)i.push("H", (r = t[e])[0], "V", r[1]);
        return i.join("");
    }

    function jo(t, e) { return t.length < 4 ? Do(t) : t[1] + Po(t.slice(1, t.length - 1), Ro(t, e)); }

    function Oo(t, e) { return t.length < 3 ? Do(t) : t[0] + Po((t.push(t[0]), t), Ro([t[t.length - 2]].concat(t, [t[1]]), e)); }

    function Fo(t, e) { return t.length < 3 ? Do(t) : t[0] + Po(t, Ro(t, e)); }

    function Po(t, e) {
        if (e.length < 1 || t.length != e.length && t.length != e.length + 2)return Do(t);
        var n = t.length != e.length, r = "", i = t[0], o = t[1], a = e[0], s = a, u = 1;
        if (n && (r += "Q" + (o[0] - 2 * a[0] / 3) + "," + (o[1] - 2 * a[1] / 3) + "," + o[0] + "," + o[1], i = t[1], u = 2), e.length > 1) {
            s = e[1], o = t[u], u++, r += "C" + (i[0] + a[0]) + "," + (i[1] + a[1]) + "," + (o[0] - s[0]) + "," + (o[1] - s[1]) + "," + o[0] + "," + o[1];
            for (var c = 2; c < e.length; c++, u++)o = t[u], s = e[c], r += "S" + (o[0] - s[0]) + "," + (o[1] - s[1]) + "," + o[0] + "," + o[1];
        }
        if (n) {
            var l = t[u];
            r += "Q" + (o[0] + 2 * s[0] / 3) + "," + (o[1] + 2 * s[1] / 3) + "," + l[0] + "," + l[1];
        }
        return r;
    }

    function Ro(t, e) {
        for (var n, r = [], i = (1 - e) / 2, o = t[0], a = t[1], s = 1, u = t.length; ++s < u;)n = o, o = a, a = t[s], r.push([i * (a[0] - n[0]), i * (a[1] - n[1])]);
        return r;
    }

    function zo(t) {
        if (t.length < 3)return Do(t);
        var e = 1, n = t.length, r = t[0], i = r[0], o = r[1], a = [i, i, i, (r = t[1])[0]], s = [o, o, o, r[1]], u = [i, ",", o, "L", Yo(Mc, a), ",", Yo(Mc, s)];
        for (t.push(t[n - 1]); ++e <= n;)r = t[e], a.shift(), a.push(r[0]), s.shift(), s.push(r[1]), Bo(u, a, s);
        return t.pop(), u.push("L", r), u.join("");
    }

    function Io(t) {
        if (t.length < 4)return Do(t);
        for (var e, n = [], r = -1, i = t.length, o = [0], a = [0]; ++r < 3;)e = t[r], o.push(e[0]), a.push(e[1]);
        for (n.push(Yo(Mc, o) + "," + Yo(Mc, a)), --r; ++r < i;)e = t[r], o.shift(), o.push(e[0]), a.shift(), a.push(e[1]), Bo(n, o, a);
        return n.join("");
    }

    function qo(t) {
        for (var e, n, r = -1, i = t.length, o = i + 4, a = [], s = []; ++r < 4;)n = t[r % i], a.push(n[0]), s.push(n[1]);
        for (e = [Yo(Mc, a), ",", Yo(Mc, s)], --r; ++r < o;)n = t[r % i], a.shift(), a.push(n[0]), s.shift(), s.push(n[1]), Bo(e, a, s);
        return e.join("");
    }

    function Ho(t, e) {
        var n = t.length - 1;
        if (n)for (var r, i, o = t[0][0], a = t[0][1], s = t[n][0] - o, u = t[n][1] - a, c = -1; ++c <= n;)r = t[c], i = c / n, r[0] = e * r[0] + (1 - e) * (o + i * s), r[1] = e * r[1] + (1 - e) * (a + i * u);
        return zo(t);
    }

    function Yo(t, e) { return t[0] * e[0] + t[1] * e[1] + t[2] * e[2] + t[3] * e[3]; }

    function Bo(t, e, n) { t.push("C", Yo(wc, e), ",", Yo(wc, n), ",", Yo(_c, e), ",", Yo(_c, n), ",", Yo(Mc, e), ",", Yo(Mc, n)); }

    function Uo(t, e) { return(e[1] - t[1]) / (e[0] - t[0]); }

    function Wo(t) {
        for (var e = 0, n = t.length - 1, r = [], i = t[0], o = t[1], a = r[0] = Uo(i, o); ++e < n;)r[e] = (a + (a = Uo(i = o, o = t[e + 1]))) / 2;
        return r[e] = a, r;
    }

    function Vo(t) {
        for (var e, n, r, i, o = [], a = Wo(t), s = -1, u = t.length - 1; ++s < u;)e = Uo(t[s], t[s + 1]), us(e) < Ds ? a[s] = a[s + 1] = 0 : (n = a[s] / e, r = a[s + 1] / e, i = n * n + r * r, i > 9 && (i = 3 * e / Math.sqrt(i), a[s] = i * n, a[s + 1] = i * r));
        for (s = -1; ++s <= u;)i = (t[Math.min(u, s + 1)][0] - t[Math.max(0, s - 1)][0]) / (6 * (1 + a[s] * a[s])), o.push([i || 0, a[s] * i || 0]);
        return o;
    }

    function Xo(t) { return t.length < 3 ? Do(t) : t[0] + Po(t, Vo(t)); }

    function Zo(t) {
        for (var e, n, r, i = -1, o = t.length; ++i < o;)e = t[i], n = e[0], r = e[1] + yc, e[0] = n * Math.cos(r), e[1] = n * Math.sin(r);
        return t;
    }

    function Go(t) {

        function e(e) {

            function u() { g.push("M", s(t(v), f), l, c(t(m.reverse()), f), "Z"); }

            for (var h, d, p, g = [], m = [], v = [], y = -1, b = e.length, x = pe(n), w = pe(i), _ = n === r ? function() { return d; } : pe(r), M = i === o ? function() { return p; } : pe(o); ++y < b;)a.call(this, h = e[y], y) ? (m.push([d = +x.call(this, h, y), p = +w.call(this, h, y)]), v.push([+_.call(this, h, y), +M.call(this, h, y)])) : m.length && (u(), m = [], v = []);
            return m.length && u(), g.length ? g.join("") : null;
        }

        var n = Un, r = Un, i = 0, o = Wn, a = Be, s = Do, u = s.key, c = s, l = "L", f = .7;
        return e.x = function(t) { return arguments.length ? (n = r = t, e) : r; }, e.x0 = function(t) { return arguments.length ? (n = t, e) : n; }, e.x1 = function(t) { return arguments.length ? (r = t, e) : r; }, e.y = function(t) { return arguments.length ? (i = o = t, e) : o; }, e.y0 = function(t) { return arguments.length ? (i = t, e) : i; }, e.y1 = function(t) { return arguments.length ? (o = t, e) : o; }, e.defined = function(t) { return arguments.length ? (a = t, e) : a; }, e.interpolate = function(t) { return arguments.length ? (u = "function" == typeof t ? s = t : (s = xc.get(t) || Do).key, c = s.reverse || s, l = s.closed ? "M" : "L", e) : u; }, e.tension = function(t) { return arguments.length ? (f = t, e) : f; }, e;
    }

    function Ko(t) { return t.radius; }

    function Jo(t) { return[t.x, t.y]; }

    function Qo(t) {
        return function() {
            var e = t.apply(this, arguments), n = e[0], r = e[1] + yc;
            return[n * Math.cos(r), n * Math.sin(r)];
        };
    }

    function ta() { return 64; }

    function ea() { return"circle"; }

    function na(t) {
        var e = Math.sqrt(t / Ts);
        return"M0," + e + "A" + e + "," + e + " 0 1,1 0," + -e + "A" + e + "," + e + " 0 1,1 0," + e + "Z";
    }

    function ra(t, e) { return ds(t, Dc), t.id = e, t; }

    function ia(t, e, n, r) {
        var i = t.id;
        return C(t, "function" == typeof n ? function(t, o, a) { t.__transition__[i].tween.set(e, r(n.call(t, t.__data__, o, a))); } : (n = r(n), function(t) { t.__transition__[i].tween.set(e, n); }));
    }

    function oa(t) { return null == t && (t = ""), function() { this.textContent = t; }; }

    function aa(t, e, n, r) {
        var o = t.__transition__ || (t.__transition__ = { active: 0, count: 0 }), a = o[n];
        if (!a) {
            var s = r.time;
            a = o[n] = { tween: new i, time: s, ease: r.ease, delay: r.delay, duration: r.duration }, ++o.count, Xa.timer(function(r) {

                function i(r) { return o.active > n ? c() : (o.active = n, a.event && a.event.start.call(t, l, e), a.tween.forEach(function(n, r) { (r = r.call(t, l, e)) && g.push(r); }), Xa.timer(function() { return p.c = u(r || 1) ? Be : u, 1; }, 0, s), void 0); }

                function u(r) {
                    if (o.active !== n)return c();
                    for (var i = r / d, s = f(i), u = g.length; u > 0;)g[--u].call(t, s);
                    return i >= 1 ? (a.event && a.event.end.call(t, l, e), c()) : void 0;
                }

                function c() { return--o.count ? delete o[n] : delete t.__transition__, 1; }

                var l = t.__data__, f = a.ease, h = a.delay, d = a.duration, p = Js, g = [];
                return p.t = h + s, r >= h ? i(r - h) : (p.c = i, void 0);
            }, 0, s);
        }
    }

    function sa(t, e) { t.attr("transform", function(t) { return"translate(" + e(t) + ",0)"; }); }

    function ua(t, e) { t.attr("transform", function(t) { return"translate(0," + e(t) + ")"; }); }

    function ca() { this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]); }

    function la(t, e, n) {

        function r(e) {
            var n = t(e), r = o(n, 1);
            return r - e > e - n ? n : r;
        }

        function i(n) { return e(n = t(new Fc(n - 1)), 1), n; }

        function o(t, n) { return e(t = new Fc(+t), n), t; }

        function a(t, r, o) {
            var a = i(t), s = [];
            if (o > 1)for (; r > a;)n(a) % o || s.push(new Date(+a)), e(a, 1);
            else for (; r > a;)s.push(new Date(+a)), e(a, 1);
            return s;
        }

        function s(t, e, n) {
            try {
                Fc = ca;
                var r = new ca;
                return r._ = t, a(r, e, n);
            } finally {
                Fc = Date;
            }
        }

        t.floor = t, t.round = r, t.ceil = i, t.offset = o, t.range = a;
        var u = t.utc = fa(t);
        return u.floor = u, u.round = fa(r), u.ceil = fa(i), u.offset = fa(o), u.range = s, t;
    }

    function fa(t) {
        return function(e, n) {
            try {
                Fc = ca;
                var r = new ca;
                return r._ = e, t(r, n)._;
            } finally {
                Fc = Date;
            }
        };
    }

    function ha(t) {

        function e(e) {
            for (var r, i, o, a = [], s = -1, u = 0; ++s < n;)37 === t.charCodeAt(s) && (a.push(t.substring(u, s)), null != (i = el[r = t.charAt(++s)]) && (r = t.charAt(++s)), (o = nl[r]) && (r = o(e, null == i ? "e" === r ? " " : "0" : i)), a.push(r), u = s + 1);
            return a.push(t.substring(u, s)), a.join("");
        }

        var n = t.length;
        return e.parse = function(e) {
            var n = { y: 1900, m: 0, d: 1, H: 0, M: 0, S: 0, L: 0, Z: null }, r = da(n, t, e, 0);
            if (r != e.length)return null;
            "p" in n && (n.H = n.H % 12 + 12 * n.p);
            var i = null != n.Z && Fc !== ca, o = new(i ? ca : Fc);
            return"j" in n ? o.setFullYear(n.y, 0, n.j) : "w" in n && ("W" in n || "U" in n) ? (o.setFullYear(n.y, 0, 1), o.setFullYear(n.y, 0, "W" in n ? (n.w + 6) % 7 + 7 * n.W - (o.getDay() + 5) % 7 : n.w + 7 * n.U - (o.getDay() + 6) % 7)) : o.setFullYear(n.y, n.m, n.d), o.setHours(n.H + Math.floor(n.Z / 100), n.M + n.Z % 100, n.S, n.L), i ? o._ : o;
        }, e.toString = function() { return t; }, e;
    }

    function da(t, e, n, r) {
        for (var i, o, a, s = 0, u = e.length, c = n.length; u > s;) {
            if (r >= c)return-1;
            if (i = e.charCodeAt(s++), 37 === i) {
                if (a = e.charAt(s++), o = rl[a in el ? e.charAt(s++) : a], !o || (r = o(t, n, r)) < 0)return-1;
            } else if (i != n.charCodeAt(r++))return-1;
        }
        return r;
    }

    function pa(t) { return new RegExp("^(?:" + t.map(Xa.requote).join("|") + ")", "i"); }

    function ga(t) {
        for (var e = new i, n = -1, r = t.length; ++n < r;)e.set(t[n].toLowerCase(), n);
        return e;
    }

    function ma(t, e, n) {
        var r = 0 > t ? "-" : "", i = (r ? -t : t) + "", o = i.length;
        return r + (n > o ? new Array(n - o + 1).join(e) + i : i);
    }

    function va(t, e, n) {
        Xc.lastIndex = 0;
        var r = Xc.exec(e.substring(n));
        return r ? (t.w = Zc.get(r[0].toLowerCase()), n + r[0].length) : -1;
    }

    function ya(t, e, n) {
        Wc.lastIndex = 0;
        var r = Wc.exec(e.substring(n));
        return r ? (t.w = Vc.get(r[0].toLowerCase()), n + r[0].length) : -1;
    }

    function ba(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 1));
        return r ? (t.w = +r[0], n + r[0].length) : -1;
    }

    function xa(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n));
        return r ? (t.U = +r[0], n + r[0].length) : -1;
    }

    function wa(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n));
        return r ? (t.W = +r[0], n + r[0].length) : -1;
    }

    function _a(t, e, n) {
        Jc.lastIndex = 0;
        var r = Jc.exec(e.substring(n));
        return r ? (t.m = Qc.get(r[0].toLowerCase()), n + r[0].length) : -1;
    }

    function Ma(t, e, n) {
        Gc.lastIndex = 0;
        var r = Gc.exec(e.substring(n));
        return r ? (t.m = Kc.get(r[0].toLowerCase()), n + r[0].length) : -1;
    }

    function ka(t, e, n) { return da(t, nl.c.toString(), e, n); }

    function Sa(t, e, n) { return da(t, nl.x.toString(), e, n); }

    function Ta(t, e, n) { return da(t, nl.X.toString(), e, n); }

    function Ea(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 4));
        return r ? (t.y = +r[0], n + r[0].length) : -1;
    }

    function Ca(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 2));
        return r ? (t.y = $a(+r[0]), n + r[0].length) : -1;
    }

    function Da(t, e, n) { return/^[+-]\d{4}$/.test(e = e.substring(n, n + 5)) ? (t.Z = +e, n + 5) : -1; }

    function $a(t) { return t + (t > 68 ? 1900 : 2e3); }

    function Aa(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 2));
        return r ? (t.m = r[0] - 1, n + r[0].length) : -1;
    }

    function Na(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 2));
        return r ? (t.d = +r[0], n + r[0].length) : -1;
    }

    function La(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 3));
        return r ? (t.j = +r[0], n + r[0].length) : -1;
    }

    function ja(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 2));
        return r ? (t.H = +r[0], n + r[0].length) : -1;
    }

    function Oa(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 2));
        return r ? (t.M = +r[0], n + r[0].length) : -1;
    }

    function Fa(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 2));
        return r ? (t.S = +r[0], n + r[0].length) : -1;
    }

    function Pa(t, e, n) {
        il.lastIndex = 0;
        var r = il.exec(e.substring(n, n + 3));
        return r ? (t.L = +r[0], n + r[0].length) : -1;
    }

    function Ra(t, e, n) {
        var r = ol.get(e.substring(n, n += 2).toLowerCase());
        return null == r ? -1 : (t.p = r, n);
    }

    function za(t) {
        var e = t.getTimezoneOffset(), n = e > 0 ? "-" : "+", r = ~~(us(e) / 60), i = us(e) % 60;
        return n + ma(r, "0", 2) + ma(i, "0", 2);
    }

    function Ia(t, e, n) {
        tl.lastIndex = 0;
        var r = tl.exec(e.substring(n, n + 1));
        return r ? n + r[0].length : -1;
    }

    function qa(t) {

        function e(t) {
            try {
                Fc = ca;
                var e = new Fc;
                return e._ = t, n(e);
            } finally {
                Fc = Date;
            }
        }

        var n = ha(t);
        return e.parse = function(t) {
            try {
                Fc = ca;
                var e = n.parse(t);
                return e && e._;
            } finally {
                Fc = Date;
            }
        }, e.toString = n.toString, e;
    }

    function Ha(t) { return t.toISOString(); }

    function Ya(t, e, n) {

        function r(e) { return t(e); }

        function i(t, n) {
            var r = t[1] - t[0], i = r / n, o = Xa.bisect(sl, i);
            return o == sl.length ? [e.year, lo(t.map(function(t) { return t / 31536e6; }), n)[2]] : o ? e[i / sl[o - 1] < sl[o] / i ? o - 1 : o] : [fl, lo(t, n)[2]];
        }

        return r.invert = function(e) { return Ba(t.invert(e)); }, r.domain = function(e) { return arguments.length ? (t.domain(e), r) : t.domain().map(Ba); }, r.nice = function(t, e) {

            function n(n) { return!isNaN(n) && !t.range(n, Ba(+n + 1), e).length; }

            var o = r.domain(), a = eo(o), s = null == t ? i(a, 10) : "number" == typeof t && i(a, t);
            return s && (t = s[0], e = s[1]), r.domain(io(o, e > 1 ? {
                floor: function(e) {
                    for (; n(e = t.floor(e));)e = Ba(e - 1);
                    return e;
                },
                ceil: function(e) {
                    for (; n(e = t.ceil(e));)e = Ba(+e + 1);
                    return e;
                }
            } : t));
        }, r.ticks = function(t, e) {
            var n = eo(r.domain()), o = null == t ? i(n, 10) : "number" == typeof t ? i(n, t) : !t.range && [{ range: t }, e];
            return o && (t = o[0], e = o[1]), t.range(n[0], Ba(+n[1] + 1), 1 > e ? 1 : e);
        }, r.tickFormat = function() { return n; }, r.copy = function() { return Ya(t.copy(), e, n); }, uo(r, t);
    }

    function Ba(t) { return new Date(t); }

    function Ua(t) {
        return function(e) {
            for (var n = t.length - 1, r = t[n]; !r[1](e);)r = t[--n];
            return r[0](e);
        };
    }

    function Wa(t) { return JSON.parse(t.responseText); }

    function Va(t) {
        var e = Ka.createRange();
        return e.selectNode(Ka.body), e.createContextualFragment(t.responseText);
    }

    var Xa = { version: "3.3.9" };
    Date.now || (Date.now = function() { return+new Date; });
    var Za = [].slice, Ga = function(t) { return Za.call(t); }, Ka = document, Ja = Ka.documentElement, Qa = window;
    try {
        Ga(Ja.childNodes)[0].nodeType;
    } catch (ts) {
        Ga = function(t) {
            for (var e = t.length, n = new Array(e); e--;)n[e] = t[e];
            return n;
        };
    }
    try {
        Ka.createElement("div").style.setProperty("opacity", 0, "");
    } catch (es) {
        var ns = Qa.Element.prototype, rs = ns.setAttribute, is = ns.setAttributeNS, os = Qa.CSSStyleDeclaration.prototype, as = os.setProperty;
        ns.setAttribute = function(t, e) { rs.call(this, t, e + ""); }, ns.setAttributeNS = function(t, e, n) { is.call(this, t, e, n + ""); }, os.setProperty = function(t, e, n) { as.call(this, t, e + "", n); };
    }
    Xa.ascending = function(t, e) { return e > t ? -1 : t > e ? 1 : t >= e ? 0 : 0 / 0; }, Xa.descending = function(t, e) { return t > e ? -1 : e > t ? 1 : e >= t ? 0 : 0 / 0; }, Xa.min = function(t, e) {
        var n, r, i = -1, o = t.length;
        if (1 === arguments.length) {
            for (; ++i < o && !(null != (n = t[i]) && n >= n);)n = void 0;
            for (; ++i < o;)null != (r = t[i]) && n > r && (n = r);
        } else {
            for (; ++i < o && !(null != (n = e.call(t, t[i], i)) && n >= n);)n = void 0;
            for (; ++i < o;)null != (r = e.call(t, t[i], i)) && n > r && (n = r);
        }
        return n;
    }, Xa.max = function(t, e) {
        var n, r, i = -1, o = t.length;
        if (1 === arguments.length) {
            for (; ++i < o && !(null != (n = t[i]) && n >= n);)n = void 0;
            for (; ++i < o;)null != (r = t[i]) && r > n && (n = r);
        } else {
            for (; ++i < o && !(null != (n = e.call(t, t[i], i)) && n >= n);)n = void 0;
            for (; ++i < o;)null != (r = e.call(t, t[i], i)) && r > n && (n = r);
        }
        return n;
    }, Xa.extent = function(t, e) {
        var n, r, i, o = -1, a = t.length;
        if (1 === arguments.length) {
            for (; ++o < a && !(null != (n = i = t[o]) && n >= n);)n = i = void 0;
            for (; ++o < a;)null != (r = t[o]) && (n > r && (n = r), r > i && (i = r));
        } else {
            for (; ++o < a && !(null != (n = i = e.call(t, t[o], o)) && n >= n);)n = void 0;
            for (; ++o < a;)null != (r = e.call(t, t[o], o)) && (n > r && (n = r), r > i && (i = r));
        }
        return[n, i];
    }, Xa.sum = function(t, e) {
        var n, r = 0, i = t.length, o = -1;
        if (1 === arguments.length)for (; ++o < i;)isNaN(n = +t[o]) || (r += n);
        else for (; ++o < i;)isNaN(n = +e.call(t, t[o], o)) || (r += n);
        return r;
    }, Xa.mean = function(e, n) {
        var r, i = e.length, o = 0, a = -1, s = 0;
        if (1 === arguments.length)for (; ++a < i;)t(r = e[a]) && (o += (r - o) / ++s);
        else for (; ++a < i;)t(r = n.call(e, e[a], a)) && (o += (r - o) / ++s);
        return s ? o : void 0;
    }, Xa.quantile = function(t, e) {
        var n = (t.length - 1) * e + 1, r = Math.floor(n), i = +t[r - 1], o = n - r;
        return o ? i + o * (t[r] - i) : i;
    }, Xa.median = function(e, n) { return arguments.length > 1 && (e = e.map(n)), e = e.filter(t), e.length ? Xa.quantile(e.sort(Xa.ascending), .5) : void 0; }, Xa.bisector = function(t) {
        return{
            left: function(e, n, r, i) {
                for (arguments.length < 3 && (r = 0), arguments.length < 4 && (i = e.length); i > r;) {
                    var o = r + i >>> 1;
                    t.call(e, e[o], o) < n ? r = o + 1 : i = o;
                }
                return r;
            },
            right: function(e, n, r, i) {
                for (arguments.length < 3 && (r = 0), arguments.length < 4 && (i = e.length); i > r;) {
                    var o = r + i >>> 1;
                    n < t.call(e, e[o], o) ? i = o : r = o + 1;
                }
                return r;
            }
        };
    };
    var ss = Xa.bisector(function(t) { return t; });
    Xa.bisectLeft = ss.left, Xa.bisect = Xa.bisectRight = ss.right, Xa.shuffle = function(t) {
        for (var e, n, r = t.length; r;)n = 0 | Math.random() * r--, e = t[r], t[r] = t[n], t[n] = e;
        return t;
    }, Xa.permute = function(t, e) {
        for (var n = e.length, r = new Array(n); n--;)r[n] = t[e[n]];
        return r;
    }, Xa.pairs = function(t) {
        for (var e, n = 0, r = t.length - 1, i = t[0], o = new Array(0 > r ? 0 : r); r > n;)o[n] = [e = i, i = t[++n]];
        return o;
    }, Xa.zip = function() {
        if (!(i = arguments.length))return[];
        for (var t = -1, n = Xa.min(arguments, e), r = new Array(n); ++t < n;)for (var i, o = -1, a = r[t] = new Array(i); ++o < i;)a[o] = arguments[o][t];
        return r;
    }, Xa.transpose = function(t) { return Xa.zip.apply(Xa, t); }, Xa.keys = function(t) {
        var e = [];
        for (var n in t)e.push(n);
        return e;
    }, Xa.values = function(t) {
        var e = [];
        for (var n in t)e.push(t[n]);
        return e;
    }, Xa.entries = function(t) {
        var e = [];
        for (var n in t)e.push({ key: n, value: t[n] });
        return e;
    }, Xa.merge = function(t) {
        for (var e, n, r, i = t.length, o = -1, a = 0; ++o < i;)a += t[o].length;
        for (n = new Array(a); --i >= 0;)for (r = t[i], e = r.length; --e >= 0;)n[--a] = r[e];
        return n;
    };
    var us = Math.abs;
    Xa.range = function(t, e, r) {
        if (arguments.length < 3 && (r = 1, arguments.length < 2 && (e = t, t = 0)), 1 / 0 === (e - t) / r)throw new Error("infinite range");
        var i, o = [], a = n(us(r)), s = -1;
        if (t *= a, e *= a, r *= a, 0 > r)for (; (i = t + r * ++s) > e;)o.push(i / a);
        else for (; (i = t + r * ++s) < e;)o.push(i / a);
        return o;
    }, Xa.map = function(t) {
        var e = new i;
        if (t instanceof i)t.forEach(function(t, n) { e.set(t, n); });
        else for (var n in t)e.set(n, t[n]);
        return e;
    }, r(i, {
        has: function(t) { return cs + t in this; },
        get: function(t) { return this[cs + t]; },
        set: function(t, e) { return this[cs + t] = e; },
        remove: function(t) { return t = cs + t, t in this && delete this[t]; },
        keys: function() {
            var t = [];
            return this.forEach(function(e) { t.push(e); }), t;
        },
        values: function() {
            var t = [];
            return this.forEach(function(e, n) { t.push(n); }), t;
        },
        entries: function() {
            var t = [];
            return this.forEach(function(e, n) { t.push({ key: e, value: n }); }), t;
        },
        forEach: function(t) { for (var e in this)e.charCodeAt(0) === ls && t.call(this, e.substring(1), this[e]); }
    });
    var cs = "\0", ls = cs.charCodeAt(0);
    Xa.nest = function() {

        function t(e, s, u) {
            if (u >= a.length)return r ? r.call(o, s) : n ? s.sort(n) : s;
            for (var c, l, f, h, d = -1, p = s.length, g = a[u++], m = new i; ++d < p;)(h = m.get(c = g(l = s[d]))) ? h.push(l) : m.set(c, [l]);
            return e ? (l = e(), f = function(n, r) { l.set(n, t(e, r, u)); }) : (l = {}, f = function(n, r) { l[n] = t(e, r, u); }), m.forEach(f), l;
        }

        function e(t, n) {
            if (n >= a.length)return t;
            var r = [], i = s[n++];
            return t.forEach(function(t, i) { r.push({ key: t, values: e(i, n) }); }), i ? r.sort(function(t, e) { return i(t.key, e.key); }) : r;
        }

        var n, r, o = {}, a = [], s = [];
        return o.map = function(e, n) { return t(n, e, 0); }, o.entries = function(n) { return e(t(Xa.map, n, 0), 0); }, o.key = function(t) { return a.push(t), o; }, o.sortKeys = function(t) { return s[a.length - 1] = t, o; }, o.sortValues = function(t) { return n = t, o; }, o.rollup = function(t) { return r = t, o; }, o;
    }, Xa.set = function(t) {
        var e = new o;
        if (t)for (var n = 0, r = t.length; r > n; ++n)e.add(t[n]);
        return e;
    }, r(o, {
        has: function(t) { return cs + t in this; },
        add: function(t) { return this[cs + t] = !0, t; },
        remove: function(t) { return t = cs + t, t in this && delete this[t]; },
        values: function() {
            var t = [];
            return this.forEach(function(e) { t.push(e); }), t;
        },
        forEach: function(t) { for (var e in this)e.charCodeAt(0) === ls && t.call(this, e.substring(1)); }
    }), Xa.behavior = {}, Xa.rebind = function(t, e) {
        for (var n, r = 1, i = arguments.length; ++r < i;)t[n = arguments[r]] = a(t, e, e[n]);
        return t;
    };
    var fs = ["webkit", "ms", "moz", "Moz", "o", "O"];
    Xa.dispatch = function() {
        for (var t = new c, e = -1, n = arguments.length; ++e < n;)t[arguments[e]] = l(t);
        return t;
    }, c.prototype.on = function(t, e) {
        var n = t.indexOf("."), r = "";
        if (n >= 0 && (r = t.substring(n + 1), t = t.substring(0, n)), t)return arguments.length < 2 ? this[t].on(r) : this[t].on(r, e);
        if (2 === arguments.length) {
            if (null == e)for (t in this)this.hasOwnProperty(t) && this[t].on(r, null);
            return this;
        }
    }, Xa.event = null, Xa.requote = function(t) { return t.replace(hs, "\\$&"); };
    var hs = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g, ds = {}.__proto__ ? function(t, e) { t.__proto__ = e; } : function(t, e) { for (var n in e)t[n] = e[n]; }, ps = function(t, e) { return e.querySelector(t); }, gs = function(t, e) { return e.querySelectorAll(t); }, ms = Ja[s(Ja, "matchesSelector")], vs = function(t, e) { return ms.call(t, e); };
    "function" == typeof Sizzle && (ps = function(t, e) { return Sizzle(t, e)[0] || null; }, gs = function(t, e) { return Sizzle.uniqueSort(Sizzle(t, e)); }, vs = Sizzle.matchesSelector), Xa.selection = function() { return ws; };
    var ys = Xa.selection.prototype = [];
    ys.select = function(t) {
        var e, n, r, i, o = [];
        t = g(t);
        for (var a = -1, s = this.length; ++a < s;) {
            o.push(e = []), e.parentNode = (r = this[a]).parentNode;
            for (var u = -1, c = r.length; ++u < c;)(i = r[u]) ? (e.push(n = t.call(i, i.__data__, u, a)), n && "__data__" in i && (n.__data__ = i.__data__)) : e.push(null);
        }
        return p(o);
    }, ys.selectAll = function(t) {
        var e, n, r = [];
        t = m(t);
        for (var i = -1, o = this.length; ++i < o;)for (var a = this[i], s = -1, u = a.length; ++s < u;)(n = a[s]) && (r.push(e = Ga(t.call(n, n.__data__, s, i))), e.parentNode = n);
        return p(r);
    };
    var bs = { svg: "http://www.w3.org/2000/svg", xhtml: "http://www.w3.org/1999/xhtml", xlink: "http://www.w3.org/1999/xlink", xml: "http://www.w3.org/XML/1998/namespace", xmlns: "http://www.w3.org/2000/xmlns/" };
    Xa.ns = {
        prefix: bs,
        qualify: function(t) {
            var e = t.indexOf(":"), n = t;
            return e >= 0 && (n = t.substring(0, e), t = t.substring(e + 1)), bs.hasOwnProperty(n) ? { space: bs[n], local: t } : t;
        }
    }, ys.attr = function(t, e) {
        if (arguments.length < 2) {
            if ("string" == typeof t) {
                var n = this.node();
                return t = Xa.ns.qualify(t), t.local ? n.getAttributeNS(t.space, t.local) : n.getAttribute(t);
            }
            for (e in t)this.each(v(e, t[e]));
            return this;
        }
        return this.each(v(t, e));
    }, ys.classed = function(t, e) {
        if (arguments.length < 2) {
            if ("string" == typeof t) {
                var n = this.node(), r = (t = t.trim().split(/^|\s+/g)).length, i = -1;
                if (e = n.classList) {
                    for (; ++i < r;)if (!e.contains(t[i]))return!1;
                } else for (e = n.getAttribute("class"); ++i < r;)if (!b(t[i]).test(e))return!1;
                return!0;
            }
            for (e in t)this.each(x(e, t[e]));
            return this;
        }
        return this.each(x(t, e));
    }, ys.style = function(t, e, n) {
        var r = arguments.length;
        if (3 > r) {
            if ("string" != typeof t) {
                2 > r && (e = "");
                for (n in t)this.each(_(n, t[n], e));
                return this;
            }
            if (2 > r)return Qa.getComputedStyle(this.node(), null).getPropertyValue(t);
            n = "";
        }
        return this.each(_(t, e, n));
    }, ys.property = function(t, e) {
        if (arguments.length < 2) {
            if ("string" == typeof t)return this.node()[t];
            for (e in t)this.each(M(e, t[e]));
            return this;
        }
        return this.each(M(t, e));
    }, ys.text = function(t) {
        return arguments.length ? this.each("function" == typeof t ? function() {
            var e = t.apply(this, arguments);
            this.textContent = null == e ? "" : e;
        } : null == t ? function() { this.textContent = ""; } : function() { this.textContent = t; }) : this.node().textContent;
    }, ys.html = function(t) {
        return arguments.length ? this.each("function" == typeof t ? function() {
            var e = t.apply(this, arguments);
            this.innerHTML = null == e ? "" : e;
        } : null == t ? function() { this.innerHTML = ""; } : function() { this.innerHTML = t; }) : this.node().innerHTML;
    }, ys.append = function(t) { return t = k(t), this.select(function() { return this.appendChild(t.apply(this, arguments)); }); }, ys.insert = function(t, e) { return t = k(t), e = g(e), this.select(function() { return this.insertBefore(t.apply(this, arguments), e.apply(this, arguments) || null); }); }, ys.remove = function() {
        return this.each(function() {
            var t = this.parentNode;
            t && t.removeChild(this);
        });
    }, ys.data = function(t, e) {

        function n(t, n) {
            var r, o, a, s = t.length, f = n.length, h = Math.min(s, f), d = new Array(f), p = new Array(f), g = new Array(s);
            if (e) {
                var m, v = new i, y = new i, b = [];
                for (r = -1; ++r < s;)m = e.call(o = t[r], o.__data__, r), v.has(m) ? g[r] = o : v.set(m, o), b.push(m);
                for (r = -1; ++r < f;)m = e.call(n, a = n[r], r), (o = v.get(m)) ? (d[r] = o, o.__data__ = a) : y.has(m) || (p[r] = S(a)), y.set(m, a), v.remove(m);
                for (r = -1; ++r < s;)v.has(b[r]) && (g[r] = t[r]);
            } else {
                for (r = -1; ++r < h;)o = t[r], a = n[r], o ? (o.__data__ = a, d[r] = o) : p[r] = S(a);
                for (; f > r; ++r)p[r] = S(n[r]);
                for (; s > r; ++r)g[r] = t[r];
            }
            p.update = d, p.parentNode = d.parentNode = g.parentNode = t.parentNode, u.push(p), c.push(d), l.push(g);
        }

        var r, o, a = -1, s = this.length;
        if (!arguments.length) {
            for (t = new Array(s = (r = this[0]).length); ++a < s;)(o = r[a]) && (t[a] = o.__data__);
            return t;
        }
        var u = D([]), c = p([]), l = p([]);
        if ("function" == typeof t)for (; ++a < s;)n(r = this[a], t.call(r, r.parentNode.__data__, a));
        else for (; ++a < s;)n(r = this[a], t);
        return c.enter = function() { return u; }, c.exit = function() { return l; }, c;
    }, ys.datum = function(t) { return arguments.length ? this.property("__data__", t) : this.property("__data__"); }, ys.filter = function(t) {
        var e, n, r, i = [];
        "function" != typeof t && (t = T(t));
        for (var o = 0, a = this.length; a > o; o++) {
            i.push(e = []), e.parentNode = (n = this[o]).parentNode;
            for (var s = 0, u = n.length; u > s; s++)(r = n[s]) && t.call(r, r.__data__, s) && e.push(r);
        }
        return p(i);
    }, ys.order = function() {
        for (var t = -1, e = this.length; ++t < e;)for (var n, r = this[t], i = r.length - 1, o = r[i]; --i >= 0;)(n = r[i]) && (o && o !== n.nextSibling && o.parentNode.insertBefore(n, o), o = n);
        return this;
    }, ys.sort = function(t) {
        t = E.apply(this, arguments);
        for (var e = -1, n = this.length; ++e < n;)this[e].sort(t);
        return this.order();
    }, ys.each = function(t) { return C(this, function(e, n, r) { t.call(e, e.__data__, n, r); }); }, ys.call = function(t) {
        var e = Ga(arguments);
        return t.apply(e[0] = this, e), this;
    }, ys.empty = function() { return!this.node(); }, ys.node = function() {
        for (var t = 0, e = this.length; e > t; t++)
            for (var n = this[t], r = 0, i = n.length; i > r; r++) {
                var o = n[r];
                if (o)return o;
            }
        return null;
    }, ys.size = function() {
        var t = 0;
        return this.each(function() { ++t; }), t;
    };
    var xs = [];
    Xa.selection.enter = D, Xa.selection.enter.prototype = xs, xs.append = ys.append, xs.empty = ys.empty, xs.node = ys.node, xs.call = ys.call, xs.size = ys.size, xs.select = function(t) {
        for (var e, n, r, i, o, a = [], s = -1, u = this.length; ++s < u;) {
            r = (i = this[s]).update, a.push(e = []), e.parentNode = i.parentNode;
            for (var c = -1, l = i.length; ++c < l;)(o = i[c]) ? (e.push(r[c] = n = t.call(i.parentNode, o.__data__, c, s)), n.__data__ = o.__data__) : e.push(null);
        }
        return p(a);
    }, xs.insert = function(t, e) { return arguments.length < 2 && (e = $(this)), ys.insert.call(this, t, e); }, ys.transition = function() {
        for (var t, e, n = Sc || ++$c, r = [], i = Tc || { time: Date.now(), ease: Ir, delay: 0, duration: 250 }, o = -1, a = this.length; ++o < a;) {
            r.push(t = []);
            for (var s = this[o], u = -1, c = s.length; ++u < c;)(e = s[u]) && aa(e, u, n, i), t.push(e);
        }
        return ra(r, n);
    }, ys.interrupt = function() { return this.each(A); }, Xa.select = function(t) {
        var e = ["string" == typeof t ? ps(t, Ka) : t];
        return e.parentNode = Ja, p([e]);
    }, Xa.selectAll = function(t) {
        var e = Ga("string" == typeof t ? gs(t, Ka) : t);
        return e.parentNode = Ja, p([e]);
    };
    var ws = Xa.select(Ja);
    ys.on = function(t, e, n) {
        var r = arguments.length;
        if (3 > r) {
            if ("string" != typeof t) {
                2 > r && (e = !1);
                for (n in t)this.each(N(n, t[n], e));
                return this;
            }
            if (2 > r)return(r = this.node()["__on" + t]) && r._;
            n = !1;
        }
        return this.each(N(t, e, n));
    };
    var _s = Xa.map({ mouseenter: "mouseover", mouseleave: "mouseout" });
    _s.forEach(function(t) { "on" + t in Ka && _s.remove(t); });
    var Ms = "onselectstart" in Ka ? null : s(Ja.style, "userSelect"), ks = 0;
    Xa.mouse = function(t) { return F(t, h()); };
    var Ss = /WebKit/.test(Qa.navigator.userAgent) ? -1 : 0;
    Xa.touches = function(t, e) {
        return arguments.length < 2 && (e = h().touches), e ? Ga(e).map(function(e) {
            var n = F(t, e);
            return n.identifier = e.identifier, n;
        }) : [];
    }, Xa.behavior.drag = function() {

        function t() { this.on("mousedown.drag", a).on("touchstart.drag", s); }

        function e() { return Xa.event.changedTouches[0].identifier; }

        function n(t, e) { return Xa.touches(t).filter(function(t) { return t.identifier === e; })[0]; }

        function r(t, e, n, r) {
            return function() {

                function a() {
                    var t = e(l, d), n = t[0] - g[0], r = t[1] - g[1];
                    m |= n | r, g = t, f({ type: "drag", x: t[0] + u[0], y: t[1] + u[1], dx: n, dy: r });
                }

                function s() { v.on(n + "." + p, null).on(r + "." + p, null), y(m && Xa.event.target === h), f({ type: "dragend" }); }

                var u, c = this, l = c.parentNode, f = i.of(c, arguments), h = Xa.event.target, d = t(), p = null == d ? "drag" : "drag-" + d, g = e(l, d), m = 0, v = Xa.select(Qa).on(n + "." + p, a).on(r + "." + p, s), y = O();
                o ? (u = o.apply(c, arguments), u = [u.x - g[0], u.y - g[1]]) : u = [0, 0], f({ type: "dragstart" });
            };
        }

        var i = d(t, "drag", "dragstart", "dragend"), o = null, a = r(u, Xa.mouse, "mousemove", "mouseup"), s = r(e, n, "touchmove", "touchend");
        return t.origin = function(e) { return arguments.length ? (o = e, t) : o; }, Xa.rebind(t, i, "on");
    };
    var Ts = Math.PI, Es = 2 * Ts, Cs = Ts / 2, Ds = 1e-6, $s = Ds * Ds, As = Ts / 180, Ns = 180 / Ts, Ls = Math.SQRT2, js = 2, Os = 4;
    Xa.interpolateZoom = function(t, e) {

        function n(t) {
            var e = t * y;
            if (v) {
                var n = q(g), a = o / (js * h) * (n * H(Ls * e + g) - I(g));
                return[r + a * c, i + a * l, o * n / q(Ls * e + g)];
            }
            return[r + t * c, i + t * l, o * Math.exp(Ls * e)];
        }

        var r = t[0], i = t[1], o = t[2], a = e[0], s = e[1], u = e[2], c = a - r, l = s - i, f = c * c + l * l, h = Math.sqrt(f), d = (u * u - o * o + Os * f) / (2 * o * js * h), p = (u * u - o * o - Os * f) / (2 * u * js * h), g = Math.log(Math.sqrt(d * d + 1) - d), m = Math.log(Math.sqrt(p * p + 1) - p), v = m - g, y = (v || Math.log(u / o)) / Ls;
        return n.duration = 1e3 * y, n;
    }, Xa.behavior.zoom = function() {

        function t(t) { t.on(E, c).on(Rs + ".zoom", h).on(C, p).on("dblclick.zoom", g).on($, l); }

        function e(t) { return[(t[0] - k.x) / k.k, (t[1] - k.y) / k.k]; }

        function n(t) { return[t[0] * k.k + k.x, t[1] * k.k + k.y]; }

        function r(t) { k.k = Math.max(T[0], Math.min(T[1], t)); }

        function i(t, e) { e = n(e), k.x += t[0] - e[0], k.y += t[1] - e[1]; }

        function o() { w && w.domain(x.range().map(function(t) { return(t - k.x) / k.k; }).map(x.invert)), M && M.domain(_.range().map(function(t) { return(t - k.y) / k.k; }).map(_.invert)); }

        function a(t) { t({ type: "zoomstart" }); }

        function s(t) { o(), t({ type: "zoom", scale: k.k, translate: [k.x, k.y] }); }

        function u(t) { t({ type: "zoomend" }); }

        function c() {

            function t() { l = 1, i(Xa.mouse(r), h), s(o); }

            function n() { f.on(C, Qa === r ? p : null).on(D, null), d(l && Xa.event.target === c), u(o); }

            var r = this, o = N.of(r, arguments), c = Xa.event.target, l = 0, f = Xa.select(Qa).on(C, t).on(D, n), h = e(Xa.mouse(r)), d = O();
            A.call(r), a(o);
        }

        function l() {

            function t() {
                var t = Xa.touches(p);
                return d = k.k, t.forEach(function(t) { t.identifier in m && (m[t.identifier] = e(t)); }), t;
            }

            function n() {
                for (var e = Xa.event.changedTouches, n = 0, o = e.length; o > n; ++n)m[e[n].identifier] = null;
                var a = t(), u = Date.now();
                if (1 === a.length) {
                    if (500 > u - b) {
                        var c = a[0], l = m[c.identifier];
                        r(2 * k.k), i(c, l), f(), s(g);
                    }
                    b = u;
                } else if (a.length > 1) {
                    var c = a[0], h = a[1], d = c[0] - h[0], p = c[1] - h[1];
                    v = d * d + p * p;
                }
            }

            function o() {
                for (var t, e, n, o, a = Xa.touches(p), u = 0, c = a.length; c > u; ++u, o = null)
                    if (n = a[u], o = m[n.identifier]) {
                        if (e)break;
                        t = n, e = o;
                    }
                if (o) {
                    var l = (l = n[0] - t[0]) * l + (l = n[1] - t[1]) * l, f = v && Math.sqrt(l / v);
                    t = [(t[0] + n[0]) / 2, (t[1] + n[1]) / 2], e = [(e[0] + o[0]) / 2, (e[1] + o[1]) / 2], r(f * d);
                }
                b = null, i(t, e), s(g);
            }

            function h() {
                if (Xa.event.touches.length) {
                    for (var e = Xa.event.changedTouches, n = 0, r = e.length; r > n; ++n)delete m[e[n].identifier];
                    for (var i in m)return void t();
                }
                _.on(x, null).on(w, null), M.on(E, c).on($, l), S(), u(g);
            }

            var d, p = this, g = N.of(p, arguments), m = {}, v = 0, y = Xa.event.changedTouches[0].identifier, x = "touchmove.zoom-" + y, w = "touchend.zoom-" + y, _ = Xa.select(Qa).on(x, o).on(w, h), M = Xa.select(p).on(E, null).on($, n), S = O();
            A.call(p), n(), a(g);
        }

        function h() {
            var t = N.of(this, arguments);
            y ? clearTimeout(y) : (A.call(this), a(t)), y = setTimeout(function() { y = null, u(t); }, 50), f();
            var n = v || Xa.mouse(this);
            m || (m = e(n)), r(Math.pow(2, .002 * Fs()) * k.k), i(n, m), s(t);
        }

        function p() { m = null; }

        function g() {
            var t = N.of(this, arguments), n = Xa.mouse(this), o = e(n), c = Math.log(k.k) / Math.LN2;
            a(t), r(Math.pow(2, Xa.event.shiftKey ? Math.ceil(c) - 1 : Math.floor(c) + 1)), i(n, o), s(t), u(t);
        }

        var m, v, y, b, x, w, _, M, k = { x: 0, y: 0, k: 1 }, S = [960, 500], T = Ps, E = "mousedown.zoom", C = "mousemove.zoom", D = "mouseup.zoom", $ = "touchstart.zoom", N = d(t, "zoomstart", "zoom", "zoomend");
        return t.event = function(t) {
            t.each(function() {
                var t = N.of(this, arguments), e = k;
                Sc ? Xa.select(this).transition().each("start.zoom", function() { k = this.__chart__ || { x: 0, y: 0, k: 1 }, a(t); }).tween("zoom:zoom", function() {
                    var n = S[0], r = S[1], i = n / 2, o = r / 2, a = Xa.interpolateZoom([(i - k.x) / k.k, (o - k.y) / k.k, n / k.k], [(i - e.x) / e.k, (o - e.y) / e.k, n / e.k]);
                    return function(e) {
                        var r = a(e), u = n / r[2];
                        this.__chart__ = k = { x: i - r[0] * u, y: o - r[1] * u, k: u }, s(t);
                    };
                }).each("end.zoom", function() { u(t); }) : (this.__chart__ = k, a(t), s(t), u(t));
            });
        }, t.translate = function(e) { return arguments.length ? (k = { x: +e[0], y: +e[1], k: k.k }, o(), t) : [k.x, k.y]; }, t.scale = function(e) { return arguments.length ? (k = { x: k.x, y: k.y, k: +e }, o(), t) : k.k; }, t.scaleExtent = function(e) { return arguments.length ? (T = null == e ? Ps : [+e[0], +e[1]], t) : T; }, t.center = function(e) { return arguments.length ? (v = e && [+e[0], +e[1]], t) : v; }, t.size = function(e) { return arguments.length ? (S = e && [+e[0], +e[1]], t) : S; }, t.x = function(e) { return arguments.length ? (w = e, x = e.copy(), k = { x: 0, y: 0, k: 1 }, t) : w; }, t.y = function(e) { return arguments.length ? (M = e, _ = e.copy(), k = { x: 0, y: 0, k: 1 }, t) : M; }, Xa.rebind(t, N, "on");
    };
    var Fs, Ps = [0, 1 / 0], Rs = "onwheel" in Ka ? (Fs = function() { return-Xa.event.deltaY * (Xa.event.deltaMode ? 120 : 1); }, "wheel") : "onmousewheel" in Ka ? (Fs = function() { return Xa.event.wheelDelta; }, "mousewheel") : (Fs = function() { return-Xa.event.detail; }, "MozMousePixelScroll");
    B.prototype.toString = function() { return this.rgb() + ""; }, Xa.hsl = function(t, e, n) { return 1 === arguments.length ? t instanceof W ? U(t.h, t.s, t.l) : ce("" + t, le, U) : U(+t, +e, +n); };
    var zs = W.prototype = new B;
    zs.brighter = function(t) { return t = Math.pow(.7, arguments.length ? t : 1), U(this.h, this.s, this.l / t); }, zs.darker = function(t) { return t = Math.pow(.7, arguments.length ? t : 1), U(this.h, this.s, t * this.l); }, zs.rgb = function() { return V(this.h, this.s, this.l); }, Xa.hcl = function(t, e, n) { return 1 === arguments.length ? t instanceof Z ? X(t.h, t.c, t.l) : t instanceof J ? te(t.l, t.a, t.b) : te((t = fe((t = Xa.rgb(t)).r, t.g, t.b)).l, t.a, t.b) : X(+t, +e, +n); };
    var Is = Z.prototype = new B;
    Is.brighter = function(t) { return X(this.h, this.c, Math.min(100, this.l + qs * (arguments.length ? t : 1))); }, Is.darker = function(t) { return X(this.h, this.c, Math.max(0, this.l - qs * (arguments.length ? t : 1))); }, Is.rgb = function() { return G(this.h, this.c, this.l).rgb(); }, Xa.lab = function(t, e, n) { return 1 === arguments.length ? t instanceof J ? K(t.l, t.a, t.b) : t instanceof Z ? G(t.l, t.c, t.h) : fe((t = Xa.rgb(t)).r, t.g, t.b) : K(+t, +e, +n); };
    var qs = 18, Hs = .95047, Ys = 1, Bs = 1.08883, Us = J.prototype = new B;
    Us.brighter = function(t) { return K(Math.min(100, this.l + qs * (arguments.length ? t : 1)), this.a, this.b); }, Us.darker = function(t) { return K(Math.max(0, this.l - qs * (arguments.length ? t : 1)), this.a, this.b); }, Us.rgb = function() { return Q(this.l, this.a, this.b); }, Xa.rgb = function(t, e, n) { return 1 === arguments.length ? t instanceof se ? ae(t.r, t.g, t.b) : ce("" + t, ae, V) : ae(~~t, ~~e, ~~n); };
    var Ws = se.prototype = new B;
    Ws.brighter = function(t) {
        t = Math.pow(.7, arguments.length ? t : 1);
        var e = this.r, n = this.g, r = this.b, i = 30;
        return e || n || r ? (e && i > e && (e = i), n && i > n && (n = i), r && i > r && (r = i), ae(Math.min(255, ~~(e / t)), Math.min(255, ~~(n / t)), Math.min(255, ~~(r / t)))) : ae(i, i, i);
    }, Ws.darker = function(t) { return t = Math.pow(.7, arguments.length ? t : 1), ae(~~(t * this.r), ~~(t * this.g), ~~(t * this.b)); }, Ws.hsl = function() { return le(this.r, this.g, this.b); }, Ws.toString = function() { return"#" + ue(this.r) + ue(this.g) + ue(this.b); };
    var Vs = Xa.map({ aliceblue: 15792383, antiquewhite: 16444375, aqua: 65535, aquamarine: 8388564, azure: 15794175, beige: 16119260, bisque: 16770244, black: 0, blanchedalmond: 16772045, blue: 255, blueviolet: 9055202, brown: 10824234, burlywood: 14596231, cadetblue: 6266528, chartreuse: 8388352, chocolate: 13789470, coral: 16744272, cornflowerblue: 6591981, cornsilk: 16775388, crimson: 14423100, cyan: 65535, darkblue: 139, darkcyan: 35723, darkgoldenrod: 12092939, darkgray: 11119017, darkgreen: 25600, darkgrey: 11119017, darkkhaki: 12433259, darkmagenta: 9109643, darkolivegreen: 5597999, darkorange: 16747520, darkorchid: 10040012, darkred: 9109504, darksalmon: 15308410, darkseagreen: 9419919, darkslateblue: 4734347, darkslategray: 3100495, darkslategrey: 3100495, darkturquoise: 52945, darkviolet: 9699539, deeppink: 16716947, deepskyblue: 49151, dimgray: 6908265, dimgrey: 6908265, dodgerblue: 2003199, firebrick: 11674146, floralwhite: 16775920, forestgreen: 2263842, fuchsia: 16711935, gainsboro: 14474460, ghostwhite: 16316671, gold: 16766720, goldenrod: 14329120, gray: 8421504, green: 32768, greenyellow: 11403055, grey: 8421504, honeydew: 15794160, hotpink: 16738740, indianred: 13458524, indigo: 4915330, ivory: 16777200, khaki: 15787660, lavender: 15132410, lavenderblush: 16773365, lawngreen: 8190976, lemonchiffon: 16775885, lightblue: 11393254, lightcoral: 15761536, lightcyan: 14745599, lightgoldenrodyellow: 16448210, lightgray: 13882323, lightgreen: 9498256, lightgrey: 13882323, lightpink: 16758465, lightsalmon: 16752762, lightseagreen: 2142890, lightskyblue: 8900346, lightslategray: 7833753, lightslategrey: 7833753, lightsteelblue: 11584734, lightyellow: 16777184, lime: 65280, limegreen: 3329330, linen: 16445670, magenta: 16711935, maroon: 8388608, mediumaquamarine: 6737322, mediumblue: 205, mediumorchid: 12211667, mediumpurple: 9662683, mediumseagreen: 3978097, mediumslateblue: 8087790, mediumspringgreen: 64154, mediumturquoise: 4772300, mediumvioletred: 13047173, midnightblue: 1644912, mintcream: 16121850, mistyrose: 16770273, moccasin: 16770229, navajowhite: 16768685, navy: 128, oldlace: 16643558, olive: 8421376, olivedrab: 7048739, orange: 16753920, orangered: 16729344, orchid: 14315734, palegoldenrod: 15657130, palegreen: 10025880, paleturquoise: 11529966, palevioletred: 14381203, papayawhip: 16773077, peachpuff: 16767673, peru: 13468991, pink: 16761035, plum: 14524637, powderblue: 11591910, purple: 8388736, red: 16711680, rosybrown: 12357519, royalblue: 4286945, saddlebrown: 9127187, salmon: 16416882, sandybrown: 16032864, seagreen: 3050327, seashell: 16774638, sienna: 10506797, silver: 12632256, skyblue: 8900331, slateblue: 6970061, slategray: 7372944, slategrey: 7372944, snow: 16775930, springgreen: 65407, steelblue: 4620980, tan: 13808780, teal: 32896, thistle: 14204888, tomato: 16737095, turquoise: 4251856, violet: 15631086, wheat: 16113331, white: 16777215, whitesmoke: 16119285, yellow: 16776960, yellowgreen: 10145074 });
    Vs.forEach(function(t, e) { Vs.set(t, ie(e)); }), Xa.functor = pe, Xa.xhr = me(ge), Xa.dsv = function(t, e) {

        function n(t, n, o) {
            arguments.length < 3 && (o = n, n = null);
            var a = Xa.xhr(t, e, o);
            return a.row = function(t) { return arguments.length ? a.response(null == (n = t) ? r : i(t)) : n; }, a.row(n);
        }

        function r(t) { return n.parse(t.responseText); }

        function i(t) { return function(e) { return n.parse(e.responseText, t); }; }

        function a(e) { return e.map(s).join(t); }

        function s(t) { return u.test(t) ? '"' + t.replace(/\"/g, '""') + '"' : t; }

        var u = new RegExp('["' + t + "\n]"), c = t.charCodeAt(0);
        return n.parse = function(t, e) {
            var r;
            return n.parseRows(t, function(t, n) {
                if (r)return r(t, n - 1);
                var i = new Function("d", "return {" + t.map(function(t, e) { return JSON.stringify(t) + ": d[" + e + "]"; }).join(",") + "}");
                r = e ? function(t, n) { return e(i(t), n); } : i;
            });
        }, n.parseRows = function(t, e) {

            function n() {
                if (l >= u)return a;
                if (i)return i = !1, o;
                var e = l;
                if (34 === t.charCodeAt(e)) {
                    for (var n = e; n++ < u;)
                        if (34 === t.charCodeAt(n)) {
                            if (34 !== t.charCodeAt(n + 1))break;
                            ++n;
                        }
                    l = n + 2;
                    var r = t.charCodeAt(n + 1);
                    return 13 === r ? (i = !0, 10 === t.charCodeAt(n + 2) && ++l) : 10 === r && (i = !0), t.substring(e + 1, n).replace(/""/g, '"');
                }
                for (; u > l;) {
                    var r = t.charCodeAt(l++), s = 1;
                    if (10 === r)i = !0;
                    else if (13 === r)i = !0, 10 === t.charCodeAt(l) && (++l, ++s);
                    else if (r !== c)continue;
                    return t.substring(e, l - s);
                }
                return t.substring(e);
            }

            for (var r, i, o = {}, a = {}, s = [], u = t.length, l = 0, f = 0; (r = n()) !== a;) {
                for (var h = []; r !== o && r !== a;)h.push(r), r = n();
                (!e || (h = e(h, f++))) && s.push(h);
            }
            return s;
        }, n.format = function(e) {
            if (Array.isArray(e[0]))return n.formatRows(e);
            var r = new o, i = [];
            return e.forEach(function(t) { for (var e in t)r.has(e) || i.push(r.add(e)); }), [i.map(s).join(t)].concat(e.map(function(e) { return i.map(function(t) { return s(e[t]); }).join(t); })).join("\n");
        }, n.formatRows = function(t) { return t.map(a).join("\n"); }, n;
    }, Xa.csv = Xa.dsv(",", "text/csv"), Xa.tsv = Xa.dsv("	", "text/tab-separated-values");
    var Xs, Zs, Gs, Ks, Js, Qs = Qa[s(Qa, "requestAnimationFrame")] || function(t) { setTimeout(t, 17); };
    Xa.timer = function(t, e, n) {
        var r = arguments.length;
        2 > r && (e = 0), 3 > r && (n = Date.now());
        var i = n + e, o = { c: t, t: i, f: !1, n: null };
        Zs ? Zs.n = o : Xs = o, Zs = o, Gs || (Ks = clearTimeout(Ks), Gs = 1, Qs(be));
    }, Xa.timer.flush = function() { xe(), we(); };
    var tu = ".", eu = ",", nu = [3, 3], ru = "$", iu = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"].map(_e);
    Xa.formatPrefix = function(t, e) {
        var n = 0;
        return t && (0 > t && (t *= -1), e && (t = Xa.round(t, Me(t, e))), n = 1 + Math.floor(1e-12 + Math.log(t) / Math.LN10), n = Math.max(-24, Math.min(24, 3 * Math.floor((0 >= n ? n + 1 : n - 1) / 3)))), iu[8 + n / 3];
    }, Xa.round = function(t, e) { return e ? Math.round(t * (e = Math.pow(10, e))) / e : Math.round(t); }, Xa.format = function(t) {
        var e = ou.exec(t), n = e[1] || " ", r = e[2] || ">", i = e[3] || "", o = e[4] || "", a = e[5], s = +e[6], u = e[7], c = e[8], l = e[9], f = 1, h = "", d = !1;
        switch (c && (c = +c.substring(1)), (a || "0" === n && "=" === r) && (a = n = "0", r = "=", u && (s -= Math.floor((s - 1) / 4))), l) {
        case"n":
            u = !0, l = "g";
            break;
        case"%":
            f = 100, h = "%", l = "f";
            break;
        case"p":
            f = 100, h = "%", l = "r";
            break;
        case"b":
        case"o":
        case"x":
        case"X":
            "#" === o && (o = "0" + l.toLowerCase());
        case"c":
        case"d":
            d = !0, c = 0;
            break;
        case"s":
            f = -1, l = "r";
        }
        "#" === o ? o = "" : "$" === o && (o = ru), "r" != l || c || (l = "g"), null != c && ("g" == l ? c = Math.max(1, Math.min(21, c)) : ("e" == l || "f" == l) && (c = Math.max(0, Math.min(20, c)))), l = au.get(l) || ke;
        var p = a && u;
        return function(t) {
            if (d && t % 1)return"";
            var e = 0 > t || 0 === t && 0 > 1 / t ? (t = -t, "-") : i;
            if (0 > f) {
                var g = Xa.formatPrefix(t, c);
                t = g.scale(t), h = g.symbol;
            } else t *= f;
            t = l(t, c);
            var m = t.lastIndexOf("."), v = 0 > m ? t : t.substring(0, m), y = 0 > m ? "" : tu + t.substring(m + 1);
            !a && u && (v = su(v));
            var b = o.length + v.length + y.length + (p ? 0 : e.length), x = s > b ? new Array(b = s - b + 1).join(n) : "";
            return p && (v = su(x + v)), e += o, t = v + y, ("<" === r ? e + t + x : ">" === r ? x + e + t : "^" === r ? x.substring(0, b >>= 1) + e + t + x.substring(b) : e + (p ? t : x + t)) + h;
        };
    };
    var ou = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i, au = Xa.map({ b: function(t) { return t.toString(2); }, c: function(t) { return String.fromCharCode(t); }, o: function(t) { return t.toString(8); }, x: function(t) { return t.toString(16); }, X: function(t) { return t.toString(16).toUpperCase(); }, g: function(t, e) { return t.toPrecision(e); }, e: function(t, e) { return t.toExponential(e); }, f: function(t, e) { return t.toFixed(e); }, r: function(t, e) { return(t = Xa.round(t, Me(t, e))).toFixed(Math.max(0, Math.min(20, Me(t * (1 + 1e-15), e)))); } }), su = ge;
    if (nu) {
        var uu = nu.length;
        su = function(t) {
            for (var e = t.length, n = [], r = 0, i = nu[0]; e > 0 && i > 0;)n.push(t.substring(e -= i, e + i)), i = nu[r = (r + 1) % uu];
            return n.reverse().join(eu);
        };
    }
    Xa.geo = {}, Se.prototype = { s: 0, t: 0, add: function(t) { Te(t, this.t, cu), Te(cu.s, this.s, this), this.s ? this.t += cu.t : this.s = cu.t; }, reset: function() { this.s = this.t = 0; }, valueOf: function() { return this.s; } };
    var cu = new Se;
    Xa.geo.stream = function(t, e) { t && lu.hasOwnProperty(t.type) ? lu[t.type](t, e) : Ee(t, e); };
    var lu = { Feature: function(t, e) { Ee(t.geometry, e); }, FeatureCollection: function(t, e) { for (var n = t.features, r = -1, i = n.length; ++r < i;)Ee(n[r].geometry, e); } }, fu = { Sphere: function(t, e) { e.sphere(); }, Point: function(t, e) { t = t.coordinates, e.point(t[0], t[1], t[2]); }, MultiPoint: function(t, e) { for (var n = t.coordinates, r = -1, i = n.length; ++r < i;)t = n[r], e.point(t[0], t[1], t[2]); }, LineString: function(t, e) { Ce(t.coordinates, e, 0); }, MultiLineString: function(t, e) { for (var n = t.coordinates, r = -1, i = n.length; ++r < i;)Ce(n[r], e, 0); }, Polygon: function(t, e) { De(t.coordinates, e); }, MultiPolygon: function(t, e) { for (var n = t.coordinates, r = -1, i = n.length; ++r < i;)De(n[r], e); }, GeometryCollection: function(t, e) { for (var n = t.geometries, r = -1, i = n.length; ++r < i;)Ee(n[r], e); } };
    Xa.geo.area = function(t) { return hu = 0, Xa.geo.stream(t, pu), hu; };
    var hu,
        du = new Se,
        pu = {
            sphere: function() { hu += 4 * Ts; },
            point: u,
            lineStart: u,
            lineEnd: u,
            polygonStart: function() { du.reset(), pu.lineStart = $e; },
            polygonEnd: function() {
                var t = 2 * du;
                hu += 0 > t ? 4 * Ts + t : t, pu.lineStart = pu.lineEnd = pu.point = u;
            }
        };
    Xa.geo.bounds = function() {

        function t(t, e) { b.push(x = [l = t, h = t]), f > e && (f = e), e > d && (d = e); }

        function e(e, n) {
            var r = Ae([e * As, n * As]);
            if (v) {
                var i = Le(v, r), o = [i[1], -i[0], 0], a = Le(o, i);
                Fe(a), a = Pe(a);
                var u = e - p, c = u > 0 ? 1 : -1, g = a[0] * Ns * c, m = us(u) > 180;
                if (m ^ (g > c * p && c * e > g)) {
                    var y = a[1] * Ns;
                    y > d && (d = y);
                } else if (g = (g + 360) % 360 - 180, m ^ (g > c * p && c * e > g)) {
                    var y = -a[1] * Ns;
                    f > y && (f = y);
                } else f > n && (f = n), n > d && (d = n);
                m ? p > e ? s(l, e) > s(l, h) && (h = e) : s(e, h) > s(l, h) && (l = e) : h >= l ? (l > e && (l = e), e > h && (h = e)) : e > p ? s(l, e) > s(l, h) && (h = e) : s(e, h) > s(l, h) && (l = e);
            } else t(e, n);
            v = r, p = e;
        }

        function n() { w.point = e; }

        function r() { x[0] = l, x[1] = h, w.point = t, v = null; }

        function i(t, n) {
            if (v) {
                var r = t - p;
                y += us(r) > 180 ? r + (r > 0 ? 360 : -360) : r;
            } else g = t, m = n;
            pu.point(t, n), e(t, n);
        }

        function o() { pu.lineStart(); }

        function a() { i(g, m), pu.lineEnd(), us(y) > Ds && (l = -(h = 180)), x[0] = l, x[1] = h, v = null; }

        function s(t, e) { return(e -= t) < 0 ? e + 360 : e; }

        function u(t, e) { return t[0] - e[0]; }

        function c(t, e) { return e[0] <= e[1] ? e[0] <= t && t <= e[1] : t < e[0] || e[1] < t; }

        var l, f, h, d, p, g, m, v, y, b, x, w = { point: t, lineStart: n, lineEnd: r, polygonStart: function() { w.point = i, w.lineStart = o, w.lineEnd = a, y = 0, pu.polygonStart(); }, polygonEnd: function() { pu.polygonEnd(), w.point = t, w.lineStart = n, w.lineEnd = r, 0 > du ? (l = -(h = 180), f = -(d = 90)) : y > Ds ? d = 90 : -Ds > y && (f = -90), x[0] = l, x[1] = h; } };
        return function(t) {
            d = h = -(l = f = 1 / 0), b = [], Xa.geo.stream(t, w);
            var e = b.length;
            if (e) {
                b.sort(u);
                for (var n, r = 1, i = b[0], o = [i]; e > r; ++r)n = b[r], c(n[0], i) || c(n[1], i) ? (s(i[0], n[1]) > s(i[0], i[1]) && (i[1] = n[1]), s(n[0], i[1]) > s(i[0], i[1]) && (i[0] = n[0])) : o.push(i = n);
                for (var a, n, p = -1 / 0, e = o.length - 1, r = 0, i = o[e]; e >= r; i = n, ++r)n = o[r], (a = s(i[1], n[0])) > p && (p = a, l = n[0], h = i[1]);
            }
            return b = x = null, 1 / 0 === l || 1 / 0 === f ? [[0 / 0, 0 / 0], [0 / 0, 0 / 0]] : [[l, f], [h, d]];
        };
    }(), Xa.geo.centroid = function(t) {
        gu = mu = vu = yu = bu = xu = wu = _u = Mu = ku = Su = 0, Xa.geo.stream(t, Tu);
        var e = Mu, n = ku, r = Su, i = e * e + n * n + r * r;
        return $s > i && (e = xu, n = wu, r = _u, Ds > mu && (e = vu, n = yu, r = bu), i = e * e + n * n + r * r, $s > i) ? [0 / 0, 0 / 0] : [Math.atan2(n, e) * Ns, z(r / Math.sqrt(i)) * Ns];
    };
    var gu, mu, vu, yu, bu, xu, wu, _u, Mu, ku, Su, Tu = { sphere: u, point: ze, lineStart: qe, lineEnd: He, polygonStart: function() { Tu.lineStart = Ye; }, polygonEnd: function() { Tu.lineStart = qe; } }, Eu = Xe(Be, Qe, en, [-Ts, -Ts / 2]), Cu = 1e9;
    Xa.geo.clipExtent = function() {
        var t, e, n, r, i, o, a = { stream: function(t) { return i && (i.valid = !1), i = o(t), i.valid = !0, i; }, extent: function(s) { return arguments.length ? (o = on(t = +s[0][0], e = +s[0][1], n = +s[1][0], r = +s[1][1]), i && (i.valid = !1, i = null), a) : [[t, e], [n, r]]; } };
        return a.extent([[0, 0], [960, 500]]);
    }, (Xa.geo.conicEqualArea = function() { return sn(un); }).raw = un, Xa.geo.albers = function() { return Xa.geo.conicEqualArea().rotate([96, 0]).center([-.6, 38.7]).parallels([29.5, 45.5]).scale(1070); }, Xa.geo.albersUsa = function() {

        function t(t) {
            var o = t[0], a = t[1];
            return e = null, n(o, a), e || (r(o, a), e) || i(o, a), e;
        }

        var e, n, r, i, o = Xa.geo.albers(), a = Xa.geo.conicEqualArea().rotate([154, 0]).center([-2, 58.5]).parallels([55, 65]), s = Xa.geo.conicEqualArea().rotate([157, 0]).center([-3, 19.9]).parallels([8, 18]), u = { point: function(t, n) { e = [t, n]; } };
        return t.invert = function(t) {
            var e = o.scale(), n = o.translate(), r = (t[0] - n[0]) / e, i = (t[1] - n[1]) / e;
            return(i >= .12 && .234 > i && r >= -.425 && -.214 > r ? a : i >= .166 && .234 > i && r >= -.214 && -.115 > r ? s : o).invert(t);
        }, t.stream = function(t) {
            var e = o.stream(t), n = a.stream(t), r = s.stream(t);
            return{ point: function(t, i) { e.point(t, i), n.point(t, i), r.point(t, i); }, sphere: function() { e.sphere(), n.sphere(), r.sphere(); }, lineStart: function() { e.lineStart(), n.lineStart(), r.lineStart(); }, lineEnd: function() { e.lineEnd(), n.lineEnd(), r.lineEnd(); }, polygonStart: function() { e.polygonStart(), n.polygonStart(), r.polygonStart(); }, polygonEnd: function() { e.polygonEnd(), n.polygonEnd(), r.polygonEnd(); } };
        }, t.precision = function(e) { return arguments.length ? (o.precision(e), a.precision(e), s.precision(e), t) : o.precision(); }, t.scale = function(e) { return arguments.length ? (o.scale(e), a.scale(.35 * e), s.scale(e), t.translate(o.translate())) : o.scale(); }, t.translate = function(e) {
            if (!arguments.length)return o.translate();
            var c = o.scale(), l = +e[0], f = +e[1];
            return n = o.translate(e).clipExtent([[l - .455 * c, f - .238 * c], [l + .455 * c, f + .238 * c]]).stream(u).point, r = a.translate([l - .307 * c, f + .201 * c]).clipExtent([[l - .425 * c + Ds, f + .12 * c + Ds], [l - .214 * c - Ds, f + .234 * c - Ds]]).stream(u).point, i = s.translate([l - .205 * c, f + .212 * c]).clipExtent([[l - .214 * c + Ds, f + .166 * c + Ds], [l - .115 * c - Ds, f + .234 * c - Ds]]).stream(u).point, t;
        }, t.scale(1070);
    };
    var Du, $u, Au, Nu, Lu, ju, Ou = { point: u, lineStart: u, lineEnd: u, polygonStart: function() { $u = 0, Ou.lineStart = cn; }, polygonEnd: function() { Ou.lineStart = Ou.lineEnd = Ou.point = u, Du += us($u / 2); } }, Fu = { point: ln, lineStart: u, lineEnd: u, polygonStart: u, polygonEnd: u }, Pu = { point: dn, lineStart: pn, lineEnd: gn, polygonStart: function() { Pu.lineStart = mn; }, polygonEnd: function() { Pu.point = dn, Pu.lineStart = pn, Pu.lineEnd = gn; } };
    Xa.geo.path = function() {

        function t(t) { return t && ("function" == typeof s && o.pointRadius(+s.apply(this, arguments)), a && a.valid || (a = i(o)), Xa.geo.stream(t, a)), o.result(); }

        function e() { return a = null, t; }

        var n, r, i, o, a, s = 4.5;
        return t.area = function(t) { return Du = 0, Xa.geo.stream(t, i(Ou)), Du; }, t.centroid = function(t) { return vu = yu = bu = xu = wu = _u = Mu = ku = Su = 0, Xa.geo.stream(t, i(Pu)), Su ? [Mu / Su, ku / Su] : _u ? [xu / _u, wu / _u] : bu ? [vu / bu, yu / bu] : [0 / 0, 0 / 0]; }, t.bounds = function(t) { return Lu = ju = -(Au = Nu = 1 / 0), Xa.geo.stream(t, i(Fu)), [[Au, Nu], [Lu, ju]]; }, t.projection = function(t) { return arguments.length ? (i = (n = t) ? t.stream || bn(t) : ge, e()) : n; }, t.context = function(t) { return arguments.length ? (o = null == (r = t) ? new fn : new vn(t), "function" != typeof s && o.pointRadius(s), e()) : r; }, t.pointRadius = function(e) { return arguments.length ? (s = "function" == typeof e ? e : (o.pointRadius(+e), +e), t) : s; }, t.projection(Xa.geo.albersUsa()).context(null);
    }, Xa.geo.transform = function(t) {
        return{
            stream: function(e) {
                var n = new xn(e);
                for (var r in t)n[r] = t[r];
                return n;
            }
        };
    }, xn.prototype = { point: function(t, e) { this.stream.point(t, e); }, sphere: function() { this.stream.sphere(); }, lineStart: function() { this.stream.lineStart(); }, lineEnd: function() { this.stream.lineEnd(); }, polygonStart: function() { this.stream.polygonStart(); }, polygonEnd: function() { this.stream.polygonEnd(); } }, Xa.geo.projection = _n, Xa.geo.projectionMutator = Mn, (Xa.geo.equirectangular = function() { return _n(Sn); }).raw = Sn.invert = Sn, Xa.geo.rotation = function(t) {

        function e(e) { return e = t(e[0] * As, e[1] * As), e[0] *= Ns, e[1] *= Ns, e; }

        return t = En(t[0] % 360 * As, t[1] * As, t.length > 2 ? t[2] * As : 0), e.invert = function(e) { return e = t.invert(e[0] * As, e[1] * As), e[0] *= Ns, e[1] *= Ns, e; }, e;
    }, Tn.invert = Sn, Xa.geo.circle = function() {

        function t() {
            var t = "function" == typeof r ? r.apply(this, arguments) : r, e = En(-t[0] * As, -t[1] * As, 0).invert, i = [];
            return n(null, null, 1, { point: function(t, n) { i.push(t = e(t, n)), t[0] *= Ns, t[1] *= Ns; } }), { type: "Polygon", coordinates: [i] };
        }

        var e, n, r = [0, 0], i = 6;
        return t.origin = function(e) { return arguments.length ? (r = e, t) : r; }, t.angle = function(r) { return arguments.length ? (n = An((e = +r) * As, i * As), t) : e; }, t.precision = function(r) { return arguments.length ? (n = An(e * As, (i = +r) * As), t) : i; }, t.angle(90);
    }, Xa.geo.distance = function(t, e) {
        var n, r = (e[0] - t[0]) * As, i = t[1] * As, o = e[1] * As, a = Math.sin(r), s = Math.cos(r), u = Math.sin(i), c = Math.cos(i), l = Math.sin(o), f = Math.cos(o);
        return Math.atan2(Math.sqrt((n = f * a) * n + (n = c * l - u * f * s) * n), u * l + c * f * s);
    }, Xa.geo.graticule = function() {

        function t() { return{ type: "MultiLineString", coordinates: e() }; }

        function e() { return Xa.range(Math.ceil(o / m) * m, i, m).map(h).concat(Xa.range(Math.ceil(c / v) * v, u, v).map(d)).concat(Xa.range(Math.ceil(r / p) * p, n, p).filter(function(t) { return us(t % m) > Ds; }).map(l)).concat(Xa.range(Math.ceil(s / g) * g, a, g).filter(function(t) { return us(t % v) > Ds; }).map(f)); }

        var n, r, i, o, a, s, u, c, l, f, h, d, p = 10, g = p, m = 90, v = 360, y = 2.5;
        return t.lines = function() { return e().map(function(t) { return{ type: "LineString", coordinates: t }; }); }, t.outline = function() { return{ type: "Polygon", coordinates: [h(o).concat(d(u).slice(1), h(i).reverse().slice(1), d(c).reverse().slice(1))] }; }, t.extent = function(e) { return arguments.length ? t.majorExtent(e).minorExtent(e) : t.minorExtent(); }, t.majorExtent = function(e) { return arguments.length ? (o = +e[0][0], i = +e[1][0], c = +e[0][1], u = +e[1][1], o > i && (e = o, o = i, i = e), c > u && (e = c, c = u, u = e), t.precision(y)) : [[o, c], [i, u]]; }, t.minorExtent = function(e) { return arguments.length ? (r = +e[0][0], n = +e[1][0], s = +e[0][1], a = +e[1][1], r > n && (e = r, r = n, n = e), s > a && (e = s, s = a, a = e), t.precision(y)) : [[r, s], [n, a]]; }, t.step = function(e) { return arguments.length ? t.majorStep(e).minorStep(e) : t.minorStep(); }, t.majorStep = function(e) { return arguments.length ? (m = +e[0], v = +e[1], t) : [m, v]; }, t.minorStep = function(e) { return arguments.length ? (p = +e[0], g = +e[1], t) : [p, g]; }, t.precision = function(e) { return arguments.length ? (y = +e, l = Ln(s, a, 90), f = jn(r, n, y), h = Ln(c, u, 90), d = jn(o, i, y), t) : y; }, t.majorExtent([[-180, -90 + Ds], [180, 90 - Ds]]).minorExtent([[-180, -80 - Ds], [180, 80 + Ds]]);
    }, Xa.geo.greatArc = function() {

        function t() { return{ type: "LineString", coordinates: [e || r.apply(this, arguments), n || i.apply(this, arguments)] }; }

        var e, n, r = On, i = Fn;
        return t.distance = function() { return Xa.geo.distance(e || r.apply(this, arguments), n || i.apply(this, arguments)); }, t.source = function(n) { return arguments.length ? (r = n, e = "function" == typeof n ? null : n, t) : r; }, t.target = function(e) { return arguments.length ? (i = e, n = "function" == typeof e ? null : e, t) : i; }, t.precision = function() { return arguments.length ? t : 0; }, t;
    }, Xa.geo.interpolate = function(t, e) { return Pn(t[0] * As, t[1] * As, e[0] * As, e[1] * As); }, Xa.geo.length = function(t) { return Ru = 0, Xa.geo.stream(t, zu), Ru; };
    var Ru, zu = { sphere: u, point: u, lineStart: Rn, lineEnd: u, polygonStart: u, polygonEnd: u }, Iu = zn(function(t) { return Math.sqrt(2 / (1 + t)); }, function(t) { return 2 * Math.asin(t / 2); });
    (Xa.geo.azimuthalEqualArea = function() { return _n(Iu); }).raw = Iu;
    var qu = zn(function(t) {
        var e = Math.acos(t);
        return e && e / Math.sin(e);
    }, ge);
    (Xa.geo.azimuthalEquidistant = function() { return _n(qu); }).raw = qu, (Xa.geo.conicConformal = function() { return sn(In); }).raw = In, (Xa.geo.conicEquidistant = function() { return sn(qn); }).raw = qn;
    var Hu = zn(function(t) { return 1 / t; }, Math.atan);
    (Xa.geo.gnomonic = function() { return _n(Hu); }).raw = Hu, Hn.invert = function(t, e) { return[t, 2 * Math.atan(Math.exp(e)) - Cs]; }, (Xa.geo.mercator = function() { return Yn(Hn); }).raw = Hn;
    var Yu = zn(function() { return 1; }, Math.asin);
    (Xa.geo.orthographic = function() { return _n(Yu); }).raw = Yu;
    var Bu = zn(function(t) { return 1 / (1 + t); }, function(t) { return 2 * Math.atan(t); });
    (Xa.geo.stereographic = function() { return _n(Bu); }).raw = Bu, Bn.invert = function(t, e) { return[Math.atan2(I(t), Math.cos(e)), z(Math.sin(e) / q(t))]; }, (Xa.geo.transverseMercator = function() { return Yn(Bn); }).raw = Bn, Xa.geom = {}, Xa.geom.hull = function(t) {

        function e(t) {
            if (t.length < 3)return[];
            var e, i, o, a, s, u, c, l, f, h, d, p, g = pe(n), m = pe(r), v = t.length, y = v - 1, b = [], x = [], w = 0;
            if (g === Un && r === Wn)e = t;
            else for (o = 0, e = []; v > o; ++o)e.push([+g.call(this, i = t[o], o), +m.call(this, i, o)]);
            for (o = 1; v > o; ++o)(e[o][1] < e[w][1] || e[o][1] == e[w][1] && e[o][0] < e[w][0]) && (w = o);
            for (o = 0; v > o; ++o)o !== w && (u = e[o][1] - e[w][1], s = e[o][0] - e[w][0], b.push({ angle: Math.atan2(u, s), index: o }));
            for (b.sort(function(t, e) { return t.angle - e.angle; }), d = b[0].angle, h = b[0].index, f = 0, o = 1; y > o; ++o) {
                if (a = b[o].index, d == b[o].angle) {
                    if (s = e[h][0] - e[w][0], u = e[h][1] - e[w][1], c = e[a][0] - e[w][0], l = e[a][1] - e[w][1], s * s + u * u >= c * c + l * l) {
                        b[o].index = -1;
                        continue;
                    }
                    b[f].index = -1;
                }
                d = b[o].angle, f = o, h = a;
            }
            for (x.push(w), o = 0, a = 0; 2 > o; ++a)b[a].index > -1 && (x.push(b[a].index), o++);
            for (p = x.length; y > a; ++a)
                if (!(b[a].index < 0)) {
                    for (; !Vn(x[p - 2], x[p - 1], b[a].index, e);)--p;
                    x[p++] = b[a].index;
                }
            var _ = [];
            for (o = p - 1; o >= 0; --o)_.push(t[x[o]]);
            return _;
        }

        var n = Un, r = Wn;
        return arguments.length ? e(t) : (e.x = function(t) { return arguments.length ? (n = t, e) : n; }, e.y = function(t) { return arguments.length ? (r = t, e) : r; }, e);
    }, Xa.geom.polygon = function(t) { return ds(t, Uu), t; };
    var Uu = Xa.geom.polygon.prototype = [];
    Uu.area = function() {
        for (var t, e = -1, n = this.length, r = this[n - 1], i = 0; ++e < n;)t = r, r = this[e], i += t[1] * r[0] - t[0] * r[1];
        return .5 * i;
    }, Uu.centroid = function(t) {
        var e, n, r = -1, i = this.length, o = 0, a = 0, s = this[i - 1];
        for (arguments.length || (t = -1 / (6 * this.area())); ++r < i;)e = s, s = this[r], n = e[0] * s[1] - s[0] * e[1], o += (e[0] + s[0]) * n, a += (e[1] + s[1]) * n;
        return[o * t, a * t];
    }, Uu.clip = function(t) {
        for (var e, n, r, i, o, a, s = Gn(t), u = -1, c = this.length - Gn(this), l = this[c - 1]; ++u < c;) {
            for (e = t.slice(), t.length = 0, i = this[u], o = e[(r = e.length - s) - 1], n = -1; ++n < r;)a = e[n], Xn(a, l, i) ? (Xn(o, l, i) || t.push(Zn(o, a, l, i)), t.push(a)) : Xn(o, l, i) && t.push(Zn(o, a, l, i)), o = a;
            s && t.push(t[0]), l = i;
        }
        return t;
    };
    var Wu, Vu, Xu, Zu, Gu, Ku = [], Ju = [];
    ir.prototype.prepare = function() {
        for (var t, e = this.edges, n = e.length; n--;)t = e[n].edge, t.b && t.a || e.splice(n, 1);
        return e.sort(ar), e.length;
    }, mr.prototype = { start: function() { return this.edge.l === this.site ? this.edge.a : this.edge.b; }, end: function() { return this.edge.l === this.site ? this.edge.b : this.edge.a; } }, vr.prototype = {
        insert: function(t, e) {
            var n, r, i;
            if (t) {
                if (e.P = t, e.N = t.N, t.N && (t.N.P = e), t.N = e, t.R) {
                    for (t = t.R; t.L;)t = t.L;
                    t.L = e;
                } else t.R = e;
                n = t;
            } else this._ ? (t = wr(this._), e.P = null, e.N = t, t.P = t.L = e, n = t) : (e.P = e.N = null, this._ = e, n = null);
            for (e.L = e.R = null, e.U = n, e.C = !0, t = e; n && n.C;)r = n.U, n === r.L ? (i = r.R, i && i.C ? (n.C = i.C = !1, r.C = !0, t = r) : (t === n.R && (br(this, n), t = n, n = t.U), n.C = !1, r.C = !0, xr(this, r))) : (i = r.L, i && i.C ? (n.C = i.C = !1, r.C = !0, t = r) : (t === n.L && (xr(this, n), t = n, n = t.U), n.C = !1, r.C = !0, br(this, r))), n = t.U;
            this._.C = !1;
        },
        remove: function(t) {
            t.N && (t.N.P = t.P), t.P && (t.P.N = t.N), t.N = t.P = null;
            var e, n, r, i = t.U, o = t.L, a = t.R;
            if (n = o ? a ? wr(a) : o : a, i ? i.L === t ? i.L = n : i.R = n : this._ = n, o && a ? (r = n.C, n.C = t.C, n.L = o, o.U = n, n !== a ? (i = n.U, n.U = t.U, t = n.R, i.L = t, n.R = a, a.U = n) : (n.U = i, i = n, t = n.R)) : (r = t.C, t = n), t && (t.U = i), !r) {
                if (t && t.C)return t.C = !1, void 0;
                do {
                    if (t === this._)break;
                    if (t === i.L) {
                        if (e = i.R, e.C && (e.C = !1, i.C = !0, br(this, i), e = i.R), e.L && e.L.C || e.R && e.R.C) {
                            e.R && e.R.C || (e.L.C = !1, e.C = !0, xr(this, e), e = i.R), e.C = i.C, i.C = e.R.C = !1, br(this, i), t = this._;
                            break;
                        }
                    } else if (e = i.L, e.C && (e.C = !1, i.C = !0, xr(this, i), e = i.L), e.L && e.L.C || e.R && e.R.C) {
                        e.L && e.L.C || (e.R.C = !1, e.C = !0, br(this, e), e = i.L), e.C = i.C, i.C = e.L.C = !1, xr(this, i), t = this._;
                        break;
                    }
                    e.C = !0, t = i, i = i.U;
                } while (!t.C);
                t && (t.C = !1);
            }
        }
    }, Xa.geom.voronoi = function(t) {

        function e(t) {
            var e = new Array(t.length), r = s[0][0], i = s[0][1], o = s[1][0], a = s[1][1];
            return _r(n(t), s).cells.forEach(function(n, s) {
                var u = n.edges,
                    c = n.site,
                    l = e[s] = u.length ? u.map(function(t) {
                        var e = t.start();
                        return[e.x, e.y];
                    }) : c.x >= r && c.x <= o && c.y >= i && c.y <= a ? [[r, a], [o, a], [o, i], [r, i]] : [];
                l.point = t[s];
            }), e;
        }

        function n(t) { return t.map(function(t, e) { return{ x: Math.round(o(t, e) / Ds) * Ds, y: Math.round(a(t, e) / Ds) * Ds, i: e }; }); }

        var r = Un, i = Wn, o = r, a = i, s = Qu;
        return t ? e(t) : (e.links = function(t) { return _r(n(t)).edges.filter(function(t) { return t.l && t.r; }).map(function(e) { return{ source: t[e.l.i], target: t[e.r.i] }; }); }, e.triangles = function(t) {
            var e = [];
            return _r(n(t)).cells.forEach(function(n, r) { for (var i, o, a = n.site, s = n.edges.sort(ar), u = -1, c = s.length, l = s[c - 1].edge, f = l.l === a ? l.r : l.l; ++u < c;)i = l, o = f, l = s[u].edge, f = l.l === a ? l.r : l.l, r < o.i && r < f.i && kr(a, o, f) < 0 && e.push([t[r], t[o.i], t[f.i]]); }), e;
        }, e.x = function(t) { return arguments.length ? (o = pe(r = t), e) : r; }, e.y = function(t) { return arguments.length ? (a = pe(i = t), e) : i; }, e.clipExtent = function(t) { return arguments.length ? (s = null == t ? Qu : t, e) : s === Qu ? null : s; }, e.size = function(t) { return arguments.length ? e.clipExtent(t && [[0, 0], t]) : s === Qu ? null : s && s[1]; }, e);
    };
    var Qu = [[-1e6, -1e6], [1e6, 1e6]];
    Xa.geom.delaunay = function(t) { return Xa.geom.voronoi().triangles(t); }, Xa.geom.quadtree = function(t, e, n, r, i) {

        function o(t) {

            function o(t, e, n, r, i, o, a, s) {
                if (!isNaN(n) && !isNaN(r))
                    if (t.leaf) {
                        var u = t.x, l = t.y;
                        if (null != u)
                            if (us(u - n) + us(l - r) < .01)c(t, e, n, r, i, o, a, s);
                            else {
                                var f = t.point;
                                t.x = t.y = t.point = null, c(t, f, u, l, i, o, a, s), c(t, e, n, r, i, o, a, s);
                            }
                        else t.x = n, t.y = r, t.point = e;
                    } else c(t, e, n, r, i, o, a, s);
            }

            function c(t, e, n, r, i, a, s, u) {
                var c = .5 * (i + s), l = .5 * (a + u), f = n >= c, h = r >= l, d = (h << 1) + f;
                t.leaf = !1, t = t.nodes[d] || (t.nodes[d] = Er()), f ? i = c : s = c, h ? a = l : u = l, o(t, e, n, r, i, a, s, u);
            }

            var l, f, h, d, p, g, m, v, y, b = pe(s), x = pe(u);
            if (null != e)g = e, m = n, v = r, y = i;
            else if (v = y = -(g = m = 1 / 0), f = [], h = [], p = t.length, a)for (d = 0; p > d; ++d)l = t[d], l.x < g && (g = l.x), l.y < m && (m = l.y), l.x > v && (v = l.x), l.y > y && (y = l.y), f.push(l.x), h.push(l.y);
            else
                for (d = 0; p > d; ++d) {
                    var w = +b(l = t[d], d), _ = +x(l, d);
                    g > w && (g = w), m > _ && (m = _), w > v && (v = w), _ > y && (y = _), f.push(w), h.push(_);
                }
            var M = v - g, k = y - m;
            M > k ? y = m + M : v = g + k;
            var S = Er();
            if (S.add = function(t) { o(S, t, +b(t, ++d), +x(t, d), g, m, v, y); }, S.visit = function(t) { Cr(t, S, g, m, v, y); }, d = -1, null == e) {
                for (; ++d < p;)o(S, t[d], f[d], h[d], g, m, v, y);
                --d;
            } else t.forEach(S.add);
            return f = h = t = l = null, S;
        }

        var a, s = Un, u = Wn;
        return(a = arguments.length) ? (s = Sr, u = Tr, 3 === a && (i = n, r = e, n = e = 0), o(t)) : (o.x = function(t) { return arguments.length ? (s = t, o) : s; }, o.y = function(t) { return arguments.length ? (u = t, o) : u; }, o.extent = function(t) { return arguments.length ? (null == t ? e = n = r = i = null : (e = +t[0][0], n = +t[0][1], r = +t[1][0], i = +t[1][1]), o) : null == e ? null : [[e, n], [r, i]]; }, o.size = function(t) { return arguments.length ? (null == t ? e = n = r = i = null : (e = n = 0, r = +t[0], i = +t[1]), o) : null == e ? null : [r - e, i - n]; }, o);
    }, Xa.interpolateRgb = Dr, Xa.interpolateObject = $r, Xa.interpolateNumber = Ar, Xa.interpolateString = Nr;
    var tc = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
    Xa.interpolate = Lr, Xa.interpolators = [
        function(t, e) {
            var n = typeof e;
            return("string" === n ? Vs.has(e) || /^(#|rgb\(|hsl\()/.test(e) ? Dr : Nr : e instanceof B ? Dr : "object" === n ? Array.isArray(e) ? jr : $r : Ar)(t, e);
        }
    ], Xa.interpolateArray = jr;
    var ec = function() { return ge; }, nc = Xa.map({ linear: ec, poly: qr, quad: function() { return Rr; }, cubic: function() { return zr; }, sin: function() { return Hr; }, exp: function() { return Yr; }, circle: function() { return Br; }, elastic: Ur, back: Wr, bounce: function() { return Vr; } }), rc = Xa.map({ "in": ge, out: Fr, "in-out": Pr, "out-in": function(t) { return Pr(Fr(t)); } });
    Xa.ease = function(t) {
        var e = t.indexOf("-"), n = e >= 0 ? t.substring(0, e) : t, r = e >= 0 ? t.substring(e + 1) : "in";
        return n = nc.get(n) || ec, r = rc.get(r) || ge, Or(r(n.apply(null, Za.call(arguments, 1))));
    }, Xa.interpolateHcl = Xr, Xa.interpolateHsl = Zr, Xa.interpolateLab = Gr, Xa.interpolateRound = Kr, Xa.transform = function(t) {
        var e = Ka.createElementNS(Xa.ns.prefix.svg, "g");
        return(Xa.transform = function(t) {
            if (null != t) {
                e.setAttribute("transform", t);
                var n = e.transform.baseVal.consolidate();
            }
            return new Jr(n ? n.matrix : ic);
        })(t);
    }, Jr.prototype.toString = function() { return"translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")"; };
    var ic = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    Xa.interpolateTransform = ni, Xa.layout = {}, Xa.layout.bundle = function() {
        return function(t) {
            for (var e = [], n = -1, r = t.length; ++n < r;)e.push(oi(t[n]));
            return e;
        };
    }, Xa.layout.chord = function() {

        function t() {
            var t, c, f, h, d, p = {}, g = [], m = Xa.range(o), v = [];
            for (n = [], r = [], t = 0, h = -1; ++h < o;) {
                for (c = 0, d = -1; ++d < o;)c += i[h][d];
                g.push(c), v.push(Xa.range(o)), t += c;
            }
            for (a && m.sort(function(t, e) { return a(g[t], g[e]); }), s && v.forEach(function(t, e) { t.sort(function(t, n) { return s(i[e][t], i[e][n]); }); }), t = (Es - l * o) / t, c = 0, h = -1; ++h < o;) {
                for (f = c, d = -1; ++d < o;) {
                    var y = m[h], b = v[y][d], x = i[y][b], w = c, _ = c += x * t;
                    p[y + "-" + b] = { index: y, subindex: b, startAngle: w, endAngle: _, value: x };
                }
                r[y] = { index: y, startAngle: f, endAngle: c, value: (c - f) / t }, c += l;
            }
            for (h = -1; ++h < o;)
                for (d = h - 1; ++d < o;) {
                    var M = p[h + "-" + d], k = p[d + "-" + h];
                    (M.value || k.value) && n.push(M.value < k.value ? { source: k, target: M } : { source: M, target: k });
                }
            u && e();
        }

        function e() { n.sort(function(t, e) { return u((t.source.value + t.target.value) / 2, (e.source.value + e.target.value) / 2); }); }

        var n, r, i, o, a, s, u, c = {}, l = 0;
        return c.matrix = function(t) { return arguments.length ? (o = (i = t) && i.length, n = r = null, c) : i; }, c.padding = function(t) { return arguments.length ? (l = t, n = r = null, c) : l; }, c.sortGroups = function(t) { return arguments.length ? (a = t, n = r = null, c) : a; }, c.sortSubgroups = function(t) { return arguments.length ? (s = t, n = null, c) : s; }, c.sortChords = function(t) { return arguments.length ? (u = t, n && e(), c) : u; }, c.chords = function() { return n || t(), n; }, c.groups = function() { return r || t(), r; }, c;
    }, Xa.layout.force = function() {

        function t(t) {
            return function(e, n, r, i) {
                if (e.point !== t) {
                    var o = e.cx - t.x, a = e.cy - t.y, s = 1 / Math.sqrt(o * o + a * a);
                    if (g > (i - n) * s) {
                        var u = e.charge * s * s;
                        return t.px -= o * u, t.py -= a * u, !0;
                    }
                    if (e.point && isFinite(s)) {
                        var u = e.pointCharge * s * s;
                        t.px -= o * u, t.py -= a * u;
                    }
                }
                return!e.charge;
            };
        }

        function e(t) { t.px = Xa.event.x, t.py = Xa.event.y, s.resume(); }

        var n, r, i, o, a, s = {}, u = Xa.dispatch("start", "tick", "end"), c = [1, 1], l = .9, f = oc, h = ac, d = -30, p = .1, g = .8, m = [], v = [];
        return s.tick = function() {
            if ((r *= .99) < .005)return u.end({ type: "end", alpha: r = 0 }), !0;
            var e, n, s, f, h, g, y, b, x, w = m.length, _ = v.length;
            for (n = 0; _ > n; ++n)s = v[n], f = s.source, h = s.target, b = h.x - f.x, x = h.y - f.y, (g = b * b + x * x) && (g = r * o[n] * ((g = Math.sqrt(g)) - i[n]) / g, b *= g, x *= g, h.x -= b * (y = f.weight / (h.weight + f.weight)), h.y -= x * y, f.x += b * (y = 1 - y), f.y += x * y);
            if ((y = r * p) && (b = c[0] / 2, x = c[1] / 2, n = -1, y))for (; ++n < w;)s = m[n], s.x += (b - s.x) * y, s.y += (x - s.y) * y;
            if (d)for (hi(e = Xa.geom.quadtree(m), r, a), n = -1; ++n < w;)(s = m[n]).fixed || e.visit(t(s));
            for (n = -1; ++n < w;)s = m[n], s.fixed ? (s.x = s.px, s.y = s.py) : (s.x -= (s.px - (s.px = s.x)) * l, s.y -= (s.py - (s.py = s.y)) * l);
            u.tick({ type: "tick", alpha: r });
        }, s.nodes = function(t) { return arguments.length ? (m = t, s) : m; }, s.links = function(t) { return arguments.length ? (v = t, s) : v; }, s.size = function(t) { return arguments.length ? (c = t, s) : c; }, s.linkDistance = function(t) { return arguments.length ? (f = "function" == typeof t ? t : +t, s) : f; }, s.distance = s.linkDistance, s.linkStrength = function(t) { return arguments.length ? (h = "function" == typeof t ? t : +t, s) : h; }, s.friction = function(t) { return arguments.length ? (l = +t, s) : l; }, s.charge = function(t) { return arguments.length ? (d = "function" == typeof t ? t : +t, s) : d; }, s.gravity = function(t) { return arguments.length ? (p = +t, s) : p; }, s.theta = function(t) { return arguments.length ? (g = +t, s) : g; }, s.alpha = function(t) { return arguments.length ? (t = +t, r ? r = t > 0 ? t : 0 : t > 0 && (u.start({ type: "start", alpha: r = t }), Xa.timer(s.tick)), s) : r; }, s.start = function() {

            function t(t, r) {
                if (!n) {
                    for (n = new Array(u), s = 0; u > s; ++s)n[s] = [];
                    for (s = 0; c > s; ++s) {
                        var i = v[s];
                        n[i.source.index].push(i.target), n[i.target.index].push(i.source);
                    }
                }
                for (var o, a = n[e], s = -1, c = a.length; ++s < c;)if (!isNaN(o = a[s][t]))return o;
                return Math.random() * r;
            }

            var e, n, r, u = m.length, l = v.length, p = c[0], g = c[1];
            for (e = 0; u > e; ++e)(r = m[e]).index = e, r.weight = 0;
            for (e = 0; l > e; ++e)r = v[e], "number" == typeof r.source && (r.source = m[r.source]), "number" == typeof r.target && (r.target = m[r.target]), ++r.source.weight, ++r.target.weight;
            for (e = 0; u > e; ++e)r = m[e], isNaN(r.x) && (r.x = t("x", p)), isNaN(r.y) && (r.y = t("y", g)), isNaN(r.px) && (r.px = r.x), isNaN(r.py) && (r.py = r.y);
            if (i = [], "function" == typeof f)for (e = 0; l > e; ++e)i[e] = +f.call(this, v[e], e);
            else for (e = 0; l > e; ++e)i[e] = f;
            if (o = [], "function" == typeof h)for (e = 0; l > e; ++e)o[e] = +h.call(this, v[e], e);
            else for (e = 0; l > e; ++e)o[e] = h;
            if (a = [], "function" == typeof d)for (e = 0; u > e; ++e)a[e] = +d.call(this, m[e], e);
            else for (e = 0; u > e; ++e)a[e] = d;
            return s.resume();
        }, s.resume = function() { return s.alpha(.1); }, s.stop = function() { return s.alpha(0); }, s.drag = function() { return n || (n = Xa.behavior.drag().origin(ge).on("dragstart.force", ui).on("drag.force", e).on("dragend.force", ci)), arguments.length ? (this.on("mouseover.force", li).on("mouseout.force", fi).call(n), void 0) : n; }, Xa.rebind(s, u, "on");
    };
    var oc = 20, ac = 1;
    Xa.layout.hierarchy = function() {

        function t(e, a, s) {
            var u = i.call(n, e, a);
            if (e.depth = a, s.push(e), u && (c = u.length)) {
                for (var c, l, f = -1, h = e.children = new Array(c), d = 0, p = a + 1; ++f < c;)l = h[f] = t(u[f], p, s), l.parent = e, d += l.value;
                r && h.sort(r), o && (e.value = d);
            } else delete e.children, o && (e.value = +o.call(n, e, a) || 0);
            return e;
        }

        function e(t, r) {
            var i = t.children, a = 0;
            if (i && (s = i.length))for (var s, u = -1, c = r + 1; ++u < s;)a += e(i[u], c);
            else o && (a = +o.call(n, t, r) || 0);
            return o && (t.value = a), a;
        }

        function n(e) {
            var n = [];
            return t(e, 0, n), n;
        }

        var r = mi, i = pi, o = gi;
        return n.sort = function(t) { return arguments.length ? (r = t, n) : r; }, n.children = function(t) { return arguments.length ? (i = t, n) : i; }, n.value = function(t) { return arguments.length ? (o = t, n) : o; }, n.revalue = function(t) { return e(t, 0), t; }, n;
    }, Xa.layout.partition = function() {

        function t(e, n, r, i) {
            var o = e.children;
            if (e.x = n, e.y = e.depth * i, e.dx = r, e.dy = i, o && (a = o.length)) {
                var a, s, u, c = -1;
                for (r = e.value ? r / e.value : 0; ++c < a;)t(s = o[c], n, u = s.value * r, i), n += u;
            }
        }

        function e(t) {
            var n = t.children, r = 0;
            if (n && (i = n.length))for (var i, o = -1; ++o < i;)r = Math.max(r, e(n[o]));
            return 1 + r;
        }

        function n(n, o) {
            var a = r.call(this, n, o);
            return t(a[0], 0, i[0], i[1] / e(a[0])), a;
        }

        var r = Xa.layout.hierarchy(), i = [1, 1];
        return n.size = function(t) { return arguments.length ? (i = t, n) : i; }, di(n, r);
    }, Xa.layout.pie = function() {

        function t(o) {
            var a = o.map(function(n, r) { return+e.call(t, n, r); }), s = +("function" == typeof r ? r.apply(this, arguments) : r), u = (("function" == typeof i ? i.apply(this, arguments) : i) - s) / Xa.sum(a), c = Xa.range(o.length);
            null != n && c.sort(n === sc ? function(t, e) { return a[e] - a[t]; } : function(t, e) { return n(o[t], o[e]); });
            var l = [];
            return c.forEach(function(t) {
                var e;
                l[t] = { data: o[t], value: e = a[t], startAngle: s, endAngle: s += e * u };
            }), l;
        }

        var e = Number, n = sc, r = 0, i = Es;
        return t.value = function(n) { return arguments.length ? (e = n, t) : e; }, t.sort = function(e) { return arguments.length ? (n = e, t) : n; }, t.startAngle = function(e) { return arguments.length ? (r = e, t) : r; }, t.endAngle = function(e) { return arguments.length ? (i = e, t) : i; }, t;
    };
    var sc = {};
    Xa.layout.stack = function() {

        function t(s, u) {
            var c = s.map(function(n, r) { return e.call(t, n, r); }), l = c.map(function(e) { return e.map(function(e, n) { return[o.call(t, e, n), a.call(t, e, n)]; }); }), f = n.call(t, l, u);
            c = Xa.permute(c, f), l = Xa.permute(l, f);
            var h, d, p, g = r.call(t, l, u), m = c.length, v = c[0].length;
            for (d = 0; v > d; ++d)for (i.call(t, c[0][d], p = g[d], l[0][d][1]), h = 1; m > h; ++h)i.call(t, c[h][d], p += l[h - 1][d][1], l[h][d][1]);
            return s;
        }

        var e = ge, n = wi, r = _i, i = xi, o = yi, a = bi;
        return t.values = function(n) { return arguments.length ? (e = n, t) : e; }, t.order = function(e) { return arguments.length ? (n = "function" == typeof e ? e : uc.get(e) || wi, t) : n; }, t.offset = function(e) { return arguments.length ? (r = "function" == typeof e ? e : cc.get(e) || _i, t) : r; }, t.x = function(e) { return arguments.length ? (o = e, t) : o; }, t.y = function(e) { return arguments.length ? (a = e, t) : a; }, t.out = function(e) { return arguments.length ? (i = e, t) : i; }, t;
    };
    var uc = Xa.map({
            "inside-out": function(t) {
                var e, n, r = t.length, i = t.map(Mi), o = t.map(ki), a = Xa.range(r).sort(function(t, e) { return i[t] - i[e]; }), s = 0, u = 0, c = [], l = [];
                for (e = 0; r > e; ++e)n = a[e], u > s ? (s += o[n], c.push(n)) : (u += o[n], l.push(n));
                return l.reverse().concat(c);
            },
            reverse: function(t) { return Xa.range(t.length).reverse(); },
            "default": wi
        }),
        cc = Xa.map({
            silhouette: function(t) {
                var e, n, r, i = t.length, o = t[0].length, a = [], s = 0, u = [];
                for (n = 0; o > n; ++n) {
                    for (e = 0, r = 0; i > e; e++)r += t[e][n][1];
                    r > s && (s = r), a.push(r);
                }
                for (n = 0; o > n; ++n)u[n] = (s - a[n]) / 2;
                return u;
            },
            wiggle: function(t) {
                var e, n, r, i, o, a, s, u, c, l = t.length, f = t[0], h = f.length, d = [];
                for (d[0] = u = c = 0, n = 1; h > n; ++n) {
                    for (e = 0, i = 0; l > e; ++e)i += t[e][n][1];
                    for (e = 0, o = 0, s = f[n][0] - f[n - 1][0]; l > e; ++e) {
                        for (r = 0, a = (t[e][n][1] - t[e][n - 1][1]) / (2 * s); e > r; ++r)a += (t[r][n][1] - t[r][n - 1][1]) / s;
                        o += a * t[e][n][1];
                    }
                    d[n] = u -= i ? o / i * s : 0, c > u && (c = u);
                }
                for (n = 0; h > n; ++n)d[n] -= c;
                return d;
            },
            expand: function(t) {
                var e, n, r, i = t.length, o = t[0].length, a = 1 / i, s = [];
                for (n = 0; o > n; ++n) {
                    for (e = 0, r = 0; i > e; e++)r += t[e][n][1];
                    if (r)for (e = 0; i > e; e++)t[e][n][1] /= r;
                    else for (e = 0; i > e; e++)t[e][n][1] = a;
                }
                for (n = 0; o > n; ++n)s[n] = 0;
                return s;
            },
            zero: _i
        });
    Xa.layout.histogram = function() {

        function t(t, o) {
            for (var a, s, u = [], c = t.map(n, this), l = r.call(this, c, o), f = i.call(this, l, c, o), o = -1, h = c.length, d = f.length - 1, p = e ? 1 : 1 / h; ++o < d;)a = u[o] = [], a.dx = f[o + 1] - (a.x = f[o]), a.y = 0;
            if (d > 0)for (o = -1; ++o < h;)s = c[o], s >= l[0] && s <= l[1] && (a = u[Xa.bisect(f, s, 1, d) - 1], a.y += p, a.push(t[o]));
            return u;
        }

        var e = !0, n = Number, r = Ci, i = Ti;
        return t.value = function(e) { return arguments.length ? (n = e, t) : n; }, t.range = function(e) { return arguments.length ? (r = pe(e), t) : r; }, t.bins = function(e) { return arguments.length ? (i = "number" == typeof e ? function(t) { return Ei(t, e); } : pe(e), t) : i; }, t.frequency = function(n) { return arguments.length ? (e = !!n, t) : e; }, t;
    }, Xa.layout.tree = function() {

        function t(t, o) {

            function a(t, e) {
                var r = t.children, i = t._tree;
                if (r && (o = r.length)) {
                    for (var o, s, c, l = r[0], f = l, h = -1; ++h < o;)c = r[h], a(c, s), f = u(c, s, f), s = c;
                    Pi(t);
                    var d = .5 * (l._tree.prelim + c._tree.prelim);
                    e ? (i.prelim = e._tree.prelim + n(t, e), i.mod = i.prelim - d) : i.prelim = d;
                } else e && (i.prelim = e._tree.prelim + n(t, e));
            }

            function s(t, e) {
                t.x = t._tree.prelim + e;
                var n = t.children;
                if (n && (r = n.length)) {
                    var r, i = -1;
                    for (e += t._tree.mod; ++i < r;)s(n[i], e);
                }
            }

            function u(t, e, r) {
                if (e) {
                    for (var i, o = t, a = t, s = e, u = t.parent.children[0], c = o._tree.mod, l = a._tree.mod, f = s._tree.mod, h = u._tree.mod; s = Ai(s), o = $i(o), s && o;)u = $i(u), a = Ai(a), a._tree.ancestor = t, i = s._tree.prelim + f - o._tree.prelim - c + n(s, o), i > 0 && (Ri(zi(s, t, r), t, i), c += i, l += i), f += s._tree.mod, c += o._tree.mod, h += u._tree.mod, l += a._tree.mod;
                    s && !Ai(a) && (a._tree.thread = s, a._tree.mod += f - l), o && !$i(u) && (u._tree.thread = o, u._tree.mod += c - h, r = t);
                }
                return r;
            }

            var c = e.call(this, t, o), l = c[0];
            Fi(l, function(t, e) { t._tree = { ancestor: t, prelim: 0, mod: 0, change: 0, shift: 0, number: e ? e._tree.number + 1 : 0 }; }), a(l), s(l, -l._tree.prelim);
            var f = Ni(l, ji), h = Ni(l, Li), d = Ni(l, Oi), p = f.x - n(f, h) / 2, g = h.x + n(h, f) / 2, m = d.depth || 1;
            return Fi(l, i ? function(t) { t.x *= r[0], t.y = t.depth * r[1], delete t._tree; } : function(t) { t.x = (t.x - p) / (g - p) * r[0], t.y = t.depth / m * r[1], delete t._tree; }), c;
        }

        var e = Xa.layout.hierarchy().sort(null).value(null), n = Di, r = [1, 1], i = !1;
        return t.separation = function(e) { return arguments.length ? (n = e, t) : n; }, t.size = function(e) { return arguments.length ? (i = null == (r = e), t) : i ? null : r; }, t.nodeSize = function(e) { return arguments.length ? (i = null != (r = e), t) : i ? r : null; }, di(t, e);
    }, Xa.layout.pack = function() {

        function t(t, o) {
            var a = n.call(this, t, o), s = a[0], u = i[0], c = i[1], l = null == e ? Math.sqrt : "function" == typeof e ? e : function() { return e; };
            if (s.x = s.y = 0, Fi(s, function(t) { t.r = +l(t.value); }), Fi(s, Bi), r) {
                var f = r * (e ? 1 : Math.max(2 * s.r / u, 2 * s.r / c)) / 2;
                Fi(s, function(t) { t.r += f; }), Fi(s, Bi), Fi(s, function(t) { t.r -= f; });
            }
            return Vi(s, u / 2, c / 2, e ? 1 : 1 / Math.max(2 * s.r / u, 2 * s.r / c)), a;
        }

        var e, n = Xa.layout.hierarchy().sort(Ii), r = 0, i = [1, 1];
        return t.size = function(e) { return arguments.length ? (i = e, t) : i; }, t.radius = function(n) { return arguments.length ? (e = null == n || "function" == typeof n ? n : +n, t) : e; }, t.padding = function(e) { return arguments.length ? (r = +e, t) : r; }, di(t, n);
    }, Xa.layout.cluster = function() {

        function t(t, o) {
            var a, s = e.call(this, t, o), u = s[0], c = 0;
            Fi(u, function(t) {
                var e = t.children;
                e && e.length ? (t.x = Gi(e), t.y = Zi(e)) : (t.x = a ? c += n(t, a) : 0, t.y = 0, a = t);
            });
            var l = Ki(u), f = Ji(u), h = l.x - n(l, f) / 2, d = f.x + n(f, l) / 2;
            return Fi(u, i ? function(t) { t.x = (t.x - u.x) * r[0], t.y = (u.y - t.y) * r[1]; } : function(t) { t.x = (t.x - h) / (d - h) * r[0], t.y = (1 - (u.y ? t.y / u.y : 1)) * r[1]; }), s;
        }

        var e = Xa.layout.hierarchy().sort(null).value(null), n = Di, r = [1, 1], i = !1;
        return t.separation = function(e) { return arguments.length ? (n = e, t) : n; }, t.size = function(e) { return arguments.length ? (i = null == (r = e), t) : i ? null : r; }, t.nodeSize = function(e) { return arguments.length ? (i = null != (r = e), t) : i ? r : null; }, di(t, e);
    }, Xa.layout.treemap = function() {

        function t(t, e) { for (var n, r, i = -1, o = t.length; ++i < o;)r = (n = t[i]).value * (0 > e ? 0 : e), n.area = isNaN(r) || 0 >= r ? 0 : r; }

        function e(n) {
            var o = n.children;
            if (o && o.length) {
                var a, s, u, c = f(n), l = [], h = o.slice(), p = 1 / 0, g = "slice" === d ? c.dx : "dice" === d ? c.dy : "slice-dice" === d ? 1 & n.depth ? c.dy : c.dx : Math.min(c.dx, c.dy);
                for (t(h, c.dx * c.dy / n.value), l.area = 0; (u = h.length) > 0;)l.push(a = h[u - 1]), l.area += a.area, "squarify" !== d || (s = r(l, g)) <= p ? (h.pop(), p = s) : (l.area -= l.pop().area, i(l, g, c, !1), g = Math.min(c.dx, c.dy), l.length = l.area = 0, p = 1 / 0);
                l.length && (i(l, g, c, !0), l.length = l.area = 0), o.forEach(e);
            }
        }

        function n(e) {
            var r = e.children;
            if (r && r.length) {
                var o, a = f(e), s = r.slice(), u = [];
                for (t(s, a.dx * a.dy / e.value), u.area = 0; o = s.pop();)u.push(o), u.area += o.area, null != o.z && (i(u, o.z ? a.dx : a.dy, a, !s.length), u.length = u.area = 0);
                r.forEach(n);
            }
        }

        function r(t, e) {
            for (var n, r = t.area, i = 0, o = 1 / 0, a = -1, s = t.length; ++a < s;)(n = t[a].area) && (o > n && (o = n), n > i && (i = n));
            return r *= r, e *= e, r ? Math.max(e * i * p / r, r / (e * o * p)) : 1 / 0;
        }

        function i(t, e, n, r) {
            var i, o = -1, a = t.length, s = n.x, c = n.y, l = e ? u(t.area / e) : 0;
            if (e == n.dx) {
                for ((r || l > n.dy) && (l = n.dy); ++o < a;)i = t[o], i.x = s, i.y = c, i.dy = l, s += i.dx = Math.min(n.x + n.dx - s, l ? u(i.area / l) : 0);
                i.z = !0, i.dx += n.x + n.dx - s, n.y += l, n.dy -= l;
            } else {
                for ((r || l > n.dx) && (l = n.dx); ++o < a;)i = t[o], i.x = s, i.y = c, i.dx = l, c += i.dy = Math.min(n.y + n.dy - c, l ? u(i.area / l) : 0);
                i.z = !1, i.dy += n.y + n.dy - c, n.x += l, n.dx -= l;
            }
        }

        function o(r) {
            var i = a || s(r), o = i[0];
            return o.x = 0, o.y = 0, o.dx = c[0], o.dy = c[1], a && s.revalue(o), t([o], o.dx * o.dy / o.value), (a ? n : e)(o), h && (a = i), i;
        }

        var a, s = Xa.layout.hierarchy(), u = Math.round, c = [1, 1], l = null, f = Qi, h = !1, d = "squarify", p = .5 * (1 + Math.sqrt(5));
        return o.size = function(t) { return arguments.length ? (c = t, o) : c; }, o.padding = function(t) {

            function e(e) {
                var n = t.call(o, e, e.depth);
                return null == n ? Qi(e) : to(e, "number" == typeof n ? [n, n, n, n] : n);
            }

            function n(e) { return to(e, t); }

            if (!arguments.length)return l;
            var r;
            return f = null == (l = t) ? Qi : "function" == (r = typeof t) ? e : "number" === r ? (t = [t, t, t, t], n) : n, o;
        }, o.round = function(t) { return arguments.length ? (u = t ? Math.round : Number, o) : u != Number; }, o.sticky = function(t) { return arguments.length ? (h = t, a = null, o) : h; }, o.ratio = function(t) { return arguments.length ? (p = t, o) : p; }, o.mode = function(t) { return arguments.length ? (d = t + "", o) : d; }, di(o, s);
    }, Xa.random = {
        normal: function(t, e) {
            var n = arguments.length;
            return 2 > n && (e = 1), 1 > n && (t = 0), function() {
                var n, r, i;
                do n = 2 * Math.random() - 1, r = 2 * Math.random() - 1, i = n * n + r * r;
                while (!i || i > 1);
                return t + e * n * Math.sqrt(-2 * Math.log(i) / i);
            };
        },
        logNormal: function() {
            var t = Xa.random.normal.apply(Xa, arguments);
            return function() { return Math.exp(t()); };
        },
        irwinHall: function(t) {
            return function() {
                for (var e = 0, n = 0; t > n; n++)e += Math.random();
                return e / t;
            };
        }
    }, Xa.scale = {};
    var lc = { floor: ge, ceil: ge };
    Xa.scale.linear = function() { return so([0, 1], [0, 1], Lr, !1); };
    var fc = { s: 1, g: 1, p: 1, r: 1, e: 1 };
    Xa.scale.log = function() { return mo(Xa.scale.linear().domain([0, 1]), 10, !0, [1, 10]); };
    var hc = Xa.format(".0e"), dc = { floor: function(t) { return-Math.ceil(-t); }, ceil: function(t) { return-Math.floor(-t); } };
    Xa.scale.pow = function() { return vo(Xa.scale.linear(), 1, [0, 1]); }, Xa.scale.sqrt = function() { return Xa.scale.pow().exponent(.5); }, Xa.scale.ordinal = function() { return bo([], { t: "range", a: [[]] }); }, Xa.scale.category10 = function() { return Xa.scale.ordinal().range(pc); }, Xa.scale.category20 = function() { return Xa.scale.ordinal().range(gc); }, Xa.scale.category20b = function() { return Xa.scale.ordinal().range(mc); }, Xa.scale.category20c = function() { return Xa.scale.ordinal().range(vc); };
    var pc = [2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175].map(oe), gc = [2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725].map(oe), mc = [3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654].map(oe), vc = [3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081].map(oe);
    Xa.scale.quantile = function() { return xo([], []); }, Xa.scale.quantize = function() { return wo(0, 1, [0, 1]); }, Xa.scale.threshold = function() { return _o([.5], [0, 1]); }, Xa.scale.identity = function() { return Mo([0, 1]); }, Xa.svg = {}, Xa.svg.arc = function() {

        function t() {
            var t = e.apply(this, arguments), o = n.apply(this, arguments), a = r.apply(this, arguments) + yc, s = i.apply(this, arguments) + yc, u = (a > s && (u = a, a = s, s = u), s - a), c = Ts > u ? "0" : "1", l = Math.cos(a), f = Math.sin(a), h = Math.cos(s), d = Math.sin(s);
            return u >= bc ? t ? "M0," + o + "A" + o + "," + o + " 0 1,1 0," + -o + "A" + o + "," + o + " 0 1,1 0," + o + "M0," + t + "A" + t + "," + t + " 0 1,0 0," + -t + "A" + t + "," + t + " 0 1,0 0," + t + "Z" : "M0," + o + "A" + o + "," + o + " 0 1,1 0," + -o + "A" + o + "," + o + " 0 1,1 0," + o + "Z" : t ? "M" + o * l + "," + o * f + "A" + o + "," + o + " 0 " + c + ",1 " + o * h + "," + o * d + "L" + t * h + "," + t * d + "A" + t + "," + t + " 0 " + c + ",0 " + t * l + "," + t * f + "Z" : "M" + o * l + "," + o * f + "A" + o + "," + o + " 0 " + c + ",1 " + o * h + "," + o * d + "L0,0" + "Z";
        }

        var e = ko, n = So, r = To, i = Eo;
        return t.innerRadius = function(n) { return arguments.length ? (e = pe(n), t) : e; }, t.outerRadius = function(e) { return arguments.length ? (n = pe(e), t) : n; }, t.startAngle = function(e) { return arguments.length ? (r = pe(e), t) : r; }, t.endAngle = function(e) { return arguments.length ? (i = pe(e), t) : i; }, t.centroid = function() {
            var t = (e.apply(this, arguments) + n.apply(this, arguments)) / 2, o = (r.apply(this, arguments) + i.apply(this, arguments)) / 2 + yc;
            return[Math.cos(o) * t, Math.sin(o) * t];
        }, t;
    };
    var yc = -Cs, bc = Es - Ds;
    Xa.svg.line = function() { return Co(ge); };
    var xc = Xa.map({ linear: Do, "linear-closed": $o, step: Ao, "step-before": No, "step-after": Lo, basis: zo, "basis-open": Io, "basis-closed": qo, bundle: Ho, cardinal: Fo, "cardinal-open": jo, "cardinal-closed": Oo, monotone: Xo });
    xc.forEach(function(t, e) { e.key = t, e.closed = /-closed$/.test(t); });
    var wc = [0, 2 / 3, 1 / 3, 0], _c = [0, 1 / 3, 2 / 3, 0], Mc = [0, 1 / 6, 2 / 3, 1 / 6];
    Xa.svg.line.radial = function() {
        var t = Co(Zo);
        return t.radius = t.x, delete t.x, t.angle = t.y, delete t.y, t;
    }, No.reverse = Lo, Lo.reverse = No, Xa.svg.area = function() { return Go(ge); }, Xa.svg.area.radial = function() {
        var t = Go(Zo);
        return t.radius = t.x, delete t.x, t.innerRadius = t.x0, delete t.x0, t.outerRadius = t.x1, delete t.x1, t.angle = t.y, delete t.y, t.startAngle = t.y0, delete t.y0, t.endAngle = t.y1, delete t.y1, t;
    }, Xa.svg.chord = function() {

        function t(t, s) {
            var u = e(this, o, t, s), c = e(this, a, t, s);
            return"M" + u.p0 + r(u.r, u.p1, u.a1 - u.a0) + (n(u, c) ? i(u.r, u.p1, u.r, u.p0) : i(u.r, u.p1, c.r, c.p0) + r(c.r, c.p1, c.a1 - c.a0) + i(c.r, c.p1, u.r, u.p0)) + "Z";
        }

        function e(t, e, n, r) {
            var i = e.call(t, n, r), o = s.call(t, i, r), a = u.call(t, i, r) + yc, l = c.call(t, i, r) + yc;
            return{ r: o, a0: a, a1: l, p0: [o * Math.cos(a), o * Math.sin(a)], p1: [o * Math.cos(l), o * Math.sin(l)] };
        }

        function n(t, e) { return t.a0 == e.a0 && t.a1 == e.a1; }

        function r(t, e, n) { return"A" + t + "," + t + " 0 " + +(n > Ts) + ",1 " + e; }

        function i(t, e, n, r) { return"Q 0,0 " + r; }

        var o = On, a = Fn, s = Ko, u = To, c = Eo;
        return t.radius = function(e) { return arguments.length ? (s = pe(e), t) : s; }, t.source = function(e) { return arguments.length ? (o = pe(e), t) : o; }, t.target = function(e) { return arguments.length ? (a = pe(e), t) : a; }, t.startAngle = function(e) { return arguments.length ? (u = pe(e), t) : u; }, t.endAngle = function(e) { return arguments.length ? (c = pe(e), t) : c; }, t;
    }, Xa.svg.diagonal = function() {

        function t(t, i) {
            var o = e.call(this, t, i), a = n.call(this, t, i), s = (o.y + a.y) / 2, u = [o, { x: o.x, y: s }, { x: a.x, y: s }, a];
            return u = u.map(r), "M" + u[0] + "C" + u[1] + " " + u[2] + " " + u[3];
        }

        var e = On, n = Fn, r = Jo;
        return t.source = function(n) { return arguments.length ? (e = pe(n), t) : e; }, t.target = function(e) { return arguments.length ? (n = pe(e), t) : n; }, t.projection = function(e) { return arguments.length ? (r = e, t) : r; }, t;
    }, Xa.svg.diagonal.radial = function() {
        var t = Xa.svg.diagonal(), e = Jo, n = t.projection;
        return t.projection = function(t) { return arguments.length ? n(Qo(e = t)) : e; }, t;
    }, Xa.svg.symbol = function() {

        function t(t, r) { return(kc.get(e.call(this, t, r)) || na)(n.call(this, t, r)); }

        var e = ea, n = ta;
        return t.type = function(n) {
            return arguments.length ? (e = pe(n), t) : e;
        }, t.size = function(e) { return arguments.length ? (n = pe(e), t) : n; }, t;
    };
    var kc = Xa.map({
        circle: na,
        cross: function(t) {
            var e = Math.sqrt(t / 5) / 2;
            return"M" + -3 * e + "," + -e + "H" + -e + "V" + -3 * e + "H" + e + "V" + -e + "H" + 3 * e + "V" + e + "H" + e + "V" + 3 * e + "H" + -e + "V" + e + "H" + -3 * e + "Z";
        },
        diamond: function(t) {
            var e = Math.sqrt(t / (2 * Cc)), n = e * Cc;
            return"M0," + -e + "L" + n + ",0" + " 0," + e + " " + -n + ",0" + "Z";
        },
        square: function(t) {
            var e = Math.sqrt(t) / 2;
            return"M" + -e + "," + -e + "L" + e + "," + -e + " " + e + "," + e + " " + -e + "," + e + "Z";
        },
        "triangle-down": function(t) {
            var e = Math.sqrt(t / Ec), n = e * Ec / 2;
            return"M0," + n + "L" + e + "," + -n + " " + -e + "," + -n + "Z";
        },
        "triangle-up": function(t) {
            var e = Math.sqrt(t / Ec), n = e * Ec / 2;
            return"M0," + -n + "L" + e + "," + n + " " + -e + "," + n + "Z";
        }
    });
    Xa.svg.symbolTypes = kc.keys();
    var Sc, Tc, Ec = Math.sqrt(3), Cc = Math.tan(30 * As), Dc = [], $c = 0;
    Dc.call = ys.call, Dc.empty = ys.empty, Dc.node = ys.node, Dc.size = ys.size, Xa.transition = function(t) { return arguments.length ? Sc ? t.transition() : t : ws.transition(); }, Xa.transition.prototype = Dc, Dc.select = function(t) {
        var e, n, r, i = this.id, o = [];
        t = g(t);
        for (var a = -1, s = this.length; ++a < s;) {
            o.push(e = []);
            for (var u = this[a], c = -1, l = u.length; ++c < l;)(r = u[c]) && (n = t.call(r, r.__data__, c, a)) ? ("__data__" in r && (n.__data__ = r.__data__), aa(n, c, i, r.__transition__[i]), e.push(n)) : e.push(null);
        }
        return ra(o, i);
    }, Dc.selectAll = function(t) {
        var e, n, r, i, o, a = this.id, s = [];
        t = m(t);
        for (var u = -1, c = this.length; ++u < c;)
            for (var l = this[u], f = -1, h = l.length; ++f < h;)
                if (r = l[f]) {
                    o = r.__transition__[a], n = t.call(r, r.__data__, f, u), s.push(e = []);
                    for (var d = -1, p = n.length; ++d < p;)(i = n[d]) && aa(i, d, a, o), e.push(i);
                }
        return ra(s, a);
    }, Dc.filter = function(t) {
        var e, n, r, i = [];
        "function" != typeof t && (t = T(t));
        for (var o = 0, a = this.length; a > o; o++) {
            i.push(e = []);
            for (var n = this[o], s = 0, u = n.length; u > s; s++)(r = n[s]) && t.call(r, r.__data__, s) && e.push(r);
        }
        return ra(i, this.id);
    }, Dc.tween = function(t, e) {
        var n = this.id;
        return arguments.length < 2 ? this.node().__transition__[n].tween.get(t) : C(this, null == e ? function(e) { e.__transition__[n].tween.remove(t); } : function(r) { r.__transition__[n].tween.set(t, e); });
    }, Dc.attr = function(t, e) {

        function n() { this.removeAttribute(s); }

        function r() { this.removeAttributeNS(s.space, s.local); }

        function i(t) {
            return null == t ? n : (t += "", function() {
                var e, n = this.getAttribute(s);
                return n !== t && (e = a(n, t), function(t) { this.setAttribute(s, e(t)); });
            });
        }

        function o(t) {
            return null == t ? r : (t += "", function() {
                var e, n = this.getAttributeNS(s.space, s.local);
                return n !== t && (e = a(n, t), function(t) { this.setAttributeNS(s.space, s.local, e(t)); });
            });
        }

        if (arguments.length < 2) {
            for (e in t)this.attr(e, t[e]);
            return this;
        }
        var a = "transform" == t ? ni : Lr, s = Xa.ns.qualify(t);
        return ia(this, "attr." + t, e, s.local ? o : i);
    }, Dc.attrTween = function(t, e) {

        function n(t, n) {
            var r = e.call(this, t, n, this.getAttribute(i));
            return r && function(t) { this.setAttribute(i, r(t)); };
        }

        function r(t, n) {
            var r = e.call(this, t, n, this.getAttributeNS(i.space, i.local));
            return r && function(t) { this.setAttributeNS(i.space, i.local, r(t)); };
        }

        var i = Xa.ns.qualify(t);
        return this.tween("attr." + t, i.local ? r : n);
    }, Dc.style = function(t, e, n) {

        function r() { this.style.removeProperty(t); }

        function i(e) {
            return null == e ? r : (e += "", function() {
                var r, i = Qa.getComputedStyle(this, null).getPropertyValue(t);
                return i !== e && (r = Lr(i, e), function(e) { this.style.setProperty(t, r(e), n); });
            });
        }

        var o = arguments.length;
        if (3 > o) {
            if ("string" != typeof t) {
                2 > o && (e = "");
                for (n in t)this.style(n, t[n], e);
                return this;
            }
            n = "";
        }
        return ia(this, "style." + t, e, i);
    }, Dc.styleTween = function(t, e, n) {

        function r(r, i) {
            var o = e.call(this, r, i, Qa.getComputedStyle(this, null).getPropertyValue(t));
            return o && function(e) { this.style.setProperty(t, o(e), n); };
        }

        return arguments.length < 3 && (n = ""), this.tween("style." + t, r);
    }, Dc.text = function(t) { return ia(this, "text", t, oa); }, Dc.remove = function() {
        return this.each("end.transition", function() {
            var t;
            this.__transition__.count < 2 && (t = this.parentNode) && t.removeChild(this);
        });
    }, Dc.ease = function(t) {
        var e = this.id;
        return arguments.length < 1 ? this.node().__transition__[e].ease : ("function" != typeof t && (t = Xa.ease.apply(Xa, arguments)), C(this, function(n) { n.__transition__[e].ease = t; }));
    }, Dc.delay = function(t) {
        var e = this.id;
        return C(this, "function" == typeof t ? function(n, r, i) { n.__transition__[e].delay = +t.call(n, n.__data__, r, i); } : (t = +t, function(n) { n.__transition__[e].delay = t; }));
    }, Dc.duration = function(t) {
        var e = this.id;
        return C(this, "function" == typeof t ? function(n, r, i) { n.__transition__[e].duration = Math.max(1, t.call(n, n.__data__, r, i)); } : (t = Math.max(1, t), function(n) { n.__transition__[e].duration = t; }));
    }, Dc.each = function(t, e) {
        var n = this.id;
        if (arguments.length < 2) {
            var r = Tc, i = Sc;
            Sc = n, C(this, function(e, r, i) { Tc = e.__transition__[n], t.call(e, e.__data__, r, i); }), Tc = r, Sc = i;
        } else
            C(this, function(r) {
                var i = r.__transition__[n];
                (i.event || (i.event = Xa.dispatch("start", "end"))).on(t, e);
            });
        return this;
    }, Dc.transition = function() {
        for (var t, e, n, r, i = this.id, o = ++$c, a = [], s = 0, u = this.length; u > s; s++) {
            a.push(t = []);
            for (var e = this[s], c = 0, l = e.length; l > c; c++)(n = e[c]) && (r = Object.create(n.__transition__[i]), r.delay += r.duration, aa(n, c, o, r)), t.push(n);
        }
        return ra(a, o);
    }, Xa.svg.axis = function() {

        function t(t) {
            t.each(function() {
                var t, c = Xa.select(this), l = this.__chart__ || n, f = this.__chart__ = n.copy(), h = null == u ? f.ticks ? f.ticks.apply(f, s) : f.domain() : u, d = null == e ? f.tickFormat ? f.tickFormat.apply(f, s) : ge : e, p = c.selectAll(".tick").data(h, f), g = p.enter().insert("g", ".domain").attr("class", "tick").style("opacity", Ds), m = Xa.transition(p.exit()).style("opacity", Ds).remove(), v = Xa.transition(p).style("opacity", 1), y = no(f), b = c.selectAll(".domain").data([0]), x = (b.enter().append("path").attr("class", "domain"), Xa.transition(b));
                g.append("line"), g.append("text");
                var w = g.select("line"), _ = v.select("line"), M = p.select("text").text(d), k = g.select("text"), S = v.select("text");
                switch (r) {
                case"bottom":
                    t = sa, w.attr("y2", i), k.attr("y", Math.max(i, 0) + a), _.attr("x2", 0).attr("y2", i), S.attr("x", 0).attr("y", Math.max(i, 0) + a), M.attr("dy", ".71em").style("text-anchor", "middle"), x.attr("d", "M" + y[0] + "," + o + "V0H" + y[1] + "V" + o);
                    break;
                case"top":
                    t = sa, w.attr("y2", -i), k.attr("y", -(Math.max(i, 0) + a)), _.attr("x2", 0).attr("y2", -i), S.attr("x", 0).attr("y", -(Math.max(i, 0) + a)), M.attr("dy", "0em").style("text-anchor", "middle"), x.attr("d", "M" + y[0] + "," + -o + "V0H" + y[1] + "V" + -o);
                    break;
                case"left":
                    t = ua, w.attr("x2", -i), k.attr("x", -(Math.max(i, 0) + a)), _.attr("x2", -i).attr("y2", 0), S.attr("x", -(Math.max(i, 0) + a)).attr("y", 0), M.attr("dy", ".32em").style("text-anchor", "end"), x.attr("d", "M" + -o + "," + y[0] + "H0V" + y[1] + "H" + -o);
                    break;
                case"right":
                    t = ua, w.attr("x2", i), k.attr("x", Math.max(i, 0) + a), _.attr("x2", i).attr("y2", 0), S.attr("x", Math.max(i, 0) + a).attr("y", 0), M.attr("dy", ".32em").style("text-anchor", "start"), x.attr("d", "M" + o + "," + y[0] + "H0V" + y[1] + "H" + o);
                }
                if (f.rangeBand) {
                    var T = f.rangeBand() / 2, E = function(t) { return f(t) + T; };
                    g.call(t, E), v.call(t, E);
                } else g.call(t, l), v.call(t, f), m.call(t, f);
            });
        }

        var e, n = Xa.scale.linear(), r = Ac, i = 6, o = 6, a = 3, s = [10], u = null;
        return t.scale = function(e) { return arguments.length ? (n = e, t) : n; }, t.orient = function(e) { return arguments.length ? (r = e in Nc ? e + "" : Ac, t) : r; }, t.ticks = function() { return arguments.length ? (s = arguments, t) : s; }, t.tickValues = function(e) { return arguments.length ? (u = e, t) : u; }, t.tickFormat = function(n) { return arguments.length ? (e = n, t) : e; }, t.tickSize = function(e) {
            var n = arguments.length;
            return n ? (i = +e, o = +arguments[n - 1], t) : i;
        }, t.innerTickSize = function(e) { return arguments.length ? (i = +e, t) : i; }, t.outerTickSize = function(e) { return arguments.length ? (o = +e, t) : o; }, t.tickPadding = function(e) { return arguments.length ? (a = +e, t) : a; }, t.tickSubdivide = function() { return arguments.length && t; }, t;
    };
    var Ac = "bottom", Nc = { top: 1, right: 1, bottom: 1, left: 1 };
    Xa.svg.brush = function() {

        function t(o) {
            o.each(function() {
                var o = Xa.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", i).on("touchstart.brush", i), a = o.selectAll(".background").data([0]);
                a.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair"), o.selectAll(".extent").data([0]).enter().append("rect").attr("class", "extent").style("cursor", "move");
                var s = o.selectAll(".resize").data(m, ge);
                s.exit().remove(), s.enter().append("g").attr("class", function(t) { return"resize " + t; }).style("cursor", function(t) { return Lc[t]; }).append("rect").attr("x", function(t) { return/[ew]$/.test(t) ? -3 : null; }).attr("y", function(t) { return/^[ns]/.test(t) ? -3 : null; }).attr("width", 6).attr("height", 6).style("visibility", "hidden"), s.style("display", t.empty() ? "none" : null);
                var l, f = Xa.transition(o), h = Xa.transition(a);
                u && (l = no(u), h.attr("x", l[0]).attr("width", l[1] - l[0]), n(f)), c && (l = no(c), h.attr("y", l[0]).attr("height", l[1] - l[0]), r(f)), e(f);
            });
        }

        function e(t) { t.selectAll(".resize").attr("transform", function(t) { return"translate(" + l[+/e$/.test(t)] + "," + h[+/^s/.test(t)] + ")"; }); }

        function n(t) { t.select(".extent").attr("x", l[0]), t.selectAll(".extent,.n>rect,.s>rect").attr("width", l[1] - l[0]); }

        function r(t) { t.select(".extent").attr("y", h[0]), t.selectAll(".extent,.e>rect,.w>rect").attr("height", h[1] - h[0]); }

        function i() {

            function i() { 32 == Xa.event.keyCode && (C || (b = null, $[0] -= l[1], $[1] -= h[1], C = 2), f()); }

            function d() { 32 == Xa.event.keyCode && 2 == C && ($[0] += l[1], $[1] += h[1], C = 0, f()); }

            function m() {
                var t = Xa.mouse(w), i = !1;
                x && (t[0] += x[0], t[1] += x[1]), C || (Xa.event.altKey ? (b || (b = [(l[0] + l[1]) / 2, (h[0] + h[1]) / 2]), $[0] = l[+(t[0] < b[0])], $[1] = h[+(t[1] < b[1])]) : b = null), T && v(t, u, 0) && (n(k), i = !0), E && v(t, c, 1) && (r(k), i = !0), i && (e(k), M({ type: "brush", mode: C ? "move" : "resize" }));
            }

            function v(t, e, n) {
                var r, i, s = no(e), u = s[0], c = s[1], f = $[n], d = n ? h : l, m = d[1] - d[0];
                return C && (u -= f, c -= m + f), r = (n ? g : p) ? Math.max(u, Math.min(c, t[n])) : t[n], C ? i = (r += f) + m : (b && (f = Math.max(u, Math.min(c, 2 * b[n] - r))), r > f ? (i = r, r = f) : i = f), d[0] != r || d[1] != i ? (n ? a = null : o = null, d[0] = r, d[1] = i, !0) : void 0;
            }

            function y() { m(), k.style("pointer-events", "all").selectAll(".resize").style("display", t.empty() ? "none" : null), Xa.select("body").style("cursor", null), A.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null), D(), M({ type: "brushend" }); }

            var b, x, w = this, _ = Xa.select(Xa.event.target), M = s.of(w, arguments), k = Xa.select(w), S = _.datum(), T = !/^(n|s)$/.test(S) && u, E = !/^(e|w)$/.test(S) && c, C = _.classed("extent"), D = O(), $ = Xa.mouse(w), A = Xa.select(Qa).on("keydown.brush", i).on("keyup.brush", d);
            if (Xa.event.changedTouches ? A.on("touchmove.brush", m).on("touchend.brush", y) : A.on("mousemove.brush", m).on("mouseup.brush", y), k.interrupt().selectAll("*").interrupt(), C)$[0] = l[0] - $[0], $[1] = h[0] - $[1];
            else if (S) {
                var N = +/w$/.test(S), L = +/^n/.test(S);
                x = [l[1 - N] - $[0], h[1 - L] - $[1]], $[0] = l[N], $[1] = h[L];
            } else Xa.event.altKey && (b = $.slice());
            k.style("pointer-events", "none").selectAll(".resize").style("display", null), Xa.select("body").style("cursor", _.style("cursor")), M({ type: "brushstart" }), m();
        }

        var o, a, s = d(t, "brushstart", "brush", "brushend"), u = null, c = null, l = [0, 0], h = [0, 0], p = !0, g = !0, m = jc[0];
        return t.event = function(t) {
            t.each(function() {
                var t = s.of(this, arguments), e = { x: l, y: h, i: o, j: a }, n = this.__chart__ || e;
                this.__chart__ = e, Sc ? Xa.select(this).transition().each("start.brush", function() { o = n.i, a = n.j, l = n.x, h = n.y, t({ type: "brushstart" }); }).tween("brush:brush", function() {
                    var n = jr(l, e.x), r = jr(h, e.y);
                    return o = a = null, function(i) { l = e.x = n(i), h = e.y = r(i), t({ type: "brush", mode: "resize" }); };
                }).each("end.brush", function() { o = e.i, a = e.j, t({ type: "brush", mode: "resize" }), t({ type: "brushend" }); }) : (t({ type: "brushstart" }), t({ type: "brush", mode: "resize" }), t({ type: "brushend" }));
            });
        }, t.x = function(e) { return arguments.length ? (u = e, m = jc[!u << 1 | !c], t) : u; }, t.y = function(e) { return arguments.length ? (c = e, m = jc[!u << 1 | !c], t) : c; }, t.clamp = function(e) { return arguments.length ? (u && c ? (p = !!e[0], g = !!e[1]) : u ? p = !!e : c && (g = !!e), t) : u && c ? [p, g] : u ? p : c ? g : null; }, t.extent = function(e) {
            var n, r, i, s, f;
            return arguments.length ? (u && (n = e[0], r = e[1], c && (n = n[0], r = r[0]), o = [n, r], u.invert && (n = u(n), r = u(r)), n > r && (f = n, n = r, r = f), (n != l[0] || r != l[1]) && (l = [n, r])), c && (i = e[0], s = e[1], u && (i = i[1], s = s[1]), a = [i, s], c.invert && (i = c(i), s = c(s)), i > s && (f = i, i = s, s = f), (i != h[0] || s != h[1]) && (h = [i, s])), t) : (u && (o ? (n = o[0], r = o[1]) : (n = l[0], r = l[1], u.invert && (n = u.invert(n), r = u.invert(r)), n > r && (f = n, n = r, r = f))), c && (a ? (i = a[0], s = a[1]) : (i = h[0], s = h[1], c.invert && (i = c.invert(i), s = c.invert(s)), i > s && (f = i, i = s, s = f))), u && c ? [[n, i], [r, s]] : u ? [n, r] : c && [i, s]);
        }, t.clear = function() { return t.empty() || (l = [0, 0], h = [0, 0], o = a = null), t; }, t.empty = function() { return!!u && l[0] == l[1] || !!c && h[0] == h[1]; }, Xa.rebind(t, s, "on");
    };
    var Lc = { n: "ns-resize", e: "ew-resize", s: "ns-resize", w: "ew-resize", nw: "nwse-resize", ne: "nesw-resize", se: "nwse-resize", sw: "nesw-resize" }, jc = [["n", "e", "s", "w", "nw", "ne", "se", "sw"], ["e", "w"], ["n", "s"], []], Oc = Xa.time = {}, Fc = Date, Pc = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    ca.prototype = { getDate: function() { return this._.getUTCDate(); }, getDay: function() { return this._.getUTCDay(); }, getFullYear: function() { return this._.getUTCFullYear(); }, getHours: function() { return this._.getUTCHours(); }, getMilliseconds: function() { return this._.getUTCMilliseconds(); }, getMinutes: function() { return this._.getUTCMinutes(); }, getMonth: function() { return this._.getUTCMonth(); }, getSeconds: function() { return this._.getUTCSeconds(); }, getTime: function() { return this._.getTime(); }, getTimezoneOffset: function() { return 0; }, valueOf: function() { return this._.valueOf(); }, setDate: function() { Rc.setUTCDate.apply(this._, arguments); }, setDay: function() { Rc.setUTCDay.apply(this._, arguments); }, setFullYear: function() { Rc.setUTCFullYear.apply(this._, arguments); }, setHours: function() { Rc.setUTCHours.apply(this._, arguments); }, setMilliseconds: function() { Rc.setUTCMilliseconds.apply(this._, arguments); }, setMinutes: function() { Rc.setUTCMinutes.apply(this._, arguments); }, setMonth: function() { Rc.setUTCMonth.apply(this._, arguments); }, setSeconds: function() { Rc.setUTCSeconds.apply(this._, arguments); }, setTime: function() { Rc.setTime.apply(this._, arguments); } };
    var Rc = Date.prototype, zc = "%a %b %e %X %Y", Ic = "%m/%d/%Y", qc = "%H:%M:%S", Hc = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], Yc = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], Bc = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], Uc = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    Oc.year = la(function(t) { return t = Oc.day(t), t.setMonth(0, 1), t; }, function(t, e) { t.setFullYear(t.getFullYear() + e); }, function(t) { return t.getFullYear(); }), Oc.years = Oc.year.range, Oc.years.utc = Oc.year.utc.range, Oc.day = la(function(t) {
        var e = new Fc(2e3, 0);
        return e.setFullYear(t.getFullYear(), t.getMonth(), t.getDate()), e;
    }, function(t, e) { t.setDate(t.getDate() + e); }, function(t) { return t.getDate() - 1; }), Oc.days = Oc.day.range, Oc.days.utc = Oc.day.utc.range, Oc.dayOfYear = function(t) {
        var e = Oc.year(t);
        return Math.floor((t - e - 6e4 * (t.getTimezoneOffset() - e.getTimezoneOffset())) / 864e5);
    }, Pc.forEach(function(t, e) {
        t = t.toLowerCase(), e = 7 - e;
        var n = Oc[t] = la(function(t) { return(t = Oc.day(t)).setDate(t.getDate() - (t.getDay() + e) % 7), t; }, function(t, e) { t.setDate(t.getDate() + 7 * Math.floor(e)); }, function(t) {
            var n = Oc.year(t).getDay();
            return Math.floor((Oc.dayOfYear(t) + (n + e) % 7) / 7) - (n !== e);
        });
        Oc[t + "s"] = n.range, Oc[t + "s"].utc = n.utc.range, Oc[t + "OfYear"] = function(t) {
            var n = Oc.year(t).getDay();
            return Math.floor((Oc.dayOfYear(t) + (n + e) % 7) / 7);
        };
    }), Oc.week = Oc.sunday, Oc.weeks = Oc.sunday.range, Oc.weeks.utc = Oc.sunday.utc.range, Oc.weekOfYear = Oc.sundayOfYear, Oc.format = ha;
    var Wc = pa(Hc), Vc = ga(Hc), Xc = pa(Yc), Zc = ga(Yc), Gc = pa(Bc), Kc = ga(Bc), Jc = pa(Uc), Qc = ga(Uc), tl = /^%/, el = { "-": "", _: " ", 0: "0" }, nl = { a: function(t) { return Yc[t.getDay()]; }, A: function(t) { return Hc[t.getDay()]; }, b: function(t) { return Uc[t.getMonth()]; }, B: function(t) { return Bc[t.getMonth()]; }, c: ha(zc), d: function(t, e) { return ma(t.getDate(), e, 2); }, e: function(t, e) { return ma(t.getDate(), e, 2); }, H: function(t, e) { return ma(t.getHours(), e, 2); }, I: function(t, e) { return ma(t.getHours() % 12 || 12, e, 2); }, j: function(t, e) { return ma(1 + Oc.dayOfYear(t), e, 3); }, L: function(t, e) { return ma(t.getMilliseconds(), e, 3); }, m: function(t, e) { return ma(t.getMonth() + 1, e, 2); }, M: function(t, e) { return ma(t.getMinutes(), e, 2); }, p: function(t) { return t.getHours() >= 12 ? "PM" : "AM"; }, S: function(t, e) { return ma(t.getSeconds(), e, 2); }, U: function(t, e) { return ma(Oc.sundayOfYear(t), e, 2); }, w: function(t) { return t.getDay(); }, W: function(t, e) { return ma(Oc.mondayOfYear(t), e, 2); }, x: ha(Ic), X: ha(qc), y: function(t, e) { return ma(t.getFullYear() % 100, e, 2); }, Y: function(t, e) { return ma(t.getFullYear() % 1e4, e, 4); }, Z: za, "%": function() { return"%"; } }, rl = { a: va, A: ya, b: _a, B: Ma, c: ka, d: Na, e: Na, H: ja, I: ja, j: La, L: Pa, m: Aa, M: Oa, p: Ra, S: Fa, U: xa, w: ba, W: wa, x: Sa, X: Ta, y: Ca, Y: Ea, Z: Da, "%": Ia }, il = /^\s*\d+/, ol = Xa.map({ am: 0, pm: 1 });
    ha.utc = qa;
    var al = qa("%Y-%m-%dT%H:%M:%S.%LZ");
    ha.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? Ha : al, Ha.parse = function(t) {
        var e = new Date(t);
        return isNaN(e) ? null : e;
    }, Ha.toString = al.toString, Oc.second = la(function(t) { return new Fc(1e3 * Math.floor(t / 1e3)); }, function(t, e) { t.setTime(t.getTime() + 1e3 * Math.floor(e)); }, function(t) { return t.getSeconds(); }), Oc.seconds = Oc.second.range, Oc.seconds.utc = Oc.second.utc.range, Oc.minute = la(function(t) { return new Fc(6e4 * Math.floor(t / 6e4)); }, function(t, e) { t.setTime(t.getTime() + 6e4 * Math.floor(e)); }, function(t) { return t.getMinutes(); }), Oc.minutes = Oc.minute.range, Oc.minutes.utc = Oc.minute.utc.range, Oc.hour = la(function(t) {
        var e = t.getTimezoneOffset() / 60;
        return new Fc(36e5 * (Math.floor(t / 36e5 - e) + e));
    }, function(t, e) { t.setTime(t.getTime() + 36e5 * Math.floor(e)); }, function(t) { return t.getHours(); }), Oc.hours = Oc.hour.range, Oc.hours.utc = Oc.hour.utc.range, Oc.month = la(function(t) { return t = Oc.day(t), t.setDate(1), t; }, function(t, e) { t.setMonth(t.getMonth() + e); }, function(t) { return t.getMonth(); }), Oc.months = Oc.month.range, Oc.months.utc = Oc.month.utc.range;
    var sl = [1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6], ul = [[Oc.second, 1], [Oc.second, 5], [Oc.second, 15], [Oc.second, 30], [Oc.minute, 1], [Oc.minute, 5], [Oc.minute, 15], [Oc.minute, 30], [Oc.hour, 1], [Oc.hour, 3], [Oc.hour, 6], [Oc.hour, 12], [Oc.day, 1], [Oc.day, 2], [Oc.week, 1], [Oc.month, 1], [Oc.month, 3], [Oc.year, 1]], cl = [[ha("%Y"), Be], [ha("%B"), function(t) { return t.getMonth(); }], [ha("%b %d"), function(t) { return 1 != t.getDate(); }], [ha("%a %d"), function(t) { return t.getDay() && 1 != t.getDate(); }], [ha("%I %p"), function(t) { return t.getHours(); }], [ha("%I:%M"), function(t) { return t.getMinutes(); }], [ha(":%S"), function(t) { return t.getSeconds(); }], [ha(".%L"), function(t) { return t.getMilliseconds(); }]], ll = Ua(cl);
    ul.year = Oc.year, Oc.scale = function() { return Ya(Xa.scale.linear(), ul, ll); };
    var fl = { range: function(t, e, n) { return Xa.range(+t, +e, n).map(Ba); } }, hl = ul.map(function(t) { return[t[0].utc, t[1]]; }), dl = [[qa("%Y"), Be], [qa("%B"), function(t) { return t.getUTCMonth(); }], [qa("%b %d"), function(t) { return 1 != t.getUTCDate(); }], [qa("%a %d"), function(t) { return t.getUTCDay() && 1 != t.getUTCDate(); }], [qa("%I %p"), function(t) { return t.getUTCHours(); }], [qa("%I:%M"), function(t) { return t.getUTCMinutes(); }], [qa(":%S"), function(t) { return t.getUTCSeconds(); }], [qa(".%L"), function(t) { return t.getUTCMilliseconds(); }]], pl = Ua(dl);
    return hl.year = Oc.year.utc, Oc.scale.utc = function() { return Ya(Xa.scale.linear(), hl, pl); }, Xa.text = me(function(t) { return t.responseText; }), Xa.json = function(t, e) { return ve(t, "application/json", Wa, e); }, Xa.html = function(t, e) { return ve(t, "text/html", Va, e); }, Xa.xml = me(function(t) { return t.responseXML; }), Xa;
}(), d3.tip = function() {

    function t(t) { b = d(t), x = b.createSVGPoint(), document.body.appendChild(y); }

    function e() { return"n"; }

    function n() { return[0, 0]; }

    function r() { return" "; }

    function i() {
        var t = p();
        return{ top: t.n.y - y.offsetHeight, left: t.n.x - y.offsetWidth / 2 };
    }

    function o() {
        var t = p();
        return{ top: t.s.y, left: t.s.x - y.offsetWidth / 2 };
    }

    function a() {
        var t = p();
        return{ top: t.e.y - y.offsetHeight / 2, left: t.e.x };
    }

    function s() {
        var t = p();
        return{ top: t.w.y - y.offsetHeight / 2, left: t.w.x - y.offsetWidth };
    }

    function u() {
        var t = p();
        return{ top: t.nw.y - y.offsetHeight, left: t.nw.x - y.offsetWidth };
    }

    function c() {
        var t = p();
        return{ top: t.ne.y - y.offsetHeight, left: t.ne.x };
    }

    function l() {
        var t = p();
        return{ top: t.sw.y, left: t.sw.x - y.offsetWidth };
    }

    function f() {
        var t = p();
        return{ top: t.se.y, left: t.e.x };
    }

    function h() {
        var t = d3.select(document.createElement("div"));
        return t.style({ position: "absolute", opacity: 0, pointerEvents: "none", boxSizing: "border-box" }), t.node();
    }

    function d(t) { return t = t.node(), "svg" == t.tagName.toLowerCase() ? t : t.ownerSVGElement; }

    function p() {
        var t = w || d3.event.target, e = {}, n = t.getScreenCTM(), r = t.getBBox(), i = r.width, o = r.height, a = r.x, s = r.y, u = document.documentElement.scrollTop || document.body.scrollTop, c = document.documentElement.scrollLeft || document.body.scrollLeft;
        return x.x = a + c, x.y = s + u, e.nw = x.matrixTransform(n), x.x += i, e.ne = x.matrixTransform(n), x.y += o, e.se = x.matrixTransform(n), x.x -= i, e.sw = x.matrixTransform(n), x.y -= o / 2, e.w = x.matrixTransform(n), x.x += i, e.e = x.matrixTransform(n), x.x -= i / 2, x.y -= o / 2, e.n = x.matrixTransform(n), x.y += o, e.s = x.matrixTransform(n), e;
    }

    var g = e, m = n, v = r, y = h(), b = null, x = null, w = null;
    t.show = function() {
        var e = Array.prototype.slice.call(arguments);
        e[e.length - 1] instanceof SVGElement && (w = e.pop());
        var n, r = v.apply(this, e), i = m.apply(this, e), o = g.apply(this, e), a = d3.select(y), s = 0;
        for (a.html(r).style({ opacity: 1, "pointer-events": "all" }); s--;)a.classed(M[s], !1);
        return n = _.get(o).apply(this), a.classed(o, !0).style({ top: n.top + i[0] + "px", left: n.left + i[1] + "px" }), t;
    }, t.hide = function() { return nodel = d3.select(y), nodel.style({ opacity: 0, "pointer-events": "none" }), t; }, t.attr = function(e) {
        if (arguments.length < 2 && "string" == typeof e)return d3.select(y).attr(e);
        var n = Array.prototype.slice.call(arguments);
        return d3.selection.prototype.attr.apply(d3.select(y), n), t;
    }, t.style = function(e) {
        if (arguments.length < 2 && "string" == typeof e)return d3.select(y).style(e);
        var n = Array.prototype.slice.call(arguments);
        return d3.selection.prototype.style.apply(d3.select(y), n), t;
    }, t.direction = function(e) { return arguments.length ? (g = null == e ? e : d3.functor(e), t) : g; }, t.offset = function(e) { return arguments.length ? (m = null == e ? e : d3.functor(e), t) : m; }, t.html = function(e) { return arguments.length ? (v = null == e ? e : d3.functor(e), t) : v; };
    var _ = d3.map({ n: i, s: o, e: a, w: s, nw: u, ne: c, sw: l, se: f }), M = _.keys();
    return t;
}, FastClick.prototype.deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0, FastClick.prototype.deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent), FastClick.prototype.deviceIsIOS4 = FastClick.prototype.deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent), FastClick.prototype.deviceIsIOSWithBadTarget = FastClick.prototype.deviceIsIOS && /OS ([6-9]|\d{2})_\d/.test(navigator.userAgent), FastClick.prototype.needsClick = function(t) {
    "use strict";
    switch (t.nodeName.toLowerCase()) {
    case"button":
    case"select":
    case"textarea":
        if (t.disabled)return!0;
        break;
    case"input":
        if (this.deviceIsIOS && "file" === t.type || t.disabled)return!0;
        break;
    case"label":
    case"video":
        return!0;
    }
    return/\bneedsclick\b/.test(t.className);
}, FastClick.prototype.needsFocus = function(t) {
    "use strict";
    switch (t.nodeName.toLowerCase()) {
    case"textarea":
    case"select":
        return!0;
    case"input":
        switch (t.type) {
        case"button":
        case"checkbox":
        case"file":
        case"image":
        case"radio":
        case"submit":
            return!1;
        }
        return!t.disabled && !t.readOnly;
    default:
        return/\bneedsfocus\b/.test(t.className);
    }
}, FastClick.prototype.sendClick = function(t, e) {
    "use strict";
    var n, r;
    document.activeElement && document.activeElement !== t && document.activeElement.blur(), r = e.changedTouches[0], n = document.createEvent("MouseEvents"), n.initMouseEvent("click", !0, !0, window, 1, r.screenX, r.screenY, r.clientX, r.clientY, !1, !1, !1, !1, 0, null), n.forwardedTouchEvent = !0, t.dispatchEvent(n);
}, FastClick.prototype.focus = function(t) {
    "use strict";
    var e;
    this.deviceIsIOS && t.setSelectionRange ? (e = t.value.length, t.setSelectionRange(e, e)) : t.focus();
}, FastClick.prototype.updateScrollParent = function(t) {
    "use strict";
    var e, n;
    if (e = t.fastClickScrollParent, !e || !e.contains(t)) {
        n = t;
        do {
            if (n.scrollHeight > n.offsetHeight) {
                e = n, t.fastClickScrollParent = n;
                break;
            }
            n = n.parentElement;
        } while (n);
    }
    e && (e.fastClickLastScrollTop = e.scrollTop);
}, FastClick.prototype.getTargetElementFromEventTarget = function(t) {
    "use strict";
    return t.nodeType === Node.TEXT_NODE ? t.parentNode : t;
}, FastClick.prototype.onTouchStart = function(t) {
    "use strict";
    var e, n, r;
    if (t.targetTouches.length > 1)return!0;
    if (e = this.getTargetElementFromEventTarget(t.target), n = t.targetTouches[0], this.deviceIsIOS) {
        if (r = window.getSelection(), r.rangeCount && !r.isCollapsed)return!0;
        if (!this.deviceIsIOS4) {
            if (n.identifier === this.lastTouchIdentifier)return t.preventDefault(), !1;
            this.lastTouchIdentifier = n.identifier, this.updateScrollParent(e);
        }
    }
    return this.trackingClick = !0, this.trackingClickStart = t.timeStamp, this.targetElement = e, this.touchStartX = n.pageX, this.touchStartY = n.pageY, t.timeStamp - this.lastClickTime < 200 && t.preventDefault(), !0;
}, FastClick.prototype.touchHasMoved = function(t) {
    "use strict";
    var e = t.changedTouches[0], n = this.touchBoundary;
    return Math.abs(e.pageX - this.touchStartX) > n || Math.abs(e.pageY - this.touchStartY) > n ? !0 : !1;
}, FastClick.prototype.onTouchMove = function(t) {
    "use strict";
    return this.trackingClick ? ((this.targetElement !== this.getTargetElementFromEventTarget(t.target) || this.touchHasMoved(t)) && (this.trackingClick = !1, this.targetElement = null), !0) : !0;
}, FastClick.prototype.findControl = function(t) {
    "use strict";
    return void 0 !== t.control ? t.control : t.htmlFor ? document.getElementById(t.htmlFor) : t.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
}, FastClick.prototype.onTouchEnd = function(t) {
    "use strict";
    var e, n, r, i, o, a = this.targetElement;
    if (!this.trackingClick)return!0;
    if (t.timeStamp - this.lastClickTime < 200)return this.cancelNextClick = !0, !0;
    if (this.lastClickTime = t.timeStamp, n = this.trackingClickStart, this.trackingClick = !1, this.trackingClickStart = 0, this.deviceIsIOSWithBadTarget && (o = t.changedTouches[0], a = document.elementFromPoint(o.pageX - window.pageXOffset, o.pageY - window.pageYOffset) || a, a.fastClickScrollParent = this.targetElement.fastClickScrollParent), r = a.tagName.toLowerCase(), "label" === r) {
        if (e = this.findControl(a)) {
            if (this.focus(a), this.deviceIsAndroid)return!1;
            a = e;
        }
    } else if (this.needsFocus(a))return t.timeStamp - n > 100 || this.deviceIsIOS && window.top !== window && "input" === r ? (this.targetElement = null, !1) : (this.focus(a), this.deviceIsIOS4 && "select" === r || (this.targetElement = null, t.preventDefault()), !1);
    return this.deviceIsIOS && !this.deviceIsIOS4 && (i = a.fastClickScrollParent, i && i.fastClickLastScrollTop !== i.scrollTop) ? !0 : (this.needsClick(a) || (t.preventDefault(), this.sendClick(a, t)), !1);
}, FastClick.prototype.onTouchCancel = function() {
    "use strict";
    this.trackingClick = !1, this.targetElement = null;
}, FastClick.prototype.onMouse = function(t) {
    "use strict";
    return this.targetElement ? t.forwardedTouchEvent ? !0 : t.cancelable ? !this.needsClick(this.targetElement) || this.cancelNextClick ? (t.stopImmediatePropagation ? t.stopImmediatePropagation() : t.propagationStopped = !0, t.stopPropagation(), t.preventDefault(), !1) : !0 : !0 : !0;
}, FastClick.prototype.onClick = function(t) {
    "use strict";
    var e;
    return this.trackingClick ? (this.targetElement = null, this.trackingClick = !1, !0) : "submit" === t.target.type && 0 === t.detail ? !0 : (e = this.onMouse(t), e || (this.targetElement = null), e);
}, FastClick.prototype.destroy = function() {
    "use strict";
    var t = this.layer;
    this.deviceIsAndroid && (t.removeEventListener("mouseover", this.onMouse, !0), t.removeEventListener("mousedown", this.onMouse, !0), t.removeEventListener("mouseup", this.onMouse, !0)), t.removeEventListener("click", this.onClick, !0), t.removeEventListener("touchstart", this.onTouchStart, !1), t.removeEventListener("touchmove", this.onTouchMove, !1), t.removeEventListener("touchend", this.onTouchEnd, !1), t.removeEventListener("touchcancel", this.onTouchCancel, !1);
}, FastClick.notNeeded = function(t) {
    "use strict";
    var e;
    if ("undefined" == typeof window.ontouchstart)return!0;
    if (/Chrome\/[0-9]+/.test(navigator.userAgent)) {
        if (!FastClick.prototype.deviceIsAndroid)return!0;
        if (e = document.querySelector("meta[name=viewport]"), e && -1 !== e.content.indexOf("user-scalable=no"))return!0;
    }
    return"none" === t.style.msTouchAction ? !0 : !1;
}, FastClick.attach = function(t) {
    "use strict";
    return new FastClick(t);
}, "undefined" != typeof define && define.amd ? define(function() {
    "use strict";
    return FastClick;
}) : "undefined" != typeof module && module.exports ? (module.exports = FastClick.attach, module.exports.FastClick = FastClick) : window.FastClick = FastClick, function(t) {

    function e(t, e) { return function(n) { return u(t.call(this, n), e); }; }

    function n(t, e) { return function(n) { return this.lang().ordinal(t.call(this, n), e); }; }

    function r() {}

    function i(t) { a(this, t); }

    function o(t) {
        var e = t.years || t.year || t.y || 0, n = t.months || t.month || t.M || 0, r = t.weeks || t.week || t.w || 0, i = t.days || t.day || t.d || 0, o = t.hours || t.hour || t.h || 0, a = t.minutes || t.minute || t.m || 0, s = t.seconds || t.second || t.s || 0, u = t.milliseconds || t.millisecond || t.ms || 0;
        this._input = t, this._milliseconds = u + 1e3 * s + 6e4 * a + 36e5 * o, this._days = i + 7 * r, this._months = n + 12 * e, this._data = {}, this._bubble();
    }

    function a(t, e) {
        for (var n in e)e.hasOwnProperty(n) && (t[n] = e[n]);
        return t;
    }

    function s(t) { return 0 > t ? Math.ceil(t) : Math.floor(t); }

    function u(t, e) {
        for (var n = t + ""; n.length < e;)n = "0" + n;
        return n;
    }

    function c(t, e, n, r) {
        var i, o, a = e._milliseconds, s = e._days, u = e._months;
        a && t._d.setTime(+t._d + a * n), (s || u) && (i = t.minute(), o = t.hour()), s && t.date(t.date() + s * n), u && t.month(t.month() + u * n), a && !r && L.updateOffset(t), (s || u) && (t.minute(i), t.hour(o));
    }

    function l(t) { return"[object Array]" === Object.prototype.toString.call(t); }

    function f(t, e) {
        var n, r = Math.min(t.length, e.length), i = Math.abs(t.length - e.length), o = 0;
        for (n = 0; r > n; n++)~~t[n] !== ~~e[n] && o++;
        return o + i;
    }

    function h(t) { return t ? ie[t] || t.toLowerCase().replace(/(.)s$/, "$1") : t; }

    function d(t, e) { return e.abbr = t, P[t] || (P[t] = new r), P[t].set(e), P[t]; }

    function p(t) {
        if (!t)return L.fn._lang;
        if (!P[t] && R)
            try {
                require("./lang/" + t);
            } catch (e) {
                return L.fn._lang;
            }
        return P[t];
    }

    function g(t) { return t.match(/\[.*\]/) ? t.replace(/^\[|\]$/g, "") : t.replace(/\\/g, ""); }

    function m(t) {
        var e, n, r = t.match(q);
        for (e = 0, n = r.length; n > e; e++)r[e] = ue[r[e]] ? ue[r[e]] : g(r[e]);
        return function(i) {
            var o = "";
            for (e = 0; n > e; e++)o += r[e] instanceof Function ? r[e].call(i, t) : r[e];
            return o;
        };
    }

    function v(t, e) {

        function n(e) { return t.lang().longDateFormat(e) || e; }

        for (var r = 5; r-- && H.test(e);)e = e.replace(H, n);
        return oe[e] || (oe[e] = m(e)), oe[e](t);
    }

    function y(t, e) {
        switch (t) {
        case"DDDD":
            return U;
        case"YYYY":
            return W;
        case"YYYYY":
            return V;
        case"S":
        case"SS":
        case"SSS":
        case"DDD":
            return B;
        case"MMM":
        case"MMMM":
        case"dd":
        case"ddd":
        case"dddd":
            return X;
        case"a":
        case"A":
            return p(e._l)._meridiemParse;
        case"X":
            return K;
        case"Z":
        case"ZZ":
            return Z;
        case"T":
            return G;
        case"MM":
        case"DD":
        case"YY":
        case"HH":
        case"hh":
        case"mm":
        case"ss":
        case"M":
        case"D":
        case"d":
        case"H":
        case"h":
        case"m":
        case"s":
            return Y;
        default:
            return new RegExp(t.replace("\\", ""));
        }
    }

    function b(t) {
        var e = (Z.exec(t) || [])[0], n = (e + "").match(ee) || ["-", 0, 0], r = +(60 * n[1]) + ~~n[2];
        return"+" === n[0] ? -r : r;
    }

    function x(t, e, n) {
        var r, i = n._a;
        switch (t) {
        case"M":
        case"MM":
            i[1] = null == e ? 0 : ~~e - 1;
            break;
        case"MMM":
        case"MMMM":
            r = p(n._l).monthsParse(e), null != r ? i[1] = r : n._isValid = !1;
            break;
        case"D":
        case"DD":
        case"DDD":
        case"DDDD":
            null != e && (i[2] = ~~e);
            break;
        case"YY":
            i[0] = ~~e + (~~e > 68 ? 1900 : 2e3);
            break;
        case"YYYY":
        case"YYYYY":
            i[0] = ~~e;
            break;
        case"a":
        case"A":
            n._isPm = p(n._l).isPM(e);
            break;
        case"H":
        case"HH":
        case"h":
        case"hh":
            i[3] = ~~e;
            break;
        case"m":
        case"mm":
            i[4] = ~~e;
            break;
        case"s":
        case"ss":
            i[5] = ~~e;
            break;
        case"S":
        case"SS":
        case"SSS":
            i[6] = ~~(1e3 * ("0." + e));
            break;
        case"X":
            n._d = new Date(1e3 * parseFloat(e));
            break;
        case"Z":
        case"ZZ":
            n._useUTC = !0, n._tzm = b(e);
        }
        null == e && (n._isValid = !1);
    }

    function w(t) {
        var e, n, r = [];
        if (!t._d) {
            for (e = 0; 7 > e; e++)t._a[e] = r[e] = null == t._a[e] ? 2 === e ? 1 : 0 : t._a[e];
            r[3] += ~~((t._tzm || 0) / 60), r[4] += ~~((t._tzm || 0) % 60), n = new Date(0), t._useUTC ? (n.setUTCFullYear(r[0], r[1], r[2]), n.setUTCHours(r[3], r[4], r[5], r[6])) : (n.setFullYear(r[0], r[1], r[2]), n.setHours(r[3], r[4], r[5], r[6])), t._d = n;
        }
    }

    function _(t) {
        var e, n, r = t._f.match(q), i = t._i;
        for (t._a = [], e = 0; e < r.length; e++)n = (y(r[e], t).exec(i) || [])[0], n && (i = i.slice(i.indexOf(n) + n.length)), ue[r[e]] && x(r[e], n, t);
        i && (t._il = i), t._isPm && t._a[3] < 12 && (t._a[3] += 12), t._isPm === !1 && 12 === t._a[3] && (t._a[3] = 0), w(t);
    }

    function M(t) {
        var e, n, r, o, s, u = 99;
        for (o = 0; o < t._f.length; o++)e = a({}, t), e._f = t._f[o], _(e), n = new i(e), s = f(e._a, n.toArray()), n._il && (s += n._il.length), u > s && (u = s, r = n);
        a(t, r);
    }

    function k(t) {
        var e, n = t._i, r = J.exec(n);
        if (r) {
            for (t._f = "YYYY-MM-DD" + (r[2] || " "), e = 0; 4 > e; e++)
                if (te[e][1].exec(n)) {
                    t._f += te[e][0];
                    break;
                }
            Z.exec(n) && (t._f += " Z"), _(t);
        } else t._d = new Date(n);
    }

    function S(e) {
        var n = e._i, r = z.exec(n);
        n === t ? e._d = new Date : r ? e._d = new Date(+r[1]) : "string" == typeof n ? k(e) : l(n) ? (e._a = n.slice(0), w(e)) : e._d = n instanceof Date ? new Date(+n) : new Date(n);
    }

    function T(t, e, n, r, i) { return i.relativeTime(e || 1, !!n, t, r); }

    function E(t, e, n) {
        var r = F(Math.abs(t) / 1e3), i = F(r / 60), o = F(i / 60), a = F(o / 24), s = F(a / 365), u = 45 > r && ["s", r] || 1 === i && ["m"] || 45 > i && ["mm", i] || 1 === o && ["h"] || 22 > o && ["hh", o] || 1 === a && ["d"] || 25 >= a && ["dd", a] || 45 >= a && ["M"] || 345 > a && ["MM", F(a / 30)] || 1 === s && ["y"] || ["yy", s];
        return u[2] = e, u[3] = t > 0, u[4] = n, T.apply({}, u);
    }

    function C(t, e, n) {
        var r, i = n - e, o = n - t.day();
        return o > i && (o -= 7), i - 7 > o && (o += 7), r = L(t).add("d", o), { week: Math.ceil(r.dayOfYear() / 7), year: r.year() };
    }

    function D(t) {
        var e = t._i, n = t._f;
        return null === e || "" === e ? null : ("string" == typeof e && (t._i = e = p().preparse(e)), L.isMoment(e) ? (t = a({}, e), t._d = new Date(+e._d)) : n ? l(n) ? M(t) : _(t) : S(t), new i(t));
    }

    function $(t, e) {
        L.fn[t] = L.fn[t + "s"] = function(t) {
            var n = this._isUTC ? "UTC" : "";
            return null != t ? (this._d["set" + n + e](t), L.updateOffset(this), this) : this._d["get" + n + e]();
        };
    }

    function A(t) { L.duration.fn[t] = function() { return this._data[t]; }; }

    function N(t, e) {
        L.duration.fn["as" + t] = function() {
            return+this / e;
        };
    }

    for (var L,
             j,
             O = "2.1.0",
             F = Math.round,
             P = {},
             R = "undefined" != typeof module && module.exports,
             z = /^\/?Date\((\-?\d+)/i,
             I = /(\-)?(\d*)?\.?(\d+)\:(\d+)\:(\d+)\.?(\d{3})?/,
             q = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|SS?S?|X|zz?|ZZ?|.)/g,
             H = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,
             Y = /\d\d?/,
             B = /\d{1,3}/,
             U = /\d{3}/,
             W = /\d{1,4}/,
             V = /[+\-]?\d{1,6}/,
             X = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
             Z = /Z|[\+\-]\d\d:?\d\d/i,
             G = /T/i,
             K = /[\+\-]?\d+(\.\d{1,3})?/,
             J = /^\s*\d{4}-\d\d-\d\d((T| )(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
             Q = "YYYY-MM-DDTHH:mm:ssZ",
             te = [["HH:mm:ss.S", /(T| )\d\d:\d\d:\d\d\.\d{1,3}/], ["HH:mm:ss", /(T| )\d\d:\d\d:\d\d/], ["HH:mm", /(T| )\d\d:\d\d/], ["HH", /(T| )\d\d/]],
             ee = /([\+\-]|\d\d)/gi,
             ne = "Date|Hours|Minutes|Seconds|Milliseconds".split("|"),
             re = { Milliseconds: 1, Seconds: 1e3, Minutes: 6e4, Hours: 36e5, Days: 864e5, Months: 2592e6, Years: 31536e6 },
             ie = { ms: "millisecond", s: "second", m: "minute", h: "hour", d: "day", w: "week", M: "month", y: "year" },
             oe = {},
             ae = "DDD w W M D d".split(" "),
             se = "M D H h m s w W".split(" "),
             ue = {
                 M: function() { return this.month() + 1; },
                 MMM: function(t) { return this.lang().monthsShort(this, t); },
                 MMMM: function(t) { return this.lang().months(this, t); },
                 D: function() { return this.date(); },
                 DDD: function() { return this.dayOfYear(); },
                 d: function() { return this.day(); },
                 dd: function(t) { return this.lang().weekdaysMin(this, t); },
                 ddd: function(t) { return this.lang().weekdaysShort(this, t); },
                 dddd: function(t) { return this.lang().weekdays(this, t); },
                 w: function() { return this.week(); },
                 W: function() { return this.isoWeek(); },
                 YY: function() { return u(this.year() % 100, 2); },
                 YYYY: function() { return u(this.year(), 4); },
                 YYYYY: function() { return u(this.year(), 5); },
                 gg: function() { return u(this.weekYear() % 100, 2); },
                 gggg: function() { return this.weekYear(); },
                 ggggg: function() { return u(this.weekYear(), 5); },
                 GG: function() { return u(this.isoWeekYear() % 100, 2); },
                 GGGG: function() { return this.isoWeekYear(); },
                 GGGGG: function() { return u(this.isoWeekYear(), 5); },
                 e: function() { return this.weekday(); },
                 E: function() { return this.isoWeekday(); },
                 a: function() { return this.lang().meridiem(this.hours(), this.minutes(), !0); },
                 A: function() { return this.lang().meridiem(this.hours(), this.minutes(), !1); },
                 H: function() { return this.hours(); },
                 h: function() { return this.hours() % 12 || 12; },
                 m: function() { return this.minutes(); },
                 s: function() { return this.seconds(); },
                 S: function() { return~~(this.milliseconds() / 100); },
                 SS: function() { return u(~~(this.milliseconds() / 10), 2); },
                 SSS: function() { return u(this.milliseconds(), 3); },
                 Z: function() {
                     var t = -this.zone(), e = "+";
                     return 0 > t && (t = -t, e = "-"), e + u(~~(t / 60), 2) + ":" + u(~~t % 60, 2);
                 },
                 ZZ: function() {
                     var t = -this.zone(), e = "+";
                     return 0 > t && (t = -t, e = "-"), e + u(~~(10 * t / 6), 4);
                 },
                 z: function() { return this.zoneAbbr(); },
                 zz: function() { return this.zoneName(); },
                 X: function() { return this.unix(); }
             }; ae.length;)j = ae.pop(), ue[j + "o"] = n(ue[j], j);
    for (; se.length;)j = se.pop(), ue[j + j] = e(ue[j], 2);
    for (ue.DDDD = e(ue.DDD, 3), r.prototype = {
        set: function(t) {
            var e, n;
            for (n in t)e = t[n], "function" == typeof e ? this[n] = e : this["_" + n] = e;
        },
        _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months: function(t) { return this._months[t.month()]; },
        _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort: function(t) { return this._monthsShort[t.month()]; },
        monthsParse: function(t) {
            var e, n, r;
            for (this._monthsParse || (this._monthsParse = []), e = 0; 12 > e; e++)if (this._monthsParse[e] || (n = L([2e3, e]), r = "^" + this.months(n, "") + "|^" + this.monthsShort(n, ""), this._monthsParse[e] = new RegExp(r.replace(".", ""), "i")), this._monthsParse[e].test(t))return e;
        },
        _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays: function(t) { return this._weekdays[t.day()]; },
        _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort: function(t) { return this._weekdaysShort[t.day()]; },
        _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin: function(t) { return this._weekdaysMin[t.day()]; },
        weekdaysParse: function(t) {
            var e, n, r;
            for (this._weekdaysParse || (this._weekdaysParse = []), e = 0; 7 > e; e++)if (this._weekdaysParse[e] || (n = L([2e3, 1]).day(e), r = "^" + this.weekdays(n, "") + "|^" + this.weekdaysShort(n, "") + "|^" + this.weekdaysMin(n, ""), this._weekdaysParse[e] = new RegExp(r.replace(".", ""), "i")), this._weekdaysParse[e].test(t))return e;
        },
        _longDateFormat: { LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D YYYY", LLL: "MMMM D YYYY LT", LLLL: "dddd, MMMM D YYYY LT" },
        longDateFormat: function(t) {
            var e = this._longDateFormat[t];
            return!e && this._longDateFormat[t.toUpperCase()] && (e = this._longDateFormat[t.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(t) { return t.slice(1); }), this._longDateFormat[t] = e), e;
        },
        isPM: function(t) { return"p" === (t + "").toLowerCase()[0]; },
        _meridiemParse: /[ap]\.?m?\.?/i,
        meridiem: function(t, e, n) { return t > 11 ? n ? "pm" : "PM" : n ? "am" : "AM"; },
        _calendar: { sameDay: "[Today at] LT", nextDay: "[Tomorrow at] LT", nextWeek: "dddd [at] LT", lastDay: "[Yesterday at] LT", lastWeek: "[Last] dddd [at] LT", sameElse: "L" },
        calendar: function(t, e) {
            var n = this._calendar[t];
            return"function" == typeof n ? n.apply(e) : n;
        },
        _relativeTime: { future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years" },
        relativeTime: function(t, e, n, r) {
            var i = this._relativeTime[n];
            return"function" == typeof i ? i(t, e, n, r) : i.replace(/%d/i, t);
        },
        pastFuture: function(t, e) {
            var n = this._relativeTime[t > 0 ? "future" : "past"];
            return"function" == typeof n ? n(e) : n.replace(/%s/i, e);
        },
        ordinal: function(t) { return this._ordinal.replace("%d", t); },
        _ordinal: "%d",
        preparse: function(t) { return t; },
        postformat: function(t) { return t; },
        week: function(t) { return C(t, this._week.dow, this._week.doy).week; },
        _week: { dow: 0, doy: 6 }
    }, L = function(t, e, n) { return D({ _i: t, _f: e, _l: n, _isUTC: !1 }); }, L.utc = function(t, e, n) { return D({ _useUTC: !0, _isUTC: !0, _l: n, _i: t, _f: e }); }, L.unix = function(t) { return L(1e3 * t); }, L.duration = function(t, e) {
        var n, r, i = L.isDuration(t), a = "number" == typeof t, s = i ? t._input : a ? {} : t, u = I.exec(t);
        return a ? e ? s[e] = t : s.milliseconds = t : u && (n = "-" === u[1] ? -1 : 1, s = { y: 0, d: ~~u[2] * n, h: ~~u[3] * n, m: ~~u[4] * n, s: ~~u[5] * n, ms: ~~u[6] * n }), r = new o(s), i && t.hasOwnProperty("_lang") && (r._lang = t._lang), r;
    }, L.version = O, L.defaultFormat = Q, L.updateOffset = function() {}, L.lang = function(t, e) { return t ? (e ? d(t, e) : P[t] || p(t), L.duration.fn._lang = L.fn._lang = p(t), void 0) : L.fn._lang._abbr; }, L.langData = function(t) { return t && t._lang && t._lang._abbr && (t = t._lang._abbr), p(t); }, L.isMoment = function(t) { return t instanceof i; }, L.isDuration = function(t) { return t instanceof o; }, L.fn = i.prototype = {
        clone: function() { return L(this); },
        valueOf: function() { return+this._d + 6e4 * (this._offset || 0); },
        unix: function() {
            return Math.floor(+this;
            /1e3)},toString:function(){return this.format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")},toDate:function(){return this._offset?new Date(+this):this._d},toISOString:function(){return v(L(this).utc(),"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")},toArray:function(){var t=this;return[t.year(),t.month(),t.date(),t.hours(),t.minutes(),t.seconds(),t.milliseconds()]},isValid:function(){return null==this._isValid&&(this._isValid=this._a?!f(this._a,(this._isUTC?L.utc(this._a):L(this._a)).toArray()):!isNaN(this._d.getTime())),!!this._isValid},utc:function(){return this.zone(0)},local:function(){return this.zone(0),this._isUTC=!1,this},format:function(t){var e=v(this,t||L.defaultFormat);return this.lang().postformat(e)},add:function(t,e){var n;return n="string"==typeof t?L.duration(+e,t):L.duration(t,e),c(this,n,1),this},subtract:function(t,e){var n;return n="string"==typeof t?L.duration(+e,t):L.duration(t,e),c(this,n,-1),this},diff:function(t,e,n){var r,i,o=this._isUTC?L(t).zone(this._offset||0):L(t).local(),a=6e4*(this.zone()-o.zone());return e=h(e),"year"===e||"month"===e?(r=432e5*(this.daysInMonth()+o.daysInMonth()),i=12*(this.year()-o.year())+(this.month()-o.month()),i+=(this-L(this).startOf("month")-(o-L(o).startOf("month")))/r, i -= 6e4 * (this.zone() - L(this).startOf("month").zone() - (o.zone() - L(o).startOf("month").zone())) / r, "year" === e && (i /= 12));:
            (r = this - o, i = "second" === e ? r / 1e3 : "minute" === e ? r / 6e4 : "hour" === e ? r / 36e5 : "day" === e ? (r - a) / 864e5 : "week" === e ? (r - a) / 6048e5 : r), n ? i : s(i);
        },
        from: function(t, e) { return L.duration(this.diff(t)).lang(this.lang()._abbr).humanize(!e); },
        fromNow: function(t) { return this.from(L(), t); },
        calendar: function() {
            var t = this.diff(L().startOf("day"), "days", !0), e = -6 > t ? "sameElse" : -1 > t ? "lastWeek" : 0 > t ? "lastDay" : 1 > t ? "sameDay" : 2 > t ? "nextDay" : 7 > t ? "nextWeek" : "sameElse";
            return this.format(this.lang().calendar(e, this));
        },
        isLeapYear: function() {
            var t = this.year();
            return 0 === t % 4 && 0 !== t % 100 || 0 === t % 400;
        },
        isDST: function() { return this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone(); },
        day: function(t) {
            var e = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return null != t ? "string" == typeof t && (t = this.lang().weekdaysParse(t), "number" != typeof t) ? this : this.add({ d: t - e }) : e;
        },
        month: function(t) {
            var e, n = this._isUTC ? "UTC" : "";
            return null != t ? "string" == typeof t && (t = this.lang().monthsParse(t), "number" != typeof t) ? this : (e = this.date(), this.date(1), this._d["set" + n + "Month"](t), this.date(Math.min(e, this.daysInMonth())), L.updateOffset(this), this) : this._d["get" + n + "Month"]();
        },
        startOf: function(t) {
            switch (t = h(t)) {
            case"year":
                this.month(0);
            case"month":
                this.date(1);
            case"week":
            case"day":
                this.hours(0);
            case"hour":
                this.minutes(0);
            case"minute":
                this.seconds(0);
            case"second":
                this.milliseconds(0);
            }
            return"week" === t && this.weekday(0), this;
        },
        endOf: function(t) { return this.startOf(t).add(t, 1).subtract("ms", 1); },
        isAfter: function(t, e) { return e = "undefined" != typeof e ? e : "millisecond", +this.clone().startOf(e) > +L(t).startOf(e); },
        isBefore: function(t, e) { return e = "undefined" != typeof e ? e : "millisecond", +this.clone().startOf(e) < +L(t).startOf(e); },
        isSame: function(t, e) { return e = "undefined" != typeof e ? e : "millisecond", +this.clone().startOf(e) === +L(t).startOf(e); },
        min: function(t) { return t = L.apply(null, arguments), this > t ? this : t; },
        max: function(t) { return t = L.apply(null, arguments), t > this ? this : t; },
        zone: function(t) {
            var e = this._offset || 0;
            return null == t ? this._isUTC ? e : this._d.getTimezoneOffset() : ("string" == typeof t && (t = b(t)), Math.abs(t) < 16 && (t = 60 * t), this._offset = t, this._isUTC = !0, e !== t && c(this, L.duration(e - t, "m"), 1, !0), this);
        },
        zoneAbbr: function() { return this._isUTC ? "UTC" : ""; },
        zoneName: function() { return this._isUTC ? "Coordinated Universal Time" : ""; },
        daysInMonth: function() { return L.utc([this.year(), this.month() + 1, 0]).date(); },
        dayOfYear: function(t) {
            var e = F((L(this).startOf("day") - L(this).startOf("year")) / 864e5) + 1;
            return null == t ? e : this.add("d", t - e);
        },
        weekYear: function(t) {
            var e = C(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return null == t ? e : this.add("y", t - e);
        },
        isoWeekYear: function(t) {
            var e = C(this, 1, 4).year;
            return null == t ? e : this.add("y", t - e);
        },
        week: function(t) {
            var e = this.lang().week(this);
            return null == t ? e : this.add("d", 7 * (t - e));
        },
        isoWeek: function(t) {
            var e = C(this, 1, 4).week;
            return null == t ? e : this.add("d", 7 * (t - e));
        },
        weekday: function(t) {
            var e = (this._d.getDay() + 7 - this.lang()._week.dow) % 7;
            return null == t ? e : this.add("d", t - e);
        },
        isoWeekday: function(t) { return null == t ? this.day() || 7 : this.day(this.day() % 7 ? t : t - 7); },
        lang: function(e) { return e === t ? this._lang : (this._lang = p(e), this); }
    }, j = 0; j < ne.length; j++)$(ne[j].toLowerCase().replace(/s$/, ""), ne[j]);
    $("year", "FullYear"), L.fn.days = L.fn.day, L.fn.months = L.fn.month, L.fn.weeks = L.fn.week, L.fn.isoWeeks = L.fn.isoWeek, L.fn.toJSON = L.fn.toISOString, L.duration.fn = o.prototype = {
        _bubble: function() {
            var t, e, n, r, i = this._milliseconds, o = this._days, a = this._months, u = this._data;
            u.milliseconds = i % 1e3, t = s(i / 1e3), u.seconds = t % 60, e = s(t / 60), u.minutes = e % 60, n = s(e / 60), u.hours = n % 24, o += s(n / 24), u.days = o % 30, a += s(o / 30), u.months = a % 12, r = s(a / 12), u.years = r;
        },
        weeks: function() { return s(this.days() / 7); },
        valueOf: function() { return this._milliseconds + 864e5 * this._days + 2592e6 * (this._months % 12) + 31536e6 * ~~(this._months / 12); },
        humanize: function(t) {
            var e = +this, n = E(e, !t, this.lang());
            return t && (n = this.lang().pastFuture(e, n)), this.lang().postformat(n);
        },
        add: function(t, e) {
            var n = L.duration(t, e);
            return this._milliseconds += n._milliseconds, this._days += n._days, this._months += n._months, this._bubble(), this;
        },
        subtract: function(t, e) {
            var n = L.duration(t, e);
            return this._milliseconds -= n._milliseconds, this._days -= n._days, this._months -= n._months, this._bubble(), this;
        },
        get: function(t) { return t = h(t), this[t.toLowerCase() + "s"](); },
        as: function(t) { return t = h(t), this["as" + t.charAt(0).toUpperCase() + t.slice(1) + "s"](); },
        lang: L.fn.lang
    };
    for (j in re)re.hasOwnProperty(j) && (N(j, re[j]), A(j.toLowerCase()));
    N("Weeks", 6048e5), L.duration.fn.asMonths = function() { return(+this - 31536e6 * this.years()) / 2592e6 + 12 * this.years(); }, L.lang("en", {
        ordinal: function(t) {
            var e = t % 10, n = 1 === ~~(t % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th";
            return t + n;
        }
    }), R && (module.exports = L), "undefined" == typeof ender && (this.moment = L), "function" == typeof define && define.amd && define("moment", [], function() { return L; });
}.call(this), function() {
    var t, e, n, r, i = [].slice;
    null != window.setImmediate || (null != window.postMessage ? (n = "setImmediate" + Math.random(), t = 0, e = [], r = function(t) {
        var r, i, o, a;
        t.source === window && t.data === n && (a = e.shift()) && (o = a[0], i = a[1], r = a[2], o && i.apply(null, r));
    }, window.addEventListener("message", r, !0), window.setImmediate = function() {
        var r, o, a;
        return o = arguments[0], r = 2 <= arguments.length ? i.call(arguments, 1) : [], a = ++t, e.push([a, o, r]), window.postMessage(n, "*"), a;
    }, window.clearImmediate = function(t) {
        var n, r, i;
        for (r = 0, i = e.length; i > r; r++)n = e[r], n[0] === t && (n[0] = 0);
    }) : (window.setImmediate = function() {
        var t, e;
        return e = arguments[0], t = 2 <= arguments.length ? i.call(arguments, 1) : [], setTimeout(r = function() { return e.apply(null, t); }, 0);
    }, window.clearImmediate = function(t) { return clearInterval(t); }));
}.call(this), function() {
    $.fn.fire = function(t) {
        var e, n, r, i, o, a, s, u;
        return(e = arguments[1]) && ($.isPlainObject(e) ? o = e : $.isArray(e) ? n = e : $.isFunction(e) && (r = e)), (e = arguments[2]) && ($.isArray(e) ? n = e : $.isFunction(e) && (r = e)), (e = arguments[3]) && $.isFunction(e) && (r = e), i = this[0], null == o && (o = {}), null == (s = o.cancelable) && (o.cancelable = !!r), null == (u = o.bubbles) && (o.bubbles = !0), null == n && (n = []), a = function() {
            var e;
            return e = $.Event(t, o), $.event.trigger(e, n, i, !e.bubbles), r && !e.isDefaultPrevented() && r.call(i, e), e;
        }, o.async ? (delete o.async, setImmediate(a), void 0) : a();
    };
}.call(this), function() {
    var t;
    t = /complete|loaded|interactive/, $.readyQueue = function(e) {
        var n, r, i, o, a, s;
        return n = [], i = 0, s = !1, a = function() {
            var t;
            s = !1, t = i, i = n.length, e(n.slice(t));
        }, o = function() { a(), document.removeEventListener("DOMContentLoaded", o, !1); }, r = function(e) { e && n.push(e), s || (t.test(document.readyState) ? setImmediate(a) : document.addEventListener("DOMContentLoaded", o, !1), s = !0); }, { handlers: n, push: r };
    };
}.call(this), function() {
    var t, e, n;
    t = $.readyQueue(function(t) { e($(document.body), t); }), $.pageUpdate = t.push, $.pageUpdate.before = function() {}, $.pageUpdate.beforeEach = function() {}, $.pageUpdate.after = function() {}, $.pageUpdate.afterEach = function() {}, e = function(t, e) {
        var n, r, i;
        for ($.pageUpdate.before.call(t), r = 0, i = e.length; i > r; r++)n = e[r], $.pageUpdate.beforeEach.call(t, n), n.apply(t), $.pageUpdate.afterEach.call(t, n);
        $.pageUpdate.after.call(t);
    }, $.fn.pageUpdate = function() { return e(this, t.handlers), this; }, $(document).on("pjax:end", n = function(t) { return $(t.target).pageUpdate(); });
}.call(this), function() {
    var t,
        e,
        n,
        r,
        i,
        o,
        a,
        s,
        u,
        c,
        l,
        f = [].indexOf || function(t) {
            for (var e = 0, n = this.length; n > e; e++)if (e in this && this[e] === t)return e;
            return-1;
        };
    a = "[ ]", e = "[x]", s = RegExp("^(?:\\s*[-+*]|(?:\\d+\\.))?\\s*(" + e.replace(/([\[\]])/g, "\\$1") + "|" + a.replace(/([\[\]])/g, "\\$1") + ")(?=\\s)"), t = /^`{3}(?:\s*\w+)?[\S\s].*[\S\s]^`{3}$/gm, u = RegExp("^(" + e.replace(/[\[\]]/g, "\\$1") + "|" + a.replace(/[\[\]]/g, "\\$1") + ").+$", "g"), l = function(n, r, i) {
        var o, c, l, h;
        return o = n.replace(/\r/g, "").replace(t, "").replace(u, "").split("\n"), c = 0, h = function() {
            var t, u, h, d;
            for (h = n.split("\n"), d = [], t = 0, u = h.length; u > t; t++)l = h[t], f.call(o, l) >= 0 && l.match(s) && (c += 1, c === r && (l = i ? l.replace(a, e) : l.replace(e, a))), d.push(l);
            return d;
        }(), h.join("\n");
    }, c = function(t) {
        var e, n, r, i;
        return e = t.closest(".js-task-list-container"), n = e.find(".js-task-list-field"), i = 1 + e.find(".task-list-item-checkbox").index(t), r = t.prop("checked"), n.fire("tasklist:change", [i, r], function() { return n.val(l(n.val(), i, r)), n.trigger("change"), n.fire("tasklist:changed", [i, r]); });
    }, $(document).on("change", ".task-list-item-checkbox", function() { return c($(this)); }), i = function(t) { return t.find(".js-task-list-field").length > 0 ? (t.find(".task-list-item").addClass("enabled").find(".task-list-item-checkbox").attr("disabled", null), t.addClass("is-task-list-enabled").trigger("tasklist:enabled")) : void 0; }, o = function(t) {
        var e, n, r, o;
        for (o = [], n = 0, r = t.length; r > n; n++)e = t[n], o.push(i($(e)));
        return o;
    }, n = function(t) { return t.find(".task-list-item").removeClass("enabled").find(".task-list-item-checkbox").attr("disabled", "disabled"), t.removeClass("is-task-list-enabled").trigger("tasklist:disabled"); }, r = function(t) {
        var e, r, i, o;
        for (o = [], r = 0, i = t.length; i > r; r++)e = t[r], o.push(n($(e)));
        return o;
    }, $.fn.taskList = function(t) {
        var e, n;
        return e = $(this).closest(".js-task-list-container"), n = { enable: o, disable: r }, n[t || "enable"](e);
    }, $.pageUpdate(function() { return $(".js-task-list-container.js-task-list-enable").taskList(); });
}.call(this), function() {
    "use strict";
    var t,
        e = function() {
            var t = /\-([a-z])/g, e = function(t, e) { return e.toUpperCase(); };
            return function(n) { return n.replace(t, e); };
        }(),
        n = function(t, n) {
            var r, i, o, a, s, u;
            if (window.getComputedStyle ? r = window.getComputedStyle(t, null).getPropertyValue(n) : (i = e(n), r = t.currentStyle ? t.currentStyle[i] : t.style[i]), "cursor" === n && (!r || "auto" === r))for (o = t.tagName.toLowerCase(), a = ["a"], s = 0, u = a.length; u > s; s++)if (o === a[s])return"pointer";
            return r;
        },
        r = function(t) {
            if (g.prototype._singleton) {
                t || (t = window.event);
                var e;
                this !== window ? e = this : t.target ? e = t.target : t.srcElement && (e = t.srcElement), g.prototype._singleton.setCurrent(e);
            }
        },
        i = function(t, e, n) { t.addEventListener ? t.addEventListener(e, n, !1) : t.attachEvent && t.attachEvent("on" + e, n); },
        o = function(t, e, n) { t.removeEventListener ? t.removeEventListener(e, n, !1) : t.detachEvent && t.detachEvent("on" + e, n); },
        a = function(t, e) {
            if (t.addClass)return t.addClass(e), t;
            if (e && "string" == typeof e) {
                var n = (e || "").split(/\s+/);
                if (1 === t.nodeType)
                    if (t.className) {
                        for (var r = " " + t.className + " ", i = t.className, o = 0, a = n.length; a > o; o++)r.indexOf(" " + n[o] + " ") < 0 && (i += " " + n[o]);
                        t.className = i.replace(/^\s+|\s+$/g, "");
                    } else t.className = e;
            }
            return t;
        },
        s = function(t, e) {
            if (t.removeClass)return t.removeClass(e), t;
            if (e && "string" == typeof e || void 0 === e) {
                var n = (e || "").split(/\s+/);
                if (1 === t.nodeType && t.className)
                    if (e) {
                        for (var r = (" " + t.className + " ").replace(/[\n\t]/g, " "), i = 0, o = n.length; o > i; i++)r = r.replace(" " + n[i] + " ", " ");
                        t.className = r.replace(/^\s+|\s+$/g, "");
                    } else t.className = "";
            }
            return t;
        },
        u = function() {
            var t, e, n, r = 1;
            return"function" == typeof document.body.getBoundingClientRect && (t = document.body.getBoundingClientRect(), e = t.right - t.left, n = document.body.offsetWidth, r = Math.round(100 * (e / n)) / 100), r;
        },
        c = function(t) {
            var e = { left: 0, top: 0, width: 0, height: 0, zIndex: 999999999 }, r = n(t, "z-index");
            if (r && "auto" !== r && (e.zIndex = parseInt(r, 10)), t.getBoundingClientRect) {
                var i, o, a, s = t.getBoundingClientRect();
                "pageXOffset" in window && "pageYOffset" in window ? (i = window.pageXOffset, o = window.pageYOffset) : (a = u(), i = Math.round(document.documentElement.scrollLeft / a), o = Math.round(document.documentElement.scrollTop / a));
                var c = document.documentElement.clientLeft || 0, l = document.documentElement.clientTop || 0;
                e.left = s.left + i - c, e.top = s.top + o - l, e.width = "width" in s ? s.width : s.right - s.left, e.height = "height" in s ? s.height : s.bottom - s.top;
            }
            return e;
        },
        l = function(t, e) {
            var n = !(e && e.useNoCache === !1);
            return n ? (-1 === t.indexOf("?") ? "?" : "&") + "nocache=" + (new Date).getTime() : "";
        },
        f = function(t) {
            var e = [], n = [];
            return t.trustedOrigins && ("string" == typeof t.trustedOrigins ? n.push(t.trustedOrigins) : "object" == typeof t.trustedOrigins && "length" in t.trustedOrigins && (n = n.concat(t.trustedOrigins))), t.trustedDomains && ("string" == typeof t.trustedDomains ? n.push(t.trustedDomains) : "object" == typeof t.trustedDomains && "length" in t.trustedDomains && (n = n.concat(t.trustedDomains))), n.length && e.push("trustedOrigins=" + encodeURIComponent(n.join(","))), "string" == typeof t.amdModuleId && t.amdModuleId && e.push("amdModuleId=" + encodeURIComponent(t.amdModuleId)), "string" == typeof t.cjsModuleId && t.cjsModuleId && e.push("cjsModuleId=" + encodeURIComponent(t.cjsModuleId)), e.join("&");
        },
        h = function(t, e) {
            if (e.indexOf)return e.indexOf(t);
            for (var n = 0, r = e.length; r > n; n++)if (e[n] === t)return n;
            return-1;
        },
        d = function(t) {
            if ("string" == typeof t)throw new TypeError("ZeroClipboard doesn't accept query strings.");
            return t.length ? t : [t];
        },
        p = function(t, e, n, r, i) { i ? window.setTimeout(function() { t.call(e, n, r); }, 0) : t.call(e, n, r); },
        g = function(t, e) {
            if (t && (g.prototype._singleton || this).glue(t), g.prototype._singleton)return g.prototype._singleton;
            g.prototype._singleton = this, this.options = {};
            for (var n in y)this.options[n] = y[n];
            for (var r in e)this.options[r] = e[r];
            this.handlers = {}, g.detectFlashSupport() && w();
        },
        m = [];
    g.prototype.setCurrent = function(e) {
        t = e, this.reposition();
        var r = e.getAttribute("title");
        r && this.setTitle(r);
        var i = this.options.forceHandCursor === !0 || "pointer" === n(e, "cursor");
        return v.call(this, i), this;
    }, g.prototype.setText = function(t) { return t && "" !== t && (this.options.text = t, this.ready() && this.flashBridge.setText(t)), this; }, g.prototype.setTitle = function(t) { return t && "" !== t && this.htmlBridge.setAttribute("title", t), this; }, g.prototype.setSize = function(t, e) { return this.ready() && this.flashBridge.setSize(t, e), this; }, g.prototype.setHandCursor = function(t) { return t = "boolean" == typeof t ? t : !!t, v.call(this, t), this.options.forceHandCursor = t, this; };
    var v = function(t) { this.ready() && this.flashBridge.setHandCursor(t); };
    g.version = "1.2.1";
    var y = { moviePath: "ZeroClipboard.swf", trustedOrigins: null, text: null, hoverClass: "zeroclipboard-is-hover", activeClass: "zeroclipboard-is-active", allowScriptAccess: "sameDomain", useNoCache: !0, forceHandCursor: !1 };
    g.setDefaults = function(t) { for (var e in t)y[e] = t[e]; }, g.destroy = function() {
        g.prototype._singleton.unglue(m);
        var t = g.prototype._singleton.htmlBridge;
        t.parentNode.removeChild(t), delete g.prototype._singleton;
    }, g.detectFlashSupport = function() {
        var t = !1;
        if ("function" == typeof ActiveXObject)
            try {
                new ActiveXObject("ShockwaveFlash.ShockwaveFlash") && (t = !0);
            } catch (e) {
            }
        return!t && navigator.mimeTypes["application/x-shockwave-flash"] && (t = !0), t;
    };
    var b = null,
        x = null,
        w = function() {
            var t = g.prototype._singleton, e = document.getElementById("global-zeroclipboard-html-bridge");
            if (!e) {
                var n = {};
                for (var r in t.options)n[r] = t.options[r];
                n.amdModuleId = b, n.cjsModuleId = x;
                var i = f(n), o = '      <object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" id="global-zeroclipboard-flash-bridge" width="100%" height="100%">         <param name="movie" value="' + t.options.moviePath + l(t.options.moviePath, t.options) + '"/>         <param name="allowScriptAccess" value="' + t.options.allowScriptAccess + '"/>         <param name="scale" value="exactfit"/>         <param name="loop" value="false"/>         <param name="menu" value="false"/>         <param name="quality" value="best" />         <param name="bgcolor" value="#ffffff"/>         <param name="wmode" value="transparent"/>         <param name="flashvars" value="' + i + '"/>         <embed src="' + t.options.moviePath + l(t.options.moviePath, t.options) + '"           loop="false" menu="false"           quality="best" bgcolor="#ffffff"           width="100%" height="100%"           name="global-zeroclipboard-flash-bridge"           allowScriptAccess="always"           allowFullScreen="false"           type="application/x-shockwave-flash"           wmode="transparent"           pluginspage="http://www.macromedia.com/go/getflashplayer"           flashvars="' + i + '"           scale="exactfit">         </embed>       </object>';
                e = document.createElement("div"), e.id = "global-zeroclipboard-html-bridge", e.setAttribute("class", "global-zeroclipboard-container"), e.setAttribute("data-clipboard-ready", !1), e.style.position = "absolute", e.style.left = "-9999px", e.style.top = "-9999px", e.style.width = "15px", e.style.height = "15px", e.style.zIndex = "9999", e.innerHTML = o, document.body.appendChild(e);
            }
            t.htmlBridge = e, t.flashBridge = document["global-zeroclipboard-flash-bridge"] || e.children[0].lastElementChild;
        };
    g.prototype.resetBridge = function() { return this.htmlBridge.style.left = "-9999px", this.htmlBridge.style.top = "-9999px", this.htmlBridge.removeAttribute("title"), this.htmlBridge.removeAttribute("data-clipboard-text"), s(t, this.options.activeClass), t = null, this.options.text = null, this; }, g.prototype.ready = function() {
        var t = this.htmlBridge.getAttribute("data-clipboard-ready");
        return"true" === t || t === !0;
    }, g.prototype.reposition = function() {
        if (!t)return!1;
        var e = c(t);
        return this.htmlBridge.style.top = e.top + "px", this.htmlBridge.style.left = e.left + "px", this.htmlBridge.style.width = e.width + "px", this.htmlBridge.style.height = e.height + "px", this.htmlBridge.style.zIndex = e.zIndex + 1, this.setSize(e.width, e.height), this;
    }, g.dispatch = function(t, e) { g.prototype._singleton.receiveEvent(t, e); }, g.prototype.on = function(t, e) {
        for (var n = t.toString().split(/\s/g), r = 0; r < n.length; r++)t = n[r].toLowerCase().replace(/^on/, ""), this.handlers[t] || (this.handlers[t] = e);
        return this.handlers.noflash && !g.detectFlashSupport() && this.receiveEvent("onNoFlash", null), this;
    }, g.prototype.addEventListener = g.prototype.on, g.prototype.off = function(t, e) {
        for (var n = t.toString().split(/\s/g), r = 0; r < n.length; r++) {
            t = n[r].toLowerCase().replace(/^on/, "");
            for (var i in this.handlers)i === t && this.handlers[i] === e && delete this.handlers[i];
        }
        return this;
    }, g.prototype.removeEventListener = g.prototype.off, g.prototype.receiveEvent = function(e, n) {
        e = e.toString().toLowerCase().replace(/^on/, "");
        var r = t, i = !0;
        switch (e) {
        case"load":
            if (n && parseFloat(n.flashVersion.replace(",", ".").replace(/[^0-9\.]/gi, "")) < 10)return this.receiveEvent("onWrongFlash", { flashVersion: n.flashVersion }), void 0;
            this.htmlBridge.setAttribute("data-clipboard-ready", !0);
            break;
        case"mouseover":
            a(r, this.options.hoverClass);
            break;
        case"mouseout":
            s(r, this.options.hoverClass), this.resetBridge();
            break;
        case"mousedown":
            a(r, this.options.activeClass);
            break;
        case"mouseup":
            s(r, this.options.activeClass);
            break;
        case"datarequested":
            var o = r.getAttribute("data-clipboard-target"), u = o ? document.getElementById(o) : null;
            if (u) {
                var c = u.value || u.textContent || u.innerText;
                c && this.setText(c);
            } else {
                var l = r.getAttribute("data-clipboard-text");
                l && this.setText(l);
            }
            i = !1;
            break;
        case"complete":
            this.options.text = null;
        }
        if (this.handlers[e]) {
            var f = this.handlers[e];
            "string" == typeof f && "function" == typeof window[f] && (f = window[f]), "function" == typeof f && p(f, r, this, n, i);
        }
    }, g.prototype.glue = function(t) {
        t = d(t);
        for (var e = 0; e < t.length; e++)-1 == h(t[e], m) && (m.push(t[e]), i(t[e], "mouseover", r));
        return this;
    }, g.prototype.unglue = function(t) {
        t = d(t);
        for (var e = 0; e < t.length; e++) {
            o(t[e], "mouseover", r);
            var n = h(t[e], m);
            -1 != n && m.splice(n, 1);
        }
        return this;
    }, "function" == typeof define && define.amd ? define(["require", "exports", "module"], function(t, e, n) { return b = n && n.id || null, g; }) : "object" == typeof module && module && "object" == typeof module.exports && module.exports ? (x = module.id || null, module.exports = g) : window.ZeroClipboard = g;
}(), function(t) {

    function e(t, e) { return"function" == typeof t ? t.call(e) : t; }

    function n(t) {
        for (; t = t.parentNode;)if (t == document)return!0;
        return!1;
    }

    function r(e, n) { this.$element = t(e), this.options = n, this.enabled = !0, this.fixTitle(); }

    r.prototype = {
        show: function() {
            var n = this.getTitle();
            if (n && this.enabled && this.fire("tipsy:show")) {
                var r = this.tip();
                r.find(".tipsy-inner")[this.options.html ? "html" : "text"](n), r[0].className = "tipsy", r.detach().css({ top: 0, left: 0, visibility: "hidden", display: "block" }), this.options.className && r.addClass(e(this.options.className, this.$element[0])), this.options.inline ? r.insertAfter(this.$element[0]) : r.prependTo(document.body);
                var i, o = t.extend({}, this.$element.offset(), { width: this.$element[0].offsetWidth, height: this.$element[0].offsetHeight }), a = r[0].offsetWidth, s = r[0].offsetHeight, u = e(this.options.gravity, this.$element[0]);
                switch (u.charAt(0)) {
                case"n":
                    i = { top: o.top + o.height + this.options.offset, left: o.left + o.width / 2 - a / 2 };
                    break;
                case"s":
                    i = { top: o.top - s - this.options.offset, left: o.left + o.width / 2 - a / 2 };
                    break;
                case"e":
                    i = { top: o.top + o.height / 2 - s / 2, left: o.left - a - this.options.offset };
                    break;
                case"w":
                    i = { top: o.top + o.height / 2 - s / 2, left: o.left + o.width + this.options.offset };
                }
                2 == u.length && (i.left = "w" == u.charAt(1) ? o.left + o.width / 2 - 15 : o.left + o.width / 2 - a + 15), r.offset(i).addClass("tipsy-" + u), r.find(".tipsy-arrow")[0].className = "tipsy-arrow tipsy-arrow-" + u.charAt(0), this.options.fade ? r.stop().css({ opacity: 0, display: "block", visibility: "visible" }).animate({ opacity: this.options.opacity }) : r.css({ visibility: "visible", opacity: this.options.opacity });
            }
        },
        fire: function(e) {
            var n = t.Event(e);
            return this.$element.trigger(n, [this]), !n.isDefaultPrevented();
        },
        hide: function() { this.options.fade ? this.tip().stop().fadeOut(function() { t(this).remove(); }) : this.tip().remove(); },
        fixTitle: function() {
            var t = this.$element;
            (t.attr("title") || "string" != typeof t.attr("original-title")) && t.attr("original-title", t.attr("title") || "").removeAttr("title");
        },
        getTitle: function() {
            var t, e = this.$element, n = this.options;
            return n.content ? n.content : (this.fixTitle(), "string" == typeof n.title ? t = e.attr("title" == n.title ? "original-title" : n.title) : "function" == typeof n.title && (t = n.title.call(e[0])), t = ("" + t).replace(/(^\s*|\s*$)/, ""), t || n.fallback);
        },
        tip: function() { return this.$tip || (this.$tip = t('<div class="tipsy"></div>').html('<div class="tipsy-arrow"></div><div class="tipsy-inner"></div>'), this.$tip.data("tipsy-pointee", this.$element[0])), this.$tip; },
        validate: function() { this.$element[0].parentNode || (this.hide(), this.$element = null, this.options = null); },
        enable: function() { this.enabled = !0; },
        disable: function() { this.enabled = !1; },
        toggleEnabled: function() { this.enabled = !this.enabled; }
    }, t.fn.tipsy = function(e) {

        function n(n) {
            var i = t.data(n, "tipsy");
            return i || (i = new r(n, t.fn.tipsy.elementOptions(n, e)), t.data(n, "tipsy", i)), i;
        }

        function i() {
            var t = n(this);
            t.hoverState = "in", 0 == e.delayIn ? t.show() : (t.fixTitle(), setTimeout(function() { "in" == t.hoverState && t.show(); }, e.delayIn));
        }

        function o() {
            var t = n(this);
            t.hoverState = "out", 0 == e.delayOut ? t.hide() : setTimeout(function() { "out" == t.hoverState && t.hide(); }, e.delayOut);
        }

        if (e === !0)return this.data("tipsy");
        if ("string" == typeof e) {
            var a = this.data("tipsy");
            return a && a[e](), this;
        }
        if (e = t.extend({}, t.fn.tipsy.defaults, e), e.live || this.each(function() { n(this); }), "manual" != e.trigger) {
            var s = e.live ? "live" : "bind", u = "hover" == e.trigger ? "mouseenter" : "focus", c = "hover" == e.trigger ? "mouseleave" : "blur";
            this[s](u, i)[s](c, o);
        }
        return this;
    }, t.fn.tipsy.defaults = { className: null, delayIn: 0, delayOut: 0, fade: !1, fallback: "", gravity: "n", html: !1, inline: !1, live: !1, offset: 0, opacity: .8, title: "title", trigger: "hover" }, t.fn.tipsy.revalidate = function() {
        t(".tipsy").each(function() {
            var e = t.data(this, "tipsy-pointee");
            e && n(e) || t(this).remove();
        });
    }, t.fn.tipsy.elementOptions = function(e, n) { return t.metadata ? t.extend({}, n, t(e).metadata()) : n; }, t.fn.tipsy.autoNS = function() { return t(this).offset().top > t(document).scrollTop() + t(window).height() / 2 ? "s" : "n"; }, t.fn.tipsy.autoWE = function() { return t(this).offset().left > t(document).scrollLeft() + t(window).width() / 2 ? "e" : "w"; }, t.fn.tipsy.autoBounds = function(e, n) {
        return function() {
            var r = { ns: n[0], ew: n.length > 1 ? n[1] : !1 }, i = t(document).scrollTop() + e, o = t(document).scrollLeft() + e, a = t(this);
            return a.offset().top < i && (r.ns = "n"), a.offset().left < o && (r.ew = "w"), t(window).width() + t(document).scrollLeft() - a.offset().left < e && (r.ew = "e"), t(window).height() + t(document).scrollTop() - a.offset().top < e && (r.ns = "s"), r.ns + (r.ew ? r.ew : "");
        };
    };
}(jQuery), function() { $(document).on("change", "form[data-autosubmit]", function() { return $(this).submit(); }); }.call(this), function() {
    $.fn.replaceContent = function(t) {
        var e;
        return"string" == typeof t && (t = $.parseHTML($.trim(t))), e = $(t), this.replaceWith(e), e.pageUpdate(), e;
    };
}.call(this), function() {
    $.ajaxPoll = function(t) {
        var e, n, r, i, o, a;
        return r = $.Deferred(), t = $.extend({ cache: !1 }, t), n = null != (o = t.interval) ? o : 1e3, delete t.interval, e = null != (a = t.decay) ? a : 1.5, delete t.decay, i = function(n, o) {
            var a;
            a = $.ajax(t), a.done(function() { return r.notifyWith(this, [n]), 202 === a.status ? setTimeout(function() { return i(n + 1, o * e); }, o) : r.resolveWith(this, arguments); }), a.fail(function() { return r.rejectWith(this, arguments); });
        }, i(0, n), r.promise();
    };
}.call(this), "undefined" == typeof WeakMap && function() {
    var t = Object.defineProperty, e = Date.now() % 1e9, n = function() { this.name = "__st" + (1e9 * Math.random() >>> 0) + (e++ + "__"); };
    n.prototype = {
        set: function(e, n) {
            var r = e[this.name];
            r && r[0] === e ? r[1] = n : t(e, this.name, { value: [e, n], writable: !0 });
        },
        get: function(t) {
            var e;
            return(e = t[this.name]) && e[0] === t ? e[1] : void 0;
        },
        "delete": function(t) { this.set(t, void 0); }
    }, window.WeakMap = n;
}(), function(t) {

    function e(t) { x.push(t), b || (b = !0, m(r)); }

    function n(t) { return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(t) || t; }

    function r() {
        b = !1;
        var t = x;
        x = [], t.sort(function(t, e) { return t.uid_ - e.uid_; });
        var e = !1;
        t.forEach(function(t) {
            var n = t.takeRecords();
            i(t), n.length && (t.callback_(n, t), e = !0);
        }), e && r();
    }

    function i(t) {
        t.nodes_.forEach(function(e) {
            var n = g.get(e);
            n && n.forEach(function(e) {
                e.observer === t && e.removeTransientObservers();
            });
        });
    }

    function o(t, e) {
        for (var n = t; n; n = n.parentNode) {
            var r = g.get(n);
            if (r)
                for (var i = 0; i < r.length; i++) {
                    var o = r[i], a = o.options;
                    if (n === t || a.subtree) {
                        var s = e(a);
                        s && o.enqueue(s);
                    }
                }
        }
    }

    function a(t) { this.callback_ = t, this.nodes_ = [], this.records_ = [], this.uid_ = ++w; }

    function s(t, e) { this.type = t, this.target = e, this.addedNodes = [], this.removedNodes = [], this.previousSibling = null, this.nextSibling = null, this.attributeName = null, this.attributeNamespace = null, this.oldValue = null; }

    function u(t) {
        var e = new s(t.type, t.target);
        return e.addedNodes = t.addedNodes.slice(), e.removedNodes = t.removedNodes.slice(), e.previousSibling = t.previousSibling, e.nextSibling = t.nextSibling, e.attributeName = t.attributeName, e.attributeNamespace = t.attributeNamespace, e.oldValue = t.oldValue, e;
    }

    function c(t, e) { return _ = new s(t, e); }

    function l(t) { return M ? M : (M = u(_), M.oldValue = t, M); }

    function f() { _ = M = void 0; }

    function h(t) { return t === M || t === _; }

    function d(t, e) { return t === e ? t : M && h(t) ? M : null; }

    function p(t, e, n) { this.observer = t, this.target = e, this.options = n, this.transientObservedNodes = []; }

    var g = new WeakMap, m = window.msSetImmediate;
    if (!m) {
        var v = [], y = String(Math.random());
        window.addEventListener("message", function(t) {
            if (t.data === y) {
                var e = v;
                v = [], e.forEach(function(t) { t(); });
            }
        }), m = function(t) { v.push(t), window.postMessage(y, "*"); };
    }
    var b = !1, x = [], w = 0;
    a.prototype = {
        observe: function(t, e) {
            if (t = n(t), !e.childList && !e.attributes && !e.characterData || e.attributeOldValue && !e.attributes || e.attributeFilter && e.attributeFilter.length && !e.attributes || e.characterDataOldValue && !e.characterData)throw new SyntaxError;
            var r = g.get(t);
            r || g.set(t, r = []);
            for (var i, o = 0; o < r.length; o++)
                if (r[o].observer === this) {
                    i = r[o], i.removeListeners(), i.options = e;
                    break;
                }
            i || (i = new p(this, t, e), r.push(i), this.nodes_.push(t)), i.addListeners();
        },
        disconnect: function() {
            this.nodes_.forEach(function(t) {
                for (var e = g.get(t), n = 0; n < e.length; n++) {
                    var r = e[n];
                    if (r.observer === this) {
                        r.removeListeners(), e.splice(n, 1);
                        break;
                    }
                }
            }, this), this.records_ = [];
        },
        takeRecords: function() {
            var t = this.records_;
            return this.records_ = [], t;
        }
    };
    var _, M;
    p.prototype = {
        enqueue: function(t) {
            var n = this.observer.records_, r = n.length;
            if (n.length > 0) {
                var i = n[r - 1], o = d(i, t);
                if (o)return n[r - 1] = o, void 0;
            } else e(this.observer);
            n[r] = t;
        },
        addListeners: function() { this.addListeners_(this.target); },
        addListeners_: function(t) {
            var e = this.options;
            e.attributes && t.addEventListener("DOMAttrModified", this, !0), e.characterData && t.addEventListener("DOMCharacterDataModified", this, !0), e.childList && t.addEventListener("DOMNodeInserted", this, !0), (e.childList || e.subtree) && t.addEventListener("DOMNodeRemoved", this, !0);
        },
        removeListeners: function() { this.removeListeners_(this.target); },
        removeListeners_: function(t) {
            var e = this.options;
            e.attributes && t.removeEventListener("DOMAttrModified", this, !0), e.characterData && t.removeEventListener("DOMCharacterDataModified", this, !0), e.childList && t.removeEventListener("DOMNodeInserted", this, !0), (e.childList || e.subtree) && t.removeEventListener("DOMNodeRemoved", this, !0);
        },
        addTransientObserver: function(t) {
            if (t !== this.target) {
                this.addListeners_(t), this.transientObservedNodes.push(t);
                var e = g.get(t);
                e || g.set(t, e = []), e.push(this);
            }
        },
        removeTransientObservers: function() {
            var t = this.transientObservedNodes;
            this.transientObservedNodes = [], t.forEach(function(t) {
                this.removeListeners_(t);
                for (var e = g.get(t), n = 0; n < e.length; n++)
                    if (e[n] === this) {
                        e.splice(n, 1);
                        break;
                    }
            }, this);
        },
        handleEvent: function(t) {
            switch (t.stopImmediatePropagation(), t.type) {
            case"DOMAttrModified":
                var e = t.attrName, n = t.relatedNode.namespaceURI, r = t.target, i = new c("attributes", r);
                i.attributeName = e, i.attributeNamespace = n;
                var a = t.attrChange === MutationEvent.ADDITION ? null : t.prevValue;
                o(r, function(t) { return!t.attributes || t.attributeFilter && t.attributeFilter.length && -1 === t.attributeFilter.indexOf(e) && -1 === t.attributeFilter.indexOf(n) ? void 0 : t.attributeOldValue ? l(a) : i; });
                break;
            case"DOMCharacterDataModified":
                var r = t.target, i = c("characterData", r), a = t.prevValue;
                o(r, function(t) { return t.characterData ? t.characterDataOldValue ? l(a) : i : void 0; });
                break;
            case"DOMNodeRemoved":
                this.addTransientObserver(t.target);
            case"DOMNodeInserted":
                var s, u, r = t.relatedNode, h = t.target;
                "DOMNodeInserted" === t.type ? (s = [h], u = []) : (s = [], u = [h]);
                var d = h.previousSibling, p = h.nextSibling, i = c("childList", r);
                i.addedNodes = s, i.removedNodes = u, i.previousSibling = d, i.nextSibling = p, o(r, function(t) { return t.childList ? i : void 0; });
            }
            f();
        }
    }, t.JsMutationObserver = a, !t.MutationObserver && t.WebKitMutationObserver && (t.MutationObserver = t.WebKitMutationObserver), t.MutationObserver || (t.MutationObserver = a);
}(this), function() {
    var t, e, n, r, i, o, a, s, u, c, l, f, h, d, p, g, m, v, y, b, x, w;
    f = function() {
        var t, e, n;
        return t = document.createElement("div"), e = document.createElement("div"), n = document.createElement("div"), t.appendChild(e), e.appendChild(n), t.innerHTML = "", n.parentNode !== e;
    }(), w = 0, o = [], b = new SelectorSet, c = new WeakMap, t = new WeakMap, l = new WeakMap, v = function(t, e) {
        var n, r;
        (n = c.get(t)) || (n = [], c.set(t, n)), -1 === n.indexOf(e.id) && (null != e.initialize && (r = e.initialize.call(t, t)), l.set(t, r), n.push(e.id));
    }, m = function(e, n) {
        var r, i, o, a;
        (r = t.get(e)) || (r = [], t.set(e, r)), -1 === r.indexOf(n.id) && (n.elements.push(e), (i = l.get(e)) && ("length" in i || null != (o = i.add) && o.call(e, e)), null != (a = n.add) && a.call(e, e), r.push(n.id));
    }, y = function(e, n) {
        var r, i, a, s, u, c, f, h, d, p, g;
        if (r = t.get(e))
            if (n)a = n.elements.indexOf(e), -1 !== a && n.elements.splice(a, 1), a = r.indexOf(n.id), -1 !== a && ((s = l.get(e)) && ("length" in s || null != (f = s.remove) && f.call(e, e)), null != (h = n.remove) && h.call(e, e), r.splice(a, 1)), 0 === r.length && t["delete"](e);
            else {
                for (d = r.slice(0), u = 0, c = d.length; c > u; u++)i = d[u], n = o[i], n && (a = n.elements.indexOf(e), -1 !== a && n.elements.splice(a, 1), (s = l.get(e)) && null != (p = s.remove) && p.call(e, e), null != (g = n.remove) && g.call(e, e));
                t["delete"](e);
            }
    }, e = function(t, e) {
        var n, r, i, o, a, s, u, c, l, f, h, d, p, g, m;
        for (a = 0, l = e.length; l > a; a++)
            if (i = e[a], i.nodeType === Node.ELEMENT_NODE) {
                for (p = b.matches(i), s = 0, f = p.length; f > s; s++)n = p[s].data, t.push(["add", i, n]);
                for (g = b.queryAll(i), u = 0, h = g.length; h > u; u++)for (m = g[u], n = m.data, o = m.elements, c = 0, d = o.length; d > c; c++)r = o[c], t.push(["add", r, n]);
            }
    }, h = function(t, e) {
        var n, r, i, o, a, s, u;
        for (i = 0, a = e.length; a > i; i++)if (r = e[i], r.nodeType === Node.ELEMENT_NODE)for (t.push(["remove", r]), u = r.getElementsByTagName("*"), o = 0, s = u.length; s > o; o++)n = u[o], t.push(["remove", n]);
    }, g = function(t) {
        var e, n, r, i, a, s, u;
        for (r = 0, a = o.length; a > r; r++)if (n = o[r])for (u = n.elements, i = 0, s = u.length; s > i; i++)e = u[i], e.parentNode || t.push(["remove", e]);
    }, p = function(e, n) {
        var r, i, a, s, u, c, l, f, h;
        if (n.nodeType === Node.ELEMENT_NODE) {
            for (h = b.matches(n), u = 0, l = h.length; l > u; u++)r = h[u].data, e.push(["add", n, r]);
            if (a = t.get(n))for (c = 0, f = a.length; f > c; c++)i = a[c], s = o[i], b.matchesSelector(n, s.selector) || e.push(["remove", n, s]);
        }
    }, d = function(t, e) {
        var n, r, i, o;
        if (e.nodeType === Node.ELEMENT_NODE)for (p(t, e), o = e.getElementsByTagName("*"), r = 0, i = o.length; i > r; r++)n = o[r], p(t, n);
    }, n = function(t) {
        var e, n, r, i, o, a;
        for (i = 0, o = t.length; o > i; i++)a = t[i], r = a[0], e = a[1], n = a[2], "add" === r ? (v(e, n), m(e, n)) : "remove" === r && y(e, n);
    }, x = function(t) {
        var e, n, r, i;
        for (i = t.elements, n = 0, r = i.length; r > n; n++)e = i[n], y(e, t);
        b.remove(t.selector, t), delete o[t.id], $.observe.count--;
    }, $.observe = function(t, r) {
        var i, a;
        return null != r.call && (r = { initialize: r }), a = { id: w++, selector: t, initialize: r.initialize || r.init, add: r.add, remove: r.remove, elements: [], stop: function() { return x(a); } }, b.add(t, a), o[a.id] = a, i = [], e(i, [document.documentElement]), n(i), $.observe.count++, a;
    }, $.observe.count = 0, $(document).on("observe:dirty", function(t) {
        var e;
        e = [], d(e, t.target), n(e);
    }), r = [], a = function() {
        var t, e, i, o, a, s, u, c, l;
        for (t = [], a = r, r = [], s = 0, c = a.length; c > s; s++)for (o = a[s], i = o.form ? o.form.elements : o.ownerDocument.getElementsByTagName("input"), u = 0, l = i.length; l > u; u++)e = i[u], p(t, e);
        n(t);
    }, s = function(t) { r.push(t.target), setImmediate(a); }, document.addEventListener("change", s, !1), $(document).on("change", s), u = function(t) {
        var r, i, o, a;
        for (r = [], o = 0, a = t.length; a > o; o++)i = t[o], "childList" === i.type ? (e(r, i.addedNodes), h(r, i.removedNodes)) : "attributes" === i.type && p(r, i.target);
        f && g(r), n(r);
    }, i = new MutationObserver(u), i.observe(document, { childList: !0, attributes: !0, subtree: !0 }), document.addEventListener("DOMContentLoaded", function() {
        var t;
        return t = [], e(t, [document.documentElement]), n(t);
    }, !1);
}.call(this), function() {
    var t;
    $.observe(".js-deferred-content", t = function(t) {
        var e, n, r;
        return e = $(t), (n = e.attr("data-url")) ? (r = $.ajaxPoll({ url: n, context: t }), r.done(function(t) { return e.fire("deferredcontent:load", function() { return e = e.replaceContent(t), e.fire("deferredcontent:loaded", { async: !0 }); }); }), r.fail(function() { return e.fire("deferredcontent:error", function() { return e.addClass("error"); }); })) : void 0;
    });
}.call(this), function() {
    var t, e, n;
    e = "ontransitionend" in window, $.fn.performTransition = function(r) {
        var i, o, a, s, u, c, l, f;
        if (!e)return r.apply(this), void 0;
        for (a = this.find(".js-transitionable"), a = a.add(this.filter(".js-transitionable")), u = 0, l = a.length; l > u; u++)o = a[u], i = $(o), s = t(o), i.one("transitionend", function() { return o.style.display = null, o.style.visibility = null, s ? n(o, function() { return o.style.height = null; }) : void 0; }), o.style.display = "block", o.style.visibility = "visible", s && n(o, function() { return o.style.height = "" + i.height() + "px"; }), o.offsetHeight;
        for (r.apply(this), c = 0, f = a.length; f > c; c++)o = a[c], t(o) && (o.style.height = 0 === $(o).height() ? "" + o.scrollHeight + "px" : "0px");
        return this;
    }, t = function(t) { return"height" === $(t).css("transitionProperty"); }, n = function(t, e) { t.style.transition = "none", e(t), t.offsetHeight, t.style.transition = null; };
}.call(this), function() {
    $(document).on("click", ".js-details-container .js-details-target", function(t) {
        var e, n;
        n = $(this), e = n.closest(".js-details-container"), n.fire("details:toggle", { relatedTarget: t.target }, function() { e.performTransition(function() { this.toggleClass("open"), this.fire("details:toggled", { relatedTarget: t.target, async: !0 }); }), t.preventDefault(); });
    });
}.call(this), function() {
    var t, e;
    $.fuzzyScore = function(t, n) {
        var r;
        return r = e(t, n), r && !/\//.test(n) && (r += e(t.replace(/^.*\//, ""), n)), r;
    }, $.fuzzySort = function(e, n) {
        var r, i, o, a, s, u;
        for (e = function() {
            var t, r, a;
            for (a = [], t = 0, r = e.length; r > t; t++)o = e[t], (i = $.fuzzyScore(o, n)) && a.push([o, i]);
            return a;
        }(), e.sort(t), u = [], a = 0, s = e.length; s > a; a++)r = e[a], u.push(r[0]);
        return u;
    }, t = function(t, e) {
        var n, r, i, o;
        return r = t[0], o = e[0], n = t[1], i = e[1], n > i ? -1 : i > n ? 1 : o > r ? -1 : r > o ? 1 : 0;
    }, $.fuzzyRegexp = function(t) {
        var e, n, r;
        return r = t.toLowerCase(), e = "+.*?[]{}()^$|\\".replace(/(.)/g, "\\$1"), n = new RegExp("\\(([" + e + "])\\)", "g"), t = r.replace(/(.)/g, "($1)(.*?)").replace(n, "(\\$1)"), new RegExp("(.*)" + t + "$", "i");
    }, $.fuzzyHighlight = function(t, e, n) {
        var r, i, o, a, s, u, c, l;
        if (null == n && (n = null), i = $.trim(t.innerHTML), e) {
            if (null == n && (n = $.fuzzyRegexp(e)), !(s = i.match(n)))return;
            for (u = !1, i = [], o = c = 1, l = s.length; l >= 1 ? l > c : c > l; o = l >= 1 ? ++c : --c)a = s[o], a && (0 === o % 2 ? u || (i.push("<mark>"), u = !0) : u && (i.push("</mark>"), u = !1), i.push("" + a));
            t.innerHTML = i.join("");
        } else r = i.replace(/<\/?mark>/g, ""), i !== r && (t.innerHTML = r);
    }, e = function(t, e) {
        var n, r, i, o, a, s, u, c, l, f, h, d, p, g, m;
        if (t === e)return 1;
        for (d = t.length, p = 0, h = 0, s = g = 0, m = e.length; m > g; s = ++g) {
            if (i = e[s], u = t.indexOf(i.toLowerCase()), c = t.indexOf(i.toUpperCase()), f = Math.min(u, c), l = f > -1 ? f : Math.max(u, c), -1 === l)return 0;
            o = .1, t[l] === i && (o += .1), 0 === l && (o += .8, 0 === s && (h = 1)), " " === t.charAt(l - 1) && (o += .8), t = t.substring(l + 1, d), p += o;
        }
        return n = e.length, r = p / n, a = (r * (n / d) + r) / 2, h && 1 > a + .1 && (a += .1), a;
    };
}.call(this), function() {
    var t, e, n, r;
    $.fn.fuzzyFilterSortList = function(i, o) {
        var a, s, u, c, l, f, h, d, p, g, m, v, y, b, x, w, _, M, k, S, T, E, C, D, A, N, L;
        if (null == o && (o = {}), d = this[0]) {
            for (i = i.toLowerCase(), c = null != (D = o.content) ? D : t, y = null != (A = o.text) ? A : n, h = o.limit, o.mark === !0 ? p = e : null != (null != (N = o.mark) ? N.call : void 0) && (p = o.mark), (a = $(d).data("fuzzy-sort-items")) ? u = $(d).children() : (u = a = $(d).children(), $(d).data("fuzzy-sort-items", a.slice(0))), w = 0, S = u.length; S > w; w++)l = u[w], d.removeChild(l), l.style.display = "";
            if (m = document.createDocumentFragment(), b = 0, x = 0, i) {
                for (f = a.slice(0), M = 0, E = f.length; E > M; M++)l = f[M], null == (L = l.fuzzyFilterTextCache) && (l.fuzzyFilterTextCache = y(c(l))), v = $.fuzzyScore(l.fuzzyFilterTextCache, i), l.fuzzyFilterScoreCache = v;
                for (f.sort(r), g = $.fuzzyRegexp(i), k = 0, C = f.length; C > k; k++)l = f[k], (!h || h > b) && l.fuzzyFilterScoreCache > 0 && (x++, p && (s = c(l), p(s), p(s, i, g)), m.appendChild(l)), b++;
            } else for (_ = 0, T = a.length; T > _; _++)l = a[_], (!h || h > b) && (x++, p && p(c(l)), m.appendChild(l)), b++;
            return d.appendChild(m), x;
        }
    }, r = function(t, e) {
        var n, r, i, o;
        return n = t.fuzzyFilterScoreCache, i = e.fuzzyFilterScoreCache, r = t.fuzzyFilterTextCache, o = e.fuzzyFilterTextCache, n > i ? -1 : i > n ? 1 : o > r ? -1 : r > o ? 1 : 0;
    }, t = function(t) { return t; }, n = function(t) { return $.trim(t.textContent.toLowerCase()); }, e = $.fuzzyHighlight;
}.call(this), function() {
    var t, e;
    $.fn.prefixFilterList = function(n, r) {
        var i, o, a, s, u, c, l, f, h, d, p;
        if (null == r && (r = {}), s = this[0]) {
            for (n = n.toLowerCase(), c = null != (d = r.text) ? d : e, o = $(s).children(), a = r.limit, r.mark === !0 ? u = t : null != (null != (p = r.mark) ? p.call : void 0) && (u = r.mark), l = 0, f = 0, h = o.length; h > f; f++)i = o[f], 0 === c(i).indexOf(n) ? a && l >= a ? i.style.display = "none" : (l++, i.style.display = "", u && (u(i), u(i, n))) : i.style.display = "none";
            return l;
        }
    }, e = function(t) { return $.trim(t.textContent.toLowerCase()); }, t = function(t, e) {
        var n, r, i;
        r = t.innerHTML, e ? (i = new RegExp(e, "i"), t.innerHTML = r.replace(i, "<mark>$&</mark>")) : (n = r.replace(/<\/?mark>/g, ""), r !== n && (t.innerHTML = n));
    };
}.call(this), function() {
    var t, e;
    $.fn.substringFilterList = function(n, r) {
        var i, o, a, s, u, c, l, f, h, d, p;
        if (null == r && (r = {}), s = this[0]) {
            for (n = n.toLowerCase(), c = null != (d = r.text) ? d : e, a = r.limit, o = $(s).children(), r.mark === !0 ? u = t : null != (null != (p = r.mark) ? p.call : void 0) && (u = r.mark), l = 0, f = 0, h = o.length; h > f; f++)i = o[f], -1 !== c(i).indexOf(n) ? a && l >= a ? i.style.display = "none" : (l++, i.style.display = "", u && (u(i), u(i, n))) : i.style.display = "none";
            return l;
        }
    }, e = function(t) { return $.trim(t.textContent.toLowerCase()); }, t = function(t, e) {
        var n, r, i;
        r = t.innerHTML, e ? (i = new RegExp(e, "i"), t.innerHTML = r.replace(i, "<mark>$&</mark>")) : (n = r.replace(/<\/?mark>/g, ""), r !== n && (t.innerHTML = n));
    };
}.call(this), function() {
    $.fn.focused = function(t) {
        var e, n, r;
        return n = [], r = [], e = t ? this.find(t).filter(document.activeElement)[0] : this.filter(document.activeElement)[0], this.on("focusin", t, function() {
            var t, r, i;
            if (!e)for (e = this, r = 0, i = n.length; i > r; r++)t = n[r], t.call(this);
        }), this.on("focusout", t, function() {
            var t, n, i;
            if (e)for (e = null, n = 0, i = r.length; i > n; n++)t = r[n], t.call(this);
        }), { "in": function(t) { return n.push(t), e && t.call(e), this; }, out: function(t) { return r.push(t), this; } };
    };
}.call(this), function() {
    var t, e;
    t = function() {
        var t, e, n, r, i, o = this;
        return n = !1, e = !1, i = null, t = 100, r = function(e) {
            i && clearTimeout(i), i = setTimeout(function() {
                var t;
                i = null, t = new $.Event("throttled:input", { target: e }), $.event.trigger(t, null, o, !0);
            }, t);
        }, $(this).on("keydown.throttledInput", function() { n || (e = !1), n = !0, i && clearTimeout(i); }), $(this).on("keyup.throttledInput", function(t) { n = !1, e && r(t.target), e = !1; }), $(this).on("input.throttledInput", function(t) { e = !0, n || r(t.target); });
    }, e = function() { return $(this).off("keydown.throttledInput"), $(this).off("keyup.throttledInput"), $(this).off("input.throttledInput"); }, $.event.special["throttled:input"] = { setup: t, teardown: e };
}.call(this), function() {
    var t;
    $(document).focused(".js-filterable-field")["in"](function() {
        var t;
        return t = $(this).val(), $(this).on("throttled:input.filterable", function() { return t !== $(this).val() ? (t = $(this).val(), $(this).fire("filterable:change", { async: !0 })) : void 0; }), $(this).fire("filterable:change", { async: !0 });
    }).out(function() { return $(this).off(".filterable"); }), $(document).on("filterable:change", ".js-filterable-field", function() {
        var e, n, r, i, o, a;
        for (r = $.trim($(this).val().toLowerCase()), a = $("[data-filterable-for=" + this.id + "]"), i = 0, o = a.length; o > i; i++)n = a[i], e = $(n), t(e, r), e.fire("filterable:change", { relatedTarget: this });
    }), t = function(t, e) {
        var n, r, i, o;
        t.find(".js-filterable-text:first")[0] && (n = function(t) { return $(t).find(".js-filterable-text:first")[0]; }), i = void 0 !== t.attr("data-filterable-highlight"), r = t.attr("data-filterable-limit"), o = function() {
            switch (t.attr("data-filterable-type")) {
            case"fuzzy":
                return t.fuzzyFilterSortList(e, { content: n, mark: i, limit: r });
            case"substring":
                return t.substringFilterList(e, { content: n, mark: i, limit: r });
            default:
                return t.prefixFilterList(e, { content: n, mark: i, limit: r });
            }
        }(), t.toggleClass("filterable-active", e.length > 0), t.toggleClass("filterable-empty", 0 === o);
    };
}.call(this), function() {
    var t, e, n, r;
    n = { 8: "backspace", 9: "tab", 13: "enter", 16: "shift", 17: "ctrl", 18: "alt", 19: "pause", 20: "capslock", 27: "esc", 32: "space", 33: "pageup", 34: "pagedown", 35: "end", 36: "home", 37: "left", 38: "up", 39: "right", 40: "down", 45: "insert", 46: "del", 48: "0", 49: "1", 50: "2", 51: "3", 52: "4", 53: "5", 54: "6", 55: "7", 56: "8", 57: "9", 65: "a", 66: "b", 67: "c", 68: "d", 69: "e", 70: "f", 71: "g", 72: "h", 73: "i", 74: "j", 75: "k", 76: "l", 77: "m", 78: "n", 79: "o", 80: "p", 81: "q", 82: "r", 83: "s", 84: "t", 85: "u", 86: "v", 87: "w", 88: "x", 89: "y", 90: "z", 91: "meta", 93: "meta", 96: "0", 97: "1", 98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9", 106: "*", 107: "+", 109: "-", 110: ".", 111: "/", 112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6", 118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12", 144: "numlock", 145: "scroll", 186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\", 221: "]", 222: "'" }, r = { 48: ")", 49: "!", 50: "@", 51: "#", 52: "$", 53: "%", 54: "^", 55: "&", 56: "*", 57: "(", 65: "A", 66: "B", 67: "C", 68: "D", 69: "E", 70: "F", 71: "G", 72: "H", 73: "I", 74: "J", 75: "K", 76: "L", 77: "M", 78: "N", 79: "O", 80: "P", 81: "Q", 82: "R", 83: "S", 84: "T", 85: "U", 86: "V", 87: "W", 88: "X", 89: "Y", 90: "Z", 186: ":", 187: "+", 188: "<", 189: "_", 190: ">", 191: "?", 192: "~", 219: "{", 220: "|", 221: "}", 222: '"' }, t = function(t) {
        var e, i, o;
        return e = n[t.which], i = "", t.ctrlKey && "ctrl" !== e && (i += "ctrl+"), t.altKey && "alt" !== e && (i += "alt+"), t.metaKey && !t.ctrlKey && "meta" !== e && (i += "meta+"), t.shiftKey ? (o = r[t.which]) ? "" + i + o : "shift" === e ? "" + i + "shift" : e ? "" + i + "shift+" + e : null : e ? "" + i + e : null;
    }, e = function(e) {
        var n;
        return null == (n = e.hotkey) && (e.hotkey = t(e)), e.handleObj.handler.apply(this, arguments);
    }, $.event.special.keydown = { handle: e }, $.event.special.keyup = { handle: e };
}.call(this), function() {
    var t, e, n;
    e = {}, $(document).on("keydown", function(t) {
        var n;
        t.target === document.body && (n = e[t.hotkey]) && ($(n).fire("hotkey:activate", { originalEvent: t }, function() { $(n).is(":input") ? $(n).focus() : $(n).click(); }), t.preventDefault());
    }), t = function(t) {
        var n, r, i, o;
        for (o = t.getAttribute("data-hotkey").split(/\s+/), r = 0, i = o.length; i > r; r++)n = o[r], e[n] = t;
    }, n = function(t) {
        var n, r, i, o;
        for (o = t.getAttribute("data-hotkey").split(/\s+/), r = 0, i = o.length; i > r; r++)n = o[r], delete e[n];
    }, $.observe("[data-hotkey]", { add: t, remove: n });
}.call(this), function() {
    var t,
        e,
        n,
        r,
        i,
        o = [].indexOf || function(t) {
            for (var e = 0, n = this.length; n > e; e++)if (e in this && this[e] === t)return e;
            return-1;
        };
    e = null, t = function(t) { e && n(e), $(t).fire("menu:activate", function() { return $(document).on("keydown.menu", i), $(document).on("click.menu", r), e = t, $(t).performTransition(function() { return $(document.body).addClass("menu-active"), $(t).addClass("active"); }), $(t).fire("menu:activated", { async: !0 }); }); }, n = function(t) { $(t).fire("menu:deactivate", function() { return $(document).off(".menu"), e = null, $(t).performTransition(function() { return $(document.body).removeClass("menu-active"), $(t).removeClass("active"); }), $(t).fire("menu:deactivated", { async: !0 }); }); }, r = function(t) { e && ($(t.target).closest(e)[0] || (t.preventDefault(), n(e))); }, i = function(t) { e && "esc" === t.hotkey && (o.call($(document.activeElement).parents(), e) >= 0 && document.activeElement.blur(), t.preventDefault(), n(e)); }, $(document).on("click", ".js-menu-container", function(r) {
        var i, o, a;
        i = this, (a = $(r.target).closest(".js-menu-target")[0]) ? (r.preventDefault(), i === e ? n(i) : t(i)) : (o = $(r.target).closest(".js-menu-content")[0]) || i === e && (r.preventDefault(), n(i));
    }), $(document).on("click", ".js-menu-container .js-menu-close", function(t) { n($(this).closest(".js-menu-container")[0]), t.preventDefault(); }), $.fn.menu = function(e) {
        var r, i;
        return r = $(this).closest(".js-menu-container")[0], i = { activate: function() { return t(r); }, deactivate: function() { return n(r); } }, "function" == typeof i[e] ? i[e]() : void 0;
    };
}.call(this), function() {
    $.fn.positionedOffset = function(t) {
        var e, n, r, i, o, a, s, u, c;
        if (n = this[0]) {
            for ((null != t ? t.jquery : void 0) && (t = t[0]), u = 0, i = 0, r = n.offsetHeight, c = n.offsetWidth; n !== document.body && n !== t;)if (u += n.offsetTop || 0, i += n.offsetLeft || 0, n = n.offsetParent, !n)return;
            return t && t.offsetParent ? (a = t.scrollHeight, s = t.scrollWidth) : (a = $(document).height(), s = $(document).width()), e = a - (u + r), o = s - (i + c), { top: u, left: i, bottom: e, right: o };
        }
    };
}.call(this), function() {
    var t, e = [].slice;
    $.fn.scrollTo = function() {
        var n, r, i, o, a, s, u, c;
        return n = 1 <= arguments.length ? e.call(arguments, 0) : [], (r = this[0]) ? (o = {}, $.isPlainObject(n[0]) ? (o = n[0], $.isFunction(n[1]) && null == (s = o.complete) && (o.complete = n[1])) : null != n[0] && (o.target = n[0]), null == o.top && null == o.left && (o.target ? (u = $(o.target).positionedOffset(r), a = u.top, i = u.left, o.top = a, o.left = i) : (c = $(r).positionedOffset(), a = c.top, i = c.left, o.top = a, o.left = i, r = document)), r.offsetParent ? o.duration ? t(r, o) : (null != o.top && (r.scrollTop = o.top), null != o.left && (r.scrollLeft = o.left), "function" == typeof o.complete && o.complete()) : o.duration ? t("html, body", o) : (null != o.top && $(document).scrollTop(o.top), null != o.left && $(document).scrollLeft(o.left), "function" == typeof o.complete && o.complete()), this) : this;
    }, t = function(t, e) {
        var n, r, i;
        return i = {}, null != e.top && (i.scrollTop = e.top), null != e.left && (i.scrollLeft = e.left), r = { duration: e.duration, queue: !1 }, e.complete && (n = $(t).length, r.complete = function() { return 0 === --n ? setImmediate(e.complete) : void 0; }), $(t).animate(i, r);
    };
}.call(this), function() {
    $.fn.overflowOffset = function(t) {
        var e, n, r, i, o, a, s, u, c;
        return null == t && (t = document.body), (n = this[0]) && (o = $(n).positionedOffset(t)) ? (t.offsetParent ? s = { top: $(t).scrollTop(), left: $(t).scrollLeft() } : (s = { top: $(window).scrollTop(), left: $(window).scrollLeft() }, t = document.documentElement), u = o.top - s.top, i = o.left - s.left, r = t.clientHeight, c = t.clientWidth, e = r - (u + n.offsetHeight), a = c - (i + n.offsetWidth), { top: u, left: i, bottom: e, right: a, height: r, width: c }) : void 0;
    };
}.call(this), function() {
    $.fn.overflowParent = function() {
        var t, e, n;
        if (!(t = this[0]))return $();
        if (t === document.body)return $();
        for (; t !== document.body;) {
            if (t = t.parentElement, !t)return $();
            if (n = $(t).css("overflow-y"), e = $(t).css("overflow-x"), "auto" === n || "auto" === e || "scroll" === n || "scroll" === e)break;
        }
        return $(t);
    };
}.call(this), function() {
    var t, e, n, r, i, o, a, s, u, c, l, f, h, d, p, g, m, v, y, b, x, w, _, M, k, S, T, E;
    i = navigator.userAgent.match(/Macintosh/), m = navigator.userAgent.match(/Macintosh/) ? "meta" : "ctrl", u = !1, v = { x: 0, y: 0 }, e = function(t) { t.addEventListener("mousemove", y, !1), t.addEventListener("mouseover", b, !1); }, E = function(t) { t.removeEventListener("mousemove", y, !1), t.removeEventListener("mouseover", b, !1); }, $.observe(".js-navigation-container", { add: e, remove: E }), y = function(t) { (v.x !== t.clientX || v.y !== t.clientY) && (u = !1), v = { x: t.clientX, y: t.clientY }; }, b = function(t) { u || $(t.target).trigger("navigation:mouseover"); }, $(document).on("keydown", function(t) {
        var e, n, r;
        if ((t.target === document.body || $(t.target).hasClass("js-navigation-enable")) && (e = h()))return u = !0, r = $(e).find(".js-navigation-item.navigation-focus")[0] || e, n = $(r).fire("navigation:keydown", { originalEvent: t, hotkey: t.hotkey, relatedTarget: e }), n.isDefaultPrevented() && t.preventDefault(), n.result;
    }), $(document).on("navigation:keydown", ".js-active-navigation-container", function(t) {
        var e, n, r;
        if (e = this, n = $(t.originalEvent.target).is(":input"), $(t.target).is(".js-navigation-item"))
            if (r = t.target, n) {
                if (i)
                    switch (t.hotkey) {
                    case"ctrl+n":
                        o(r, e);
                        break;
                    case"ctrl+p":
                        a(r, e);
                    }
                switch (t.hotkey) {
                case"up":
                    a(r, e);
                    break;
                case"down":
                    o(r, e);
                    break;
                case"enter":
                    g(r);
                    break;
                case"" + m + "+enter":
                    g(r, !0);
                }
            } else {
                if (i)
                    switch (t.hotkey) {
                    case"ctrl+n":
                        o(r, e);
                        break;
                    case"ctrl+p":
                        a(r, e);
                        break;
                    case"alt+v":
                        w(r, e);
                        break;
                    case"ctrl+v":
                        x(r, e);
                    }
                switch (t.hotkey) {
                case"j":
                    o(r, e);
                    break;
                case"k":
                    a(r, e);
                    break;
                case"o":
                case"enter":
                    g(r);
                    break;
                case"" + m + "+enter":
                    g(r, !0);
                }
            }
        else if (r = d(e)[0], n) {
            if (i)
                switch (t.hotkey) {
                case"ctrl+n":
                    f(r, e);
                }
            switch (t.hotkey) {
            case"down":
                f(r, e);
            }
        } else {
            if (i)
                switch (t.hotkey) {
                case"ctrl+n":
                case"ctrl+v":
                    f(r, e);
                }
            switch (t.hotkey) {
            case"j":
                f(r, e);
            }
        }
        if (n) {
            if (i)
                switch (t.hotkey) {
                case"ctrl+n":
                case"ctrl+p":
                    t.preventDefault();
                }
            switch (t.hotkey) {
            case"up":
            case"down":
                t.preventDefault();
                break;
            case"enter":
            case"" + m + "+enter":
                t.preventDefault();
            }
        } else {
            if (i)
                switch (t.hotkey) {
                case"ctrl+n":
                case"ctrl+p":
                case"alt+v":
                case"ctrl+v":
                    t.preventDefault();
                }
            switch (t.hotkey) {
            case"j":
            case"k":
                t.preventDefault();
                break;
            case"o":
            case"enter":
            case"" + m + "+enter":
                t.preventDefault();
            }
        }
    }), $(document).on("navigation:mouseover", ".js-active-navigation-container .js-navigation-item", function(t) {
        var e;
        e = $(t.currentTarget).closest(".js-navigation-container")[0], f(t.currentTarget, e);
    }), c = function(t) {
        var e, n, r;
        r = t.currentTarget, n = t.modifierKey || t.altKey || t.ctrlKey || t.metaKey, e = $(r).fire("navigation:open", { modifierKey: n }), e.isDefaultPrevented() && t.preventDefault();
    }, $(document).on("click", ".js-active-navigation-container .js-navigation-item", function(t) { c(t); }), $(document).on("navigation:keyopen", ".js-active-navigation-container .js-navigation-item", function(t) {
        var e;
        (e = $(this).filter(".js-navigation-open")[0] || $(this).find(".js-navigation-open")[0]) ? (t.modifierKey ? (window.open(e.href, "_blank"), window.focus()) : $(e).click(), t.preventDefault()) : c(t);
    }), t = function(t) {
        var e;
        return e = h(), t !== e ? $(t).fire("navigation:activate", function() { return e && $(e).removeClass("js-active-navigation-container"), $(t).addClass("js-active-navigation-container"), $(t).fire("navigation:activated", { async: !0 }); }) : void 0;
    }, s = function(t) { return $(t).fire("navigation:deactivate", function() { return $(t).removeClass("js-active-navigation-container"), $(t).fire("navigation:deactivated", { async: !0 }); }); }, r = [], M = function(e) {
        var n;
        (n = h()) && r.push(n), t(e);
    }, _ = function(e) {
        var i;
        s(e), n(e), (i = r.pop()) && t(i);
    }, l = function(e, n) {
        var r, i, o;
        r = d(n)[0], o = $(e).closest(".js-navigation-item")[0] || r, t(n), i = f(o, n), i || o && T($(o).overflowParent()[0], o);
    }, n = function(t) { $(t).find(".navigation-focus.js-navigation-item").removeClass("navigation-focus"); }, k = function(t, e) { n(e), l(t, e); }, a = function(t, e) {
        var n, r, i, o;
        if (i = d(e), r = $.inArray(t, i), o = i[r - 1]) {
            if (n = f(o, e))return;
            e = $(o).overflowParent()[0], "page" === p(e) ? T(e, o) : S(e, o);
        }
    }, o = function(t, e) {
        var n, r, i, o;
        if (i = d(e), r = $.inArray(t, i), o = i[r + 1]) {
            if (n = f(o, e))return;
            e = $(o).overflowParent()[0], "page" === p(e) ? T(e, o) : S(e, o);
        }
    }, w = function(t, e) {
        var n, r, i, o;
        for (i = d(e), r = $.inArray(t, i), e = $(t).overflowParent()[0]; (o = i[r - 1]) && $(o).overflowOffset(e).top >= 0;)r--;
        if (o) {
            if (n = f(o, e))return;
            T(e, o);
        }
    }, x = function(t, e) {
        var n, r, i, o;
        for (i = d(e), r = $.inArray(t, i), e = $(t).overflowParent()[0]; (o = i[r + 1]) && $(o).overflowOffset(e).bottom >= 0;)r++;
        if (o) {
            if (n = f(o, e))return;
            T(e, o);
        }
    }, g = function(t, e) { null == e && (e = !1), $(t).fire("navigation:keyopen", { modifierKey: e }); }, f = function(t, e) {
        var r;
        return r = $(t).fire("navigation:focus", function() { return n(e), $(t).addClass("navigation-focus"), $(t).fire("navigation:focused", { async: !0 }); }), r.isDefaultPrevented();
    }, h = function() { return $(".js-active-navigation-container")[0]; }, d = function(t) { return $(t).find(".js-navigation-item").filter(":visible"); }, p = function(t) {
        var e;
        return null != (e = $(t).attr("data-navigation-scroll")) ? e : "item";
    }, T = function(t, e) {
        var n, r, i, o;
        return r = $(e).positionedOffset(t), n = $(e).overflowOffset(t), n.bottom <= 0 ? $(t).scrollTo({ top: r.top - 30, duration: 200 }) : n.top <= 0 ? (i = null != t.offsetParent ? t.scrollHeight : $(document).height(), o = i - (r.bottom + n.height), $(t).scrollTo({ top: o + 30, duration: 200 })) : void 0;
    }, S = function(t, e) {
        var n, r, i, o;
        return r = $(e).positionedOffset(t), n = $(e).overflowOffset(t), n.bottom <= 0 ? (i = null != t.offsetParent ? t.scrollHeight : $(document).height(), o = i - (r.bottom + n.height), $(t).scrollTo({ top: o })) : n.top <= 0 ? $(t).scrollTo({ top: r.top }) : void 0;
    }, $.fn.navigation = function(e) {
        var r, i, o = this;
        if ("active" === e)return h();
        if (r = $(this).closest(".js-navigation-container")[0])return i = { activate: function() { return t(r); }, deactivate: function() { return s(r); }, push: function() { return M(r); }, pop: function() { return _(r); }, focus: function() { return l(o, r); }, clear: function() { return n(r); }, refocus: function() { return k(o, r); } }, "function" == typeof i[e] ? i[e]() : void 0;
    };
}.call(this), function() {
    $(document).on("keydown", function(t) {
        var e, n, r, i, o, a;
        if ("r" === t.hotkey && t.target === document.body && (o = window.getSelection(), a = $(o.focusNode), (e = a.closest(".js-quote-selection-container")[0]) && (r = $(e).find(".js-quote-selection-target:visible")[0])))return o.toString() && (i = "> " + o.toString().replace(/\n/g, "\n> ") + "\n\n", (n = r.value) && (i = "" + n + "\n\n" + i), r.value = i), $(r).scrollTo({ duration: 300 }, function() { return r.focus(), r.selectionStart = r.value.length; }), t.preventDefault();
    });
}.call(this), function() {
    var t, e, n;
    n = function(t) {
        var e, n, r;
        (n = t.getAttribute("datetime")) && (e = moment(n, "YYYY-MM-DDTHH:mm:ssZ")) && (r = e.fromNow(), "a few seconds ago" === r && (r = "just now"), t.textContent !== r && (t.textContent = r));
    }, t = $.observe(".js-relative-date", { add: n }), setInterval(e = function() {
        var e, r, i, o;
        for (o = t.elements, r = 0, i = o.length; i > r; r++)e = o[r], n(e);
    }, 6e4);
}.call(this), function() {
    var t;
    null != window.getSelection && (t = function(e, n) {
        var r, i, o, a;
        if (e === n)return!0;
        for (a = e.childNodes, i = 0, o = a.length; o > i; i++)if (r = a[i], t(r, n))return!0;
        return!1;
    }, $(document).on("click", ".js-selectable-text", function() {
        var e, n;
        n = window.getSelection(), n.rangeCount && (e = n.getRangeAt(0).commonAncestorContainer, t(this, e) || n.selectAllChildren(this));
    }));
}.call(this), function() {
    $.debounce = function(t, e) {
        var n;
        return n = null, function() { n && clearTimeout(n), n = setTimeout(t, e); };
    };
}.call(this), function() {
    var t, e;
    t = function() {
        var t, e, n;
        t = null, n = $.debounce(function() { return t = null; }, 200), e = { x: 0, y: 0 }, $(this).on("mousemove.userResize", function(r) {
            var i;
            (e.x !== r.clientX || e.y !== r.clientY) && (i = this.style.height, t && t !== i && $(this).trigger("user:resize"), t = i, n()), e = { x: r.clientX, y: r.clientY };
        });
    }, e = function() { $(this).off("mousemove.userResize"); }, $.event.special["user:resize"] = { setup: t, teardown: e };
}.call(this), function() {
    var t, e, n, r;
    n = function(t) { return $(t).on("user:resize.trackUserResize", function() { return $(t).addClass("is-user-resized"); }); }, r = function(t) { return $(t).off("user:resize.trackUserResize"); }, $(document).on("reset", "form", function() { $(this).find("textarea.js-size-to-fit").removeClass("is-user-resized"); }), $.observe("textarea.js-size-to-fit", { add: n, remove: r }), t = function(t) {
        var e, n, r;
        e = $(t), n = null, r = function() {
            var r, i;
            t.value !== n && e.is(":visible") && (i = e.overflowOffset(), i.top < 0 || i.bottom < 0 || (r = e.outerHeight() + i.bottom, t.style.maxHeight = "" + (r - 100) + "px", t.style.height = "auto", e.innerHeight(t.scrollHeight), n = t.value));
        }, e.on("change.sizeToFit", function() { return r(); }), e.on("input.sizeToFit", function() { return r(); }), t.value && r();
    }, e = function(t) { $(t).off(".sizeToFit"); }, $.observe("textarea.js-size-to-fit:not(.is-user-resized)", { add: t, remove: e });
}.call(this), function() { $.escapeHTML = function(t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\//g, "&#x2F;"); }; }.call(this), function() {
    var t;
    $.observe(".js-obfuscate-email", t = function(t) {
        var e, n, r, i, o, a;
        e = $(t), (a = e.attr("data-email")) && (r = decodeURIComponent(a), o = e.text().replace(/{email}/, r), e.html(o), (i = e.attr("href")) && (n = $.escapeHTML($("<div>").html(r).text()), e.attr("href", i.replace(/{email}/, n))));
    });
}.call(this), function() {
    $.fn.ajax = function(t) {
        var e, n, r, i, o, a = this;
        return null == t && (t = {}), o = $.Deferred(), 1 !== this.length ? (o.reject(), o.promise()) : (e = this[0], (i = this.attr("data-url")) ? (o = this.data("xhr")) ? o : (n = { type: "GET", url: i, context: e }, r = $.extend(n, t), o = $.ajax(r), this.data("xhr", o), o.always(function() { return a.removeData("xhr"); }), o) : (o.rejectWith(e), o.promise()));
    };
}.call(this), function() {
    $.fn.hasDirtyFields = function() {
        var t, e, n, r;
        for (r = this.find("input, textarea"), e = 0, n = r.length; n > e; e++)if (t = r[e], t.value !== t.defaultValue)return!0;
        return!1;
    };
}.call(this), function() {
    $.fn.hasFocus = function() {
        var t, e;
        return(e = this[0]) ? (t = document.activeElement, e === t || $.contains(e, t)) : !1;
    };
}.call(this), function() {
    $.fn.hasMousedown = function() {
        var t;
        return(t = this[0]) ? $(t).is(":active") : !1;
    };
}.call(this), function() {
    $.fn.hasSelection = function() {
        var t, e, n;
        return(e = this[0]) ? (n = window.getSelection(), n && "Range" === n.type && null != n.focusNode ? (t = n.focusNode, e === t || $.contains(e, t)) : !1) : !1;
    };
}.call(this), function() { $.fn.markedAsDirty = function() { return this.closest(".js-dirty").length > 0 || this.find(".js-dirty").length > 0; }; }.call(this), function() { $.fn.hasInteractions = function() { return this.hasDirtyFields() || this.hasFocus() || this.hasMousedown() || this.hasSelection() || this.markedAsDirty(); }; }.call(this), function() {
    var t, e;
    t = "cremaInstall" + Math.floor(1e9 * Math.random()), e = 0, $.fn.install = function(n) {
        var r, i, o, a, s;
        for ((i = n[t]) || (i = ++e, Object.defineProperty(n, t, { enumerable: !1, configurable: !1, writable: !1, value: i })), o = "" + t + "." + i, a = 0, s = this.length; s > a; a++)r = this[a], r[o] || (n.call(r, r), r[o] = !0);
        return this;
    };
}.call(this), function() {
    var t, e;
    $.fn.notScrolling = function(t) {
        var n;
        return n = $.Deferred(), t && n.done(t), 1 === this.length ? e(this[0], function() { return n.resolve(); }) : n.reject(), n.promise();
    }, t = 0, window.addEventListener("scroll", function(e) { t = e.timeStamp || (new Date).getTime(); }, !0), e = function(e, n) {
        var r;
        return e === window && t < (new Date).getTime() - 500 ? (setImmediate(n), void 0) : (r = $.debounce(function() { return e.removeEventListener("scroll", r, !1), n(); }, 500), e.addEventListener("scroll", r, !1), r(), void 0);
    };
}.call(this), function() {
    var t;
    $.fn.preservingScrollPosition = function(e) {
        var n, r, i, o, a, s, u, c, l, f;
        if (0 === this.length)return e.call(this);
        if (n = this.overflowParent(), !(r = n[0]))return e.call(this);
        for (i = r.offsetParent ? { top: n.scrollTop(), left: n.scrollLeft() } : { top: $(document).scrollTop(), left: $(document).scrollLeft() }, u = t(this[0], r), e.call(this), c = 0, l = u.length; l > c; c++)
            if (f = u[c], o = f[0], s = f[1], a = $(o).positionedOffset(n)) {
                (s.top !== a.top || s.left !== a.left) && n.scrollTo({ top: i.top - s.top + a.top, left: i.left - s.left + a.left });
                break;
            }
        return this;
    }, t = function(t, e) {
        var n;
        for (n = []; t !== e;)if (n.push([t, $(t).positionedOffset(e)]), t = t.parentElement, !t)return[];
        return n;
    };
}.call(this), function() {
    $.interactiveElement = function() {
        var t, e, n;
        return document.activeElement !== document.body ? t = document.activeElement : (e = document.querySelectorAll(":hover"), (n = e.length) && (t = e[n - 1])), $(t);
    };
}.call(this), function() { $.preserveInteractivePosition = function(t) { return $(window).notScrolling().done(function() { $.interactiveElement().preservingScrollPosition(t); }); }; }.call(this), function() {
    $.fn.touch = function(t) {
        var e, n, r, i, o;
        if (t)for (n = 0, i = this.length; i > n; n++)e = this[n], e.offsetHeight;
        else for (r = 0, o = this.length; o > r; r++)e = this[r], e.className = e.className;
        return this;
    };
}.call(this), function() {
    $(document).on("focusin.delay", function(t) {
        var e;
        e = t.target, $.data(e, "focus-delay-active") || $(e).fire("focusin:delay", function() { $.data(e, "focus-delay-active", !0), $(e).trigger("focusin:delayed"); });
    }), $(document).on("focusout.delay", function(t) {
        return setTimeout(function() {
            var e;
            e = t.target, e !== document.activeElement && $(e).fire("focusout:delay", function() { $.removeData(t.target, "focus-delay-active"), $(e).trigger("focusout:delayed"); });
        }, 200);
    });
}.call(this), function() {
    $.fn.onFocusedInput = function(t, e) {
        var n;
        return n = "focusInput" + Math.floor(1e3 * Math.random()), this.focused(t)["in"](function() {
            var t;
            return(t = e.call(this, n)) ? $(this).on("input." + n, t) : void 0;
        }).out(function() { return $(this).off("." + n); }), this;
    };
}.call(this), function() {
    $.fn.onFocusedKeydown = function(t, e) {
        var n;
        return n = "focusKeydown" + Math.floor(1e3 * Math.random()), this.focused(t)["in"](function() {
            var t;
            return(t = e.call(this, n)) ? $(this).on("keydown." + n, t) : void 0;
        }).out(function() { return $(this).off("." + n); }), this;
    };
}.call(this), function() {
    var t, e;
    t = $.readyQueue(function(t) { e(t, null, window.location.href); }), $.hashChange = t.push, $(window).on("hashchange", function(n) {
        var r;
        r = n.originalEvent, e(t.handlers, r.oldURL, r.newURL);
    }), e = function(t, e, n) {
        var r, i, o, a, s, u;
        for ((o = window.location.hash.slice(1)) && (a = document.getElementById(o)), null == a && (a = window), r = { oldURL: e, newURL: n, target: a }, s = 0, u = t.length; u > s; s++)i = t[s], i.call(a, r);
    };
}.call(this), function() {
    var t, e;
    t = ["position:absolute;", "overflow:auto;", "white-space:pre-wrap;", "word-wrap:break-word;", "top:0px;", "left:-9999px;"], e = ["box-sizing", "font-family", "font-size", "font-style", "font-variant", "font-weight", "height", "letter-spacing", "line-height", "max-height", "min-height", "padding-bottom", "padding-left", "padding-right", "padding-top", "text-decoration", "text-indent", "text-transform", "width", "word-spacing"], $.fn.textareaMirror = function(n) {
        var r, i, o, a, s, u, c, l, f, h, d;
        if ((f = this[0]) && "textarea" === f.nodeName.toLowerCase()) {
            if (a = f.previousElementSibling, a && "js-textarea-mirror" === a.className)a.innerHTML = "";
            else {
                for (a = document.createElement("div"), a.className = "js-textarea-mirror", c = window.getComputedStyle(f), u = t.slice(0), h = 0, d = e.length; d > h; h++)s = e[h], u.push("" + s + ":" + c[s] + ";");
                a.style.cssText = u.join(" ");
            }
            return n !== !1 && (o = document.createElement("span"), o.className = "js-marker", o.innerHTML = "&nbsp;"), "number" == typeof n ? ((l = f.value.substring(0, n)) && (i = document.createTextNode(l)), (l = f.value.substring(n)) && (r = document.createTextNode(l))) : (l = f.value) && (i = document.createTextNode(l)), i && a.appendChild(i), o && a.appendChild(o), r && a.appendChild(r), a.parentElement || f.parentElement.insertBefore(a, f), a.scrollTop = f.scrollTop, a;
        }
    };
}.call(this), function() {
    $.fn.textareaSelectionPosition = function() {
        var t, e, n;
        if ((n = this[0]) && null != n.selectionEnd && (t = $(n).textareaMirror(n.selectionEnd)))return e = $(t).find(".js-marker").position(), setTimeout(function() { return $(t).remove(); }, 5e3), e;
    };
}.call(this), function() { $.commafy = function(t) { return("" + t).replace(/(^|[^\w.])(\d{4,})/g, function(t, e, n) { return e + n.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,"); }); }; }.call(this), function() { $.pluralize = function(t, e) { return e + (t > 1 || 0 === t ? "s" : ""); }; }.call(this), function() {
    var t, e, n, r, i, o, a, s, u;
    "ondragover" in window && (e = null, o = null, i = !1, a = function(t) {
        var r, a;
        a = t.target, a !== o && (i = n(t, o, a)), o = a, i && t.preventDefault(), clearTimeout(e), r = function() { return i = n(t, o, null), o = null; }, e = setTimeout(r, 100);
    }, n = function(t, e, n) {
        var r;
        return r = !0, e && $(e).fire("drag:out", { originalEvent: t, dataTransfer: t.originalEvent.dataTransfer, relatedTarget: n }), n && $(n).fire("drag:over", { originalEvent: t, dataTransfer: t.originalEvent.dataTransfer, relatedTarget: e }, function() { return r = !1; }), r;
    }, t = 0, s = function() { 1 === ++t && $(window).on("dragover", a); }, u = function() { 0 === --t && $(window).off("dragover", a); }, r = function(t) {
        var e, n, r, i, o;
        return i = this, o = t.type, n = t.relatedTarget, e = t.handleObj, (!n || n !== i && !$.contains(i, n)) && (t.type = e.origType, r = e.handler.apply(this, arguments), t.type = o), r;
    }, $.event.special["drag:out"] = { setup: s, teardown: u }, $.event.special["drag:over"] = { setup: s, teardown: u }, $.event.special["drag:enter"] = { handle: r, delegateType: "drag:over", bindType: "drag:over" }, $.event.special["drag:leave"] = { handle: r, delegateType: "drag:out", bindType: "drag:out" });
}.call(this), function() {
    var t, e;
    e = function() {
        var t;
        return t = document.createElement("div"), t.style.cssText = "position:sticky", "sticky" === t.style.position;
    }(), e || (t = function(t) {
        var e, n, r, i, o;
        return e = $(t), o = e.offset().top, (n = t.offsetParent) ? (i = $(n).offset().top, r = $(n).height(), document.addEventListener("scroll", function() {
            var t, n;
            n = window.scrollY, t = i + r - e.height(), t > o && n > o ? (e.addClass("stick"), n > t ? e.addClass("stick-bottom") : e.removeClass("stick-bottom")) : e.removeClass("stick stick-bottom");
        })) : void 0;
    }, $.observe(".sticky", t));
}.call(this), function() {
    var t;
    t = {}, $(document).bind("keydown", function(e) {
        var n;
        if (e.target === document.body)return(n = t[e.hotkey]) ? n.apply(this, arguments) : void 0;
    }), $.hotkeys = function(t) {
        var e, n;
        for (e in t)n = t[e], $.hotkey(e, n);
        return this;
    }, $.hotkey = function(e, n) { return t[e] = n, this; };
}.call(this), function() {}.call(this);