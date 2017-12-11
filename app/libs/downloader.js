'use strict';
const Queue = require("./queue");

class downloader {
    constructor() {
        this.queue = Queue.connect();
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

}
module.exports = downloader;
