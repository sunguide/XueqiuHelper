'use strict';

const request = require("superagent");
require("superagent-charset")(request);

module.exports = app => {

    class xueqiu extends app.Service {

        constructor(ctx) {
            super(ctx);
            this.base_headers = {
                Accept: "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4,ja;q=0.2",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                Host: "xueqiu.com",
                Origin: "https://xueqiu.com",
                Pragma: "no-cache",
                Referer: "https://xueqiu.com/",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest"
            };
            this.urls = {
                home: "https://xueqiu.com",
                login: "https://xueqiu.com/snowman/login",
                token: "https://xueqiu.com/service/csrf?api=%2Fstatuses%2Fupdate.json&_=1507965835009",
                post: "https://xueqiu.com/statuses/update.json",
                upload: "https://xueqiu.com/photo/upload.json",
            };
        }

        /**
         * request hacker-news api
         * @param {String} api - Api name
         * @param {Object} [opts] - urllib options
         * @return {Promise} response.data
         */
        * request(api, opts) {
            const options = Object.assign({
                dataType: 'json',
                timeout: ['30s', '30s'],
            }, opts);

            const result = yield this.ctx.curl(`https://xueqiu.com/S/${api}`, options);
            return result.data.toString();
        }

        * getRecentPoster(stock_code){
            const _ = require('lodash');

            let now = Date.now();
            let options = {
              headers: {Cookie:yield this.getLoginCookie()},
              dataType: 'json'
            };
            stock_code = xueqiu.getFullStockCode(stock_code);
            const res = yield this.ctx.curl(`https://xueqiu.com/statuses/search.json?count=10&comment=0&symbol=${stock_code}&hl=0&source=user&sort=time&page=1&_=${now}`,options);
            let data = res.data;
            let posters = [];
            if(data.list){
               for(let i = 0; i < data.list.length; i++){
                  if(data.list[i].user_id > 0){
                     posters.push(data.list[i].user.screen_name);
                  }
               }
            }
            return posters;_.uniq(posters);
        }

        * post(message) {
            let urls = this.urls;
            let token = yield this.getToken();
            let base_headers = this.base_headers;
            let cookie = yield this.getLoginCookie();
            let form = {
                "status": message,
                "session_token": token
            };
            return new Promise((resolve, reject) => {
                request.post(urls.post)
                    .set(base_headers)
                    .set("Cookie", cookie)
                    .type("form")
                    .send(form)
                    .end((err, res) => {
                        let resData = JSON.parse(res.text);
                        if(err){
                            reject(err);
                        }
                        if (resData && resData.error_code == "20204") {
                            //重发
                            console.log("请重发");
                            resolve(-1)
                        } else if (resData && resData.error_code) {
                            resolve(false)
                        } else {
                            console.log("发布成功");
                            resolve(true)
                        }
                    });
            });
        }

        * chat(fromId,toId,message){
            let base_headers = this.base_headers;
            base_headers.Origin = "https://xueqiu.com";
            base_headers.Host = "im2.xueqiu.com";
            base_headers.Referer = "https://xueqiu.com";
            let cookie = yield this.getLoginCookie();
            let form = {
                "toId":toId,
                "toGroup":false,
                "sequenceId": Math.random() * 100000000,
                "plain":message
            };
            request.post("https://im2.xueqiu.com/im-comet/v2/messages.json?user_id="+fromId)
                .set(base_headers)
                .set("Cookie", cookie)
                .type("application/json")
                .send(form)
                .redirects(0)
                .end((err, res) => {
                    // let resData = JSON.parse(res.text);
                    console.log(res.text);
                    return;
                    // if(err){
                    //     reject(err);
                    // }
                    // if (resData && resData.error_code == "20204") {
                    //     //重发
                    //     console.log("请重发");
                    //     resolve(-1)
                    // } else if (resData && resData.error_code) {
                    //     resolve(false)
                    // } else {
                    //     console.log("发布成功");
                    //     resolve(true)
                    // }
                });
            $.ajax({
                type: 'POST',
                url: "https://im8.xueqiu.com/im-comet/v2/messages.json?user_id=3595607502",
                data: {toId:5435417380,
                    toGroup:false,
                    sequenceId:18783231,
                    plain:"哈000对"},
                success: function (err,res) {
                    console.log(res);
                },
                dataType: "application/json"
            });
        }
        * uploadImage(filePath){
            let cookie = yield this.getLoginCookie();
            let urls = this.urls;
            let base_headers = this.base_headers;
            return new Promise((resolve, reject) => {
                request.post(urls.upload)
                    .set(base_headers)
                    .set("Cookie", cookie)
                    .attach('file', filePath)
                    .field('filename', filePath)
                    .end((err,res) => {
                        if(err) reject(err);
                        let resData = JSON.parse(res.text);
                        if(resData.url){
                            resolve(resData.url + '/' + resData.filename);
                        }else{
                            resolve(false);
                        }
                    });
            });
        }

        * getToken() {
            let cookie = yield this.getLoginCookie();
            let base_headers = this.base_headers;
            let urls = this.urls;
            return new Promise(function (resolve, reject) {
                request.get(urls.token)
                    .set(base_headers)
                    .set("Cookie", cookie)
                    .end((err, res) => {
                        let data = JSON.parse(res.text);
                        if (data && data.token) {
                            resolve(data.token);
                        } else {
                            reject(err);
                        }
                    });
            });
        }

        * getTodayStockInfo(stock_code) {
            let cookie = yield this.getLoginCookie();
            let quote = yield function () {
                return new Promise(function (resolve, reject) {
                    request.get("https://xueqiu.com/v4/stock/quote.json?code=" + xueqiu.getFullStockCode(stock_code) + "&_=" + new Date().getTime())
                        .set("Cookie", cookie)
                        .end((err, res) => {
                            let info = JSON.parse(res.text);
                            if (err || info.error_code) {
                                resolve(false);
                            } else {
                                info = info[xueqiu.getFullStockCode(stock_code)];
                                resolve(info);
                            }
                        });
                });
            }();
            return quote;
        }

        * getLoginCookie() {
            if (this.cookie) {
                return this.cookie;
            }
            let urls = this.urls;
            let loginPass = {
                remember_me: true,
                username: "18521527528",
                password: "woshini8",
                captcha: ""
            };
            let base_headers = this.base_headers;
            return this.cookie = yield function () {
                return new Promise(function (resolve, reject) {
                    request.get(urls.home)
                        .end((err, res) => {
                            let cookie = res.headers["set-cookie"].join(",").match(/(xq_a_token=.+?);/)[1];
                            let is_login = res.headers["set-cookie"].join(",").match(/(xq_is_login=.*?);/)[1];
                            if (is_login !== "xq_is_login=") {
                                resolve(cookie);
                            } else {
                                request.post(urls.login)
                                    .set(base_headers)
                                    .set("Cookie", cookie)
                                    .type("form")
                                    .send(loginPass)
                                    .redirects(0)
                                    .end((err, res) => {
                                        if (err) {
                                            reject(err);
                                        }
                                        let loginData = JSON.parse(res.text);
                                        if (loginData.access_token) {
                                            cookie = "xq_a_token=" + loginData.access_token;
                                            resolve(cookie);
                                        } else {
                                            reject("get token fail");
                                        }
                                    });
                            }
                        });
                });
            }();
        }
        static getFullStockCode(stock_code) {
            if (stock_code < "600000") {
                return "SZ" + stock_code;
            } else {
                return "SH" + stock_code;
            }
        }
    }
    return xueqiu;
};
