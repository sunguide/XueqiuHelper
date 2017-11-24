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

        async dispatch(ctx){
            console.log("job start/");
            console.log(this.app.job);
            let result = await this.app.job.publish({
              name:"download",
              queue:"download_1232434",
              workers:10,
              ttl:12123423,
            });
            console.log(result);
            console.log("job end/");
            await this.app.redis.publish("task",JSON.stringify({name:"download"}));


            var job = ctx.app.kue.create('task_download', {
                title: 'welcome email for tj',
                to: 'tj@learnboost.com',
                template: 'welcome-email',
                url:"https://www.baiud.com"
            }).save( function(err){
               if( !err ) console.log( job.id );
            });

            await this.app.redis.set("task_download",10);
            ctx.body = "task comming";
        }

    }
    return scheduleController;
};
