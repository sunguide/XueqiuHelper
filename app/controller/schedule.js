'use strict';
const moment = require("moment");
module.exports = app => {
    class scheduleController extends app.Controller {
        * index(ctx) {
            app.runSchedule('cube_fetch');
            this.ctx.body = "run cubes start success";
        }

    }
    return scheduleController;
};
