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
    return config;
};
exports.mongoose = {
    url: 'mongodb://127.0.0.1/example',
    options: {}
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
