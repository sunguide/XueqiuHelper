'use strict';
const moment = require("moment");
module.exports = app => {
    class scheduleController extends app.Controller {
        * index(ctx) {
            app.runSchedule('cubes');
            this.ctx.body = "run cubes start success";
        }

    }
    return scheduleController;
};
