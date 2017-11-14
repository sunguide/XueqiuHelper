'use strict';

module.exports = app => {
    class queue extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        * pop(name) {
            const options = Object.assign({
                timeout: [ '30s', '30s' ],
            }, opts);

            const result = yield this.ctx.curl(url, options);
            if(result.ok){
                return result.text;
            }else{
                return false;
            }
        }

        * push(name, value){

        }

    }

    return queue;
};
