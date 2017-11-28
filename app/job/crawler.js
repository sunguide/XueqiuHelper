const Subscription = require('egg').Subscription;
//执行爬虫job
class crawler extends Subscription {
  static get job(){
    return {
      type: 'worker',
      name: 'download',
      immediate: false,
    };
  }
  async subscribe() {
      this.ctx.app.kue.process('task_crawler', function(job, done){
          startCrawl(job, done);
      });

      function startCrawl(job, done) {
        if(!(job.config)) {
          return done(new Error('crawler config must present'));
        }
        done("done success");
      }
  }
  async done(){

  }
}

module.exports = download;
