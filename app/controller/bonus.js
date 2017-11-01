'use strict';
const moment = require("moment");
module.exports = app => {
    class bonusController extends app.Controller {
        * index(ctx) {
            const request = require("superagent");
            let url = 'http://api.xueqiu.com/statuses/bonus/list.json?max_id=-1&since_id=-1&size=20&user_id=3595607502&_=1509457988187&_s=b268f6&_t=DD0BD5D4-128D-41FF-973B-3EFE5FF93C5F.3595607502.1509457782293.1509457988188';
             // request.get(url)
             //    .set("Cookie", "xq_a_token=3b9b37c0bf75ecbee179b5b72bd3b688b18deffb;u=3595607502")
             //    .end((err, res) => {
             //        console.log(res.text);
             //    });
            //获取红包列表
            let bonus = yield ctx.service.xueqiu.request(url,"xq_a_token=3b9b37c0bf75ecbee179b5b72bd3b688b18deffb;u=3595607502");
            bonus = JSON.parse(bonus);
            let bonuses = [];
            // ctx.body = bonus;return;
            let notify = ""
            if(bonus && bonus.items.length > 0){
                for(let i = 0; i < bonus.items.length; i++){
                    let id = bonus.items[i]['id'];
                    let bonus_info = yield ctx.service.xueqiu.request("https://xueqiu.com/statuses/bonus/state.json?status_id="+id,"xq_a_token=3b9b37c0bf75ecbee179b5b72bd3b688b18deffb;u=3595607502");
                    console.log(bonus_info);
                    bonus_info = JSON.parse(bonus_info);
                    let title = bonus.items[i]['description'];
                    let target = "http://xueqiu.com" + bonus.items[i].target;
                    if(bonus_info && bonus_info.bonus.state == "DONE"){
                      bonuses.push({
                        url:target,title:"Done:"+title,done:true
                      })
                    }else{
                      bonuses.push({
                        url:target,title:"赶紧抢：:"+title,done:false
                      });
                      notify = "有新红包："
                    }
                    if(i>1){break;}
                }
            }
            yield this.ctx.render('bonus/index.tpl',{"bonus":bonuses,notify:notify});
            //获取红包状态
            // ctx.body = yield ctx.service.xueqiu.request("https://xueqiu.com/statuses/bonus/state.json?status_id=94711537","xq_a_token=3b9b37c0bf75ecbee179b5b72bd3b688b18deffb;u=3595607502");
            // let departments = this.ctx.service.longhubang.getDepartments();
            // for (let i = 0; i < departments.length; i++) {
            //     if (departments[i]['中信证券上海古北路证券营业部']) {
            //         this.ctx.body = departments[i]['中信证券上海古北路证券营业部'];
            //     }
            // }



            // const moment = require("moment");
            // this.ctx.body = moment("2017-10-20").format("YYYY年MM月DD日");

            //1
            // let tips = require("../../data/investment_tips.js").tips;
            // this.ctx.body = this.ctx.helper.getOneTip(0);return;

            //2
            // this.ctx.body =  yield  ctx.service.xueqiu.post("感谢每一天给你感谢每一天给你感谢每一天给你感谢每一天给你感谢每一天给你感谢每一天给你");

            // let usermodel = new ctx.model.XueqiuUser({"username":"何丽丽","password":"******"});
            // yield usermodel.save();
            // ctx.body = yield ctx.model.XueqiuUser.find({});  // you should use upper case to access mongoose model
        }

    }
    return bonusController;
};
