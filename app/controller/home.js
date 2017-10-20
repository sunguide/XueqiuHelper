'use strict';
const moment = require("moment");
module.exports = app => {
    class indexController extends app.Controller {
        * index() {
            // this.ctx.body = "fuck ";

          
            // console.log(lhbs);

            this.ctx.body = lhbs;
        }
        * test(){

          this.ctx.body =  this.ctx.helper.getStockAnchor(600000, 5555);

        }
        * posters(){
          const _ = require('lodash');
          let posters = yield this.service.xueqiu.getRecentPoster("002049");
          posters = "@" + _.chunk(posters,5)[0].join(", @");
          this.ctx.body = posters;
          // let result = yield this.service.xueqiu.post("请" +posters + " 来点评一下 $同方股份(SH600100)$ ");
        }
    }
    return indexController;
};
