const mm = require('egg-mock');
const assert = require('assert');
describe('longhubang schedule', () => {
    it('should schedule work fine', function*() {
        const app = mm.app();
        yield app.ready();
        yield app.runSchedule('longhubang');
        assert(true);
    });

});
