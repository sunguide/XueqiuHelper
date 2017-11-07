'use strict';
const moment = require("moment");
module.exports = app => {
    class bonusController extends app.Controller {
        * index(ctx) {

            let lhb = {
                stock_code: '603963',
                stock_name: '大理药业',
                title: '大理药业(603963)：2017年10月12日龙虎榜',
                reason: "日换手率达20%的证券",
                buy_amount: '6661.61',
                sell_amount: '8073.71',
                buy_details:
                    [ [ '平安证券股份有限公司芜dd湖江北证券营业部', '2099.03', '0.00', '2099.03' ],
                        [ '华福证券有限责任公司厦门湖滨南路证券营业部[一线游资]', '1846.48', '0.00', '1846.48' ],
                        [ '国泰君安证券股份有限公司沈阳黄河南大街证券营业部', '1027.51', '0.00', '1027.51' ],
                        [ '平安证券股份有限公司芜湖江北证券营业部', '892.94', '0.00', '892.94' ],
                        [ '招商证券深圳蛇口工业七路证券营业部', '795.65', '0.00', '795.65' ] ],
                sell_details:
                    [ [ '光大证券股份有限公司佛山绿景路证券营业部[一线游资]', '0.00', '2259.70', '-2259.70' ],
                        [ '中国银河证券股份有限公司成都科华北路证券营业部', '0.00', '1700.93', '-1700.93' ],
                        [ '华鑫证券上海茅台路证券营业部', '0.00', '1419.65', '-1419.65' ],
                        [ '华泰证券股份有限公司深圳益田路荣超商务中心证券营业部[一线游资]',
                            '0.00',
                            '1346.88',
                            '-1346.88' ],
                        [ '国泰君安证券股份有限公司顺德东乐路证券营业部', '0.00', '1346.55', '-1346.55' ] ] }


            let comments = yield this.service.longhubang.analyze(lhb);
            this.ctx.body = comments;

        }

    }
    return bonusController;
};