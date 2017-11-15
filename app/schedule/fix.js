'use strict';
//
module.exports = {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    schedule: {
        interval: '1d', // 1 分钟间隔
        type: 'all', // 指定所有的 worker 都需要执行
        disable: true
    },
    // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
    * task(ctx) {
        console.log("job restart");
        let start = Date.now();
        let cubes = false;
        while (cubes = yield ctx.model.XueqiuCube.find({close:0,positions:{$exists:false}}).find().limit(100)){
            for(let i = 0;i<cubes.length;i++){
                let positions = 0;
                if(cubes[i].weights.length > 0){
                    for(let k = 0;k < cubes[i].weights.length;k++){
                        positions += cubes[i].weights[k].stock_weight;
                    }
                }
                console.log(cubes[i]._id);
                let result = yield ctx.model.XueqiuCube.findByIdAndUpdate(cubes[i]._id,{positions:positions});
                // console.log(result);
            }
        }

        let costTime = parseFloat(Date.now() - start);
        console.log("job restart cost time: "+ costTime/1000 + "s");
    },
};
