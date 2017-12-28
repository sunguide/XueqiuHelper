'use strict';

//简单封装的一层请求
const request = require("superagent");

//是否启用代理
// request.enableProxy = false;
// request.proxy = null; //http://localhost:8008


request.enableProxy = true;
request.proxy = "http://127.0.0.1:50351";

request.get = function (url, data, fn){
    if(request.enableProxy && request.proxy){
        require("superagent-proxy")(request);
    }

    let req = request('GET', url);

    if(request.enableProxy && request.proxy){
        req.proxy(request.proxy);
    }

    if ('function' === typeof data) fn = data, data = null;
    if (data) req.query(data);

    if (fn) req.end(fn);
    return req;
};

request.post = function(url, data, fn){
    if(request.enableProxy && request.proxy){
        require("superagent-proxy")(request);
    }
    let req = request('POST', url);

    if(request.enableProxy && request.proxy){
        req.proxy(request.proxy);
    }
    if ('function' === typeof data) fn = data, data = null;
    if (data) req.send(data);
    if (fn) req.end(fn);
    return req;
};


module.exports = request;
