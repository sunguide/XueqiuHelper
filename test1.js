!function e(t, s, i) {
    function n(o, r) {
        if (!s[o]) {
            if (!t[o]) {
                var l = "function" == typeof require && require;
                if (!r && l)return l(o, !0);
                if (a)return a(o, !0);
                var c = new Error("Cannot find module '" + o + "'");
                throw c.code = "MODULE_NOT_FOUND", c
            }
            var d = s[o] = {exports: {}};
            t[o][0].call(d.exports, function (e) {
                var s = t[o][1][e];
                return n(s || e)
            }, d, d.exports, e, t, s, i)
        }
        return s[o].exports
    }

    for (var a = "function" == typeof require && require, o = 0; o < i.length; o++)n(i[o]);
    return n
}({
    1: [function (e, t, s) {
        "use strict";
        function i(e, t, s, i) {
            if (!t.toGroup) {
                var n = jQuery.ajax({
                    url: r.getBaseUrl() + "/v2/sessions/" + s + "-0.json?user_id=" + window.SNOWMAN_USER.id,
                    type: "GET",
                    timeout: 2e4
                });
                return n.done(function (s) {
                    0 !== s.unreadCount && s.unreadCount--;
                    var n = e.sessions.add(s, {newsession: !0});
                    i && _.isFunction(i) && i(e, t, n)
                }), n.fail(function () {
                    i && _.isFunction(i) && i(e, t, null)
                }), n
            }
            var a = t.toGroupRef, o = {
                ownerId: a.ownerId,
                ownerRef: window.SNOWMAN_USER,
                summary: t.summary,
                targetGroup: !0,
                targetGroupRef: a,
                targetId: a.id,
                timestamp: t.timestamp - 1
            }, l = e.sessions.add(o, {newsession: !0});
            i && _.isFunction(i) && i(e, t, l)
        }

        function n(e, t, s) {
            if (!s)return !1;
            var i = s.messages;
            if (s.set("activeFlag", !0), "SYSTEM_EVENT" !== t.messageType) {
                new RegExp("^" + SNB.im.nid).test(t.sequenceId) || i.add(t)
            } else {
                var n, a, o, r;
                try {
                    n = $.parseJSON(t.plain)
                } catch (e) {
                }
                if (t.plainJSON = n, _.isObject(n) && n.type) {
                    var d = ["SYSTEM_MESSAGE", "JOIN_GROUP", "LEAVE_GROUP", "DISMISS_GROUP", "UPDATE_GROUP"];
                    switch (-1 !== _.indexOf(d, n.type) && i.add(t), n.type) {
                        case"JOIN_GROUP":
                            if (o = _.clone(s.getRef()), a = t.toGroupRef.count, s.set("targetGroupRef", _.extend(o, t.toGroupRef)), r = SNB.im.db.groups.get(t.toId), r && r.set({
                                    count: a,
                                    name: t.toGroupRef.name
                                }), s.status.get("membersReady")) {
                                if (_.find(n.leaveGroupInviteeRefs, function (e) {
                                        return e.id === window.SNOWMAN_USER.id
                                    })) s.fetchGroupMembers(); else var m = _.map(n.joinGroupInviteeRefs, function (e) {
                                    var t = !!_.isUndefined(e.following) || e.following;
                                    return {
                                        id: e.id,
                                        domain: e.domain || null,
                                        gender: e.gender,
                                        photo_domain: e.photoDomain || c,
                                        following: t,
                                        profile_image_url: ",,," + e.profileImageUrl + "!30x30.png",
                                        screen_name: e.screenName,
                                        province: e.province || "省/直辖市",
                                        status_count: e.statusCount,
                                        type: e.type,
                                        verified: e.verified,
                                        verified_type: e.verifiedType,
                                        followers_count: e.followersCount,
                                        friends_count: e.friendsCount,
                                        description: e.description
                                    }
                                });
                                s.groupMembers.add(m)
                            }
                            break;
                        case"LEAVE_GROUP":
                            a = t.toGroupRef.count, o = _.clone(s.getRef()), s.set("targetGroupRef", _.extend(o, t.toGroupRef)), r = SNB.im.db.groups.get(t.toId), r && r.set({
                                count: a,
                                name: t.toGroupRef.name
                            }), s.status.get("membersReady") && _.each(n.attachment.LEAVE_GROUP_TARGETS, function (e) {
                                s.groupMembers.remove(e)
                            });
                            break;
                        case"DISMISS_GROUP":
                            r = SNB.im.db.groups.get(t.toId), r && SNB.im.db.groups.remove(r), o = _.clone(s.getRef()), s.set("targetGroupRef", _.extend(o, {joined: !1}));
                            break;
                        case"REFRESH_GROUP_IMAGE":
                            r = SNB.im.db.groups.get(t.toId);
                            var u = t.toGroupRef.profileImageUrl, g = u.split(","), h = _.clone(s.getRef());
                            r && r.set({
                                profile_image_url_60: l + g[2],
                                profile_image_url_88: l + g[1],
                                profile_image_url_100: l + g[0]
                            }), s.set("targetGroupRef", _.extend(h, {profileImageUrl: u}));
                            break;
                        case"UPDATE_GROUP":
                            r = SNB.im.db.groups.get(t.toId), r && r.set("name", n.attachment.UPDATE_GROUP_NAME), o = _.clone(s.getRef()), s.set("targetGroupRef", _.extend(o, {name: n.attachment.UPDATE_GROUP_NAME}));
                            break;
                        case"REFRESH_GROUP":
                            s.set("targetGroupRef", t.toGroupRef)
                    }
                }
            }
        }

        function a(e) {
            var t;
            try {
                t = $.parseJSON(e.plain)
            } catch (e) {
            }
            _.isObject(t) && t.type && t.type
        }

        function o(e, t) {
            _.each(t.messages, function (t) {
                if (/"type":"REQUEST_JOIN_GROUP"/.test(t.plain))return SNB.im.trigger("adapter:REQUEST_JOIN_GROUP"), !1;
                var s, o = t.fromId === window.SNOWMAN_USER.id;
                if (!(s = t.toGroup ? t.toId : o ? t.toId : t.fromId))return a(e, t), !1;
                var r = e.sessions.get(s);
                if (r) n(e, t, r); else {
                    "SYSTEM_EVENT" === t.messageType && !/REFRESH_GROUP_IMAGE/.test(t.plain) && i(e, t, s, n)
                }
            })
        }

        var r = e("./base.config"), l = "http://mavatar.imedao.com/", c = "//xavatar.imedao.com/";
        t.exports = o
    }, {"./base.config": 3}], 2: [function (e, t, s) {
        "use strict";
        function i(e, t) {
            var s = e.sessions.get(t.fromId);
            if (s) {
                s.status.set("typing", t.typing)
            }
        }

        function n(e, t) {
            var s = e.sessions.get(t.toId);
            s && s.set("unreadCount", 0)
        }

        function a(e, t) {
            if (t.activeFlag) {
                var s = e.sessions.get(t.targetId);
                s && s.set(t)
            }
        }

        function o(e, t) {
            var s = e.sessions.get(t.target);
            s && s.messages.reset()
        }

        function r(e) {
            _.extend(this, e)
        }

        var l = e("./base.adapter.deliver");
        r.prototype = {
            dispatcher: function (e) {
                if (_.isArray(e)) _.each(e, function (e) {
                    this.dispatcher(e)
                }, this); else switch (e.type) {
                    case"UPDATE_MESSAGE_SESSION":
                        a(this.db, e.session);
                        break;
                    case"DELIVER":
                        l(this.db, e);
                        break;
                    case"TYPING":
                        i(this.db, e);
                        break;
                    case"READ":
                        n(this.db, e);
                        break;
                    case"DELETE_MESSAGES":
                        o(this.db, e)
                }
            }
        }, t.exports = r
    }, {"./base.adapter.deliver": 1}], 3: [function (e, t, s) {
        "use strict";
        var i = [["01smile", "[微笑]"], ["03laugh", "[哈哈]"], ["04clap", "[鼓掌]"], ["05confused", "[困惑]"], ["06sad", "[难过]"], ["07angry", "[生气]"], ["08cute", "[可爱]"], ["09act-up", "[调皮]"], ["10sweat", "[汗]"], ["11good", "[赞]"], ["12bad", "[贬]"], ["13love", "[爱]"], ["14love-over", "[心碎]"], ["15rose", "[献花]"], ["16rose-dead", "[凋谢]"], ["17in-love", "[色]"], ["18kiss", "[亲亲]"], ["19poop", "[屎]"], ["20victory", "[胜利]"], ["21desire", "[仰慕]"], ["22moneymouth", "[贪财]"], ["23quiet", "[无语]"], ["24secret", "[秘密]"], ["25shut-mouth", "[闭嘴]"], ["26shame", "[害羞]"], ["27sick", "[讨厌]"], ["28dazed", "[晕]"], ["29question", "[疑问]"], ["30sleepy", "[困]"], ["31arrogant", "[傲慢]"], ["32curse", "[诅咒]"], ["33crying", "[哭]"], ["34disapointed", "[失望]"], ["35embarrassed", "[尴尬]"], ["36dont-know", "[不知道]"], ["37handshake", "[握手]"], ["38struggle", "[挣扎]"], ["39thinking", "[思考]"], ["40tongue", "[吐舌]"], ["20smile-smile", "[笑]"], ["21lol", "[大笑]"], ["14guzhang", "[鼓鼓掌]"], ["19qiaopi", "[俏皮]"], ["08jiayou", "[加油]"], ["23earn", "[赚大了]"], ["11niubi", "[牛]"], ["24angry", "[怒了]"], ["25weep", "[哭泣]"], ["09lose", "[亏大了]"], ["26sleepy", "[困顿]"], ["18shiwang", "[好失望]"], ["10han", "[滴汗]"], ["13why", "[为什么]"], ["16guile", "[跪了]"], ["12hand", "[摊手]"], ["22buxie", "[不屑]"], ["15xunka", "[好逊]"], ["emoji_chimian_40", "[关灯吃面]"], ["emoji_shabi_40", "[呵呵]"], ["emoji_gerou_40", "[割肉]"], ["emoji_maishen_40", "[卖身]"], ["emoji_tuxie_40", "[吐血]"], ["emoji_kelian_40", "[可怜]"], ["emoji_haixiu_40", "[害羞]"], ["emoji_koubi_40", "[抠鼻]"], ["emoji_jiong_40", "[囧]"], ["43kunhuo", "[好困惑]"], ["44sikao", "[想一下]"], ["45aoman", "[傲]"], ["17shutup", "[不说了]"], ["27weiguan", "[围观]"], ["03zan", "[很赞]"], ["04bian", "[不赞]"], ["05woshou", "[赞成]"], ["40cheers", "[干杯]"], ["36heart", "[心心]"], ["37heartbreak", "[心碎了]"], ["38flower", "[献花花]"], ["39shit", "[一坨屎]"], ["41full", "[满仓]"], ["42empty", "[空仓]"], ["34reverse", "[复盘]"], ["35bottom", "[抄底]"], ["33nengliquan", "[能力圈]"], ["29put", "[看空]"], ["30call", "[看多]"], ["31add", "[加仓]"], ["32reduce", "[减仓]"], ["01buy", "[买入]"], ["02sell", "[卖出]"], ["06maogugu", "[毛估估]"], ["07deal", "[成交]"], ["28moat", "[护城河]"]],
            n = function () {
                return "https://im" + Math.round(9 * Math.random()) + ".xueqiu.com/im-comet"
            }, a = SNB.staticDomain && SNB.staticDomain.base ? SNB.staticDomain.base : SNB.staticDomain;
        t.exports = {bbCodes: i, getBaseUrl: n, staticDomain: a}
    }, {}], 4: [function (e, t, s) {
        "use strict";
        var i = e("./base.net"), n = e("./base.adapter"), a = e("./db");
        SNB.im.db = a, SNB.im.on("net:preConnected", function () {
            SNB.im.db.sessions.getList()
        });
        var o = SNB.im.net = new i({sharedWorker: !1, user: window.SNOWMAN_USER}),
            r = SNB.im.adapter = new n({net: o, db: a}), l = function (e) {
                r.dispatcher(e)
            };
        o.on("net:msg", l), t.exports = {db: a, net: o}
    }, {"./base.adapter": 2, "./base.net": 6, "./db": 10}], 5: [function (e, t, s) {
        "use strict";
        var i = function () {
            function e(e, t) {
                var i = s[e];
                return function (n) {
                    setTimeout(function () {
                        n = n || window.storageEvent;
                        var a = n.key, o = n.newValue;
                        if (!a) {
                            var r = s[e];
                            r != i && (a = e, o = r)
                        }
                        if (a == e && o != i) {
                            if (t) {
                                var l = {
                                    newValue: o,
                                    oldValue: i,
                                    key: e,
                                    url: window.location.href,
                                    isSimulation: !0,
                                    tabId: SNB.im.nid || null
                                };
                                t(l)
                            }
                            i = o
                        }
                    }, 0)
                }
            }

            var t = [], s = window.localStorage;
            return {
                getItem: function (e) {
                    return s.getItem(e)
                }, setItem: function (e, t) {
                    return s.setItem(e, t)
                }, removeItem: function (e) {
                    return s.removeItem(e)
                }, clear: function () {
                    return s.clear()
                }, onstorage: function (t, s) {
                    window.addEventListener ? window.addEventListener("storage", e(t, s), !1) : document.attachEvent && document.attachEvent("onstorage", e(t, s))
                }, sync: function (e, s, i, n) {
                    if (!_.isFunction(s))return !1;
                    this.onstorage(e, function (e) {
                        var n = e.newValue;
                        if (-1 !== _.indexOf(t, e.newValue))return !1;
                        var a = n.split("*-*")[1], o = a.split("-*-");
                        s.apply(i, o)
                    });
                    var a = this;
                    return function () {
                        n || s.apply(i, arguments);
                        var o = (new Date).getTime() + "" + Math.random() + "*-*" + [].slice.call(arguments).join("-*-");
                        t.push(o), t.length >= 3 && t.shift(), a.setItem(e, o)
                    }
                }
            }
        }();
        t.exports = i
    }, {}], 6: [function (e, t, s) {
        "use strict";
        function i(e) {
            e = e ? _.pick(e, "user", "sharedWorker") : {}, _.extend(this, o, e), this.initialize.apply(this, arguments)
        }

        var n = e("./base.config"), a = 0, o = {sharedWorker: !!window.Worker};
        _.extend(i.prototype, Backbone.Events, {
            cometRetryNum: 0, initialize: function () {
                _.bindAll(this, "ping"), this.status = SNB.im.status, SNB.im.status.on("change:sessionsReady", function (e, t) {
                    t && this.prepare()
                }, this), this.preConnection()
            }, preConnection: function () {
                jQuery.ajax({
                    url: n.getBaseUrl() + "/v2/notifications/" + SNB.im.nid + "/ping.json?user_id=" + window.SNOWMAN_USER.id,
                    type: "POST",
                    timeout: 3e3
                }).always(function () {
                    SNB.im.trigger("net:preConnected")
                })
            }, prepare: function () {
                this.status.set("network", "connected"), this.bindEvt(), this.comet(), this.ping()
            }, bindEvt: function () {
                this.on("net:polling:waiting", function (e) {
                    e > 3e4 && SNB.im.status.set("notice", {text: "网络已断开，正在重试", delay: 0})
                }, this), this.status.on("change:network", function (e, t) {
                    if ("disconnect" === t) a = (new Date).getTime(); else {
                        var s = (new Date).getTime() - a;
                        s > 3e4 && SNB.im.trigger("net:update", s)
                    }
                    if ("connected" === t) {
                        var i = SNB.im.status.get("notice");
                        /网络/.test(i.text || i) && SNB.im.status.set("notice", "")
                    }
                    "connected" === t && this.rePollingST && this.retryPolling(0), this.trigger("net:status:" + t, t)
                }, this)
            }, ping: function () {
                var e = this;
                this.pingObj && this.pingObj.abort(), this.pingObj = jQuery.ajax({
                    url: n.getBaseUrl() + "/v2/notifications/" + SNB.im.nid + "/ping.json?user_id=" + window.SNOWMAN_USER.id,
                    type: "POST",
                    timeout: 5e3
                }), this.pingObj.done(function () {
                    e.status.set("network", "connected")
                }), this.pingObj.fail(function (t, s) {
                    "error" === s && e.status.set("network", "disconnect")
                }), this.pingObj.always(function () {
                    setTimeout(function () {
                        e.ping()
                    }, 15e3)
                })
            }, retryPolling: function (e) {
                var t = this;
                this.dispelling(function () {
                    setTimeout(function () {
                        t.comet.apply(t)
                    }, e || 0)
                })
            }, dispelling: function (e) {
                this.polling && (this.polling.abort(), this.polling = null), this.rePollingST && (clearTimeout(this.rePollingST), this.rePollingST = null), e && _.isFunction(e) && e(), console.log("!!!DISPELLING!!!")
            }, comet: function () {
                this.polling && this.polling.abort();
                var e = this;
                this.polling = jQuery.ajax({
                    url: n.getBaseUrl() + "/v2/notifications/" + SNB.im.nid + "/comet.json?user_id=" + window.SNOWMAN_USER.id,
                    type: "GET",
                    timeout: 6e5
                }), this.polling.done(function (t, s, i) {
                    if (t && !t.error) {
                        var n = [], a = _.filter(t.result, function (e) {
                            return "DELIVER" === e.type
                        });
                        _.each(a, function (e) {
                            _.each(e.messages, function (e) {
                                e.messageId && n.push(e.messageId)
                            })
                        }), n.length && e.command("RECEIPT", n), _.each(t.result, function (t) {
                            e.trigger("net:msg", t)
                        })
                    }
                }), this.polling.always(function (t, s, i) {
                    if (e.polling = null, t && t.statusText)if ("timeout" === s) e.status.set("network", "connected"), e.cometRetryNum = 0, console.log("本地:ajax超时"); else {
                        if ("abort" === s)return e.cometRetryNum = 0, console.log("本地:强制abort"), !1;
                        "error" === s ? (e.status.set("network", "disconnect"), e.cometRetryNum++, console.log("本地:断网")) : 504 === t.status ? (e.status.set("network", "disconnect"), e.cometRetryNum++) : (e.cometRetryNum++, console.log("本地网络遇到特殊情况"))
                    } else if (e.status.set("network", "connected"), 200 === i.status)if (t && t.error && t.description)switch (t.description) {
                        case"Stopped":
                            e.cometRetryNum = 0, console.log("服务器:没发ping或ping的间隔过短");
                            break;
                        case"Auth failed":
                            e.cometRetryNum++, console.log("服务器:认证失败");
                            break;
                        case"Connection timeout":
                            e.cometRetryNum++, console.log("服务器:platform 超时");
                            break;
                        default:
                            e.cometRetryNum++, console.log("服务器:错误 - " + t.description)
                    } else e.cometRetryNum = 0; else 403 === i.status ? console.log("服务器:token 错误") : (e.cometRetryNum++, console.log("服务器:服务器端遇到特殊情况 500 等"));
                    1e4 * e.cometRetryNum > 18e4 && (e.cometRetryNum = 1);
                    var n = 1e4 * e.cometRetryNum;
                    n && console.log("<net:" + n / 1e3 / 60 + " min 后重试>", (new Date).toString().slice(16, 24), t), e.cometRetryNum && e.trigger("net:polling:waiting", n), e.rePollingST = setTimeout(function () {
                        n && console.log("<net:" + n + "ms 后已重试!!>", (new Date).toString().slice(16, 24)), e.comet.apply(e, [])
                    }, n)
                })
            }, command: function (e, t) {
                var s, i;
                switch (e) {
                    case"READ":
                        i = t.targetGroup ? 1 : 0, s = jQuery.ajax({
                            url: n.getBaseUrl() + "/v2/sessions/" + t.targetId + "-" + i + "/read.json?user_id=" + window.SNOWMAN_USER.id,
                            type: "POST",
                            timeout: 2e4
                        });
                        break;
                    case"RECEIPT":
                        s = jQuery.ajax({
                            url: n.getBaseUrl() + "/v2/notifications/" + SNB.im.nid + "/receipts.json?user_id=" + window.SNOWMAN_USER.id,
                            type: "POST",
                            data: JSON.stringify(t),
                            contentType: "application/json",
                            timeout: 2e4
                        });
                        break;
                    case"TYPING":
                        i = t.targetGroup ? 1 : 0, jQuery.ajax({
                            url: n.getBaseUrl() + "/v2/sessions/" + t.targetId + "-" + i + "/typing.json?user_id=" + window.SNOWMAN_USER.id,
                            type: t.typing ? "POST" : "DELETE",
                            timeout: 2e4
                        })
                }
                if (s)return s
            }
        }), t.exports = i
    }, {"./base.config": 3}], 7: [function (e, t, s) {
        "use strict";
        function i(e, t, s) {
            if (void 0 === t) {
                var i = null;
                if (document.cookie && "" !== document.cookie)for (var n = document.cookie.split(";"), a = 0; a < n.length; a++) {
                    var o = jQuery.trim(n[a]);
                    if (o.substring(0, e.length + 1) == e + "=") {
                        i = decodeURIComponent(o.substring(e.length + 1));
                        break
                    }
                }
                return i
            }
            s = s || {}, null === t && (t = "", s.expires = -1);
            var r = "";
            if (s.expires && ("number" == typeof s.expires || s.expires.toUTCString)) {
                var l;
                "number" == typeof s.expires ? (l = new Date, l.setTime(l.getTime() + 24 * s.expires * 60 * 60 * 1e3)) : l = s.expires, r = "; expires=" + l.toUTCString()
            }
            var c = s.path ? "; path=" + s.path : "", d = s.domain ? "; domain=" + s.domain : "",
                m = s.secure ? "; secure" : "";
            document.cookie = [e, "=", encodeURIComponent(t), r, c, d, m].join("")
        }

        function n(e, t, s) {
            var i = SNB.im.db.sessions.get(e);
            if (i) s && _.isFunction(s) && s(i); else {
                var n = t ? 1 : 0;
                jQuery.ajax({
                    url: d.getBaseUrl() + "/v2/sessions/" + e + "-" + n + ".json?user_id=" + window.SNOWMAN_USER.id,
                    type: "GET",
                    timeout: 2e4
                }).done(function (e) {
                    e.activeFlag = !0, e.collapsed = !1, i = SNB.im.db.sessions.add(e, {newsession: !0}), s && _.isFunction(s) && s(i)
                }).fail(function () {
                    s && _.isFunction(s) && s(null)
                })
            }
        }

        function a(e, t) {
            n(e, t, function (e) {
                e ? SNB.im.status.set("dialogId", e.id) : SNB.im.status.set("notice", "打开聊天失败，请重试")
            })
        }

        function o(e, t) {
            var s = t || 2;
            return (e / Math.pow(10, s)).toFixed(s).substr(2)
        }

        function r(e) {
            var t = /(\b(https?|ftp|file):\/\/[^\s]*)/gi;
            return e.replace(t, '<a target="_blank" href="$1">$1</a>')
        }

        function l() {
            try {
                if (localStorage.setItem("__testspls", "a"), "a" === localStorage.getItem("__testspls"))return localStorage.removeItem("__testspls"), !0
            } catch (e) {
            }
            return !1
        }

        function c(e) {
            return String(e).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }

        var d = e("./base.config"), m = d.bbCodes, u = _.map(m, function (e) {
            return e[1]
        }), g = _.object(u, _.map(m, function (e) {
            return e[0]
        })), h = function (e) {
            var t, s = {
                HKHSI: 1,
                HKHSF: 1,
                HKHSU: 1,
                HKHSP: 1,
                HKHSC: 1,
                HKVHSI: 1,
                HKHSCEI: 1,
                HKHSCCI: 1,
                HKGEM: 1,
                HKHKL: 1
            }, i = {DJI30: 1, NASDAQ: 1, SP500: 1, ICS30: 1, SLR10: 1, TMT20: 1, HCP10: 1, EDU10: 1}, n = {
                BTCNCNY: {money: "￥", market: "比特币（CNY）"},
                MTGOXAUD: {money: "AU$", market: "比特币（AUD）"},
                MTGOXEUR: {money: "€", market: "比特币（EUR）"},
                MTGOXGBP: {money: "£", market: "比特币（GBP）"},
                MTGOXJPY: {money: "J￥", market: "比特币（JPY）"},
                MTGOXUSD: {money: "$", market: "比特币（USD）"},
                LOCALBTCAUD: {money: "AU$", market: "比特币（AUD）"},
                MTGOXCNY: {money: "￥", market: "比特币（CNY）"},
                BTCDEEUR: {money: "€", market: "比特币（EUR）"},
                BTCEEUR: {money: "€", market: "比特币（EUR）"},
                LOCALBTCGBP: {money: "£", market: "比特币（GBP）"},
                BTCEUSD: {money: "$", market: "比特币（USD）"},
                BITSTAMPUSD: {money: "$", market: "比特币（USD）"}
            }, a = ["SH500", "SH510", "SH511", "SH513", "SZ15", "SZ18", "SZ16"];
            if (e && (_.indexOf(a, e.substr(0, 5)) > -1 || _.indexOf(a, e.substr(0, 4)) > -1)) t = {
                money: "￥",
                market: "",
                bigType: "基金",
                type: "基金"
            }; else if (/^S[HZ]\d+$/.test(e)) t = /^SZ200/.test(e) ? {
                money: "HK$",
                market: "深B",
                bigType: "沪深",
                type: "股票"
            } : /^(SH(201|202|203|204|131)|SZ(13|395032))/.test(e) ? {
                money: "￥",
                market: "回购",
                bigType: "沪深",
                type: "回购"
            } : /^(SH(01|02|13)|SZ(10|09))/.test(e) ? {
                money: "￥",
                market: "国债",
                bigType: "沪深",
                type: "国债"
            } : /^(SH12|SZ11)/.test(e) ? {
                money: "￥",
                market: "企债",
                bigType: "沪深",
                type: "企债"
            } : /^(SH11|SZ12)/i.test(e) ? {
                money: "￥",
                market: "可转债",
                bigType: "沪深",
                type: "可转债"
            } : /^SH900/.test(e) ? {
                money: "$",
                market: "沪B",
                bigType: "沪深",
                type: "股票"
            } : /^(SH00|SZ399)/.test(e) ? {money: "", market: "", bigType: "沪深", type: "指数"} : {
                money: "￥",
                market: "A股",
                bigType: "沪深",
                type: "股票"
            }; else if (/^MF\d+$/.test(e)) t = {
                money: "￥",
                market: "MF",
                bigType: "货币基金",
                type: "货币基金"
            }; else if (/^TP\d+$/.test(e)) t = {
                money: "￥",
                market: "TP",
                bigType: "信托产品",
                type: "信托产品"
            }; else if (/^[\d\w]+\.FM$/.test(e)) t = {
                money: "￥",
                market: "FM",
                bigType: "国债期货",
                type: "国债期货"
            }; else if (/^P\d+$/.test(e)) t = {
                money: "￥",
                market: "P",
                bigType: "私募基金",
                type: "私募基金"
            }, "P000057" === e && (t.money = "$"); else if (/^F\d+$/.test(e)) t = {
                money: "￥",
                market: "F",
                bigType: "基金",
                type: "基金"
            }; else if (/^FP\d+$/.test(e)) t = {
                money: "￥",
                market: "FP",
                bigType: "理财产品",
                type: "理财产品"
            }; else if (/^ZH\d{6,7}$/.test(e)) t = {
                money: "￥",
                market: "ZH",
                bigType: "投资组合",
                type: "投资组合"
            }; else if (/^\d+$/.test(e)) t = {
                money: /^8/.test(e) ? "￥" : "HK$",
                market: "港股",
                bigType: "港股",
                type: "股票"
            }; else if (s[e] || i[e]) t = {money: "", market: "", bigType: "指数", type: "指数"}; else {
                var o = n[e];
                t = o ? {money: o.money, market: o.market, bigType: "比特币", type: "比特币"} : {
                    money: "$",
                    market: "美股",
                    bigType: "美股",
                    type: "股票"
                }
            }
            return t
        };
        t.exports = {
            cookie: i,
            session: a,
            prefixInteger: o,
            formatUrl: r,
            bbCode2Img: g,
            bbCodes: u,
            getStockInfo: h,
            hasStorage: l,
            escape: c
        }
    }, {"./base.config": 3}], 8: [function (e, t, s) {
        "use strict";
        var i = Backbone.Model.extend({idAttribute: "key"}), n = Backbone.Collection.extend({
            model: i, initialize: function () {
                this.fetch()
            }, fetch: function () {
                this.trigger("fetch:start");
                var e = this, t = jQuery.ajax({
                    url: "/users/follow_each_other.json?page=1&count=1000",
                    type: "GET",
                    timeout: 2e4
                });
                return t.done(function (t) {
                    if (t.total && t.total > 0) {
                        var s = _.map(t.map, function (e, t) {
                            return {
                                users: _.map(e, function (e) {
                                    return e.key = t, e
                                }), key: t
                            }
                        });
                        e.add(s)
                    }
                    SNB.im.status.set("contactsReady", !0)
                }), t.always(function () {
                    e.trigger("fetch:done")
                }), t
            }
        });
        t.exports = n
    }, {}], 9: [function (e, t, s) {
        "use strict";
        var i = Backbone.Collection.extend({
            model: Backbone.Model, initialize: function () {
                this.fetch()
            }, fetch: function () {
                this.trigger("fetch:start");
                var e = this, t = jQuery.ajax({url: "/imgroups/joined_list.json", type: "GET", timeout: 2e4});
                return t.done(function (t) {
                    t.length > 0 && e.add(t), SNB.im.status.set("groupsReady", !0)
                }), t.always(function () {
                    e.trigger("fetch:done")
                }), t
            }
        });
        t.exports = i
    }, {}], 10: [function (e, t, s) {
        "use strict";
        var i = e("./db.sessions"), n = e("./db.groups"), a = e("./db.contacts"), o = new i, r = new n, l = new a;
        t.exports = {sessions: o, groups: r, contacts: l}
    }, {"./db.contacts": 8, "./db.groups": 9, "./db.sessions": 13}], 11: [function (e, t, s) {
        "use strict";
        function i(e) {
            var t = function (e) {
                return e < 10 ? "0" + e : e
            };
            return "object" !== (void 0 === e ? "undefined" : l(e)) && (e = new Date(e)), t(e.getMonth() + 1) + "-" + t(e.getDate()) + " " + t(e.getHours()) + ":" + t(e.getMinutes())
        }

        function n(e) {
            var t = e.plain;
            t = d.formatUrl(t), t = t.replace(/[\n]/g, function (e) {
                return {"\n": "<br>"}[e]
            });
            var s = t.match(/\[[^\]]*\]/g);
            if (s)for (var i = 0; i < s.length; i++) {
                var n = s[i] + "",
                    a = '<img class="face" width="24" height="24" src="' + c + d.bbCode2Img[n] + '.png">';
                d.bbCode2Img[n] && (t = t.replace(/\[[^\]]*\]/, a))
            }
            return t
        }

        function a(e) {
            if (e.uploadImage && !e.image)return ' <a class="snbim-msgitem-image" href="javascript:;"> <img class="snbim_msgimg" src="//assets.imedao.com/images/ajax-loader.gif"></a>';
            var t = e.image.split("?");
            if (t.length > 1) {
                var s, i = t[0] + "!thumb.png", n = t[1].split("x"), a = parseInt(n[0], 10), o = parseInt(n[1], 10);
                return (a > 180 || o > 240) && (a > o ? (s = 180 / a, a = 180, (o *= s) > 240 && (s = 240 / parseInt(n[1], 10), o = 240, a = s * parseInt(n[0], 10))) : a == o ? (a = 180, o = 180) : (s = 240 / o, o = 240, (a *= s) > 180 && (s = 180 / parseInt(n[0], 10), a = 180, o = s * parseInt(n[1], 10)))), ' <a class="snbim-msgitem-image" href="' + e.image + '" target="_blank"> <img class="snbim_msgimg snbim_imgloading"   width="' + a / 1.5 + '"   height="' + o / 1.5 + '"   title="查看原图[' + t[1] + ']"   src="' + i + '"   onload = "$(this).trigger(\'loadsucc\')"   onerror ="$(this).trigger(\'err\')"> </a>'
            }
        }

        function o(e) {
            var t, s = e.jsonView || e.view;
            if (s && _.isObject(s))if ("USER_INFO" === s.type) t = _.template('                 <a target="_blank" href="<%= view.url%>" class="snbim_card snbim_card_<%= view.type.toLowerCase() %>">                  <span class="snbim_card_name"><%=view.name%></span>                  <span class="snbim_card_rb">被<%=view.fans%>人关注</span>                  <span class="snbim_card_rb"><%=view.posts%>条讨论</span>                  <span class="snbim_card_rb">关注<%=view.stocks%>只股票</span>                  <img src="<%=view.icon%>" width="45" height="45" >                </a>              ', {
                view: s,
                model: e
            }); else if ("STOCK" === s.type) {
                var n = function () {
                    return s.change > 0 ? "up" : s.change < 0 ? "down" : void 0
                }();
                t = _.template('                 <a target="_blank" href="<%= view.url%>" class="snbim_card snbim_card_<%= view.type.toLowerCase() %>">                  <span class="snbim_card_name"><%=view.name%>(<%= view.symbol %>)</span>                  <span class="snbim_card_pcnum price <%= upDown %>"><%= moneySymbol + view.price.toFixed(2) %></span>                  <span class="snbim_card_pcnum change <%= upDown %>"><%= change %></span>                  <img src="<%=view.icon%>" width="45" height="45">                </a>              ', {
                    view: s,
                    change: (s.change || 0).toFixed(2) + "(" + (100 * s.changePercentage).toFixed(2) + "%)",
                    moneySymbol: d.getStockInfo(s.symbol).money,
                    upDown: n,
                    model: e
                })
            } else if ("POST" === s.type) t = _.template('                 <a target="_blank" href="<%= view.url%>" class="snbim_card snbim_card_<%= view.type.toLowerCase() %>">                  <span class="snbim_card_title"><%= view.title||view.user %></span>                  <img src="<%=view.image%>" width="45" height="45" >                  <span class="snbim_card_desc"><%=view.text%></span>                </a>              ', {
                view: s,
                model: e
            }); else if ("SIMPLE_TEXT" === s.type) {
                var a = s.text.replace(/\n/g, "<br>");
                t = _.template('                 <a target="_blank" href="<%= view.url || "#" %>" class="snbim_card snbim_card_<%= view.type.toLowerCase() %>">                  <span class="snbim_card_title"><%= view.title %></span>                  <span class="snbim_card_time"><%= date %></span>                  <span class="snbim_card_con"><%=text%></span>                  <span class="snbim_card_link">查看 <b></b></span>                </a>              ', {
                    view: s,
                    text: a,
                    date: i(e.timestamp),
                    model: e
                })
            } else if ("TEXT_IMAGE" === s.type) {
                var o = s.text.replace(/\n/g, "<br>");
                t = _.template('                 <a target="_blank" href="<%= view.url || "#" %>" class="snbim_card snbim_card_<%= view.type.toLowerCase() %>">                  <img class="snbim_card_image" src="<%= view.image %>">                  <span class="snbim_card_title"><%= view.title %></span>                  <span class="snbim_card_time"><%= date %></span>                  <span class="snbim_card_con"><%= text %></span>                  <span class="snbim_card_link">查看 <b></b></span>                </a>              ', {
                    view: s,
                    text: o,
                    date: i(e.timestamp),
                    model: e
                })
            } else"MULTI_TEXT_IMAGE" === s.type && (t = _.template('             <ul class="snbim_card_multi_text_image">              <% _.each(view.list,function(d,i){ %>                <li class="<%= (i==0 ? "first":"normal") %>">                  <a href="<%= d.url %>" target="_blank" class="snbim-card-mt-img">                    <img src="<%= d.image %>">                  </a>                  <a href="<%= d.url %>" target="_blank" class="snbim-card-mt-title">                    <%= d.title %>                  </a>                </li>              <% }) %>            </ul>', {
                view: s,
                model: e
            })); else t = /^http\:\/\//.test(e.view) ? d.formatUrl(e.view) : "[未知类型卡片]";
            return t
        }

        function r(e) {
            var t, s, i, n, a;
            try {
                t = $.parseJSON(e.plain)
            } catch (e) {
            }
            if (t && t.type) {
                if ("SYSTEM_MESSAGE" === t.type)return t.text;
                if ("JOIN_GROUP" === t.type)return i = t.joinGroupInviterRef.id === window.SNOWMAN_USER.id ? "您" : t.joinGroupInviterRef.screenName, a = _.compact(t.joinGroupInviteeRefs), a.length ? (n = _.map(a, function (e) {
                    return e ? e.id === window.SNOWMAN_USER.id ? "您" : '<a href="http://xueqiu.com/' + (e.domain || e.id) + '" target="_blank">' + e.screenName + "</a>" : "未知用户"
                }), s = n.join("、"), i + "邀请 " + s + " 加入群组") : i + '邀请 <span title="已被系统屏蔽的垃圾用户" class="snbim-message-gauser">[垃圾用户]</span> 加入群组';
                if ("LEAVE_GROUP" === t.type)return i = t.leaveGroupOperatorRef.id === window.SNOWMAN_USER.id ? "您" : t.leaveGroupOperatorRef.screenName, n = _.map(t.leaveGroupInviteeRefs, function (e) {
                    return e.id === window.SNOWMAN_USER.id ? "您" : '<a href="http://xueqiu.com/' + (e.domain || e.id) + '" target="_blank">' + e.screenName + "</a>"
                }), s = n.join("、"), 1 === n.length && t.leaveGroupInviteeRefs[0].id === t.leaveGroupOperatorRef.id ? s + " 已退出群组" : s + " 已被" + i + "请出群组";
                if ("DISMISS_GROUP" === t.type) {
                    var o = t.attachment.DISMISS_GROUP_OPERATOR, r = t.dismissGroupOperatorRef;
                    return o === window.SNOWMAN_USER.id ? "您已解散该群" : '该群已被群主 <a href="http://xueqiu.com/' + o + '">' + r.screenName + "</a> 解散"
                }
                if ("UPDATE_GROUP" === t.type) {
                    return i = t.updateGroupOperatorRef, "本群已被" + (i.id === window.SNOWMAN_USER.id ? "您" : '群主<a href="http://xueqiu.com/' + (i.domain || i.id) + '">' + i.screenName + "</a>") + "命名为「" + t.attachment.UPDATE_GROUP_NAME + "」"
                }
                return _.escape(t.text)
            }
            return "未知系统消息"
        }

        var l = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
            return typeof e
        } : function (e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, c = (e("./base.config"), "//assets.imedao.com/images/face/"), d = e("./base.utils");
        t.exports = {getPlainBody: n, getImageBody: a, getCardBody: o, getSysMsgBody: r}
    }, {"./base.config": 3, "./base.utils": 7}], 12: [function (e, t, s) {
        "use strict";
        var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (e) {
            return typeof e
        } : function (e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }, n = e("./base.config"), a = e("./db.message.helper"), o = e("./base.utils"), r = Backbone.Model.extend({
            defaults: {fromGroup: !1, fromId: 0, messageType: "PLAIN", toGroup: !1},
            idAttribute: "messageId",
            initialize: function () {
                this.sessionModel = this.collection.session, this.sessionStatus = this.collection.session.status, window.globalSequenceId ? window.globalSequenceId++ : window.globalSequenceId = 1
            },
            parseVal: function (e) {
                if ("VIEW" === e.messageType) {
                    var t;
                    try {
                        t = $.parseJSON(e.view), t && _.isObject(t) && (e.jsonView = t)
                    } catch (e) {
                    }
                }
                return e
            },
            set: function (e, t) {
                var s = {};
                "object" === (void 0 === e ? "undefined" : i(e)) ? s = e : s[e] = t, e = this.parseVal(s), t = null, Backbone.Model.prototype.set.call(this, e, t)
            },
            save: function () {
                var e = {
                    toId: this.get("toId"),
                    toGroup: this.get("toGroup"),
                    sequenceId: parseInt(SNB.im.nid + "" + window.globalSequenceId, 10)
                };
                this.get("plain") ? e.plain = this.get("plain") : this.get("image") && (e.image = this.get("image"));
                var t = 1, s = this, i = this.saveWitchNewApi(e);
                this.interval = setInterval(function () {
                    if (t > 2)return clearInterval(s.interval), !1;
                    i && i.abort(), i = s.saveWitchNewApi(e), t++
                }, 500)
            },
            saveWitchNewApi: function (e) {
                var t = this, s = jQuery.ajax({
                    url: n.getBaseUrl() + "/v2/messages.json?user_id=" + window.SNOWMAN_USER.id,
                    type: "POST",
                    timeout: 2e4,
                    contentType: "application/json",
                    data: JSON.stringify(e)
                });
                return s.done(function (e) {
                    if (t.interval && clearInterval(t.interval), !e.error && e.message) t.set(e.message); else switch (t.destroy(), e.error) {
                        case"Limit reached":
                            t.sessionStatus.set("notice", "发送过于频繁,稍后继续重试");
                            break;
                        case"Duplicate message":
                            t.sessionStatus.set("notice", "消息重复");
                            break;
                        case"对不起！要继续聊天请让对方关注你。":
                            t.sessionStatus.set("notice", "对不起！要继续聊天请让对方关注你。");
                            break;
                        default:
                            t.sessionStatus.set("notice", e.error)
                    }
                }), s.fail(function (e) {
                    "abort" != e.statusText && (t.sessionStatus.set("notice", "消息发送失败,请重试"), t.destroy())
                }), s
            },
            getTime: function () {
                var e = new Date(this.get("timestamp"));
                return o.prefixInteger(e.getHours()) + ":" + o.prefixInteger(e.getMinutes())
            },
            getAvatar: function () {
                var e = "";
                if (this.get("fromUserRef") && this.get("fromUserRef").profileImageUrl) {
                    var t = this.get("fromUserRef").profileImageUrl.split(",");
                    if (t.length > 1) e = "//xavatar.imedao.com/" + t[2]; else {
                        var s = t[0], i = "!50x50.png";
                        if (s) {
                            var n = /!\d+x\d+\.png/, i = "!50x50.png";
                            n.test(s) ? (s = s.replace(n, i), e = "//xavatar.imedao.com/" + s) : e = "//xavatar.imedao.com/" + s + i
                        }
                    }
                }
                return e
            },
            getSummary: function () {
                var e = this.toJSON(), t = "", s = "", i = e.fromId === window.SNOWMAN_USER.id;
                if ("SYSTEM_EVENT" === e.messageType) t = this.getBody().replace(/<.*?>/g, ""); else switch (i ? s = "我: " : e.toGroup && (s = e.fromUserRef.screenName + ": "), e.messageType) {
                    case"PLAIN":
                        t = s + (e.summary || e.plain.slice(0, 30));
                        break;
                    case"IMAGE":
                        t = s + (e.summary || "[图片]");
                        break;
                    case"VIEW":
                        t = s + (e.summary || "[卡片]")
                }
                return t
            },
            getBody: function () {
                var e = this.toJSON(), t = "";
                switch (e.messageType) {
                    case"PLAIN":
                        t = a.getPlainBody(e);
                        break;
                    case"IMAGE":
                        t = a.getImageBody(e);
                        break;
                    case"VIEW":
                        t = a.getCardBody(e);
                        break;
                    case"SYSTEM_EVENT":
                        t = a.getSysMsgBody(e)
                }
                return t
            }
        }), l = Backbone.Collection.extend({
            model: r, initialize: function (e, t) {
                this.session = t.sessionModel, this.status = this.session.status, _.bindAll(this, "addHistory")
            }, comparator: "messageId", fetch: function (e) {
                e = e || {}, this.trigger("state:loading");
                var t, s = this, i = this.session.get("targetGroup") ? 1 : 0, a = e.limit || 30;
                e.until ? t = e.until : this.length && (t = this.at(0).get("timestamp") - 1);
                var o = {limit: a, until: t};
                e.check && s.status.get("lastMsgTimestamp") && (delete o.limit, o.since = s.status.get("lastMsgTimestamp"));
                var r = jQuery.ajax({
                    url: n.getBaseUrl() + "/v2/sessions/" + this.session.id + "-" + i + "/messages.json?user_id=" + window.SNOWMAN_USER.id,
                    type: "GET",
                    timeout: 2e4,
                    data: o
                });
                return r.done(function (t) {
                    if (e.check) {
                        var i = _.difference(_.pluck(t, "messageId"), s.pluck("messageId")),
                            n = _.filter(t, function (e) {
                                return -1 !== _.indexOf(i, e.messageId)
                            });
                        i.length && s.add(n)
                    } else s.addHistory(t)
                }), r.always(function () {
                    s.trigger("state:loading")
                }), r
            }, addHistory: function (e) {
                var t = e.reverse(), s = this.add(t, {silent: !0});
                this.trigger("history", s)
            }
        });
        t.exports = l
    }, {"./base.config": 3, "./base.utils": 7, "./db.message.helper": 11}], 13: [function (e, t, s) {
        "use strict";
        function i(e) {
            return (e / Math.pow(10, 2)).toFixed(2).substr(2)
        }

        function n(e) {
            var t = new Date(e), s = t.getMonth() + 1, n = t.getDate(), a = t.getHours(), o = t.getMinutes(),
                r = (new Date).getTime(), l = (r - e) / 1e3, c = Math.round(l / 86400), d = i(a) + ":" + i(o),
                m = i(s) + "-" + i(n);
            switch (l < 86400 && (d = i(a) + ":" + i(o), m = d), c) {
                case 1:
                    m = "昨天";
                    break;
                case 2:
                    m = "前天"
            }
            return m
        }

        var a = e("./base.config"), o = e("./db.messages"), r = Backbone.Model.extend({
            defaults: {
                dialog: "none",
                notice: "",
                membersReady: !1,
                initedHistory: !1,
                lastMsgTimestamp: null
            }, initialize: function () {
                var e = this;
                this.on("change:typing", function (t, s) {
                    if (this.typingST && (clearTimeout(this.typingST), this.typingST = void 0), s) {
                        this.typingST = setTimeout(function () {
                            e.set("typing", !1)
                        }, 6e4)
                    }
                }, this)
            }
        }), l = Backbone.Model.extend({
            defaults: {
                activeFlag: !0,
                collapsed: !1,
                notificationFlag: !0,
                stickyFlag: !1,
                unreadCount: 0
            }, idAttribute: "targetId", initialize: function () {
                this.status = new r, this.messages = new o(null, {
                    sessionStatus: this.status,
                    sessionModel: this
                }), this.messages.on("add", this.updateSession, this), this.set("messages", this.messages), this.get("targetGroup") && (this.groupMembers = new Backbone.Collection, this.set("groupMembers", this.groupMembers))
            }, sendRead: function () {
                SNB.im.net.command("READ", {targetId: this.get("targetId"), targetGroup: this.get("targetGroup")})
            }, updateSession: function (e) {
                e.get("timestamp") >= this.get("timestamp") && (this.set({
                    summary: e.getSummary(),
                    timestamp: e.get("timestamp")
                }), this.updateUnreadCount(e))
            }, updateUnreadCount: function (e) {
                var t = "SYSTEM_EVENT" === e.get("messageType"), s = e.get("fromId") === window.SNOWMAN_USER.id;
                if (!t && !s)if (this.get("notificationFlag") && !this.get("collapsed") && SNB.im.trigger("unread", e), "open" === this.status.get("dialog")) this.sendRead(); else {
                    var i = this.get("unreadCount");
                    this.set("unreadCount", ++i)
                }
            }, getAvatar: function (e) {
                var t, s, i = this.getRef("profileImageUrl") || "", n = i.split(",");
                return t = this.get("targetGroup") ? "//mavatar.imedao.com/" : "//xavatar.imedao.com/", s = e && n[e] ? n[e] : n[0], this.get("targetGroup") || (s += "!100x100.png"), t + s
            }, getRef: function (e) {
                var t;
                return t = this.get("targetGroup") ? this.get("targetGroupRef") : this.get("targetUserRef"), t && e ? t[e] : t
            }, getTime: function () {
                return n(this.get("timestamp"))
            }, fetchGroupMembers: function () {
                var e = this, t = jQuery.ajax({
                    url: "/imgroup_members/list.json?imgroup_id=" + this.id,
                    type: "GET",
                    timeout: 2e4
                });
                return t.done(function (t) {
                    e.status.set("membersReady", !0), e.groupMembers.reset(t)
                }), t
            }
        }), c = Backbone.Collection.extend({
            model: l, initialize: function () {
                SNB.im.on("net:update", function () {
                    this.getList()
                }, this)
            }, retryTimes: 0, getList: function () {
                var e = this;
                return this.trigger("sessions:sync", "start"), this.fetchObj && this.fetchObj.abort(), this.fetchObj = jQuery.ajax({url: a.getBaseUrl() + "/v2/sessions.json?user_id=" + window.SNOWMAN_USER.id,
