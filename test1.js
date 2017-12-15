'use strict';

const kue = require("kue");

// let queue1 = kue.createQueue({
//   prefix:"q1",
//   redis: {
//       port: 6379,          // Redis port
//       host: '10.0.30.61',   // Redis host
//       auth: 'fuckyou',
//       db: 2,
//   },
// });
//
// let queue2 = kue.createQueue({
//   prefix:"q2",
//   redis: {
//       port: 6379,          // Redis port
//       host: '10.0.30.61',   // Redis host
//       auth: 'fuckyou',
//       db: 3,
//   },
// });
//
// let job1 = queue1.create("queue1",{
//   data:"ddddd",
//   "title":"queue1"
// }).save( function(err){
//    if( !err ) console.log( job1);
// });
// let job2 = queue2.create("queue2",{
//   data:"xxxx",
//   "title":"queue2"
// }).save( function(err){
//    if( !err ) console.log( job2 );
// });
// return;
// queue1.process(function(job,done){
//   console.log("queue1");
//   console.log(job);
// });
// queue2.process(function(job,done){
//     console.log("queue2");
//     console.log(job);
// })
//
// kue.app.listen(3000);
//
//
// return;


// const Downloader = require("./app/libs/downloader");
//
// let downloader = new Downloader();
//
// downloader.dequeue(function(job,done){
//     console.log(job);
//     process.exit(0);
// });
//
//
//
// return;



const extractor = require("./app/libs/extractor");
const Crawler = require("./app/libs/crawler");
// let ex = new extract("<div class='abc'>xxx</div>","css");
// console.log(ex.css(".abc").text());
kue.createQueue({
  prefix:"qq",
  redis: {
      port: 6379,          // Redis port
      host: '10.0.30.61',   // Redis host
      auth: 'fuckyou',
      db: 2,
  },
});
kue.app.listen(3000);

let config = require("./app/libs/config_example").config;
let crawler = new Crawler();

console.log(crawler.config);


crawler.config(config);

console.log(crawler._config);
crawler.start();
