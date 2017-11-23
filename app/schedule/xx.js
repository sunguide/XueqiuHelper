const Subscription = require('egg').Subscription;

class xCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    console.log('get schedule');
    return {
      type: 'worker', // 指定所有的 worker 都需要执行
      sence: 'job',
      immediate: false,
      disable:true
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
      console.log('tmd zhe ge buyingg   do');
  }
}

module.exports = xCache;
