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
                follows: "https://xueqiu.com/follows"
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

            let cookie = yield this.getLoginCookie();
            let data = {
                "toId":toId,
                "toGroup":false,
                "sequenceId": this.getSequenceId(),
                "plain":message
            };
            console.log(data);
            console.log(cookie);
            return new Promise((resolve, reject) => {
                request.post("https://im7.xueqiu.com/im-comet/v2/messages.json")
                    .query({ user_id: fromId })
                    .set("Cookie",cookie)
                    .set('Content-Type', 'application/json')
                    .set('Host','im7.xueqiu.com')
                    .set('Origin','https://xueqiu.com')
                    .set('Referer','https://xueqiu.com/')
                    .set('Content-Type', 'application/json')
                    .set("User-Agent",'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
                    .send(JSON.stringify(data))
                    .withCredentials()
                    .end(function(err, res){
                        if (err || !res.ok) {
                            resolve(false);
                        } else {
                            // console.log(res.body);
                            resolve(true);
                        }
                    });
            });

        }

        getSequenceId(){
            return parseInt(Math.random() * 10000000 + "" + 1,10);
        }

        * getFollows(page){
          let cookie = yield this.getLoginCookie();
          let base_headers = this.base_headers;
          let urls = this.urls;
          return new Promise(function (resolve, reject) {
              request.get(urls.follows + (page ? "?page=" + page:""))
                  .set(base_headers)
                  .set("Cookie", cookie)
                  .end((err, res) => {
                      if (!err) {
                          let data = res.text;
                          let _ = require("lodash");
                          data = _.trim(data.split("var follower = ")[1].split("if(follower.followers && !follower.followers.length){")[0]);
                          data = JSON.parse(data.substr(0, data.length - 1));
                          resolve(data);
                      } else {
                          reject(err);
                      }
                  });
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
