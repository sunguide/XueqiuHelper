'use strict';
const moment = require("moment");
module.exports = app => {
    class controller extends app.Controller {

        * getFullLhbs(ctx){
            //获取过去三年的longhubang


            let now = Date.now();

            const moment = require("moment");
            while(now){
                let date = ctx.helper.datetime("YMD",Math.floor(now));
                if(date < 20100000){
                    break;
                }
                console.log(date);
                let lhbs = yield ctx.service.longhubang.getLhbs("20171228");
                if(lhbs) {
                    for (let i = 0; i < lhbs.length; i++) {
                        yield  ctx.service.longhubang.save(lhbs[i]);
                    }
                }
                now = (now - 86400000);
            }
            this.ctx.body = "over";

        }

        * test(){
            if(lhbs){
                for(let i = 0; i< lhbs.length; i++){
                    let item = lhbs[i];
                    let id = ctx.helper.md5(item.date + item.stock_code + item.reason);

                    let data = {
                        id:id,
                        stock_code:item.stock_code,
                        stock_name:item.stock_name,
                        date:item.date,
                        reason:item.reason,
                        buy_amount:item.buy_amount,
                        sell_amount:item.sell_amount,
                        net_amount:item.buy_amount - item.sell_amount,
                        buy_details:item.buy_details,
                        sell_details:item.sell_details
                    };
                    // if(item.buy_details){
                    //     for(let k = 0; k < item.buy_details.length; k++){
                    //         data['buy'+(k+1)] = item.buy_details[k].amount
                    //     }
                    // }
                    ctx.model.Longhubang.find({id: id}, function (err, exist) {
                        if (exist.length === 0) {
                            let Cube = new ctx.model.Longhubang(data);
                            Cube.save(function (err, docs) {
                                console.log("save success" + docs)
                                if(err){
                                    resolve(false);
                                }else{
                                    resolve(true);
                                }
                            });
                        } else {
                            // ctx.model.XueqiuCube.update({id: id, date: date}, data, {multi: true}, function (err) {
                            //     if(err){
                            //         resolve(false);
                            //     }else{
                            //         resolve(true);
                            //     }
                            // });
                        }
                    });
                }
            }
        }
    }
    return controller;
};
