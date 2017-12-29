'use strict';
const request = require("superagent");
module.exports = app => {
    class touker extends app.Service {
        constructor(ctx) {
            super(ctx);
        }
        * getLoginCookie(options) {
            let urls = this.urls;
            let loginPass = {
                loginId: "13800000330",
                password: "22D05E795A4D63232E8C8DA2CCC325A4",
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

        * postComment(code, message){
            message = "$文峰股份(601010.SH)$的的是否多少多少速度 ";
            let cookies = yield this.getLoginCookie();
            let url = yield this.getCommentPageUrl(code);
            let token = yield this.getCommentToken(url);
            let cookie = "";
            if(cookies && cookies.length > 0){
                for(let i = 0; i< cookies.length; i++){
                    cookie += cookies[i].split(";")[0]+";"
                }
            }
            console.log(cookies);
            console.log(cookie);
            let params = {
                type:1,
                commentContent:message,
                prePostId:0,
                topicId:3391,
                rootId:0,
                code:code,
                topicType:2,
                _hbtoken_:token
            }
            console.log(params);
            return new Promise((resolve, reject) => {
                request.post("https://m.touker.com/sns/comment/addPublish.do")
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
