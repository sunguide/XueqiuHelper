'use strict';
const moment = require("moment");
module.exports = app => {
    class crawlerController extends app.Controller {
        async test(ctx){
            const Queue = require('../libs/queue');
            const config = require("../libs/config_example").configs;
            let queue = new Queue();
            queue.enqueue("crawler_queue",{app_id:1000,config:config},function(err,job){
                console.log(job);
            });
            ctx.body = "task comming";
        }

    }
    return crawlerController;
};
