'use strict';
const moment = require("moment");
module.exports = app => {
    class scheduleController extends app.Controller {
        * index(ctx) {
            let schedule_name = this.ctx.request.query.name;
            if(schedule_name){
                app.runSchedule(schedule_name);
                this.ctx.body = `run ${schedule_name} start success`;

            }else{
                this.ctx.body = `please confirm schedule name`;
            }
        }

        * dispatch(ctx){
            yield this.app.redis.publish("task",JSON.stringify({name:"download"}));
            var job = ctx.app.kue.create('task_download', {
                title: 'welcome email for tj',
                to: 'tj@learnboost.com',
                template: 'welcome-email',
                url:"https://www.baiud.com"
            }).save( function(err){
               if( !err ) console.log( job.id );
            });

            yield this.app.redis.set("task_download",10);
            ctx.body = "task comming";
        }

    }
    return scheduleController;
};
