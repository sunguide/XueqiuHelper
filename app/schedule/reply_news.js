'use strict';
//
module.exports = app => {

    return {
        // 通过 schedule 属性来设置定时任务的执行间隔等配置
        schedule: {
            interval: '15s', // 1 分钟间隔
            type: 'worker', // 指定所有的 worker 都需要执行
            disable: true
        },
        // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
        * task(ctx) {
            console.log("reply news start");
            let cookie = yield ctx.service.xueqiu.getLoginCookie({
                username: "sunguide2@wolfunds.com",
                password: "sunguide1989"
            });
            let posts = yield ctx.service.xueqiu.getUserPostsByUserId(5124430882, cookie);
            let replys = [
                "还是没有我快吧！[捂脸]哈哈[抠鼻]",
                "[捂脸]就是比你快，咋的，不服来diss me![俏皮][俏皮][俏皮]",
                "跑的过你，跑不过爱情。",
                "论消息的时效性，就是比要闻快一点点。"
            ];
            if(posts){
                for(let i = 0; i < posts.length; i++){
                    let key = "post_reply_"+ posts[i].id;
                    let replied = yield app.redis.get(key);
                    if(!replied){
                        let comment = replys[Math.floor(Math.random() * replys.length)];
                        try {
                            let result = yield ctx.service.xueqiu.reply(posts[i].id, comment, cookie);
                            if(result){
                                yield app.redis.set(key,1);
                            }
                        }catch(err){
                            console.log(err);
                        }
                    }
                }
            }
        }
    };

};
