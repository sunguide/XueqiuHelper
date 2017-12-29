'use strict';

const kue = require("kue");


const Downloader = require("./app/libs/downloader");
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
kue.app.listen(3001);

let downloader = new Downloader();
downloader.dequeue(startDownload);
async function startDownload(job, done) {
    console.log(job);
    if(!job.data.url) {
        return done(new Error('invalid url address'));
    }else{
        let data = await Downloader.get(job.data.url);
        console.log(data);
        done();
    }
}
