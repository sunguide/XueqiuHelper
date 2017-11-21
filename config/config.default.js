'use strict';

module.exports = appInfo => {
    const config = {};

    // should change to your own
    config.keys = appInfo.name + '_1496902118915_8798';

    // add your config here
    config.view = {
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.tpl': 'nunjucks',
        },
    };
    config.news = {
        pageSize: 30,
        serverUrl: 'https://hacker-news.firebaseio.com/v0',
    };

    config.env = "local";

    config.mongoose = {
        url: 'mongodb://10.0.30.61/xueqiu_helper',
        options: {}
    };
    config.redis = {
        client: {
            port: 6379,          // Redis port
            host: '10.0.30.61',   // Redis host
            password: 'fuckyou',
            db: 10,
        },
    };
    config.kue = {
        app : true,
        agent : false,
        client :{
            prefix: 'q',
            redis: {
                port: 6379,
                host: '10.0.30.61',
                auth: 'fuckyou',
                db: 9, // if provided select a non-default redis db
                options: {
                    // see https://github.com/mranney/node_redis#rediscreateclient
                }
            }
        }
    };

    config.job = {
        app : true,
        agent : false,
        client :{
            prefix: 'q',
            redis: {
                port: 6379,
                host: '10.0.30.61',
                auth: 'fuckyou',
                db: 9, // if provided select a non-default redis db
                options: {
                    // see https://github.com/mranney/node_redis#rediscreateclient
                }
            }
        }
    };

    return config;
};

//
// module.exports = {
//   // 配置需要的中间件，数组顺序即为中间件的加载顺序
//   middleware: [ 'gzip' ],
//   // 配置 gzip 中间件的配置
//   gzip: {
//     threshold: 1024, // 小于 1k 的响应体不压缩
//   },
// };
