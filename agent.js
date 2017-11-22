// agent.js
module.exports = agent => {
    // 在这里写你的初始化逻辑

    // 也可以通过 messenger 对象发送消息给 App Worker
    // 但需要等待 App Worker 启动成功后才能发送，不然很可能丢失
    const redis = require("redis");
    agent.sub = redis.createClient('6379', '10.0.30.61',{password:"fuckyou",db:10});
    agent.pub = redis.createClient('6379', '10.0.30.61',{password:"fuckyou",db:10});

    agent.messenger.on('egg-ready', () => {
        const data = {  };
    });

    class ClusterStrategy extends agent.ScheduleStrategy {
      start() {
        // 订阅其他的分布式调度服务发送的消息，收到消息后让一个进程执行定时任务
        // 用户在定时任务的 schedule 配置中来配置分布式调度的场景（scene）
        console.log(this.schedule);
        const $this = this;
        agent.sub.subscribe(this.schedule.sence);
        agent.sub.on("message",function(channel,data){
            console.log($this.schedule.sence);
            if(channel == $this.schedule.sence);
            console.log("do1: " + channel +"   " +data);
            $this.sendOne();
        });
        // console.log('subscribe schedule' + schedule.scene);
      }
    }

    agent.schedule.use('cluster', ClusterStrategy);


    //任务调度
    agent.task_sub = redis.createClient('6379', '10.0.30.61',{password:"fuckyou",db:10});
    let taskKey = "task";
    agent.task_sub.subscribe(taskKey);
    agent.task_sub.on("message",function(channel,job){
        console.log($this.schedule.sence);
        if(channel == taskKey){
            if(job && job.name){
               let key = taskKey +"_" + job.name;
               let num = agent.task_sub.decr(taskKey);
               if(num >= 0){
                  ctx.
               }

            }

        }
    });

};
