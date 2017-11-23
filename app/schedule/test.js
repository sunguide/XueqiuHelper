const Subscription = require('egg').Subscription;

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    console.log('get schedule');
    return {
      type: 'cluster', // 指定所有的 worker 都需要执行
      sence: 'job',
        disable:true,
      immediate: false,
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
      console.log('job coming test do');
  }
}

module.exports = UpdateCache;
