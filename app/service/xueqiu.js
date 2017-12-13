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
            return _.uniq(posters);
        }

        * post(message,title,cookie) {
            let urls = this.urls;
            let base_headers = this.base_headers;
            if(!cookie){
                cookie = yield this.getLoginCookie();
            }
            let token = yield this.getToken(cookie);
            let form = {
                "status": message,
                "session_token": token
            };
            if(title){
                form = {
                    "status": message,
                    "title": title,
                    "original":0,
                    "right":true,
                    "session_token": token
                };
                base_headers.Referer = "https://xueqiu.com/write";
            }

            return new Promise((resolve, reject) => {
                request.post(urls.post)
                    .set(base_headers)
                    .set("Cookie", cookie)
                    .type("form")
                    .send(form)
                    .end((err, res) => {
                        let resData = JSON.parse(res.text);
                        if(err){
                            resolve(false);
                        }
                        if (resData && resData.error_code == "20204") {
                            //重发
                            console.log("请重发");
                            resolve(-1)
                        } else if (resData && resData.error_code) {
                            resolve(false);
                        } else {
                            console.log("发布成功");
                            resolve(resData);
                        }
                    });
            });
        }

        * chat(fromId,toId,message,cookie){
            console.log(cookie)
            if(!cookie){
                cookie = yield this.getLoginCookie();
            }
            let data = {
                "toId":toId,
                "toGroup":false,
                "sequenceId": this.getSequenceId(),
            };
            if(typeof message == "object" && message.image){
                data.image = message.image;
            }else{
                data.plain = message;
            }
            let ctx = this.ctx;
            return new Promise((resolve, reject) => {
                request.post("https://im" + Math.round(9 * Math.random()) + ".xueqiu.com/im-comet/v2/messages.json")
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
                        let result = true;
                        if (err || !res.ok) {
                            result = false;
                        }
                        //保存记录
                        data.fromId = fromId;
                        data.success = result;
                        data.created = Date.now();
                        //mongodb
                        // let model = new ctx.model.MessageRecord(data);
                        // model.save();
            console.log(data);
                        //nedb
                        const Datastore = require('nedb');
                        const db = new Datastore({ filename: './data/database/message_record.db', autoload: true });
                        db.insert(data);
                        resolve(result);
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
        * chatUploadImage(toUserId,imagePath,cookie){
            if(!cookie){
                cookie = yield this.getLoginCookie();
            }
            let urls = this.urls;
            let base_headers = this.base_headers;
            return new Promise((resolve, reject) => {
                request.post("https://xueqiu.com/photo/im/upload.json?base_content_type=text/html&content_type=text&to_id="+toUserId+"&type=2")
                    .set(base_headers)
                    .set("Cookie", cookie)
                    .attach('file', imagePath)
                    .field('filename', imagePath)
                    .end((err,res) => {
                        if(err) reject(err);
                        let resData = JSON.parse(res.text);
                        if(resData.url){
                            resolve(resData.url + '/' + resData.filename + "?" +resData.width +"x" + resData.height);
                        }else{
                            resolve(false);
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

        * request(url,cookie){
            if(!cookie){
                cookie = yield this.getLoginCookie();
            }
            return new Promise(function (resolve, reject) {
                request.get(url)
                    .set("Cookie", cookie)
                    .end((err, res) => {
                        if(err){
                          console.log(err);
                          resolve("");
                        }else{
                          resolve(res.text);
                        }
                    });
            });
        }
        * getToken(cookie) {
            if(!cookie){
                cookie = yield this.getLoginCookie();
            }
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

        * getUserInfo(uid){
            const jsdom = require("jsdom");
            const { JSDOM } = jsdom;
            return new Promise(function (resolve, reject) {
                request.get("https://xueqiu.com/u/" + uid)
                    .end((err, res) => {
                        let options = {
                            runScripts: "dangerously", //允许运行js
                            // resources: "usable" //加载外部资源js,css
                        };
                        if(err){
                            reject(err);
                        }else{
                            const dom = new JSDOM(res.text, options);
                            resolve(dom.window.SNOWMAN_TARGET);
                        }
                    });
            });
        }

        * getUserInfoByNickname(nickname){
            let cookie = yield this.getLoginCookie();
            let base_headers = this.base_headers;
            let url = "https://xueqiu.com/users/search/suggest.json?q=" + encodeURI(nickname) + "&count=1&_=" + Date.now();
            return new Promise(function (resolve, reject) {
              request.get(url)
                  .set(base_headers)
                  .set("Cookie", cookie)
                  .end((err, res) => {
                      if(err){
                          reject(err);
                      }else{
                          let data = JSON.parse(res.text);
                          if(data && data.users){
                              resolve(data.users[0]);
                          }else{
                              resolve(false);
                          }
                      }
                  });
          });
        }

        * getUserPostsByUserId(uid, cookie){
            if(!cookie){
                cookie = yield this.getLoginCookie();
            }
            let base_headers = this.base_headers;
            let url = "https://xueqiu.com/v4/statuses/user_timeline.json?page=1&user_id="+uid+"&type=0";
            return new Promise(function (resolve, reject) {
              request.get(url)
                  .set(base_headers)
                  .set("Cookie", cookie)
                  .end((err, res) => {
                      if(err){
                          reject(err);
                      }else{
                          let data = JSON.parse(res.text);
                          if(data && data.statuses){
                              resolve(data.statuses);
                          }else{
                              resolve(false);
                          }
                      }
                  });
            });
        }

        * reply(id, comment, cookie){
            if(!cookie){
                cookie = yield this.getLoginCookie();
            }
            let base_headers = this.base_headers;

            let token = yield this.ctx.service.xueqiu.getReplyToken(id, cookie);

            let params = {
                comment:`<p>${comment}</p>`,
                forward:0,
                id:id,
                session_token:token
            }
            console.log(params);
            let url = "https://xueqiu.com/statuses/reply.json";
            return new Promise(function (resolve, reject) {
              request.post(url)
                  .set(base_headers)
                  .set("Cookie", cookie)
                  .type("form")
                  .send(params)
                  .redirects(0)
                  .end((err, res) => {
                      if(err){
                          reject(err);
                      }else{
                          let data = JSON.parse(res.text);
                          if(data){
                              resolve(data);
                          }else{
                              resolve(false);
                          }
                      }
                  });
            });
        }

        * getReplyToken(id, cookie){
          if(!cookie){
              cookie = yield this.getLoginCookie();
          }
          let now = Date.now();
          let base_headers = this.base_headers;
          let url = "https://xueqiu.com/statuses/allow_reply.json?status_id="+id+"&_="+now;
          return new Promise(function (resolve, reject) {
            request.get(url)
                .set(base_headers)
                .set("Cookie", cookie)
                .end((err, res) => {
                    if(err){
                        reject(err);
                    }else{
                      request.get("https://xueqiu.com/provider/session/token.json?api_path=%2Fstatuses%2Freply.json&_="+now)
                          .set(base_headers)
                          .set("Cookie", cookie)
                          .end((err, res) => {
                              if(err){
                                  reject(err);
                              }else{
                                  let data = JSON.parse(res.text);
                                  if(data && data.session_token){
                                      resolve(data.session_token);
                                  }else{
                                      resolve(false);
                                  }
                              }
                          });
                    }
                });
          });
        }
        * getLoginCookie(options) {
            let urls = this.urls;
            let loginPass = {
                remember_me: true,
                username: "18521527528",
                password: "woshini8",
                captcha: ""
            };
            if(options){
                loginPass.username = options.username;
                loginPass.password = options.password;
            }
            if(loginPass.username){
                let designed_cookie = yield app.redis.get("user_"+loginPass.username);
                if(designed_cookie){
                    return designed_cookie;
                }
            }
            let cookie = yield app.redis.get(loginPass.username);
            if(cookie){
                return cookie;
            }
            let base_headers = this.base_headers;
            cookie = yield function () {
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

            yield app.redis.set(loginPass.username,cookie,'EX', 3600);
            return cookie;
        }
        * getLogin(username,password) {
            let urls = this.urls;
            let loginPass = {};
            loginPass.username = username;
            loginPass.password = password;
            let base_headers = this.base_headers;
            return new Promise(function (resolve, reject) {
                request.get(urls.home)
                    .end((err, res) => {
                        let cookie = res.headers["set-cookie"].join(",").match(/(xq_a_token=.+?);/)[1];
                        let is_login = res.headers["set-cookie"].join(",").match(/(xq_is_login=.*?);/)[1];
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
                                    resolve(loginData);
                                } else {
                                    resolve(false);
                                }
                            });

                    });
            });
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
