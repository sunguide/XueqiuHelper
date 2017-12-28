'use strict';
const request = reuire("superagent");
module.exports = app => {
    class touker extends app.Service {
        constructor(ctx) {
            super(ctx);
        }
        * getLoginCookie(options) {
            let urls = this.urls;
            let loginPass = {
                loginId: "13800000329",
                password: "59042F37775D01FDCE687B654EAA888515BC6EFFDE8AEA6F",
                appId: "",
                deviceUUID:""
            };
            if(options){
                loginPass.username = options.username;
                loginPass.password = options.password;
            }
            let cookie = yield app.redis.get("touker_user_"+loginPass.username);
            if(cookie){
                return cookie;
            }
            let base_headers = this.base_headers;
            cookie = yield function () {
                return new Promise(function (resolve, reject) {
                    request.post("https://m.touker.com/account/oauth/pwdLogin.do")
                        .set(base_headers)
                        .set("Cookie", cookie)
                        .type("form")
                        .send(loginPass)
                        .redirects(0)
                        .end((err, res) => {
                            let cookie = "";
                            if(res.headers["set-cookie"] && res.headers["set-cookie"].length > 0){
                                for(i = 0; i<res.headers["set-cookie"].length;i++){
                                    cookie += res.headers["set-cookie"][i].split(";")[0]+";"
                                }
                            }
                            let is_login = res.headers["set-cookie"].join(",").match(/(ssid=.*?);/)[1];
                            console.log(cookie);
                            console.log(is_login);
                            if (is_login !== "xq_is_login=") {
                                resolve(cookie);
                            } else {
                                reject(false);
                            }
                        });
                });
            }();

            yield app.redis.set("touker_user_"+loginPass.username,cookie,'EX', 1800);
            return cookie;
        }
    }

    return touker;
};
