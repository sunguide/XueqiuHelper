'use strict';

module.exports = app => {
    class stock extends app.Service {
        constructor(ctx) {
            super(ctx);
        }
        * notifyLHB(stockCode,imagePath){
            let date = this.ctx.helper.datetime("YYYYMMDD");
            let fromId = 3595607502;
            let condition = {date:date,stock_code:stockCode,stock_weight:{$gt:0}};
            let users = yield this.ctx.model.XueqiuCubePosition.find(condition);
            console.log(users);
            if(users && users.length > 0){
                for(let i = 0; i< users.length;i++){
                    //发送龙虎榜通知
                    if(users[i].uid){
                        let imageURl = yield this.ctx.service.xueqiu.chatUploadImage(users[i].uid,imagePath);
                        let result = yield this.ctx.service.xueqiu.chat(fromId,users[i].uid,{image:imageURL});
                        if(result){
                            if(!app.redis.get(stockCode + date)){
                                let stockName = users[i].stock_name;
                                yield this.ctx.service.chat(fromId,uid,`今日您的股票${stockName}龙虎榜已经为您送上，请查阅，如果想取消订阅，请回复取消。`);
                                app.redis.set(stockCode + date,1);
                            }
                        }
                    }
                }
            }
        }
        chatQueue(){

        }
    }

    return stock;
};
