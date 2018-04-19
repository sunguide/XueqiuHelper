'use strict';
//
module.exports = app => {

    return {
        // 通过 schedule 属性来设置定时任务的执行间隔等配置
        schedule: {
            interval: '1m', // 1 分钟间隔
            type: 'worker', // 指定所有的 worker 都需要执行
            disable: app.config.env === "local"
        },
        // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
        * task(ctx) {
            console.log("pankou start");
			let cookie = yield ctx.service.xueqiu.getLoginCookie({
                username: "18521526526",
                password: "woshini8"
            });

            let current = Date.now();
            if (new Date().getHours() < 9 || new Date().getHours() > 15  || new Date().getDay() === 0 || new Date().getDay() === 6) {
                logger.info("盘口单日尚未开市或者休市日");
                return;
            }
            let results = yield ctx.curl(`http://nuyd.eastmoney.com/EM_UBG_PositionChangesInterface/api/js?dtformat=HH:mm:ss&js=[(x)]&rows=10&cb=&page=1&type=8201,8193,4,64&_=${current}`, {dataType: 'json' })
			console.log(results);
            if(results && results.data.length > 0){
                results = results.data;
                results = results.reverse();
                let post_content = "";
                for(let i = 0;i< results.length;i++){
                    let item = results[i];
                    let date = ctx.helper.datetime("YYYY-MM-DD");
                    item = item.split(",");
                    let id = ctx.helper.md5(date + item[0]+item[2]+item[3]+item[4]);
                    let itemTime = Date.parse(date + " " + item[1]);
                    //超过60s,就失效
                    if(itemTime < (Date.now() -60000)){
						continue;
                    }
                    let isPosted = yield ctx.app.redis.get("pankou_id_"+id);

                    if(!isPosted){
                        post_content +=  "<br>$" + item[0] + "("+ctx.helper.getFullStockCode(item[4].substr(0,6)) + ")$  " + getTradeType(item[3]) + " " +item[2];
                    }
					if(i > 1){
						break;
					}
                }
				console.log("content:");
				console.log(post_content);
				console.log(cookie);
                if(post_content){
					console.log("start post");
                    let isPosted = yield ctx.service.xueqiu.post(post_content,'',cookie);
                    if(!isPosted){
						console.log("pankou post fail");
                        console.log(res.text);
                        ctx.logger.info("post fail");
                    }else{
                        ctx.logger.info(message + ": 发布成功");
                    }
                }

            }else{
                console.log("fetch pankou fail");
                console.log(results);
            }
            function * post(item, ctx){
                let date = ctx.helper.datetime("YYYY-MM-DD");
                let id = ctx.helper.md5(date + item);
                item = item.split(",");
                let itemTime = Date.parse(date + " " + item[1]);
                //超过60s,就失效
                if(itemTime < (Date.now() -60000)){
                    return;
                }
                let isPosted = yield ctx.app.redis.get("pankou_id_"+id);

                if(isPosted){
                    return;
                }else{
                    if(item[0]){
                        yield  ctx.app.redis.set("pankou_id_"+id,true);
                        let message = "$" + item[0] + "("+ctx.helper.getFullStockCode(item[4].substr(0,6)) + ")$  " + getTradeType(item[3]) + " " +item[2];
                        isPosted = yield ctx.service.xueqiu.post(message,'',cookie);
                        if(!isPosted){
                            ctx.logger.info("post fail");
                        }else{
                            ctx.logger.info(message + ": 发布成功");
                        }
                        ctx.helper.sleep(10000);//5s
                    }
                }
            }
            function getTradeType(id){
                let pankou = {1:{name:"顶级买单",color:"red",direction:1,pair:2,id:1},2:{name:"顶级卖单",color:"green",direction:-1,pair:1,id:2},4:{name:"封涨停板",color:"red",direction:1,pair:8,id:4},8:{name:"封跌停板",color:"green",direction:-1,pair:4,id:8},16:{name:"打开涨停板",color:"green",direction:-1,pair:32,id:16},32:{name:"打开跌停板",color:"red",direction:1,pair:16,id:32},64:{name:"有大买盘",color:"red",direction:1,pair:128,id:64},128:{name:"有大卖盘",color:"green",direction:-1,pair:64,id:128},256:{name:"机构买单",color:"red",direction:1,pair:512,id:256},512:{name:"机构卖单",color:"green",direction:-1,pair:256,id:512},8193:{name:"大笔买入",color:"red",direction:1,pair:8194,id:8193},8194:{name:"大笔卖出",color:"green",direction:-1,pair:8193,id:8194},8195:{name:"拖拉机买",color:"red",direction:1,pair:8196,id:8195},8196:{name:"拖拉机卖",color:"green",direction:-1,pair:8195,id:8196},8201:{name:"火箭发射",color:"red",direction:1,pair:8204,id:8201},8202:{name:"快速反弹",color:"red",direction:1,pair:8203,id:8202},8203:{name:"高台跳水",color:"green",direction:-1,pair:8202,id:8203},8204:{name:"加速下跌",color:"green",direction:-1,pair:8201,id:8204},8205:{name:"买入撤单",color:"green",direction:-1,pair:8026,id:8205},8206:{name:"卖出撤单",color:"red",direction:1,pair:8205,id:8206},8207:{name:"竞价上涨",color:"red",direction:1,pair:8208,id:8207},8208:{name:"竞价下跌",color:"green",direction:-1,pair:8207,id:8208},8209:{name:"高开5日线",color:"red",direction:1,pair:8210,id:8209},8210:{name:"低开5日线",color:"green",direction:-1,pair:8209,id:8210},8211:{name:"向上缺口",color:"red",direction:1,pair:8212,id:8211},8212:{name:"向下缺口",color:"green",direction:-1,pair:8211,id:8212},8213:{name:"60日新高",color:"red",direction:1,pair:8214,id:8213},8214:{name:"60日新低",color:"green",direction:-1,pair:8213,id:8214},8215:{name:"60日大幅上涨",color:"red",direction:1,pair:8216,id:8215},8216:{name:"60日大幅下跌",color:"green",direction:-1,pair:8215,id:8216}}
                if(pankou[id]){
                    return pankou[id]['name'];
                }else{
                    return "";
                }
            }
        }
    };
};
