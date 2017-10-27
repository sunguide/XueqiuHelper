'use strict';
const moment = require("moment");
module.exports = app => {
    class apiController extends app.Controller {
        * index() {
            this.ctx.body = "hddd";
        }

        * messages(req,res){
            const _ = require("lodash");
            let receivers = this.ctx.request.body.receiver;
            let message = _.trim(this.ctx.request.body.message);
            let fromId = this.ctx.session.uid;
            if(receivers && message){
               receivers = receivers.slice(",");
               if(receivers){
                  let userInfo,userId;
                  for(let i = 0; i < receivers.length; i++){
                     if(isNaN(receivers[i])){
                       userId = receivers[i];
                     }else{
                       userInfo = this.ctx.service.getUserInfoByNickname(receivers[i]);
                       if(userInfo){
                          userId = userInfo['id'];
                       }else{
                         console.log("user:" + receivers[i] + " not exist")
                         continue;
                       }
                     }
                     yield this.ctx.service.xueqiu.chat(fromId,toId,message);
                  }
               }
            }
        }
        * test(ctx){
            let usermodel = new ctx.model.XueqiuUser({"userName":"何丽丽","password":"******"});
            yield usermodel.save();
            ctx.body = yield ctx.model.XueqiuUser.find({});  // you should use upper case to access mongoose model
        }
    }
    return apiController;
};
