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
            let $this = this;
            let date = ctx.helper.datetime("YYYYMMDD");

            return new Promise((resolve, reject) => {
                co(ctx.service.xueqiu.request("https://xueqiu.com/P/" + id, cookie)).then(function (sp) {
                    if (!sp) {
                        console.log("Fetch error:"+id);
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
                    let positions = 0;
                    $('.weight-list .stock').each(function (i, item) {
                        let stock_name = $(item).find(".stock-name .name").html();
                        let stock_code = $(item).find(".stock-name .price").html();
                        let stock_weight = parseFloat($(item).find(".stock-weight").html());
                        weights.push({stock_name, stock_code, stock_weight});
                        positions += stock_weight;
                        $this.addCubePosition({id, date, stock_name, stock_code, stock_weight});
                        //cube_postions

                    });
                    let data = {id, nav, name, weights, uid, username, date, close,positions};
                    if(!data.uid){
                        resolve(false);
                        return;
                    }
                    ctx.model.XueqiuCube.find({id: id, date: date}, function (err, exist) {
                        if (exist.length === 0) {
                            let Cube = new ctx.model.XueqiuCube(data);
                            Cube.save(function (err, docs) {
                                console.log("save success" + docs)
                                if(err){
                                    resolve(false);
                                }else{
                                    resolve(true);
                                }
                            });
                        } else {
                            ctx.model.XueqiuCube.update({id: id, date: date}, data, {multi: true}, function (err) {
                                if(err){
                                    resolve(false);
                                }else{
                                    resolve(true);
                                }
                            });
                        }
                    });

                });
            });

        }

        * addCubePosition(data){
            let ctx = this.ctx;
            let conditions = {id: data.id, date: data.date, stock_code:data.stock_code};
            ctx.model.XueqiuCubePosition.find(conditions, function (err, exist) {
                if(err){
                    console.log(err);
                    return;
                }
                if (exist.length === 0) {
                    let CubePosition = new ctx.model.XueqiuCubePosition(data);
                    CubePosition.save(function (err, docs) {
                        if(err){
                          console.log("save fail");
                          console.log(data);
                        }
                    });
                } else {
                    ctx.model.XueqiuCubePosition.update(conditions, data, {multi: false}, function (err) {
                        if(err){
                            console.log("update fail");
                            console.log(data);
                        }
                    });
                }
            });
        }

    }

    return cube;
};
