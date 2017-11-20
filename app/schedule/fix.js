'use strict';
//
module.exports = {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    schedule: {
        interval: '1d', // 1 分钟间隔
        type: 'worker', // 指定所有的 worker 都需要执行
        disable: true
    },
    // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
    * task(ctx) {
        console.log("fix restart");
        let start = Date.now();
        let cubes = false;
        let offset = 0;
        let limit = 100;
        while (cubes = yield ctx.model.XueqiuCube.find({positions:{$gt:0},date:20171117}).find().limit(limit).skip(offset)){
            for(let i = 0;i<cubes.length;i++){

                if(cubes[i].weights.length > 0){
                    for(let k = 0;k < cubes[i].weights.length;k++){
                      let stock_code = cubes[i].weights[k].stock_code;
                      let stock_name = cubes[i].weights[k].stock_name;
                      let stock_weight = cubes[i].weights[k].stock_weight;
                      let data = {id:cubes[i].id,date:cubes[i].date,stock_code,stock_name,stock_weight};
                      yield ctx.service.cube.addCubePosition(data);
                    }
                }
                // console.log(result);
            }
            offset += limit;
        }

        let costTime = parseFloat(Date.now() - start);
        console.log("job restart cost time: "+ costTime/1000 + "s");
    },
};
