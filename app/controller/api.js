'use strict';
const moment = require("moment");
module.exports = app => {
    class apiController extends app.Controller {
        * index() {
            this.ctx.body = "hddd";
        }

        * messages(req,res){
            let receivers = this.ctx.request.body.receiver;
            this.ctx.body = receivers;

        }
        * test(ctx){
            let usermodel = new ctx.model.XueqiuUser({"userName":"何丽丽","password":"******"});
            yield usermodel.save();
            ctx.body = yield ctx.model.XueqiuUser.find({});  // you should use upper case to access mongoose model
        }
    }
    return apiController;
};
