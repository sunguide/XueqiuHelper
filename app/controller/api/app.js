'use strict';
const moment = require("moment");
module.exports = app => {
    class userApiController extends app.Controller {
        * register(req, res) {
            const _ = require("lodash");
            let app_name = _.trim(this.ctx.request.body.app_name || this.ctx.request.query.app_name);
            let app_repos = _.trim(this.ctx.request.body.app_repos || this.ctx.request.query.app_repos);
            let result = false;
            let data = {name:app_name,repos:app_repos}
            if (app_name && app_repos) {
                let exist = yield this.ctx.model.App.find({name:app_name});
                if(exist.length > 0){
                    this.error("应用已经存在")
                }else{
                    let model = new this.ctx.model.App(data);
                    result = yield model.save();
                    if(result){
                        this.success(data,"注册成功")
                    }else{
                        this.error("注册失败")
                    }
                }
            }
        }

        * update(req, res) {
            const _ = require("lodash");
            let username = _.trim(this.ctx.request.body.username || this.ctx.request.query.username);
            let password = _.trim(this.ctx.request.body.password || this.ctx.request.query.password);
            let verify_code = _.trim(this.ctx.request.body.verify_code || this.ctx.request.query.verify_code);
            let result = false;
            if (username && password) {
                console.log({username,password});
                result = yield this.ctx.model.User.find({username,password});
                result = result.length > 0 ? true:false;
            }
            if(result){
                this.success(result,"登录成功")
            }else{
                this.error("登录失败")
            }
        }

    }
    return userApiController;
};