'use strict';

module.exports = app => {
    class indexController extends app.Controller {
        * index() {
            // this.ctx.body = "fuck ";
            const data = { name: 'egg' };
            // render a template, path relate to `app/view`
            // yield this.ctx.render('home/index.tpl', data);
            // this.ctx.body = yield this.service.xueqiu.getTodayStockInfo(600100);
            this.ctx.body = yield this.service.longhubang.getLhbs(600100);
        }
    }
    return indexController;
};
