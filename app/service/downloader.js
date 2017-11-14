'use strict';

module.exports = app => {
    class downloader extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        /**
         * request common fucntion
         * @param {String} url - Api name
         * @param {Object} [opts] - urllib options
         * @return {Promise} true or false
         */
        * request(url, opts) {
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

        * checkFails(id){
            return yield app.redis.get(id);
        }
        * setFails(id){
            return yield app.redis.incr(id);
        }


    }

    return downloader;
};
