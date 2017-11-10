'use strict';

module.exports = app => {
    class cube extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        * fetchOne(id, cookie) {
            const co = require("co");
            const cheerio = require("cheerio");
            let ctx = this.ctx;
            let date = ctx.helper.datetime("YYYYMMDD");

            console.log("fetchOne");
            return new Promise((resolve, reject) => {
                co(ctx.service.xueqiu.request("https://xueqiu.com/P/" + id, cookie)).then(function (sp) {
                    if (!sp) {
                        console.log("Fetch error");
                        resolve(false);
                        return;
                    }
                    let $ = cheerio.load(sp, {decodeEntities: false});
                    let name = $(".cube-title .name").html();
                    if (!name) {
                        console.log(id + "[404]");
                        resolve(false);
                        return;
                    }
                    let nav = parseFloat($(".cube-blockmain .cube-profit-day .per").last().html() || 0);
                    let username = $(".cube-creator-info .name").html();
                    let uidElement = $(".cube-creator-info a").first();
                    let uid = 0;
                    if (uidElement) {
                        uid = uidElement.attr("href");
                        if (uid) {
                            uid = parseFloat(uid.replace("/", ""));
                        }
                    }
                    let close = $(".cube-closed").length;
                    let weights = [];
                    $('.weight-list .stock').each(function (i, item) {
                        let stock_name = $(item).find(".stock-name .name").html();
                        let stock_code = $(item).find(".stock-name .price").html();
                        let stock_weight = parseFloat($(item).find(".stock-weight").html());
                        weights.push({stock_name, stock_code, stock_weight});
                    });
                    let data = {id, nav, name, weights, uid, username, date, close};
                    if(!data.uid){
                        resolve(false);
                        return;
                    }
                    ctx.model.XueqiuCube.find({id: id, date: date}, function (err, exist) {
                        if (exist.length === 0) {
                            let Cube = new ctx.model.XueqiuCube(data);
                            Cube.save(function (err, docs) {
                                console.log("save success" + docs)
                                resolve(true);
                            });
                        } else {
                            ctx.model.XueqiuCube.update({id: id, date: date}, data, {multi: true}, function () {
                                resolve(true);
                            });
                        }
                    });

                });
            });

        }

    }

    return cube;
};