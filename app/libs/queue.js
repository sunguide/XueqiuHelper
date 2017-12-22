'use strict';

let kue = require('kue');
//同一个实例，只能连接一个redis,活门的createQueue 会复用之前的连接
class queue{
    constructor() {
        this.connect();
        this.enqueue = this.queue.create;
        this.dequeue = this.queue.process;
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
        process.once('SIGTERM', function ( sig ) {
            this.queue.shutdown( 5000, function(err) {
                console.log( 'Kue shutdown: ', err||'' );
                process.exit( 0 );
            });
        });
        return this;
    }

}
module.exports = queue;
