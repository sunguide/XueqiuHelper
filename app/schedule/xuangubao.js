'use strict';
//
module.exports = {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    schedule: {
        interval: '5s', // 1 分钟间隔
        type: 'worker', // 指定所有的 worker 都需要执行
        disable: false
    },
    // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
    * task(ctx) {
        console.log("xuangubao start");
        yield ctx.service.xuangubao.getNews();
    }
};
