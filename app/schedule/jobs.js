'use strict';
//
module.exports = app => {
    return {
        // 通过 schedule 属性来设置定时任务的执行间隔等配置
        schedule: {
            interval: '1m', // 1 分钟间隔
            type: 'worker', // 指定所有的 worker 都需要执行
            disable: app.config.env === "local", // 本地开发环境不执行
        },
        // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
        * task(ctx) {
            console.log("job restart");
            let start = Date.now();
            let ids = yield ctx.app.redis.zrangebyscore("cube_ids_fails",0,Date.now());

            if(ids && ids.length > 0){
                for(let i =0; i< ids.length;i++){
                    yield ctx.app.redis.rpush("cube_ids",ids[i]);
                    yield ctx.app.redis.zrem("cube_ids_fails",ids[i]);
                }
            }else{
                console.log("no jobs");
                return;
            }

            let costTime = parseFloat(Date.now() - start);
            console.log("job restart cost time: "+ costTime/1000 + "s");
        },
    }

};
