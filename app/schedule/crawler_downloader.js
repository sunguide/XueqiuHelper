'use strict';
const Downloader = require("../libs/downloader")
module.exports = app => {
    return {
        // 通过 schedule 属性来设置定时任务的执行间隔等配置
        schedule: {
            interval: '10m', // 1 分钟间隔
            type: 'worker', // 指定所有的 worker 都需要执行
            immediate: true,
            disable: false
        },
        // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
        * task(ctx) {
            console.log("downloader start");
            let start = Date.now();
            let downloader = new Downloader();
            downloader.dequeue(startDownload);
            function startDownload(job, done) {
                if(!(job.data.url)) {
                    return done(new Error('invalid url address'));
                }else{

                }
                console.log(job.data.url);
            }

            let costTime = parseFloat(Date.now() - start);
            console.log("downloader cost time: "+ costTime/1000 + "s");
        }
    };
};
