﻿function defineNetwork(t) {
    var e = function(t, e, n) { this.container = t, this.width = e, this.height = n, this.loaderInterval = null, this.loaderOffset = 0, this.ctx = this.initCanvas(t, e, n), this.startLoader("Loading graph data"), this.loadMeta(); };
    return e.prototype = {
        initCanvas: function(e) {
            var n = t(e).find("canvas")[0];
            n.style.zIndex = "0";
            var s = n.width, r = n.height, a = n.getContext("2d"), i = window.devicePixelRatio || 1, o = a.webkitBackingStorePixelRatio || a.mozBackingStorePixelRatio || a.msBackingStorePixelRatio || a.oBackingStorePixelRatio || a.backingStorePixelRatio || 1, c = i / o;
            return 1 === c ? a : (n.width = s * c, n.height = r * c, n.style.width = s + "px", n.style.height = r + "px", a.scale(c, c), a);
        },
        startLoader: function(t) { this.ctx.save(), this.ctx.font = "14px Monaco, monospace", this.ctx.fillStyle = "#cacaca", this.ctx.textAlign = "center", this.ctx.fillText(t, this.width / 2, 155), this.ctx.restore(), this.displayLoader(); },
        stopLoader: function() { t(".large-loading-area").hide(); },
        displayLoader: function() { t(".large-loading-area").show(); },
        loadMeta: function() {
            var e = this;
            e.loaded = !1, t.smartPoller(function(n) { t.ajax({ url: "network_meta", success: function(s) { s && s.nethash ? (e.loaded = !0, t(".js-network-poll").hide(), t(".js-network-current").show(), e.init(s)) : n(); } }); });
        },
        init: function(t) {
            this.focus = t.focus, this.nethash = t.nethash, this.spaceMap = t.spacemap, this.userBlocks = t.blocks, this.commits = [];
            for (var n = 0; n < t.dates.length; n++)this.commits.push(new e.Commit(n, t.dates[n]));
            this.users = {};
            for (var n = 0; n < t.users.length; n++) {
                var s = t.users[n];
                this.users[s.name] = s;
            }
            this.chrome = new e.Chrome(this, this.ctx, this.width, this.height, this.focus, this.commits, this.userBlocks, this.users), this.graph = new e.Graph(this, this.ctx, this.width, this.height, this.focus, this.commits, this.users, this.spaceMap, this.userBlocks, this.nethash), this.mouseDriver = new e.MouseDriver(this.container, this.chrome, this.graph), this.keyDriver = new e.KeyDriver(this.container, this.chrome, this.graph), this.stopLoader(), this.graph.drawBackground(), this.chrome.draw(), this.graph.requestInitialChunk();
        },
        initError: function() { this.stopLoader(), this.ctx.clearRect(0, 0, this.width, this.height), this.startLoader("Graph could not be drawn due to a network IO problem."); }
    }, e.Commit = function(t, e) { this.time = t, this.date = moment(e, "YYYY-MM-DD HH:mm:ss"), this.requested = null, this.populated = null; }, e.Commit.prototype = {
        populate: function(t, e, n) { this.user = e, this.author = t.author, this.date = moment(t.date, "YYYY-MM-DD HH:mm:ss"), this.gravatar = t.gravatar, this.id = t.id, this.login = t.login, this.message = t.message, this.space = t.space, this.time = t.time, this.parents = this.populateParents(t.parents, n), this.requested = !0, this.populated = new Date; },
        populateParents: function(t, e) {
            for (var n = [], s = 0; s < t.length; s++) {
                var r = t[s], a = e[r[1]];
                a.id = r[0], a.space = r[2], n.push(a);
            }
            return n;
        }
    }, e.Chrome = function(t, e, n, s, r, a, i, o) { this.namesWidth = 100, this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], this.userBgColors = ["#EBEBFF", "#E0E0FF"], this.network = t, this.ctx = e, this.width = n, this.height = s, this.commits = a, this.userBlocks = i, this.users = o, this.offsetX = this.namesWidth + (n - this.namesWidth) / 2 - 20 * r, this.offsetY = 0, this.contentHeight = this.calcContentHeight(), this.graphMidpoint = this.namesWidth + (n - this.namesWidth) / 2, this.activeUser = null; }, e.Chrome.prototype = {
        moveX: function(t) { this.offsetX += t, this.offsetX > this.graphMidpoint ? this.offsetX = this.graphMidpoint : this.offsetX < this.graphMidpoint - 20 * this.commits.length && (this.offsetX = this.graphMidpoint - 20 * this.commits.length); },
        moveY: function(t) { this.offsetY += t, this.offsetY > 0 || this.contentHeight < this.height - 40 ? this.offsetY = 0 : this.offsetY < -this.contentHeight + this.height / 2 && (this.offsetY = -this.contentHeight + this.height / 2); },
        calcContentHeight: function() {
            for (var t = 0, e = 0; e < this.userBlocks.length; e++) {
                var n = this.userBlocks[e];
                t += n.count;
            }
            return 20 * t;
        },
        hover: function(t, e) {
            for (var n = 0; n < this.userBlocks.length; n++) {
                var s = this.userBlocks[n];
                if (t > 0 && t < this.namesWidth && e > 40 + this.offsetY + 20 * s.start && e < 40 + this.offsetY + 20 * (s.start + s.count))return this.users[s.name];
            }
            return null;
        },
        draw: function() { this.drawTimeline(this.ctx), this.drawUsers(this.ctx), this.drawFooter(this.ctx); },
        drawTimeline: function(t) {
            t.fillStyle = "#111111", t.fillRect(0, 0, this.width, 20), t.fillStyle = "#333333", t.fillRect(0, 20, this.width, 20);
            var e = parseInt((0 - this.offsetX) / 20);
            0 > e && (e = 0);
            var n = e + parseInt(this.width / 20);
            n > this.commits.length && (n = this.commits.length), t.save(), t.translate(this.offsetX, 0), t.font = "10px Helvetica, sans-serif";
            for (var s = null, r = null, a = e; n > a; a++) {
                var i = this.commits[a], o = this.months[i.date.month()];
                o != s && (t.fillStyle = "#ffffff", t.fillText(o, 20 * a - 3, 14), s = o);
                var c = parseInt(i.date.date());
                c != r && (t.fillStyle = "#ffffff", t.fillText(c, 20 * a - 3, 33), r = c);
            }
            t.restore();
        },
        drawUsers: function(t) {
            t.fillStyle = "#FFFFFF", t.fillRect(0, 0, this.namesWidth, this.height), t.save(), t.translate(0, 40 + this.offsetY);
            for (var e = 0; e < this.userBlocks.length; e++) {
                var n = this.userBlocks[e];
                t.fillStyle = this.userBgColors[e % 2], t.fillRect(0, 20 * n.start, this.namesWidth, 20 * n.count), this.activeUser && this.activeUser.name == n.name && (t.fillStyle = "rgba(0, 0, 0, 0.05)", t.fillRect(0, 20 * n.start, this.namesWidth, 20 * n.count)), t.fillStyle = "#DDDDDD", t.fillRect(0, 20 * n.start, 1, 20 * n.count), t.fillRect(this.namesWidth - 1, 20 * n.start, 1, 20 * n.count), t.fillRect(this.width - 1, 20 * n.start, 1, 20 * n.count), t.fillRect(0, 20 * (n.start + n.count) - 1, this.namesWidth, 1), t.measureText(n.name).width;
                var s = 20 * (n.start + n.count / 2) + 3;
                t.fillStyle = "#000000", t.font = "12px Monaco, monospace", t.textAlign = "center", t.fillText(n.name, this.namesWidth / 2, s, 96);
            }
            t.restore(), t.fillStyle = "#111111", t.fillRect(0, 0, this.namesWidth, 20), t.fillStyle = "#333333", t.fillRect(0, 20, this.namesWidth, 20);
        },
        drawFooter: function(t) { t.fillStyle = "#F4F4F4", t.fillRect(0, this.height - 20, this.width, 20), t.fillStyle = "#CCCCCC", t.fillRect(0, this.height - 20, this.width, 1), t.fillStyle = "#000000", t.font = "11px Monaco, monospace", t.fillText("GitHub Network Graph Viewer v4.0.0", 5, this.height - 5); }
    }, e.Graph = function(t, e, n, s, r, a, i, o, c, l) {
        this.namesWidth = 100, this.spaceColors = [], this.bgColors = ["#F5F5FF", "#F0F0FF"], this.spaceColors.push("#FF0000"), this.spaceColors.push("#0000FF"), this.spaceColors.push("#00FF00"), this.spaceColors.push("#FF00FF"), this.spaceColors.push("#E2EB00"), this.spaceColors.push("#FFA600"), this.spaceColors.push("#00FFFC"), this.spaceColors.push("#DD458E"), this.spaceColors.push("#AD7331"), this.spaceColors.push("#97AD31"), this.spaceColors.push("#51829D"), this.spaceColors.push("#70387F"), this.spaceColors.push("#740000"), this.spaceColors.push("#745C00"), this.spaceColors.push("#419411"), this.spaceColors.push("#37BE8C"), this.spaceColors.push("#6C5BBD"), this.spaceColors.push("#F300AA"), this.spaceColors.push("#586D41"), this.spaceColors.push("#3B4E31"), this.network = t, this.ctx = e, this.width = n, this.height = s, this.focus = r, this.commits = a, this.users = i, this.spaceMap = o, this.userBlocks = c, this.nethash = l, this.offsetX = this.namesWidth + (n - this.namesWidth) / 2 - 20 * r, this.offsetY = 0, this.bgCycle = 0, this.marginMap = {}, this.gravatars = {}, this.activeCommit = null, this.contentHeight = this.calcContentHeight(), this.graphMidpoint = this.namesWidth + (n - this.namesWidth) / 2, this.showRefs = !0, this.lastHotLoadCenterIndex = null, this.connectionMap = {}, this.spaceUserMap = {};
        for (var u = 0; u < c.length; u++)for (var d = c[u], h = d.start; h < d.start + d.count; h++)this.spaceUserMap[h] = i[d.name];
        this.headsMap = {};
        for (var u = 0; u < c.length; u++)
            for (var d = c[u], f = i[d.name], h = 0; h < f.heads.length; h++) {
                var m = f.heads[h];
                this.headsMap[m.id] || (this.headsMap[m.id] = []);
                var p = { name: f.name, head: m };
                this.headsMap[m.id].push(p);
            }
    }, e.Graph.prototype = {
        moveX: function(t) { this.offsetX += t, this.offsetX > this.graphMidpoint ? this.offsetX = this.graphMidpoint : this.offsetX < this.graphMidpoint - 20 * this.commits.length && (this.offsetX = this.graphMidpoint - 20 * this.commits.length), this.hotLoadCommits(); },
        moveY: function(t) { this.offsetY += t, this.offsetY > 0 || this.contentHeight < this.height - 40 ? this.offsetY = 0 : this.offsetY < -this.contentHeight + this.height / 2 && (this.offsetY = -this.contentHeight + this.height / 2); },
        toggleRefs: function() { this.showRefs = !this.showRefs; },
        calcContentHeight: function() {
            for (var t = 0, e = 0; e < this.userBlocks.length; e++) {
                var n = this.userBlocks[e];
                t += n.count;
            }
            return 20 * t;
        },
        hover: function(t, e) {
            for (var n = this.timeWindow(), s = n.min; s <= n.max; s++) {
                var r = this.commits[s], a = this.offsetX + 20 * r.time, i = this.offsetY + 50 + 20 * r.space;
                if (t > a - 5 && a + 5 > t && e > i - 5 && i + 5 > e)return r;
            }
            return null;
        },
        hotLoadCommits: function() {
            var t = 200, e = parseInt((-this.offsetX + this.graphMidpoint) / 20);
            if (0 > e && (e = 0), e > this.commits.length - 1 && (e = this.commits.length - 1), !(this.lastHotLoadCenterIndex && Math.abs(this.lastHotLoadCenterIndex - e) < 10)) {
                this.lastHotLoadCenterIndex = e;
                var n = this.backSpan(e, t), s = this.frontSpan(e, t);
                if (n || s) {
                    var r = n ? n[0] : s[0], a = s ? s[1] : n[1];
                    this.requestChunk(r, a);
                }
            }
        },
        backSpan: function(t, e) {
            for (var n = null, s = t; s >= 0 && s > t - e; s--)
                if (!this.commits[s].requested) {
                    n = s;
                    break;
                }
            if (null != n) {
                for (var r = null, a = null, s = n; s >= 0 && s > n - e; s--)
                    if (this.commits[s].requested) {
                        r = s;
                        break;
                    }
                return r ? a = r + 1 : (a = n - e, 0 > a && (a = 0)), [a, n];
            }
            return null;
        },
        frontSpan: function(t, e) {
            for (var n = null, s = t; s < this.commits.length && t + e > s; s++)
                if (!this.commits[s].requested) {
                    n = s;
                    break;
                }
            if (null != n) {
                for (var r = null, a = null, s = n; s < this.commits.length && n + e > s; s++)
                    if (this.commits[s].requested) {
                        r = s;
                        break;
                    }
                return a = r ? r - 1 : n + e >= this.commits.length ? this.commits.length - 1 : n + e, [n, a];
            }
            return null;
        },
        requestInitialChunk: function() {
            var e = this;
            t.getJSON("network_data_chunk?nethash=" + this.nethash, function(t) { e.importChunk(t), e.draw(), e.network.chrome.draw(); });
        },
        requestChunk: function(e, n) {
            for (var s = e; n >= s; s++)this.commits[s].requested = new Date;
            var r = this, a = "network_data_chunk?nethash=" + this.nethash + "&start=" + e + "&end=" + n;
            t.getJSON(a, function(t) { r.importChunk(t), r.draw(), r.network.chrome.draw(), r.lastHotLoadCenterIndex = this.focus; });
        },
        importChunk: function(t) {
            for (var e = 0; e < t.commits.length; e++) {
                var n = t.commits[e], s = this.spaceUserMap[n.space], r = this.commits[n.time];
                r.populate(n, s, this.commits);
                for (var a = 0; a < r.parents.length; a++)for (var i = r.parents[a], o = i.time + 1; o < r.time; o++)this.connectionMap[o] = this.connectionMap[o] || [], this.connectionMap[o].push(r);
            }
        },
        timeWindow: function() {
            var t = parseInt((this.namesWidth - this.offsetX + 20) / 20);
            0 > t && (t = 0);
            var e = t + parseInt((this.width - this.namesWidth) / 20);
            return e > this.commits.length - 1 && (e = this.commits.length - 1), { min: t, max: e };
        },
        draw: function() {
            this.drawBackground();
            var t = this.timeWindow(), e = t.min, n = t.max;
            this.ctx.save(), this.ctx.translate(this.offsetX, this.offsetY + 50);
            for (var s = {}, r = 0; r < this.spaceMap.length; r++)
                for (var a = this.spaceMap.length - r - 1, i = e; n >= i; i++) {
                    var o = this.commits[i];
                    o.populated && o.space == a && (this.drawConnection(o), s[o.id] = !0);
                }
            for (var r = e; n >= r; r++) {
                var c = this.connectionMap[r];
                if (c)
                    for (var i = 0; i < c.length; i++) {
                        var o = c[i];
                        s[o.id] || (this.drawConnection(o), s[o.id] = !0);
                    }
            }
            for (var r = 0; r < this.spaceMap.length; r++)
                for (var a = this.spaceMap.length - r - 1, i = e; n >= i; i++) {
                    var o = this.commits[i];
                    o.populated && o.space == a && (o == this.activeCommit ? this.drawActiveCommit(o) : this.drawCommit(o));
                }
            if (this.showRefs)
                for (var i = e; n >= i; i++) {
                    var o = this.commits[i];
                    if (o.populated) {
                        var l = this.headsMap[o.id];
                        if (l)
                            for (var u = 0, d = 0; d < l.length; d++) {
                                var h = l[d];
                                if (this.spaceUserMap[o.space].name == h.name) {
                                    var f = this.drawHead(o, h.head, u);
                                    u += f;
                                }
                            }
                    }
                }
            this.ctx.restore(), this.activeCommit && this.drawCommitInfo(this.activeCommit);
        },
        drawBackground: function() {
            this.ctx.clearRect(0, 0, this.width, this.height), this.ctx.save(), this.ctx.translate(0, this.offsetY + 50), this.ctx.clearRect(0, -10, this.width, this.height);
            for (var t = 0; t < this.userBlocks.length; t++) {
                var e = this.userBlocks[t];
                this.ctx.fillStyle = this.bgColors[t % 2], this.ctx.fillRect(0, 20 * e.start - 10, this.width, 20 * e.count), this.ctx.fillStyle = "#DDDDDD", this.ctx.fillRect(0, 20 * (e.start + e.count) - 11, this.width, 1);
            }
            this.ctx.restore();
        },
        drawCommit: function(t) {
            var e = 20 * t.time;
            y = 20 * t.space, this.ctx.beginPath(), this.ctx.arc(e, y, 3, 0, 2 * Math.PI, !1), this.ctx.fillStyle = this.spaceColor(t.space), this.ctx.fill();
        },
        drawActiveCommit: function(t) {
            var e = 20 * t.time, n = 20 * t.space;
            this.ctx.beginPath(), this.ctx.arc(e, n, 6, 0, 2 * Math.PI, !1), this.ctx.fillStyle = this.spaceColor(t.space), this.ctx.fill();
        },
        drawCommitInfo: function(t) {
            var e = this.splitLines(t.message, 54), n = 80 + 15 * e.length, s = this.offsetX + 20 * t.time, r = 50 + this.offsetY + 20 * t.space, a = 0, i = 0;
            a = s < this.graphMidpoint ? s + 10 : s - 410, i = r < 40 + (this.height - 40) / 2 ? r + 10 : r - n - 10, this.ctx.save(), this.ctx.translate(a, i), this.ctx.fillStyle = "#FFFFFF", this.ctx.strokeStyle = "#000000", this.ctx.lineWidth = "2", this.ctx.beginPath(), this.ctx.moveTo(0, 5), this.ctx.quadraticCurveTo(0, 0, 5, 0), this.ctx.lineTo(395, 0), this.ctx.quadraticCurveTo(400, 0, 400, 5), this.ctx.lineTo(400, n - 5), this.ctx.quadraticCurveTo(400, n, 395, n), this.ctx.lineTo(5, n), this.ctx.quadraticCurveTo(0, n, 0, n - 5), this.ctx.lineTo(0, 5), this.ctx.fill(), this.ctx.stroke();
            var o = this.gravatars[t.gravatar];
            if (o)this.drawGravatar(o, 10, 10);
            else {
                var c = this;
                window.location.protocol, o = new Image, o.src = t.gravatar, o.onload = function() { c.activeCommit == t && (c.drawGravatar(o, a + 10, i + 10), c.gravatars[t.gravatar] = o); };
            }
            this.ctx.fillStyle = "#000000", this.ctx.font = "bold 14px Helvetica, sans-serif", this.ctx.fillText(t.author, 55, 32), this.ctx.fillStyle = "#888888", this.ctx.font = "12px Monaco, monospace", this.ctx.fillText(t.id, 12, 65), this.drawMessage(e, 12, 85), this.ctx.restore();
        },
        drawGravatar: function(t, e, n) { this.ctx.strokeStyle = "#AAAAAA", this.ctx.lineWidth = 1, this.ctx.beginPath(), this.ctx.strokeRect(e + .5, n + .5, 35, 35), this.ctx.drawImage(t, e + 2, n + 2, 32, 32); },
        drawMessage: function(t, e, n) {
            this.ctx.font = "12px Monaco, monospace", this.ctx.fillStyle = "#000000";
            for (var s = 0; s < t.length; s++) {
                var r = t[s];
                this.ctx.fillText(r, e, n + 15 * s);
            }
        },
        splitLines: function(t, e) {
            for (var n = t.split(" "), s = [], r = "", a = 0; a < n.length; a++) {
                var i = n[a];
                r.length + 1 + i.length < e ? r = "" == r ? i : r + " " + i : (s.push(r), r = i);
            }
            return s.push(r), s;
        },
        drawHead: function(t, e, n) {
            this.ctx.font = "10.25px Monaco, monospace", this.ctx.save();
            var s = this.ctx.measureText(e.name).width;
            this.ctx.restore();
            var r = 20 * t.time, a = 20 * t.space + 5 + n;
            return this.ctx.save(), this.ctx.translate(r, a), this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)", this.ctx.beginPath(), this.ctx.moveTo(0, 0), this.ctx.lineTo(-4, 10), this.ctx.quadraticCurveTo(-9, 10, -9, 15), this.ctx.lineTo(-9, 15 + s), this.ctx.quadraticCurveTo(-9, 15 + s + 5, -4, 15 + s + 5), this.ctx.lineTo(4, 15 + s + 5), this.ctx.quadraticCurveTo(9, 15 + s + 5, 9, 15 + s), this.ctx.lineTo(9, 15), this.ctx.quadraticCurveTo(9, 10, 4, 10), this.ctx.lineTo(0, 0), this.ctx.fill(), this.ctx.fillStyle = "#FFFFFF", this.ctx.font = "12px Monaco, monospace", this.ctx.textBaseline = "middle", this.ctx.scale(.85, .85), this.ctx.rotate(Math.PI / 2), this.ctx.fillText(e.name, 17, -1), this.ctx.restore(), s + 20;
        },
        drawConnection: function(t) {
            for (var e = 0; e < t.parents.length; e++) {
                var n = t.parents[e];
                0 == e ? n.space == t.space ? this.drawBasicConnection(n, t) : this.drawBranchConnection(n, t) : this.drawMergeConnection(n, t);
            }
        },
        drawBasicConnection: function(t, e) {
            var n = this.spaceColor(e.space);
            this.ctx.strokeStyle = n, this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(20 * t.time, 20 * e.space), this.ctx.lineTo(20 * e.time, 20 * e.space), this.ctx.stroke();
        },
        drawBranchConnection: function(t, e) {
            var n = this.spaceColor(e.space);
            this.ctx.strokeStyle = n, this.ctx.lineWidth = 2, this.ctx.beginPath(), this.ctx.moveTo(20 * t.time, 20 * t.space), this.ctx.lineTo(20 * t.time, 20 * e.space), this.ctx.lineTo(20 * e.time - 14, 20 * e.space), this.ctx.stroke(), this.threeClockArrow(n, 20 * e.time, 20 * e.space);
        },
        drawMergeConnection: function(t, e) {
            var n = this.spaceColor(t.space);
            if (this.ctx.strokeStyle = n, this.ctx.lineWidth = 2, this.ctx.beginPath(), t.space > e.space) {
                this.ctx.moveTo(20 * t.time, 20 * t.space);
                var s = this.safePath(t.time, e.time, t.space);
                if (s)this.ctx.lineTo(20 * e.time - 10, 20 * t.space), this.ctx.lineTo(20 * e.time - 10, 20 * e.space + 15), this.ctx.lineTo(20 * e.time - 7.7, 20 * e.space + 9.5), this.ctx.stroke(), this.oneClockArrow(n, 20 * e.time, 20 * e.space);
                else {
                    var r = this.closestMargin(t.time, e.time, t.space, -1);
                    t.space == e.space + 1 && t.space == r + 1 ? (this.ctx.lineTo(20 * t.time, 20 * r + 10), this.ctx.lineTo(20 * e.time - 15, 20 * r + 10), this.ctx.lineTo(20 * e.time - 9.5, 20 * r + 7.7), this.ctx.stroke(), this.twoClockArrow(n, 20 * e.time, 20 * r), this.addMargin(t.time, e.time, r)) : t.time + 1 == e.time ? (r = this.closestMargin(t.time, e.time, e.space, 0), this.ctx.lineTo(20 * t.time, 20 * r + 10), this.ctx.lineTo(20 * e.time - 15, 20 * r + 10), this.ctx.lineTo(20 * e.time - 15, 20 * e.space + 10), this.ctx.lineTo(20 * e.time - 9.5, 20 * e.space + 7.7), this.ctx.stroke(), this.twoClockArrow(n, 20 * e.time, 20 * e.space), this.addMargin(t.time, e.time, r)) : (this.ctx.lineTo(20 * t.time + 10, 20 * t.space - 10), this.ctx.lineTo(20 * t.time + 10, 20 * r + 10), this.ctx.lineTo(20 * e.time - 10, 20 * r + 10), this.ctx.lineTo(20 * e.time - 10, 20 * e.space + 15), this.ctx.lineTo(20 * e.time - 7.7, 20 * e.space + 9.5), this.ctx.stroke(), this.oneClockArrow(n, 20 * e.time, 20 * e.space), this.addMargin(t.time, e.time, r));
                }
            } else {
                var r = this.closestMargin(t.time, e.time, e.space, -1);
                r < e.space ? (this.ctx.moveTo(20 * t.time, 20 * t.space), this.ctx.lineTo(20 * t.time, 20 * r + 10), this.ctx.lineTo(20 * e.time - 12.7, 20 * r + 10), this.ctx.lineTo(20 * e.time - 12.7, 20 * e.space - 10), this.ctx.lineTo(20 * e.time - 9.4, 20 * e.space - 7.7), this.ctx.stroke(), this.fourClockArrow(n, 20 * e.time, 20 * e.space), this.addMargin(t.time, e.time, r)) : (this.ctx.moveTo(20 * t.time, 20 * t.space), this.ctx.lineTo(20 * t.time, 20 * r + 10), this.ctx.lineTo(20 * e.time - 12.7, 20 * r + 10), this.ctx.lineTo(20 * e.time - 12.7, 20 * e.space + 10), this.ctx.lineTo(20 * e.time - 9.4, 20 * e.space + 7.7), this.ctx.stroke(), this.twoClockArrow(n, 20 * e.time, 20 * e.space), this.addMargin(t.time, e.time, r));
            }
        },
        addMargin: function(t, e, n) {
            var s = n;
            this.marginMap[s] || (this.marginMap[s] = []), this.marginMap[s].push([t, e]);
        },
        oneClockArrow: function(t, e, n) { this.ctx.fillStyle = t, this.ctx.beginPath(), this.ctx.moveTo(e - 6.3, n + 13.1), this.ctx.lineTo(e - 10.8, n + 9.7), this.ctx.lineTo(e - 2.6, n + 3.5), this.ctx.fill(); },
        twoClockArrow: function(t, e, n) { this.ctx.fillStyle = t, this.ctx.beginPath(), this.ctx.moveTo(e - 12.4, n + 6.6), this.ctx.lineTo(e - 9.3, n + 10.6), this.ctx.lineTo(e - 3.2, n + 2.4), this.ctx.fill(); },
        threeClockArrow: function(t, e, n) { this.ctx.fillStyle = t, this.ctx.beginPath(), this.ctx.moveTo(e - 14, n - 2.5), this.ctx.lineTo(e - 14, n + 2.5), this.ctx.lineTo(e - 4, n), this.ctx.fill(); },
        fourClockArrow: function(t, e, n) { this.ctx.fillStyle = t, this.ctx.beginPath(), this.ctx.moveTo(e - 12.4, n - 6.6), this.ctx.lineTo(e - 9.3, n - 10.6), this.ctx.lineTo(e - 3.2, n - 2.4), this.ctx.fill(); },
        safePath: function(t, e, n) {
            for (var s = 0; s < this.spaceMap[n].length; s++) {
                var r = this.spaceMap[n][s];
                if (this.timeInPath(t, r))return r[1] == e;
            }
            return!1;
        },
        closestMargin: function(t, e, n, s) {
            for (var r = this.spaceMap.length, a = s, i = !1, o = !1, c = !1; !o || !i;) {
                if (n + a >= 0 && this.safeMargin(t, e, n + a))return n + a;
                0 > n + a && (i = !0), n + a > r && (o = !0), 0 == c && 0 == a ? (a = -1, c = !0) : a = 0 > a ? -a - 1 : -a - 2;
            }
            return n > 0 ? n - 1 : 0;
        },
        safeMargin: function(t, e, n) {
            var s = n;
            if (!this.marginMap[s])return!0;
            for (var r = this.marginMap[s], a = 0; a < r.length; a++) {
                var i = r[a];
                if (this.pathsCollide([t, e], i))return!1;
            }
            return!0;
        },
        pathsCollide: function(t, e) { return this.timeWithinPath(t[0], e) || this.timeWithinPath(t[1], e) || this.timeWithinPath(e[0], t) || this.timeWithinPath(e[1], t); },
        timeInPath: function(t, e) { return t >= e[0] && t <= e[1]; },
        timeWithinPath: function(t, e) { return t > e[0] && t < e[1]; },
        spaceColor: function(t) { return 0 == t ? "#000000" : this.spaceColors[t % this.spaceColors.length]; }
    }, e.MouseDriver = function(e, n, s) {
        this.container = e, this.chrome = n, this.graph = s, this.dragging = !1, this.lastPoint = { x: 0, y: 0 }, this.lastHoverCommit = null, this.lastHoverUser = null, this.pressedCommit = null, this.pressedUser = null;
        var r = t(e).eq(0), a = t("canvas", r)[0], i = t(a).offset();
        a.style.cursor = "move";
        var o = this;
        this.up = function() { o.dragging = !1, o.pressedCommit && o.graph.activeCommit == o.pressedCommit ? window.open("/" + o.graph.activeCommit.user.name + "/" + o.graph.activeCommit.user.repo + "/commit/" + o.graph.activeCommit.id) : o.pressedUser && o.chrome.activeUser == o.pressedUser && (window.location = "/" + o.chrome.activeUser.name + "/" + o.chrome.activeUser.repo + "/network"), o.pressedCommit = null, o.pressedUser = null; }, this.down = function() { o.graph.activeCommit ? o.pressedCommit = o.graph.activeCommit : o.chrome.activeUser ? o.pressedUser = o.chrome.activeUser : o.dragging = !0; }, this.docmove = function(t) {
            var e = t.pageX, n = t.pageY;
            o.dragging && (o.graph.moveX(e - o.lastPoint.x), o.graph.moveY(n - o.lastPoint.y), o.graph.draw(), o.chrome.moveX(e - o.lastPoint.x), o.chrome.moveY(n - o.lastPoint.y), o.chrome.draw()), o.lastPoint.x = e, o.lastPoint.y = n;
        }, this.move = function(t) {
            var e = t.pageX, n = t.pageY;
            if (o.dragging)o.graph.moveX(e - o.lastPoint.x), o.graph.moveY(n - o.lastPoint.y), o.graph.draw(), o.chrome.moveX(e - o.lastPoint.x), o.chrome.moveY(n - o.lastPoint.y), o.chrome.draw();
            else {
                var s = o.chrome.hover(e - i.left, n - i.top);
                if (s != o.lastHoverUser)a.style.cursor = s ? "pointer" : "move", o.chrome.activeUser = s, o.chrome.draw(), o.lastHoverUser = s;
                else {
                    var r = o.graph.hover(e - i.left, n - i.top);
                    r != o.lastHoverCommit && (a.style.cursor = r ? "pointer" : "move", o.graph.activeCommit = r, o.graph.draw(), o.chrome.draw(), o.lastHoverCommit = r);
                }
            }
            o.lastPoint.x = e, o.lastPoint.y = n;
        }, this.out = function() { o.graph.activeCommit = null, o.chrome.activeUser = null, o.graph.draw(), o.chrome.draw(), o.lastHoverCommit = null, o.lastHoverUser = null; }, t("body")[0].onmouseup = this.up, t("body")[0].onmousemove = this.docmove, a.onmousedown = this.down, a.onmousemove = this.move, a.onmouseout = this.out;
    }, e.KeyDriver = function(e, n, s) {
        this.container = e, this.chrome = n, this.graph = s, this.dirty = !1, this.moveBothX = function(t) { this.graph.moveX(t), this.chrome.moveX(t), this.graph.activeCommit = null, this.dirty = !0; }, this.moveBothY = function(t) { this.graph.moveY(t), this.chrome.moveY(t), this.graph.activeCommit = null, this.dirty = !0; }, this.toggleRefs = function() { this.graph.toggleRefs(), this.dirty = !0; }, this.redraw = function() { this.dirty && (this.graph.draw(), this.chrome.draw()), this.dirty = !1; };
        var r = this;
        this.down = function(t) {
            var e = !1;
            if (t.target != document.body)return!0;
            if (t.shiftKey)
                switch (t.which) {
                case 37:
                case 72:
                    r.moveBothX(999999), e = !0;
                    break;
                case 38:
                case 75:
                    r.moveBothY(999999), e = !0;
                    break;
                case 39:
                case 76:
                    r.moveBothX(-999999), e = !0;
                    break;
                case 40:
                case 74:
                    r.moveBothY(-999999), e = !0;
                }
            else
                switch (t.which) {
                case 37:
                case 72:
                    r.moveBothX(100), e = !0;
                    break;
                case 38:
                case 75:
                    r.moveBothY(20), e = !0;
                    break;
                case 39:
                case 76:
                    r.moveBothX(-100), e = !0;
                    break;
                case 40:
                case 74:
                    r.moveBothY(-20), e = !0;
                    break;
                case 84:
                    r.toggleRefs(), e = !0;
                }
            e && r.redraw();
        }, t(document).keydown(this.down);
    }, e;
}

!function() { navigator.userAgent.match("Propane") || top != window && (alert("For security reasons, framing is not allowed."), top.location.replace(document.location)); }.call(this), function() { "github.com" === location.host && "https:" !== location.protocol && (alert("SSL is required to view this page."), location.protocol = "https:"); }.call(this), function() {
    var t, e;
    null == (e = window.GitHub) && (window.GitHub = {}), t = null, GitHub.withSudo = function(e) { return $.getJSON("/sessions/in_sudo.json", function(n) { return n ? e() : (t = e, $.facebox({ div: "#js-sudo-prompt" }, "sudo")); }); }, $(document).on("ajaxSuccess", ".js-sudo-form", function() { return $(document).trigger("close.facebox"), "function" == typeof t && t(), t = null; }), $(document).on("ajaxError", ".js-sudo-form", function() { return $(this).find(".js-sudo-error").text("Incorrect Password.").show(), $(this).find(".js-sudo-password").val(""), !1; }), $(document).on("click", ".js-sudo-required", function() {
        var t = this;
        return GitHub.withSudo(function() { return location.href = t.href; }), !1;
    });
}.call(this), function() {
    var t;
    null == (t = window.GitHub) && (window.GitHub = {});
}.call(this), function(t) {
    t.fn.autocompleteField = function(e) {
        var n = t.extend({ searchVar: "q", url: null, delay: 250, useCache: !1, extraParams: {}, autoClearResults: !0, dataType: "html", minLength: 1 }, e);
        return t(this).each(function() {

            function e(e) {
                if (r && r.readyState < 4 && r.abort(), n.useCache && c.hasOwnProperty(e))o.trigger("autocomplete:finish", c[e]);
                else {
                    var s = {};
                    s[n.searchVar] = e, s = t.extend(!0, n.extraParams, s), o.trigger("autocomplete:beforesend"), r = t.get(n.url, s, function(t) { n.useCache && (c[e] = t), o.val() === e && o.trigger("autocomplete:finish", t); }, n.dataType);
                }
            }

            function s(t) { t.length >= n.minLength ? i != t && (e(t), i = t) : o.trigger("autocomplete:clear"); }

            var r, a, i, o = t(this), c = {};
            null != n.url && (o.attr("autocomplete", "off"), o.keyup(function(t) { t.preventDefault(), clearTimeout(a), a = setTimeout(function() { clearTimeout(a), s(o.val()); }, n.delay); }), o.blur(function() { i = null; }));
        });
    };
}(jQuery), function(t) {
    t.fn.autosaveField = function(e) {
        var n = t.extend({}, t.fn.autosaveField.defaults, e);
        return this.each(function() {
            var e = t(this);
            if (!e.data("autosaved-init")) {
                var s = e.attr("data-field-type") || ":text", r = e.find(s), a = e.attr("data-action"), i = e.attr("data-name"), o = r.val(), c = function() { e.removeClass("errored"), e.removeClass("successful"), e.addClass("loading"), t.ajax({ url: a, type: "POST", data: { _method: n.method, field: i, value: r.val() }, success: function() { e.addClass("successful"), o = r.val(); }, error: function(t) { e.attr("data-reset-on-error") && r.val(o), 422 == t.status && e.find(".error").text(t.responseText), e.addClass("errored"); }, complete: function() { e.removeClass("loading"); } }); };
                ":text" == s ? (r.blur(function() { t(this).val() != o && c(); }), r.keyup(function() { e.removeClass("successful"), e.removeClass("errored"); })) : "input[type=checkbox]" == s && r.change(function() { e.removeClass("successful"), e.removeClass("errored"), c(); }), e.data("autosaved-init", !0);
            }
        });
    }, t.fn.autosaveField.defaults = { method: "put" };
}(jQuery), function(t) { t.fn.caret = function(t) { return"undefined" == typeof t ? this[0].selectionStart : (this[0].focus(), this[0].setSelectionRange(t, t)); }, t.fn.caretSelection = function(t, e) { return"undefined" == typeof t && "undefined" == typeof e ? [this[0].selectionStart, this[0].selectionEnd] : (this[0].focus(), this[0].setSelectionRange(t, e)); }; }(jQuery), DateInput = function(t) {

    function e(n, s) { "object" != typeof s && (s = {}), t.extend(this, e.DEFAULT_OPTS, s), this.input = t(n), this.bindMethodsToObj("show", "hide", "hideIfClickOutside", "keydownHandler", "selectDate"), this.build(), this.selectDate(), this.show(), this.input.hide(), this.input.data("datePicker", this); }

    return e.DEFAULT_OPTS = { month_names: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], short_month_names: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], short_day_names: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], start_of_week: 1 }, e.prototype = {
        build: function() {
            var e = t('<p class="month_nav"><span class="button prev" title="[Page-Up]">&#171;</span> <span class="month_name"></span> <span class="button next" title="[Page-Down]">&#187;</span></p>');
            this.monthNameSpan = t(".month_name", e), t(".prev", e).click(this.bindToObj(function() { this.moveMonthBy(-1); })), t(".next", e).click(this.bindToObj(function() { this.moveMonthBy(1); }));
            var n = t('<p class="year_nav"><span class="button prev" title="[Ctrl+Page-Up]">&#171;</span> <span class="year_name"></span> <span class="button next" title="[Ctrl+Page-Down]">&#187;</span></p>');
            this.yearNameSpan = t(".year_name", n), t(".prev", n).click(this.bindToObj(function() { this.moveMonthBy(-12); })), t(".next", n).click(this.bindToObj(function() { this.moveMonthBy(12); }));
            var s = t('<div class="nav"></div>').append(e, n), r = "<table><thead><tr>";
            t(this.adjustDays(this.short_day_names)).each(function() { r += "<th>" + this + "</th>"; }), r += "</tr></thead><tbody></tbody></table>", this.dateSelector = this.rootLayers = t('<div class="date_selector no_shadow"></div>').append(s, r).insertAfter(this.input), this.tbody = t("tbody", this.dateSelector), this.input.change(this.bindToObj(function() { this.selectDate(); })), this.selectDate();
        },
        selectMonth: function(e) {
            var n = new Date(e.getFullYear(), e.getMonth(), 1);
            if (!this.currentMonth || this.currentMonth.getFullYear() != n.getFullYear() || this.currentMonth.getMonth() != n.getMonth()) {
                this.currentMonth = n;
                for (var s = this.rangeStart(e), r = this.rangeEnd(e), a = this.daysBetween(s, r), i = "", o = 0; a >= o; o++) {
                    var c = new Date(s.getFullYear(), s.getMonth(), s.getDate() + o, 12, 0);
                    this.isFirstDayOfWeek(c) && (i += "<tr>"), i += c.getMonth() == e.getMonth() ? '<td class="selectable_day" date="' + this.dateToString(c) + '">' + c.getDate() + "</td>" : '<td class="unselected_month" date="' + this.dateToString(c) + '">' + c.getDate() + "</td>", this.isLastDayOfWeek(c) && (i += "</tr>");
                }
                this.tbody.empty().append(i), this.monthNameSpan.empty().append(this.monthName(e)), this.yearNameSpan.empty().append(this.currentMonth.getFullYear()), t(".selectable_day", this.tbody).click(this.bindToObj(function(e) { this.changeInput(t(e.target).attr("date")); })), t("td[date='" + this.dateToString(new Date) + "']", this.tbody).addClass("today"), t("td.selectable_day", this.tbody).mouseover(function() { t(this).addClass("hover"); }), t("td.selectable_day", this.tbody).mouseout(function() { t(this).removeClass("hover"); });
            }
            t(".selected", this.tbody).removeClass("selected"), t('td[date="' + this.selectedDateString + '"]', this.tbody).addClass("selected");
        },
        selectDate: function(t) { "undefined" == typeof t && (t = this.stringToDate(this.input.val())), t || (t = new Date), this.selectedDate = t, this.selectedDateString = this.dateToString(this.selectedDate), this.selectMonth(this.selectedDate); },
        resetDate: function() { t(".selected", this.tbody).removeClass("selected"), this.changeInput(""); },
        changeInput: function(t) { this.input.val(t).change(), this.hide(); },
        show: function() { this.rootLayers.css("display", "block"), t([window, document.body]).click(this.hideIfClickOutside), this.input.unbind("focus", this.show), this.rootLayers.keydown(this.keydownHandler), this.setPosition(); },
        hide: function() {},
        hideIfClickOutside: function(t) { t.target == this.input[0] || this.insideSelector(t) || this.hide(); },
        insideSelector: function(e) { return $target = t(e.target), $target.parents(".date_selector").length || $target.is(".date_selector"); },
        keydownHandler: function(t) {
            switch (t.keyCode) {
            case 9:
            case 27:
                return this.hide(), void 0;
            case 13:
                this.changeInput(this.selectedDateString);
                break;
            case 33:
                this.moveDateMonthBy(t.ctrlKey ? -12 : -1);
                break;
            case 34:
                this.moveDateMonthBy(t.ctrlKey ? 12 : 1);
                break;
            case 38:
                this.moveDateBy(-7);
                break;
            case 40:
                this.moveDateBy(7);
                break;
            case 37:
                this.moveDateBy(-1);
                break;
            case 39:
                this.moveDateBy(1);
                break;
            default:
                return;
            }
            t.preventDefault();
        },
        stringToDate: function(t) {
            var e;
            return(e = t.match(/^(\d{1,2}) ([^\s]+) (\d{4,4})$/)) ? new Date(e[3], this.shortMonthNum(e[2]), e[1], 12, 0) : null;
        },
        dateToString: function(t) { return t.getDate() + " " + this.short_month_names[t.getMonth()] + " " + t.getFullYear(); },
        setPosition: function() {
            var t = this.input.offset();
            this.rootLayers.css({ top: t.top + this.input.outerHeight(), left: t.left }), this.ieframe && this.ieframe.css({ width: this.dateSelector.outerWidth(), height: this.dateSelector.outerHeight() });
        },
        moveDateBy: function(t) {
            var e = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), this.selectedDate.getDate() + t);
            this.selectDate(e);
        },
        moveDateMonthBy: function(t) {
            var e = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + t, this.selectedDate.getDate());
            e.getMonth() == this.selectedDate.getMonth() + t + 1 && e.setDate(0), this.selectDate(e);
        },
        moveMonthBy: function(t) {
            var e = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + t, this.currentMonth.getDate());
            this.selectMonth(e);
        },
        monthName: function(t) { return this.month_names[t.getMonth()]; },
        bindToObj: function(t) {
            var e = this;
            return function() { return t.apply(e, arguments); };
        },
        bindMethodsToObj: function() { for (var t = 0; t < arguments.length; t++)this[arguments[t]] = this.bindToObj(this[arguments[t]]); },
        indexFor: function(t, e) { for (var n = 0; n < t.length; n++)if (e == t[n])return n; },
        monthNum: function(t) { return this.indexFor(this.month_names, t); },
        shortMonthNum: function(t) { return this.indexFor(this.short_month_names, t); },
        shortDayNum: function(t) { return this.indexFor(this.short_day_names, t); },
        daysBetween: function(t, e) { return t = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()), e = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()), (e - t) / 864e5; },
        changeDayTo: function(t, e, n) {
            var s = n * (Math.abs(e.getDay() - t - 7 * n) % 7);
            return new Date(e.getFullYear(), e.getMonth(), e.getDate() + s);
        },
        rangeStart: function(t) { return this.changeDayTo(this.start_of_week, new Date(t.getFullYear(), t.getMonth()), -1); },
        rangeEnd: function(t) { return this.changeDayTo((this.start_of_week - 1) % 7, new Date(t.getFullYear(), t.getMonth() + 1, 0), 1); },
        isFirstDayOfWeek: function(t) { return t.getDay() == this.start_of_week; },
        isLastDayOfWeek: function(t) { return t.getDay() == (this.start_of_week - 1) % 7; },
        adjustDays: function(t) {
            for (var e = [], n = 0; n < t.length; n++)e[n] = t[(n + this.start_of_week) % 7];
            return e;
        }
    }, e;
}(jQuery), function(t) {
    t.fn.errorify = function(e, n) {
        return t.extend({}, t.fn.errorify.defaults, n), this.each(function() {
            var n = t(this);
            n.removeClass("warn"), n.addClass("errored"), n.find("p.note").hide(), n.find("dd.error").remove(), n.find("dd.warning").remove();
            var s = t("<dd>").addClass("error").text(e);
            n.append(s);
        });
    }, t.fn.errorify.defaults = {}, t.fn.unErrorify = function(e) {
        return t.extend({}, t.fn.unErrorify.defaults, e), this.each(function() {
            var e = t(this);
            e.removeClass("errored warn"), e.find("p.note").show(), e.find("dd.error").remove(), e.find("dd.warning").remove();
        });
    }, t.fn.unErrorify.defaults = {};
}(jQuery), $.fn.selectableList = function(t, e) {
    return $(this).each(function() {
        var n = $(this), s = $.extend({ toggleClassName: "selected", wrapperSelector: "a", mutuallyExclusive: !1, itemParentSelector: "li", enableShiftSelect: !1, ignoreLinks: !1 }, e);
        return n.delegate(t + " " + s.itemParentSelector + " " + s.wrapperSelector, "click", function(e) {
            if (e.which > 1 || e.metaKey || s.ignoreLinks && $(e.target).closest("a").length)return!0;
            var r = $(this), a = r.find(":checkbox, :radio"), i = n.find(t + " ." + s.toggleClassName), o = n.find(t + " *[data-last]");
            if (r.is(":checkbox, :radio") || e.target == a[0] || (a.prop("checked") && !a.is(":radio") ? a.prop("checked", !1) : a.prop("checked", !0)), s.mutuallyExclusive && i.removeClass(s.toggleClassName), r.toggleClass(s.toggleClassName), a.change(), s.enableShiftSelect && e.shiftKey && i.length > 0) {
                if (o.length > 0) {
                    var c = o.offset().top, l = r.offset().top, u = "#" + r.attr("id"), d = $, h = $, f = $;
                    c > l ? d = o.prevUntil(u) : l > c && (d = o.nextUntil(u)), h = d.find(":checkbox"), f = d.find(":checked"), f.length == h.length ? (d.removeClass(s.toggleClassName), h.prop("checked", !1)) : (d.addClass(s.toggleClassName), h.prop("checked", !0));
                }
                r.trigger("selectableList:shiftClicked");
            }
            o.removeAttr("data-last"), r.attr("data-last", !0);
        }), n.delegate(t + " li :checkbox," + t + " li :radio", "change", function() {
            var e = $(this), r = e.closest(s.wrapperSelector);
            s.mutuallyExclusive && n.find(t + " ." + s.toggleClassName).removeClass(s.toggleClassName), $(this).prop("checked") ? r.addClass(s.toggleClassName) : r.removeClass(s.toggleClassName);
        }), n.find(t);
    });
}, function(t, e, n) {

    function s(t) {
        var e = {}, s = /^jQuery\d+$/;
        return n.each(t.attributes, function(t, n) { n.specified && !s.test(n.name) && (e[n.name] = n.value); }), e;
    }

    function r(t, s) {
        var r = this, a = n(r);
        if (r.value == a.attr("placeholder") && a.hasClass("placeholder"))
            if (a.data("placeholder-password")) {
                if (a = a.hide().next().show().attr("id", a.removeAttr("id").data("placeholder-id")), t === !0)return a[0].value = s;
                a.focus();
            } else r.value = "", a.removeClass("placeholder"), r == e.activeElement && r.select();
    }

    function a() {
        var t, e = this, a = n(e), i = this.id;
        if ("" == e.value) {
            if ("password" == e.type) {
                if (!a.data("placeholder-textinput")) {
                    try {
                        t = a.clone().attr({ type: "text" });
                    } catch (o) {
                        t = n("<input>").attr(n.extend(s(this), { type: "text" }));
                    }
                    t.removeAttr("name").data({ "placeholder-password": !0, "placeholder-id": i }).bind("focus.placeholder", r), a.data({ "placeholder-textinput": t, "placeholder-id": i }).before(t);
                }
                a = a.removeAttr("id").hide().prev().attr("id", i).show();
            }
            a.addClass("placeholder"), a[0].value = a.attr("placeholder");
        } else a.removeClass("placeholder");
    }

    var i, o, c = "placeholder" in e.createElement("input"), l = "placeholder" in e.createElement("textarea"), u = n.fn, d = n.valHooks;
    c && l ? (o = u.placeholder = function() { return this; }, o.input = o.textarea = !0) : (o = u.placeholder = function() {
        var t = this;
        return t.filter((c ? "textarea" : ":input") + "[placeholder]").not(".placeholder").bind({ "focus.placeholder": r, "blur.placeholder": a }).data("placeholder-enabled", !0).trigger("blur.placeholder"), t;
    }, o.input = c, o.textarea = l, i = {
        get: function(t) {
            var e = n(t);
            return e.data("placeholder-enabled") && e.hasClass("placeholder") ? "" : t.value;
        },
        set: function(t, s) {
            var i = n(t);
            return i.data("placeholder-enabled") ? ("" == s ? (t.value = s, t != e.activeElement && a.call(t)) : i.hasClass("placeholder") ? r.call(t, !0, s) || (t.value = s) : t.value = s, i) : t.value = s;
        }
    }, c || (d.input = i), l || (d.textarea = i), n(function() {
        n(e).delegate("form", "submit.placeholder", function() {
            var t = n(".placeholder", this).each(r);
            setTimeout(function() { t.each(a); }, 10);
        });
    }), n(t).bind("beforeunload.placeholder", function() { n(".placeholder").each(function() { this.value = ""; }); }));
}(this, document, jQuery), function(t) {
    t.fn.popover = function(t) {
        if ("destroy" == t)this.tipsy("hide").data("tipsy", null);
        else if ("show" == t)this.tipsy("show");
        else if ("hide" == t)this.tipsy("hide");
        else {
            switch (tipsyOptions = { inline: !0, trigger: "manual", opacity: 1, className: "popover", content: t.content, html: t.html }, t.placement) {
            case"left":
                tipsyOptions.gravity = "e";
                break;
            case"right":
                tipsyOptions.gravity = "w";
                break;
            case"up":
                tipsyOptions.gravity = "s";
                break;
            case"down":
                tipsyOptions.gravity = "n";
            }
            this.tipsy("hide").data("tipsy", null), this.tipsy(tipsyOptions);
        }
        return this;
    };
}(jQuery), function(t) {

    function e(t, e) {
        var n = t.find("a");
        if (n.length > 1) {
            var s = n.filter(".selected"), r = n.get().indexOf(s.get(0));
            return r += e, r >= n.length ? r = 0 : 0 > r && (r = n.length - 1), s.removeClass("selected"), n.eq(r).addClass("selected"), !0;
        }
    }

    t.fn.quicksearch = function(n) {
        var s = t.extend({ url: null, delay: 150, spinner: null, insertSpinner: null, loading: t(".quicksearch-loading") }, n);
        s.insertSpinner && !s.spinner && (s.spinner = t('<img src="' + GitHub.Ajax.spinner + '" alt="" class="spinner" width="16" />'));
        var r = function(t) { return s.results.html(t).show(); };
        return s.results.delegate("a", "mouseover", function() {
            var e = t(this);
            e.hasClass("selected") || (s.results.find("a.selected").removeClass("selected"), e.addClass("selected"));
        }), this.each(function() {

            function n() { s.insertSpinner && (s.spinner.parent().length || s.insertSpinner.call(i, s.spinner), s.spinner.show()), i.trigger("quicksearch.loading"), s.loading && r(s.loading.html()); }

            function a() { s.insertSpinner && s.spinner.hide(), i.trigger("quicksearch.loaded"); }

            var i = t(this);
            i.autocompleteField({ url: s.url || i.attr("data-url"), dataType: s.dataType, delay: s.delay, useCache: !0, minLength: 2 }).bind("keyup", function(t) { 13 != t.which && i.val().length >= 2 && s.results.is(":empty") && n(); }).bind("autocomplete:beforesend", function() { n(); }).bind("autocomplete:finish", function(t, e) { r(e || {}), a(); }).bind("autocomplete:clear", function() { s.results.html("").hide(), a(); }).bind("focus", function() { i.val() && i.trigger("keyup"); }).bind("blur", function() { setTimeout(function() { i.trigger("autocomplete:clear"); }, 250); }).bind("keydown", function(n) {
                switch (n.hotkey) {
                case"up":
                    if (e(s.results, -1))return!1;
                    break;
                case"down":
                    if (e(s.results, 1))return!1;
                    break;
                case"esc":
                    return t(this).blur(), !1;
                case"enter":
                    var r = s.results.find("a.selected");
                    if (r.length)return t(this).blur(), r.hasClass("initial") ? r.closest("form").submit() : window.location = r.attr("href"), !1;
                    t(this).trigger("autocomplete:clear");
                }
            });
        });
    };
}(jQuery), function(t) { t.smartPoller = function(e, n) { t.isFunction(e) && (n = e, e = 1e3), function s() { setTimeout(function() { n.call(this, s); }, e), e = 1.5 * e; }(); }; }(jQuery), function(t) {

    function e(t) { return"tagName" in t ? t : t.parentNode; }

    try {
        window.document.createEvent("TouchEvent");
    } catch (n) {
        return!1;
    }
    var s, r = {};
    t(document).ready(function() {
        t(document.body).bind("touchstart", function(t) {
            var n = Date.now(), a = n - (r.last || n);
            r.target = e(t.originalEvent.touches[0].target), s && clearTimeout(s), r.x1 = t.originalEvent.touches[0].pageX, a > 0 && 250 >= a && (r.isDoubleTap = !0), r.last = n;
        }).bind("touchmove", function(t) { r.x2 = t.originalEvent.touches[0].pageX; }).bind("touchend", function() { r.isDoubleTap ? (t(r.target).trigger("doubleTap"), r = {}) : r.x2 > 0 ? (Math.abs(r.x1 - r.x2) > 30 && t(r.target).trigger("swipe") && t(r.target).trigger("swipe" + (r.x1 - r.x2 > 0 ? "Left" : "Right")), r.x1 = r.x2 = r.last = 0) : "last" in r && (s = setTimeout(function() { s = null, t(r.target).trigger("tap"), r = {}; }, 250)); }).bind("touchcancel", function() { r = {}; });
    }), ["swipe", "swipeLeft", "swipeRight", "doubleTap", "tap"].forEach(function(e) { t.fn[e] = function(t) { return this.bind(e, t); }; });
}(jQuery), function() {
    var t;
    t = function(t) { return debug("AJAX Error", t), $("#ajax-error-message").show(function() { return $(this).addClass("visible"); }); }, $(document).on("ajaxError", "[data-remote]", function(e, n, s, r) { return"canceled" !== r ? /<html/.test(n.responseText) ? (t(r), e.stopImmediatePropagation()) : setTimeout(function() { return e.isDefaultPrevented() ? void 0 : t(r); }, 0) : void 0; }), $(document).on("ajaxBeforeSend", "[data-remote]", function() { return $("#ajax-error-message").hide().removeClass("visible"); }), $(document).on("click", ".ajax-error-dismiss", function() { return $("#ajax-error-message").hide().removeClass("visible"), !1; });
}.call(this), function() { $(document).on("ajaxSend", "[data-remote]", function(t) { return t.isDefaultPrevented() ? void 0 : ($(this).addClass("loading"), $(document.documentElement).addClass("ajax-loading")); }), $(document).on("ajaxComplete", "[data-remote]", function() { return $(document.documentElement).removeClass("ajax-loading"), $(this).removeClass("loading"); }); }.call(this), function() {
    var t;
    t = function(t) {
        var e, n, s, r, a;
        t = $(t), s = t.val(), $.trim(s) && (n = { type: "POST", url: t.attr("data-autocheck-url"), data: { value: s } }, e = $.Event("autocheck:send"), t.trigger(e, n), e.isDefaultPrevented() || (t.addClass("is-autocheck-loading"), t.closest("dl.form").addClass("is-loading"), t.closest("dl.form").removeClass("errored successed"), t.removeClass("is-autocheck-successful is-autocheck-errored"), null != (a = t.data("autocheck-xhr")) && a.abort(), r = $.ajax(n).done(function() { return t.addClass("is-autocheck-successful"), t.closest("dl.form").unErrorify().addClass("successed"), t.trigger("autocheck:success", arguments); }).fail(function(e, n) { return"abort" !== n && t.is(":visible") ? (t.addClass("is-autocheck-errored"), /<html/.test(e.responseText) ? t.closest("dl.form").errorify("Something went wrong.") : t.closest("dl.form").errorify(e.responseText), t.trigger("autocheck:error", arguments)) : void 0; }).always(function(e, n) { return"abort" !== n ? (t.removeClass("is-autocheck-loading"), t.closest("dl.form").removeClass("is-loading"), t.trigger("autocheck:complete", arguments)) : void 0; }), t.data("autocheck-xhr", r)));
    }, $(document).on("change", "input[data-autocheck-url]", function() { return t(this); }), $(document).onFocusedInput("input[data-autocheck-url]", function(e) { return $(this).on("throttled:input." + e, function() { return t(this); }), !1; });
}.call(this), function() {
    var t;
    t = function() {

        function t() {
            var e = this;
            this.onNavigationOpen = function() { return t.prototype.onNavigationOpen.apply(e, arguments); }, this.onNavigationKeyDown = function() { return t.prototype.onNavigationKeyDown.apply(e, arguments); }, this.onResultsChange = function() { return t.prototype.onResultsChange.apply(e, arguments); }, this.onInputChange = function() { return t.prototype.onInputChange.apply(e, arguments); }, this.onResultsMouseDown = function() { return t.prototype.onResultsMouseDown.apply(e, arguments); }, this.onInputBlur = function() { return t.prototype.onInputBlur.apply(e, arguments); }, this.onInputFocus = function() { return t.prototype.onInputFocus.apply(e, arguments); }, $(document).on("focusin", "input[data-autocomplete]", this.onInputFocus), this.focusedInput = this.focusedResults = null, this.mouseDown = !1;
        }

        return t.prototype.bindEvents = function(t, e) { return $(t).on("blur", this.onInputBlur), $(t).on("throttled:input", this.onInputChange), $(e).on("mousedown", this.onResultsMouseDown), $(e).on("autocomplete:change", this.onResultsChange), $(e).on("navigation:open", "[data-autocomplete-value]", this.onNavigationOpen), $(e).on("navigation:keydown", "[data-autocomplete-value]", this.onNavigationKeyDown); }, t.prototype.unbindEvents = function(t, e) { return $(t).off("blur", this.onInputBlur), $(t).off("throttled:input", this.onInputChange), $(e).off("mousedown", this.onResultsMouseDown), $(e).off("autocomplete:change", this.onResultsChange), $(e).off("navigation:open", "[data-autocomplete-value]", this.onNavigationOpen), $(e).off("navigation:keydown", "[data-autocomplete-value]", this.onNavigationKeyDown); }, t.prototype.onInputFocus = function(t) {
            var e, n;
            e = t.currentTarget, n = document.getElementById($(e).attr("data-autocomplete")), this.focusedInput = e, this.focusedResults = n, this.bindEvents(e, n), $(e).trigger("autocomplete:focus"), $(e).trigger("autocomplete:search", [$(e).val()]);
        }, t.prototype.onInputBlur = function(t) {
            var e, n;
            e = t.currentTarget, n = this.focusedResults, this.mouseDown || (this.hideResults(), this.inputValue = null, this.focusedInput = this.focusedResults = null, this.unbindEvents(e, n), $(e).trigger("autocomplete:blur"));
        }, t.prototype.onResultsMouseDown = function() {
            var t, e = this;
            this.mouseDown = !0, t = function() { return e.mouseDown = !1, $(document).off("mouseup", t); }, $(document).on("mouseup", t);
        }, t.prototype.onInputChange = function(t, e) {
            var n;
            n = t.currentTarget, this.inputValue !== e && ($(n).removeAttr("data-autocompleted"), $(n).trigger("autocomplete:autocompleted:changed")), $(n).trigger("autocomplete:change", [e]), $(n).trigger("autocomplete:search", [e]);
        }, t.prototype.onResultsChange = function() {
            var t, e;
            e = $(this.focusedInput).val(), t = $(this.focusedResults).find("[data-autocomplete-value]"), 0 === t.length ? this.hideResults() : this.inputValue !== e && (this.inputValue = e, this.showResults(), $(this.focusedInput).is("[data-autocomplete-autofocus]") && $(this.focusedResults).find("ul").navigation("focus"));
        }, t.prototype.onNavigationKeyDown = function(t) {
            switch (t.hotkey) {
            case"tab":
                return this.onNavigationOpen(t), !1;
            case"esc":
                return this.hideResults(), !1;
            }
        }, t.prototype.onNavigationOpen = function(t) {
            var e, n;
            e = t.currentTarget, n = $(e).attr("data-autocomplete-value"), this.inputValue = n, $(this.focusedInput).val(n), $(this.focusedInput).attr("data-autocompleted", n), $(this.focusedInput).trigger("autocomplete:autocompleted:changed", [n]), $(this.focusedInput).trigger("autocomplete:result", [n]), $(e).removeClass("active"), this.hideResults();
        }, t.prototype.showResults = function(t, e) {
            var n, s, r, a, i;
            return null == t && (t = this.focusedInput), null == e && (e = this.focusedResults), $(e).is(":visible") ? void 0 : (i = $(t).offset(), r = i.top, s = i.left, n = r + $(t).innerHeight(), a = $(t).innerWidth(), $(e).css({ display: "block", position: "absolute", width: a + 2 }), $(e).offset({ top: n + 5, left: s + 1 }), $(t).addClass("js-navigation-enable"), $(e).find("ul").navigation("push"), $(e).show());
        }, t.prototype.hideResults = function(t, e) { return null == t && (t = this.focusedInput), null == e && (e = this.focusedResults), $(e).is(":visible") ? ($(t).removeClass("js-navigation-enable"), $(e).find("ul").navigation("pop"), $(e).hide()) : void 0; }, t;
    }(), new t;
}.call(this), function() {
    $(document).focused(".js-autosearch-field")["in"](function() {
        var t, e, n;
        return t = $(this), e = t.closest("form"), n = $("#" + e.attr("data-results-container")), e.on("throttled:input.autosearch_form", function() {
            var t, s;
            return e.addClass("is-sending"), t = e.prop("action"), s = $.ajax({ url: t, data: e.serializeArray(), context: this }), s.always(function() { return e.removeClass("is-sending"); }), s.done(function(t) { return n.html(t); });
        });
    }).out(function() { return $(this).off(".autosearch_form"); });
}.call(this), function() {
    var t;
    t = function() {

        function t(e) {
            var n = this;
            this.container = e, this.hoverEnd = function() { return t.prototype.hoverEnd.apply(n, arguments); }, this.hoverStart = function() { return t.prototype.hoverStart.apply(n, arguments); }, this.items = this.container.find(".avatars li"), this.items.length > 1 && this.container.hover(this.hoverStart, this.hoverEnd);
        }

        return t.prototype.namespace = "avatarStack", t.prototype.hoverStart = function() { return this.container.addClass("avatar-stack-focus"); }, t.prototype.hoverEnd = function() { return this.container.removeClass("avatar-stack-focus"); }, t;
    }(), $(function() { return $(".avatar-stack").each(function() { return new t($(this)); }); });
}.call(this), function() {
    $(document).on("submit", ".js-braintree-encrypt", function() {
        var t;
        t = Braintree.create($(this).attr("data-braintree-key")), t.encryptForm(this);
    });
}.call(this), function() {
    var t,
        e,
        n,
        s,
        r,
        a,
        i,
        o,
        c,
        l,
        u,
        d,
        h,
        f,
        m,
        p,
        g,
        v,
        $,
        y = [].slice,
        b = [].indexOf || function(t) {
            for (var e = 0, n = this.length; n > e; e++)if (e in this && this[e] === t)return e;
            return-1;
        };
    t = jQuery, t.payment = {}, t.payment.fn = {}, t.fn.payment = function() {
        var e, n;
        return n = arguments[0], e = 2 <= arguments.length ? y.call(arguments, 1) : [], t.payment.fn[n].apply(this, e);
    }, r = /(\d{1,4})/g, s = [{ type: "maestro", pattern: /^(5018|5020|5038|6304|6759|676[1-3])/, format: r, length: [12, 13, 14, 15, 16, 17, 18, 19], cvcLength: [3], luhn: !0 }, { type: "dinersclub", pattern: /^(36|38|30[0-5])/, format: r, length: [14], cvcLength: [3], luhn: !0 }, { type: "laser", pattern: /^(6706|6771|6709)/, format: r, length: [16, 17, 18, 19], cvcLength: [3], luhn: !0 }, { type: "jcb", pattern: /^35/, format: r, length: [16], cvcLength: [3], luhn: !0 }, { type: "unionpay", pattern: /^62/, format: r, length: [16, 17, 18, 19], cvcLength: [3], luhn: !1 }, { type: "discover", pattern: /^(6011|65|64[4-9]|622)/, format: r, length: [16], cvcLength: [3], luhn: !0 }, { type: "mastercard", pattern: /^5[1-5]/, format: r, length: [16], cvcLength: [3], luhn: !0 }, { type: "amex", pattern: /^3[47]/, format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/, length: [15], cvcLength: [3, 4], luhn: !0 }, { type: "visa", pattern: /^4/, format: r, length: [13, 14, 15, 16], cvcLength: [3], luhn: !0 }], e = function(t) {
        var e, n, r;
        for (t = (t + "").replace(/\D/g, ""), n = 0, r = s.length; r > n; n++)if (e = s[n], e.pattern.test(t))return e;
    }, n = function(t) {
        var e, n, r;
        for (n = 0, r = s.length; r > n; n++)if (e = s[n], e.type === t)return e;
    }, h = function(t) {
        var e, n, s, r, a, i;
        for (s = !0, r = 0, n = (t + "").split("").reverse(), a = 0, i = n.length; i > a; a++)e = n[a], e = parseInt(e, 10), (s = !s) && (e *= 2), e > 9 && (e -= 9), r += e;
        return 0 === r % 10;
    }, d = function(t) {
        var e;
        return null != t.prop("selectionStart") && t.prop("selectionStart") !== t.prop("selectionEnd") ? !0 : ("undefined" != typeof document && null !== document ? null != (e = document.selection) ? "function" == typeof e.createRange ? e.createRange().text : void 0 : void 0 : void 0) ? !0 : !1;
    }, f = function(e) {
        return setTimeout(function() {
            var n, s;
            return n = t(e.currentTarget), s = n.val(), s = t.payment.formatCardNumber(s), n.val(s);
        });
    }, o = function(n) {
        var s, r, a, i, o, c, l;
        return a = String.fromCharCode(n.which), !/^\d+$/.test(a) || (s = t(n.currentTarget), l = s.val(), r = e(l + a), i = (l.replace(/\D/g, "") + a).length, c = 16, r && (c = r.length[r.length.length - 1]), i >= c || null != s.prop("selectionStart") && s.prop("selectionStart") !== l.length) ? void 0 : (o = r && "amex" === r.type ? /^(\d{4}|\d{4}\s\d{6})$/ : /(?:^|\s)(\d{4})$/, o.test(l) ? (n.preventDefault(), s.val(l + " " + a)) : o.test(l + a) ? (n.preventDefault(), s.val(l + a + " ")) : void 0);
    }, a = function(e) {
        var n, s;
        return n = t(e.currentTarget), s = n.val(), e.meta || 8 !== e.which || null != n.prop("selectionStart") && n.prop("selectionStart") !== s.length ? void 0 : /\d\s$/.test(s) ? (e.preventDefault(), n.val(s.replace(/\d\s$/, ""))) : /\s\d?$/.test(s) ? (e.preventDefault(), n.val(s.replace(/\s\d?$/, ""))) : void 0;
    }, c = function(e) {
        var n, s, r;
        return s = String.fromCharCode(e.which), /^\d+$/.test(s) ? (n = t(e.currentTarget), r = n.val() + s, /^\d$/.test(r) && "0" !== r && "1" !== r ? (e.preventDefault(), n.val("0" + r + "/")) : /^\d\d$/.test(r) ? (e.preventDefault(), n.val("" + r + "/")) : void 0) : void 0;
    }, l = function(e) {
        var n, s, r;
        return s = String.fromCharCode(e.which), /^\d+$/.test(s) ? (n = t(e.currentTarget), r = n.val(), /^\d\d$/.test(r) ? n.val("" + r + "/") : void 0) : void 0;
    }, u = function(e) {
        var n, s, r;
        return s = String.fromCharCode(e.which), "/" === s ? (n = t(e.currentTarget), r = n.val(), /^\d$/.test(r) && "0" !== r ? n.val("0" + r + "/") : void 0) : void 0;
    }, i = function(e) {
        var n, s;
        if (!e.meta && (n = t(e.currentTarget), s = n.val(), 8 === e.which && (null == n.prop("selectionStart") || n.prop("selectionStart") === s.length)))return/\d(\s|\/)+$/.test(s) ? (e.preventDefault(), n.val(s.replace(/\d(\s|\/)*$/, ""))) : /\s\/\s?\d?$/.test(s) ? (e.preventDefault(), n.val(s.replace(/\s\/\s?\d?$/, ""))) : void 0;
    }, v = function(t) {
        var e;
        return t.metaKey || t.ctrlKey ? !0 : 32 === t.which ? !1 : 0 === t.which ? !0 : t.which < 33 ? !0 : (e = String.fromCharCode(t.which), !!/[\d\s]/.test(e));
    }, p = function(n) {
        var s, r, a, i;
        return s = t(n.currentTarget), a = String.fromCharCode(n.which), /^\d+$/.test(a) && !d(s) ? (i = (s.val() + a).replace(/\D/g, ""), r = e(i), r ? i.length <= r.length[r.length.length - 1] : i.length <= 16) : void 0;
    }, g = function(e) {
        var n, s, r;
        return n = t(e.currentTarget), s = String.fromCharCode(e.which), /^\d+$/.test(s) && !d(n) ? (r = n.val() + s, r = r.replace(/\D/g, ""), r.length > 6 ? !1 : void 0) : void 0;
    }, m = function(e) {
        var n, s, r;
        return n = t(e.currentTarget), s = String.fromCharCode(e.which), /^\d+$/.test(s) ? (r = n.val() + s, r.length <= 4) : void 0;
    }, $ = function(e) {
        var n, r, a, i, o;
        return n = t(e.currentTarget), o = n.val(), i = t.payment.cardType(o) || "unknown", n.hasClass(i) ? void 0 : (r = function() {
            var t, e, n;
            for (n = [], t = 0, e = s.length; e > t; t++)a = s[t], n.push(a.type);
            return n;
        }(), n.removeClass("unknown"), n.removeClass(r.join(" ")), n.addClass(i), n.toggleClass("identified", "unknown" !== i), n.trigger("payment.cardType", i));
    }, t.payment.fn.formatCardCVC = function() { return this.payment("restrictNumeric"), this.on("keypress", m), this; }, t.payment.fn.formatCardExpiry = function() { return this.payment("restrictNumeric"), this.on("keypress", g), this.on("keypress", c), this.on("keypress", u), this.on("keypress", l), this.on("keydown", i), this; }, t.payment.fn.formatCardNumber = function() { return this.payment("restrictNumeric"), this.on("keypress", p), this.on("keypress", o), this.on("keydown", a), this.on("keyup", $), this.on("paste", f), this; }, t.payment.fn.restrictNumeric = function() { return this.on("keypress", v), this; }, t.payment.fn.cardExpiryVal = function() { return t.payment.cardExpiryVal(t(this).val()); }, t.payment.cardExpiryVal = function(t) {
        var e, n, s, r;
        return t = t.replace(/\s/g, ""), r = t.split("/", 2), e = r[0], s = r[1], 2 === (null != s ? s.length : void 0) && /^\d+$/.test(s) && (n = (new Date).getFullYear(), n = n.toString().slice(0, 2), s = n + s), e = parseInt(e, 10), s = parseInt(s, 10), { month: e, year: s };
    }, t.payment.validateCardNumber = function(t) {
        var n, s;
        return t = (t + "").replace(/\s+|-/g, ""), /^\d+$/.test(t) ? (n = e(t), n ? (s = t.length, b.call(n.length, s) >= 0 && (n.luhn === !1 || h(t))) : !1) : !1;
    }, t.payment.validateCardExpiry = function(e, n) {
        var s, r, a, i;
        return"object" == typeof e && "month" in e && (i = e, e = i.month, n = i.year), e && n ? (e = t.trim(e), n = t.trim(n), /^\d+$/.test(e) ? /^\d+$/.test(n) ? parseInt(e, 10) <= 12 ? (2 === n.length && (a = (new Date).getFullYear(), a = a.toString().slice(0, 2), n = a + n), r = new Date(n, e), s = new Date, r.setMonth(r.getMonth() - 1), r.setMonth(r.getMonth() + 1, 1), r > s) : !1 : !1 : !1) : !1;
    }, t.payment.validateCardCVC = function(e, s) {
        var r, a;
        return e = t.trim(e), /^\d+$/.test(e) ? s ? (r = e.length, b.call(null != (a = n(s)) ? a.cvcLength : void 0, r) >= 0) : e.length >= 3 && e.length <= 4 : !1;
    }, t.payment.cardType = function(t) {
        var n;
        return t ? (null != (n = e(t)) ? n.type : void 0) || null : null;
    }, t.payment.formatCardNumber = function(t) {
        var n, s, r, a;
        return(n = e(t)) ? (r = n.length[n.length.length - 1], t = t.replace(/\D/g, ""), t = t.slice(0, +r + 1 || 9e9), n.format.global ? null != (a = t.match(n.format)) ? a.join(" ") : void 0 : (s = n.format.exec(t), null != s && s.shift(), null != s ? s.join(" ") : void 0)) : t;
    };
}.call(this), function() {
    var t = [].indexOf || function(t) {
        for (var e = 0, n = this.length; n > e; e++)if (e in this && this[e] === t)return e;
        return-1;
    };
    $.observe(".js-card-select-number-field", function() { return $(this).payment("formatCardNumber"); }), $.observe(".js-card-expiration", function() { return $(this).payment("formatCardExpiry"); }), $.observe(".js-card-cvv", function() { return $(this).payment("formatCardCVC"); }), $.observe(".js-card-select-number-field", function() {
        var t, e, n;
        return e = $(this).closest("form"), t = e.find(".js-card"), n = e.find(".js-card-select-type-field"), $(this).on("input", function() {
            var e, s, r, a, i;
            if (r = $(this).val(), s = $.payment.cardType(r))for (a = 0, i = t.length; i > a; a++)e = t[a], $(e).toggleClass("enabled", $(e).attr("data-name") === s), $(e).toggleClass("disabled", $(e).attr("data-name") !== s);
            else t.removeClass("enabled disabled");
            n.val(s);
        });
    }), $(document).on("blur", ".js-card-select-number-field", function() { return $(this).val($.payment.formatCardNumber($(this).val())); }), $(document).on("click", ".js-card", function() {
        var t, e;
        return t = $(this).closest("form"), e = t.find(".js-card-select-number-field"), e.focus();
    }), $(document).on("change", ".js-select-country", function() {
        var e, n, s, r, a, i;
        return n = $(this).val(), r = { Austria: "ATU000000000", Belgium: "BE0000000000", Bulgaria: "BG000000000...", Croatia: "", Cyprus: "CY000000000X", "Czech Republic": "CZ00000000...", Denmark: "DK00 00 00 00", Estonia: "EE000000000", Finland: "FI00000000", France: "FRXX 000000000", Germany: "DE000000000", Greece: "EL000000000", Hungary: "HU00000000", Iceland: "", Ireland: "IE...", Italy: "IT00000000000", Latvia: "LV00000000000", Lithuania: "LT000000000...", Luxembourg: "LU00000000", Malta: "MT00000000", Netherlands: "NL000000000B00", Norway: "", Poland: "PL0000000000", Portugal: "PT000000000", Romania: "RO...", Slovakia: "SK0000000000", Slovenia: "", Spain: "ES...", Sweden: "SE000000000000", Switzerland: "", "United Kingdom": "GB..." }, s = ["Angola", "Antigua and Barbuda", "Aruba", "Bahamas", "Belize", "Benin", "Botswana", "Cameroon", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Cook Islands", "Côte d'Ivoire", "Djibouti", "Dominica", "Fiji", "French Southern Lands", "Ghana", "Guyana", "Hong Kong", "Ireland", "Kiribati", "Korea, North", "Malawi", "Maritania", "Mauritius", "Montserrat", "Nauru", "Niue", "Qatar", "Saint Kitts and Nevis", "Saint Lucia", "Sao Tome and Principe", "Seychelles", "Sierra Leone", "Sint Maarten (Dutch part)", "Solomon Islands", "Somalia", "Suriname", "Syria", "Togo", "Tokelau", "Tonga", "United Arab Emirates", "Vanuatu", "Yemen", "Zimbabwe"], a = r[n], $(".js-setup-creditcard").toggleClass("is-vat-country", null != a), "" !== a && (i = "(" + a + ")"), e = $(this).parents(".js-setup-creditcard").find(".js-vat-help-text"), e.html(i), "United States of America" !== n ? ($(".js-setup-creditcard").addClass("is-international"), $(".js-select-state").removeAttr("required").val("")) : ($(".js-setup-creditcard").removeClass("is-international"), $(".js-select-state").attr("required", "required")), t.call(s, n) >= 0 ? ($(".js-postal-code-form").hide(), $(".js-postal-code-field").removeAttr("required").val("")) : ($(".js-postal-code-form").show(), $(".js-postal-code-field").attr("required", "required"));
    });
}.call(this), function() { $(document).on("click:prepare", ".minibutton.disabled", function(t) { t.preventDefault(), t.stopPropagation(); }); }.call(this), function() {
    var t, e;
    null == (t = window.GitHub) && (window.GitHub = {}), window.GitHub.assetHostUrl = null != (e = $("link[rel=assets]").prop("href")) ? e : "/";
}.call(this), function() {
    var t;
    ZeroClipboard.setDefaults({ moviePath: "" + GitHub.assetHostUrl + "flash/ZeroClipboard.v1.2.1.swf", trustedOrigins: location.hostname, allowScriptAccess: "always" }),
    $.observe(".js-zeroclipboard", t = function (t) {
        var e;
        return e = new ZeroClipboard(t), e.on("load", function(t) { return $(t.htmlBridge).tipsy(); }), e.on("complete", function(e) {
            var n;
            return n = $(t).attr("data-copied-hint"), $(e.htmlBridge).prop("title", n).tipsy("show");
        }), e.on("noflash wrongflash", function() { return $(t).remove(); });
    });
}.call(this), function() {
    $(document).on("ajaxBeforeSend", ".js-new-comment-form", function(t) { return this === t.target ? $(this).data("remote-xhr") ? !1 : void 0 : void 0; }), $(document).on("ajaxSend", ".js-new-comment-form", function(t) { return this === t.target ? $(this).find(".js-comment-form-error").hide() : void 0; }), $(document).on("ajaxSuccess", ".js-new-comment-form", function(t, e, n, s) {
        var r, a, i;
        if (this === t.target) {
            this.reset(), $(this).find(".js-comment-field").trigger("validation:field:change"), $(this).find(".js-write-tab").click(), i = s.updateContent;
            for (a in i)r = i[a], $(a).updateContent(r);
        }
    }), $(document).on("ajaxError", ".js-new-comment-form", function(t, e) {
        var n, s;
        if (this === t.target)return s = "There was an error creating your comment", 422 === e.status && (n = JSON.parse(e.responseText), n.errors && (s += ": " + n.errors.join(", "))), $(this).find(".js-comment-form-error").show().text(s), !1;
    });
}.call(this), function() {
    $(document).onFocusedInput(".js-new-comment-form .js-comment-field", function() {
        var t, e, n, s, r;
        return e = $(this).closest(".js-new-comment-form"), t = e.find(".js-comment-and-button").first(), t[0] ? (s = t.text(), r = t.attr("data-original-text"), n = t.attr("data-comment-text"), function() {
            var e, a;
            a = "" !== $(this).val().trim(), e = a ? n : r, e !== s && t.text(s = e);
        }) : void 0;
    });
}.call(this), function() {
    var t, e, n, s, r, a, i, o, c, l, u, d;
    u = sessionStorage, i = localStorage, c = "draft:", r = /^draft:/, s = 5e3, n = void 0, d = void 0, l = function(t, e) {
        var n;
        return n = c + t.value, i.setItem(n, e.value), $(e).fire("drafts:saved", [n]);
    }, t = function(t, e) {
        var n;
        return n = c + t.value, i.removeItem(n), $(e).fire("drafts:cleared", [n]);
    }, o = function() {
        var t, e, n, s, a, o;
        for (t = {}, o = Object.keys(i), s = 0, a = o.length; a > s; s++)n = o[s], n.match(r) && ((e = i.getItem(n)) && (t[n.replace(r, "")] = e), i.removeItem(n));
        return t;
    }, e = function(t) {
        var e, n;
        return null == t && (t = document), !d && (n = $(document).find("head link[rel=drafts]")[0]) && !$(t).closest("form").data("remote-xhr") && (e = o(), Object.keys(e).length) ? $(t).fire("drafts:flush", [e], function() { return d = $.ajax({ type: "POST", url: n.href, data: { drafts: e }, complete: function() { return d = void 0, $(t).fire("drafts:complete", [e]); }, success: function() { return $(t).fire("drafts:flushed", [e]); }, error: function() { return $(t).fire("drafts:error", [e]); } }); }) : void 0;
    }, $(document).focused(".js-draft-field")["in"](function() {
        var t, r = this;
        if (t = $(this).closest("form").find(".js-draft-key")[0])
            return n = setInterval(function() { return e(r); }, s), $(this).on("input.drafts", function() {
                var e = this;
                return setImmediate(function() { return l(t, e); });
            });
    }).out(function() {
        var t = this;
        return setImmediate(function() { return e(t); }), clearInterval(n), $(this).off(".drafts");
    }), $(document).on("reset", ".js-draft-container", function() {
        var e;
        if (e = $(this).find(".js-draft-key")[0])return t(e, $(this).find(".js-draft-field")[0]);
    }), $.observe(".js-draft-field", a = function(t) {
        var e, n, s;
        return e = $(t), !t.value && (n = e.closest("form"), n[0] && !n.hasDirtyFields() && (s = e.attr("data-draft"))) ? (e.removeAttr("data-draft"), t.value = s, e.trigger("drafts:resumed")) : void 0;
    }), $(function() { return e(); });
}.call(this), function() {
    var t;
    t = function(t) { return $(t).find(".js-draft-flushed-date").attr("datetime", (new Date).toISOString()).html("just now"); }, $(document).on("drafts:resumed", ".js-draft-container", function(e, n) { return window.logDraftEvents && console.log("drafts:resumed", n), t(this), $(this).addClass("has-resumed-draft"); }), $(document).on("drafts:flush", ".js-draft-container", function(t, e) { return window.logDraftEvents && console.log("draft:flush", e), $(this).removeClass("has-flushed-draft has-resumed-draft").addClass("is-flushing-draft"); }), $(document).on("drafts:complete", ".js-draft-container", function() { return $(this).removeClass("is-flushing-draft"); }), $(document).on("drafts:error", ".js-draft-container", function(t, e) { return console.log("draft:error", status, error, e); }), $(document).on("drafts:flushed", ".js-draft-container", function(e, n) { return window.logDraftEvents && console.log("draft:flushed", n), t(this), $(this).removeClass("has-draft-changes").addClass("has-flushed-draft"); }), $(document).on("drafts:cleared", ".js-draft-container", function() { return $(this).removeClass("has-draft-changes has-flushed-draft has-resumed-draft"); });
}.call(this), function() {
    $(document).on("click", ".js-comment-edit-button", function() {
        var t;
        return t = $(this).closest(".js-comment"), t.addClass("is-comment-editing"), t.find(".js-comment-field").focus().trigger("change"), !1;
    }), $(document).on("click", ".js-new-discussion-timeline .js-comment-edit-title-button", function() { return $(this).closest(".js-new-discussion-timeline").find(".js-comment-edit-button:first").click(); }), $(document).on("click", ".js-comment-cancel-button", function() {
        var t;
        return t = $(this).closest("form"), t.hasDirtyFields() && !confirm($(this).attr("data-confirm-text")) ? !1 : (t[0].reset(), $(this).closest(".js-comment").removeClass("is-comment-editing"), !1);
    }), $(document).on("ajaxSend", ".js-comment-delete, .js-comment-update, .js-issue-update", function(t, e) {
        var n;
        return n = $(this).closest(".js-comment"), n.addClass("is-comment-loading"), n.find(".minibutton").addClass("disabled"), e.setRequestHeader("X-Body-Version", n.attr("data-body-version"));
    }), $(document).on("ajaxError", ".js-comment-update", function(t, e, n, s) {
        var r, a, i;
        if (debug("ajaxError for js-comment-update", s), 422 === e.status)
            try {
                if (a = JSON.parse(e.responseText), r = $(this).closest(".js-comment"), a.stale)return e.stale = !0, r.addClass("is-comment-stale"), r.find(".minibutton").addClass("disabled"), r.hasClass("is-updating-task-list") && window.location.reload(), t.preventDefault();
                if (a.errors)return i = "There was an error posting your comment: " + a.errors.join(", "), r.find(".js-comment-update-error").text(i).show(), t.preventDefault();
            } catch (o) {
                return debug("Error trying to handle ajaxError for js-comment-update: " + o);
            }
    }), $(document).on("ajaxComplete", ".js-comment-delete, .js-comment-update", function(t, e) {
        var n;
        return n = $(this).closest(".js-comment"), n.removeClass("is-comment-loading"), n.find(".minibutton").removeClass("disabled"), e.stale ? n.find(".form-actions button[type=submit].minibutton").addClass("disabled") : void 0;
    }), $(document).on("ajaxSuccess", ".js-comment-delete", function() {
        var t, e;
        return t = $(this).closest(".js-comment"), e = $(this).closest(".js-comment-container"), e.length || (e = t), e.fadeOut(function() { return t.removeClass("is-comment-editing"); });
    }), $(document).on("ajaxSuccess", ".js-comment-update", function(t, e, n, s) {
        var r, a, i, o, c, l;
        for (r = $(this).closest(".js-comment"), a = $(this).closest(".js-comment-container"), a.length || (a = r), null != s.title && r.find(".js-comment-body-title").html(s.title), r.find(".js-comment-body").html(s.body), r.attr("data-body-version", s.newBodyVersion), l = r.find("input, textarea"), o = 0, c = l.length; c > o; o++)i = l[o], i.defaultValue = i.value;
        return r.removeClass("is-comment-editing"), a.pageUpdate();
    }), $(document).on("ajaxSuccess", ".js-issue-update", function(t, e, n, s) {
        var r, a, i, o, c;
        for (r = $(this).parents(".js-details-container"), r.find(".js-details-target").last().click(), null != s.title && r.find(".js-issue-title").html(s.title), r.attr("data-body-version", s.newBodyVersion), c = r.find("input"), i = 0, o = c.length; o > i; i++)a = c[i], a.defaultValue = a.value;
        return r.pageUpdate();
    });
}.call(this), function() { $(document).on("focusin", ".js-write-bucket", function() { return $(this).addClass("focused"); }), $(document).on("focusout", ".js-write-bucket", function() { return $(this).removeClass("focused"); }); }.call(this), function() {
    $(document).onFocusedKeydown(".js-comment-field", function() {
        return function(t) {
            var e;
            return"ctrl+L" !== t.hotkey && "meta+L" !== t.hotkey || !(e = $(this).prev(".js-enable-fullscreen")[0]) ? void 0 : (e.click(), !1);
        };
    });
}.call(this), function() {
    var t;
    $(document).on("click", ".add-line-comment[data-remote]", function() {
        var e, n;
        return $(this).hasClass("loading") ? !1 : ($(this).closest(".file").addClass("show-inline-notes"), n = $(this).closest("tr"), e = n.next("tr.inline-comments"), e.length ? t(e) : $.ajax({ context: this, url: $(this).attr("data-remote"), success: function(e) { return n.after(e).pageUpdate(), t(n.next("tr.inline-comments")); } }));
    }), t = function(t) { return t.find(".js-write-tab").click(), t.addClass("show-inline-comment-form").find(".js-comment-field").focus(); }, $(document).on("click", ".js-show-inline-comment-form", function() { return t($(this).closest(".inline-comments")), !1; }), $(document).on("click", ".js-hide-inline-comment-form", function() {
        var t;
        return t = $(this).closest(".inline-comments"), t.removeClass("show-inline-comment-form"), t.find(".inline-comment-form .js-comment-field").val(""), t.find(".js-comments-holder").children(":visible").length || t.remove(), !1;
    }), $(document).onFocusedKeydown(".inline-comment-form .js-comment-field", function() {
        return function(t) {
            var e;
            if (!$(this).hasClass("js-navigation-enable"))return"esc" === t.hotkey && 0 === this.value.length ? (e = $(this).closest(".inline-comments"), e.find(".js-hide-inline-comment-form").click(), !1) : void 0;
        };
    }), $(document).on("ajaxSend", ".js-inline-comment-form", function() { return $(this).find(".ajaxindicator").show(); }), $(document).on("ajaxComplete", ".js-inline-comment-form", function() { return $(this).find(".ajaxindicator").hide(); }), $(document).on("ajaxSuccess", ".js-inline-comment-form", function(t, e, n, s) {
        var r, a;
        return a = $(this).closest(".js-line-comments"), a.find(".js-comments-holder").append(s), a.find(".js-hide-inline-comment-form").click(), r = a.closest(".inline-comments").find(".comment-count .counter"), r.text(parseInt(r.text().replace(",", "")) + 1), a.closest(".inline-comments").pageUpdate();
    }), $(document).on("ajaxSuccess", ".inline-comments .js-comment-delete", function() {
        var t;
        return t = $(this).closest(".inline-comments"), setTimeout(function() { return t.find(".js-comments-holder").children(":visible").length ? void 0 : t.remove(); }, 500);
    });
}.call(this), function() {
    var t, e;
    $(document).on("click", ".js-write-tab", function() {
        var t;
        return t = $(this).closest(".js-previewable-comment-form"), t.addClass("write-selected").removeClass("preview-selected"), t.find(".tabnav-tab").removeClass("selected"), $(this).addClass("selected"), !1;
    }), $(document).on("click", ".js-preview-tab", function() {
        var n;
        return n = $(this).closest(".js-previewable-comment-form"), n.addClass("preview-selected").removeClass("write-selected"), n.find(".tabnav-tab").removeClass("selected"), $(this).addClass("selected"), t(n), e(n), !1;
    }), e = function(t) {
        var e;
        return e = t.find(".comment-body"), e.html("<p>Loading preview&hellip;</p>"), $.ajax({ type: "POST", url: t.attr("data-preview-url"), data: { text: t.find(".js-comment-field").val() }, success: function(t) { return e.html(t || "<p>Nothing to preview</p>"); } });
    }, $(document).onFocusedKeydown(".js-comment-field", function() {
        return function(t) {
            var e;
            return"ctrl+P" !== t.hotkey && "meta+P" !== t.hotkey || (e = $(this).closest(".js-previewable-comment-form"), !e.hasClass("write-selected")) ? void 0 : ($(this).blur(), e.find(".preview-tab").click(), t.stopImmediatePropagation(), !1);
        };
    }), t = function(t) { return $(document).off("keydown.unpreview"), $(document).on("keydown.unpreview", function(e) { return"ctrl+P" === e.hotkey || "meta+P" === e.hotkey ? (t.find(".js-write-tab").click(), t.find(".js-comment-field").focus(), $(document).off("keydown.unpreview"), !1) : void 0; }); };
}.call(this), function() { $(document).onFocusedKeydown(".js-comment-field", function() { return function(t) { return"ctrl+enter" === t.hotkey || "meta+enter" === t.hotkey ? ($(this).closest("form").submit(), !1) : void 0; }; }); }.call(this), function() {
    $(document).on("pjax:send", ".context-loader-container", function() {
        var t;
        return t = $(this).find(".context-loader:first"), t.length ? t.addClass("is-context-loading") : $(".page-context-loader").addClass("is-context-loading");
    }), $(document).on("pjax:complete", ".context-loader-container", function(t) { return $(t.target).find(".context-loader:first").removeClass("is-context-loading"), $(".page-context-loader").removeClass("is-context-loading"), $(document.body).removeClass("disables-context-loader"); }), $(document).on("pjax:timeout", ".context-loader-container", function() { return!1; });
}.call(this), function() {}.call(this), function() {
    var t;
    t = function(t) {
        var e, n, s, r;
        for (r = $(t).attr("data-confirm").toLowerCase().split(","), n = 0, s = r.length; s > n; n++)if (e = r[n], t.value.toLowerCase() === e)return!0;
        return!1;
    }, $(document).onFocusedInput(".js-dangerous-confirmation .confirm-input", function() {
        var e, n;
        return e = $(this).closest(".js-dangerous-confirmation"), n = e.find(".confirm-button")[0], function() { n.disabled = !t(this); };
    });
}.call(this), function(t) {

    function e(e) {
        if (t.facebox.settings.inited)return!0;
        t.facebox.settings.inited = !0, t(document).trigger("init.facebox"), r();
        var n = t.facebox.settings.imageTypes.join("|");
        t.facebox.settings.imageTypesRegexp = new RegExp("\\.(" + n + ")(\\?.*)?$", "i"), e && t.extend(t.facebox.settings, e), t("body").append(t.facebox.settings.faceboxHtml), t(".facebox-close").click(t.facebox.close);
    }

    function n() {
        var t, e;
        return self.pageYOffset ? (e = self.pageYOffset, t = self.pageXOffset) : document.documentElement && document.documentElement.scrollTop ? (e = document.documentElement.scrollTop, t = document.documentElement.scrollLeft) : document.body && (e = document.body.scrollTop, t = document.body.scrollLeft), new Array(t, e);
    }

    function s() {
        var t;
        return self.innerHeight ? t = self.innerHeight : document.documentElement && document.documentElement.clientHeight ? t = document.documentElement.clientHeight : document.body && (t = document.body.clientHeight), t;
    }

    function r() {
        var e = t.facebox.settings;
        e.imageTypes = e.image_types || e.imageTypes, e.faceboxHtml = e.facebox_html || e.faceboxHtml;
    }

    function a(e, n) {
        if (e.match(/#/)) {
            var s = window.location.href.split("#")[0], r = e.replace(s, "");
            if ("#" == r)return;
            t.facebox.reveal(t(r).html(), n);
        } else e.match(t.facebox.settings.imageTypesRegexp) ? i(e, n) : o(e, n);
    }

    function i(e, n) {
        var s = new Image;
        s.onload = function() { t.facebox.reveal('<div class="image"><img src="' + s.src + '" /></div>', n); }, s.src = e;
    }

    function o(e, n) { t.facebox.jqxhr = t.get(e, function(e) { t.facebox.reveal(e, n); }); }

    function c() { return 0 == t.facebox.settings.overlay || null === t.facebox.settings.opacity; }

    function l() { return c() ? void 0 : (0 == t(".facebox-overlay").length && t("body").append('<div class="facebox-overlay facebox-overlay-hide"></div>'), t(".facebox-overlay").hide().addClass("facebox-overlay-active").css("opacity", t.facebox.settings.opacity).click(function() { t(document).trigger("close.facebox"); }).fadeIn(200), !1); }

    function u() { return c() ? void 0 : (t(".facebox-overlay").fadeOut(200, function() { t(".facebox-overlay").removeClass("facebox-overlay-active"), t(".facebox-overlay").addClass("facebox-overlay-hide"), t(".facebox-overlay").remove(); }), !1); }

    t.facebox = function(e, n) { t.facebox.loading(), e.ajax ? o(e.ajax, n) : e.image ? i(e.image, n) : e.div ? a(e.div, n) : t.isFunction(e) ? e.call(t) : t.facebox.reveal(e, n); }, t.extend(t.facebox, { settings: { opacity: .5, overlay: !0, imageTypes: ["png", "jpg", "jpeg", "gif"], faceboxHtml: '    <div class="facebox" id="facebox" style="display:none;">       <div class="facebox-popup">         <div class="facebox-content">         </div>         <button type="button" class="facebox-close">           <span class="octicon octicon-remove-close"></span>         </button>       </div>     </div>' }, loading: function() { return e(), 1 == t(".facebox-loading").length ? !0 : (l(), t(".facebox-content").empty().append('<div class="facebox-loading"></div>'), t(".facebox").show().css({ top: n()[1] + s() / 10, left: t(window).width() / 2 - t(".facebox-popup").outerWidth() / 2 }), t(document).bind("keydown.facebox", function(e) { return 27 == e.keyCode && t.facebox.close(), !0; }), t(document).trigger("loading.facebox"), void 0); }, reveal: function(e, n) { t(document).trigger("beforeReveal.facebox"), n && t(".facebox-content").addClass(n), t(".facebox-content").empty().append(e), t(".facebox-loading").remove(), t(".facebox-popup").children().fadeIn("normal"), t(".facebox").css("left", t(window).width() / 2 - t(".facebox-popup").outerWidth() / 2), t(document).trigger("reveal.facebox").trigger("afterReveal.facebox"); }, close: function() { return t(document).trigger("close.facebox"), !1; } }), t.fn.facebox = function(n) {

        function s() {
            t.facebox.loading(!0);
            var e = this.rel.match(/facebox\[?\.(\w+)\]?/);
            return e && (e = e[1]), a(this.href, e), !1;
        }

        if (0 != t(this).length)return e(n), this.bind("click.facebox", s);
    }, t(document).bind("close.facebox", function() { t.facebox.jqxhr && (t.facebox.jqxhr.abort(), t.facebox.jqxhr = null), t(document).unbind("keydown.facebox"), t(".facebox").fadeOut(function() { t(".facebox-content").removeClass().addClass("facebox-content"), t(".facebox-loading").remove(), t(document).trigger("afterClose.facebox"); }), u(); });
}(jQuery), function() {
    var t, e;
    $(document).on("reveal.facebox", function() {
        var t, n;
        t = $("#facebox"), t.pageUpdate(), n = t.find("input[autofocus], textarea[autofocus]").last()[0], n && document.activeElement !== n && n.focus(), $(document).on("keydown", e);
    }), $(document).on("afterClose.facebox", function() { return $(document).off("keydown", e), $("#facebox :focus").blur(); }), e = function(t) {
        var e, n, s, r, a, i;
        ("tab" === (i = t.hotkey) || "shift+tab" === i) && (t.preventDefault(), n = $("#facebox"), e = n.find("input, .button, textarea").filter(":visible"), r = "shift+tab" === t.hotkey ? -1 : 1, s = e.index(e.filter(":focus")), a = s + r, a === e.length || -1 === s && "tab" === t.hotkey ? e.first().focus() : -1 === s ? e.last().focus() : e.get(a).focus());
    }, $.observe("a[rel*=facebox]", t = function() { return $(this).facebox(); });
}.call(this), function() {
    var t, e, n, s;
    e = function(t) {
        var e, s, r, a, i, o;
        if (s = document.getElementById(t))return r = document.getElementById("fullscreen_overlay"), a = $(r).find(".js-fullscreen-contents"), i = "gh-fullscreen-theme", "dark" === localStorage.getItem(i) ? $(".js-fullscreen-overlay").addClass("dark-theme") : $(".js-fullscreen-overlay").removeClass("dark-theme"), o = $(s).val(), e = $(s).caret(), $(r).attr("data-return-scroll-position", window.pageYOffset), $("body").addClass("fullscreen-overlay-enabled"), $(document).on("keydown", n), $(a).attr("placeholder", $(s).attr("placeholder")), $(a).val(o), $(a).caret(e), a.focus();
    }, t = function(t) {
        var e, s, r, a, i, o;
        if (s = document.getElementById(t))return r = document.getElementById("fullscreen_overlay"), i = $(r).find(".js-fullscreen-contents"), o = $(i).val(), e = $(i).caret(), $("body").removeClass("fullscreen-overlay-enabled"), $(document).off("keydown", n), (a = $(r).attr("data-return-scroll-position")) && window.scrollTo(0, a), null != window.editor ? window.editor.setCode(o) : ($(s).val(o), $(s).caret(e), $(s).trigger("validation:field:change")), i.val("");
    }, s = !1, n = function(t) { return 27 === t.keyCode || "ctrl+L" === t.hotkey || "meta+L" === t.hotkey ? (s ? history.back() : window.location.hash = "", t.preventDefault()) : void 0; }, $(document).on("click", ".js-exit-fullscreen", function(t) { s && (t.preventDefault(), history.back()); }), $(document).on("click", ".js-theme-switcher", function() {
        var t;
        return t = "gh-fullscreen-theme", "dark" === localStorage.getItem(t) ? (localStorage.removeItem(t), $("body, .js-fullscreen-overlay").removeClass("dark-theme")) : (localStorage.setItem(t, "dark"), $("body, .js-fullscreen-overlay").addClass("dark-theme")), !1;
    }), $.hashChange(function(n) {
        var r, a, i;
        return i = n.oldURL, a = n.newURL, (r = a.match(/\#fullscreen_(.+)$/)) ? (s = !!i, e(r[1])) : (r = null != i ? i.match(/\#fullscreen_(.+)$/) : void 0) ? (s = !1, t(r[1])) : void 0;
    }), "dark" === ("undefined" != typeof localStorage && null !== localStorage ? localStorage["gh-fullscreen-theme"] : void 0) && $(function() { return $("body, .js-fullscreen-overlay").addClass("dark-theme"); });
}.call(this), function() {
    var t, e, n, s;
    n = {}, e = function(t) {
        var s;
        t.preventDefault(), (s = n[t.hotkey]) && $(s).fire("gotokey:activate", { originalEvent: t }, function() { $(s).click(); }), $(document).off("keydown", e);
    }, $(document).on("keydown", function(t) { t.target === document.body && "g" === t.hotkey && (t.preventDefault(), $(document).on("keydown", e), setTimeout(function() { return $(document).off("keydown", e); }, 1500)); }), t = function(t) {
        var e;
        e = t.getAttribute("data-gotokey"), n[e] = t;
    }, s = function(t) {
        var e;
        e = t.getAttribute("data-gotokey"), delete n[e];
    }, $.observe("[data-gotokey]", { add: t, remove: s });
}.call(this), function() { $.observe(".labeled-button:checked", { add: function() { return $(this).parent("label").addClass("selected"); }, remove: function() { return $(this).parent("label").removeClass("selected"); } }); }.call(this), function() { $(document).on("keydown", "div.minibutton, span.minibutton", function(t) { return"enter" === t.hotkey ? ($(this).click(), t.preventDefault()) : void 0; }); }.call(this), function() { $(document).on("ajaxSuccess", ".js-notice-dismiss", function() { return $(this).closest(".js-notice").fadeOut(); }), $(document).on("ajaxError", ".js-notice-dismiss", function() { return alert("Failed to dismiss notice. Sorry!"); }); }.call(this), function() {
    $.support.pjax && ($(document).on("pjax:start", function(t) {
        var e;
        (e = t.relatedTarget) && ($(e).addClass("pjax-active"), $(e).parents(".js-pjax-active").addClass("pjax-active"));
    }), $(document).on("pjax:end", function() { $(".pjax-active").removeClass("pjax-active"); }));
}.call(this), function() {
    var t;
    t = function() {
        var t, e;
        return e = function() {
            var e, n, s;
            for (s = [], e = 0, n = arguments.length; n > e; e++)t = arguments[e], s.push(t.split("/", 3).join("/"));
            return s;
        }.apply(this, arguments), e[0] === e[1];
    }, $(document).on("pjax:click", "#js-repo-pjax-container a[href]", function() {
        var e;
        return e = $(this).prop("pathname"), t(e, location.pathname) ? void 0 : !1;
    });
}.call(this), function() {
    var t;
    $.support.pjax && ($.pjax.defaults.fragment = "#pjax-body", $.pjaxHeadCache = [], $(t = function() { return $.pjaxHeadCache[document.location.pathname] = $("head [data-pjax-transient]"); }), $(document).on("pjax:success", function(t, e) {
        var n;
        return n = $.parseHTML(e)[0], "pjax-head" === n.id ? $.pjaxHeadCache[document.location.pathname] = $(n).children() : void 0;
    }), $(document).on("pjax:end", function() {
        var t, e, n;
        return t = $.pjaxHeadCache[document.location.pathname], t ? ($("head [data-pjax-transient]").remove(), n = $(t).filter(":not(title, script, link[rel='stylesheet'])"), e = $(t).filter("link[rel='stylesheet']"), $(document.head).append(n.attr("data-pjax-transient", !0)), $(document.head).append(e)) : void 0;
    }));
}.call(this), function() {
    var t;
    $.support.pjax && (t = function(t) { return $(t).is("[data-pjax-preserve-scroll]") ? !1 : 0; }, $(document).on("click", "[data-pjax] a, a[data-pjax]", function(e) {
        var n, s, r;
        if (!$(this).is("[data-skip-pjax]") && !$(this).is("[data-remote]"))return s = $(this).is("[data-pjax]") ? this : $(this).closest("[data-pjax]")[0], r = t(this), (n = $(this).closest("[data-pjax-container]")[0]) ? $.pjax.click(e, { container: n, scrollTo: r }) : void 0;
    }), $(document).on("submit", "form[data-pjax]", function(e) {
        var n, s;
        return s = t(this), (n = $(this).closest("[data-pjax-container]")[0]) ? $.pjax.submit(e, { container: n, scrollTo: s }) : void 0;
    }));
}.call(this), function() { $.support.pjax && ($.pjax.defaults.timeout = 1e3); }.call(this), function(t) {

    function e() { return 1 == m ? !1 : void 0 != window.DeviceOrientationEvent; }

    function n(t) {
        if (x = t.gamma, y = t.beta, 90 === Math.abs(window.orientation)) {
            var e = x;
            x = y, y = e;
        }
        return window.orientation < 0 && (x = -x, y = -y), h = null == h ? x : h, f = null == f ? y : f, { x: x - h, y: y - f };
    }

    function s(t) {
        if (!((new Date).getTime() < i + a)) {
            i = (new Date).getTime();
            var s = null != c.offset() ? c.offset().left : 0, r = null != c.offset() ? c.offset().top : 0, h = t.pageX - s, f = t.pageY - r;
            if (!(0 > h || h > c.width() || 0 > f || f > c.height())) {
                if (e()) {
                    if (void 0 == t.gamma)return m = !0, void 0;
                    values = n(t), h = values.x / l, f = values.y / l, h = d > h ? d : h > u ? u : h, f = d > f ? d : f > u ? u : f, h = (h + 1) / 2, f = (f + 1) / 2;
                }
                var p, g, v = h / (1 == e() ? u : c.width()), $ = f / (1 == e() ? u : c.height());
                for (g = o.length; g--;)p = o[g], newX = p.startX + p.inversionFactor * p.xRange * v, newY = p.startY + p.inversionFactor * p.yRange * $, p.background ? p.obj.css("background-position", newX + "px " + newY + "px") : p.obj.css("left", newX).css("top", newY);
            }
        }
    }

    var r = 25, a = 1e3 * (1 / r), i = (new Date).getTime(), o = [], c = t(window), l = 30, u = 1, d = -1, h = null, f = null, m = !1;
    t.fn.plaxify = function(e) {
        return this.each(function() {
            for (var n = -1, s = { xRange: t(this).data("xrange") || 0, yRange: t(this).data("yrange") || 0, invert: t(this).data("invert") || !1, background: t(this).data("background") || !1 }, r = 0; r < o.length; r++)this === o[r].obj.get(0) && (n = r);
            for (var a in e)0 == s[a] && (s[a] = e[a]);
            if (s.inversionFactor = s.invert ? -1 : 1, s.obj = t(this), s.background) {
                if (pos = (s.obj.css("background-position") || "0px 0px").split(/ /), 2 != pos.length)return;
                if (x = pos[0].match(/^((-?\d+)\s*px|0+\s*%|left)$/), y = pos[1].match(/^((-?\d+)\s*px|0+\s*%|top)$/), !x || !y)return;
                s.originX = s.startX = x[2] || 0, s.originY = s.startY = y[2] || 0;
            } else {
                var i = s.obj.position();
                s.obj.css({ top: i.top, left: i.left, right: "", bottom: "" }), s.originX = s.startX = i.left, s.originY = s.startY = i.top;
            }
            s.startX -= s.inversionFactor * Math.floor(s.xRange / 2), s.startY -= s.inversionFactor * Math.floor(s.yRange / 2), n >= 0 ? o.splice(n, 1, s) : o.push(s);
        });
    }, t.plax = {
        enable: function(n) { n && (n.activityTarget && (c = n.activityTarget || t(window)), "number" == typeof n.gyroRange && n.gyroRange > 0 && (l = n.gyroRange)), t(document).bind("mousemove.plax", function(t) { s(t); }), e() && (window.ondeviceorientation = function(t) { s(t); }); },
        disable: function(e) {
            if (t(document).unbind("mousemove.plax"), window.ondeviceorientation = void 0, e && "boolean" == typeof e.restorePositions && e.restorePositions)for (var n = o.length; n--;)layer = o[n], o[n].background ? layer.obj.css("background-position", layer.originX + "px " + layer.originY + "px") : layer.obj.css("left", layer.originX).css("top", layer.originY);
            e && "boolean" == typeof e.clearLayers && e.clearLayers && (o = []);
        }
    }, "undefined" != typeof ender && t.ender(t.fn, !0);
}(function() { return"undefined" != typeof jQuery ? jQuery : ender; }()), function() {
    var t, e, n;
    e = 0, n = function(t) {
        var n;
        return e++, n = $(t), n.plaxify({ xRange: n.data("xrange") || 0, yRange: n.data("yrange") || 0, invert: n.data("invert") || !1 }), 1 === e ? $.plax.enable() : void 0;
    }, t = function() { return e--, 0 === e ? $.plax.disable({ clearLayers: !0, restorePositions: !0 }) : void 0; }, $.observe(".js-plaxify", { add: n, remove: t });
}.call(this), function() { $.observe(".js-poll", function(t) { return $.ajaxPoll({ context: t, url: $(t).attr("data-url") }); }); }.call(this), function() { $(function() { return $(document.body).hasClass("js-print-popup") ? (window.print(), SetTimeout(window.close, 1e3)) : void 0; }); }.call(this), function() { $(document).on("click", ".js-reload", function() { return window.location.reload(), !1; }); }.call(this), function() {
    $(document).on("focusin", ".js-repo-filter .js-filterable-field", function() { return $(this).closest(".js-repo-filter").find(".js-more-repos-link").click(); }), $(document).on("click", ".js-repo-filter .js-repo-filter-tab", function() {
        var t;
        return t = $(this).closest(".js-repo-filter"), t.find(".js-more-repos-link").click(), t.find(".js-repo-filter-tab").removeClass("filter-selected"), $(this).addClass("filter-selected"), t.find(".js-filterable-field").fire("filterable:change"), !1;
    }), $(document).on("filterable:change", ".js-repo-filter .js-repo-list", function() {
        var t, e;
        t = $(this).closest(".js-repo-filter"), (e = t.find(".js-repo-filter-tab.filter-selected").attr("data-filter")) && $(this).children().not(e).hide();
    }), $(document).on("click:prepare", ".js-repo-filter .js-more-repos-link", function() { return $(this).hasClass("is-loading") ? !1 : void 0; }), $(document).on("ajaxSend", ".js-repo-filter .js-more-repos-link", function() { return $(this).addClass("is-loading"); }), $(document).on("ajaxComplete", ".js-repo-filter .js-more-repos-link", function() { return $(this).removeClass("is-loading"); }), $(document).on("ajaxSuccess", ".js-repo-filter .js-more-repos-link", function(t, e, n, s) {
        var r;
        return r = $(this).closest(".js-repo-filter"), r.find(".js-repo-list").html(s).pageUpdate(), r.find(".js-filterable-field").fire("filterable:change"), $(this).remove();
    });
}.call(this), function() {
    var t;
    $(function() { return $(".js-target-repo-menu")[0] ? $(".js-owner-select").trigger("change") : void 0; }), $(document).on("change", ".js-owner-select", function() {
        var t, e, n, s;
        return n = $(this).parents(".js-repo-selector"), s = $(this).find(".selected input").val(), t = $(n).find(".js-target-repo-menu"), e = $(n).find(".js-target-repo-menu[data-owner='" + s + "']"), t.removeClass("owner-is-active"), e.addClass("owner-is-active");
    }), $(document).on("click", ".js-repo-selector-add", function(e) {
        var n, s, r;
        return e.preventDefault(), r = $(this).parents(".js-repo-selector"), n = $(r).find(".js-owner-select").find(".selected .js-select-button-text").text().trim(), s = $(r).find(".js-target-repo-menu.owner-is-active").find(".selected .js-select-button-text").text().trim(), n.length && s.length ? t(r, n, s) : void 0;
    }), $(document).on("click", ".js-repo-entry-remove", function(t) {
        var e;
        return e = $(this).parents(".js-repo-selector"), $(this).parents(".js-repo-entry").remove(), 0 === $(e).find(".js-repo-entry:visible").length && $(e).find(".js-repo-select-blank").removeClass("hidden"), t.preventDefault();
    }), t = function(t, e, n) {
        var s;
        return s = $(t).find(".js-repo-entry-template").clone().removeClass("hidden js-repo-entry-template"), s.find(".js-entry-owner").text(e), s.find(".js-entry-repo").text(n), $(t).find(".js-repo-entry-list").append(s), $(t).find(".js-repo-select-blank").addClass("hidden");
    };
}.call(this), function() { $(document).on("ajaxSuccess", ".js-select-menu:not([data-multiple])", function() { return $(this).menu("deactivate"); }), $(document).on("ajaxSend", ".js-select-menu:not([data-multiple])", function() { return $(this).addClass("is-loading"); }), $(document).on("ajaxComplete", ".js-select-menu", function() { return $(this).removeClass("is-loading"); }), $(document).on("ajaxError", ".js-select-menu", function() { return $(this).addClass("has-error"); }), $(document).on("menu:deactivate", ".js-select-menu", function() { return $(this).removeClass("is-loading has-error"); }); }.call(this), function() {
    $(document).on("selectmenu:selected", ".js-select-menu .js-navigation-item", function() {
        var t, e, n;
        return t = $(this).closest(".js-select-menu"), n = $(this).find(".js-select-button-text"), n[0] && t.find(".js-select-button").html(n.html()), e = $(this).find(".js-select-menu-item-gravatar"), n[0] ? t.find(".js-select-button-gravatar").html(e.html()) : void 0;
    });
}.call(this), function() {
    $(document).on("selectmenu:change", ".js-select-menu .select-menu-list", function(t) {
        var e, n;
        n = $(this).find(".js-navigation-item"), n.removeClass("last-visible"), n.filter(":visible:last").addClass("last-visible"), $(this).is("[data-filterable-for]") || (e = $(t.target).hasClass("filterable-empty"), $(this).toggleClass("filterable-empty", e));
    });
}.call(this), function() { $(document).on("menu:activated", ".js-select-menu", function() { return $(this).find(".js-filterable-field").focus(); }), $(document).on("menu:deactivate", ".js-select-menu", function() { return $(this).find(".js-filterable-field").val("").trigger("filterable:change"); }); }.call(this), function() {
    $(document).on("navigation:open", ".js-select-menu:not([data-multiple]) .js-navigation-item", function() {
        var t, e;
        return e = $(this), t = e.closest(".js-select-menu"), t.find(".js-navigation-item.selected").removeClass("selected"), e.addClass("selected"), e.find("input[type=radio], input[type=checkbox]").prop("checked", !0).change(), e.fire("selectmenu:selected"), t.hasClass("is-loading") ? void 0 : t.menu("deactivate");
    }), $(document).on("navigation:open", ".js-select-menu[data-multiple] .js-navigation-item", function() {
        var t, e;
        return t = $(this), e = t.hasClass("selected"), t.toggleClass("selected", !e), t.find("input[type=radio], input[type=checkbox]").prop("checked", !e).change(), t.fire("selectmenu:selected");
    });
}.call(this), function() { $(document).on("menu:activate", ".js-select-menu", function() { return $(this).find(":focus").blur(), $(this).find(".js-menu-target").addClass("selected"), $(this).find(".js-navigation-container").navigation("push"); }), $(document).on("menu:deactivate", ".js-select-menu", function() { return $(this).find(".js-menu-target").removeClass("selected"), $(this).find(".js-navigation-container").navigation("pop"); }), $(document).on("filterable:change", ".js-select-menu .select-menu-list", function() { return $(this).navigation("refocus"); }); }.call(this), function() {
    var t;
    $(document).on("filterable:change", ".js-select-menu .select-menu-list", function(e) {
        var n, s;
        (s = $(this).find(".js-new-item-form")[0]) && (n = e.relatedTarget.value, "" === n || t(this, n) ? $(this).removeClass("is-showing-new-item-form") : ($(this).addClass("is-showing-new-item-form"), $(s).find(".js-new-item-name").text(n), $(s).find(".js-new-item-value").val(n))), $(e.target).trigger("selectmenu:change");
    }), t = function(t, e) {
        var n, s, r, a, i;
        for (i = $(t).find(".js-select-button-text"), r = 0, a = i.length; a > r; r++)if (n = i[r], s = $.trim($(n).text().toLowerCase()), s === e.toLowerCase())return!0;
        return!1;
    };
}.call(this), function() {
    var t;
    $(document).on("menu:activate", ".js-select-menu", function() {
        var e;
        return e = $(this).find(".js-select-menu-tab-bucket .selected").closest(".js-select-menu-tab-bucket").attr("data-tab-filter"), t($(this), e);
    }), $(document).on("click", ".js-select-menu .js-select-menu-tab", function() {
        var e;
        return(e = $(this).attr("data-tab-filter")) && t($(this).closest(".js-select-menu"), e), !1;
    }), t = function(t, e) {
        var n, s, r;
        return t.find("[data-tab-filter]").removeClass("selected"), e ? (n = function() { return $(this).attr("data-tab-filter") === e; }, s = t.find(".js-select-menu-tab").filter(n), r = t.find(".js-select-menu-tab-bucket").filter(n)) : (s = t.find(".js-select-menu-tab:first"), r = t.find(".js-select-menu-tab-bucket:first")), s.addClass("selected"), r.addClass("selected"), t.find(".js-filterable-field").trigger("filterable:change");
    };
}.call(this), function() { $(document).on("ajaxSuccess", ".js-social-container", function(t, e, n, s) { return $(this).find(".js-social-count").text(s.count); }); }.call(this), function() {
    var t, e = [].slice;
    "undefined" != typeof EventSource && null !== EventSource && (navigator.userAgent.match(/iPhone/) || (t = function() {

        function t(e) {
            var n = this;
            this.base = e, this.flush = function() { return t.prototype.flush.apply(n, arguments); }, this.setup = function() { return t.prototype.setup.apply(n, arguments); }, this.readyState = this.CONNECTING, this.listeners = {}, setImmediate(this.setup);
        }

        return t.prototype.CONNECTING = 0, t.prototype.OPEN = 1, t.prototype.CLOSED = 2, t.prototype.setup = function() {
            var t, e, n = this;
            (e = this.popMessages()) && (t = { message: e }), $.ajax({
                type: "POST",
                url: this.base,
                data: t,
                success: function(t, e, s) {
                    var r;
                    return(r = s.getResponseHeader("Location")) ? (n.pollUrl = r, n.messageUrl = "" + n.pollUrl + "/message") : (n.pollUrl = t.pollUrl, n.messageUrl = t.messageUrl), n.pollUrl ? (n.readyState = n.OPEN, n.fire("open"), n.readyState === n.OPEN ? (n.flush(), n.start()) : void 0) : n.close();
                },
                error: function() { return n.close(); }
            });
        }, t.prototype.start = function() {
            var t = this;
            this.source = new EventSource(this.pollUrl), this.source.addEventListener("message", function(e) {
                var n;
                n = JSON.parse(e.data), t.fire("message", n);
            }), this.source.addEventListener("reopen", function() { t.fire("reopen"); }), this.source.addEventListener("error", function() { t.source.readyState === EventSource.CLOSED && t.close(); });
        }, t.prototype.on = function(t, e) {
            var n, s;
            return null == (s = (n = this.listeners)[t]) && (n[t] = []), this.listeners[t].push(e), this;
        }, t.prototype.fire = function() {
            var t, n, s, r, a, i;
            if (r = arguments[0], t = 2 <= arguments.length ? e.call(arguments, 1) : [], s = this.listeners[r])for (a = 0, i = s.length; i > a; a++)n = s[a], n.apply(this, t);
        }, t.prototype.close = function() {
            var t;
            this.readyState = this.CLOSED, null != (t = this.source) && t.close(), this.source = null, this.pollUrl = null, this.messageUrl = null, this.fire("close");
        }, t.prototype.send = function(t) {
            var e, n;
            null == (e = this.outbox) && (this.outbox = []), this.outbox.push(t), this.fire("send", t), this.readyState === this.OPEN && null == (n = this.flushTimeout) && (this.flushTimeout = setTimeout(this.flush, 0));
        }, t.prototype.flush = function() {
            var t, e = this;
            this.messageUrl && (this.flushTimeout = null, (t = this.popMessages()) && $.ajax({ type: "POST", url: this.messageUrl, data: { message: t }, error: function() { return e.close(); } }));
        }, t.prototype.popMessages = function() {
            var t;
            if (this.outbox)return t = this.outbox, this.outbox = null, t;
        }, t;
    }(), $.socket = function(e) { return new t(e); }));
}.call(this), function() {
    $.socket && ($.fn.socket = function() {
        var t, e;
        if ((t = this[0]) && $(t).is("link[rel=xhr-socket]"))return e = $(t).data("socket"), e && e.readyState !== e.CLOSED ? e : (e = $.socket(t.href), e.on("open", function() { return $(t).trigger("socket:open", [this]); }), e.on("close", function() { return $(t).trigger("socket:close", [this]); }), e.on("reopen", function() { return $(t).trigger("socket:reopen", [this]); }), e.on("send", function(e) { return $(t).trigger("socket:send", [e, this]); }), e.on("message", function(e) { return $(t).trigger("socket:message", [e, this]); }), $(t).data("socket", e), e);
    });
}.call(this), function() {
    var t, e, n, s, r, a, i;
    $.fn.socket && (r = {}, t = {}, i = null, n = function() {
        var t;
        return null != i ? i : i = (t = $(document.head).find("link[rel=xhr-socket]")[0]) ? $(t).socket() : !1;
    }, e = function(t) {
        var e, n;
        return null != (e = null != (n = t.getAttribute("data-channel")) ? n.split(/\s+/) : void 0) ? e : [];
    }, s = function(s) {
        var a, i, o, c, l, u;
        if (i = n())for (l = e(s), o = 0, c = l.length; c > o; o++)a = l[o], r[a] || (i.send({ subscribe: a }), r[a] = !0), null == (u = t[a]) && (t[a] = []), t[a].push(s);
    }, a = function(n) {
        var s, r, a, i;
        for (i = e(n), r = 0, a = i.length; a > r; r++)s = i[r], t[s] = $(t[s]).not(n).slice(0);
    }, $(document).on("socket:reopen", "link[rel=xhr-socket]", function(t, e) {
        var n, s;
        for (n in r)s = r[n], e.send({ subscribe: n });
    }), $(document).on("socket:message", "link[rel=xhr-socket]", function(e, n) {
        var s, r;
        r = n[0], s = n[1], r && s && $(t[r]).trigger("socket:message", [s, r]);
    }), $.observe(".js-socket-channel[data-channel]", { add: s, remove: a }));
}.call(this), function() {
    $.fn.socket && $(document).on("visibilitychange webkitvisibilitychange mozvisibilitychange msvisibilitychange", function() {
        var t;
        (t = $(document.head).find("link[rel=xhr-socket]").data("socket")) && (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden ? t.send({ visibility: "hidden" }) : t.send({ visibility: "visible" }));
    });
}.call(this), function() {
    var t;
    t = function() {

        function t() {
            var e = this;
            this.onMouseMove = function() { return t.prototype.onMouseMove.apply(e, arguments); }, this.onMouseUp = function() { return t.prototype.onMouseUp.apply(e, arguments); }, this.onMouseDown = function() { return t.prototype.onMouseDown.apply(e, arguments); }, $(document).on("mousedown", ".js-sortable-container .js-sortable-target", this.onMouseDown);
        }

        var e;
        return e = $("<li />").addClass("js-sortable-placeholder sortable-placeholder"), t.prototype.onMouseDown = function(t) { return $(t.currentTarget).addClass("js-sorting").fadeTo(0, .5).css({ "z-index": 10, position: "absolute", top: $(t.currentTarget).position().top, left: $(t.currentTarget).position().left }).after(e), $(document).on("mousemove.sortable", this.onMouseMove), $(document).on("mouseup", this.onMouseUp), !1; }, t.prototype.onMouseUp = function() { return $(".js-sorting").removeClass("js-sorting").fadeTo(0, 1).css({ "z-index": "", position: "", top: "", left: "" }), $(".js-sortable-placeholder").remove(), $(document).off("mousemove.sortable", this.onMouseMove), $(document).off("mouseup", this.onMouseUp), !1; }, t.prototype.onMouseMove = function(t) {
            var e, n, s;
            return e = $(".js-sorting"), s = t.pageY - e.parent().offset().top, n = $(".js-sorting").height(), 0 + n / 2 > s ? $(".js-sorting").css({ top: 0 }) : s > e.parent().height() - n / 2 ? $(".js-sorting").css({ top: e.parent().height() - e.height() }) : $(".js-sorting").css({ top: s - n / 2 }), $(".js-sorting").index() < e.parent().find(".js-sortable-target").length && $(".js-sorting").index() >= 0 && ($(".js-sorting").position().top > $(".js-sortable-placeholder").position().top + .8 * n ? ($(".js-sortable-placeholder").insertAfter($(".js-sortable-placeholder").next()), $(".js-sorting").insertBefore($(".js-sortable-placeholder"))) : $(".js-sorting").position().top < $(".js-sortable-placeholder").position().top - .8 * n && ($(".js-sortable-placeholder").insertBefore($(".js-sortable-placeholder").prev().prev()), $(".js-sorting").insertBefore($(".js-sortable-placeholder")))), !1;
        }, t;
    }(), new t;
}.call(this), function() {
    var t;
    t = function() {

        function t(e) {
            var n, s = this;
            this.textarea = e, this.onNavigationOpen = function() { return t.prototype.onNavigationOpen.apply(s, arguments); }, this.onNavigationKeyDown = function() { return t.prototype.onNavigationKeyDown.apply(s, arguments); }, this.onKeyUp = function() { return t.prototype.onKeyUp.apply(s, arguments); }, this.teardown = function() { return t.prototype.teardown.apply(s, arguments); }, $(this.textarea).on("focusout:delayed.suggester", this.teardown), $(this.textarea).on("keyup.suggester", this.onKeyUp), this.suggester = (n = $(this.textarea).attr("data-suggester")) ? document.getElementById(n) : $(this.textarea).closest(".js-suggester-container").find(".js-suggester")[0], $(this.suggester).on("navigation:keydown.suggester", "[data-value]", this.onNavigationKeyDown), $(this.suggester).on("navigation:open.suggester", "[data-value]", this.onNavigationOpen), this.loadSuggestions();
        }

        var e, n;
        return t.prototype.types = { mention: { search: "fuzzy", limit: 5, className: "mention-suggestions", match: /(^|\s)@([a-z0-9\-_\/]*)$/i, replace: "$1@$value " }, emoji: { search: "prefix", limit: 5, className: "emoji-suggestions", match: /(^|\s):([a-z0-9\-\+_]*)$/i, replace: "$1:$value: " }, hashed: { search: "fuzzy-hashed", limit: 5, className: "hashed-suggestions", match: /(^|\s)\#([a-z0-9\-_\/]*)$/i, replace: "$1#$value " } }, n = function(t) { return t.replace(/`{3,}[^`]*\n(.+)?\n`{3,}/g, ""); }, e = function(t) {
            var e, s;
            return(null != (e = t.match(/`{3,}/g)) ? e.length : void 0) % 2 ? !0 : (null != (s = n(t).match(/`/g)) ? s.length : void 0) % 2 ? !0 : void 0;
        }, t.prototype.teardown = function() { this.deactivate(), $(this.textarea).off(".suggester"), $(this.suggester).off(".suggester"); }, t.prototype.onKeyUp = function() { return this.checkQuery() ? !1 : void 0; }, t.prototype.onNavigationKeyDown = function(t) {
            switch (t.hotkey) {
            case"tab":
                return this.onNavigationOpen(t), !1;
            case"esc":
                return this.deactivate(), !1;
            }
        }, t.prototype.onNavigationOpen = function(t) {
            var e, n, s;
            return s = $(t.target).attr("data-value"), n = this.textarea.value.substring(0, this.textarea.selectionEnd), e = this.textarea.value.substring(this.textarea.selectionEnd), n = n.replace(this.type.match, this.type.replace.replace("$value", s)), this.textarea.value = n + e, this.deactivate(), this.textarea.focus(), this.textarea.selectionStart = n.length, this.textarea.selectionEnd = n.length, !1;
        }, t.prototype.checkQuery = function() {
            var t, e, n;
            if (n = this.searchQuery(), e = n[0], t = n[1], null != e && null != t) {
                if (t === this.query)return;
                return this.type = e, this.query = t, this.search(e, t) ? this.activate() : this.deactivate(), this.query;
            }
            this.type = this.query = null, this.deactivate();
        }, t.prototype.activate = function() {
            $(this.suggester).hasClass("active") || ($(this.suggester).addClass("active"), $(this.suggester).css($(this.textarea).textareaSelectionPosition()), $(this.textarea).addClass("js-navigation-enable"), $(this.suggester).navigation("push"), $(this.suggester).navigation("focus"));
        }, t.prototype.deactivate = function() { $(this.suggester).hasClass("active") && ($(this.suggester).removeClass("active"), $(this.suggester).find(".suggestions").hide(), $(this.textarea).removeClass("js-navigation-enable"), $(this.suggester).navigation("pop")); }, t.prototype.search = function(t, e) {
            var n, s;
            return n = $(this.suggester).find("ul." + t.className), n[0] ? (s = function() {
                switch (t.search) {
                case"fuzzy-hashed":
                    return n.fuzzyFilterSortList("#" + e, { limit: t.limit });
                case"fuzzy":
                    return n.fuzzyFilterSortList(e, { limit: t.limit });
                default:
                    return n.prefixFilterList(e, { limit: t.limit });
                }
            }(), s > 0 ? (n.show(), $(this.suggester).navigation("focus"), !0) : !1) : void 0;
        }, t.prototype.searchQuery = function() {
            var t, n, s, r, a;
            if (s = this.textarea.value.substring(0, this.textarea.selectionEnd), e(s))return[];
            a = this.types;
            for (n in a)if (r = a[n], t = s.match(r.match))return[r, t[2]];
            return[];
        }, t.prototype.loadSuggestions = function() {
            var t = this;
            if (!$(this.suggester).children().length)return $.ajax({ url: $(this.suggester).attr("data-url"), success: function(e) { return $(t.suggester).html(e), t.type = t.query = null, t.checkQuery(); } });
        }, t;
    }(), $(document).on("focusin:delayed", "textarea[data-suggester],.js-suggester-field", function() { new t(this); });
}.call(this), function() {
    $(document).on("tasklist:change", ".js-task-list-container", function() { return $(this).addClass("is-updating-task-list").taskList("disable"); }), $(document).on("tasklist:changed", ".js-task-list-container", function(t, e, n) {
        var s, r, a, i;
        return r = $(this).find("form.js-comment-update"), a = r.find("input[name=task_list_key]"), a.length > 0 || (i = r.find(".js-task-list-field").attr("name").split("[")[0], a = $("<input>", { type: "hidden", name: "task_list_key", value: i }), r.append(a)), s = $("<input>", { type: "hidden", name: "task_list_checked", value: null != n ? n : { 1: "0" } }), r.append(s), r.one("ajaxComplete", function() { return s.remove(); }), r.submit();
    }), $(document).on("ajaxSuccess", ".js-task-list-container", function(t) { return $(t.target).is("form.js-comment-update") ? ($(this).removeClass("is-updating-task-list"), $(this).taskList("enable")) : void 0; }), $.pageUpdate(function() { return $(this).find(".js-task-list-container:not(.is-updating-task-list)").taskList("enable"); });
}.call(this), function() {
    $(document).on("ajaxBeforeSend", function(t, e, n) {
        var s;
        n.crossDomain || (s = document.getElementById("js-timeline-marker")) && e.setRequestHeader("X-Timeline-Last-Modified", $(s).attr("data-last-modified"));
    });
}.call(this), function(t) {
    var e = function() {
        "use strict";
        var t = "s",
            n = function(t) {
                var e = -t.getTimezoneOffset();
                return null !== e ? e : 0;
            },
            s = function(t, e, n) {
                var s = new Date;
                return void 0 !== t && s.setFullYear(t), s.setMonth(e), s.setDate(n), s;
            },
            r = function(t) { return n(s(t, 0, 2)); },
            a = function(t) { return n(s(t, 5, 2)); },
            i = function(t) {
                var e = t.getMonth() > 7, s = e ? a(t.getFullYear()) : r(t.getFullYear()), i = n(t), o = 0 > s, c = s - i;
                return o || e ? 0 !== c : 0 > c;
            },
            o = function() {
                var e = r(), n = a(), s = e - n;
                return 0 > s ? e + ",1" : s > 0 ? n + ",1," + t : e + ",0";
            },
            c = function() {
                var t = o();
                return new e.TimeZone(e.olson.timezones[t]);
            },
            l = function(t) {
                var e = new Date(2010, 6, 15, 1, 0, 0, 0), n = { "America/Denver": new Date(2011, 2, 13, 3, 0, 0, 0), "America/Mazatlan": new Date(2011, 3, 3, 3, 0, 0, 0), "America/Chicago": new Date(2011, 2, 13, 3, 0, 0, 0), "America/Mexico_City": new Date(2011, 3, 3, 3, 0, 0, 0), "America/Asuncion": new Date(2012, 9, 7, 3, 0, 0, 0), "America/Santiago": new Date(2012, 9, 3, 3, 0, 0, 0), "America/Campo_Grande": new Date(2012, 9, 21, 5, 0, 0, 0), "America/Montevideo": new Date(2011, 9, 2, 3, 0, 0, 0), "America/Sao_Paulo": new Date(2011, 9, 16, 5, 0, 0, 0), "America/Los_Angeles": new Date(2011, 2, 13, 8, 0, 0, 0), "America/Santa_Isabel": new Date(2011, 3, 5, 8, 0, 0, 0), "America/Havana": new Date(2012, 2, 10, 2, 0, 0, 0), "America/New_York": new Date(2012, 2, 10, 7, 0, 0, 0), "Europe/Helsinki": new Date(2013, 2, 31, 5, 0, 0, 0), "Pacific/Auckland": new Date(2011, 8, 26, 7, 0, 0, 0), "America/Halifax": new Date(2011, 2, 13, 6, 0, 0, 0), "America/Goose_Bay": new Date(2011, 2, 13, 2, 1, 0, 0), "America/Miquelon": new Date(2011, 2, 13, 5, 0, 0, 0), "America/Godthab": new Date(2011, 2, 27, 1, 0, 0, 0), "Europe/Moscow": e, "Asia/Amman": new Date(2013, 2, 29, 1, 0, 0, 0), "Asia/Beirut": new Date(2013, 2, 31, 2, 0, 0, 0), "Asia/Damascus": new Date(2013, 3, 6, 2, 0, 0, 0), "Asia/Jerusalem": new Date(2013, 2, 29, 5, 0, 0, 0), "Asia/Yekaterinburg": e, "Asia/Omsk": e, "Asia/Krasnoyarsk": e, "Asia/Irkutsk": e, "Asia/Yakutsk": e, "Asia/Vladivostok": e, "Asia/Baku": new Date(2013, 2, 31, 4, 0, 0), "Asia/Yerevan": new Date(2013, 2, 31, 3, 0, 0), "Asia/Kamchatka": e, "Asia/Gaza": new Date(2010, 2, 27, 4, 0, 0), "Africa/Cairo": new Date(2010, 4, 1, 3, 0, 0), "Europe/Minsk": e, "Pacific/Apia": new Date(2010, 10, 1, 1, 0, 0, 0), "Pacific/Fiji": new Date(2010, 11, 1, 0, 0, 0), "Australia/Perth": new Date(2008, 10, 1, 1, 0, 0, 0) };
                return n[t];
            };
        return{ determine: c, date_is_dst: i, dst_start_for: l };
    }();
    e.TimeZone = function(t) {
        "use strict";
        var n = { "America/Denver": ["America/Denver", "America/Mazatlan"], "America/Chicago": ["America/Chicago", "America/Mexico_City"], "America/Santiago": ["America/Santiago", "America/Asuncion", "America/Campo_Grande"], "America/Montevideo": ["America/Montevideo", "America/Sao_Paulo"], "Asia/Beirut": ["Asia/Amman", "Asia/Jerusalem", "Asia/Beirut", "Europe/Helsinki", "Asia/Damascus"], "Pacific/Auckland": ["Pacific/Auckland", "Pacific/Fiji"], "America/Los_Angeles": ["America/Los_Angeles", "America/Santa_Isabel"], "America/New_York": ["America/Havana", "America/New_York"], "America/Halifax": ["America/Goose_Bay", "America/Halifax"], "America/Godthab": ["America/Miquelon", "America/Godthab"], "Asia/Dubai": ["Europe/Moscow"], "Asia/Dhaka": ["Asia/Yekaterinburg"], "Asia/Jakarta": ["Asia/Omsk"], "Asia/Shanghai": ["Asia/Krasnoyarsk", "Australia/Perth"], "Asia/Tokyo": ["Asia/Irkutsk"], "Australia/Brisbane": ["Asia/Yakutsk"], "Pacific/Noumea": ["Asia/Vladivostok"], "Pacific/Tarawa": ["Asia/Kamchatka", "Pacific/Fiji"], "Pacific/Tongatapu": ["Pacific/Apia"], "Asia/Baghdad": ["Europe/Minsk"], "Asia/Baku": ["Asia/Yerevan", "Asia/Baku"], "Africa/Johannesburg": ["Asia/Gaza", "Africa/Cairo"] }, s = t, r = function() { for (var t = n[s], r = t.length, a = 0, i = t[0]; r > a; a += 1)if (i = t[a], e.date_is_dst(e.dst_start_for(i)))return s = i, void 0; }, a = function() { return"undefined" != typeof n[s]; };
        return a() && r(), { name: function() { return s; } };
    }, e.olson = {}, e.olson.timezones = { "-720,0": "Pacific/Majuro", "-660,0": "Pacific/Pago_Pago", "-600,1": "America/Adak", "-600,0": "Pacific/Honolulu", "-570,0": "Pacific/Marquesas", "-540,0": "Pacific/Gambier", "-540,1": "America/Anchorage", "-480,1": "America/Los_Angeles", "-480,0": "Pacific/Pitcairn", "-420,0": "America/Phoenix", "-420,1": "America/Denver", "-360,0": "America/Guatemala", "-360,1": "America/Chicago", "-360,1,s": "Pacific/Easter", "-300,0": "America/Bogota", "-300,1": "America/New_York", "-270,0": "America/Caracas", "-240,1": "America/Halifax", "-240,0": "America/Santo_Domingo", "-240,1,s": "America/Santiago", "-210,1": "America/St_Johns", "-180,1": "America/Godthab", "-180,0": "America/Argentina/Buenos_Aires", "-180,1,s": "America/Montevideo", "-120,0": "America/Noronha", "-120,1": "America/Noronha", "-60,1": "Atlantic/Azores", "-60,0": "Atlantic/Cape_Verde", "0,0": "UTC", "0,1": "Europe/London", "60,1": "Europe/Berlin", "60,0": "Africa/Lagos", "60,1,s": "Africa/Windhoek", "120,1": "Asia/Beirut", "120,0": "Africa/Johannesburg", "180,0": "Asia/Baghdad", "180,1": "Europe/Moscow", "210,1": "Asia/Tehran", "240,0": "Asia/Dubai", "240,1": "Asia/Baku", "270,0": "Asia/Kabul", "300,1": "Asia/Yekaterinburg", "300,0": "Asia/Karachi", "330,0": "Asia/Kolkata", "345,0": "Asia/Kathmandu", "360,0": "Asia/Dhaka", "360,1": "Asia/Omsk", "390,0": "Asia/Rangoon", "420,1": "Asia/Krasnoyarsk", "420,0": "Asia/Jakarta", "480,0": "Asia/Shanghai", "480,1": "Asia/Irkutsk", "525,0": "Australia/Eucla", "525,1,s": "Australia/Eucla", "540,1": "Asia/Yakutsk", "540,0": "Asia/Tokyo", "570,0": "Australia/Darwin", "570,1,s": "Australia/Adelaide", "600,0": "Australia/Brisbane", "600,1": "Asia/Vladivostok", "600,1,s": "Australia/Sydney", "630,1,s": "Australia/Lord_Howe", "660,1": "Asia/Kamchatka", "660,0": "Pacific/Noumea", "690,0": "Pacific/Norfolk", "720,1,s": "Pacific/Auckland", "720,0": "Pacific/Tarawa", "765,1,s": "Pacific/Chatham", "780,0": "Pacific/Tongatapu", "780,1,s": "Pacific/Apia", "840,0": "Pacific/Kiritimati" }, "undefined" != typeof exports ? exports.jstz = e : t.jstz = e;
}(this), function() {
    var t, e;
    e = jstz.determine().name(), "https:" === location.protocol && (t = "secure"), document.cookie = "tz=" + encodeURIComponent(e) + "; path=/; " + t;
}.call(this), function() {
    var t;
    null != (null != (t = window.performance) ? t.timing : void 0) && $(window).on("load", function() {
        return setTimeout(function() {
            var t, e, n, s;
            e = {}, s = window.performance.timing;
            for (t in s)n = s[t], "number" == typeof n && (e[t] = n);
            return $.ajax({ url: "/_stats", type: "POST", data: { timing: e } });
        }, 0);
    });
}.call(this), function() {
    var t;
    t = function() {
        var t;
        return t = $(this), t.hasClass("downwards") ? "n" : t.hasClass("rightwards") ? "w" : t.hasClass("leftwards") ? "e" : t.hasClass("downandright") ? "nw" : "s";
    }, $.observe(".tooltipped", { init: function() { return $(this).tipsy({ gravity: t }); }, add: function() { return $(this).tipsy("enable"); }, remove: function() { return $(this).tipsy("disable"), $.fn.tipsy.revalidate(); } });
}.call(this), function() {
    var t;
    t = function() {

        function t() {
            var e = this;
            this.onToggle = function() { return t.prototype.onToggle.apply(e, arguments); }, this.onError = function() { return t.prototype.onError.apply(e, arguments); }, this.onSuccess = function() { return t.prototype.onSuccess.apply(e, arguments); }, this.onComplete = function() { return t.prototype.onComplete.apply(e, arguments); }, this.onBeforeSend = function() { return t.prototype.onBeforeSend.apply(e, arguments); }, this.onClick = function() { return t.prototype.onClick.apply(e, arguments); }, $(document).on("click", ".js-toggler-container .js-toggler-target", this.onClick), $(document).on("ajaxBeforeSend", ".js-toggler-container", this.onBeforeSend), $(document).on("ajaxComplete", ".js-toggler-container", this.onComplete), $(document).on("ajaxSuccess", ".js-toggler-container", this.onSuccess), $(document).on("ajaxError", ".js-toggler-container", this.onError), $(document).on("toggler:toggle", ".js-toggler-container", this.onToggle);
        }

        return t.prototype.onClick = function(t) { return $(t.target).trigger("toggler:toggle"), !1; }, t.prototype.onBeforeSend = function(t) {
            var e;
            return e = t.currentTarget, $(e).removeClass("success error"), $(e).addClass("loading");
        }, t.prototype.onComplete = function(t) { return $(t.currentTarget).removeClass("loading"); }, t.prototype.onSuccess = function(t) { return $(t.currentTarget).addClass("success"); }, t.prototype.onError = function(t) { return $(t.currentTarget).addClass("error"); }, t.prototype.onToggle = function(t) {
            var e;
            return e = t.currentTarget, $(e).toggleClass("on");
        }, t;
    }(), new t;
}.call(this), function() {
    var t;
    t = function(t, e, n) {
        var s, r;
        return null == n && (n = !0), r = $.Deferred(), s = $(t), 0 === s.length && debug("[updatable_content] Did not find a matching element in the page for " + t.selector), $.preserveInteractivePosition(function() { n && s.hasInteractions() ? r.rejectWith(s) : r.resolveWith(s.replaceContent(e)); }), r.promise();
    }, $.fn.updateContent = function(e, n) {
        var s, r;
        return null == n && (n = {}), (s = this.data("update-content")) ? s : (e ? (null != (r = this.data("xhr")) && r.abort(), s = t(this, e, !1)) : s = this.ajax({ channel: n.channel }).then(function(e) { return t(this, e, !0); }), this.data("update-content", s), s.always(function() { return $(this).removeData("update-content"); }), s);
    }, $(document).on("socket:message", ".js-updatable-content", function(t, e, n) { this === t.target && $(this).updateContent(null, { channel: n }); });
}.call(this), function() {
    var t,
        e,
        n,
        s,
        r,
        a,
        i,
        o,
        c,
        l,
        u,
        d,
        h,
        f,
        m,
        p,
        g,
        v,
        y,
        b,
        j,
        x,
        w,
        C,
        k,
        S,
        _,
        T,
        D,
        A,
        M = [].indexOf || function(t) {
            for (var e = 0, n = this.length; n > e; e++)if (e in this && this[e] === t)return e;
            return-1;
        },
        B = {}.hasOwnProperty,
        P = function(t, e) {

            function n() { this.constructor = t; }

            for (var s in e)B.call(e, s) && (t[s] = e[s]);
            return n.prototype = e.prototype, t.prototype = new n, t.__super__ = e.prototype, t;
        };
    r = function() {

        function t() { this.uploads = [], this.busy = !1; }

        return t.prototype.upload = function(t, e) {
            var n, s, r, a;
            return a = e.start || function() {}, r = e.progress || function() {}, n = e.complete || function() {}, s = e.error || function() {}, this.uploads.push({ file: t, to: e.to, form: e.form || {}, start: a, progress: r, complete: n, error: s }), this.process();
        }, t.prototype.process = function() {
            var t, e, n, s, r, a, i = this;
            if (!this.busy && 0 !== this.uploads.length) {
                n = this.uploads.shift(), this.busy = !0, r = new XMLHttpRequest, r.open("POST", n.to, !0), r.setRequestHeader("X-CSRF-Token", this.token()), r.onloadstart = function() { return n.start(); }, r.onreadystatechange = function() {
                    var t;
                    return 4 === r.readyState ? (204 === r.status ? (t = r.getResponseHeader("Location"), n.complete({ href: t })) : 201 === r.status ? n.complete(JSON.parse(r.responseText)) : n.error(), i.busy = !1, i.process()) : void 0;
                }, r.onerror = function() { return n.error(); }, r.upload.onprogress = function(t) {
                    var e;
                    return t.lengthComputable ? (e = Math.round(100 * (t.loaded / t.total)), n.progress(e)) : void 0;
                }, t = new FormData, a = n.form;
                for (e in a)s = a[e], t.append(e, s);
                return t.append("file", n.file), r.send(t);
            }
        }, t.prototype.token = function() { return $('meta[name="csrf-token"]').attr("content"); }, t;
    }(), s = function() {

        function t(e) {
            var n = this;
            this.container = e, this.available = function() { return t.prototype.available.apply(n, arguments); }, this.model = $(e).data("model"), this.policyUrl = "/upload/policies/" + this.model;
        }

        var e, n, s;
        return n = ["image/gif", "image/png", "image/jpeg"], e = ["gif", "png", "jpg", "jpeg"], t.prototype.available = function() { return this.field && null != this.field[0]; }, t.prototype.okToUpload = function(t) { return this.acceptableSize(t) && s(t.type); }, t.prototype.acceptableSize = function(t) { return t.size < 5242880; }, t.prototype.setup = function(t) { return t(); }, t.prototype.start = function() {}, t.prototype.progress = function() {}, t.prototype.complete = function() {}, t.prototype.error = function() {}, t.prototype.acceptsExtension = function(t) {
            var n;
            return n = t.split(".").pop(), M.call(e, n) >= 0;
        }, s = function(t) { return M.call(n, t) >= 0; }, t;
    }(), w = [], n = function(t) {

        function e(t) {
            var n = this;
            this.container = t, this.complete = function() { return e.prototype.complete.apply(n, arguments); }, e.__super__.constructor.call(this, t), this.field = $(t).siblings("ul.js-releases-field"), this.li = this.field.find("li.js-template"), this.meter = $(t).find(".js-upload-meter");
        }

        var n, s, r;
        return P(e, t), e.prototype.setup = function(t) { return $("#release_id").val() ? t() : w.length > 0 ? w.push(t) : (w.push(t), $("button.js-save-draft").trigger("click", this.clearSetupQueue)); }, e.prototype.clearSetupQueue = function() {
            var t, e;
            for (e = []; t = w.pop();)e.push(t());
            return e;
        }, e.prototype.start = function() { return this.meter.show(); }, e.prototype.progress = function(t) { return this.meter.css("width", t + "%"); }, e.prototype.complete = function(t) {
            var e, n, s;
            return n = this.li.clone(), n.removeClass("template"), n.removeClass("js-template"), e = t.asset.name || t.asset.href.split("/").pop(), n.find(".filename").val(e), t.asset.size ? (s = (t.asset.size / 1048576).toFixed(2), n.find(".filesize").text("(" + s + "MB)")) : n.find(".filesize").text(""), n.find("input[type=hidden].url").val(t.asset.href), n.find("input[type=hidden].id").val(t.asset.id), this.field.append(n), this.field.addClass("is-populated"), this.meter.hide();
        }, e.prototype.okToUpload = function(t) { return this.acceptsExtension(t.name); }, r = ["app"], e.prototype.acceptsExtension = function(t) {
            var e;
            return e = t.split(".").pop(), M.call(r, e) >= 0 ? (C(this.container), this.container.addClass("is-bad-file"), !1) : !0;
        }, n = function() { return!0; }, s = function() { return!0; }, e;
    }(s), t = function(t) {

        function e(t) {
            var n = this;
            this.container = t, this.complete = function() { return e.prototype.complete.apply(n, arguments); }, e.__super__.constructor.call(this, t), this.field = $(t).find("img.js-image-field"), this.input = $(t).find("input.js-oauth-application-logo-id");
        }

        return P(e, t), e.prototype.complete = function(t) { return this.field.attr("src", t.asset.href), this.input.val(t.asset.id), this.container.addClass("has-uploaded-logo"); }, e;
    }(s), e = function(t) {

        function e(t) {
            var n = this;
            this.container = t, this.error = function() { return e.prototype.error.apply(n, arguments); }, this.complete = function() { return e.prototype.complete.apply(n, arguments); }, this.start = function() { return e.prototype.start.apply(n, arguments); }, e.__super__.constructor.call(this, t), this.field = $(t).find("textarea.js-comment-field");
        }

        var n, s, r, a, i;
        return P(e, t), r = function(t) { return t.toLowerCase().replace(/[^a-z0-9\-_]+/gi, ".").replace(/\.{2,}/g, ".").replace(/^\.|\.$/gi, ""); }, a = function(t) { return"![Uploading " + t + " . . .]()"; }, n = function(t) { return r(t).replace(/(.*)\.[^.]+$/, "$1").replace(/\./g, " "); }, s = function(t, e) {
            var n, s, r, a;
            return r = t.selectionEnd, n = t.value.substring(0, r), a = t.value.substring(r), s = "" === t.value || n.match(/\n$/) ? "" : "\n", t.value = n + s + e + a, t.selectionStart = r + e.length, t.selectionEnd = r + e.length;
        }, i = function(t, e, n) {
            var s, r;
            return $(t).data("link-replace") ? t.value = n : (s = t.value.substring(0, t.selectionEnd), r = t.value.substring(t.selectionEnd), s = s.replace(e, n), r = r.replace(e, n), t.value = s + r, t.selectionStart = s.length, t.selectionEnd = s.length);
        }, e.prototype.start = function(t) { return s(this.field[0], a(t.name) + "\n"); }, e.prototype.complete = function(t) {
            var e, s;
            return s = a(t.asset.original_name), e = "![" + n(t.asset.name) + "](" + t.asset.href + ")", i(this.field[0], s, e);
        }, e.prototype.error = function(t) {
            var e;
            return e = a(t.asset.original_name), i(this.field[0], e, "");
        }, e;
    }(s), j = ["is-default", "is-uploading", "is-bad-file", "is-too-big", "is-failed"], C = function(t) { return $(t).removeClass(j.join(" ")); }, k = function(t) { return C(t), $(t).addClass("is-default"); }, A = new r, S = function(s) {
        var r;
        return r = new e(s), r.available() || (r = new t(s)), r.available() || (r = new n(s)), r && r.available() ? r : void 0;
    }, x = function(t, e) {
        var n;
        return n = S(e), n && n.okToUpload(t) ? n.setup(function() {
            return l(t, n.policyUrl, {
                success: function(e) {
                    var s;
                    return n.start(t), s = u(e, n), A.upload(t, s);
                },
                error: function(t) { return C(e), 422 === t.status ? e.addClass("is-bad-file") : e.addClass("is-failed-request"); }
            });
        }) : void 0;
    }, l = function(t, e, n) { return $.ajax({ type: "POST", url: e, data: { name: t.name, size: t.size, content_type: t.type, repository_id: $("#release_repository_id").val(), release_id: $("#release_id").val(), team_id: $("[data-team-id]").data("team-id") }, success: n.success, error: n.error }); }, u = function(t, e) {
        var n, s;
        return n = $(e.container), s = { to: t.upload_url, form: t.form, start: function() { return C(n), n.addClass("is-uploading"); }, progress: function(t) { return e.progress(t); }, complete: function() { return $.ajax({ type: "PUT", url: t.asset_upload_url }), e.complete(t), e.field.trigger("change"), k(n); }, error: function() { return e.error(t), e.field.trigger("change"), C(n), n.addClass("is-failed"); } };
    }, _ = function(t) {
        var e, n, s, r;
        if (!t.types)return!1;
        for (r = t.types, n = 0, s = r.length; s > n; n++)if (e = r[n], "Files" === e)return!0;
        return!1;
    }, T = function(t) {
        var e, n, s, r;
        if (!t.types)return!1;
        for (r = t.types, n = 0, s = r.length; s > n; n++)if (e = r[n], "text/uri-list" === e)return!0;
        return!1;
    }, D = function(t) {
        var e, n, s, r;
        if (!t.types)return!1;
        for (r = t.types, n = 0, s = r.length; s > n; n++)if (e = r[n], "text/plain" === e)return!0;
        return!1;
    }, a = function(t, e) {
        var n, s, r, a, i, o;
        for (n = $(e), o = [], a = 0, i = t.length; i > a; a++)s = t[a], x(s, n) ? o.push(void 0) : (C(e), r = S(n), r.acceptableSize(s) ? o.push(n.addClass("is-bad-file")) : o.push(n.addClass("is-too-big")));
        return o;
    }, i = function(t, e) {
        var n, s, r, a, i, o, c;
        if (n = $(e), t && (r = S(n), r.available())) {
            for (o = t.split("\r\n"), c = [], a = 0, i = o.length; i > a; a++)s = o[a], r.acceptsExtension(s) ? (r.start({ name: "" }), c.push(r.complete({ asset: { name: "", href: s } }))) : (C(e), c.push(n.addClass("is-bad-file")));
            return c;
        }
    }, o = function(t, e) {
        var n;
        return n = $(e).find("textarea"), insertTextAtCursor(n[0], t);
    }, d = function(t) { return _(t) ? "copy" : T(t) ? "link" : D(t) ? "copy" : "none"; }, h = function(t) {
        switch (t) {
        case"image/gif":
            return"image.gif";
        case"image/png":
            return"image.png";
        case"image/jpeg":
            return"image.jpg";
        }
    }, p = function(t) { return t.preventDefault(); }, m = function(t) { return t.dataTransfer.dropEffect = "none", t.preventDefault(); }, g = function(t) {
        var e;
        return e = d(t.dataTransfer), t.dataTransfer.dropEffect = e, $(this).addClass("dragover"), t.stopPropagation(), t.preventDefault();
    }, v = function(t) { return t.dataTransfer.dropEffect = "none", $(this).removeClass("dragover"), t.stopPropagation(), t.preventDefault(); }, y = function(t) {
        var e;
        return $(this).removeClass("dragover"), e = t.dataTransfer, e.types ? _(e) ? a(e.files, this) : T(e) ? i(e.getData("text/uri-list"), this) : D(e) && o(e.getData("text/plain"), this) : (C(this), $(this).addClass("is-bad-browser")), t.stopPropagation(), t.preventDefault();
    }, b = function(t) {
        var e, n, s, r, i;
        if ((s = null != (r = t.clipboardData) ? null != (i = r.items) ? i[0] : void 0 : void 0) && (n = h(s.type)))return e = s.getAsFile(), e.name = n, a([e], this), t.preventDefault();
    }, f = function(t) { return $(t.target).hasClass("js-manual-file-chooser") ? t.target.files ? a(t.target.files, this) : (C(this), $(this).addClass("is-bad-browser")) : void 0; }, c = 0, $.observe(".js-uploadable-container", { add: function() { return 0 === c++ && (document.addEventListener("drop", p), document.addEventListener("dragover", m)), this.addEventListener("dragenter", g), this.addEventListener("dragover", g), this.addEventListener("dragleave", v), this.addEventListener("drop", y), this.addEventListener("paste", b), this.addEventListener("change", f); }, remove: function() { return 0 === --c && (document.removeEventListener("drop", p), document.removeEventListener("dragover", m)), this.removeEventListener("dragenter", g), this.removeEventListener("dragover", g), this.removeEventListener("dragleave", v), this.removeEventListener("drop", y), this.removeEventListener("paste", b), this.removeEventListener("change", f); } }), ("undefined" == typeof FormData || null === FormData) && $(document.documentElement).addClass("no-dnd-uploads");
}.call(this), function() {
    var t;
    t = function(e) {
        var n, s, r, a, i;
        if (n = $(e), n.is("form")) {
            for (i = e.elements, r = 0, a = i.length; a > r; r++)if (s = i[r], !t(s))return!1;
            return!0;
        }
        return n.is("input[required], textarea[required]") && "" === $.trim(n.val()) ? !1 : !0;
    }, $(document).onFocusedInput("input[required], textarea[required]", function() {
        var e;
        return e = t(this), function() {
            var n;
            n = t(this), n !== e && $(this).trigger("validation:field:change", [n]), e = n;
        };
    }), $(document).on("validation:field:change", "form", function() {
        var e;
        return e = t(this), $(this).trigger("validation:change", [e]);
    }), $(document).on("validation:change", "form", function(t, e) { return $(this).find("button[data-disable-invalid]").prop("disabled", !e); }), $(function() {
        var e, n, s, r;
        for (r = $("input[required], textarea[required]"), n = 0, s = r.length; s > n; n++)e = r[n], $(e).trigger("validation:field:change", [t(e)]);
    });
}.call(this), function() {
    $(document).on("ajaxSuccess", function(t, e) {
        var n;
        (n = e.getResponseHeader("X-XHR-Location")) && (document.location.href = n, t.stopImmediatePropagation());
    });
}.call(this), ("undefined" == typeof console || "undefined" == typeof console.log) && (window.console = { log: function() {} }), window.debug = function() {}, $.fn.spin = function() { return debug("$.fn.spin is DEPRECATED"), this.after('<img src="' + GitHub.Ajax.spinner + '" id="spinner" width="16" />'); }, $.fn.stopSpin = function() { return debug("$.fn.stopSpin is DEPRECATED"), $("#spinner").remove(), this; }, GitHub.Ajax = { spinner: GitHub.assetHostUrl + "images/spinners/octocat-spinner-32.gif", error: GitHub.assetHostUrl + "images/modules/ajax/error.png" }, $(function() {
    var t = new Image;
    t.src = GitHub.Ajax.spinner, $(".flash .close").click(function() { $(this).closest(".flash").fadeOut(300, function() { $(this).remove(), 0 == $(".flash-messages .close").length && $(".flash-messages").remove(); }); }), $(".js-form-signup-home input").placeholder();
}), function() { $(document).on("hotkey:activate", ".js-employees-show-identicon", function() { return $(this).toggleClass("show-identicon"); }); }.call(this), function() {
    var t, e, n, s, r, a, i;
    null == (i = window._gaq) && (window._gaq = []), _gaq.push(["_setAccount", "UA-3769691-2"]), _gaq.push(["_setDomainName", "none"]), $(document.body).hasClass("logged_in") ? _gaq.push(["_setCustomVar", 1, "Session Type", "Logged In", 2]) : _gaq.push(["_setCustomVar", 1, "Session Type", "Logged Out", 2]), _gaq.push(["_trackPageview"]), _gaq.push(["_trackPageLoadTime"]), "404 - GitHub" === document.title && (r = document.location.pathname + document.location.search, e = document.referrer, _gaq.push(["_trackPageview", "/404.html?page=" + r + "&from=" + e])), n = document.createElement("script"), n.type = "text/javascript", n.async = !0, s = "https:" === document.location.protocol ? "https://ssl" : "http://www", n.src = "" + s + ".google-analytics.com/ga.js", document.getElementsByTagName("head")[0].appendChild(n), $(function() {
        var t, e, n;
        if (t = $("meta[name=octolytics-script-host]")[0])return null == (n = window._octo) && (window._octo = []), _octo.push(["enablePerformance"]), _octo.push(["recordPageView"]), e = document.createElement("script"), e.type = "text/javascript", e.async = !0, e.src = "//" + t.content + "/assets/api.js", document.getElementsByTagName("head")[0].appendChild(e);
    }), t = function(t, e, n, s) { return _gaq.push(["_trackEvent", t, e, n, s]); }, a = function() {
        var e, n, s, r;
        return n = $("meta[name=analytics-event-category]"), n.length ? (e = $("meta[name=analytics-event-action]"), s = $("meta[name=analytics-event-label]"), r = $("meta[name=analytics-event-value]"), t(n.attr("content"), e.attr("content"), s.attr("content"), r.attr("content")), n.remove(), e.remove(), s.remove(), r.remove()) : void 0;
    }, $(function() { return a(); }), $(document).on("pjax:complete", function() {
        var t;
        return t = document.location.pathname, "undefined" != typeof _octo && null !== _octo && _octo.push(["recordPageView"]), "undefined" != typeof _gaq && null !== _gaq && _gaq.push(["_trackPageview", t]), setTimeout(function() { return a(); }, 20);
    }), $(function() {
        var e;
        return e = !1, $(".js-form-signup-home").on("keyup", "input[type=text]", function() { return e ? void 0 : (t("Signup", "Attempt", "Homepage Form"), e = !0); }), $(".js-form-signup-detail").on("keyup", "input[type=text]", function() { return e ? void 0 : (t("Signup", "Attempt", "Detail Form"), e = !0); });
    });
}.call(this), function() {
    var t;
    t = function() {

        function t() {}

        return t.displayCreditCardFields = function(t) {
            var e, n;
            return e = $(".js-billing-section"), $("input[required]", e).each(function() { return $(this).addClass("js-required"); }), n = $(".js-required", e), t ? (e.removeClass("is-hidden"), n.attr("required", !0)) : (e.addClass("is-hidden"), n.attr("required", !1));
        }, t;
    }(), window.Billing = t;
}.call(this), $(function() {
    $.hotkeys({
        y: function() {
            var t = $("link[rel='permalink']").attr("href");
            $("title"), t && (t += location.hash, window.location.href = t);
        }
    });
}), function() {
    var t, e, n, s;
    e = function(e) {
        var n, r;
        return e.preventDefault(), n = t(e.target), r = n.find(".is-selected").index(), r + 1 === n.find(".js-carousel-slides .js-carousel-slide").length ? r = 0 : r++, s(n, r);
    }, n = function(e) {
        var n, r;
        return e.preventDefault(), n = t(e.target), r = n.find(".is-selected").index(), 0 === r ? r = $(n).find(".js-carousel-slides .js-carousel-slide").length - 1 : r--, s(n, r);
    }, t = function(t) { return $(t).closest(".js-carousel"); }, s = function(t, e) {
        var n, s, r;
        return t ? (n = $(t).find(".is-selected"), r = n.outerWidth(), n.removeClass("is-selected").fire("carousel:unselected"), $(t).find(".js-carousel-slides").css("marginLeft", -1 * r * e), s = $(t).find(".js-carousel-slides li"), s.eq(e).addClass("is-selected").fire("carousel:selected")) : null;
    }, $(document).on("click", ".js-carousel .js-previous-slide", n), $(document).on("click", ".js-carousel .js-next-slide", e);
}.call(this), function() {
    $(document).on("focusin", "#js-command-bar-field", function() {
        var t;
        return t = $(this), t.data("command-bar-installed") ? t.closest(".command-bar").addClass("command-bar-focus") : (t.commandBar().data("command-bar-installed", !0), setTimeout(function() { return t.focus(); }, 20));
    }), $(document).on("hotkey:activate", "#js-command-bar-field", function(t) {
        switch (t.originalEvent.which) {
        case 191:
            return $(".js-this-repository-navigation-item").fire("navigation:open");
        case 83:
            return $(".js-all-repositories-navigation-item").fire("navigation:open");
        }
    }), $(document).on("focusout", "#js-command-bar-field", function() { return $(this).closest(".command-bar").removeClass("command-bar-focus"); }), $(document).on("mousedown", ".commandbar .display", function() { return!1; }), $(document).on("mousedown", ".command-bar-focus #advanced_search", function() { return!1; }), $(document).on("click", ".js-command-bar .help", function() {
        var t;
        return t = $("#js-command-bar-field").focus(), setTimeout(function() { return t.val("help"), t.trigger("execute.commandbar"); }, 250), !1;
    });
}.call(this), function() {
    var t, e, n, s = [].slice;
    e = function(t) { return t.replace(/^\s+|\s+$/g, ""); }, n = function(t) { return t.replace(/^\s+/g, ""); }, t = function() {

        function t(t) { this.defaultContext = t, this.callbacks = {}; }

        return t.prototype.bind = function(t, e) {
            var n, s, r, a, i;
            for (i = t.split(" "), r = 0, a = i.length; a > r; r++)n = i[r], (s = this.callbacks)[n] || (s[n] = []), this.callbacks[n].push(e);
            return this;
        }, t.getPageInfo = function() {
            var t, e;
            return e = $("#js-command-bar-field"), t = {}, e.length ? (e.data("username") && (t.current_user = e.data("username")), t.search_choice = "global", $(".js-search-this-repository:checked").length && (t.search_choice = "this_repo"), e.data("repo") && (t.repo = { name_with_owner: e.data("repo"), branch: e.data("branch"), tree_sha: e.data("sha"), issues_page: !1 }, $(".js-issues-results").length && (t.repo.issues_page = !0)), t) : {};
        }, t.prototype.trigger = function() {
            var t, e, n, r, a, i;
            if (r = arguments[0], t = 2 <= arguments.length ? s.call(arguments, 1) : [], n = this.callbacks[r], !n)return!0;
            for (a = 0, i = n.length; i > a; a++)if (e = n[a], e.apply(this.context, t) === !1)return!1;
            return!0;
        }, t.prototype.unbind = function(t, e) {
            var n, s, r, a, i;
            if (t)
                if (e) {
                    for (n = this.callbacks[t], r = a = 0, i = n.length; i > a; r = ++a)
                        if (s = n[r], s === e) {
                            n.splice(r, 1);
                            break;
                        }
                } else delete this.callbacks[t];
            else this.callbacks = {};
            return this;
        }, t.prototype.execute = function(t) { return new this.defaultContext(this, t).fullMatch().execute(); }, t.prototype.suggestions = function(t, e) { return new this.defaultContext(this, t).partialMatch().suggestions().slice(0, e); }, t.prototype.complete = function(e, n) {
            var s;
            return s = new this.defaultContext(this, e).partialMatch(), t.Store.set("" + s.constructor.name + ":" + e, n), s.complete(n);
        }, t;
    }(), t.Store = function() {

        function t() {}

        var e;
        return e = function() {
            try {
                return"localStorage" in window && null !== window.localStorage;
            } catch (t) {
                return!1;
            }
        }, t.set = function(t, n) {
            if (e())
                try {
                    return localStorage.setItem(t, JSON.stringify(n)), n;
                } catch (s) {
                    return!1;
                }
        }, t.get = function(t) { return e() ? this.parse(localStorage[t]) : null; }, t.parse = function(t) {
            try {
                return JSON.parse(t);
            } catch (e) {
                return t;
            }
        }, t.expire = function(t) {
            var n;
            if (e())return n = localStorage[t], localStorage.removeItem(t), n;
        }, t;
    }(), t.RemoteProxy = function() {

        function t() {}

        return t.caches = {}, t.requests = {}, t.get = function(t, e, n) {
            var s, r, a = this;
            return this.commandBar = n, null == (r = e.cache_for) && (e.cache_for = 36e5), s = (new Date).getTime() - e.cache_for, this.shouldLoad = function(t) { return this.isCached(t) ? this.caches[t].requested < s ? !0 : !1 : !0; }, this.shouldLoad(t) ? (this.isLoading(t) || (this.requests[t] = $.ajax({
                url: t,
                dataType: e.dataType || "json",
                success: function(n) { return a.caches[t] = { response: e.process(n), requested: (new Date).getTime() }; },
                error: function() { return a.caches[t] = { response: [], requested: (new Date).getTime() }; },
                complete: function() {
                    var e;
                    return delete a.requests[t], null != (e = a.commandBar) ? e.trigger("suggest.commandbar") : void 0;
                }
            })), this.isCached(t) ? this.caches[t].response : [{ command: "", description: e.loadingMessage, type: "loading" }]) : this.caches[t].response;
        }, t.isLoading = function(t) { return null != this.requests[t]; }, t.isCached = function(t) { return null != this.caches[t]; }, t;
    }(), t.Timer = function() {

        function t() { this.time = (new Date).getTime(); }

        return t.prototype.diff = function() {
            var t, e;
            return e = (new Date).getTime(), t = e - this.time, this.time = e, t;
        }, t;
    }(), t.History = function() {

        function n() {}

        var s, r, a;
        return a = [], r = function() { return t.Store.set("commandbar.history", a.slice(0, 50).join("\n")); }, s = function(t) {
            var n, s, r, i;
            for (s = [], r = 0, i = a.length; i > r; r++)n = a[r], e(n) !== e(t) && s.push(n);
            return a = s;
        }, n.load = function() {
            var e;
            return e = t.Store.get("commandbar.history"), a = null != e ? e.split("\n") : [];
        }, n.add = function(t) { return s(t), a.unshift(t), r(); }, n.get = function(t) { return a[t]; }, n.exists = function(t) { return null != a[t]; }, n;
    }.call(this), t.History.load(), t.Context = function() {

        function s(t, e, n) {
            var r = this;
            this.commandBar = t, this.text = e, this.parent = n, this.lazyLoad = function() { return s.prototype.lazyLoad.apply(r, arguments); }, this.suggestionCollection = function() { return s.prototype.suggestionCollection.apply(r, arguments); }, this.matches = this.text.match(this.constructor.regex), this.remainder = this.matches ? this.text.replace(this.matches[0], "") : this.text;
        }

        return s.contexts = [], s.register = function(t) { return this.contexts.push(t); }, s.regex = /(?:)/i, s.matches = function(t) { return!!t.match(this.regex); }, s.help = function() { return{}; }, s.prototype.override = function() { return!1; }, s.prototype.search = function() { return!1; }, s.prototype.suffix = function() { return" "; }, s.prototype.suggestionOptions = function() { return[]; }, s.prototype.filter = function(n) {
            var s, r, a, i, o;
            for (a = e(this.remainder), s = [], i = 0, o = n.length; o > i; i++)r = n[i], r = t.SuggestionCollection.prepare(r), r.score = r.defaultScore || t.SuggestionCollection.score(r, a, this), 0 !== r.score && s.push(r);
            return s.sort(function(t, e) { return e.score - t.score; });
        }, s.prototype.suggestionCollection = function() {
            var e, n, s, r, a, i, o, c, l, u, d, h, f, m, p, g, v;
            for (l = [], r = [], o = !1, c = 0, a = t.getPageInfo(), v = this.constructor.contexts, d = 0, m = v.length; m > d; d++)n = v[d], (!n.logged_in || a.current_user) && (e = new n(this.commandBar, this.remainder, this), u = e.suggestionOptions(), u = this.filter(u), 0 !== u.length && (e.override() && (o = !0), e.search() && c++, r.push({ suggestions: u, override: e.override(), search: e.search() })));
            if (o) {
                for (i = [], h = 0, p = r.length; p > h; h++)s = r[h], (s.override || s.search) && i.push(s);
                r = i;
            }
            for (f = 0, g = r.length; g > f; f++)s = r[f], l = l.concat(s.suggestions.slice(0, Math.round(6 / (r.length - c))));
            return l;
        }, s.prototype.suggestions = function() {
            var t;
            return t = this.suggestionCollection(), t.sort(function(t, e) { return e.score - t.score; }), t;
        }, s.prototype.fullMatch = function(n) {
            var s, r, a, i, o, c, l, u;
            if (null == n && (n = this.remainder), r = this, a = t.getPageInfo(), "" === e(n))o = this;
            else for (u = this.constructor.contexts, c = 0, l = u.length; l > c; c++)if (s = u[c], (!s.logged_in || a.current_user) && !s.skipMatch && s.matches(n) && (i = new s(this.commandBar, n, this).fullMatch()))return i;
            return o || r;
        }, s.prototype.partialMatch = function() {
            var e, s, r, a, i, o, c, l;
            if (s = this, r = t.getPageInfo(), this.remainder.length) {
                for (l = this.constructor.contexts, o = 0, c = l.length; c > o; o++)if (e = l[o], (!e.logged_in || r.current_user) && e.matches(this.remainder) && (a = new e(this.commandBar, n(this.remainder), this).partialMatch()))return a;
            } else i = this.parent;
            return i || s;
        }, s.prototype.description = function() { return"Execute `" + this.command() + "`"; }, s.prototype.command = function() { return this.parent ? e("" + this.parent.command() + " " + this.matches[0]) : ""; }, s.prototype.complete = function(t) {
            var e;
            return e = this.fullMatch(t), (null != e ? e.command() : void 0) + e.suffix();
        }, s.prototype.lazyLoad = function(e, n) { return t.RemoteProxy.get(e, n, this.commandBar); }, s.prototype.loading = function(t) { return this.commandBar.trigger("loading.commandbar", t); }, s.prototype.success = function(t) { return this.commandBar.trigger("success.commandbar", t); }, s.prototype.error = function(t) { return this.commandBar.trigger("error.commandbar", t); }, s.prototype.message = function(t) { return this.commandBar.trigger("message.commandbar", t); }, s.prototype.goToUrl = function(e) {
            var n;
            return t.ctrlKey || t.metaKey ? (n = window.open(e, (new Date).getTime()), n !== window ? this.success("Opened in a new window") : void 0) : window.location = e;
        }, s.prototype.post = function(t) { return t = $.extend(t, { type: "POST" }), $.ajax(t); }, s.prototype.execute = function() {}, s;
    }(), t.SuggestionCollection = {
        constructor: function(t) { this.suggestions = t; },
        prepare: function(t) { return{ prefix: t.prefix || "", url: t.url || null, search: t.search || null, command: t.command || "", display: t.display || t.command, description: t.description || "", type: t.type || "choice", multiplier: t.multiplier || 1, defaultScore: t.defaultScore || null, skip_fuzzy: t.skip_fuzzy || !1, filter: t.filter === !1 ? !1 : !0 }; },
        score: function(e, n, s) {
            var r, a, i;
            return a = 0, e.filter === !1 ? a = 1 : "loading" !== e.type ? (r = t.Store.get("" + s.constructor.name + ":" + n), r === e.command ? a = 1.99 : (i = e.search ? e.search : e.command, a = n ? $.fuzzyScore(i, n) : 1, a *= e.multiplier)) : a = 20, a;
        }
    }, window.CommandBar = t;
}.call(this), function() { CommandBar.Context.prototype.execute = function() { return"" === $.trim(this.text) ? !1 : (this.loading("Searching for '" + this.text + "'"), this.commandBar.trigger("submit.commandbar")); }; }.call(this), function() {
    var t,
        e = {}.hasOwnProperty,
        n = function(t, n) {

            function s() { this.constructor = t; }

            for (var r in n)e.call(n, r) && (t[r] = n[r]);
            return s.prototype = n.prototype, t.prototype = new s, t.__super__ = n.prototype, t;
        };
    t = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return n(e, t), e.contexts = [], e.regex = /^(help|\?)$/i, e.prototype.suggestionOptions = function() { return this.text.match(/^[h\?]/i) ? [{ command: "help", description: "Show available commands", search: "help ?" }] : []; }, e.prototype.description = function() { return"Show available commands"; }, e.prototype.helpMessagesFor = function(t) {
            var e, n, s, r, a, i, o;
            for (a = this, r = [], s = CommandBar.getPageInfo(), i = 0, o = t.length; o > i; i++)e = t[i], (!e.logged_in || s.current_user) && (n = e.help(), n.constructor === Array ? r = r.concat(n) : (e.contexts.length && (n.children = a.helpMessagesFor(e.contexts)), r.push(n)));
            return r;
        }, e.prototype.formatCommands = function(t) {
            var e;
            return e = "<table>", e += this.messageRows(t), e += "</table>";
        }, e.prototype.messageRows = function(t, e) {
            var n, s, r, a;
            for (s = "", e || (e = ""), t = t.sort(function(t, e) { return t.command > e.command ? 1 : -1; }), r = 0, a = t.length; a > r; r++)n = t[r], (n.child !== !0 || "" !== e) && (s += this.messageRow(n, e)), n.children && (s += this.messageRows(n.children, "" + e + n.command + " "));
            return s;
        }, e.prototype.messageRow = function(t, e) {
            var n;
            return n = "", t.description ? (n += "<tr><td class=command>", n += "" + e + "<strong>" + t.command + "</strong>", n += "</td><td><span>" + t.description + "</span></td></tr>") : "";
        }, e.prototype.execute = function() {
            var t;
            return t = [], t = t.concat(this.helpMessagesFor(this.commandBar.defaultContext.contexts)), this.message(this.formatCommands(t));
        }, e.prototype.suffix = function() { return""; }, e;
    }(CommandBar.Context), CommandBar.Context.register(t);
}.call(this), function() {
    var t,
        e,
        n,
        s,
        r,
        a,
        i,
        o,
        c = {}.hasOwnProperty,
        l = function(t, e) {

            function n() { this.constructor = t; }

            for (var s in e)c.call(e, s) && (t[s] = e[s]);
            return n.prototype = e.prototype, t.prototype = new n, t.__super__ = e.prototype, t;
        };
    s = function(t) {

        function e() {
            var t = this;
            return this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.regex = /^([\w\._-]+\/[\w\._-]+)/i, e.help = function() { return{ command: "user/repo", description: "View a repository" }; }, e.prototype.repo = function() { return this.matches ? this.matches[1] : void 0; }, e.prototype.suggestionOptions = function() {
            var t, e, n, s;
            return this.text.match(/^[\w\._-]/i) ? (e = CommandBar.getPageInfo(), t = [], e.current_user && "global" === e.search_choice && (t = this.lazyLoad("/command_bar/repos", { loadingMessage: "Loading repositories", process: function(t) { return t.results; } })), (s = this.text.match(/([\w\._-]+)\//i)) && (n = s[1], t = this.lazyLoad("/command_bar/repos_for/" + n, { loadingMessage: "Loading repositories for " + n, process: function(t) { return t.results; } })), t) : [];
        }, e.prototype.description = function() { return"Go to " + this.repo(); }, e.prototype.helpText = function() { return{ command: "user/repo", description: "View user/repo, manage issues, etc." }; }, e.prototype.execute = function() { return this.loading("Loading " + this.repo()), this.goToUrl("/" + this.repo() + "?source=c"); }, e;
    }(CommandBar.Context), e = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, this.execute = function() { return e.prototype.execute.apply(t, arguments); }, this.branch = function() { return e.prototype.branch.apply(t, arguments); }, this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.regex = /@(.+)?/i, e.help = function() { return{ child: !0, command: "@branchname", description: "View a branch in a repository" }; }, e.prototype.repo = function() { return this.parent.repo ? this.parent.repo() : void 0; }, e.prototype.suggestionOptions = function() { return this.text.match(/^\s@/i) && this.repo() ? this.lazyLoad("/command_bar/" + this.repo() + "/branches", { loadingMessage: "Loading " + this.repo() + "'s  branches", process: function(t) { return t.results; } }) : [{ command: "@branchname", description: "View a branch in a repository" }]; }, e.prototype.branch = function() { return this.matches ? this.matches[1] : void 0; }, e.prototype.description = function() { return"Show branch `" + this.branch() + "` for " + this.repo(); }, e.prototype.execute = function() { return this.repo() && this.branch() ? (this.loading("Loading " + this.repo() + ":" + this.branch() + " branch"), this.goToUrl("/" + this.repo() + "/tree/" + this.branch() + "?source=cb")) : !0; }, e.prototype.suffix = function() { return""; }, e;
    }(CommandBar.Context), n = function(t) {

        function e() {
            var t = this;
            return this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.skipMatch = !0, e.regex = /(.+)?/i, e.prototype.repo = function() {
            var t;
            return t = CommandBar.getPageInfo(), t.repo ? t.repo.name_with_owner : void 0;
        }, e.prototype.suggestionOptions = function() {
            var t;
            return t = CommandBar.getPageInfo(), "global" === t.search_choice ? [] : this.lazyLoad("/command_bar/" + this.repo() + "/branches", { loadingMessage: "Loading " + this.repo() + "'s  branches", process: function(t) { return t.results; } });
        }, e;
    }(CommandBar.Context), r = function(t) {

        function e() {
            var t = this;
            return this.execute = function() { return e.prototype.execute.apply(t, arguments); }, this.issue = function() { return e.prototype.issue.apply(t, arguments); }, this.query = function() { return e.prototype.query.apply(t, arguments); }, this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.regex = /\#(.+)/i, e.timeout = null, e.previous_term = null, e.last_suggested = null, e.search_delay = 400, e.help = function() { return{ child: !0, command: "#123", description: "View a specific issue" }; }, e.prototype.searchDelayPassed = function() { return(new Date).getTime() - this.constructor.last_suggested >= this.constructor.search_delay; }, e.prototype.repo = function() { return this.parent.repo ? this.parent.repo() : void 0; }, e.prototype.query = function() { return this.matches ? this.matches[1] : void 0; }, e.prototype.suggestionOptions = function() { return this.text.match(/^\s#/i) && this.repo() ? this.delayedSearch() : [{ command: "#123", description: "View a specific issue" }]; }, e.prototype.delayedSearch = function() {
            var t, e, n;
            return n = this.text, e = this.constructor.previous_term, clearTimeout(this.constructor.timeout), this.constructor.previous_term = n, n === e && this.searchDelayPassed() ? this.lazyLoad("/command_bar/" + this.repo() + "/issues_for?q=" + encodeURIComponent(n), { loadingMessage: "Loading " + this.repo() + "'s issues", process: function(t) { return t.results; } }) : (this.constructor.last_suggested = (new Date).getTime(), t = this.commandBar, this.constructor.timeout = setTimeout(function() { return t.trigger("suggest.commandbar"); }, this.constructor.search_delay), []);
        }, e.prototype.suffix = function() { return""; }, e.prototype.issue = function() { return this.matches ? this.matches[1] : ""; }, e.prototype.description = function() { return"Show issue #" + this.issue() + " for " + this.repo(); }, e.prototype.execute = function() { return this.loading("Loading issue #" + this.issue() + " for " + this.repo()), this.goToUrl("/" + this.repo() + "/issues/" + this.issue() + "?source=c"); }, e;
    }(CommandBar.Context), a = function(t) {

        function e() {
            var t = this;
            return this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.skipMatch = !0, e.regex = /(?:)/i, e.timeout = null, e.previous_term = null, e.last_suggested = null, e.search_delay = 400, e.prototype.override = function() {
            var t;
            return t = CommandBar.getPageInfo(), t.repo && !this.text.match(/^([\w\._-]+\/[\w\._-]+)/i) ? t.repo.issues_page : !1;
        }, e.prototype.repo = function() {
            var t;
            return t = CommandBar.getPageInfo(), t.repo ? t.repo.name_with_owner : void 0;
        }, e.prototype.searchDelayPassed = function() { return(new Date).getTime() - this.constructor.last_suggested >= this.constructor.search_delay; }, e.prototype.suggestionOptions = function() {
            var t, e;
            return e = this.text, t = CommandBar.getPageInfo(), this.repo() && "this_repo" === t.search_choice ? this.delayedSearch() : t.current_user ? this.lazyLoad("/command_bar/issues", { loadingMessage: "Loading issues", process: function(t) { return t.results; } }) : [];
        }, e.prototype.delayedSearch = function() {
            var t, e, n;
            return n = this.text, e = this.constructor.previous_term, clearTimeout(this.constructor.timeout), this.constructor.previous_term = n, n === e && this.searchDelayPassed() ? this.lazyLoad("/command_bar/" + this.repo() + "/issues_for?q=" + encodeURIComponent(n), { loadingMessage: "Loading " + this.repo() + "'s issues", process: function(t) { return t.results; } }) : (this.constructor.last_suggested = (new Date).getTime(), t = this.commandBar, this.constructor.timeout = setTimeout(function() { return t.trigger("suggest.commandbar"); }, this.constructor.search_delay), []);
        }, e;
    }(CommandBar.Context), t = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, this.filename = function() { return e.prototype.filename.apply(t, arguments); }, this.fullpath = function() { return e.prototype.fullpath.apply(t, arguments); }, this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.regex = /^\s*\/([\w\_\-\.\s]+\/?)+/i, e.timeout = null, e.previous_term = null, e.last_suggested = null, e.search_delay = 400, e.help = function() { return{ child: !0, command: "/path/to/file.s", description: "View a blob page" }; }, e.prototype.repo = function() {
            var t;
            return this.parent.repo ? this.parent.repo() : (t = CommandBar.getPageInfo(), t.repo ? t.repo.name_with_owner : void 0);
        }, e.prototype.searchDelayPassed = function() { return(new Date).getTime() - this.constructor.last_suggested >= this.constructor.search_delay; }, e.prototype.fullpath = function() { return this.matches ? $.trim(this.matches[0]) : void 0; }, e.prototype.filename = function() { return this.matches ? $.trim(this.matches[1]) : void 0; }, e.prototype.suggestionOptions = function() {
            var t, e, n, s, r;
            return r = this.text, e = CommandBar.getPageInfo(), r.match(/^[\/\w\._-]/i) ? this.repo() ? (s = e.repo.tree_sha, "" === s || void 0 === s || "global" === e.search_choice ? [] : (n = this.constructor.previous_term, clearTimeout(this.constructor.timeout), this.constructor.previous_term = r, r === n && this.searchDelayPassed() ? this.lazyLoad("/command_bar/" + this.repo() + "/paths/" + e.repo.branch + "?q=" + r + "&sha=" + s, { loadingMessage: "Loading " + this.repo() + "'s  files", process: function(t) { return t.results; } }) : (this.constructor.last_suggested = (new Date).getTime(), t = this.commandBar, this.constructor.timeout = setTimeout(function() { return t.trigger("suggest.commandbar"); }, this.constructor.search_delay), []))) : [] : [];
        }, e.prototype.suffix = function() { return""; }, e.prototype.execute = function() {
            var t;
            return t = CommandBar.getPageInfo(), t.repo ? (this.loading("Loading " + this.filename()), this.goToUrl("/" + this.repo() + "/blob/" + t.repo.branch + this.fullpath() + "?source=c")) : null;
        }, e;
    }(CommandBar.Context), o = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, this.execute = function() { return e.prototype.execute.apply(t, arguments); }, this.section = function() { return e.prototype.section.apply(t, arguments); }, this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.regex = /^\s*(wiki|graphs|network|pulse|issues|pulls)\b$/i, e.help = function() { return new this(this.commandBar, "").suggestionOptions(); }, e.prototype.repo = function() { return this.parent.repo(); }, e.prototype.section = function() { return this.matches ? this.matches[1] : void 0; }, e.prototype.suggestionOptions = function() { return[{ command: "wiki", description: "Pull up the wiki" }, { command: "graphs", description: "All the Graphs!" }, { command: "network", description: "See the network" }, { command: "pulse", description: "See recent activity" }, { command: "issues", description: "View open issues" }, { command: "pulls", description: "Show open pull requests" }]; }, e.prototype.description = function() { return"View the " + this.section() + " for " + this.repo(); }, e.prototype.execute = function() { return this.loading("Loading " + this.section() + " for " + this.repo()), this.goToUrl("/" + this.repo() + "/" + this.section() + "?source=c"); }, e.prototype.suffix = function() { return""; }, e;
    }(CommandBar.Context), i = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, this.execute = function() { return e.prototype.execute.apply(t, arguments); }, this.type = function() { return e.prototype.type.apply(t, arguments); }, this.repo = function() { return e.prototype.repo.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return l(e, t), e.contexts = [], e.regex = /^\s*new\s(pull|issues)\b$/i, e.logged_in = !0, e.help = function() { return new this(this.commandBar, "").suggestionOptions(); }, e.prototype.repo = function() { return this.parent.repo(); }, e.prototype.type = function() { return this.matches ? this.matches[1] : void 0; }, e.prototype.suggestionOptions = function() { return[{ command: "new issues", description: "Create new issue" }, { command: "new pull", description: "Create new pull request" }]; }, e.prototype.description = function() { return"Create a new issue for " + this.repo(); }, e.prototype.execute = function() { return this.loading("Loading new " + this.type() + " form for " + this.repo()), this.goToUrl("/" + this.repo() + "/" + this.type() + "/new?source=c"); }, e.prototype.suffix = function() { return""; }, e;
    }(CommandBar.Context), CommandBar.Context.register(s), CommandBar.Context.register(n), CommandBar.Context.register(t), CommandBar.Context.register(a), s.register(r), s.register(e), s.register(t), s.register(i), s.register(o);
}.call(this), function() {
    var t,
        e,
        n = {}.hasOwnProperty,
        s = function(t, e) {

            function s() { this.constructor = t; }

            for (var r in e)n.call(e, r) && (t[r] = e[r]);
            return s.prototype = e.prototype, t.prototype = new s, t.__super__ = e.prototype, t;
        };
    e = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return s(e, t), e.contexts = [], e.regex = /^search\sgithub\sfor\s'(.+)'$/i, e.prototype.search = function() { return!0; }, e.prototype.query = function() { return this.matches ? $.trim(this.matches[1]) : void 0; }, e.prototype.suggestionOptions = function() { return[{ command: "Search GitHub for '" + this.text + "'", description: "", multiplier: 0, defaultScore: -2, url: "/search?q=" + encodeURIComponent(this.text) + "&source=cc", skip_fuzzy: !0 }]; }, e.prototype.description = function() { return"Search GitHub for " + this.query(); }, e.prototype.execute = function() { return this.loading("Searching for '" + this.query() + "'"), this.goToUrl("/search?q=" + encodeURIComponent(this.query()) + "&source=c"); }, e.prototype.suffix = function() { return""; }, e;
    }(CommandBar.Context), t = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return s(e, t), e.contexts = [], e.regex = /^search\s([\w\._-]+\/[\w\._-]+)\sfor\s'(.+)'$/i, e.prototype.search = function() { return!0; }, e.prototype.query = function() { return this.matches ? $.trim(this.matches[2]) : void 0; }, e.prototype.repomatch = function() { return this.matches ? $.trim(this.matches[1]) : void 0; }, e.prototype.suggestionOptions = function() {
            var t;
            return t = CommandBar.getPageInfo(), t.repo ? [{ command: "Search " + t.repo.name_with_owner + " for '" + this.text + "'", description: "", multiplier: 0, defaultScore: -1, url: "/" + t.repo.name_with_owner + "/search?q=" + encodeURIComponent(this.text) + "&source=cc", skip_fuzzy: !0 }] : [];
        }, e.prototype.description = function() { return"Search GitHub for " + this.query(); }, e.prototype.execute = function() { return this.loading("Searching for '" + this.query() + "'"), this.goToUrl("/" + this.repomatch() + "/search?q=" + encodeURIComponent(this.query()) + "&source=c"); }, e.prototype.suffix = function() { return""; }, e;
    }(CommandBar.Context), CommandBar.Context.register(e), CommandBar.Context.register(t);
}.call(this), function() {
    var t,
        e = {}.hasOwnProperty,
        n = function(t, n) {

            function s() { this.constructor = t; }

            for (var r in n)e.call(n, r) && (t[r] = n[r]);
            return s.prototype = n.prototype, t.prototype = new s, t.__super__ = n.prototype, t;
        };
    t = function(t) {

        function e() {
            var t = this;
            return this.suffix = function() { return e.prototype.suffix.apply(t, arguments); }, this.user = function() { return e.prototype.user.apply(t, arguments); }, e.__super__.constructor.apply(this, arguments);
        }

        return n(e, t), e.contexts = [], e.regex = /^@([A-Za-z0-9-_]+)\/?/i, e.timeout = null, e.previous_term = null, e.last_suggested = null, e.search_delay = 400, e.help = function() { return{ command: "@user", description: "View a user&rsquo;s profile" }; }, e.matches = function(t) {
            var e;
            return e = t.match(this.regex), !!e && !e[0].match(/\/$/);
        }, e.prototype.searchDelayPassed = function() { return(new Date).getTime() - this.constructor.last_suggested >= this.constructor.search_delay; }, e.prototype.suggestionOptions = function() {
            var t, e, n, s;
            return s = this.text, s.match(/^[@\w\._-]/i) ? (e = CommandBar.getPageInfo(), this.text.match(/^@[\w\._-]/i) ? (n = this.constructor.previous_term, clearTimeout(this.constructor.timeout), this.constructor.previous_term = s, s === n && this.searchDelayPassed() ? this.lazyLoad("/command_bar/users?q=" + this.user(), { loadingMessage: "Loading users", process: function(t) { return t.results; } }) : (this.constructor.last_suggested = (new Date).getTime(), t = this.commandBar, this.constructor.timeout = setTimeout(function() { return t.trigger("suggest.commandbar"); }, this.constructor.search_delay), [])) : e.current_user && "global" === e.search_choice ? this.lazyLoad("/command_bar/users", { loadingMessage: "Loading users", process: function(t) { return t.results; } }) : []) : [];
        }, e.prototype.user = function() { return this.matches ? this.matches[1] : void 0; }, e.prototype.suffix = function() { return""; }, e.prototype.execute = function() { return this.loading("Loading " + this.user() + "'s profile"), this.goToUrl("/" + this.user() + "?source=c"); }, e;
    }(CommandBar.Context), CommandBar.Context.register(t);
}.call(this), function() {
    var t, e, n;
    t = jQuery, e = { ENTER: 13, TAB: 9, UP: 38, DOWN: 40, N: 78, P: 80, CTRL: 17, ESC: 27 }, n = {
        init: function(n) {
            var s;
            return s = { classname: "commandbar", debug: !1, context: CommandBar.Context, limit: 12 }, s = t.extend(s, n), this.each(function() {
                var n, r, a, i, o, c, l, u, d, h, f, m, p, g, v, $, y;
                return o = new CommandBar(s.context), a = t(this), s.limit || (s.limit = a.attr("data-results-limit")), a.attr("autocomplete", "off"), a.attr("spellcheck", "false"), a.wrap('<div class="' + s.classname + '" />'), r = a.closest("." + s.classname), i = t('<span class="message" />').prependTo(r), n = t('<div class="display hidden" />').appendTo(r), f = null, l = 0, a.bind("execute.commandbar", function() { return u(); }), o.bind("suggest.commandbar", function() { return a.trigger("suggest.commandbar"); }), o.bind("loading.commandbar", function(t) { return y(t, "loading"); }), o.bind("message.commandbar", function(t) { return g(t); }), o.bind("success.commandbar", function(t) { return y("" + String.fromCharCode(10004) + " " + t, "success", !0); }), o.bind("error.commandbar", function(t) { return y("" + String.fromCharCode(10006) + " " + t, "error", !0); }), o.bind("submit.commandbar", function() { return a.closest("form").submit(); }), y = function(t, e, n) { return i.text(t).show().addClass("visible"), i.removeClass("loading error success").addClass(e), n ? d() : void 0; }, d = function() { return setTimeout(function() { return i.removeClass("visible"); }, 5e3); }, h = function() { return i.hide().removeClass("visible loading error success"); }, v = function() {
                    var t, e, s;
                    return t = n.find(".selected"), s = function() { return t.position().top < 0; }, e = function() { return t.position().top + t.outerHeight() > n.height(); }, s() && n.scrollTop(n.scrollTop() + t.position().top), e() ? n.scrollTop(n.scrollTop() + t.position().top + t.outerHeight() - n.height()) : void 0;
                }, m = function() {
                    var t;
                    return n.find(".selected").removeClass("selected"), -1 === l ? (a.val(a.data("val")), n.removeClass("hidden"), l++) : l >= 0 ? (t = n.find(".choice:nth-child(" + (l + 1) + ")").addClass("selected"), t.length ? (v(), a.val(o.complete(a.data("val"), t.data("command"))), l++) : n.find(".choice:nth-child(" + l + ")").addClass("selected")) : CommandBar.History.exists(-l - 2) ? (a.val(CommandBar.History.get(-l - 2)), l++) : void 0;
                }, p = function() {
                    var t;
                    return n.find(".selected").removeClass("selected"), 1 === l ? (a.val(a.data("val")), l--) : l > 1 ? (t = n.find(".choice:nth-child(" + (l - 1) + ")"), t.addClass("selected"), v(), t.length && a.val(o.complete(a.data("val"), t.data("command"))), l--) : CommandBar.History.exists(-l) ? (n.addClass("hidden"), a.val(CommandBar.History.get(-l)), l--) : void 0;
                }, c = function(e) {
                    var s, r;
                    return e.length || (e = n.find(".choice:first")), e.length ? (null != f && clearTimeout(f), r = a.data("val"), s = t(e).data("command"), a.val(o.complete(r, s)), a.focus().keyup()) : void 0;
                }, g = function(t) { return n.html(t).show().removeClass("hidden"); }, u = function() { return n.html(""), CommandBar.History.add(a.val()), o.execute(a.val()), a.val(""), $(); }, i.click(function() { return h(), a.focus(), !1; }), a.focus(function() { return clearTimeout(f), r.addClass("focused"), t(this).keyup(); }), a.blur(function() { return f = setTimeout(function() { return r.removeClass("focused"), n.addClass("hidden"); }, 200); }), a.bind("suggest.commandbar", function() {
                    var e, r, a, i, c, u, d, h;
                    if (l = 0, u = t(this).val(), n.html(""), "" !== u)for (c = o.suggestions(u, s.limit), d = 0, h = c.length; h > d; d++)i = c[d], r = t("<span class=command />"), a = t("<span class=description />"), e = t("<a class=" + i.type + "></a>").attr("data-command", i.command), i.url && e.attr("href", i.url), i.prefix && t("<span class=prefix />").html(i.prefix).appendTo(e), i.display && r.text(i.display).appendTo(e), i.description && a.text(i.description).appendTo(e), e.appendTo(n), i.skip_fuzzy || t.fuzzyHighlight(r[0], u), i.skip_fuzzy || t.fuzzyHighlight(a[0], u);
                    return $();
                }), $ = function() { return n.is(":empty") ? n.hide().addClass("hidden") : n.show().removeClass("hidden"); }, a.bind("throttled:input", function() { return"" !== a.val() && h(), a.data("val", a.val()), a.trigger("suggest.commandbar"); }), a.keyup(function(t) {
                    switch (t.which) {
                    case e.N:
                    case e.P:
                        return t.ctrlKey ? !1 : a.trigger("suggest.commandbar");
                    case e.ENTER:
                    case e.TAB:
                    case e.CTRL:
                    case e.DOWN:
                    case e.UP:
                    case e:
                        return!1;
                    case e.ESC:
                        return"" === a.val() ? a.blur() : a.val("");
                    }
                }), a.keydown(function(t) {
                    switch (CommandBar.ctrlKey = t.ctrlKey, CommandBar.metaKey = t.metaKey, CommandBar.shiftKey = t.shiftKey, t.which) {
                    case e.DOWN:
                        return m();
                    case e.UP:
                        return p(), t.preventDefault(), !1;
                    case e.P:
                        if (t.ctrlKey)return p();
                        break;
                    case e.N:
                        if (t.ctrlKey)return m();
                        break;
                    case e.ENTER:
                        return u(), !1;
                    case e.TAB:
                        if ("" !== a.val())return c(n.find(".selected")), !1;
                    }
                }), n.on("click", ".choice", function() {
                    var e;
                    return e = t(this), e.attr("href") ? void 0 : (c(e), !1);
                });
            });
        }
    }, t.fn.commandBar = function(e) { return n[e] ? n[e].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof e && e ? t.error("Method " + e + " does not exists on jQuery.commandBar") : n.init.apply(this, arguments); };
}.call(this), function() {}.call(this), function() {
    var t, e;
    e = null, $.conduit = function(t) {
        var n;
        return n = $.Deferred(), (null != e ? e : e = $("link[rel=conduit-xhr]").prop("href")) ? $.ajax({ url: "" + e + t, success: function(t) { return n.resolve(t); }, error: function() { return n.reject(); } }) : n.reject(), n.promise();
    }, t = null, $.conduit.status = function() { return null != t ? t : t = $.conduit("status"); }, $.conduit.capable = function(t) {
        return $.conduit.status().then(function(e) {
            var n;
            return n = $.Deferred(), -1 !== e.capabilities.indexOf(t) ? n.resolve() : n.reject();
        });
    };
}.call(this), function() {
    var t;
    $.observe(".js-conduit-openfile-check", t = function(t) { return $.conduit.capable("url-parameter-filepath").done(function() { return $(t).attr("href", $(t).attr("data-url")); }).fail(function() { return $(t).addClass("disabled").attr("title", $(t).attr("data-failed-title")); }); });
}.call(this), function() {
    var t;
    $.observe(".js-conduit-rewrite-url", t = function(t) { return $.conduit.status().done(function() { return t.href = t.getAttribute("data-url"); }); });
}.call(this), function() {
    var t, e, n, s, r, a, i, o;
    n = null, s = null, i = null, o = null, e = function(t) {
        var e;
        return e = $("<img>", { "class": "dots", src: "/images/spinners/octocat-spinner-128.gif" }), $("#contribution-activity-listing").html(e), $.pjax({ url: t, container: "#contribution-activity", scrollTo: !1, replace: !0 });
    }, r = function(t) {
        var s, r;
        return n = t, s = null, i = null, o = null, r = "" + document.location.pathname + "?tab=contributions&period=" + n, a(), e(r);
    }, a = function(t, e) {
        var n, s;
        return s = $(".calendar-graph"), n = d3.select(".js-calendar-graph").selectAll("rect.day").classed("active", !1), t || e ? (s.addClass("days-selected"), n.filter(function(n) { return t && e ? n[0] >= t && n[0] <= e : n[0] === t; }).classed("active", !0)) : s.removeClass("days-selected");
    }, $(document).on("contributions:range", function(t, c, l) {
        var u, d, h, f, m, p, g, v, $, y;
        return null == l && (l = !1), g = "" + document.location.pathname + "?tab=contributions", c >= i && o >= c ? (r("weekly"), void 0) : ("object" == typeof l && (s = l, l = !0), s && l ? (m = moment(s).clone().subtract("days", 31).toDate(), f = moment(s).clone().add("days", 31).toDate(), v = c > s ? [s, c] : [c, s], h = v[0], p = v[1], m > h && (h = m), p > f && (p = f), $ = [h, p], i = $[0], o = $[1], u = moment(h).format("YYYY-MM-DD"), d = moment(p).format("YYYY-MM-DD"), g += "&from=" + u + "&to=" + d) : (h = c, y = [h, null], i = y[0], o = y[1], u = moment(h).format("YYYY-MM-DD"), g += "&from=" + u), s = c, n = "custom", a(h, p), e(g));
    }), $(document).on("change", ".js-period-container", function(t) {
        var e;
        return t.preventDefault(), t.stopPropagation(), e = $(t.target).val().toLowerCase(), n !== e ? r(e) : void 0;
    }), $(t = function() {
        var t;
        return t = $(".popular-repos .col").height() - 20, $(".popular-repos .capped-box").css("height", "" + t + "px");
    });
}.call(this), function() {
    var t, e, n;
    $(document).on("submit", ".js-find-coupon-form", function(t) {
        var e, n;
        return e = t.target.action, n = $("#code").val(), window.location = e + "/" + n, t.stopPropagation(), t.preventDefault();
    }), $(document).on("click", ".js-choose-account", function(n) { return $(".js-plan-row, .js-choose-plan").removeClass("selected"), $(".js-plan").val(""), $(".js-billing-section").addClass("is-hidden"), Billing.displayCreditCardFields(!1), $(".js-redeem-button").attr("disabled", !0), e($(this).closest(".js-account-row")), t(), n.stopPropagation(), n.preventDefault(); }), $(document).on("click", ".js-choose-plan", function(e) { return n($(this).closest(".js-plan-row")), t(), e.stopPropagation(), e.preventDefault(); }), t = function() { return $(".js-redeem-button").attr("disabled", !$(".js-choose-plan.selected").length); }, e = function(t) {
        var e, s, r;
        if (t.length)return s = t.data("login"), r = t.data("plan"), $(".js-account-row, .js-choose-account").removeClass("selected"), t.addClass("selected"), t.find(".js-choose-account").addClass("selected"), $(".js-account").val(s), $(".js-plan-section").removeClass("is-hidden"), $(".js-billing-plans").addClass("is-hidden"), $(".js-plans-for-" + s).removeClass("is-hidden"), e = $(".js-plans-for-" + s + " .js-plan-row"), 1 === e.length ? n(e) : n($("[data-name='" + r + "']"));
    }, n = function(t) {
        var e, n, s;
        if (t.length)return s = t.data("name"), n = t.closest(".js-billing-plans").data("has-billing"), e = parseInt(t.data("cost"), 10), $(".js-plan-row, .js-choose-plan").removeClass("selected"), t.addClass("selected"), t.find(".js-choose-plan").addClass("selected"), $(".js-plan").val(s), 0 === e || n ? ($(".js-billing-section").addClass("is-hidden"), Billing.displayCreditCardFields(!1)) : ($(".js-billing-section").removeClass("is-hidden"), Billing.displayCreditCardFields(!0));
    }, $(function() { return e($(".coupons .js-account-row.selected")), n($(".coupons .js-plan-row.selected")); });
}.call(this), function() {
    $(document).on("click", ".js-git-protocol-selector", function() {
        var t, e, n;
        return t = $(this).closest(".url-box"), n = $(this).attr("href"), e = $(this).attr("data-permission"), t.find(".js-url-field").val(n), t.find(".js-zeroclipboard").attr("data-clipboard-text", n), t.find(".js-clone-url-permission").text(e), $(".js-live-clone-url").text(n), (n = $(this).attr("data-url")) && $.ajax({ type: "POST", url: n }), t.find(".js-clone-urls > .selected").removeClass("selected"), $(this).parent(".js-clone-url-button").addClass("selected"), !1;
    }), $(document).on("mouseup", ".js-url-field", function() { return $(this).select(); }), $(document).on("click", ".js-clone-selector", function(t) {
        var e, n, s, r;
        return t.preventDefault(), e = $(this).attr("data-protocol"), r = $(".clone-url").hide(), n = r.filter('[data-protocol-type="' + e + '"]').show(), (s = n.attr("data-url")) ? $.ajax({ type: "POST", url: s }) : void 0;
    });
}.call(this), $.pageUpdate(function() { $("#edit_repo").length > 0 && ($(".site").is(".vis-public") ? $(".private-only").hide() : $(".public-only").hide()); }), function() {
    $(document).on("change", "#repo-settings #change_default_branch", function() {
        var t = $(this), e = t.find("select");
        currentDefaultBranch = e.val(), t.removeClass("success").removeClass("error").addClass("loading"), $.ajax({ type: "PUT", url: t.closest("form").attr("action"), data: { field: "repository_default_branch", value: e.val() }, success: function() { t.removeClass("loading").addClass("success"); }, error: function() { e.val(currentDefaultBranch), t.removeClass("loading").addClass("error"); } });
    }), $(document).on("change", ".js-repo-feature-checkbox", function() {
        var t = this, e = $(this).closest(".addon");
        e.removeClass("success").removeClass("error").addClass("loading"), $.ajax({ type: "PUT", url: e.closest("form").attr("action"), data: { field: t.name, value: t.checked ? 1 : 0 }, success: function(t) { e.removeClass("loading").addClass("success"), /^\s*</.test(t) && ($(".repo-nav").replaceWith(t), $(".repo-nav").pageUpdate()); }, error: function() { t.checked = !t.checked, e.removeClass("loading").addClass("error"); } });
    });
    var t = null;
    $(document).on("autocomplete:search", "#push_pull_collabs input[data-autocomplete]", function() {
        t && t.abort();
        var e = $(this).val();
        return"" === e ? ($("#add-user-autocomplete ul").empty(), $("#add-user-autocomplete").trigger("autocomplete:change"), void 0) : (t = $.ajax({ type: "GET", data: { q: e }, url: "/autocomplete/users", dataType: "html", success: function(e) { t = null, $("#add-user-autocomplete ul").html(e), $("#add-user-autocomplete").trigger("autocomplete:change"); } }), void 0);
    }), $(document).on("autocomplete:autocompleted:changed", "#push_pull_collabs input[data-autocomplete]", function() {
        var t = $(this).closest("form").find("button[type=submit]");
        $(this).attr("data-autocompleted") ? t.removeAttr("disabled") : t.attr("disabled", "disabled");
    }), $(document).on("submit", "#push_pull_collabs form", function() {
        var t = $(this).find(":text"), e = t.val();
        if (debug("Trying to add %s...", e), !e || !t.attr("data-autocompleted"))return!1;
        var n = function(t) { null != t ? $("#push_pull_collabs .error").text(t).show() : $("#push_pull_collabs .error").hide(); };
        return n(), $.ajax({ url: this.action, data: { member: e }, type: "POST", dataType: "json", success: function(e) { t.val(""), e.error ? n(e.error) : $("#push_pull_collabs ul.usernames").append(e.html); }, error: function() { n("An unidentified error occurred, try again?"); } }), !1;
    }), $(document).on("click", "#push_pull_collabs .remove-user", function() { return $.ajax({ type: "DELETE", url: this.href }), $(this).closest("li").remove(), !1; }), $(document).on("submit", "#repo-settings #teams form", function() {
        var t = $(this).find("select"), e = t.val(), n = function(t) { null != t ? $("#push_pull_collabs .error").text(t).show() : $("#push_pull_collabs .error").hide(); };
        return"" == e ? (n("You must select a team"), !1) : (n(), $.ajax({
            url: this.action,
            data: { team: e },
            type: "POST",
            dataType: "json",
            success: function(e) {
                t.val(""), e.error ? n(e.error) : $("#teams ul.teams").append(e.html);
            },
            error: function() { n("An unidentified error occurred, try again?"); }
        }), !1);
    }), $(document).on("click", "#repo-settings #custom_tabs .remove-tab", function() { return $.ajax({ type: "DELETE", url: this.href }), $(this).closest("li").remove(), !1; });
}(), function() { $(document).on("click", ".email-hidden-toggle > a", function() { return $(this).parent().siblings(".email-hidden-reply").toggle(), !1; }); }.call(this), function() {
    var t, e, n, s, r, a, i, o, c, l;
    c = 721, e = 110, l = [20, 0, 0, 20], a = l[0], r = l[1], n = l[2], s = l[3], t = 13, i = 2, o = function(t) {
        var e, n, s, r, a;
        if (s = t.length, 1 > s)return 0 / 0;
        if (1 === s)return 0;
        for (n = d3.mean(t), e = -1, r = 0; ++e < s;)a = t[e] - n, r += a * a;
        return r / (s - 1);
    }, $(document).on("graph:load", ".js-calendar-graph", function(n, r) {
        var l, u, d, h, f, m, p, g, v, y, b, j, x, w, C, k, S, _, T, D, A, M, B, P, E, I, U, F, L, q;
        for (l = $(this), f = l.attr("data-from"), f && (f = C = moment(f).toDate()), M = l.attr("data-to"), M && (M = moment(M).toDate()), r || (r = []), r = r.map(function(t) { return[new Date(t[0]), t[1]]; }).sort(function(t, e) { return d3.ascending(t[0], e[0]); }), u = 3.77972616981, x = r.map(function(t) { return t[1]; }), T = Math.sqrt(o(x)), y = d3.mean(x), _ = 3, p = d3.max(x), B = v - y, (6 > B || 15 > p) && (_ = 1), w = 0; _ > w;)
            P = x.filter(function(t) {
                var e;
                return e = Math.abs((y - t) / T), e > u;
            }), P.length > 0 ? (P = P[0], x = x.filter(function(t) { return t !== P; }), 0 === w && (g = x)) : P = null, w += 1;
        return v = d3.max(x), k = ["#d6e685", "#8cc665", "#44a340", "#1e6823"], m = d3.scale.quantile().domain([0, v]).range(k), h = d3.time.format("%w"), q = d3.time.format("%Y%U"), L = d3.time.format("%m-%y"), b = d3.time.format("%b"), U = {}, j = {}, r.forEach(function(t) {
            var e;
            return e = q(t[0]), U[e] || (U[e] = []), U[e].push(t);
        }), U = d3.entries(U), U.forEach(function(t) {
            var e;
            return e = L(t.value[0][0]), j[e] || (j[e] = [t.value[0][0], 0]), j[e][1] += 1;
        }), j = d3.entries(j).sort(function(t, e) { return d3.ascending(t.value[0], e.value[0]); }), A = d3.tip().attr("class", "svg-tip").offset([-10, 0]).html(function(t) {
            var e;
            return e = 0 === t[1] ? "No" : t[1], "<strong>" + e + " " + $.pluralize(t[1], "contribution") + "</strong> on " + moment(t[0]).format("MMMM Do YYYY");
        }), E = d3.select(this).append("svg").attr("width", c).attr("height", e).attr("id", "calendar-graph").append("g").attr("transform", "translate(" + s + ", " + a + ")").call(A), I = 0, D = (new Date).getFullYear(), F = E.selectAll("g.week").data(U).enter().append("g").attr("transform", function(e, n) {
            var s;
            return s = e.value[0][0], s.getFullYear() === D && 0 !== s.getDay() && 0 === I && (I = -1), "translate(" + (n + I) * t + ", 0)";
        }), S = F.selectAll("rect.day").data(function(t) { return t.value; }).enter().append("rect").attr("class", "day").attr("width", t - i).attr("height", t - i).attr("y", function(e) { return h(e[0]) * t; }).style("fill", function(t) { return 0 === t[1] ? "#eee" : m(t[1]); }).on("click", function(t) { return $(document).trigger("contributions:range", [t[0], d3.event.shiftKey]); }).on("mouseover", A.show).on("mouseout", A.hide), d = 0, E.selectAll("text.month").data(j).enter().append("text").attr("x", function(e) {
            var n;
            return n = t * d, d += e.value[1], n;
        }).attr("y", -5).attr("class", "month").style("display", function(t) { return t.value[1] <= 2 ? "none" : void 0; }).text(function(t) { return b(t.value[0]); }), E.selectAll("text.day").data(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]).enter().append("text").style("display", function(t, e) { return 0 === e % 2 ? "none" : void 0; }).attr("text-anchor", "middle").attr("class", "wday").attr("dx", -10).attr("dy", function(e, n) { return a + ((n - 1) * t + i); }).text(function(t) { return t[0]; }), f || M ? $(document).trigger("contributions:range", [f, M]) : void 0;
    });
}.call(this), function() {
    $(document).on("graph:load", ".js-graph-code-frequency", function(t, e) {
        var n, s, r, a, i, o, c, l, u, d, h, f, m, p, g, v, y, b, j;
        return p = $(this).width(), a = 500, j = [10, 10, 20, 40], d = j[0], u = j[1], c = j[2], l = j[3], e = e.map(function(t) { return[new Date(1e3 * t[0]), t[1], t[2]]; }).sort(function(t, e) { return d3.ascending(t[0], e[0]); }), n = e.map(function(t) { return[t[0], t[1]]; }), r = e.map(function(t) { return[t[0], t[2]]; }), i = d3.max(n, function(t) { return t[1]; }), o = d3.min(r, function(t) { return t[1]; }), m = e[0][0], f = e[e.length - 1][0], g = d3.time.scale().domain([m, f]).range([0, p - l - u]), y = d3.scale.linear().domain([o, i]).range([a - c - d, 0]), v = d3.svg.axis().scale(g).tickFormat(function(t) { return m.getFullYear() !== f.getFullYear() ? d3.time.format("%m/%y")(t) : d3.time.format("%m/%d")(t); }), b = d3.svg.axis().scale(y).orient("left").tickPadding(5).tickSize(p).tickFormat(function(t) { return d3.formatSymbol(t, !0); }), s = d3.svg.area().x(function(t) { return g(t[0]); }).y0(function(t) { return y(t[1]); }).y1(function() { return y(0); }), h = d3.select(this).data(e).append("svg").attr("width", p).attr("height", a).attr("class", "viz code-frequency").append("g").attr("transform", "translate(" + l + "," + d + ")"), h.append("g").attr("class", "x axis").attr("transform", "translate(0, " + (a - d - c) + ")").call(v), h.append("g").attr("class", "y axis").attr("transform", "translate(" + p + ", 0)").call(b), h.selectAll("path.area").data([n, r]).enter().append("path").attr("class", function(t, e) { return 0 === e ? "addition" : "deletion"; }).attr("d", s);
    });
}.call(this), function() {
    $(document).on("graph:load", ".js-commit-activity-graph", function(t, e) {
        var n, s, r, a, i, o, c, l, u, d, h, f, m, p, g, v, y, b, j, x, w;
        return c = $("#commit-activity-master"), s = $("#commit-activity-detail"), i = 260, g = s.width(), v = 0, function() {
            var t, n, a, o, c, l, u, d, h, f, m, p, y, b, j, x, w, C, k, S, _;
            for (l = 0, c = k = 0, S = e.length; S > k; c = ++k)t = e[c], 0 !== t.total && (l = c);
            return v = l, _ = [20, 30, 30, 40], m = _[0], h = _[1], f = _[2], d = _[3], a = e[v].days, u = d3.max(e, function(t) { return d3.max(t.days); }), j = d3.scale.linear().domain([0, a.length - 1]).range([0, g - h - f]), w = d3.scale.linear().domain([0, u]).range([i, 0]), C = d3.svg.axis().scale(w).orient("left").ticks(5).tickSize(-g + f + h), $(document).on("gg.week.selected", function(t, e) { return y(e); }), $(document).on("keyup", function(t) {
                var n, s;
                return n = v, 37 === (s = t.keyCode) || 39 === s ? (v > 0 && 37 === t.keyCode && (n -= 1), v < e.length && 39 === t.keyCode && (n += 1), y({ index: n })) : void 0;
            }), b = d3.select(s[0]).data([a]).append("svg").attr("width", g).attr("height", i + m + d).attr("class", "viz").append("g").attr("transform", "translate(" + h + "," + m + ")"), b.append("g").attr("class", "y axis").call(C), x = b.append("g").attr("class", "axis"), n = x.selectAll(".day").data(d3.weekdays).enter().append("g").attr("class", "day").attr("transform", function(t, e) { return"translate(" + j(e) + ", " + i + ")"; }), n.append("text").attr("text-anchor", "middle").attr("dy", "2em").text(function(t) { return t; }), p = d3.svg.line().interpolate("cardinal").x(function(t, e) { return j(e); }).y(w), b.append("path").attr("class", "path").attr("d", p), o = b.selectAll("g.dot").data(a).enter().append("g").attr("class", "dot").attr("transform", function(t, e) { return"translate(" + j(e) + ", " + w(t) + ")"; }), o.append("circle").attr("r", 4), o.append("text").attr("text-anchor", "middle").attr("class", "tip").attr("dy", -10).text(function(t) { return t; }), y = function(t) {
                var n, s, i;
                if (!(t.index > 52 || t.index < 0))return v = t.index, a = e[t.index].days, u = d3.max(a), j.domain([0, a.length - 1]), i = d3.selectAll(".bar.mini").attr("class", "bar mini"), n = d3.select(i[0][v]).attr("class", "bar mini active"), s = d3.transform(n.attr("transform")), r.transition().ease("back-out").duration(300).attr("transform", "translate(" + (s.translate[0] + 8) + ", 105)"), b.selectAll(".path").data([a]).transition().duration(500).attr("d", p), b.selectAll("g.dot").data(a).transition().duration(300).attr("transform", function(t, e) { return"translate(" + j(e) + ", " + w(t) + ")"; }), b.selectAll("text.tip").data(a).text(function(t) { return t; });
            };
        }(), w = [10, 30, 20, 30], h = w[0], u = w[1], d = w[2], l = w[3], i = 100, m = e.map(function(t) { return t.total; }), o = d3.max(m), a = d3.time.format("%m/%d"), y = d3.scale.ordinal().domain(d3.range(m.length)).rangeRoundBands([0, g - u - d], .1), j = d3.scale.linear().domain([0, o]).range([i, 0]), x = d3.svg.axis().scale(j).orient("left").ticks(3).tickSize(-g + u + d).tickFormat(d3.formatSymbol), b = d3.svg.axis().scale(y).ticks(d3.time.weeks).tickFormat(function(t, n) {
            var s;
            return s = new Date(1e3 * e[n].week), a(s);
        }), f = d3.tip().attr("class", "svg-tip").offset([-10, 0]).html(function(t, n) {
            var s;
            return s = moment(1e3 * e[n].week), "<strong>" + t + "</strong> " + $.pluralize(t, "commit") + " the week of " + s.format("MMMM Do");
        }), p = d3.select(c[0]).style("width", "" + g + "px").append("svg").attr("width", g + (u + d)).attr("height", i + h + l).attr("class", "viz").append("g").attr("transform", "translate(" + u + "," + h + ")").call(f), p.append("g").attr("class", "y axis").call(x), n = p.selectAll("g.mini").data(m).enter().append("g").attr("class", function(t, e) { return e === v ? "bar mini active" : "bar mini"; }).attr("transform", function(t, e) { return"translate(" + y(e) + ", 0)"; }).on("click", function(t, e) { return $(document).trigger("gg.week.selected", { node: this, index: e, data: t }); }), n.append("rect").attr("width", y.rangeBand()).attr("height", function(t) { return i - j(t); }).attr("y", function(t) { return j(t); }).on("mouseover", f.show).on("mouseout", f.hide), p.append("g").attr("class", "x axis").attr("transform", "translate(0," + i + ")").call(b).selectAll(".tick").style("display", function(t, e) { return 0 !== e % 3 ? "none" : "block"; }), r = p.append("circle").attr("class", "focus").attr("r", 8).attr("transform", "translate(" + (y(v) + y.rangeBand() / 2) + ", " + -i + ")"), r.transition().ease("elastic-in").duration(1e3).attr("r", 2).attr("transform", "translate(" + (y(v) + y.rangeBand() / 2) + ", " + (i + 5) + ")");
    });
}.call(this), function() {
    var t, e, n, s, r;
    t = d3.time.format("%Y-%m-%d"), n = function(t) { return new Date(1e3 * ~~t); }, s = function() {
        var t, e, n, s, r, a, i, o;
        for (n = {}, i = document.location.search.substr(1).split("&"), r = 0, a = i.length; a > r; r++)e = i[r], o = e.split("="), t = o[0], s = o[1], n[t] = s;
        return n;
    }, r = function(t, e) {
        var n, s, r, a;
        return r = "MMMM Do YYYY", a = moment(t).format(r), s = moment(e).format(r), n = $("#js-date-range").attr("data-default-branch"), $("#js-date-range").html("" + a + " <span class='dash'>&dash;</span> " + s + "    <p class='info'>Commits to " + n + ", excluding merge commits</p>");
    }, e = function(t) {
        var e, n;
        return e = moment(t[0].weeks[0].date), n = e.subtract("weeks", 1), t.forEach(function(t) { return t.weeks.unshift({ a: 0, c: 0, d: 0, date: n.toDate(), w: n / 1e3 }); });
    }, $(document).on("graph:load", "#contributors", function(a, i) {
        var o, c, l, u, d, h, f, m, p, g, v, y, b, j, x, w, C;
        return c = $(this), l = [], m = s(), C = null, w = null, null != m.from && (b = moment(m.from).toDate()), null != m.to && (d = moment(m.to).toDate()), u = (null != m ? m.type : void 0) || "c", c.on("range.selection.end", function(e, n) {
            var s;
            return s = n.range, b = s[0], d = s[1], t(b) === t(d) && (b = C, d = w), x(), r(b, d), v();
        }), g = function(t) {
            var s;
            return 1 === t[0].weeks.length && e(t), s = o(t), C = n(s[0].key), w = n(s[s.length - 1].key), null == b && (b = C), null == d && (d = w), r(b, d), y(s, C, w), v(t, C, w), $(".js-contribution-container").on("change", "input[type=radio]", f);
        }, p = function(t) {
            var e, n, s, r, a, i, o;
            for (s = 0, a = t.length; a > s; s++)for (e = t[s], o = e.weeks, r = 0, i = o.length; i > r; r++)n = o[r], n.date = new Date(1e3 * n.w);
            return t;
        }, h = function(t, e) {
            return t.map(function(t) {
                var n;
                return n = $.extend(!0, {}, t), n.weeks = n.weeks.filter(function(t) { return t.date >= e[0] && t.date <= e[1]; }), n;
            });
        }, o = function(t) {
            var e, n, s, r, a, i, o, c, l, u;
            for (n = {}, r = 0, i = t.length; i > r; r++)for (e = t[r], l = e.weeks, a = 0, o = l.length; o > a; a++)s = l[a], null == (u = n[c = s.w]) && (n[c] = { c: 0, a: 0, d: 0 }), n[s.w].c += s.c, n[s.w].a += s.a, n[s.w].d += s.d;
            return d3.entries(n);
        }, j = function(t) {
            return t = h(t, [b, d]), t.forEach(function(t) {
                var e, n, s, r, a, i, o;
                for (n = 0, e = 0, s = 0, o = t.weeks, a = 0, i = o.length; i > a; a++)r = o[a], n += r.c, e += r.a, s += r.d;
                return t.c = n, t.a = e, t.d = s;
            }), t.sort(function(t, e) { return d3.descending(t[u], e[u]); });
        }, y = function(e, s, r) {
            var a, i, o, l, h, f, m, p, g, v, $, y, j, x, w, C, k, S;
            return S = [20, 50, 20, 30], p = S[0], f = S[1], m = S[2], h = S[3], j = c.width(), o = 125, l = d3.max(e, function(t) { return t.value[u]; }), x = d3.time.scale().domain([s, r]).range([0, j - f - m]), C = d3.scale.linear().domain([0, l]).range([o, 0]), k = d3.svg.axis().scale(C).orient("left").ticks(4).tickSize(-j + f + m).tickPadding(10).tickFormat(d3.formatSymbol), w = d3.svg.axis().scale(x), e.length < 5 && w.ticks(e.length), a = d3.svg.area().interpolate("basis").x(function(t) { return x(n(t.key)); }).y0(function() { return o; }).y1(function(t) { return C(t.value[u]); }), d3.select("#contributors-master svg").remove(), y = d3.select("#contributors-master").data([e]).append("svg").attr("height", o + p + h).attr("width", j).attr("class", "viz").append("g").attr("transform", "translate(" + f + "," + p + ")"), y.append("g").attr("class", "x axis").attr("transform", "translate(0, " + o + ")").call(w), y.append("g").attr("class", "y axis").call(k), y.append("path").attr("class", "area").attr("d", a), $ = function() {
                var t;
                return y.classed("selecting", !0), t = d3.event.target.extent(), c.trigger("range.selection.start", { data: arguments[0], range: t });
            }, g = function() {
                var t, e;
                return t = d3.time.format("%m/%d/%Y"), e = d3.event.target.extent(), c.trigger("range.selection.selected", { data: arguments[0], range: e });
            }, v = function() {
                var t;
                return y.classed("selecting", !d3.event.target.empty()), t = d3.event.target.extent(), c.trigger("range.selection.end", { data: arguments[0], range: t });
            }, i = d3.svg.brush().x(x).on("brushstart", $).on("brush", g).on("brushend", v), (t(b) !== t(s) || t(d) !== t(r)) && i.extent([b, d]), y.append("g").attr("class", "selection").call(i).selectAll("rect").attr("height", o);
        }, v = function() {
            var t, e, n, s, r, a, o, c, h, f, m, p, g, v, y, x, w, C, k, S, _;
            return _ = [10, 10, 10, 20], h = _[0], o = _[1], c = _[2], a = _[3], y = 428, n = 100, $("#contributors ol").remove(), i = j(l), v = d3.select("#contributors").append("ol").attr("class", "contrib-data capped-cards clearfix"), r = d3.max(i, function(t) { return d3.max(t.weeks, function(t) { return t[u]; }); }), x = d3.time.scale().domain([b, d]).range([0, y]), C = d3.scale.linear().domain([0, r]).range([n - a - h, 0]), e = d3.svg.area().interpolate("basis").x(function(t) { return x(t.date); }).y0(function() { return n - a - h; }).y1(function(t) { return C(t[u]); }), k = d3.svg.axis().scale(C).orient("left").ticks(2).tickSize(-y).tickPadding(10).tickFormat(d3.formatSymbol), p = d3.time.format("%m/%y"), w = d3.svg.axis().scale(x).tickFormat(p), i[0].weeks.length < 5 && w.ticks(i[0].weeks.length).tickFormat(d3.time.format("%x")), $("li.capped-card").remove(), f = v.selectAll("li.capped-card").data(i).enter().append("li").attr("class", "capped-card").style("display", function(t) { return t[u] < 1 ? "none" : "block"; }), s = f.append("h3"), s.append("img").attr("src", function(t) { return t.author.avatar; }).attr("class", "avatar"), s.append("span").attr("class", "rank").text(function(t, e) { return"#" + (e + 1); }), s.append("a").attr("class", "aname").attr("href", function(t) { return"/" + t.author.login; }).text(function(t) { return t.author.login; }), t = s.append("span").attr("class", "ameta"), m = $(".graphs").attr("data-repo-url"), t.append("span").attr("class", "cmeta").html(function(t) { return"<a class='cmt' href='" + m + "/commits?author=" + t.author.login + "'>" + $.commafy(t.c) + " " + $.pluralize(t.c, "commit") + "</a> / <span class='a'>" + $.commafy(t.a) + " ++</span> / <span class='d'>" + $.commafy(t.d) + " --</span>"; }), g = f.append("svg").attr("width", y + (o + c)).attr("height", n + h + a).attr("class", "capped-card-content").append("g").attr("transform", "translate(" + o + "," + h + ")"), g.append("g").attr("class", "x axis").attr("transform", "translate(0, " + (n - h - a) + ")").call(w).selectAll(".tick text").style("display", function(t, e) { return 0 !== e % 2 ? "none" : "block"; }), S = g.append("g").attr("class", "y axis").call(k).selectAll(".y.axis g text").attr("dx", y / 2).style("display", function(t, e) { return 0 === e ? "none" : "block"; }).classed("midlabel", !0), g.append("path").attr("d", function(t) { return e(t.weeks); });
        }, x = function() {
            var e, n;
            return $.support.pjax ? (e = document.location, u = $("input[name=ctype]:checked").prop("value").toLowerCase(), n = "" + e.pathname + "?from=" + t(b) + "&to=" + t(d) + "&type=" + u, window.history.pushState(null, null, n)) : void 0;
        }, f = function() { return u !== $(this).val() ? (x(), g(l)) : void 0; }, l = p(i), g(i);
    });
}.call(this), function() {
    var t, e, n, s, r, a, i, o, c, l, u, d;
    l = d3.time.format("%m/%d"), r = d3.time.format("%A, %B %d %Y"), s = d3.time.format("%-I%p"), i = d3.format(","), a = { top: 20, right: 40, bottom: 30, left: 40 }, d = 980 - a.left - a.right, n = 150 - a.top - a.bottom, t = d3.bisector(function(t) { return t.date; }).left, e = function(t) { return"<div class='blankslate'>    <span class='mega-octicon octicon-graph'></span>    <h3>No activity so far this " + t + "</h3>  </div>"; }, u = function(t) {
        var e;
        return e = 0 > t ? "octicon-arrow-down" : t > 0 ? "octicon-arrow-up" : "", "<span class='totals-num'>    <span class='octicon " + e + "'></span>    " + i(Math.abs(t)) + " change  </span>";
    }, o = function(t) {
        var e, n;
        return e = 0 > t ? "octicon-arrow-down" : t > 0 ? "octicon-arrow-up" : "", n = 0 > t ? "decrease" : "increase", "<span class='totals-num'>    <span class='octicon " + e + "'></span>    " + i(Math.abs(t)) + "% " + n + "  </span>";
    }, c = function(c, l) {
        var h, f, m, p, g, v, y, b, j, x, w, C, k, S, _, T, D, A, M, B, P, E, I, U, F;
        if (l && null == l.error) {
            for (p = l.counts, m = l.summary.columns, C = new Date(1e3 * l.summary.starting), v = new Date(1e3 * l.summary.ending), j = l.summary.model, x = l.summary.period, b = d3.max(d3.merge(d3.values(p)), function(t) { return t.count; }), E = 0, U = m.length; U > E; E++)f = m[E], $(".js-" + j + "-" + f + " .js-total").text(i(l.summary.totals[f])), $(".js-" + j + "-" + f + " .js-changes").append(u(l.summary.total_changes[f])), $(".js-" + j + "-" + f + " .js-changes").append(o(l.summary.percent_changes[f]));
            if (0 === d3.values(l.summary.totals).filter(function(t) { return 0 !== t; }).length)return $(this).html(e(x));
            for (_ = d3.tip().attr("class", "svg-tip total-unique").offset([-10, 0]).html(function(t) {
                var e, n, a, o, c, u;
                for (a = "", e = function() {
                    switch (x) {
                    case"year":
                        return"Week of " + r(t.date);
                    case"week":
                        return"" + r(t.date) + " starting at " + s(t.date);
                    default:
                        return r(t.date);
                    }
                }(), n = 270 / l.summary.columns.length, u = l.summary.columns, o = 0, c = u.length; c > o; o++)f = u[o], a += "          <li class='totals " + f + "' style='width:" + n + "px'>            <strong>" + i(t[f]) + "</strong> " + f.split("_at")[0] + "          </li>";
                return"<span class='title'>" + e + "</span>       <ul>         " + a + "       </ul>";
            }), w = function() {
                var e, n, s, r, a, i, o, c, l, u;
                for (o = {}, c = D.invert(d3.mouse(this)[0]), a = m[0], i = t(p[a], c, 1), n = p[a][i - 1], s = p[a][i], e = s && c - n.date > s.date - c ? i : i - 1, o.date = p[a][e].date, l = 0, u = m.length; u > l; l++)f = m[l], o[f] = p[f][e].count;
                return r = T.selectAll("g.dots circle").filter(function(t) { return t.date === o.date; }), _.show.call(this, o, r[0][0]);
            }, I = 0, F = m.length; F > I; I++)f = m[I], p[f].forEach(function(t) { return t.date = new Date(1e3 * t.bucket); }), p[f] = p[f].filter(function(t) { return t.date < new Date; });
            return D = d3.time.scale().range([0, d]), M = d3.scale.linear().range([n, 0]), B = d3.scale.linear().range([n, 0]), k = 1, S = function() {
                switch (x) {
                case"year":
                    return d3.time.months;
                case"week":
                    return k = 8, d3.time.hours;
                default:
                    return k = 2, d3.time.days;
                }
            }(), A = d3.svg.axis().scale(D).tickSize(n + 5).tickPadding(10).ticks(S, k).orient("bottom"), P = d3.svg.axis().scale(M).ticks(3).tickFormat(d3.formatSymbol).orient("left"), y = d3.svg.line().x(function(t) { return D(t.date); }).y(function(t) { return M(t.count); }), T = d3.select(this).append("svg").attr("width", d + a.left + a.right).attr("height", n + a.top + a.bottom).attr("class", "vis").append("g").attr("transform", "translate(" + a.left + "," + a.top + ")").call(_), D.domain([C, v]), M.domain([0, b]), T.append("g").attr("class", "x axis").call(A).selectAll("text").attr("text-anchor", "middle"), T.append("g").attr("class", "y axis").call(P), h = d3.values(p), T.selectAll("path.path").data(h).enter().append("path").attr("class", function(t) { return"path total " + t[0].column; }).attr("d", function(t) { return y(t); }), g = T.selectAll("g.dots").data(h).enter().append("g").attr("class", function(t) { return"dots totals " + t[0].column; }), g.each(function() {
                var t;
                return t = d3.select(this), t.selectAll("circle").data(function(t) { return p[t[0].column]; }).enter().append("circle").attr("cx", function(t) { return D(t.date); }).attr("cy", function(t) { return M(t.count); }).attr("r", 4);
            }), P.orient("right"), T.append("g").attr("class", "y axis unique").attr("transform", "translate(" + d + ", 0)").call(P), T.append("rect").attr("class", "overlay").attr("width", d).attr("height", n).on("mousemove", w).on("mouseout", function() { return setTimeout(_.hide, 500); });
        }
    }, $(document).on("graph:load", ".js-dashboards-overview-graph", c);
}.call(this), function() {
    d3.formatSymbol = function(t, e) {
        var n;
        return null == e && (e = !1), e && (t = Math.abs(t)), 1e3 > t ? t : (n = d3.formatPrefix(t), "" + n.scale(t) + n.symbol);
    }, d3.weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
}.call(this), function() {
    var t, e;
    t = {}, $.observe(".js-graph", e = function(e) {
        var n, s, r, a;
        return n = $(e), (s = n.attr("data-url")) ? (n.find("svg").remove(), r = null != (a = t[s]) ? a : t[s] = $.ajaxPoll({ url: s }), n.addClass("is-graph-loading"), n.removeClass("is-graph-crunching is-graph-load-error is-graph-empty"), r.progress(function() { return n.addClass("is-graph-crunching"); }), r.always(function() { return n.removeClass("is-graph-loading is-graph-crunching"); }), r.done(function(t) {
            var e, s;
            return 0 === (null != t ? t.length : void 0) || 0 === (null != (e = t[0]) ? null != (s = e.weeks) ? s.length : void 0 : void 0) ? n.addClass("is-graph-empty") : n.fire("graph:load", [t]);
        }), r.fail(function() { return n.addClass("is-graph-load-error"); })) : void 0;
    });
}.call(this), function() {
    $(document).on("graph:load", ".js-milestone-graph", function(t, e) {
        var n, s, r, a, i, o, c, l, u, d, h, f, m, p, g, v, y, b, j, x, w, C, k, S, _, T, D, A, M;
        for (j = $(this).width(), h = 50, A = [10, 20, 10, 30], g = A[0], p = A[1], f = A[2], m = A[3], r = 100, M = [60, 20, 10, 30], u = M[0], l = M[1], o = M[2], c = M[3], x = d3.scale.ordinal().rangeRoundBands([0, j - c - l], .1), C = d3.scale.linear().range([r, 0]), S = d3.scale.linear().range([r, 0]), _ = d3.scale.linear().range([h, 0]), w = d3.svg.axis().scale(x).orient("top").tickSize(5).tickPadding(10).tickFormat(function(t) { return moment(e[t].date).format("M/D"); }), k = d3.svg.axis().scale(C).orient("left").tickSize(-j + c + l).tickFormat(Math.abs).ticks(4), d = d3.svg.line().x(function(t, e) { return x(e); }).y(function(t) { return _(t.events); }).interpolate("cardinal"), v = d3.select(this).append("svg").attr("width", j).attr("height", h + g + f).attr("id", "total-events").append("g").attr("transform", "translate(" + m + ", " + g + ")"), b = d3.select(this).append("svg").attr("id", "graph-open-close").attr("height", r + u + o).append("g").attr("transform", "translate(" + c + ", " + u + ")"), T = 0, D = e.length; D > T; T++)s = e[T], s.date = new Date(s.date), s.closed = -s.closed;
        return i = d3.min(e, function(t) { return t.closed; }), a = d3.max(e, function(t) { return t.open + t.reopened; }), C.domain([i - 1, a + 1]), x.domain(d3.range(e.length)), _.domain([0, d3.max(e, function(t) { return t.events; })]), S.domain([0, d3.max(e, function(t) { return t.open_total; })]), b.append("rect").attr("class", "axis-backing").attr("width", j).attr("height", 30).attr("x", -c).attr("y", -u), b.append("line").attr("class", "axis-backing-line").attr("x1", -c).attr("x2", j).attr("y1", -u + 30).attr("y2", -u + 30), b.append("g").attr("class", "x axis").attr("transform", "translate(0, -25)").call(w).selectAll("g").style("display", function(t, e) { return 0 === e % 4 ? "block" : "none"; }), b.append("g").attr("class", "y axis").call(k), b.selectAll(".y g").filter(function(t) { return 0 === t; }).classed("zero", !0), n = b.selectAll("g.bar").data(e).enter().append("g").attr("class", "bar").attr("transform", function(t, e) { return"translate(" + x(e) + ", 0)"; }), n.selectAll("rect.day").data(function(t) { return[t.open + t.reopened, t.closed]; }).enter().append("rect").attr("width", x.rangeBand()).attr("height", function(t) { return Math.abs(C(t) - C(0)); }).attr("y", function(t) { return C(Math.max(0, t)); }).attr("class", function(t, e) { return 0 === e ? "opened" : "closed"; }), y = v.append("g").attr("class", "x axis").attr("transform", "translate(0, " + (h + 10) + ")").call(w).selectAll("g").style("display", function(t, e) { return 0 === e % 4 ? "block" : "none"; }), y.selectAll("g text").style("display", "none"), v.selectAll("path.events").data([e]).enter().append("path").attr("class", "events").attr("d", d), v.append("text").text("ACTIVITY").attr("text-anchor", "middle").attr("x", function() { return j / 2 - this.getBBox().width / 2; }).attr("y", h / 2).attr("class", "activity-label");
    });
}.call(this);
var Network = defineNetwork(window.jQuery);
$(function() { $("#ng")[0] && new Network("#ng", 920, 600); }), function() {
    GitHub.ParticipationGraph = function() {

        function t(e) {
            var n, s, r, a, i, o, c, l = this;
            this.onSuccess = function() { return t.prototype.onSuccess.apply(l, arguments); }, this.el = $(e), this.canvas = e.getContext("2d"), r = window.devicePixelRatio || 1, s = this.canvas.webkitBackingStorePixelRatio || this.canvas.mozBackingStorePixelRatio || this.canvas.msBackingStorePixelRatio || this.canvas.oBackingStorePixelRatio || this.canvas.backingStorePixelRatio || 1, o = r / s, 1 !== o && (c = e.width, a = e.height, e.width = c * o, e.height = a * o, e.style.width = c + "px", e.style.height = a + "px", this.canvas.scale(o, o)), n = this.el.data("color-all"), i = this.el.data("color-owner"), null != n && (this.colors.all = n), null != i && (this.colors.owner = i), this.barMaxHeight = this.el.height(), this.barWidth = (this.el.width() - 52) / 52, this.refresh();
        }

        return t.prototype.colors = { all: "#cacaca", owner: "#336699" }, t.prototype.getUrl = function() { return this.el.data("source"); }, t.prototype.setData = function(t) {
            var e, n;
            this.data = t, (null == (null != (e = this.data) ? e.all : void 0) || null == (null != (n = this.data) ? n.owner : void 0)) && (this.data = null), this.scale = this.getScale(this.data);
        }, t.prototype.getScale = function(t) {
            var e, n, s, r, a;
            if (null != t) {
                for (e = t.all[0], a = t.all, s = 0, r = a.length; r > s; s++)n = a[s], n > e && (e = n);
                return e >= this.barMaxHeight ? (this.barMaxHeight - .1) / e : 1;
            }
        }, t.prototype.refresh = function() { $.ajax({ url: this.getUrl(), dataType: "json", success: this.onSuccess }); }, t.prototype.onSuccess = function(t) { this.setData(t), this.draw(); }, t.prototype.draw = function() { null != this.data && (this.drawCommits(this.data.all, this.colors.all), this.drawCommits(this.data.owner, this.colors.owner)); }, t.prototype.drawCommits = function(t, e) {
            var n, s, r, a, i, o, c, l;
            for (r = c = 0, l = t.length; l > c; r = ++c)n = t[r], a = this.barWidth, s = n * this.scale, i = r * (this.barWidth + 1), o = this.barMaxHeight - s, this.canvas.fillStyle = e, this.canvas.fillRect(i, o, a, s);
        }, t;
    }(), $.pageUpdate(function() { return $(this).find(".participation-graph").each(function() { return $(this).is(":hidden") ? ($(this).removeClass("disabled"), new GitHub.ParticipationGraph($(this).find("canvas")[0])) : void 0; }); });
}.call(this), function() {
    $(document).on("graph:load", ".js-pulse-authors-graph", function(t, e) {
        var n, s, r, a, i, o, c, l, u, d, h, f, m, p, g;
        return n = 15, e = e.slice(0, +(n - 1) + 1 || 9e9), h = $(this).width(), r = $(this).height(), g = [20, 0, 10, 20], l = g[0], c = g[1], i = g[2], o = g[3], f = d3.scale.ordinal().rangeRoundBands([0, h - o - c], .2), m = d3.scale.linear().range([r, 0]), p = d3.svg.axis().scale(m).orient("left").ticks(3).tickSize(-h + o + c).tickFormat(d3.formatSymbol), a = d3.max(e, function(t) { return t.commits; }), m.domain([0, a]), f.domain(d3.range(n)), i = f.rangeBand() + i, u = d3.tip().attr("class", "svg-tip").offset([-10, 0]).html(function(t) {
            var e;
            return"<strong>" + t.commits + "</strong> " + $.pluralize(t.commits, "commit") + " by <strong>" + (null != (e = t.login) ? e : t.name) + "</strong>";
        }), d = d3.select(this).append("svg").attr("id", "graph-pulse-authors").attr("height", r + l + i).append("g").attr("transform", "translate(" + o + ", " + l + ")").call(u), d.append("g").attr("class", "y axis").call(p), s = d.selectAll("g.bar").data(e).enter().append("g").attr("class", "bar").attr("transform", function(t, e) { return"translate(" + f(e) + ", 0)"; }), s.append("rect").attr("width", f.rangeBand()).attr("height", function(t) { return r - m(t.commits); }).attr("y", function(t) { return m(t.commits); }).on("mouseover", u.show).on("mouseout", u.hide), s.append("image").attr("y", r + 5).attr("xlink:href", function(t) { return t.gravatar; }).attr("width", f.rangeBand()).attr("height", f.rangeBand()).on("click", function(t) { return null != t.login ? document.location = "/" + t.login : void 0; });
    });
}.call(this), function() {
    $(document).on("graph:load", ".js-graph-punchcard", function(t, e) {
        var n, s, r, a, i, o, c, l, u, d, h, f, m, p, g, v, y, b, j, x, w;
        return i = 500, b = $(this).width(), d = {}, e.forEach(function(t) {
            var e, n, s, r, a;
            return s = d3.weekdays[t[0]], e = null != (r = d[s]) ? r : d[s] = [], n = t[1], null == (a = e[n]) && (e[n] = 0), e[n] += t[2];
        }), e = d3.entries(d).reverse(), w = [0, 0, 0, 20], p = w[0], f = w[1], m = w[2], h = w[3], c = 100, s = d3.range(7), o = d3.range(24), u = d3.min(e, function(t) { return d3.min(t.value); }), l = d3.max(e, function(t) { return d3.max(t.value); }), j = d3.scale.ordinal().domain(o).rangeRoundBands([0, b - c - f - m], .1), x = d3.scale.ordinal().domain(s).rangeRoundBands([i - p - h, 0], .1), g = d3.scale.sqrt().domain([0, l]).range([0, j.rangeBand() / 2]), v = d3.tip().attr("class", "svg-tip").offset([-10, 0]).html(function(t) { return"<strong>" + t + "</strong> " + $.pluralize(t, "commit"); }), y = d3.select(this).data(e).attr("width", "" + b + "px").append("svg").attr("width", b + (f + m)).attr("height", i + p + h).attr("class", "viz").append("g").attr("transform", "translate(" + f + "," + p + ")").call(v), r = y.selectAll("g.day").data(e).enter().append("g").attr("class", "day").attr("transform", function(t, e) { return"translate(0, " + x(e) + ")"; }), r.append("line").attr("x1", 0).attr("y1", x.rangeBand()).attr("x2", b - f - m).attr("y2", x.rangeBand()).attr("class", "axis"), r.append("text").attr("class", "day-name").text(function(t) { return t.key; }).attr("dy", x.rangeBand() / 2), y.append("g").selectAll("text.hour").data(o).enter().append("text").attr("text-anchor", "middle").attr("transform", function(t, e) { return"translate(" + (j(e) + c) + ", " + i + ")"; }).attr("class", "label").text(function(t) {
            var e;
            return e = t % 12 || 12, 0 === t || 12 > t ? "" + e + "a" : "" + e + "p";
        }), a = r.selectAll(".hour").data(function(t) { return t.value; }).enter().append("g").attr("class", "hour").attr("transform", function(t, e) { return"translate(" + (j(e) + c) + ", 0)"; }).attr("width", j.rangeBand()), a.append("line").attr("x1", 0).attr("y1", function(t, e) { return x.rangeBand() - (0 === e % 2 ? 15 : 10); }).attr("x2", 0).attr("y2", x.rangeBand()).attr("class", function(t, e) { return 0 === e % 2 ? "axis even" : "axis odd"; }), n = a.append("circle").attr("r", 0).attr("cy", x.rangeBand() / 2 - 5).attr("class", function() { return"day"; }).on("mouseover", v.show).on("mouseout", v.hide), n.transition().attr("r", g);
    });
}.call(this), function() {
    var t, e, n, s, r, a, i, o, c;
    i = d3.time.format.utc("%m/%d"), n = d3.time.format.utc("%A, %B %d %Y"), r = d3.format(","), s = { top: 20, right: 80, bottom: 30, left: 40 }, c = 960 - s.left - s.right, e = 150 - s.top - s.bottom, o = d3.tip().attr("class", "svg-tip total-unique").offset([-10, 0]).html(function(t) { return"<span class='title'>" + n(t.date) + "</span>   <ul>      <li class='totals'><strong>" + r(t.total) + "</strong> views</li      ><li class='uniques'><strong>" + r(t.unique) + "</strong> unique visitors</li>   </ul>"; }), t = d3.bisector(function(t) { return t.date; }).left, a = function(n, a) {
        var l, u, d, h, f, m, p, g, v, y, b, j, x, w, C, k, S, _, T, D, A, M, B, P;
        if (a && null == a.error) {
            for (k = d3.time.scale.utc().range([0, c]), _ = d3.scale.linear().range([e, 0]), T = d3.scale.linear().range([e, 0]), S = d3.svg.axis().scale(k).tickSize(e + 5).tickPadding(10).tickFormat(i).orient("bottom"), D = d3.svg.axis().scale(_).ticks(3).tickFormat(d3.formatSymbol).orient("left"), f = d3.svg.line().x(function(t) { return k(t.key); }).y(function(t) { return _(t.value); }), x = d3.select(this).append("svg").attr("width", c + s.left + s.right).attr("height", e + s.top + s.bottom).attr("class", "vis").append("g").attr("transform", "translate(" + s.left + "," + s.top + ")").call(o), l = a.counts.slice(0, 14), l.forEach(function(t) { return t.date = new Date(1e3 * (t.bucket + t.tz_seconds)); }), l.sort(function(t, e) { return d3.ascending(t.date, e.date); }), p = function() {
                var e, n, s, r, a, i;
                return i = k.invert(d3.mouse(this)[0]), a = t(l, i, 1), n = l[a - 1], s = l[a], e = i - n.date > s.date - i ? s : n, r = x.selectAll("g.dots circle").filter(function(t) { return t.key === e.date; }), o.show.call(this, e, r[0][0]);
            }, v = [], j = [], A = 0, M = l.length; M > A; A++)h = l[A], v.push({ key: h.date, value: h.total }), j.push({ key: h.date, value: h.unique });
            return m = [v, j], B = d3.extent(l, function(t) { return t.date; }), g = B[0], d = B[1], P = d3.extent(v, function(t) { return t.value; }), C = P[0], w = P[1], y = d3.max(j, function(t) { return t.value; }), b = y + d3.median(j, function(t) { return t.value; }), k.domain([g, d]), _.domain([0, w]), T.domain([0, b]), $(".js-views").text(r(a.summary.total)), $(".js-uniques").text(r(a.summary.unique)), x.append("g").attr("class", "x axis").call(S), x.append("g").attr("class", "y axis views").call(D), x.selectAll("path.path").data(m).enter().append("path").attr("class", function(t, e) { return"path " + (0 === e ? "total" : "unique"); }).attr("d", function(t, e) { return 0 === e ? f(t) : f.y(function(t) { return T(t.value); })(t); }), u = x.selectAll("g.dots").data(m).enter().append("g").attr("class", function(t, e) { return 0 === e ? "dots totals" : "dots uniques"; }), u.each(function(t, e) {
                var n;
                return n = d3.select(this), 1 === e && (_ = T), n.selectAll("circle").data(function(t) { return t; }).enter().append("circle").attr("cx", function(t) { return k(t.key); }).attr("cy", function(t) { return _(t.value); }).attr("r", 4);
            }), D.scale(T).orient("right"), x.append("g").attr("class", "y axis unique").attr("transform", "translate(" + c + ", 0)").call(D), x.append("rect").attr("class", "overlay").attr("width", c).attr("height", e).on("mousemove", p).on("mouseout", function() { return setTimeout(o.hide, 500); });
        }
    }, $(document).on("graph:load", ".js-traffic-graph", a), $(document).on("click", ".js-domain-list", function(t) { return t.preventDefault(), $(".js-top-paths").fadeOut("fast", function() { return $(".js-top-domains").fadeIn("fast"); }); }), $(document).on("click", ".js-domain", function(t) { return t.preventDefault(), $.ajax({ url: $(this).attr("href"), beforeSend: function() { return $(".js-top-domains").hide(), $(".js-spinner").show(); } }).done(function(t) { return $(".js-spinner").hide(), $(".js-top-paths").html(t).fadeIn("fast"); }); });
}.call(this), function() { $(document).on("click", ".dropdown-toggle .js-menu-target", function() { return $(".dropdown-toggle .js-menu-content").html($(".js-new-dropdown-contents").html()); }); }.call(this), function() {
    var t,
        e = [].indexOf || function(t) {
            for (var e = 0, n = this.length; n > e; e++)if (e in this && this[e] === t)return e;
            return-1;
        };
    t = function() {

        function t(e) {
            var n = this;
            this.input = e, this.loadSuggestions = function() { return t.prototype.loadSuggestions.apply(n, arguments); }, this.onNavigationOpen = function() { return t.prototype.onNavigationOpen.apply(n, arguments); }, this.onNavigationKeyDown = function() {
                return t.prototype.onNavigationKeyDown.apply(n, arguments);
            }, this.onKeyUp = function() { return t.prototype.onKeyUp.apply(n, arguments); }, this.deactivate = function() { return t.prototype.deactivate.apply(n, arguments); }, this.activate = function() { return t.prototype.activate.apply(n, arguments); }, this.container = function() { return t.prototype.container.apply(n, arguments); }, this.list = function() { return t.prototype.list.apply(n, arguments); }, $(this.input).attr("data-member-adder-activated") || ($(this.input).attr("data-member-adder-activated", !0), $(this.input).on("focusout:delayed.member-adder", this.deactivate), $(this.input).on("focusin:delayed.member-adder", this.activate), $(this.input).on("keyup.member-adder", this.onKeyUp), $(this.input).on("throttled:input.member-adder", this.loadSuggestions), this.spinner = document.getElementById($(this.input).attr("data-spinner")), this.container().on("navigation:keydown.member-adder", "[data-value]", this.onNavigationKeyDown), this.container().on("navigation:open.member-adder", "[data-value]", this.onNavigationOpen), this.sudo = $(this.input).attr("data-sudo-required"), this.added = {});
        }

        return t.prototype.list = function() { return this._list || (this._list = $(document.getElementById($(this.input).attr("data-member-list")))); }, t.prototype.container = function() { return this._container || (this._container = $(document.getElementById($(this.input).attr("data-member-adder")))); }, t.prototype.activate = function() { this.container().is(".active") || this.query && (this.container().addClass("active"), $(this.input).addClass("js-navigation-enable"), this.container().navigation("push"), this.container().navigation("focus")); }, t.prototype.deactivate = function() { this.container().removeClass("active"), this.container().find(".suggestions").hide(), $(this.input).removeClass("js-navigation-enable"), this.container().navigation("pop"); }, t.prototype.onKeyUp = function() {
            var t;
            return t = $(this.input).val(), t !== this.query ? (this.query = t) ? (this.search(t) ? this.activate() : this.deactivate(), this.query) : (this.query = null, this.deactivate(), void 0) : void 0;
        }, t.prototype.onNavigationKeyDown = function(t) {
            switch (t.hotkey) {
            case"tab":
                return this.onNavigationOpen(t), !1;
            case"esc":
                return this.deactivate(), !1;
            }
        }, t.prototype.onNavigationOpen = function(t) {
            var e, n, s, r = this;
            return n = $(t.target).attr("data-value"), this.input.value = "", e = this.container().attr("data-add-url"), null != (s = this.ajax) && s.abort(), GitHub.withSudo(function() { return r.startSpinner(), e ? $.ajax({ url: e, type: "post", data: { member: n }, complete: function(t) { return r.stopSpinner(), 200 === t.status ? (r.list().prepend(t.responseText), r.list().pageUpdate(), r.list().trigger("member-adder:added", n), r.added[n] = !0) : r.list().trigger("member-adder:error", [n, t]); } }) : (r.stopSpinner(), 0 === r.list().find("li[data-value='" + n + "']").length && (r.list().prepend(r.container().find("li[data-value='" + n + "']").clone()), r.list().pageUpdate(), r.list().trigger("member-adder:added", n))), r.deactivate(), r.input.focus(); }), this.deactivate(), this.input.focus(), !1;
        }, t.prototype.startSpinner = function() { return this.spinner && $(this.spinner).length ? $(this.spinner).removeClass("hidden") : void 0; }, t.prototype.stopSpinner = function() { return this.spinner && $(this.spinner).length ? $(this.spinner).addClass("hidden") : void 0; }, t.prototype.search = function(t) {
            var n, s, r, a, i;
            return r = this.container().find("ul"), r[0] ? (n = this.container().find(".js-no-results").removeClass("active"), a = e.call(t.slice(1), "@") >= 0, !a && (s = r.data("fuzzy-sort-items")) && r.data("fuzzy-sort-items", s.filter(function() { return $(this).attr("data-value") && !(e.call($(this).attr("data-value"), "@") >= 0); })), i = r.fuzzyFilterSortList(t.replace(/^@/, ""), { limit: 5, text: function(t) { return t.getAttribute("data-value"); } }), a && r.find("li:not(:first-child)").remove(), i > 0 ? (r.show(), this.container().navigation("focus"), !0) : (n.addClass("active"), !1)) : void 0;
        }, t.prototype.loadSuggestions = function() {
            var t, e, n = this;
            if ((t = this.query) && (e = this.container().attr("data-search-url")) && !this.ajax)
                return this.startSpinner(), this.ajax = $.ajax({
                    url: e,
                    data: { query: t },
                    complete: function() { return n.ajax = null, n.stopSpinner(); },
                    success: function(t) {
                        var e, s, r, a, i, o, c, l, u, d;
                        if (e = $($.parseHTML(t)), i = e.find("li"), i.length || n.container().find("li:visible").length || (n.activate(), $(".js-no-results").addClass("active")), i.length) {
                            for (c = n.container().find("ul"), s = c.data("fuzzy-sort-items"), o = {}, a = [], d = s.toArray().concat(i.toArray()), l = 0, u = d.length; u > l; l++)r = d[l], o[r.textContent] || n.added[$(r).attr("data-value")] || a.push(r), o[r.textContent] = !0;
                            return c.data("fuzzy-sort-items", $(a)), n.query = null, n.onKeyUp();
                        }
                    }
                });
        }, t;
    }(), $.pageUpdate(function() { return $("input[data-member-adder]").each(function() { return new t(this); }); });
}.call(this), function() {
    var t, e;
    $(document).on("click", ".js-org-billing-plans .js-choose-plan", function() { return t($(this).closest(".js-plan-row")), !1; }), t = function(t) {
        var n, s, r, a;
        return r = t.attr("data-name"), s = parseInt(t.attr("data-cost"), 10), n = parseInt(null != (a = t.attr("data-balance")) ? a : "0", 10), $(".js-org-billing-plans").find(".js-plan-row, .js-choose-plan").removeClass("selected"), t.find(".js-choose-plan").addClass("selected"), t.addClass("selected"), $(".js-plan").val(r), 0 === s && 0 === n ? Billing.displayCreditCardFields(!1) : (Billing.displayCreditCardFields(!0), null != t.attr("data-balance") ? e(r) : void 0);
    }, e = function(t) { return $(".js-plan-change-message").addClass("is-hidden"), $('.js-plan-change-message[data-name="' + t + '"]').removeClass("is-hidden"); }, $(function() { return Billing.displayCreditCardFields(!1), $(".selected .js-choose-plan").click(); });
}.call(this), function() {
    var t, e;
    t = function() {
        var t, n, s, r, a;
        return r = [], t = $(".js-advanced-search-input").val(), a = { Repositories: 0, Users: 0, Code: 0 }, r = e($("input[type=text].js-advanced-search-prefix, select.js-advanced-search-prefix"), function(t, e, n) { return"" === t ? "" : ("" !== e && a[n]++, "" !== e ? "" + t + e : void 0); }), $.merge(r, e($("input[type=checkbox].js-advanced-search-prefix"), function(t, e, n) {
            var s;
            return s = $(this).prop("checked"), s !== !1 && a[n]++, s !== !1 ? "" + t + s : void 0;
        })), n = function(t) { return t.Users > t.Code && t.Users > t.Repositories ? "Users" : t.Code > t.Users && t.Code > t.Repositories ? "Code" : "Repositories"; }, s = $.trim(r.join(" ")), $(".js-type-value").val(n(a)), $(".js-search-query").val($.trim("" + t + " " + s)), $(".js-advanced-query").empty(), $(".js-advanced-query").text("" + s), $(".js-advanced-query").prepend($("<span>").text($.trim(t)), " ");
    }, e = function(t, e) {
        return $.map(t, function(t) {
            var n, s, r, a;
            return r = $.trim($(t).val()), n = $(t).attr("data-search-prefix"), s = $(t).attr("data-search-type"), a = function(t) { return-1 !== t.search(/\s/g) ? '"' + t + '"' : t; }, "" === n ? e.call(t, n, r, s) : -1 !== r.search(/\,/g) && "location" !== n ? r.split(/\,/).map(function(r) { return e.call(t, n, a($.trim(r)), s); }) : e.call(t, n, a(r), s);
        });
    }, $(document).onFocusedInput(".js-advanced-search-prefix", function() { return function() { return t(); }; }), $(document).on("change", ".js-advanced-search-prefix", t), $(document).on("focusin", ".js-advanced-search-input", function() { return $(this).closest(".js-advanced-search-label").addClass("focus"); }), $(document).on("focusout", ".js-advanced-search-input", function() { return $(this).closest(".js-advanced-search-label").removeClass("focus"); }), $(document).on("click", ".js-see-all-search-cheatsheet", function() { return $(".js-more-cheatsheet-info").removeClass("hidden"), !1; }), $(function() { return $(".js-advanced-search-input").length ? t() : void 0; });
}.call(this), $(function() { $("#js-coupon-click-onload").click(), $(".selected .choose_plan").click(), $(".js-show-credit-card-form")[0] && ($.facebox({ div: "#credit_card_form" }), $(document).unbind("close.facebox").bind("close.facebox", function() { window.location = "/account/billing"; })); }), $(document).on("click", ".js-add-cc", function() { return $(document).one("reveal.facebox", function() { $("#facebox .js-thanks").hide(); }), $.facebox({ div: this.href }), !1; }), $(document).on("click", ".js-add-billing-contact-info", function() { return $(document).one("reveal.facebox", function() { $(".js-billing-info-field").focus(); }), $.facebox({ div: "#js-add-billing-contact-info-modal" }), !1; }), $(document).on("click", ".js-close-facebox", function() { $(document).trigger("close.facebox"); }), $(document).on("click", ".js-plan-change", function() {
    var t = $(this).closest("tr").attr("data-name");
    $.facebox({ div: this.hash });
    var e = $("#facebox");
    return e.find(".js-new-plan-name-val").val(t), e.find(".js-new-plan-name").text(t), e.find(".js-new-plan-card-on-file").toggle("free" !== t), e.find(".js-new-plan-free").toggle("free" == t), !1;
}), $(document).on("ajaxSuccess", "#facebox .js-coupon-form", function(t, e) { $("#facebox .facebox-content").html(e.responseText), $(document).one("close.facebox", function() { window.location.reload(); }); }).on("ajaxError", "#facebox .js-coupon-form", function(t, e) { return $("#facebox .facebox-content").html(e.responseText), !1; }), function() { $(document).on("click", ".js-add-billing-manager-button", function(t) { return $(t.target).toggleClass("selected"), $(".js-add-billing-manager-form").toggle(), $(".js-add-billing-manager-form input").focus(), !1; }), $(document).on("member-adder:error", ".js-billing-managers", function() { return $(".js-alert").removeClass("hidden"), $(".js-add-billing-manager-form").on("input.billing-manager", function() { return $(".js-alert").addClass("hidden"), $(this).off(".billing-manager"); }); }), $(document).on("member-adder:added", ".js-billing-managers", function() { return $(".js-add-billing-manager-button").click(); }); }.call(this), function() {
    var t, e, n, s, r;
    t = function(t) { return Math.floor(+new Date - +t); }, r = function() {
        var t, e;
        for (e = [], s = t = 1; 10 >= t; s = ++t)e.push("heat" + s);
        return e;
    }(), e = d3.scale.quantile().range(r), $.pageUpdate(n = function() {
        var n, s, r, a, i, o, c, l, u, d, h;
        for (d = $(this).find(".js-blame-heat"), o = 0, l = d.length; l > o; o++)for (i = d[o], a = moment($(i).attr("data-repo-created")), e.domain([0, t(a)]), h = $(i).find(".js-line-age"), c = 0, u = h.length; u > c; c++)r = h[c], r = $(r), n = moment(r.attr("data-date")), s = e(t(n)), r.addClass(s);
    });
}.call(this), function() {
    var t, e, n, s, r, a, i;
    n = function(t) {
        var e, n, s, r, a;
        if (n = t.match(/\#?(?:L|-)(\d+)/gi)) {
            for (a = [], s = 0, r = n.length; r > s; s++)e = n[s], a.push(parseInt(e.replace(/\D/g, "")));
            return a;
        }
        return[];
    }, t = function(t) {
        switch (t.sort(i), t.length) {
        case 1:
            return"#L" + t[0];
        case 2:
            return"#L" + t[0] + "-L" + t[1];
        default:
            return"#";
        }
    }, i = function(t, e) { return t - e; }, a = !1, e = function(t) {
        var e, n, s;
        if (n = $(".line, .line-data"), n.length) {
            if (n.css("background-color", ""), 1 === t.length)return $("#LC" + t[0]).css("background-color", "#ffc");
            if (t.length > 1) {
                for (e = t[0], s = []; e <= t[1];)$("#LC" + e).css("background-color", "#ffc"), s.push(e++);
                return s;
            }
        }
    }, r = function(t) {
        var s;
        return null == t && (t = n(window.location.hash)), e(t), !a && (s = $("#LC" + t[0])).length && $(window).scrollTop(s.offset().top - .33 * $(window).height()), a = !1;
    }, $.hashChange(function() { return $(".line, .line-data").length ? setTimeout(r, 0) : void 0; }), s = function(t) {
        var e, n;
        return a = !0, e = null != (n = $(window).scrollTop()) ? n : 0, t(), $(window).scrollTop(e);
    }, $(document).on("mousedown", ".line-number, .blob-line-nums span[rel], .csv-row-num", function(e) {
        var r, a;
        return a = $(this).hasClass("csv-row-num") ? n($(this).find("span:first").attr("id")) : n($(this).attr("rel")), e.shiftKey && (r = n(window.location.hash), a.unshift(r[0])), s(function() { return window.location.hash = t(a); }), !1;
    }), $(document).on("submit", ".js-jump-to-line-form", function() {
        var t, e;
        return t = $(this).find(".js-jump-to-line-field")[0], (e = t.value.replace(/[^\d\-]/g, "")) && (window.location.hash = "L" + e), $(document).trigger("close.facebox"), !1;
    }), $(document).on("click", ".highlight-ctags a.ctag-relative", function() {
        var e;
        return(e = n($(this).attr("href"))).length && (window.location.hash = t(e)), !1;
    });
}.call(this), function() {
    var t, e, n, s;
    n = !1, t = null, $.pageUpdate(function() {
        return n ? setTimeout(function() {
            var t;
            return(t = $("#highlight-ctags-enabled")).length ? t.prop("checked", !0).change() : void 0;
        }, 100) : void 0;
    }), s = function(e, n) {
        var r, a;
        return null == n && (n = 1e3), t ? e(t) : (r = $("#highlight-ctags-enabled"), a = $(".highlight-ctags").addClass("ctags-loading"), $.ajax({ url: r.data("list-url"), dataType: "json", success: function(r) { return r.tags ? (t = r.tags, e(t), a.removeClass("ctags-loading")) : r.generating ? 6e4 > n ? (n *= 1.5, setTimeout(function() { return s(e, n); }, n)) : a.removeClass("ctags-loading") : void 0; }, error: function() { return a.removeClass("ctags-loading"); } }));
    }, e = function() {
        return s(function(t) {
            var e, n, s, r, a;
            for (n = [], a = $(".highlight .line > span.n, .highlight .line > span.no"), s = 0, r = a.length; r > s; s++)e = a[s], t[e.textContent] && (e.children.length ? t[e.textContent] > 1 && (e.innerHTML = e.textContent, n.push(e)) : n.push(e));
            return $(n).addClass("valid-ctag");
        });
    }, $(document).on("click", ".highlight-ctags .popover", function() { return!1; }), $(document).on("click", ".highlight-ctags", function() {
        var t;
        return(t = $(".highlight-ctags .visible-ctag")).length ? (t.removeClass("visible-ctag").popover("destroy"), $(".highlight-ctags .popover").remove(), !1) : void 0;
    }), $(document).on("click", ".highlight-ctags span.valid-ctag", function(e) {
        var n, s, r, a;
        return(s = $(".highlight-ctags .visible-ctag")).length && (s.removeClass("visible-ctag").popover("destroy"), $(".highlight-ctags .popover").remove(), s[0] === e.target) ? !1 : (s = $(e.target), s.addClass("visible-ctag"), n = $("#highlight-ctags-enabled"), a = e.target.textContent, r = s.offset().left + s.width() > .5 * $(window).width() ? "left" : "right", s.popover({ html: !0, content: "<div class='loading'><img align='absmiddle' src='" + GitHub.Ajax.spinner + "' height='16'/>      Loading " + (t && t[a] || "") + " definitions</div>", placement: r }).popover("show"), $.ajax({ url: n.data("lookup-url") + escape(a), data: { path: n.data("path"), line: s.parents("div.line:first").attr("id").slice(2) }, dataType: "html", success: function(t) { return s.popover({ html: !0, content: t, placement: r }).popover("show"), $(".popover .js-navigation-container").navigation("focus"); } }), !1);
    }), $(document).on("change", "input#highlight-ctags-enabled", function(t) {
        var s;
        return s = $(".js-blob-data td > .highlight"), (n = $(t.target).is(":checked")) ? (s.addClass("highlight-ctags"), e()) : s.removeClass("highlight-ctags");
    }), $(document).on("keydown", function(t) {
        var e;
        return $(t.target).is("input, textarea") ? !0 : "f" === t.hotkey && (e = $("#highlight-ctags-enabled")).length ? (e.prop("checked", !e[0].checked).change(), !1) : void 0;
    });
}.call(this), function() {
    var t, e, n, s, r, a, i, o, c;
    r = function() {
        var t, e, n, s, r, a, i, o, c;
        return e = $(".js-blob-form"), t = e.find(".js-blob-filename"), i = !t[0] || t.val() !== t.attr("data-default-value"), t[0] && (i = i && "." !== t.val() && ".." !== t.val() && ".git" !== t.val() && !t.val().match(/^\s+$/)), o = e.find(".js-check-for-fork").is(":visible"), a = $(".js-blob-contents")[0], s = a.value !== a.defaultValue, n = s || $(a).attr("data-allow-unchanged") || $(a).attr("data-new-filename"), r = "" === a.value, e.find(".js-blob-submit").prop("disabled", !i || o || !n || r), c = s || $(a).attr("data-allow-unchanged"), e.find(".js-blob-contents-changed").val(c);
    }, $.pageUpdate(function() {
        var t;
        if (t = $(this).find(".js-blob-contents")[0])return r();
    }), $(document).on("change", ".js-blob-contents", function() { return a($(".js-blob-filename")), r(); }), $(document).on("click", ".js-new-blob-submit", function() { return $(this).closest("form.js-new-blob-form").submit(); }), $(document).onFocusedInput(".js-blob-filename", function() { return function() { return $(".js-blob-contents").attr("data-filename", $(this).val()), s($(this).val()), a($(this)); }; }), $(document).onFocusedInput(".js-breadcrumb-nav", function() { return function() { return c($(this)), a($(this)); }; }), $(document).onFocusedKeydown(".js-breadcrumb-nav", function() {
        return function(t) {
            var e, s, r;
            return s = $(this).caretSelection(), r = [0, 0], e = 0 === $(s).not(r).length && 0 === $(r).not(s).length, e && 8 === t.keyCode && 1 !== $(this).parent().children(".separator").size() && (n($(this), !0), t.preventDefault()), a($(this));
        };
    }), a = function(t) { return null != t[0] && (o(t), i(t)), r(); }, c = function(t) {
        var s, r, a, i, o, c;
        for (c = []; t.val().split("/").length > 1;)s = t.val(), a = s.split("/"), r = a[0], o = a.slice(1).join("/"), "" === r || "." === r || ".git" === r ? (t.val(o), i = function() { return t.caret(0); }, c.push(window.setTimeout(i, 1))) : ".." === r ? c.push(n(t)) : c.push(e(t, r, o));
        return c;
    }, s = function(t) {
        var e, n;
        return e = $(".js-gitignore-template"), n = $(".js-license-template"), /^(.+\/)?\.gitignore$/.test(t) ? e.addClass("is-visible") : /^(.+\/)?(licen[sc]e|copying)($|\.)/i.test(t) ? n.addClass("is-visible") : (e.removeClass("is-visible"), n.removeClass("is-visible"));
    }, i = function(t) {
        var e, n, s, r, a, i, o, c, l, u, d, h;
        return s = t.closest("form"), n = $(".js-blob-contents"), e = s.find(".js-new-blob-commit-summary"), o = t.val() ? "Create " + t.val() : "Create new file", d = n.attr("data-old-filename"), c = $(".js-new-filename-field").val(), n.removeAttr("data-new-filename"), o = d.length && c !== d && null != t[0] ? (n.attr("data-new-filename", "true"), a = n[0].value !== n[0].defaultValue, r = a ? "Update and rename" : "Rename", t.val().length && c.length ? (h = d.split("/"), l = c.split("/"), u = !0, i = h.length - 1, h.forEach(function(t, e) { return e !== i && t !== l[e] ? u = !1 : void 0; }), h.length === l.length && u ? "" + r + " " + h[i] + " to " + l[i] : "" + r + " " + d + " to " + c) : "" + r + " " + d) : d.length && c === d ? "Update " + t.val() : o, e.attr("placeholder", o), $(".js-commit-message-fallback").val(o);
    }, o = function(t) {
        var e, n;
        return e = $(".breadcrumb").children("[itemscope]"), n = "", e.each(function() {
            var t;
            return t = $(this), n = n + t.text() + "/";
        }), n += t.val(), $(".js-new-filename-field").val(n);
    }, n = function(t, e) {
        var n, r;
        return null == e && (e = !1), e || t.val(t.val().replace("../", "")), r = function() { return t.caret(0); }, 1 !== t.parent().children(".separator").size() && (t.prev().remove(), n = t.prev().children().children().html(), t.prev().remove(), e && (t.val("" + n + t.val()), r = function() { return e ? t.caret(n.length) : void 0; })), s(t.val()), window.setTimeout(r, 1);
    }, e = function(t, e, n) {
        var r, a, i, o, c, l, u;
        return null == n && (n = ""), e = e.replace(/[^-.a-z_0-9]+/gi, "-"), e = e.replace(/^-+|-+$/g, ""), e.length > 0 && (u = t.parent().children(".js-repo-root, [itemtype]").children("a").last().attr("href"), u || (r = t.parent().children(".js-repo-root, [itemtype]").children("span").children("a").last(), a = r.attr("data-branch"), c = r.attr("href"), u = "" + c + "/tree/" + a), i = $(".js-crumb-template").clone().removeClass("js-crumb-template"), i.find("a[itemscope]").attr("href", "" + u + "/" + e), i.find("span").text(e), o = $(".js-crumb-separator").clone().removeClass("js-crumb-separator"), t.before(i, o)), t.val(n), s(t.val()), l = function() { return t.caret(0); }, window.setTimeout(l, 1);
    }, $(document).onFocusedInput(".js-new-blob-commit-summary", function() {
        var t;
        return t = $(this).closest(".js-file-commit-form"), function() { return t.toggleClass("is-too-long-error", $(this).val().length > 50); };
    }), t = function(t) { return t.data("checking-for-fork") ? void 0 : (r(), $.smartPoller(function(e) { return $.ajax({ url: t.attr("data-check-url"), success: function() { return t.hide(), r(); }, error: function(n) { return 404 === n.status ? e() : t.html("<img src='/images/modules/ajax/error.png'>\nSomething went wrong. Please fork the project, then try from your fork."); } }); }), t.data("checking-for-fork", !0)); }, $.pageUpdate(function() {
        var e, n, s, r;
        for (r = $(".js-check-for-fork"), n = 0, s = r.length; s > n; n++)e = r[n], t($(e));
    }), $(document).on("change", ".js-gitignore-template input[type=radio]", function() { return $.ajax({ type: "GET", url: $(this).attr("data-template-url"), success: function(t) { return editor.setCode(t); } }); }), $(document).on("change", ".js-license-template input[type=radio]", function() {
        var t;
        return t = $(this).attr("data-template-contents"), editor.setCode(t);
    }), $(document).onFocusedKeydown(".js-new-blob-commit-description", function() { return function(t) { return"ctrl+enter" === t.hotkey || "meta+enter" === t.hotkey ? ($(this).closest("form").submit(), !1) : void 0; }; });
}.call(this), function() {
    $(document).on("ajaxSend", ".js-branch-delete", function() { return $(this).addClass("disabled"), $(this).closest(".actions").find(".spinner").show(); }), $(document).on("ajaxSuccess", ".js-branch-delete", function() { return $(this).closest("tr").fadeOut(), !1; }), $(document).on("ajaxError", ".js-branch-delete", function() { return $(this).closest(".actions").find(".spinner").hide(), $(this).html("Couldn't delete!"), !1; }), $(function() {
        var t, e, n, s;
        return e = 2, t = 7, s = 30, n = 1e4, $(".diverge-widget").each(function() {
            var n, r, a;
            return n = $(this), r = new Date(n.attr("last-updated")), a = (new Date - r) / 1e3 / 3600 / 24, e >= a ? n.addClass("hot") : t >= a ? n.addClass("fresh") : s >= a ? n.addClass("stale") : n.addClass("old");
        });
    });
}.call(this), function() {
    $.pageUpdate(function() {
        var t, e;
        if ((t = document.getElementById("diff-comment-data")) && !$(t).data("commit-inline-comments-rendered"))
            return e = {}, $("#files.diff-view > .file > .meta").each(function() { return e[$(this).attr("data-path")] = this; }), $("#diff-comment-data > table").each(function() {
                var t, n, s, r;
                return n = $(this).attr("data-path"), s = $(this).attr("data-position"), t = $(e[n]).closest(".file"), r = t.find(".data table tr[data-position='" + s + "']"), r.after($(this).children("tbody").children("tr").detach()), t.addClass("has-inline-notes show-inline-notes");
            }), $("#diff-comment-data > div").each(function() {
                var t;
                return t = $(this).attr("data-path"), $(e[t]).closest(".file").find(".file-comments-place-holder").replaceWith($(this).detach());
            }), $(t).data("commit-inline-comments-rendered", !0);
    }), $(document).on("change", ".js-show-inline-comments-toggle", function() { return $(this).closest(".file").toggleClass("show-inline-notes", this.checked); }), $(document).on("keyup", function(t) {
        var e;
        return"i" === t.hotkey && t.target === document.body ? (e = 0 === $(".js-show-inline-comments-toggle:not(:checked)").length, $(".js-show-inline-comments-toggle").prop("checked", !e).trigger("change")) : void 0;
    }), $(document).on("change", "#js-inline-comments-toggle", function() { return $("#comments").toggleClass("only-commit-comments", !this.checked); }), $(document).on("click", ".linkable-line-number", function() { return document.location.hash = this.id, !1; }), $(document).on("click", ".js-tag-list-toggle", function() {
        var t;
        return t = $(this), t.closest(".tag-list").find("li").show(), t.hide(), !1;
    });
}.call(this), function() { $(document).on("navigation:keyopen", ".commit-group-item", function() { return $(this).find(".commit-title > a:first").click(), !1; }), $(document).on("navigation:keydown", ".commit-group-item", function(t) { return"c" === t.hotkey ? ($(this).find(".commit-title > a:first").click(), !1) : void 0; }); }.call(this), function() {
    var t;
    $(document).on("click", ".js-compare-tabs a", function() { return $(this).closest(".js-compare-tabs").find("a").removeClass("selected"), $(this).addClass("selected"), $("#commits_bucket, #files_bucket, #commit_comments_bucket").hide(), $(this.hash).show(), !1; }), $.hashChange(function() { return $(this).closest("#files_bucket")[0] && !$(this).is(":visible") ? $('a.tabnav-tab[href="#files_bucket"]').click() : void 0; }), $(document).on("click", ".js-cross-repo a", function(t) { return t.preventDefault(), $(this).closest(".js-range-editor").addClass("is-cross-repo"); }), $(document).on("click", ".js-expand-range-editor", function() {
        var t;
        return t = $(this).closest(".js-range-editor"), t.removeClass("is-collapsed").addClass("is-expanded");
    }), $(document).on("click", ".js-collapse-range-editor", function() {
        var t;
        return t = $(this).closest(".js-range-editor"), t.addClass("is-collapsed").removeClass("is-expanded");
    }), t = function() {

        function t(e) {
            var n = this;
            this.onCommitishSelect = function() { return t.prototype.onCommitishSelect.apply(n, arguments); }, this.$container = $(e), "yes" !== this.$container.attr("data-range-editor-activated") && (this.$form = $("#js-compare-body-form"), this.$suggesters = this.$container.find(".js-select-menu"), this.urlTemplate = this.$container.attr("data-url-template"), this.currentRepo = this.$container.attr("data-current-repository"), this.base = this.$suggesters.filter('[data-type="base"]').attr("data-initial-value"), this.head = this.$suggesters.filter('[data-type="head"]').attr("data-initial-value"), this.baseFork = this.$suggesters.filter('[data-type="base-fork"]').attr("data-initial-value"), this.headFork = this.$suggesters.filter('[data-type="head-fork"]').attr("data-initial-value"), this.discussionDrafted = $(".js-compare-body-draft").length > 0, this.$suggesters.on("navigation:open.range-editor", ".js-navigation-item", this.onCommitishSelect), this.$form.on("change", "input, textarea", function() { return n.discussionDrafted = !0; }), this.$container.attr("data-range-editor-activated", "yes"));
        }

        return t.prototype.teardown = function() { return this.$suggesters.off(".range-editor"), this.$container.attr("data-range-editor-activated", null); }, t.prototype.onCommitishSelect = function(t) {
            var e, n;
            switch (n = $.trim($(t.target).text()), e = $(t.target).closest(".js-select-menu").attr("data-type")) {
            case"base":
                this.base = n;
                break;
            case"head":
                this.head = n;
                break;
            case"base-fork":
                this.baseFork = n;
                break;
            case"head-fork":
                this.headFork = n;
            }
            return this.updateDiff();
        }, t.prototype.updateDiff = function() {
            var t, e, n, s, r;
            return t = encodeURIComponent(this.base), n = encodeURIComponent(this.head), this.currentRepo !== this.baseFork && (t = "" + this.baseFork.replace(/\/(.+)/, "") + ":" + t), this.currentRepo !== this.headFork && (n = "" + this.headFork.replace(/\/(.+)/, "") + ":" + n), r = this.urlTemplate.replace("{{head}}", n).replace("{{base}}", t), s = { url: r, container: this.$container.closest("[data-pjax-container]")[0] }, this.discussionDrafted && this.$form.hasDirtyFields() && (e = { type: "POST", data: this.$form.serializeArray() }, s = $.extend({}, s, e)), $.pjax(s);
        }, t;
    }(), $.pageUpdate(function() { return $(".js-commitish-range-editor").each(function() { return new t(this); }); });
}.call(this), function() { $(document).on("focusin", ".js-contact-documentation-suggestions", function() { return $(this).data("quicksearch-installed") ? void 0 : ($(this).quicksearch({ url: $(this).attr("data-quicksearch-url"), results: $(this).closest("form").find(".documentation-results") }), $(this).data("quicksearch-installed", !0)); }), $(function() { return $(".js-contact-javascript-flag").val("true"); }); }.call(this), function() {
    var t;
    t = function(t) {
        var e, n, s, r, a, i;
        for (t = t.toLowerCase(), e = $(".js-csv-data tbody tr"), i = [], r = 0, a = e.length; a > r; r++)n = e[r], s = $(n).text().toLowerCase(), -1 === s.indexOf(t) ? i.push($(n).hide()) : i.push($(n).show());
        return i;
    }, $(document).on("keyup", ".js-csv-filter-field", function(e) {
        var n;
        return n = e.target.value, null != n && t(n), !1;
    });
}.call(this), function() {
    var t, e;
    e = function(t) {
        var e;
        return null == t && (t = document.location.search.substr(1)), e = {}, $.each(t.split("&"), function(t, n) {
            var s, r, a;
            return a = n.split("="), s = a[0], r = a[1], e[s] = decodeURIComponent(r.replace(/\+/g, " "));
        }), e;
    }, $(document).on("navigation:open", ".ctags-search-result", function() { return $(".js-ctags-search-form input.query").attr("placeholder", $.trim($(this).find(".name > .full").text())); }), $(document).on("click", ".js-ctags-search-results a.filter-item", function() {
        var t, n;
        return n = e(this.href.split("?", 2)[1] || ""), t = $(".js-ctags-search-form"), t.find("input[name=l]").val(n.l), t.find("input[name=k]").val(n.k), t.submit(), !1;
    }), $(document).on("submit", "form.js-ctags-search-form[data-ajax]", function() {
        var t, e;
        return e = $(this), (t = $(".js-ctags-search-results[data-ajax-container]")[0]) ? (e.addClass("pjax-active"), $.ajax({ url: e.attr("action"), data: e.serialize() }).always(function() { return e.removeClass("pjax-active"); }).done(function(e, n) { return"success" === n ? (t.innerHTML = e, $(t).pageUpdate()) : void 0; }), !1) : void 0;
    }), $(document).onFocusedKeydown(".js-ctags-search-form input.query", function(t) {
        var e, n;
        return e = $(this), n = null, e.on("throttled:input." + t, function() { return n && clearTimeout(n), n = setTimeout(function() { return e.closest("form").submit(); }, 150); }), function(t) { return"esc" === t.hotkey && (history.back(), t.preventDefault()), !0; };
    }), $.pageUpdate(t = function() {
        var t, e, n, s, r, a, i;
        for ($(".js-ctags-search-results .js-navigation-container").navigation("focus"), i = $(".js-ctags-search-results .ctags-search-result"), r = 0, a = i.length; a > r; r++)t = i[r], s = $(t), n = s.width() - s.find(".name").width() - 10, s.find(".link").css("max-width", "" + n + "px");
        return e = $(".js-ctags-search-form"), e.find("input.query").attr("placeholder", "Search definitions...").focus(), e.find("input.query:focus").length || e.find("input.query").focus(), $(".js-ctags-search-generating").length ? setTimeout(function() { return e.submit(); }, 5e3) : void 0;
    });
}.call(this), function() {
    $(document).on("click", ".js-entity-tab", function(t) {
        var e, n, s, r, a;
        if (t.preventDefault(), 2 === t.which || t.metaKey)return!0;
        for (e = $("#" + $(this).attr("data-container-id")), a = $(".js-entity-tab.selected"), s = 0, r = a.length; r > s; s++)n = a[s], $(n).removeClass("selected"), $("#" + $(n).attr("data-container-id")).removeClass("is-visible");
        return e.addClass("is-visible"), $(this).addClass("selected");
    });
}.call(this), function() {
    $(document).on("mousedown", ".diff-line-code", function() {
        var t;
        return t = $(this).closest(".file-diff"), t.addClass("hide-line-numbers"), t.hasClass("line-number-attrs") || (t.addClass("line-number-attrs"), t.find(".diff-line-num").each(function() {
            var t;
            return t = $(this), t.hasClass("expandable-line-num") ? void 0 : t.attr("data-line-number", $.trim(t.text()));
        })), $(document).one("mouseup", function() { return window.getSelection().toString() ? void 0 : t.removeClass("hide-line-numbers"); });
    });
}.call(this), function() {
    $(document).on("focusin", ".js-url-field", function() {
        var t;
        return t = this, setTimeout(function() { return $(t).select(); }, 0);
    });
}.call(this), function() {
    var t;
    t = function(t) {
        var e, n;
        return e = $(t), n = e.is(".is-autocheck-successful"), e.closest("form").find("button.primary").prop("disabled", !n), n;
    }, $(function() { return $(document.body).is(".page-new-discussion-list") ? t($("#discussion_list_name")) : void 0; }), $(document).on("autocheck:send", "#discussion_list_name", function(t, e) {
        var n, s, r;
        return n = $(this), r = n.closest("form").find("input[name=owner]:checked").val(), s = "" + r + ":" + e.data.value, n.data("autocheck-last-value") !== s ? (e.data.owner = r, n.data("autocheck-last-value", s), !0) : !1;
    }), $(document).on("change", ".new-discussion-list input[name=owner]", function() { $(this).closest("form").find("input[data-autocheck-url]").trigger("change"); }), $(document).on("autocheck:success", "#discussion_list_name", function(t, e) {
        var n, s, r;
        return s = $(this).val(), s && s !== e.name ? (n = $(this).closest("dl.form"), n.addClass("warn"), r = $("<dd>").addClass("warning").text("Will be created as " + e.name), n.append(r)) : void 0;
    }), $(document).on("autocheck:complete", "#discussion_list_name", function() { t(this); });
}.call(this), function() {
    $(document).on("navigation:keydown", ".js-discussion-list-container .js-navigation-item", function(t) { return"x" === t.hotkey ? $(this).find(".js-discussion-list-checkbox").click().trigger("change") : void 0; }), $(document).on("change", ".js-discussion-list-container .js-discussion-list-checkbox", function() { return $(this).closest(".js-discussion").toggleClass("is-selected", $(this).prop("checked")); }), $(document).on("change", ".js-discussions-bulk-actions .js-discussion-list-checkbox", function() { return console.log(this), $(this).closest(".js-discussions-container").find(".js-discussion-list-container .js-discussion-list-checkbox").prop("checked", $(this).prop("checked")); }), $(document).on("click", ".js-discussions-bulk-actions .js-mass-assign-button", function(t) {
        var e, n, s;
        return n = $(this).closest(".js-discussions-container").find(".js-discussion-list-container .js-discussion-list-checkbox"), s = function() {
            var t, s, r;
            for (r = [], t = 0, s = n.length; s > t; t++)e = n[t], e.checked && r.push(e.value);
            return r;
        }(), console.log("bulk admin", $(this).attr("data-url"), s), s.length && $.ajax({ type: "PUT", url: $(this).attr("data-url"), data: { discussions: s }, success: function() { return window.location.reload(); } }), t.preventDefault(), !1;
    });
}.call(this), function() { $(document).on("click", ".js-zen-mode", function() { return $(document.body).hasClass("zen") ? ($(document.body).removeClass("zen"), $(document).off("keydown.zenMode")) : ($(document.body).addClass("zen"), $(document).on("keydown.zenMode", function(t) { return"esc" === t.hotkey ? ($(document.body).removeClass("zen"), !1) : void 0; })), !1; }); }.call(this), function() {
    $(document).on("click", ".js-events-pagination", function() {
        var t, e;
        return e = $(this).parent(".ajax_paginate"), t = e.parent(), e.hasClass("loading") ? !1 : (e.addClass("loading"), $.ajax({ url: $(this).attr("href"), complete: function() { return e.removeClass("loading"); }, success: function(n) { return e.replaceWith(n), t.pageUpdate(); } }), !1);
    });
}.call(this), function() {
    var t, e, n, s, r, a, i, o, c;
    i = function(t, e) { return t.length ? parseInt(t.attr(e), 10) : -1; }, c = function(t, e) {
        var n, s, r;
        return s = t.offset().top, r = $(document).scrollTop(), e(), n = Math.max(t.offset().top - s, 0), $(document).scrollTop(r + n);
    }, a = function(t) {
        var e, n, s, r;
        return n = $(window).scrollTop(), e = n + $(window).height(), r = t.offset().top, s = r + t.height(), e >= s && r >= n;
    }, o = function(t) {
        var e, n;
        return e = t.match(/\#(diff\-[a-f0-9]+)[L|R](\d+)$/i), null !== e && 3 === e.length ? e : (n = t.match(/\#(discussion\-diff\-[0-9]+)[L|R](\d+)$/i), null !== n && 3 === n.length ? n : null);
    }, t = function(t, e, n, i, o, l, u, d, h) {
        var f;
        return null == h && (h = {}), f = $.extend({ prev_line_num_left: n, prev_line_num_right: o, next_line_num_left: i, next_line_num_right: l }, h), $.ajax({
            context: e,
            url: t + "?" + $.param(f),
            cache: !1,
            success: function(t) {
                var n, i, o, l, h, f, m;
                return l = e.next(), l.length ? (c(l, function() { return e.replaceWith(t); }), l.parent().pageUpdate()) : e.replaceContent(t), m = u.slice(1), i = $(document.getElementById(m)), i.length ? (n = i.parents(".mini-discussion-bubble"), n.length && (o = n.find(".file-box"), o.is(":visible") || (f = n.find("a.toggle-closed"), f.trigger("click"))), a(i) || $(window).scrollTop(i.offset().top), h = i.parents("tr"), r(h)) : d ? s(u, !1) : void 0;
            }
        });
    }, r = function(t) { return t.addClass("highlight"), setTimeout(function() { return t.removeClass("highlight"); }, 800); }, e = function(e, n, s, r, a) {
        var o, c, l, u, d, h, f, m, p, g, v, $, y, b, j;
        return o = e.parents("tr"), f = o.prevAll("tr.js-file-line").first(), u = o.nextAll("tr.js-file-line").first(), f.length || u.length ? (d = f.children("td").first(), c = u.children("td").first(), h = f.children("td").eq(1), l = u.children("td").eq(1), j = i(h, "data-line-number"), $ = i(l, "data-line-number"), b = i(d, "data-line-number"), v = i(c, "data-line-number"), m = /@@&nbsp;-\d+,(\d+)&nbsp;\+\d+,(\d+)&nbsp;/, p = o.children("td.diff-line-code").html(), g = m.exec(p), y = { offset: Math.max(n, 20), anchor: s }, (null != g ? g.length : void 0) >= 3 && (y.left_hunk_size = g[1], y.right_hunk_size = g[2]), t(e.attr("data-remote"), o, b, v, j, $, r, a, y)) : void 0;
    }, n = function(e, n, s) {
        var r, a, o;
        return r = e.parents("tr"), a = r.next(), o = i(a, "data-position"), t(e.attr("data-remote"), r, -1, o, -1, o, n, s);
    }, $(document).on("click", ".js-expand", function() {
        var t;
        return t = $(this).parents("tr"), window.location.hash = t.attr("data-anchor");
    }), $.hashChange(function() {
        var t;
        return t = window.location.hash, s(t, !0);
    }), s = function(t, s) {
        var r, a, c, l, u, d, h, f, m, p, g, v, y, b, j, x;
        if (t.length && (d = o(t), null !== d && (y = d[1], j = parseInt(d[2], 10), m = t.slice(1), u = $(document.getElementById(m)), !(u.length || (l = $("a[name='" + y + "']").next(), g = l.find(".js-expand").parent("td"), v = function() {
            var t, e, n;
            for (n = [], t = 0, e = g.length; e > t; t++)p = g[t], a = $(p), f = i(a, "data-line-number") - j, n.push({ expanderCell: a, distance: f, absDistance: Math.abs(f) });
            return n;
        }(), x = v.sort(function(t, e) { return t.absDistance > e.absDistance ? 1 : -1; }), b = function() {
            var t, e, n;
            for (n = [], t = 0, e = x.length; e > t; t++)p = x[t], p.distance >= 0 && n.push(p);
            return n;
        }(), 0 === b.length && (b = x), b.length < 1)))))return r = b[0].expanderCell, h = b[0].absDistance, r.length ? (c = r.children(".js-expand"), c.hasClass("js-review-comment") ? n(c, t, s) : e(c, h + 1, y, t, s)) : void 0;
    };
}.call(this), function() {
    $(function() {
        var t, e;
        return t = $(".js-newsletter-frequency-choice"), t.length ? (e = function() {
            var e;
            return t.find(".selected").removeClass("selected"), e = t.find("input[type=radio]:enabled:checked"), e.closest(".choice").addClass("selected");
        }, t.on("change", "input[type=radio]", function() { return e(); }), e()) : void 0;
    }), $(document).on("ajaxSuccess", ".js-subscription-toggle", function() {
        var t;
        return t = $(this).find(".selected .notice"), t.addClass("visible"), setTimeout(function() { return t.removeClass("visible"); }, 2e3);
    }), $(document).on("graph:load", ".js-explore-commit-activity-graph", function(t, e) {
        var n, s, r, a, i, o, c, l, u, d, h;
        return $(t.target).empty().append($("h3").addClass("featured-graph-title").text("12 weeks commit activity")), e = e.reverse().slice(0, 12).reverse(), a = { top: 20, right: 20, bottom: 30, left: 40 }, c = 390 - a.left - a.right, r = 200 - a.top - a.bottom, s = d3.time.format("%m/%d"), l = d3.scale.ordinal().rangeRoundBands([0, c], .1).domain(d3.range(e.length)), d = d3.scale.linear().range([r, 0]).domain([0, d3.max(e, function(t) { return t.total; })]), u = d3.svg.axis().scale(l).ticks(6).tickFormat(function(t, n) {
            var r;
            return r = new Date(1e3 * e[n].week), s(r);
        }), h = d3.svg.axis().scale(d).ticks(3).orient("left").tickFormat(d3.formatSymbol), o = d3.tip().attr("class", "svg-tip").offset([-10, 0]).html(function(t, n) {
            var s;
            return s = moment(1e3 * e[n].week), "<strong>" + t.total + "</strong> " + $.pluralize(t.total, "commit") + " the week of " + s.format("MMMM Do");
        }), i = d3.select(t.target).append("svg").attr("width", c + a.left + a.right).attr("height", r + a.top + a.bottom).append("g").attr("transform", "translate(" + a.left + "," + a.top + ")").call(o), i.append("g").attr("class", "x axis").attr("transform", "translate(0," + r + ")").call(u).selectAll(".tick").style("display", function(t, e) { return 0 !== e % 3 ? "none" : "block"; }), i.append("g").attr("class", "y axis").call(h), n = i.selectAll("g.mini").data(e).enter().append("g").attr("class", "bar mini").attr("transform", function(t, e) { return"translate(" + l(e) + ", 0)"; }), n.append("rect").attr("width", l.rangeBand()).attr("height", function(t) { return r - d(t.total); }).attr("y", function(t) { return d(t.total); }).on("mouseover", o.show).on("mouseout", o.hide);
    }), $(document).on("carousel:unselected", ".js-carousel-slides .js-carousel-slide:not(.no-video)", function() {
        var t;
        return t = $(this).find("iframe"), t.length ? t[0].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*") : void 0;
    }), $(document).on("ajaxSuccess", ".js-explore-newsletter-subscription-container", function(t, e) { return $(this).replaceWith(e.responseText); });
}.call(this), function() {
    var t, e;
    t = function() {
        var t;
        return t = $("#js-features-branch-diagram"), t.removeClass("preload"), t.find("path").each(function() {
            var t, e, n;
            return $(this).is("#js-branch-diagram-branch") ? n = "stroke-dashoffset 3.5s linear 0.25s" : $(this).is("#js-branch-diagram-master") ? n = "stroke-dashoffset 4.1s linear 0s" : $(this).is("#js-branch-diagram-arrow") && (n = "stroke-dashoffset 0.2s linear 4.3s"), e = $(this).get(0), t = e.getTotalLength(), e.style.transition = e.style.WebkitTransition = "none", e.style.strokeDasharray = t + " " + t, e.style.strokeDashoffset = t, e.getBoundingClientRect(), e.style.transition = e.style.WebkitTransition = n, e.style.strokeDashoffset = "0";
        });
    }, $(document).on("click", ".js-segmented-nav a", function(t) {
        var e, n;
        return n = $(this).data("selected-tab"), e = $(this).closest(".js-segmented-nav"), e.find("li").removeClass("active"), e.siblings(".js-selected-nav-tab").removeClass("active"), $(this).parent("li").addClass("active"), $("." + n).addClass("active"), t.preventDefault();
    }), e = function() { return $(document).scrollTop() >= $("#js-features-branch-diagram").offset().top - 700 ? t() : void 0; }, $.observe("#js-features-branch-diagram.preload", { add: function() { return $(window).on("scroll", e); }, remove: function() { return $(window).off("scroll", e); } });
}.call(this), function() {
    $(document).on("click", "#fork-select .target", function() {
        var t;
        if (!$(this).hasClass("disabled"))return t = $(this).text().replace("@", ""), $("#organization").val(t), $("#fork").submit();
    });
}.call(this), function() {
    $.observe(".js-hook-url-field", function(t) {
        var e, n;
        return e = $(t), n = function(t) {
            var e, n;
            return e = $(t).closest("form"), n = /^https/.test(t.val()), e.toggleClass("ssl-hook-form", n);
        }, e.on("keyup", function() { return n(e); }), n(e);
    }), $(document).on("click", ".js-hook-event-filter", function() {
        var t, e, n;
        return t = $(this).closest(".js-hook-filter-container"), t.find(".js-hook-event-filter").removeClass("selected"), $(this).addClass("selected"), t.find(".js-filterable-field").val(""), (n = $(this).data("filter")) && (e = t.find(".js-hook-event-list"), e.removeClass("filterable-empty"), e.children().show(), e.children().not(n).hide()), !1;
    }), $(document).on("filterable:change", ".js-hook-event-list", function() {
        var t;
        t = $(this).closest(".js-hook-filter-container"), t.find(".js-hook-event-filter").removeClass("selected"), t.find('.js-hook-event-filter[data-filter=".all"]').addClass("selected");
    }), $(document).on("click", ".js-select-all-hook-events", function() {
        var t;
        return t = $(this).closest(".js-hook-filter-container"), t.find('input[type="checkbox"]').prop("checked", !0), !1;
    }), $(document).on("click", ".js-select-default-hook-event", function() {
        var t;
        return t = $(this).closest(".js-hook-filter-container"), t.find('input[type="checkbox"]').prop("checked", !1), t.find('input[type="checkbox"][value="push"]').prop("checked", !0), !1;
    });
}.call(this), function() {
    var t, e;
    e = function(t, e, n) {
        var s, r;
        for (n || (n = []), "string" == typeof n && (n = [n]), n = function() {
            var t, e, s;
            for (s = [], t = 0, e = n.length; e > t; t++)r = n[t], r.match(/\s/) ? s.push('"' + r + '"') : s.push(r);
            return s;
        }(), s = RegExp("" + e + ':([^\\s"]+|"[^"]+")', "g"), t = t.replace(s, function(t, s) {
            var a;
            return a = n.indexOf(s), -1 === a ? (r = n.shift()) ? "" + e + ":" + r : "" : (n.splice(a, 1), "" + e + ":" + s);
        }); r = n.shift();)t += " " + e + ":" + r;
        return t.trim().replace(/\s+/g, " ");
    }, t = function(t) {
        var e, n, s, r, a, i, o;
        for (e = {}, i = $(t).find("input.js-issue-search-filter"), r = 0, a = i.length; a > r; r++)n = i[r], s = n.name.match(/q\[(\w+)\]/)[1], null == (o = e[s]) && (e[s] = []), n.checked && e[s].push(n.value);
        return e;
    }, $(document).on("change", ".js-issue-search-filter", function() {
        var n, s, r, a, i;
        n = document.getElementById("js-issues-search"), r = n.value, i = t($(".toolbar-filters"));
        for (s in i)a = i[s], r = e(r, s, a);
        n.value = r;
    }), $(document).on("menu:deactivate", ".js-issues-toolbar-filters", function() { return $("#js-issues-search").submit(); }), $(document).on("change", ".js-issues-states", function() { return $("#js-issues-search").submit(); });
}.call(this), function() {
    var t;
    t = function() {

        function t(t) { this.field = t, this.loadSuggestions(); }

        return t.prototype.loadSuggestions = function() {
            var t;
            return t = $(".js-issue-suggest").val(), $.ajax({
                url: $(this.field).attr("data-url"),
                data: { q: t },
                dataType: "json",
                success: function(t) {
                    var e, n, s, r;
                    for ($(".js-suggested-issues").html("<li>Related Issues</li>"), r = [], n = 0, s = t.length; s > n; n++)e = t[n], r.push($(".js-suggested-issues").append('<li><a href="' + e.url + '">' + e.title + "</a></li>"));
                    return r;
                }
            });
        }, t;
    }(), $(document).on("focusout", ".js-issue-suggest", function() { new t(this); });
}.call(this), function() {
    var t;
    t = function() {

        function t(t, e) { this.inBulkMode = !1, this.filter = t, this.value = e; }

        return t.prototype.selectedIssueIds = function() { return $(".js-issues-list-check:checked").map(function() { return $(this).parents(".js-issue-row").data("issue-id"); }); }, t.prototype.sendUpdates = function() {
            var t, e, n, s, r;
            for (t = $("#triage"), t.find("input[name=filter]").val(this.filter), t.find("input[name=value]").val(this.value), r = this.selectedIssueIds(), n = 0, s = r.length; s > n; n++)e = r[n], t.append('<input type="hidden" name="numbers[]" value="' + e + '">');
            return t.submit(), this.updateIssues();
        }, t.prototype.updateIssues = function() {
            var t;
            return t = $("#js-issues-search").val(), $.pjax({ url: "", type: "get", data: { q: t }, container: "#js-repo-pjax-container" });
        }, t.prototype.triggerTriage = function() { return this.inBulkMode = !0, $(".js-triage-selector").addClass("triage-mode"), $(".js-triage").addClass("triage-mode"); }, t.prototype.exitTriage = function() { return this.inBulkMode = !1, $(".js-triage-selector").removeClass("triage-mode"), $(".js-triage").removeClass("triage-mode"); }, t;
    }(), $(function() {
        return $(".issues-listing").selectableList(".js-selectable-issue-list", { wrapperSelector: ".js-list-browser-item", itemParentSelector: "", enableShiftSelect: !0, ignoreLinks: !0 }), $(".js-issues-list-check").change(function() {
            var e;
            return e = new t, e.selectedIssueIds().length > 0 ? e.triggerTriage() : e.exitTriage();
        }), $(document).on("selectmenu:selected", ".js-triage .js-navigation-item", function() {
            var e, n, s;
            return e = $(this).parents(".select-menu-list").data("filter"), s = $(this).find(".js-select-button-text").data("value"), n = new t(e, s), n.sendUpdates(), $(".js-triage").find(".js-navigation-item.selected").removeClass("selected");
        }), $(".js-select-all-issues input").change(function() {
            var e, n;
            return e = new t, n = $(this).is(":checked"), $(".js-selectable-issue-list").find("input[type=checkbox]").prop("checked", n), $(".js-select-all-issues input").prop("checked", n), n ? e.triggerTriage() : e.exitTriage();
        }), $(".js-selectable-issue-list input[type=checkbox]").change(function() { return $(".js-selectable-issue-list input[type=checkbox]:checked").length > 0 ? $(".js-select-all-issues input").prop("indeterminate", !0) : ($(".js-select-all-issues input").prop("checked", !1), $(".js-select-all-issues input").prop("indeterminate", !1)); });
    });
}.call(this), function() {
    var t, e, n;
    e = function(e, n) { return e.closest(".js-label-editor").find(".js-color-editor-bg").css("background-color", n), e.css("color", t(n, -.5)), e.css("border-color", n); }, n = function(t) {
        var e, n;
        return e = "#eee", n = $(t).closest(".js-color-editor"), n.find(".js-color-editor-bg").css("background-color", e), t.css("color", "#c00"), t.css("border-color", e);
    }, t = function(t, e) {
        var n, s, r;
        for (t = String(t).toLowerCase().replace(/[^0-9a-f]/g, ""), t.length < 6 && (t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2]), e = e || 0, r = "#", n = void 0, s = 0; 3 > s;)n = parseInt(t.substr(2 * s, 2), 16), n = Math.round(Math.min(Math.max(0, n + n * e), 255)).toString(16), r += ("00" + n).substr(n.length), s++;
        return r;
    }, $(document).on("focusin", ".js-color-editor-input", function() {
        var t, s;
        return s = $(this), t = $(this).closest(".js-label-editor"), s.on("throttled:input.colorEditor", function() {
            var r;
            return"#" !== s.val().charAt(0) && s.val("#" + s.val()), t.removeClass("is-valid is-not-valid"), r = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(s.val()), t.find(".js-label-editor-submit").toggleClass("disabled", !r), r ? (t.addClass("is-valid"), e(s, s.val())) : (t.addClass("is-not-valid"), n(s));
        }), s.on("blur.colorEditor", function() { return s.off(".colorEditor"); });
    }), $(document).on("menu:activate", ".js-editable-label", function() {
        var t;
        return t = $(this).find(".js-color-editor-input"), e(t, t.val()), $(this).find(".js-label-editor").addClass("is-valid"), $(this).find(".js-label-editor").addClass("open");
    }), $(document).on("menu:deactivate", ".js-editable-label", function() {
        var t, e, n;
        return n = $(this).find(".js-color-editor-input"), e = $(this).find(".js-label-editor"), n.attr("style", ""), e.removeClass("is-valid is-not-valid"), e.find(".js-color-editor-bg").attr("style", ""), e.find(".js-label-editor").removeClass("open"), n.val(n.attr("data-original-color")), t = $(".js-color-cooser-color");
    }), $(document).on("click", ".js-color-cooser-color", function() {
        var t, n, s;
        return t = $(this).closest(".js-label-editor"), n = "#" + $(this).data("hex-color"), s = t.find(".js-color-editor-input"), t.find(".js-label-editor-submit").removeClass("disabled"), t.removeClass("is-valid is-not-valid"), s.val(n), e(s, n);
    }), $(document).on("submit", ".js-label-editor form", function() {
        var t, e;
        return t = $(this).find(".js-color-editor-input"), e = t.val(), e.length < 6 && (e = e[1] + e[1] + e[2] + e[2] + e[3] + e[3]), t.val(e.replace("#", ""));
    }), $(document).on("focusin", ".js-label-editor", function() { return $(this).closest(".js-label-editor").addClass("open"); }), $(function() {
        var t;
        return t = $("#issues_list"), t.length ? t.selectableList(".js-color-chooser", { wrapperSelector: ".js-color-cooser-color", mutuallyExclusive: !0 }) : void 0;
    });
}.call(this), function() {
    $.hashChange(function(t) {
        var e, n, s, r;
        return s = t.newURL, (n = s.match(/\/issues#issue\/(\d+)$/)) ? (r = n[0], e = n[1], window.location = s.replace(/\/?#issue\/.+/, "/" + e)) : void 0;
    }), $.hashChange(function(t) {
        var e, n, s, r, a;
        return r = t.newURL, (s = r.match(/\/issues#issue\/(\d+)\/comment\/(\d+)$/)) ? (a = s[0], n = s[1], e = s[2], window.location = r.replace(/\/?#issue\/.+/, "/" + n + "#issuecomment-" + e)) : void 0;
    });
}.call(this), function() {
    $(document).on("click", ".js-issues-sort .js-navigation-item", function() { return $(this).menu("deactivate"); }), $(function() {
        var t, e;
        return t = $("#issues_list"), t.length ? (e = function() { return $.pjax.reload(t); }, t.on("navigation:keydown", ".js-issues-list .js-list-browser-item", function(t) { return"x" === t.hotkey ? $(this).click().trigger("change") : void 0; }), t.selectableList(".js-selectable-issues", { wrapperSelector: ".js-list-browser-item", itemParentSelector: "", enableShiftSelect: !0, ignoreLinks: !0 }), t.on("click", ".js-milestone-issue-filter .js-navigation-item", function() { return $(this).menu("deactivate"); }), t.selectableList(".js-issue-sidebar .js-color-label-list"), t.on("click", ".js-editable-labels-container .js-manage-labels", function() {
            var t, n, s, r;
            return t = $(this), n = t.closest(".js-editable-labels-container"), r = n.find(".js-editable-labels-show"), s = n.find(".js-editable-labels-edit"), r.is(":visible") ? (r.hide(), s.show(), t.addClass("selected"), $(document).on("keydown.manage-labels", function(e) { return 27 === e.keyCode ? t.click() : void 0; })) : e(), !1;
        }), t.on("ajaxSuccess", ".js-color-label-delete", function() { return $(this).closest(".color-label").hide(); }), t.on("change", ".js-issues-list-select-all", function() {
            var e, n;
            return e = this.checked, n = e ? ":not(:checked)" : ":checked", t.find(".select-toggle-check" + n).prop("checked", e).trigger("change"), t.find(".js-mass-assign-button").toggleClass("disabled", !e), this.indeterminate = !1;
        }), t.on("change", ".select-toggle-check", function() {
            var e, n;
            return n = t.find(".js-list-browser-item.selected").length, e = t.find(".select-toggle-check:not(:checked)").length, t.find(".js-mass-assign-button").toggleClass("disabled", !n), $(".js-issues-list-select-all").get(0).indeterminate = n && e;
        }), t.find(":checked").removeProp("checked"), t.on("click", ".js-issues-list-close", function() {
            var n;
            return $.ajax({
                type: "PUT",
                url: $(this).attr("data-url"),
                data: {
                    issues: function() {
                        var e, s, r, a;
                        for (r = t.find(".js-issues-list :checked"), a = [], e = 0, s = r.length; s > e; e++)n = r[e], a.push($(n).val());
                        return a;
                    }()
                },
                success: e
            }), !1;
        }), t.on("ajaxSuccess", ".js-navigation-item", e), t.pageUpdate()) : void 0;
    });
}.call(this), function() {
    $(document).on("menu:activate", ".js-issue-mass-assign", function() {
        var t, e, n;
        t = $(this).find("form"), t.find(".js-issue-number").remove(), n = function() {
            var t, n, s, r;
            for (s = $(".js-issues-list-checkbox").filter(":checked"), r = [], t = 0, n = s.length; n > t; t++)e = s[t], r.push($("<input>", { type: "hidden", "class": "js-issue-number", name: "issues[]", value: $(e).val() }));
            return r;
        }(), t.append(n);
    }), $(document).on("ajaxSuccess", ".js-issue-mass-assign", function() { return $.pjax.reload($("#issues_list")); });
}.call(this), function() {
    $(document).on("click", ".js-new-issue-form .js-composer-labels", function(t) { return t.preventDefault(); }), $.pageUpdate(function() {
        var t, e, n, s;
        for (s = $(this).find(".js-new-issue-form"), e = 0, n = s.length; n > e; e++)t = s[e], $(t).data("selectable-list-installed") || ($(t).selectableList(".js-composer-labels"), $(t).data("selectable-list-installed", !0));
    });
}.call(this), function() {
    var t;
    $(document).on("selectmenu:selected", ".js-composer-assignee-picker .js-navigation-item", function() {
        var t, e, n;
        return t = $(this).closest(".js-infobar"), e = $(this).find("input[type=radio]"), n = $(this).hasClass("js-clear-assignee"), t.find(".js-composer-assignee-picker").toggleClass("is-showing-clear-item", !n), t.find(".js-assignee-infobar-item-wrapper").html(function() { return n ? "No one will be assigned" : "<a href='/" + e.val() + "' class='css-truncate-target'>" + e.val() + "</a> will be assigned"; });
    }), $(document).on("selectmenu:selected", ".js-assignee-picker .js-navigation-item", function() {
        var e, n = this;
        return e = $(this).closest("form"), t(e, {}, function() {
            var t, e;
            return t = $(n).closest(".js-assignee-picker"), e = $(n).hasClass("js-clear-assignee"), t.toggleClass("is-showing-clear-item", !e), $(".js-assignee-infobar-item-wrapper").html(function() {
                var t;
                return e ? "No one assigned" : (t = $(n).find("input[type=radio]"), "<a href='/" + t.val() + "' class='assignee css-truncate-target'>" + t.val() + "</a> is assigned");
            });
        });
    }), $(document).on("selectmenu:selected", ".js-composer-milestone-picker .js-navigation-item", function() {
        var t, e, n, s, r, a = this;
        return t = $(this).closest(".js-infobar"), s = $(this).find("input[type=radio]"), e = t.find('input[name="issue[milestone_id]"]'), n = t.find('input[name="new_milestone_title"]'), $(this).hasClass("js-new-item-form") ? (e.val("new"), n.val($(this).find(".js-new-item-name").html())) : e.val(s[0].value), r = $(this).hasClass("js-clear-milestone"), t.find(".js-composer-milestone-picker").toggleClass("is-showing-clear-item", !r), $(".js-composer-milestone-title").html(function() { return r ? "No milestone" : '<strong class="css-truncate-target">' + $(a).find(".js-milestone-title").html() + "</strong>"; });
    }), $(document).on("selectmenu:selected", ".js-milestone-picker .js-navigation-item", function() {
        var e, n = this;
        return e = $(this).closest("form"), t(e, {}, function(t) {
            var e, s, r;
            return s = $(n).closest(".js-milestone-picker"), r = $(n).hasClass("js-clear-milestone"), s.toggleClass("is-showing-clear-item", !r), e = $(".js-milestone-infobar-item-wrapper"), e.length ? (e.html(t.infobar_body), s.menu("deactivate"), s.find(".js-milestone-picker-body").html(t.select_menu_body)) : void 0;
        });
    }), $(document).on("ajaxSend", ".js-issue-list-label-select-menu", function() { return $(this).addClass("is-loading"); }), $(document).on("click", ".js-apply-labels", function() {
        var e, n = this;
        return e = $(this).closest("form"), t(e, { type: "put" }, function() { return $(n).menu("deactivate"); }), !1;
    }), $(document).on("click", ".js-remove-labels", function() {
        var e, n = this;
        return e = $(this).closest("form"), t(e, { type: "delete" }, function() { return $(n).menu("deactivate"); }), !1;
    }), $(document).on("selectmenu:selected", ".js-issue-show-label-select-menu .js-navigation-item", function() {
        var e, n, s;
        return e = $(this).closest("form"), n = $(this).find("input[type=checkbox]"), s = { type: n.is(":checked") ? "put" : "delete", data: { "issues[]": e.find(".js-issue-number").val(), "labels[]": n.val() } }, t(e, s, function(t) { return $(".discussion-labels > .color-label-list, .js-timeline-label-list").html(t.labels); }), !1;
    }), $(document).onFocusedKeydown(".js-issue-list-label-select-menu .js-filterable-field", function() { return function(t) { return"enter" === t.hotkey ? !1 : void 0; }; }), t = function(t, e, n) {
        var s;
        if (s = t[0])return $.ajax({ context: s, type: e.type || t.attr("method"), url: t.attr("action"), data: e.data || t.serialize(), success: n });
    };
}.call(this), function() {
    var t;
    t = function() {
        var t;
        return t = { div: "#keyboard_shortcuts_pane", ajax: "/site/keyboard_shortcuts?url=" + window.location.pathname }, $.facebox(t, "shortcuts");
    }, $(document).on("click", ".js-keyboard-shortcuts", function() { return t(), !1; }), $(document).on("click", ".js-see-all-keyboard-shortcuts", function() { return $(this).remove(), $(".facebox .js-hidden-pane").css("display", "table-row-group"), !1; }), $(document).on("keypress", function(e) { return e.target === document.body ? 63 === e.which ? ($(".facebox:visible").length ? $.facebox.close() : t(), !1) : void 0 : void 0; });
}.call(this), function() {
    $(document).on("ajaxSuccess", ".js-milestones-assign, .js-milestones-unassign", function() { return window.location.reload(); }), $(document).on("click", ".js-milestone-toggle-state", function() {
        var t, e;
        return e = $(this).val(), t = $(this).parents(".js-milestone-form"), t.find("#milestone_state").val(e);
    });
}.call(this), function() {
    var t;
    $.pageUpdate(t = function() {
        var t, e, n, s;
        for (s = $(this).find("input.js-date-input"), e = 0, n = s.length; n > e; e++)t = s[e], $(t).data("datePicker") || new DateInput(t);
    }), $(document).on("click", ".js-date-input-clear", function() { return $("input.js-date-input").data("datePicker").resetDate(), !1; });
}.call(this), function() {
    var t;
    t = function(t) { return $(t).is(".read") ? void 0 : $(t).toggleClass("unread read"); }, $(document).on("click", ".js-notification-target", function() { return t($(this).closest(".js-notification")); }), $(document).on("ajaxSuccess", ".js-delete-notification", function() { return t($(this).closest(".js-notification")); }), $(document).on("ajaxSuccess", ".js-mute-notification", function() {
        var e;
        return t($(this).closest(".js-notification")), e = $(this).closest(".js-notification"), this.action = e.is(".muted") ? this.action.replace("unmute", "mute") : this.action.replace("mute", "unmute"), e.toggleClass("muted");
    }), $(document).on("ajaxSuccess", ".js-mark-visible-as-read", function() {
        var t;
        return t = $(this).closest(".js-notifications-browser"), t.find(".unread").toggleClass("unread read"), t.find(".js-mark-as-read-confirmation").show();
    }), $(document).on("ajaxSuccess", ".js-mark-remaining-as-read", function() {
        var t;
        return t = $(this).closest(".js-notifications-browser"), t.find(".js-mark-remaining-as-read").hide(), t.find(".js-mark-remaining-as-read-confirmation").show();
    }), $(document).on("navigation:keydown", ".js-notification", function(t) {
        switch (t.hotkey) {
        case"I":
        case"e":
        case"y":
            return $(this).find(".js-delete-notification").submit(), !1;
        case"M":
        case"m":
            return $(this).find(".js-mute-notification").submit(), !1;
        }
    }), $(document).on("navigation:keyopen", ".js-notification", function() { return t(this); }), $(document).on("ajaxBeforeSend", ".js-notifications-subscription", function() { return $(this).find(".js-spinner").show(); }), $(document).on("ajaxComplete", ".js-notifications-subscription", function() { return $(this).find(".js-spinner").hide(); });
}.call(this), function() {
    $(document).on("change", '.oauth-section-next input[type="radio"]', function() {
        var t, e;
        return e = $(this).val(), t = $(this).closest(".js-details-container"), t.find(".js-sub-container").toggleClass("open", "limited" === e), t.removeClass("none default public full limited limited-email limited-follow read write via-public via-full"), t.addClass(e), "limited" === e ? ($(".oauth-section-next .js-limited-user").prop("checked", !0), t.addClass("limited-email limited-follow")) : void 0;
    }), $(document).on("change", ".oauth-section-next .js-limited-user", function() {
        var t, e;
        return e = $('.oauth-section-next input[name="granted_scope[user]"]:checked').val(), "limited" === e ? (t = $(this).closest(".js-details-container"), t.toggleClass($(this).data("option"), $(this).is(":checked"))) : void 0;
    }), $(document).on("change", ".oauth-section-next .js-delete-repo-scope", function() {
        var t;
        return t = $(this).closest(".js-details-container"), t.toggleClass("delete", $(this).is(":checked"));
    }), $(document).on("change", ".oauth-section-next .js-repo-status-scope", function() {
        var t;
        return t = $(this).closest(".js-details-container"), t.removeClass("full none"), t.addClass($(this).is(":checked") ? "full" : "none");
    }), $(document).on("change", ".oauth-section-next .js-notifications-scope", function() {
        var t;
        return t = $(this).closest(".js-details-container"), t.removeClass("read none"), t.addClass($(this).is(":checked") ? "read" : "none");
    }), $(document).on("change", ".oauth-section-next .js-gist-scope", function() {
        var t;
        return t = $(this).closest(".js-details-container"), t.removeClass("full none"), t.addClass($(this).is(":checked") ? "full" : "none");
    });
}.call(this), function() { $(document).on("click", ".js-orgs-next-coming-soon", function() { return alert("Coming Soon™"), !1; }), $(document).on("submit", ".org form[data-results-container]", function() { return!1; }); }.call(this), function() {
    $.pageUpdate(function() {
        var t;
        return t = {}, $(".js-activity-timestamp").each(function() {
            var e, n, s;
            return e = $(this), s = Date.parse(e.attr("data-timestamp")), s > moment().startOf("day")._d && (n = "Today"), s > moment().subtract("days", 1).startOf("day") && (n || (n = "Yesterday")), n || (n = "Previously"), t[n] ? void 0 : (t[n] = !0, e.text(n));
        });
    });
}.call(this), function() { $(document).on("ajaxSend", ".js-remove-member", function() { return $(this).closest(".js-removing").css({ opacity: .5 }), $(this); }), $(document).on("ajaxSuccess", ".js-remove-member", function() { return $(this).closest(".js-removing").remove(); }); }.call(this), function() {
    $(document).on("change", ".js-org-person-toggle", function() {
        var t, e, n, s, r, a, i, o, c;
        if (t = $(this).closest(".js-person-grid"), e = t.find(".js-org-person").has(".js-org-person-toggle:checked"), n = function() {
            var t, n, r;
            for (r = [], t = 0, n = e.length; n > t; t++)s = e[t], r.push($(s).attr("data-id"));
            return r;
        }(), r = n.length > 0, $(".js-member-selected-actions").toggleClass("hidden", !r), $(".js-member-not-selected-actions").toggleClass("hidden", r), $(".js-selected-person-ids").val(n.join(",")), 0 !== n.length && r) {
            for ($(".js-member-selected-actions button").addClass("hidden"), i = [], o = 0, c = e.length; c > o; o++)a = e[o], $(a).hasClass("js-public-member") && i.push(a);
            return i.length === n.length ? ($(".js-conceal-memberships button").removeClass("hidden"), void 0) : 0 === i.length ? ($(".js-publicize-memberships button").removeClass("hidden"), void 0) : $(".js-bulk-set-visiblity button").removeClass("hidden");
        }
    }), $(document).on("click", ".js-invite-member", function() { return $(".js-invite-member-field").toggleClass("is-active").focus(), !1; }), $(document).on("ajaxSuccess", ".js-remove-members-form", function(t, e, n, s) { return $(".js-org-section").prepend(s), $(".js-org-person").has(".js-org-person-toggle:checked").fadeOut(500, function() { return $(this).remove(), $(".js-org-person-toggle").fire("change"); }); }), $(document).on("click", ".js-confirm-removal .js-dismiss", function() { return $(this).closest(".js-confirm-removal").remove(), !1; }), $(document).on("click", ".js-confirm-removal .js-undo", function() { return alert("Coming Soon™"), !1; });
}.call(this), function() {
    $(document).on("click", ".js-show-all-team-suggestions", function() {
        var t = this;
        return $.get(this.href, function(e) { return $(t).closest("ul").html(e); }), !1;
    });
}.call(this), function() {
    $(document).onFocusedInput("#organization_login", function() {
        var t;
        return t = $(this).closest("dd").find(".js-field-hint-name"), function() { return t.text($(this).val()); };
    }), $(document).on("details:toggle", ".discussion-bubble-inner", function(t) { return $(t.relatedTarget).hasClass("is-jump-link") ? !1 : void 0; });
}.call(this), function() {
    $.pageUpdate(function() {
        var t;
        return t = $(".js-orgs-people-filter-list a:first").is(".selected"), $(".js-orgs-people-filter-list [data-container-id]").each(function() {
            var e;
            return e = $(document.getElementById($(this).attr("data-container-id"))), t ? e.addClass("is-showing-all") : $(this).is(".selected") ? void 0 : e.addClass("hidden");
        });
    }), $(document).on("filterable:change", ".js-member-search-name", function() {
        var t, e, n, s, r;
        for (e = 0, r = $(".js-orgs-people-filter-list .js-count"), n = 0, s = r.length; s > n; n++)t = r[n], e += Number($(t).text());
        return $(".js-orgs-people-filter-list .count:first").text(e);
    }), $(document).on("ajaxBeforeSend", ".js-revoke-invitation", function(t) { return $(t.target).before("<img class='js-spinner' src='" + GitHub.Ajax.spinner + "' width='16' />"); }), $(document).on("ajaxSuccess", ".js-revoke-invitation", function(t, e, n, s) { return $(".js-pending-invitations").html(s).pageUpdate(); }), $(document).on("click", ".js-orgs-people-filter-list a", function() {
        var t, e, n, s, r;
        return s = $(this), n = s.closest(".js-orgs-people-filter-list"), t = n.find("[data-container-id]").map(function() { return document.getElementById($(this).attr("data-container-id")); }), n.find("a.selected").removeClass("selected"), $(t).addClass("hidden"), s.addClass("selected"), (e = document.getElementById(s.attr("data-container-id"))) ? ($(e).removeClass("hidden"), $(e).removeClass("is-showing-all")) : ($(t).removeClass("hidden"), $(t).addClass("is-showing-all")), "function" == typeof(r = window.history).replaceState && r.replaceState(null, document.title, s.attr("href")), n.pageUpdate(), !1;
    });
}.call(this), function() {
    var t;
    $(document).on("member-adder:added", ".js-member", function(t) { return $(".js-member li").length > 1 && $(".js-member li:not(:last)").remove(), $(".js-add-member").val(""), $(t.target).find("input").removeAttr("disabled"), $(".js-new-member-form :submit").removeClass("disabled"); }), $(document).on("click", ".js-remove-suggestion", function(t) {
        var e, n, s, r, a;
        return r = $($(this).attr("data-suggestions")), e = $($(this).attr("data-adder")), t.preventDefault(), s = $(this).closest("li").attr("data-value"), $(this).closest("li").find("input").attr("disabled", !0), r.append($(this).closest("li").detach()), a = e.find("ul"), (n = a.data("fuzzy-sort-items")) ? (n.push(r.find("li[data-value='" + s + "']")[0]), a.data("fuzzy-sort-items", n)) : void 0;
    }), $(document).onFocusedKeydown(".js-add-member, .js-add-team, .js-add-repository", function() { return function(t) { return"ctrl+enter" === t.hotkey || "meta+enter" === t.hotkey ? ($(".js-new-member-form :submit").attr("disabled") || $(this).closest("form").submit(), !1) : void 0; }; }), t = null, $(document).on("change", ".js-member-permission", function(e) { return"admin" === $(e.target).val() ? (t = $(".js-billing-manager").prop("checked"), $(".js-billing-manager").prop("checked", !0), $(".js-billing-manager").prop("disabled", !0)) : ($(".js-billing-manager").prop("checked", t), $(".js-billing-manager").prop("disabled", !1)); }), $.pageUpdate(function() { return $(".js-add-member").focus(); });
}.call(this), function() { $(document).on("ajaxSuccess", ".js-update-member-form", function(t) { return $(t.target).find(".js-success").removeClass("hidden"); }), $(document).on("ajaxSend", ".js-update-member-form", function(t) { return $(t.target).find(".js-success").addClass("hidden"); }), $(document).on("member-adder:added", ".js-org-member-membership-list", function(t) { return $(t.target).find("input").removeAttr("disabled"); }); }.call(this), function() {
    $(document).on("ajaxBeforeSend", ".js-delete-team", function() { return $(this).addClass("disabled"); }), $(document).on("ajaxSuccess", ".js-delete-team", function() { return $(this).closest(".js-team").remove(); }), $(document).on("click", ".js-cancel-note", function() {
        var t, e;
        return e = $(this).closest(".js-uploadable-container"), e.removeClass("is-default"), $(".js-note-form", e).removeClass("active"), t = $(".js-note-body", e), t.css({ height: "1em" }), !1;
    }), $(document).on("focus", ".js-note-body", function() { return $(this).closest(".js-uploadable-container").addClass("is-default"), $(this).closest(".js-note-form").addClass("active"); }), $(document).on("ajaxBeforeSend", ".js-note-form", function() { return $(".js-note-body").val().trim() && !$(this).hasClass("is-submitting") ? $(this).addClass("is-submitting") : ($(".js-note-body").focus(), !1); }), $(document).on("ajaxSuccess", ".js-note-form", function(t, e, n, s) { return $(this).closest(".js-uploadable-container").removeClass("is-default"), $(this).removeClass("active"), $(this).removeClass("is-submitting"), $(".js-activity-list").prepend(s), $(".js-note-body", this).val(""), $(".js-note-body", this).css({ height: "1em" }); }), $(document).on("ajaxSuccess", ".js-delete-note", function() { return $(this).closest(".js-note").remove(); }), $(document).on("click", ".js-toggle-note-comments", function() {
        var t;
        return t = $(this).closest(".js-note"), $(".js-note-comments", t).toggleClass("active"), $(".js-comment-body", t).focus(), !1;
    }), $(document).on("focus", ".js-comment-body", function() { return $(this).closest(".js-note-comment-form").addClass("active"); }), $(document).on("ajaxBeforeSend", ".js-note-comment-form", function() { return $(".js-comment-body").val().trim() ? void 0 : ($(".js-comment-body").focus(), !1); }), $(document).on("ajaxSuccess", ".js-note-comment-form", function(t, e, n, s) {
        var r;
        return r = $(this).closest(".js-note"), $(".js-comment-list", r).append(s), $(".js-comment-body", r).val("");
    }), $(document).on("ajaxSuccess", ".js-delete-note-comment", function() { return $(this).closest(".js-note-comment").remove(), !1; }), $(document).on("click", ".js-toggle-note-star", function() {
        var t, e;
        return t = $(this), t.toggleClass("active"), e = t.next(".js-note-starred-users"), t.hasClass("active") ? (e.prepend($("<img class='starred-user' src='https://github.com/" + e.data("login") + ".png' />")), $.ajax({ url: t.data("star-path"), method: "POST" })) : (e.find("img[src*=" + e.data("login") + "]").remove(), $.ajax({ url: t.data("unstar-path"), method: "POST" })), !1;
    });
}.call(this), function() {
    $(document).on("ajaxSuccess", ".js-edit-team-description", function() { return $(".js-team-description").text($(".edit-team-description :text").val()), $(this).closest(".js-details-container").removeClass("open"); }), $(document).onFocusedInput(".js-edit-team-name", function() {
        return function() {
            var t;
            return t = /[^0-9A-Za-z_\.]/g, $(this).val($(this).val().replace(t, "-"));
        };
    });
}.call(this), function() {
    $(document).on("click", ".js-show-own-teams", function() {
        var t, e, n, s;
        return t = $(".js-team-search-field"), s = t.val(), n = $(this).attr("data-me"), -1 === s.indexOf("@" + n) && (e = s ? " " : "", t.val("" + s + e + "@" + n), t.focus(), t.trigger("throttled:input")), !1;
    });
}.call(this), function() {
    $(document).on("throttled:input", ".js-orgs-next-new-team", function() {
        var t, e, n = this;
        return t = $(this).closest("form"), t.addClass("is-sending"), t.find(".octicon").attr("class", "octicon hidden"), e = $.get($(this).attr("data-check-url"), { name: this.value }), e.done(function(e) { return t.removeClass("is-sending"), e ? $(".js-orgs-next-team-name-errors").html(e) : $(".js-orgs-next-team-name-errors").html(""), t.find(".js-error").length || !n.value.trim() ? $(".js-create-team-button").attr("disabled", "disabled") : $(".js-create-team-button").removeAttr("disabled"), t.find(".js-error").length ? t.find(".octicon").attr("class", "octicon octicon-alert") : n.value.trim() ? t.find(".octicon").attr("class", "octicon octicon-check") : void 0; });
    }), $(document).on("submit", ".js-orgs-next-new-team-form", function() { return $(this).find(".js-error").length ? !1 : $(".js-orgs-next-new-team").val().trim() ? void 0 : !1; });
}.call(this), function() {
    $(document).on("click", ".js-add-to-team-link", function() { return $(this).parents(".js-team-members").toggleClass("adding-member"), $(this).toggleClass("selected"), $(".js-add-member").focus(), !1; }), $(document).on("click", ".js-toggle-team-controls", function() { return $(".js-team-control-popover").toggleClass("hidden"), !1; }), $(document).on("submit", ".js-team-no-member-result-suggestion", function() {
        var t = this;
        return GitHub.withSudo(function() {
            var e, n;
            return e = $(t), n = $.post(e.attr("action"), $(t).serialize()), n.done(function() { return $(".js-find-member").val("").trigger("throttled:input"); });
        }), !1;
    }), $(document).on("submit", ".js-remove-team-members-form", function() {
        var t = this;
        return GitHub.withSudo(function() {
            var e, n;
            return e = $(t), n = $.post(e.attr("action"), $(t).serialize()), n.done(function() { return e.closest(".js-edit-team-member").remove(); });
        }), !1;
    });
}.call(this), function() {
    $(document).on("filterable:change", ".js-team-search-name", function() { return $(".js-team-list:visible").hasClass("filterable-empty") ? $(".js-details-container").addClass("no-results") : $(".js-details-container").removeClass("no-results"); }), $(document).onFocusedInput(".js-new-team-name", function() {
        return function() {
            var t, e, n;
            return t = $(this), e = /[^0-9A-Za-z_\.]/g, n = $(".js-warning", t.closest(".js-create-team")), $(".js-actual-team-name").val(t.val().replace(e, "-")), t.val() ? (n.html("Will be created as <code>" + t.val().replace(e, "-") + "</code>"), e.test(t.val()) ? n.is(":visible") ? void 0 : n.fadeIn(200) : n.fadeOut(200)) : void 0;
        };
    }), $(document).on("click", ".js-toggle-all-teams", function() { return $(".js-all-teams").toggle(), $(".js-your-teams").toggle(), $(".js-team-search-name").toggle(), !1; }), $(document).on("click", ".js-show-more-members", function() { return $(this).closest(".js-meta").toggleClass("show-all"), !1; });
}.call(this), function() {
    $(function() {
        var t;
        return $("#load-readme").click(function() {
            var e, n, s, r, a, i;
            return n = $("#gollum-editor-body"), e = $("#editor-body-buffer"), r = $("#undo-load-readme"), i = e.text(), t(n, e), s = $(this), s.prop("disabled", !0), s.text(s.data("readme-name") + " loaded"), r.show(), a = function() { return $(this).val() !== i && r.hide(), n.off("change keyup", a); }, n.on("change keyup", a), !1;
        }), $("#undo-load-readme").click(function() {
            var e;
            return t($("#gollum-editor-body"), $("#editor-body-buffer")), e = $("#load-readme"), e.prop("disabled", !1), e.text("Load " + e.data("readme-name")), $(this).hide(), !1;
        }), t = function(t, e) {
            var n, s, r;
            return n = $(t), s = $(e), r = n.val(), n.val(s.text()), s.text(r);
        };
    });
}.call(this), function() {
    $.pageUpdate(function() {
        return $(".js-profile-to-repo-search")[0] ? $(document).on("submit", ".js-profile-to-repo-search", function() {
            var t, e, n;
            return t = $(".js-profile-to-repo-search").data("login"), n = $("#your-repos-filter").val(), e = "@" + t + " " + n, -1 === n.search("@" + t) ? $("#your-repos-filter").val(e) : void 0;
        }) : void 0;
    });
}.call(this), function() {
    $(document).on("ajaxSuccess", ".js-cleanup-pull-request", function(t, e, n, s) {
        var r, a, i;
        i = s.updateContent;
        for (a in i)r = i[a], $(a).updateContent(r);
    }), $(document).on("ajaxError", ".js-cleanup-pull-request", function(t, e) { return $(this).addClass("error"), $(this).closest(".js-deletable-state").removeClass("mergeable-merged").addClass("mergeable-error"), e.responseText && $(this).find(".js-cleanup-error-message").html(e.responseText), !1; });
}.call(this), function() {
    $(document).on("details:toggled", "#js-pull-merging", function() {
        var t;
        return t = $(this).find(".js-merge-pull-request"), t.toggleClass("js-dirty", t.is(":visible"));
    }), $(document).on("ajaxSuccess", ".js-merge-pull-request", function(t, e, n, s) {
        var r, a, i;
        this.reset(), $(this).removeClass("js-dirty"), i = s.updateContent;
        for (a in i)r = i[a], $(a).updateContent(r);
    }), $(document).on("ajaxError", ".js-merge-pull-request", function(t, e) { return $(this).addClass("error"), $(this).closest(".js-mergable-state").removeClass("mergeable-clean").addClass("mergeable-error"), e.responseText && $(this).find(".js-merge-error-message").text(e.responseText), !1; });
}.call(this), function() {
    $(document).on("ajaxSend", ".js-restore-head-ref", function() { return $(this).addClass("is-restoring"); }), $(document).on("ajaxComplete", ".js-restore-head-ref", function() { return $(this).removeClass("is-restoring"); }), $(document).on("ajaxSuccess", ".js-restore-head-ref", function(t, e, n, s) {
        var r, a, i;
        i = s.updateContent;
        for (a in i)r = i[a], $(a).updateContent(r);
    }), $.pageUpdate(function() {
        var t, e;
        t = $(".js-cleanup-pull-request"), e = $(".js-restore-head-ref"), e.hide(), t.length || e.last().show();
    });
}.call(this), function() {
    $(document).on("click", ".js-pull-request-tab", function(t) {
        var e, n, s, r, a, i;
        if (2 === t.which || t.metaKey)return!0;
        if (e = $("#" + $(this).attr("data-container-id")), e.length) {
            for (i = $(".js-pull-request-tab.selected"), r = 0, a = i.length; a > r; r++)n = i[r], $(n).removeClass("selected"), $("#" + $(n).attr("data-container-id")).removeClass("is-visible");
            return e.addClass("is-visible"), $(this).addClass("selected"), "function" == typeof(s = window.history).replaceState && s.replaceState(null, document.title, this.href), !1;
        }
    }), $.hashChange(function(t) { return $(t.target).closest(".js-details-container").addClass("open"); }), $(document).on("ajaxSuccess", ".js-inline-comment-form", function() { return $(this).closest("#discussion_bucket").length ? $("#files_bucket").remove() : $("#discussion_bucket").remove(); }), $(document).on("socket:message", ".js-pull-request-tabs", function() { $(this).ajax(); }), $(document).on("ajaxSuccess", ".js-pull-request-tabs", function(t, e, n, s) {
        var r;
        return r = $($.parseHTML(s)), $(this).find("#commits_tab_counter").replaceWith(r.find("#commits_tab_counter")), $(this).find("#files_tab_counter").replaceWith(r.find("#files_tab_counter")), $(this).pageUpdate();
    }), $(document).on("socket:message", ".js-pull-request-stale-files", function() { return $("#files_bucket").addClass("is-stale").pageUpdate(); });
}.call(this), function() {
    $(document).on("change", ".js-pulse-period", function(t) {
        var e;
        return e = $(t.target).attr("data-url"), $.pjax({ url: e, container: "#js-repo-pjax-container" });
    });
}.call(this), function() {
    $(document).on("navigation:open", ".js-create-branch", function() { return $(this).submit(), !1; }), $(document).on("navigation:open", ".js-create-tag", function() {
        var t, e, n, s, r, a;
        return e = $(this), s = $(".js-select-button"), n = $(".js-spinner"), t = $(".js-error"), r = $(".js-new-item-value").val(), a = $(".js-create-tag").attr("data-url"), s.text("Creating tag..."), n.show(), t.hide(), $.ajax({
            url: a,
            type: "POST",
            data: { tag_name: r },
            success: function() {
                var t, n;
                return s.text(r), n = e.closest(".select-menu-list").find(".select-menu-item-template"), n.length ? (t = n.clone().removeClass("select-menu-item-template").addClass("selected"), t.insertBefore(n), t.find(".js-select-button-text").text(r)) : void 0;
            },
            complete: function() { return n.hide(); },
            error: function() { return t.show(), s.text("No tag selected"); }
        }), !1;
    });
}.call(this), function() {
    var t, e, n, s, r, a, i;
    $(document).on("click", ".js-releases-field a.remove", function() {
        var t;
        return t = $(this).closest("li"), t.addClass("delete"), t.find("input.destroy").val("true"), !1;
    }), $(document).on("click", ".js-releases-field a.undo", function() {
        var t;
        return t = $(this).closest("li"), t.removeClass("delete"), t.find("input.destroy").val(""), !1;
    }), $(document).on("click", ".js-timeline-tags-expander", function() { return $(this).closest(".js-timeline-tags").removeClass("is-collapsed"); }), s = ["is-default", "is-saving", "is-saved", "is-failed"], r = function(t, e) { return t.removeClass(s.join(" ")), t.addClass(e), "is-saving" === e ? t.attr("disabled", "disabled") : t.removeAttr("disabled"); }, $(document).on("click", ".js-save-draft", function(t, e) {
        var s, a, i, o, c, l;
        return $("#release_draft").val("1"), s = $(this), o = s.closest("form"), i = $("#delete_release_confirm form"), c = o.data("repo-url"), l = o.attr("action"), a = o.serialize(), r(s, "is-saving"), $.ajax({
            url: l,
            type: "POST",
            data: a,
            dataType: "json",
            success: function(t) {
                var a, l;
                return l = n("tag", c, t.tag_name), o.attr("action", l), i.attr("action", l), window.history.replaceState(null, document.title, n("edit", c, t.tag_name)), a = $("#release_id"), a.val() || (a.val(t.id), o.append('<input type="hidden" id="release_method" name="_method" value="put" />')), r(s, "is-saved"), setTimeout(function() { return r(s, "is-default"); }, 5e3), e ? e() : void 0;
            },
            complete: function() {},
            error: function() { return r(s, "is-failed"); }
        }), t.preventDefault();
    }), $(document).on("click", ".js-publish-release", function() { return $("#release_draft").val("0"); }), i = ["is-loading", "is-empty", "is-valid", "is-invalid", "is-duplicate", "is-pending"], a = function(t) {
        var e;
        switch (t) {
        case"is-valid":
            $(".release-target-wrapper").addClass("hidden");
            break;
        case"is-loading":
            break;
        default:
            $(".release-target-wrapper").removeClass("hidden");
        }
        return e = $(".js-release-tag"), e.removeClass(i.join(" ")), e.addClass(t);
    }, t = function(t) { return t.val() && t.val() !== t.attr("data-last-checked") ? (a("is-loading"), $.ajax({ url: t.attr("data-url"), type: "GET", data: { tag_name: t.val() }, dataType: "json", success: function(e) { return"duplicate" === e.status && parseInt(t.attr("data-existing-id")) === parseInt(e.release_id) ? (a("is-valid"), void 0) : ($(".js-release-tag .js-edit-release-link").attr("href", e.url), a("is-" + e.status)); }, error: function() { return a("is-invalid"); }, complete: function() { return t.attr("data-last-checked", t.val()); } })) : void 0; }, n = function(t, e, n) { return"" + e + "/releases/" + t + "/" + n; }, $(document).on("blur", ".js-release-tag-field", function() { return t($(this)); }), $(e = function() { return t($(".js-release-tag-field")); });
}.call(this), function() {
    var t;
    t = function() {

        function t() {
            var e = this;
            this.validate = function() { return t.prototype.validate.apply(e, arguments); }, this.updateUpsell = function() { return t.prototype.updateUpsell.apply(e, arguments); }, this.selectedPrivacyToggleElement = function() { return t.prototype.selectedPrivacyToggleElement.apply(e, arguments); }, this.handlePrivacyChange = function(n, s) { return null == n && (n = e.selectedPrivacyToggleElement()), null == s && (s = null), t.prototype.handlePrivacyChange.apply(e, arguments); }, this.handleOwnerChange = function() { return t.prototype.handleOwnerChange.apply(e, arguments); }, this.elements = { ownerContainer: $(".js-owner-container"), iconPreviewPublic: $(".js-icon-preview-public"), iconPreviewPrivate: $(".js-icon-preview-private"), upgradeUpsell: $("#js-upgrade-container").hide(), upgradeConfirmationCheckbox: $(".js-confirm-upgrade"), upsells: $(".js-upgrade"), privacyToggles: $(".js-privacy-toggle"), privateRadio: $(".js-privacy-toggle[value=false]"), publicRadio: $(".js-privacy-toggle[value=true]"), repoNameField: $("input[type=text].js-repo-name"), form: $("#new_repository"), licenseContainer: $(".js-license-container"), ignoreContainer: $(".js-ignore-container"), autoInitCheckbox: $(".js-auto-init-checkbox"), teamBoxes: $(".js-team-select"), suggestion: $(".js-reponame-suggestion") }, this.current_login = $("input[name=owner]:checked").prop("value"), this.privateRepo = !1, this.autocheckURL = this.elements.repoNameField.attr("data-autocheck-url"), this.changedPrivacyManually = !1, this.elements.teamBoxes.hide(), this.elements.ignoreContainer.on("change", "input[type=radio]", function() { return $(".js-auto-init-checkbox").prop("checked", !0); }), this.elements.licenseContainer.on("change", "input[type=radio]", function() { return $(".js-auto-init-checkbox").prop("checked", !0); }), this.elements.ownerContainer.on("change", "input[type=radio]", this.handleOwnerChange), this.elements.privacyToggles.on("change", function(t) { return e.handlePrivacyChange(t.targetElement, t); }), this.elements.repoNameField.on("change input", function(t) { return $(t.target).removeClass("is-autocheck-successful"), e.validate(); }), this.elements.upgradeUpsell.on("change input", "input", this.validate), this.elements.form.on("repoform:validate", this.validate), this.elements.suggestion.on("click", function(t) {
                var n;
                return n = e.elements.repoNameField, n.val($(t.target).text()), n.trigger("change");
            }), this.handleOwnerChange(), this.updateUpsell(), this.validate();
        }

        return t.prototype.handleOwnerChange = function() {
            var t, e, n;
            return this.current_login = $("input[name=owner]:checked").prop("value"), e = "" + this.autocheckURL + "?owner=" + encodeURIComponent(this.current_login), this.elements.repoNameField.attr("data-autocheck-url", e), this.elements.repoNameField.trigger("change"), n = this.elements.ownerContainer.find(".select-menu-item.selected"), this.elements.teamBoxes.hide().find("input, select").prop("disabled", !0), t = this.elements.teamBoxes.filter("[data-login=" + this.current_login + "]"), t.show().find("input, select").prop("disabled", !1), this.changedPrivacyManually || ("private" === n.attr("data-default") ? this.elements.privateRadio.prop("checked", "checked").change() : this.elements.publicRadio.prop("checked", "checked").change()), this.handlePrivacyChange(), "yes" === n.attr("data-permission") ? ($(".with-permission-fields").show(), $(".without-permission-fields").hide(), $(".errored").show(), $("dl.warn").show()) : ($(".with-permission-fields").hide(), $(".without-permission-fields").show(), $(".errored").hide(), $("dl.warn").hide()), this.updateUpsell();
        }, t.prototype.handlePrivacyChange = function(t, e) { return null == t && (t = this.selectedPrivacyToggleElement()), null == e && (e = null), e && !e.isTrigger && (this.changedPrivacyManually = !0), "false" === t.val() ? (this.privateRepo = !0, this.elements.upgradeUpsell.show(), this.elements.upgradeUpsell.find("input[type=checkbox]").prop("checked", "checked"), this.elements.iconPreviewPublic.hide(), this.elements.iconPreviewPrivate.show()) : (this.privateRepo = !1, this.elements.upgradeUpsell.hide(), this.elements.upgradeUpsell.find("input[type=checkbox]").prop("checked", null), this.elements.form.attr("action", this.elements.form.attr("data-url")), this.elements.iconPreviewPrivate.hide(), this.elements.iconPreviewPublic.show()), this.validate(); }, t.prototype.selectedPrivacyToggleElement = function() { return this.elements.privateRadio.is(":checked") ? this.elements.privateRadio : this.elements.publicRadio; }, t.prototype.updateUpsell = function() {
            var t;
            return t = this.elements.upsells.filter("[data-login=" + this.current_login + "]"), this.elements.upgradeUpsell.html(t);
        }, t.prototype.validate = function() {
            var t, e, n;
            return t = this.elements.form, n = !0, this.elements.repoNameField.is(".is-autocheck-successful") || (n = !1), t.find("dl.form.errored").length && (n = !1), t.find(".is-autocheck-loading").length && (n = !1), e = this.elements.upgradeUpsell.find("input[type=checkbox]"), this.privateRepo && e.length && !e.is(":checked") && (n = !1), $("button.primary").prop("disabled", !n);
        }, t;
    }(), $(function() { return $(".page-new-repo").length ? new t : void 0; }), $(document).on("autocheck:send", "#repository_name", function() { $(this).trigger("repoform:validate"); }), $(document).on("autocheck:complete", "#repository_name", function() { return $(this).trigger("repoform:validate"); }), $(document).on("autocheck:success", "#repository_name", function(t, e) {
        var n, s, r;
        return s = $(this).val(), s && s !== e.name ? (n = $(this).closest("dl.form"), n.addClass("warn"), r = $("<dd>").addClass("warning").text("Will be created as " + e.name), n.append(r)) : void 0;
    }), $(document).on("menu:activated", ".js-ignore-container", function() {
        var t, e;
        return t = $(this).find(".js-menu-content"), e = t.overflowOffset(), e.bottom <= -10 ? t.css({ marginTop: e.bottom - 20 }) : void 0;
    });
}.call(this), function() {
    var t;
    $(document).on("pjax:end", function() {
        var t, e, n, s, r, a, i, o, c, l;
        if (s = $(document.head).find("meta[name='selected-link']").attr("value"), null != s)for (e = $(".js-repository-container-pjax .js-selected-navigation-item").removeClass("selected"), r = 0, i = e.length; i > r; r++)for (t = e[r], l = null != (c = $(t).attr("data-selected-links")) ? c.split(" ") : void 0, a = 0, o = l.length; o > a; a++)n = l[a], n === s && $(t).addClass("selected");
    }), $(document).on("click", ".js-repo-home-link, .js-repository-container-pjax a", function(t) {
        var e, n;
        if (!$(this).hasClass("js-disable-pjax"))return n = !1, e = $("#js-repo-pjax-container"), $.pjax.click(t, { container: e, scrollTo: n });
    }), t = function() {
        var t;
        return t = null != document.getElementById("js-show-full-navigation"), $(".repository-with-sidebar").toggleClass("with-full-navigation", t);
    }, $(function() {
        var e;
        return(e = document.getElementById("js-repo-pjax-container")) ? t(e) : void 0;
    }), $(document).on("pjax:end", "#js-repo-pjax-container", function() { return t(this); }), $(document).on("tipsy:show", ".js-repo-nav", function() { return!$(this).closest(".repository-with-sidebar").hasClass("with-full-navigation"); }), $(document).on("click", ".js-directory-link", function(t) { return 2 === t.which || t.metaKey || t.ctrlKey ? void 0 : ($(this).closest("tr").addClass("is-loading"), $(document.body).addClass("disables-context-loader")); }), $(document).on("pjax:click", ".js-octicon-loaders a", function() {
        var t = this;
        return $(this).addClass("is-loading"), $(document).one("pjax:end", function() { return $(t).removeClass("is-loading"); });
    }), $(function() {
        var t;
        return t = $(".mini-nav, .repo-container .menu"), t.length ? $.each(t, function(t, e) { return new FastClick(e); }) : void 0;
    });
}.call(this), function() {
    $(document).on("click", ".repository-tree", function(t) {
        var e, n;
        return n = $(t.target).closest(".repository-tree").is(this), e = $(t.target).is("a"), n && !e ? $(this).toggleClass("expanded") : void 0;
    }), $.pageUpdate(function() { return $(".repository-files .selected").each(function() { return $(this).parents(".repository-tree").addClass("expanded"); }); });
}.call(this), function() {
    $(document).onFocusedInput(".js-repository-name", function() {
        var t, e, n;
        return e = /[^0-9A-Za-z_\.]/g, n = $(".js-form-note"), t = $(".js-rename-repository-button"), function() { n.html("Will be renamed as <code>" + this.value.replace(e, "-") + "</code>"), e.test(this.value) ? n.is(":hidden") && n.fadeIn() : this.value || n.fadeOut(), this.value && this.value !== $(this).attr("data-original-name") ? t.prop("disabled", !1) : t.prop("disabled", !0); };
    });
}.call(this), function() {
    $(document).on("click", ".js-hook-target", function(t) { return $(".js-hook-target").parents("li").removeClass("selected"), $(this).parents("li").addClass("selected"), $(".js-hook-group").hide(), $(this.hash).show().scrollTo(), t.preventDefault(); }), $(document).on("click", ".js-test-hook", function(t) {
        var e, n, s;
        return e = $(this), s = e.prev(".js-test-hook-message"), s.text("Sending payload..."), n = e.attr("data-test-service-url"), $.ajax({ type: "POST", url: n, data: { name: e.attr("rel") || "" }, success: function() { return s.text("Test payload deployed!"); }, error: function() { return s.text("Error sending test payload."); } }), t.preventDefault();
    }), $(document).on("click", ".js-add-postreceive-url", function(t) {
        var e;
        return e = $(this).prev("dl.form").clone(), e.find("input").val(""), $(this).before(e), t.preventDefault();
    }), $(document).on("click", ".js-remove-postreceive-url", function(t) { return $(this).closest(".fields").find("dl.form").length < 2 ? (alert("You cannot remove the last post-receive URL"), !1) : ($(this).closest("dl.form").remove(), t.preventDefault()); });
}.call(this), function() {}.call(this), function() {
    $(document).on("ajaxSend", ".js-action-ldap-create", function() { return $(this).find(".minibutton").addClass("disabled"); }), $(document).on("ajaxComplete", ".js-action-ldap-create", function(t, e) {
        var n, s;
        return n = $(this), s = 500 === e.status ? "Oops, something went wrong." : e.responseText, n.find(".js-message").show().html(" &ndash; " + s), !1;
    });
}.call(this), function() {
    $(document).on("ajaxSend", ".js-action-pull", function() { return $(this).find(".minibutton").not(".disabled").addClass("reenable disabled"); }), $(document).on("ajaxComplete", ".js-action-pull", function(t, e) {
        var n, s, r;
        return n = $(this), r = $(t.target), 200 === e.status && (r.hasClass("close") || r.hasClass("open") ? $.pjax.reload($("#js-pjax-container")) : n.find(".reenable").removeClass("reenable disabled")), s = 500 === e.status ? "Oops, something went wrong." : e.responseText, n.find(".js-message").show().html(s), !1;
    });
}.call(this), function() {
    $.support.pjax && $(document).on("submit", ".js-stars-search", function(t) {
        var e;
        return(e = $(this).closest("[data-pjax-container]")[0]) ? $.pjax.submit(t, { container: e }) : void 0;
    });
}.call(this), function() {
    $(function() {
        var t;
        return $(".js-styleguide-ace")[0] ? (t = new GitHub.CodeEditor(".js-styleguide-ace"), $(".js-styleguide-themes").change(function() { return t.setTheme($(this).find(":selected").val()); })) : void 0;
    }), $(document).on("click", ".js-styleguide-octicon-facebox", function(t) {
        var e, n, s;
        return t.preventDefault(), s = $(this).data("octicon-glyph"), n = $(this).data("octicon-name"), e = $(".js-octicon-facebox-template").html(), e = e.replace(/classnamegoeshere/g, n), e = e.replace(/glyphgoeshere/g, s), jQuery.facebox(e), $(document).pageUpdate();
    }), $(function() { return $(".js-octicons-search-field")[0] ? $(".js-octicons-search-field").focus() : void 0; });
}.call(this), function() { $(document).on("ajaxBeforeSend", ".js-auto-subscribe-toggle", function() { return $(this).find("label").append('<img src="' + GitHub.Ajax.spinner + '" width="16" />'); }), $(document).on("ajaxError", ".js-auto-subscribe-toggle", function() { return $(this).find("label img").remove(), $(this).find("label").append('<img src="/images/modules/ajax/error.png">'); }), $(document).on("ajaxSuccess", ".js-auto-subscribe-toggle", function() { return $(this).find("label img").remove(); }), $(document).on("ajaxBeforeSend", ".js-unignore-form, .js-ignore-form", function() { return $(this).closest(".subscription-row").addClass("loading"); }), $(document).on("ajaxError", ".js-unignore-form, .js-ignore-form", function() { return $(this).closest(".subscription-row").removeClass("loading"), $(this).find(".minibutton").addClass("danger").attr("title", "There was a problem unignoring this repo."); }), $(document).on("ajaxSuccess", ".js-unignore-form", function() { return $(this).closest(".subscription-row").removeClass("loading").addClass("unsubscribed"); }), $(document).on("ajaxSuccess", ".js-ignore-form", function() { return $(this).closest(".subscription-row").removeClass("loading unsubscribed"); }), $(document).on("ajaxBeforeSend", ".js-unsubscribe-form, .js-subscribe-form", function() { return $(this).closest(".subscription-row").addClass("loading"); }), $(document).on("ajaxError", ".js-unsubscribe-form, .js-subscribe-form", function() { return $(this).closest(".subscription-row").removeClass("loading"), $(this).find(".minibutton").addClass("danger").attr("title", "There was a problem with unsubscribing :("); }), $(document).on("ajaxSuccess", ".js-unsubscribe-form", function() { return $(this).closest(".subscription-row").removeClass("loading").addClass("unsubscribed"); }), $(document).on("ajaxSuccess", ".js-subscribe-form", function() { return $(this).closest(".subscription-row").removeClass("loading unsubscribed"); }), $(document).on("ajaxSuccess", ".js-thread-subscription-status", function(t, e, n, s) { return $(".js-thread-subscription-status").updateContent(s); }); }.call(this), GitHub.Team = function(t) { this.url = window.location.pathname, this.orgUrl = this.url.split(/\/(teams|invite)\//)[0], t && (this.url = this.orgUrl + "/teams/" + t); }, GitHub.Team.prototype = {
    name: function() { return $("#team-name").val(); },
    newRecord: function() { return!/\/invite/.test(location.pathname) && !/\d/.test(location.pathname); },
    repos: function() { return $.makeArray($(".repositories li:visible a span").map(function() { return $(this).text(); })); },
    addRepo: function(t, e) {
        return debug("Adding repo %s", t), !t || $.inArray(t, this.repos()) > -1 ? !1 : (that = this, GitHub.withSudo(function() {
            that.addRepoAjax(t);
            var n = $(".repositories").find("li:first").clone(), s = n.find("input[type=hidden]");
            return n.find("a:first").attr("href", "/" + t).find("span").text(t), n.find(".remove-repository").attr("data-repo", t), "private" === e ? (n.addClass("private"), n.find("span.octicon").removeClass("octicon-repo").addClass("octicon-lock")) : (n.addClass("public"), n.find("span.octicon").addClass("octicon-repo")), s.length > 0 && s.val(t).attr("disabled", !1), $(".repositories").append(n.show()), !0;
        }), void 0);
    },
    addRepoAjax: function(t) { this.newRecord() || (debug("Ajaxily adding %s", t), $.post(this.url + "/repo/" + t)); },
    removeRepo: function(t) {
        if (debug("Removing %s", t), !t || -1 == $.inArray(t, this.repos()))return!1;
        var e = $(".repositories li:visible a").filter(function() { return $(this).find("span").text() == t; }), n = function() { e.parents("li:first").remove(); }, s = function() { e.parent().find(".remove-repository").show().removeClass("remove").html('<img class="dingus" src="/images/modules/ajax/error.png">').end().find(".spinner").hide(); };
        return this.newRecord() ? n() : (e.parent().find(".remove-repository").after('<img class="dingus spinner" src="/images/spinners/octocat-spinner-64.gif" width="32" />').hide(), this.removeRepoAjax(t, n, s)), !0;
    },
    removeRepoAjax: function(t, e, n) { this.newRecord() || (debug("Ajaxily removing %s", t), $.ajax({ type: "DELETE", url: this.url + "/repo/" + t, success: e, error: n })); },
    users: function() { return $.makeArray($(".usernames li:visible").map(function() { return $(this).find("a:first").text(); })); },
    addUser: function(t) {
        return debug("Adding %s", t), !t || $.inArray(t, this.users()) > -1 ? !1 : (that = this, GitHub.withSudo(function() {
            that.addUserAjax(t);
            var e = $(".usernames").find("li:first").clone(), n = e.find("input[type=hidden]");
            return e.find("img").attr("src", "/" + t + ".png"), e.find("a:first").attr("href", "/" + t).text(t), n.length > 0 && n.val(t).attr("disabled", !1), $(".usernames").append(e.show()), !0;
        }), void 0);
    },
    removeUser: function(t) {
        if (debug("Removing %s", t), !t || -1 == $.inArray(t, this.users()))return!1;
        var e = $(".usernames li:visible a:contains(" + t + ")"), n = function() { e.parents("li:first").remove(); };
        return this.newRecord() ? n() : (e.parent().find(".remove-user").spin().remove(), $("#spinner").addClass("remove"), this.removeUserAjax(t, n)), !0;
    },
    addUserAjax: function(t) { this.newRecord() || (debug("Ajaxily adding %s", t), $.post(this.url.replace("/invite", "") + "/member/" + t)); },
    removeUserAjax: function(t, e) { this.newRecord() || (debug("Ajaxily removing %s", t), $.ajax({ type: "DELETE", url: this.url + "/member/" + t, success: e })); }
}, $(function() {
    if ($(".js-team")[0]) {
        var t = new GitHub.Team($(".js-team").data("team")), e = $(".add-username-form input"), n = $(".add-repository-form input"), s = $(".add-username-form button"), r = $(".add-repository-form button"), a = e.attr("data-organization-id"), i = null;
        e.on("autocomplete:search", function() {
            i && i.abort();
            var t = $(this).val();
            if ("" === t)return $("#add-user-autocomplete ul").empty(), $("#add-user-autocomplete").trigger("autocomplete:change"), void 0;
            if (a)var e = "/autocomplete/users?organization_id=" + a;
            else var e = "/autocomplete/users?organization_id=";
            i = $.ajax({ type: "GET", data: { q: t }, url: e, dataType: "html", success: function(t) { i = null, $("#add-user-autocomplete ul").html(t), $("#add-user-autocomplete").trigger("autocomplete:change"); } });
        }), e.on("autocomplete:autocompleted:changed", function() { e.attr("data-autocompleted") ? s.removeAttr("disabled") : s.attr("disabled", "disabled"); }), n.on("autocomplete:search", function() {
            i && i.abort();
            var e = $(this).val();
            return"" === e ? ($("#add-repo-autocomplete ul").empty(), $("#add-repo-autocomplete").trigger("autocomplete:change"), void 0) : (i = $.ajax({ type: "GET", data: { q: e, limit: 10 }, url: t.orgUrl + "/autocomplete/repos", dataType: "html", success: function(t) { i = null, $("#add-repo-autocomplete ul").html(t), $("#add-repo-autocomplete").trigger("autocomplete:change"); } }), void 0);
        }), n.on("autocomplete:autocompleted:changed", function() { n.attr("data-autocompleted") ? r.removeAttr("disabled") : r.attr("disabled", "disabled"); }), $(document).on("click", ".remove-repository", function() { return t.removeRepo($(this).attr("data-repo")), !1; }), $(document).on("click", ".remove-user", function() { return t.removeUser($(this).prev().text()), !1; }), $(".add-username-form button").click(function() {
            var e = $(this).parent(), n = e.find(":text"), s = n.val();
            return debug("Trying to add %s...", s), s && n.attr("data-autocompleted") ? (n.val(""), t.addUser(s), !1) : !1;
        }), $(".js-team").on("submit", function() {
            var t = $(document.activeElement);
            return t.is(".add-username-form input") ? (t.closest(".add-username-form").find("button").click(), !1) : void 0;
        });
        var o, c = function() { o = $(this).attr("data-visibility"); };
        $("#add-repo-autocomplete").on("navigation:open", "[data-autocomplete-value]", c), $(".add-repository-form button").click(function() {
            var e = $(this).parent(), n = e.find(":text"), s = n.val();
            return debug("Trying to add %s...", s), s && n.attr("data-autocompleted") ? (n.val(""), t.addRepo(s, o), !1) : !1;
        }), $(".js-team").on("submit", function() {
            var t = $(document.activeElement);
            return t.is(".add-repository-form input") ? (t.closest(".add-repository-form").find("button").click(), !1) : void 0;
        });
    }
}), function() {
    $(document).on("click", ".remove-team", function() {
        var t;
        return confirm("Are you POSITIVE you want to remove this team?") ? (t = $(this).parents("li.team"), $.ajax({ type: "DELETE", url: this.href, success: function() { return t.remove(); } }), $(this).spin().remove(), !1) : !1;
    });
}.call(this), function() {
    var t, e, n, s, r;
    n = function(t) {
        return setTimeout(function() {
            var e, n, r, a, i;
            for (a = $(".js-tree-finder-field"), i = [], n = 0, r = a.length; r > n; n++)e = a[n], e.value = t, i.push(s(e));
            return i;
        }, 0);
    }, r = null, s = function(t, e) {
        var n, a, i, o, c, l, u, d, h, f, m, p;
        if (d = document.getElementById($(t).attr("data-results"))) {
            if (!(i = $(d).data("tree-finder-list")))return null == r && (r = $.ajax({ url: $(d).attr("data-url"), cache: !0, success: function(e) { return $(d).data("tree-finder-list", e.paths), s(t); }, complete: function() { return r = null; } })), void 0;
            for (h = $(d).find(".js-tree-browser-result-template").html(), l = $(d).find(".js-tree-finder-results"), null == e && (e = $(t).val()), e ? (o = $.fuzzyRegexp(e), u = $.fuzzySort(i, e)) : u = i, u = u.slice(0, 50), n = function() {
                var t, e, n;
                for (n = [], t = 0, e = u.length; e > t; t++)a = u[t], n.push(h.replace(/\$presentationPath/g, a).replace(/\$path/g, encodeURI(a) + window.location.search));
                return n;
            }(), l.html(n), p = l.find(".tree-browser-result a"), f = 0, m = p.length; m > f; f++)c = p[f], $.fuzzyHighlight(c, e, o);
            l.navigation("focus");
        }
    }, $(document).onFocusedKeydown(".js-tree-finder-field", function(t) { return s(this), $(this).on("throttled:input." + t, function() { return s(this); }), function(t) { return"esc" === t.hotkey ? (history.back(), t.preventDefault()) : void 0; }; }), t = function() {
        var t;
        return t = $("<textarea>").css({ position: "fixed", top: 0, left: 0, opacity: 0 }), $(document.body).append(t), t.focus(), function() { return t.blur().remove().val(); };
    }, e = null, $(document).on("pjax:click", ".js-show-file-finder", function() { return e = t(); }), $(document).on("pjax:end", "#js-repo-pjax-container", function() {
        var t;
        return e ? ((t = e()) && n(t), e = null) : void 0;
    }), $.pageUpdate(function() {
        var t, e, n, r;
        for (r = $(this).find(".js-tree-finder-field"), e = 0, n = r.length; n > e; e++)t = r[e], s(t);
    });
}.call(this), function() {
    var t, e, n, s, r;
    s = function() { return $("body").addClass("is-sending"), $("body").removeClass("is-sent is-not-sent"); }, r = function() { return $("body").addClass("is-sent"), $("body").removeClass("is-sending"); }, n = function(t) { return t.responseText.length && $(".js-sms-error").text(t.responseText), $("body").addClass("is-not-sent"), $("body").removeClass("is-sending"); }, t = function(t) { return s(), $.ajax({ url: t, type: "POST", success: r, error: n }), !1; }, $(document).on("click", ".js-resend-auth-code", function() { return t("/sessions/two_factor/resend"); }), $(document).on("click", ".js-send-fallback-auth-code", function() { return t("/sessions/two_factor/send_fallback"); }), $(document).on("click", ".js-send-two-factor-code", function() {
        var t, e, a;
        return t = $(this).closest("form"), e = t.find(".js-country-code-select").val(), e += t.find(".js-sms-number").val(), a = t.find(".js-two-factor-secret").val(), t.find("input, button, select").prop("disabled", !0), s(), $.ajax({
            url: "/settings/two_factor_authentication/send_sms",
            type: "POST",
            data: { number: e, two_factor_secret: a },
            success: function() { return r(), t.find(".js-2fa-enable").prop("disabled", !1), t.find(".js-2fa-confirm").prop("disabled", !0), t.find(".js-2fa-otp").focus(); },
            error: function(e) {
                return n(e), t.find(".js-2fa-enable").prop("disabled", !0), t.find(".js-2fa-confirm").prop("disabled", !1);
            }
        }), !1;
    }), $(document).on("click", "button.js-2fa-enable", function() {
        var t;
        return t = $(this).closest("form"), t.find("input, button, select").prop("disabled", !1);
    }), $(document).on("click", ".js-set-two-factor-fallback", function() {
        var t, n, s;
        return t = $(this).closest(".form"), n = t.find(".js-fallback-country-code-select").val(), s = t.find(".js-sms-fallback").val(), e(n, s);
    }), e = function(t, e) { return $("body").addClass("is-setting"), $("body").removeClass("is-set is-not-set"), "" !== e && (e = t + " " + e), $.ajax({ url: "/settings/two_factor_authentication/backup_number", type: "POST", data: { number: e }, success: function() { return $("body").addClass("is-set"), $("body").removeClass("is-setting"), "" === e ? $(".set-message").html("Removed!") : $(".set-message").html("Set! You should receive a confirmation SMS shortly."); }, error: function(t) { return t.responseText.length && $(".js-fallback-error-message").text(t.responseText), $("body").addClass("is-not-set"), $("body").removeClass("is-setting"); } }), !1; }, $(document).on("ajaxBeforeSend", ".js-add-yubicat", function() { return $(this).find("input").prop("disabled", !0); }), $(document).on("ajaxSuccess", ".js-yubicat-box", function() { return $(this).find(".js-yubicat-error").hide(), $(this).find(".js-add-yubicat input").prop("disabled", !1); }), $(document).on("ajaxError", ".js-yubicat-box", function(t, e) {
        var n;
        return $(this).find(".js-add-yubicat input").prop("disabled", !1).val(""), n = $(this).find(".js-yubicat-error"), 422 === e.status && "" !== e.responseText.replace(/\s/, "") ? n.html(e.responseText) : n.html("There was an error. Refresh the page and try again."), n.show(), !1;
    }), $(document).on("ajaxSuccess", ".js-delete-yubicat", function() { return $(this).closest("li").remove(); }), $(document).on("ajaxSuccess", ".js-add-yubicat", function() {
        var t, e, n, s, r;
        return e = $(this).find("input"), s = e.val().slice(0, 12), e.val(""), n = $(this).closest("ul").find(".js-yubicat-template").clone(), t = n.find("a"), r = t.attr("href").replace("deviceId", s), t.attr("href", r), n.find("code").html(s), n.removeClass("yubicat-template"), $(this).closest("li").before(n);
    });
}.call(this), function() { $(document).on("click", ".js-toggle-recovery", function() { return $(".recovery-codes").toggleClass("is-hidden"), $('form[action="/sessions/two_factor"]').toggleClass("is-hidden"); }); }.call(this), function() {
    $(document).on("ajaxSend", ".js-restore-user", function() { return $(this).find(".minibutton").addClass("disabled"); }), $(document).on("ajaxComplete", ".js-restore-user", function(t, e) {
        var n, s;
        return n = $(this), n.addClass("error"), s = 500 === e.status ? "Oops, something went wrong." : e.responseText, n.find(".js-message").show().html(s), !1;
    });
}.call(this), function() {
    $(document).on("click", ".js-user-sessions-revoke", function() {
        var t = this;
        return GitHub.withSudo(function() { return $.ajax({ type: "DELETE", url: t.href }).done(function() { return $(t).closest("li").remove(); }); }), !1;
    });
}.call(this), function() {
    var t, e, n, s, r, a, i, o, c;
    i = ["is-render-pending", "is-render-ready", "is-render-loading", "is-render-loaded"].reduce(function(t, e) { return"" + t + " " + e; }), a = function(t) {
        var e;
        return e = t.data("timing"), null != e ? (e.load = e.hello = e.loading = e.loaded = e.ready = null, e.helloTimer && (clearTimeout(e.helloTimer), e.helloTimer = null), e.loadTimer ? (clearTimeout(e.loadTimer), e.loadTimer = null) : void 0) : void 0;
    }, n = function(t) {
        var e, n, s;
        if (!t.data("timing"))return e = 10, n = 45, s = { load: null, hello: null, loading: null, loaded: null, ready: null, helloTimer: null, loadTimer: null }, s.load = Date.now(), s.helloTimer = setTimeout(c(t, function() { return!s.hello; }), 1e3 * e), s.loadTimer = setTimeout(c(t), 1e3 * n), t.data("timing", s);
    }, o = function(t) {
        var e, n, s, r;
        if (t.length && (s = t.data("timing")) && (null == s.untimed || !s.untimed) && (e = t.find("iframe")).length && (r = e.get(0).contentWindow) && null != r.postMessage)return n = { type: "render:timing", body: { timing: s, format: t.data("type") } }, r.postMessage(JSON.stringify(n), "*");
    }, t = function(t) {
        var e, n, s, r;
        if (r = t.data("timing"))return o(t), e = r.hello - r.load, n = r.loading - r.hello, s = r.loaded - r.loading, debug("Render init delay: " + e + "ms Render ready: " + n + "ms Load Time: " + s + "ms");
    }, r = function(t) { return t.addClass("is-render-requested"); }, s = function(t, e) { return t.removeClass(i), t.addClass("is-render-failed"), null != e && t.addClass("is-render-failed-" + e), a(t); }, c = function(t, e) {
        return null == e && (e = function() { return!0; }), function() {
            var n;
            if (t.is(":visible") && !t.hasClass("is-render-ready") && !t.hasClass("is-render-failed") && !t.hasClass("is-render-failed-fatally") && e())return(n = t.data("timing")) ? (debug("Render timeout: " + JSON.stringify(n) + " Now: " + Date.now()), s(t)) : debug("No timing data on $:", t);
        };
    }, $.pageUpdate(function() {
        return $(this).find(".js-render-target").each(function() {
            var t, e;
            return t = $(this), (null != (e = t.data("timing")) ? e.load : 0) ? void 0 : (a(t), n(t), t.find(".render-viewer-trigger").length ? t.find(".render-viewer-trigger").on("click", function(e) { return e.preventDefault(), r(t); }) : (t.addClass("is-render-automatic"), r(t)));
        });
    }), e = function(t) {
        var e;
        return e = ".js-render-target", t ? $("" + e + "[data-identity='" + t + "']") : $(e);
    }, $(window).on("message", function(n) {
        var r, o, c, l, u, d, h, f, m, p, g, v, $;
        if (g = n.originalEvent, c = g.data, d = g.origin, c && d && (v = function() {
            try {
                return JSON.parse(c);
            } catch (t) {
                return c;
            }
        }(), p = v.type, l = v.identity, o = v.body, h = v.payload, p && o && 1 === (r = e(l)).length && (f = r.data("timing") || { untimed: !0 }) && d === r.data("host") && "render" === p))
            switch (o) {
            case"hello":
                if (f.hello = Date.now(), f.loading = f.loaded = null, u = { type: "render:cmd", body: { cmd: "branding", branding: !1 } }, m = null != ($ = r.find("iframe").get(0)) ? $.contentWindow : void 0, "function" == typeof m.postMessage && m.postMessage(JSON.stringify(u), "*"), r.data("local"))return u = { type: "render:data", body: window.editor.code() }, "function" == typeof m.postMessage ? m.postMessage(JSON.stringify(u), "*") : void 0;
                break;
            case"error":
                return s(r);
            case"error:fatal":
                return s(r, "fatal");
            case"loading":
                return r.removeClass(i), r.addClass("is-render-loading"), f.loading = Date.now();
            case"loaded":
                return r.removeClass(i), r.addClass("is-render-loaded"), f.loaded = Date.now();
            case"ready":
                if (r.removeClass(i), r.addClass("is-render-ready"), f.ready = Date.now(), null != (null != h ? h.height : void 0) && r.height(h.height), null == f.untimed || !f.untimed)return t(r), a(r);
                break;
            default:
                return debug("Unknown message [" + p + "]=>'" + o + "'");
            }
    });
}.call(this), function() {
    var t;
    $(document).on("click", ".js-toggle-lang-stats", function(t) {
        var e, n;
        return $(".js-stats-switcher-viewport").toggleClass("is-revealing-lang-stats"), n = $(this).attr("original-title"), e = "", e = n.match("Show") ? n.replace("Show", "Hide") : n.replace("Hide", "Show"), $(".js-toggle-lang-stats").attr("title", e), $(this).trigger("mouseover"), t.preventDefault();
    }), $.observe(".js-dark-ship-traffic-graphs", t = function(t) {
        var e, n;
        return t = $(t), n = t.attr("data-url"), e = t.attr("data-data-url"), $.when($.ajax(n), $.ajax(e)).then(function(t, e) { return t[1] === !1 ? console.log("robot error") : console.log("robot good"), e[1] === !1 ? console.log("robot data error") : console.log("robot data good"); });
    });
}.call(this), function() {
    $(document).on("click", ".js-notification-global-toggle", function() {
        var t, e, n;
        return n = $(this).attr("data-url"), t = this.checked, e = {}, e[this.name] = t ? "1" : "0", $.ajax({ url: $(this).attr("data-url"), type: "PUT", data: e, success: function() { return t ? $(this).parent("p").removeClass("ignored") : $(this).parent("p").addClass("ignored"); } });
    }), $(document).on("change", ".js-notifications-settings input[type=checkbox]", function() {
        var t;
        return t = $(this), t.parents("li").append('<img class="spinner" src="' + GitHub.Ajax.spinner + '" width="16" />'), $.ajax({ url: t.parents(".js-notifications-settings").attr("data-toggle-url"), type: "POST", data: t.parents(".js-notifications-settings").serialize(), complete: function() { return t.parents("li").find("img").remove(); } });
    }), $(document).on("ajaxSend", ".js-remove-item", function() { return $(this).spin().hide(); }), $(document).on("ajaxComplete", ".js-remove-item", function() { return $(this).parents("li").stopSpin(); }), $(document).on("ajaxSuccess", ".js-remove-item", function() { return $(this).parents("li").remove(); }), $(document).on("ajaxSuccess", ".js-toggle-visibility", function(t, e, n, s) { return $("#settings-emails").children(".settings-email.primary").toggleClass("private", "private" === s.visibility); }), $(document).on("ajaxSend", ".js-remove-key", function() { return $(this).addClass("disabled").find("span").text("Deleting…"); }), $(document).on("ajaxError", ".js-remove-key", function() { return $(this).removeClass("disabled").find("span").text("Error. Try again."); }), $(document).on("ajaxSuccess", ".js-remove-key", function() { return $(this).parents("li").remove(), 0 === $(".js-ssh-keys-box li").length ? $(".js-no-ssh-keys").show() : void 0; }), $(document).on("click", ".js-leave-collaborated-repo", function(t) {
        var e, n, s, r;
        return e = $(t.currentTarget), s = e.closest("[data-repo]").attr("data-repo"), r = $('ul.repositories li[data-repo="' + s + '"]'), n = e.parents("div.full-button"), n.html('<img src="' + GitHub.Ajax.spinner + '" width="16" />'), $.ajax({ url: "/account/leave_repo/" + s, type: "POST", success: function() { return $.facebox.close(), r.fadeOut(); }, error: function() { return n.html('<img src="/images/modules/ajax/error.png">'); } }), !1;
    }), $(document).on("ajaxError", ".js-name-change-in-progress", function() { return $(".js-name-change-in-progress").hide(), $(".js-name-change-error").show(); }), $(document).on("ajaxSuccess", ".js-unsubscribe-from-newsletter form", function() { return $(".js-unsubscribe-from-newsletter .message").toggle(); }), $(document).on("click", ".js-show-new-ssh-key-form", function() { return $(".js-new-ssh-key-box").toggle().find(":text").focus(), !1; }), $(document).on("ajaxSuccess", ".js-update-note-form", function(t, e) { return $(this).closest("li").replaceWith(e.responseText); }), $(document).on("keydown", ".js-api-token-input", function(t) { return"esc" === t.hotkey ? $(this).siblings(".js-cancel-note").click() : void 0; }), $(document).on("click", ".js-edit-token-note", function() { return $(this).closest("li").find('input[type="text"]').focus(); }), $(document).on("ajaxSuccess", ".js-remove-user-api-token", function() {
        var t;
        return t = $(this).closest(".boxed-group"), 1 === t.find("li").length ? t.removeClass("has-access-tokens") : void 0;
    }), $(document).on("click", ".js-delete-oauth-application-image", function() {
        var t, e, n;
        return t = $(this).closest(".js-uploadable-container"), t.removeClass("has-uploaded-logo"), e = t.find("img.js-image-field"), n = t.find("input.js-oauth-application-logo-id"), e.attr("src", ""), n.val(""), !1;
    }), $.pageUpdate(function() { return $(this).find("dl.autosave").each(function() { return $(this).autosaveField(); }); }), $(document).on("click", ".section-head", function() { return $(".section-nav").slideUp(200).addClass("collapsed"), $(this).next(".section-nav").slideDown(200).removeClass("collapsed"); }), $(document).on("click", ".js-user-rename-warning-continue", function() { return $(".js-user-rename-warning, .js-user-rename-form").toggle(), !1; });
}.call(this), function() {
    $(document).on("submit", "#signup_form", function() { return $("#signup_button").attr("disabled", !0).find("span").text("Creating your GitHub account..."); }), $.observe(".js-plan-choice:checked", { add: function() { return $(this).closest(".plan-row").addClass("selected"); }, remove: function() { return $(this).closest(".plan-row").removeClass("selected"); } }), $.observe(".js-plan-row.selected", {
        add: function() {
            var t;
            return t = $(this).find(".js-choose-button"), t.text(t.attr("data-selected-text"));
        },
        remove: function() {
            var t;
            return t = $(this).find(".js-choose-button"), t.text(t.attr("data-default-text"));
        }
    }), $.observe(".js-plan-row.free-plan.selected", {
        add: function() {
            var t;
            return t = $("#js-signup-billing-fields"), t.data("contents", t.contents().detach());
        },
        remove: function() {
            var t, e;
            return t = $("#js-signup-billing-fields"), e = t.data("contents"), t.append(e);
        }
    }), $.observe(".js-setup-organization:checked", {
        add: function() {
            var t;
            return t = $(".js-choose-plan-submit"), t.attr("data-default-text") || t.attr("data-default-text", t.text()), t.text(t.attr("data-org-text"));
        },
        remove: function() {
            var t;
            return t = $(".js-choose-plan-submit"), t.text(t.attr("data-default-text"));
        }
    });
}.call(this), function() {
    $(document).on("click", ".js-approve-ssh-key", function() {
        var t;
        return t = $(this), t.addClass("disabled").find("span").text("Approving…"), $.ajax({ url: t.attr("href"), type: "POST", success: function() { return t.parents("li").addClass("approved"); }, error: function() { return t.removeClass("disabled").find("span").text("Error. Try Again"); } }), !1;
    }), $(document).on("click", ".js-reject-ssh-key", function() {
        var t;
        return t = $(this), t.addClass("disabled").find("span").text("Rejecting…"), $.ajax({ url: t.attr("href"), type: "DELETE", success: function() { return t.parents("li").addClass("rejected"); }, error: function() { return t.removeClass("disabled").find("span").text("Error. Try Again"); } }), !1;
    });
}.call(this), function() {
    !$.support.pjax || location.search || location.hash || $(function() {
        var t, e, n;
        return t = null != (n = document.getElementById("issues-dashboard")) ? n : document.getElementById("issues_list"), (e = $(t).attr("data-url")) ? window.history.replaceState(null, document.title, e) : void 0;
    });
}.call(this), $.pageUpdate(function() {

    function t(t, e) {
        var n, s, r, a, i, o, c, l, u, d, h, f = Math.min(t.canvas.width, e.canvas.width), m = Math.min(t.canvas.height, e.canvas.height), p = t.getImageData(0, 0, f, m), g = e.getImageData(0, 0, f, m), v = p.data, $ = g.data, y = $.length;
        for (r = 0; y > r; r += 4)n = v[r + 3] / 255, s = $[r + 3] / 255, d = n + s - n * s, $[r + 3] = 255 * d, a = v[r] / 255 * n, c = $[r] / 255 * s, i = v[r + 1] / 255 * n, l = $[r + 1] / 255 * s, o = v[r + 2] / 255 * n, u = $[r + 2] / 255 * s, h = 255 / d, $[r] = (a + c - 2 * Math.min(a * s, c * n)) * h, $[r + 1] = (i + l - 2 * Math.min(i * s, l * n)) * h, $[r + 2] = (o + u - 2 * Math.min(o * s, u * n)) * h;
        e.putImageData(g, 0, 0);
    }

    if ($("#files .image").length) {
        var e = $("#files .file:has(.onion-skin)"), n = [];
        $.each(e, function(s) {

            function r() {
                if (M++, o(), M >= A) {
                    var t = d.find(".progress");
                    t.is(":visible") ? t.fadeOut(250, function() { i(); }) : (t.hide(), i());
                }
            }

            function a(t) {
                var e = _.find(".active"), n = _.find(".active").first().index(), s = T.eq(n), r = _.children().eq(t);
                if (0 == r.hasClass("active") && 0 == r.hasClass("disabled")) {
                    if (e.removeClass("active"), r.addClass("active"), r.is(":visible")) {
                        var a = r.position(), i = r.outerWidth(), o = String(a.left + i / 2) + "px 0px";
                        _.css("background-image", "url(/images/modules/commit/menu_arrow.gif)"), _.css("background-position", o);
                    }
                    M >= 2 && (animHeight = parseInt(T.eq(t).css("height")) + 127, d.css("height", animHeight), s.animate({ opacity: "hide" }, 250, "swing", function() { T.eq(t).fadeIn(250); }));
                }
            }

            function i() {
                var e = 858, r = Math.max(B.width, P.width), i = Math.max(B.height, P.height), o = 0, g = 1;
                B.marginHoriz = Math.floor((r - B.width) / 2), B.marginVert = Math.floor((i - B.height) / 2), P.marginHoriz = Math.floor((r - P.width) / 2), P.marginVert = Math.floor((i - P.height) / 2), $.each($.getUrlVars(), function(t, e) { e == d.attr("id") && (diffNum = parseInt(e.replace(/\D*/g, "")), D = $.getUrlVar(e)[0], o = $.getUrlVar(e)[1] / 100, n[diffNum].view = $.getUrlVar(e)[0], n[diffNum].pct = $.getUrlVar(e)[1], n[diffNum].changed = !0); });
                var v = 1;
                r > (e - 30) / 2 && (v = (e - 30) / 2 / r), y.attr({ width: B.width * v, height: B.height * v }), b.attr({ width: P.width * v, height: P.height * v }), h.find(".deleted-frame").css({ margin: B.marginVert * v + "px " + B.marginHoriz * v + "px", width: B.width * v + 2, height: B.height * v + 2 }), h.find(".added-frame").css({ margin: P.marginVert * v + "px " + P.marginHoriz * v + "px", width: P.width * v + 2, height: P.height * v + 2 }), h.find(".aWMeta").eq(0).text(P.width + "px"), h.find(".aHMeta").eq(0).text(P.height + "px"), h.find(".dWMeta").eq(0).text(B.width + "px"), h.find(".dHMeta").eq(0).text(B.height + "px"), P.width != B.width && (h.find(".aWMeta").eq(0).addClass("a-green"), h.find(".dWMeta").eq(0).addClass("d-red")), P.height != B.height && (h.find(".aHMeta").eq(0).addClass("a-green"), h.find(".dHMeta").eq(0).addClass("d-red"));
                var T, A = 1;
                r > e - 12 && (A = (e - 12) / r), T = 0, T = r * A + 3, j.attr({ width: B.width * A, height: B.height * A }), x.attr({ width: P.width * A, height: P.height * A }), f.find(".deleted-frame").css({ margin: B.marginVert * A + "px " + B.marginHoriz * A + "px", width: B.width * A + 2, height: B.height * A + 2 }), f.find(".added-frame").css({ margin: P.marginVert * A + "px " + P.marginHoriz * A + "px", width: P.width * A + 2, height: P.height * A + 2 }), f.find(".swipe-shell").css({ width: r * A + 3 + "px", height: i * A + 4 + "px" }), f.find(".swipe-frame").css({ width: r * A + 18 + "px", height: i * A + 30 + "px" }), f.find(".swipe-bar").css("left", o * T + "px"), d.find(".swipe .swipe-shell").css("width", T - T * o), f.find(".swipe-bar").on("mousedown", function(t) {
                    var e = $(this), r = $(this).parent(), a = r.width() - e.width();
                    t.preventDefault(), $("body").css({ cursor: "pointer" }), $(document).on("mousemove.swipe", function(t) {
                        t.preventDefault();
                        var i = t.clientX - r.offset().left;
                        0 > i && (i = 0), i > a && (i = a), e.css({ left: i });
                        var o = Math.round(1e4 * (i / (parseInt(d.find(".swipe-frame").css("width")) - 15))) / 1e4;
                        d.find(".swipe .swipe-shell").css("width", T - T * o), n[s].pct = 100 * o, n[s].changed = !0;
                    }), $(document).on("mouseup.swipe", function() { $(document).off(".swipe"), $("body").css({ cursor: "auto" }), c(); });
                });
                var M = 1;
                r > e - 12 && (M = (e - 12) / r), w.attr({ width: B.width * M, height: B.height * M }), C.attr({ width: P.width * M, height: P.height * M }), m.find(".deleted-frame").css({ margin: B.marginVert * M + "px " + B.marginHoriz * M + "px", width: B.width * M + 2, height: B.height * M + 2 }), m.find(".added-frame").css({ margin: P.marginVert * M + "px " + P.marginHoriz * M + "px", width: P.width * M + 2, height: P.height * M + 2 }), m.find(".onion-skin-frame").css({ width: r * M + 4 + "px", height: i * M + 30 + "px" }), d.find(".dragger").css("left", 262 * g + "px"), d.find(".onion-skin .added-frame").css("opacity", g), d.find(".onion-skin .added-frame img").css("opacity", g), d.find(".dragger").on("mousedown", function(t) {
                    var e = $(this), r = $(this).parent(), a = r.width() - e.width();
                    t.preventDefault(), $("body").css({ cursor: "pointer" }), $(document).on("mousemove.dragger", function(t) {
                        t.preventDefault();
                        var i = t.clientX - r.offset().left;
                        0 > i && (i = 0), i > a && (i = a), e.css({ left: i });
                        var o = Math.round(100 * (i / 262)) / 100;
                        d.find(".onion-skin .added-frame").css("opacity", o), d.find(".onion-skin .added-frame img").css("opacity", o), n[s].pct = 100 * o, n[s].changed = !0;
                    }), $(document).on("mouseup.dragger", function() { $(document).off(".dragger"), $("body").css({ cursor: "auto" }), c(); });
                });
                var E = 1;
                r > e - 4 && (E = (e - 4) / r), k.attr({ width: r * E, height: i * E }), S.attr({ width: r * E, height: i * E }), p.find(".added-frame").css({ width: r * E + 2, height: i * E + 2 }), p.find(".deleted-frame").css({ width: r * E + 2, height: i * E + 2 }), l.drawImage(B, B.marginHoriz * E, B.marginVert * E, B.width * E, B.height * E), u.drawImage(P, P.marginHoriz * E, P.marginVert * E, P.width * E, P.height * E), t(u, l), h.css("height", i * v + 30), f.css("height", i * A + 30), m.css("height", i * A + 30), p.css("height", i * A + 30), _.children().removeClass("disabled"), a(D);
            }

            function o() {
                var t = 100 * (M / A) + "%";
                d.find(".progress-bar").animate({ width: t }, 250, "swing");
            }

            function c() {
                var t = "?";
                $.each(n, function(e, n) { 1 == n.changed && (0 != e && (t += "&"), t += "diff-" + e + "=" + n.view + "-" + Math.round(n.pct)); }), window.history && window.history.replaceState && window.history.replaceState({}, "", t);
            }

            if (!$(this).data("image-diff-installed")) {
                var l, u, d = e.eq(s), h = d.find(".two-up").eq(0), f = d.find(".swipe").eq(0), m = d.find(".onion-skin").eq(0), p = d.find(".difference").eq(0), g = d.find(".deleted"), v = d.find(".added"), y = g.eq(0), b = v.eq(0), j = g.eq(1), x = v.eq(1), w = g.eq(2), C = v.eq(2), k = d.find("canvas.deleted").eq(0), S = d.find("canvas.added").eq(0), _ = d.find("ul.view-modes-menu"), T = d.find(".view"), D = 0, A = d.find(".asset").length, M = 0, B = new Image, P = new Image;
                n.push({ name: d.attr("id"), view: 0, pct: 0, changed: !1 }), $(this).data("image-diff-installed", !0), l = k[0].getContext("2d"), u = S[0].getContext("2d"), d.find(".two-up").hide(), d.find(".two-up p").removeClass("hidden"), d.find(".progress").removeClass("hidden"), d.find(".view-modes").removeClass("hidden"), B.src = d.find(".deleted").first().attr("src"), P.src = d.find(".added").first().attr("src"), y.attr("src", B.src).load(function() { r(); }), b.attr("src", P.src).load(function() { r(); }), j.attr("src", B.src).load(function() { r(); }), x.attr("src", P.src).load(function() { r(); }), w.attr("src", B.src).load(function() { r(); }), C.attr("src", P.src).load(function() { r(); });
                var E = !0;
                _.children("li").click(function() {
                    var t = $(this).index();
                    1 != t && 2 != t || !E || (E = !1), a(t), n[s].view = t, n[s].changed = !0, c();
                }), $.extend({
                    getUrlVars: function() {
                        for (var t, e = [], n = window.location.href.slice(window.location.href.indexOf("?") + 1).split("&"), s = 0; s < n.length; s++)t = n[s].split("="), t[1] && (t[1] = t[1].split("-")), e.push(t[0]), e[t[0]] = t[1];
                        return e;
                    },
                    getUrlVar: function(t) { return $.getUrlVars()[t]; }
                });
            }
        });
    }
}), $(function() {

    function t() {
        var n = $("#current-version").val();
        n && $.get("_current", function(s) { n == s ? setTimeout(t, 5e3) : e || ($("#gollum-error-message").text("Someone has edited the wiki since you started. Please reload this page and re-apply your changes."), $("#gollum-error-message").show(), $("#gollum-editor-submit").attr("disabled", "disabled"), $("#gollum-editor-submit").attr("value", "Cannot Save, Someone Else Has Edited")); });
    }

    $("#see-more-elsewhere").click(function() { return $(".seen-elsewhere").show(), $(this).remove(), !1; });
    var e = !1;
    $("#gollum-editor-body").each(t), $("#gollum-editor-submit").click(function() { e = !0; });
    var n = [];
    $("form#history input[type=submit]").attr("disabled", !0), $("form#history input[type=checkbox]").change(function() {
        var t = $(this).val(), e = $.inArray(t, n);
        if (e > -1)n.splice(e, 1);
        else if (n.push(t), n.length > 2) {
            var s = n.shift();
            $("input[value=" + s + "]").prop("checked", !1);
        }
        if ($("form#history tr.commit").removeClass("selected"), $("form#history input[type=submit]").attr("disabled", !0), 2 == n.length) {
            $("form#history input[type=submit]").attr("disabled", !1);
            var r = !1;
            $("form#history tr.commit").each(function() { r && $(this).addClass("selected"), $(this).find("input:checked").length > 0 && (r = !r), r && $(this).addClass("selected"); });
        }
    });
});