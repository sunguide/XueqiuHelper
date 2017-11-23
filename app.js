'use strict';
const cache = require("./app/libs/cache.js");
module.exports = app => {
    class CustomController extends app.Controller {
        get uid() {
            return this.ctx.session.uid;
        }
        success(data,message) {
            message = message || "操作成功";
            this.ctx.body = {
                success: true,
                data,
                message
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
    // 获取所有的 loadUnit
    const path = require("path");
    const jobPaths = app.loader.getLoadUnits().map(unit => {
      return path.join(unit.path, 'app/job');
    });

    app.loader.loadToContext(jobPaths, 'job', {
      // service 需要继承 app.Service，所以要拿到 app 参数
      // 设置 call 在加载时会调用函数返回 UserService
      call: true,
      // 将文件加载到 app.serviceClasses
      fieldClass: 'job',
    });
    //启动kue ui
    const kue = require("kue");
    var q = kue.createQueue({
      prefix: 'q',
      redis: {
        port: 6319,
        host: '10.0.30.61',
        auth: 'fuckyou',
        db: 10, // if provided select a non-default redis db
        options: {
          // see https://github.com/mranney/node_redis#rediscreateclient
        }
      }
    });
    kue.app.listen(7002);
};
