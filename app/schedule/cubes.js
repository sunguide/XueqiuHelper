'use strict';
//
module.exports = {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  schedule: {
    interval: '1d', // 1 分钟间隔
    type: 'all', // 指定所有的 worker 都需要执行
  },
  // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
  * task(ctx) {
      let date = ctx.helper.datetime("YYYYMMDD");;
      let lastCube = yield ctx.model.XueqiuCube.find({date:date}).sort({'id':-1}).limit(1);
      let i = "1000000";
      if(lastCube.length > 0){
        i = parseFloat(lastCube[0].id);
      }
      console.log(i);
      for(i; i< 1100000; i++){
          let id = "SP"+i;

          let exits = yield ctx.model.XueqiuCube.find({"id":id,"date":date});

          if(exits.length > 0){
              continue;
          }
          let sp = yield ctx.service.xueqiu.request("https://xueqiu.com/P/"+id,"xq_a_token=daa48a9571b60c8424445ad402cc5f68ef63a371");
          const cheerio = require("cheerio")
          let $ = cheerio.load(sp,{decodeEntities: false});
          let name = $(".cube-title .name").html();
          if(!name){
              console.log(id+"[404]");
              continue;
          }
          let nav = parseFloat($(".cube-blockmain .cube-profit-day .per").last().html());
          let username = $(".cube-creator-info .name").html();
          let uidElement = $(".cube-creator-info a").first();
          let uid = 0;
          if(uidElement){
              uid = uidElement.attr("href");
              if(uid){
                  uid = parseFloat(uid.replace("/",""));
              }
          }
          let close = $(".cube-closed").length;
          let weights = [];
          $('.weight-list .stock').each(function (i,item) {
              let stock_name = $(item).find(".stock-name .name").html();
              let stock_code = $(item).find(".stock-name .price").html();
              let stock_weight = parseFloat($(item).find(".stock-weight").html());
              weights.push({stock_name,stock_code,stock_weight});
          });
          let data = {id,nav,name,weights,uid,username,date,close};
          let Cube = new ctx.model.XueqiuCube(data);
          Cube.save();
      }
  },
};
