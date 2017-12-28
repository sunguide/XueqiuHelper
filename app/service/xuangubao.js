'use strict';

module.exports = app => {
    class stock extends app.Service {
        constructor(ctx) {
            super(ctx);
        }
        * getNews(){
            let lastId = yield this.ctx.app.redis.get("xuangubao_last_id");
            let current = Math.floor(Date.now()/1000);
            let results = yield this.ctx.curl(`https://api.xuangubao.cn/api/pc/msgs?tailmark=${current}&limit=30&subjids=9,10,35,469`, {dataType: 'json' })
            console.log("start:getNews");
            if(results.data && results.data.NewMsgs){
                let msgs = results.data.NewMsgs;
                msgs = msgs.reverse();
                let cookie = yield this.ctx.service.xueqiu.getLoginCookie({
                    username: "sunguide2@wolfunds.com",
                    password: "sunguide1989"
                });
                console.log(cookie);
                for(let i = 0;i< msgs.length;i++){
                    if(msgs[i].Id <= lastId){
                        continue;
                    }else{
                        let message = msgs[i].Title;
                        let title = "";
                        if(msgs[i].Summary){
                            message = msgs[i].Summary;
                            title = msgs[i].Title;
                        }
                        if(message){
                            message.replace("选股宝讯，","");
                            message.replace("选股宝讯,","");
                            if(msgs[i].Stocks){
                                for(let k = 0; k< msgs[i].Stocks.length;k++){
                                    let stock_code = getStockCode(msgs[i].Stocks[k].Symbol);
                                    message += "  $" + msgs[i].Stocks[k].Name + "("+stock_code+")$  ";
                                }
                            }

                            if(msgs[i].BkjInfoArr){
                                for(let k = 0; k< msgs[i].BkjInfoArr.length;k++){
                                    message += " #" + msgs[i].BkjInfoArr[k].Name + "# ";
                                }
                            }
                            console.log(message);
                            let posted = yield this.ctx.service.xueqiu.post(message,title,cookie);
                            if(posted){
                                yield this.ctx.app.redis.set("xuangubao_last_id",msgs[i].Id);
                            }else{
                                console.log("post fail");
                            }
                        }
                    }
                }
            }else{
                console.log("fetch xuangubao news fail");
                console.log(results);
            }

            function getStockCode(code) {
                if(code.indexOf(".SZ") > 0 || code.indexOf(".SH") || code.indexOf(".SS")){
                    code = code.split(".");
                    if(code[1] == "SS"){
                        return "SH"+code[0];
                    }
                    return code[1]+code[0];
                }
                return code;
            }
            return results;
        }
    }

    return stock;
};
