const assert = require('assert');
const mock = require('egg-mock');

describe('longhubang()', () => {
    let app;
    before(() => {
        // 创建当前应用的 app 实例
        app = mock.app();
        // 等待 app 启动成功，才能执行测试用例
        return app.ready();
    });
    // 因为需要异步调用，所以使用 generator function
    it('should get exists stock info', function* () {
        // 创建 ctx
        const ctx = app.mockContext();
        // 通过 ctx 访问到 service.user
        const info = yield ctx.service.longhubang.getLhbs(20171220);
        console.log(info);
        assert(info);
    });
});