'use strict';
//
module.exports = {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  schedule: {
    interval: '30m', // 1 分钟间隔
    type: 'worker', // 指定所有的 worker 都需要执行
    disable:true
  },
  // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
  * task(ctx) {
    let date = "20171109";//ctx.helper.datetime("YYYYMMDD");;
    let cubes = yield ctx.model.XueqiuCube.find({date:date,close:0},{id:1}).find();
    for(let i = 0; i< cubes.length; i++){
        console.log(cubes[i].id);
        ctx.app.redis.rpush("cube_ids",cubes[i].id);
    }
    console.log("schedule queue finish");

//2
//       let i = 1000000;
//       for(i; i< 1040000; i++){
//           let id = "SP"+i;
//           ctx.app.redis.lpush("cube_ids",id);
//       }
//       console.log("schedule queue finish");

    // const cheerio = require("cheerio");
    // const co = require("co");
    // let date = ctx.helper.datetime("YYYYMMDD");;
    // let lastCube = yield ctx.model.XueqiuCube.find({date:date}).sort({'id':-1}).limit(1);
    // let i = 1000000;
    // if(lastCube.length > 0){
    //   // i = lastCube[0].id.replace("SP","");
    // }
    // let id = "SP"+i;
    // let cookie = "xq_a_token=daa48a9571b60c8424445ad402cc5f68ef63a371";
    // for(i; i< 1040000; i++){
    //     let id = "SP"+i;
    //     console.log(id);
    //     let sp = yield ctx.service.xueqiu.request("https://xueqiu.com/P/"+id,cookie);
    //     if(sp){
    //       ctx.app.redis.lpush("cube_htmls",sp);
    //       console.log(id+":queue pushed");
    //     }
    // }
  }

};
