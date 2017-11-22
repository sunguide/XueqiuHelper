const Subscription = require('egg').Subscription;

class download extends Subscription {
  async subscribe(ctx) {
      queue = kue.createQueue();
      const _ = require("loadash");
      queue.process('download', function(job, done){
        startDownload(job, done);
      });

      function startDownload(job, done) {

        if(!_.isVaildUrl(job.url)) {
          return done(new Error('invalid to address'));
        }
        done();
      }
  }
}

module.exports = download;
