'use strict';
const moment = require("moment");
module.exports = app => {
    class userApiController extends app.Controller {
        * register(req, res) {
            const _ = require("lodash");
            let username = _.trim(this.ctx.request.body.username || this.ctx.request.query.username);
            let nickname = _.trim(this.ctx.request.body.nickname || this.ctx.request.query.nickname);
            let password = _.trim(this.ctx.request.body.password || this.ctx.request.query.password);
            let verify_code = _.trim(this.ctx.request.body.verify_code || this.ctx.request.query.verify_code);
            let result = false;
            let data = {username,nickname,password}
            if (username && password) {
                let exist = yield this.ctx.model.User.find({username});
                console.log(exist);
                if(exist){
                    this.error("用户已经存在")
                }else{
                  let model = new this.ctx.model.User(data);
                  result = yield model.save();
                }
            }
            if(result){
                this.success(data,"注册成功")
            }else{
                this.error("注册失败")
            }
        }

        * login(req, res) {
            const _ = require("lodash");
            let username = _.trim(this.ctx.request.body.username);
            let password = _.trim(this.ctx.request.body.password);
            let verify_code = _.trim(this.ctx.request.body.verify_code);
            let result = false;
            if (username && password) {
                result = yield this.ctx.model.User.find({username,password});
            }

            if(result){
                this.success(result,"登录成功")
            }else{
                this.error({},"登录失败")
            }
        }

    }
    return userApiController;
};
