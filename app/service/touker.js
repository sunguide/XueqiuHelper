'use strict';
const request = require("superagent");
module.exports = app => {
    class touker extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.base_headers = {
                Accept: "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4,ja;q=0.2",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
                Host: "touker.com",
                Origin: "https://touker.com",
                Pragma: "no-cache",
                Referer: "https://touker.com/",
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
                "X-Requested-With": "XMLHttpRequest"
            };
        }
        * getLoginCookie(options) {
            let urls = this.urls;
            let loginPass = {
                loginId: "18521527527",
                password: "3D0B0B468EED5CF7C71A8A2F6D1C3387",
                appId: "",
                deviceUUID:""
            };
            if(options){
                loginPass.username = options.username;
                loginPass.password = options.password;
            }
            let cookie = yield app.redis.get("touker_user_"+loginPass.username);
            if(cookie){
                console.log(cookie);
                // return this.ctx.helper.JSON.parse(cookie);
            }
            let base_headers = this.base_headers;
            cookie = yield function () {
                return new Promise(function (resolve, reject) {
                    request.post("https://m.touker.com/account/oauth/pwdLogin.do")
                        // .set("Cookie", cookie)
                        .type("form")
                        .send(loginPass)
                        .redirects(0)
                        .end((err, res) => {
                            if(err){
                                reject(err);
                                return;
                            }
                            let cookies = res.headers["set-cookie"];
                            let ssid = res.headers["set-cookie"].join(",").match(/(ssid=.*?);/)[1];
                            if (ssid) {
                                resolve(cookies);
                            } else {
                                reject(false);
                            }
                        });
                });
            }();
            if(cookie){
                yield app.redis.set("touker_user_"+loginPass.username,JSON.stringify(cookie),'EX', 1800);
            }else{
                yield app.redis.del("touker_user_"+loginPass.username);
            }
            return cookie;
        }

        * getCommentPageUrl(){
            return new Promise((resolve, reject) => {
                request.get("https://m.touker.com/sns/comment/stockDetail/601010?securityType=4&exchange=SH")
                  .end((err, res) => {
                      if(err){
                          reject(err);
                      }else{
                          const cheerio = require('cheerio');
                          let $ = cheerio.load(res.text);
                          let url = $(".reply-box .replay-detail").attr("data");
                          url = "https://m.touker.com/sns/comment/" + url.replace("../","");
                          resolve(url);
                      }
                  });
            })
        }

        * getCommentToken(url){
            let cookie = yield this.getLoginCookie();
            return new Promise((resolve, reject) => {
                request.get(url)
                  .set("Cookie",cookie)
                  .end((err, res) => {
                      if(err){
                          reject(err);
                      }else{
                          const cheerio = require('cheerio');
                          let $ = cheerio.load(res.text);
                          let token = $("#_hbtoken_").val();
                          resolve(token);
                      }
                  });
            })
        }

        * uploadImage(filePath){
            let cookie = yield this.getLoginCookie();
            let urls = this.urls;
            let base_headers = this.base_headers;
            return new Promise((resolve, reject) => {
                request.post("https://bbs.touker.com/misc.php?mod=swfupload&action=swfupload&operation=upload&fid=22")
                    // .set(base_headers)
                    .set("Cookie", cookie)
                    .attach('file', filePath)
                    .field('Filename', filePath)
                    .field('uid', 2242360)
                    .redirects(0)
                    .end((err,res) => {
                        console.log("text:dddd")
                        console.log(res.text);
                        return;
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

        * postComment(code, message, cookies){
            if(!cookies){
                cookies = yield this.getLoginCookie();
            }
            let url = yield this.getCommentPageUrl(code);
            // let token = yield this.getCommentToken(url);
            let cookie = "";
            if(cookies && cookies.length > 0){
                for(let i = 0; i< cookies.length; i++){
                    cookie += cookies[i].split(";")[0]+";"
                }
            }
            // console.log(cookies);
            // console.log(cookie);
            let params = {
                type:1,
                commentContent:message,
                prePostId:0,
                topicId:3391,
                rootId:0,
                code:code,
                topicType:2,
            }
            return new Promise((resolve, reject) => {
                request.post("https://m.touker.com/sns/comment/addCommunity.do")
                    .set("cookie", cookie)
                    .set("referer", url)
                    .type("form")
                    .send(params)
                    .redirects(0)
                    .end((err, res) => {
                        let cookie = "";
                        if(err){
                            reject(err);
                            return;
                        }
                        // console.log(res);
                        if (res.ok) {
                            resolve(true);
                        } else {
                            reject(false);
                        }
                    });
            })
        }

    }

    return touker;
};
