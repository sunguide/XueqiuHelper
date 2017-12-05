'use strict';
const moment = require("moment");
module.exports = app => {
    class apiController extends app.Controller {
        * index(ctx) {
            const info = yield ctx.service.xuangubao.getNews();
            this.ctx.body = info;
        }

        * messages(req, res) {
            const _ = require("lodash");
            let receivers = this.ctx.request.body.receiver;
            let message = _.trim(this.ctx.request.body.message);
            let fromId = this.ctx.session.uid;
            let userInfo, toId;
            if (receivers && message) {
                receivers = receivers.split(",");
                if (receivers) {

                    for (let i = 0; i < receivers.length; i++) {
                        if (isNaN(receivers[i])) {
                            userInfo = yield this.ctx.service.xueqiu.getUserInfoByNickname(receivers[i]);
                            if (userInfo) {
                                toId = userInfo['id'];
                            } else {
                                console.log("user:" + receivers[i] + " not exist")
                                continue;
                            }
                        } else {
                            toId = receivers[i];
                        }
                        yield this.ctx.service.xueqiu.chat(fromId, toId, message, "xq_a_token=" + this.ctx.session.xq_a_token);
                    }
                }
            }
            this.success({},"已经加入到发送队列中");
        }

        * cubes(){
            let ids = yield this.ctx.app.redis.llen("cube_ids");
            this.success({length:ids});
        }
        * test(ctx) {


            let cookie1 = yield this.ctx.service.xueqiu.getLoginCookie({
                username:"18521527527",
                password:"woshini8"
            });
            let cookie2 = yield this.ctx.service.xueqiu.getLoginCookie();
            this.ctx.body =  cookie1+"<br>"+cookie2
            //获取红包状态
            // ctx.body = yield ctx.service.xueqiu.request("https://xueqiu.com/statuses/bonus/state.json?status_id=94711537","xq_a_token=3b9b37c0bf75ecbee179b5b72bd3b688b18deffb;u=3595607502");
            // let departments = this.ctx.service.longhubang.getDepartments();
            // for (let i = 0; i < departments.length; i++) {
            //     if (departments[i]['中信证券上海古北路证券营业部']) {
            //         this.ctx.body = departments[i]['中信证券上海古北路证券营业部'];
            //     }
            // }



            // const moment = require("moment");
            // this.ctx.body = moment("2017-10-20").format("YYYY年MM月DD日");

            //1
            // let tips = require("../../data/investment_tips.js").tips;
            // this.ctx.body = this.ctx.helper.getOneTip(0);return;

            //2
            // this.ctx.body =  yield  ctx.service.xueqiu.post("感谢每一天给你感谢每一天给你感谢每一天给你感谢每一天给你感谢每一天给你感谢每一天给你");

            // let usermodel = new ctx.model.XueqiuUser({"username":"何丽丽","password":"******"});
            // yield usermodel.save();
            // ctx.body = yield ctx.model.XueqiuUser.find({});  // you should use upper case to access mongoose model
        }

    }
    return apiController;
};
