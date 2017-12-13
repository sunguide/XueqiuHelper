'use strict';
const Queue = require("./queue");
const request = require("superagent");
class downloader {
    constructor() {
        this.queue = new Queue();
        this.base_headers = {
            "Accept": "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4,ja;q=0.2",
            "Cache-Control": "no-cache",
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
        }
    }
    //下载器队列
    //@app_id [应用id]
    //@url [下载url]
    async enqueue(data,options){
        return this.queue.create('downloader_queue', data).save( function(err){
           if( !err ) console.log( job.id );
        });
    }

    async dequeue(){

    }
    async get(url, options){
        let cookie = options.cookie || "";
        let base_headers = this.base_headers;
        return new Promise(resolve => {
            request.get(url)
              .set(base_headers)
              .set("Cookie", cookie)
              .end((err, res) => {
                  if(err){
                      resolve(false);
                  }else{
                      resolve(res);
                  }
              });
        });
    }



}
module.exports = downloader;
