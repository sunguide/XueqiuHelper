'use strict';

let kue = require('kue');
class queue{
    constructor() {
        this.connect();
    }
    connect(){
        this.queue = kue.createQueue({
          prefix:"qq",
          redis: {
              port: 6379,          // Redis port
              host: '10.0.30.61',   // Redis host
              auth: 'fuckyou',
              db: 2,
          },
        });
        return this;
    }
    enqueue(){

    }

    dequeue(){

    }

}
module.exports = queue;
