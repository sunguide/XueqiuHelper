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
            return await this.request(`item/${id}.json`);
        }

        async getApp(id) {
            return yield this.request(`user/${id}.json`);
        }
    }

    return appService;
};
