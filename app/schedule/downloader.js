'use strict';
//
module.exports = {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    schedule: {
        interval: '5s', // 1 分钟间隔
        type: 'worker', // 指定所有的 worker 都需要执行
        disable: true
    },
    // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
    * task(ctx) {
        console.log("job restart");
        let start = Date.now();
        let job = false;
        while (job = yield ctx.app.redis.lpop("downloader_queue")) {
            ctx.app.redis.zadd("downloader_queue_fails",Date.now(),job);
            let url = job.url || '';
            let options = job.options || {};
            if(!url){
                ctx.app.redis.zrem("downloader_queue_fails",job);
                continue;
            }
            let result = yield ctx.service.downloader.fetch(job.url, options);
            if(result){
                ctx.app.redis.zrem("cube_ids_fails",id);
            }else{
                //fail times 
                if(checkFails(id) > 5){

                }
                console.log("fetch fail:"+id);
            }
        }

        let costTime = parseFloat(Date.now() - start);
        console.log("job restart cost time: "+ costTime/1000 + "s");
    },
};
