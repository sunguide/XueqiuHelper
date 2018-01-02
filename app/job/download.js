const Subscription = require('egg').Subscription;

class download extends Subscription {
  static get job(){
    return {
      type: 'worker',
      name: 'download',
      immediate: true,
    };
  }
  async subscribe() {
      this.ctx.app.kue.process('task_download', function(job, done){
        startDownload(job, done);
      });

      function startDownload(job, done) {
        if(!(job.url)) {
          return done(new Error('invalid url address'));
        }

        done("done success");
      }
  }
  async done(){

  }
}

module.exports = download;
