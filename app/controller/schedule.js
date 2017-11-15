'use strict';
const moment = require("moment");
module.exports = app => {
    class scheduleController extends app.Controller {
        * index(ctx) {
            let schedule_name = this.ctx.request.query.name;
            if(schedule_name){
                app.runSchedule(schedule_name);
                this.ctx.body = `run {$schedule_name} start success`;

            }else{
                this.ctx.body = `please confirm schedule name`;
            }
        }

    }
    return scheduleController;
};
