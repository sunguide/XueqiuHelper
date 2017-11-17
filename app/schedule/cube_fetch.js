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

    let dates = yield ctx.model.XueqiuCube.aggregate([{
        $match:{
            close: 0
        }
    },{
        $group:{
            _id: '$date'
        }
    }]).sort({_id:-1});
    if(dates.length > 0){
       date = dates[1]._id;
    }

    let cubes = yield ctx.model.XueqiuCube.find({date:date,close:0},{id:1}).find().sort({id:-1});
    if(cubes.length > 0){
       let lastNumber  = cubes[0].id.replace("SP","");
       for(let i = 1; i < 100; i++){
           cubes.push({id:"SP"+(parseInt(lastNumber) + i)});
       }
    }
    for(let i = 0; i< cubes.length; i++){
        console.log(cubes[i].id);
        yield ctx.app.redis.rpush("cube_ids",cubes[i].id);
    }
    console.log("schedule queue finish");
  }

};
