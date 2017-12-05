'use strict';

module.exports = app => {
    /**
     * HackerNews Api Service
     */
    class appService extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        async register(data) {

        }

        async getConfig(id) {
            return await this.ctx.model.app.find(id)
        }

        async getApp(id) {
            return await this.ctx.model.app.find(id)
        }
    }

    return appService;
};
