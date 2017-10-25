'use strict';
module.exports =  {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  schedule: {
    interval: '1m', // 1 分钟间隔
    type: 'worker', // 指定所有的 worker 都需要执行
    disable: true, // 本地开发环境不执行
  },
  // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
  * task(ctx) {
    this.ctx = ctx;
    this.service = ctx.service;
    let app = ctx.app;
    let logger = ctx.logger;
    this.service = ctx.service;

    const _ = require('lodash');
    if(new Date().getHours() < 16 || new Date().getDay() === 0 || new Date().getDay() === 6){
      logger.info("单日尚未休市或者休市日");
      return;
    }
    let runKey = "longhubang_run_" + this.ctx.helper.datetime("YYYYMMDD");
    let isRun = yield app.cache.get(runKey);
    if(!isRun){
       logger.info("龙虎榜脚本 开始运行");
       yield app.cache.set(runKey,1);
    }else if(isRun > 1){
       logger.info("龙虎榜已经全部发布成功");
       return;
    }else{
       logger.info("龙虎榜脚本 已经正在运行，当前work将退出");
       return;
    }
    let lhbs = yield this.service.longhubang.getLhbs(this.ctx.helper.datetime("YYYY-MM-DD"));
    let identify;
    let result;
    if(lhbs){
        let isPosted = false;
        let multi = {sh:0,sz:0};
        for(let i = 0; i < lhbs.length; i++){
            identify = this.ctx.helper.md5(lhbs[i].buy_details.toString());
            isPosted = yield this.service.longhubang.isPostedXueqiu(identify);
            if(isPosted) continue;
            lhbs[i].identify = (lhbs[i].date).replace(new RegExp("-","gm"),"") + "_" + lhbs[i].stock_code + "_" + identify;
            lhbs[i].comments = yield this.service.longhubang.analyze(lhbs[i]);
            //当买入小于五个营业部的时候，不@，说明是新股，一字板
            if(lhbs[i].buy_details.length === 5){
              let posters = yield this.service.xueqiu.getRecentPoster(lhbs[i].stock_code);
              if(posters){
                  posters = "<p>[鼓鼓掌][鼓鼓掌][鼓鼓掌]有请股友@" + _.chunk(posters,5)[0].join(", @") + " 来点评一下今日的龙虎榜单[献花花][献花花][献花花]</p>";
              }
            }

            let imagePath = yield this.service.longhubang.geneImage(lhbs[i]);
            let uploadImageURL = yield this.service.xueqiu.uploadImage(imagePath);
            let stock_anchor = this.ctx.helper.getStockAnchor(lhbs[i].stock_code, lhbs[i].stock_name);
            let comments = lhbs[i].comments ? (`<p>榜单分析：${lhbs[i].comments}</p>`) : "";
            let secret = "<p><br><br><br><br>密文：" + this.ctx.helper.randomChinese(200)+"</p>";
            let message = '<p>' + stock_anchor +lhbs[i].date + '龙虎榜' + '</p><p>上榜理由：'+ lhbs[i].reason
                          + '</p>' + posters + comments + '<div class="img-single-upload"><img src="' + uploadImageURL + '" class="ke_img">' + secret + '</div>',
            result = yield this.service.xueqiu.post(message);
            if(result){
                yield this.service.longhubang.setPostedXueqiu(identify,{"message":message},true);
            }else{
                yield this.service.longhubang.setPostedXueqiu(identify,{"message":message},false);
            }
            if(lhbs[i].stock_code < 600000){
               multi.sz = 1;
            }else{
               multi.sh = 1;
            }
            if(i < (lhbs.length - 1)){
                // yield this.ctx.helper.sleep(120000);
            }
        }
        if((multi.sz + multi.sh) === 2){
            yield app.cache.set(runKey,2);
            logger.info("all finish!")
        }else{
            yield app.cache.set(runKey,0);//下次可以重新运行
            logger.info("sz finish!")
        }
    }else{
        logger.info("not found 龙虎榜");
    }
  },
};
