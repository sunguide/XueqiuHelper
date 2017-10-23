'use strict';
const moment = require("moment");
module.exports = app => {
    class indexController extends app.Controller {
        * index() {
            // this.ctx.body = "fuck ";

            yield this.ctx.helper.sleep(10000);
            // console.log(lhbs);

            this.ctx.body = "hddd";
        }
        * test(){
            let info = yield this.ctx.service.xueqiu.chat(3595607502,5435417380,"我们能否合作一下")
            this.ctx.body = info;
        }
        * test1(){

            const info = yield app.runSchedule('longhubang2');
            console.log(info);
            this.ctx.body = info;
        }
        * posters(){
          const _ = require('lodash');
          let posters = yield this.service.xueqiu.getRecentPoster("002049");
          posters = "@" + _.chunk(posters,5)[0].join(", @");
          this.ctx.body = posters;
          // let result = yield this.service.xueqiu.post("请" +posters + " 来点评一下 $同方股份(SH600100)$ ");
        }

        * test2(){
            // var t = this, s = jQuery.ajax({
            //     url: n.getBaseUrl() + "/v2/messages.json?user_id=" + window.SNOWMAN_USER.id,
            //     type: "POST",
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     data: JSON.stringify(e)
            // });
            // $.ajax({
            //     type: "post",
            //     url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=359560750",
            //     data:JSON.stringify({
            //         "toId":"5435417380",
            //         "toGroup":false,
            //         "sequenceId": 320852957,
            //         "plain":"明天见"
            //     }),
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     success: function (data) {
            //         console.log(data);
            //     },
            //     error: function (XMLHttpRequest, textStatus, errorThrown) {
            //         alert(errorThrown);
            //     }
            // });
            //
            // $.ajax({
            //     type: "POST",
            //     url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=359560750",
            //     data:JSON.stringify({
            //         "plain":"明天见",
            //         "sequenceId": 320852957,
            //         "toGroup":false,
            //         "toId":5435417380,
            //     }),
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     success: function (data) {
            //         console.log(data);
            //     },
            //     error: function (XMLHttpRequest, textStatus, errorThrown) {
            //         alert(errorThrown);
            //     }
            // });
            // var t = this, s = jQuery.ajax({
            //     url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=" + window.SNOWMAN_USER.id,
            //     type: "POST",
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     data: '{"toId":5435417380,"toGroup":false,"sequenceId":32085297,"plain":"哈哈哈2"}'
            // });
            jQuery.ajax({
                url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=586328842",
                type: "POST",
                timeout: 2e4,
                headers:{Cookie:"xq_a_token=a365d23ab715f9c3b963dc268149f35031ddb8c1"},
                contentType: "application/json",
                data: '{"toId":5435417380,"toGroup":false,"sequenceId":32085299,"plain":"新的一天"}'
            });
        }


    }
    return indexController;
};
