'use strict';
const cache = require("./app/libs/cache.js");
module.exports = app => {
    class CustomController extends app.Controller {
        get uid() {
            return this.ctx.session.uid;
        }
        success(data) {
            this.ctx.body = {
                success: true,
                data,
            };
        }
        error(msg) {
            msg = msg || '未知错误';
            this.ctx.body = {
                success:false,
                message:msg
            };
        }
    }
    app.Controller = CustomController;
    app.cache = cache;
};
