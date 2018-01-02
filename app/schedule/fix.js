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
        //获取过去三年的longhubang


        let now = Date.now();

        while(now){
            let date = ctx.helper.datetime("YYYYMMDD",Math.floor(now));
            if(parseInt(date) < 20100000){
                console.log(date + "less 2010")
                break;
            }
            console.log(date);
            let lhbs = yield ctx.service.longhubang.getLhbs(date);
            if(lhbs) {
                for (let i = 0; i < lhbs.length; i++) {
                    yield  ctx.service.longhubang.save(lhbs[i]);
                }
            }
            now = (now - 86400000);
        }
        console.log("over");
    },
};
