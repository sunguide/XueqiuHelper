'use strict';

module.exports = app => {
    class stock extends app.Service {
        constructor(ctx) {
            super(ctx);
        }
        * getNews(){
            let lastId = this.ctx.app.redis.get("xuangubao_last_id");
            let current = Date.now()/1000;
            let results = yield this.ctx.curl(`https://api.xuangubao.cn/api/pc/msgs?tailmark=${current}&limit=30&subjids=9,10,35,469`)

        }
    }

    return stock;
};
