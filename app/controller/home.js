'use strict';
const moment = require("moment");
module.exports = app => {
    class indexController extends app.Controller {
        * index() {
            // this.ctx.body = "fuck ";

            let service = this.service;
            // render a template, path relate to `app/view`
            // yield this.ctx.render('home/index.tpl', data);
            // this.ctx.body = yield tshis.service.xueqiu.getTodayStockInfo(600100);
            // this.ctx.body = yield this.service.longhubang.getLhbs("2017-10-18");

            let result;
            const _ = require('lodash');
            yield app.cache.set("key","push");
            let data = yield app.cache.get("key");
            let lhbs = yield this.service.longhubang.getLhbs("2017-10-19");
            let identify;
            if(lhbs){
                for(let i = 0; i < lhbs.length; i++){
                    identify = this.ctx.helper.md5(lhbs[i].buy_details.toString());
                    lhbs[i].identify = (lhbs[i].date).replace(new RegExp("-","gm"),"") + "_" + lhbs[i].stock_code + "_" + identify;
                    lhbs[i].comments = yield this.service.longhubang.analyze(lhbs[i]);
                    let posters = yield this.service.xueqiu.getRecentPoster(lhbs[i].stock_code);
                    if(posters){
                        posters = "<p>[鼓鼓掌][鼓鼓掌][鼓鼓掌]有请股友@" + _.chunk(posters,5)[0].join(", @") + " 来点评一下今日的龙虎榜单[献花花][献花花][献花花]</p>";
                    }
//
                    let imagePath = yield this.service.longhubang.geneImage(lhbs[i]);continue;
                    let uploadImageURL = yield this.service.xueqiu.uploadImage(imagePath);
                    let stock_anchor = this.ctx.helper.getStockAnchor(lhbs[i].stock_code, lhbs[i].stock_name);
                    let comments = lhbs[i].comments ? (`<p>榜单分析：${lhbs[i].comments}</p>`) : "";
                    let message = '<p>' + stock_anchor +lhbs[i].date + '龙虎榜' + '</p><p>上榜理由：'+ lhbs[i].reason
                                  + '</p>' + posters + comments + '<div class="img-single-upload"><img src="' + uploadImageURL + '" class="ke_img"></div>',
                    result = yield this.service.xueqiu.post(message);
                    if(result){
                        yield this.service.longhubang.setPostedXueqiu(identify,true);
                    }else{
                        yield this.service.longhubang.setPostedXueqiu(identify,false);
                    }
                }
                this.ctx.body = lhbs;
            }else{
                console.log("not found 龙虎榜");
            }
            // console.log(lhbs);

            this.ctx.body = lhbs;
        }
        * test(){

          this.ctx.body =  this.ctx.helper.getStockAnchor(600000, 5555);

        }
        * posters(){
          const _ = require('lodash');
          let posters = yield this.service.xueqiu.getRecentPoster("002049");
          posters = "@" + _.chunk(posters,5)[0].join(", @");
          this.ctx.body = posters;
          // let result = yield this.service.xueqiu.post("请" +posters + " 来点评一下 $同方股份(SH600100)$ ");
        }
    }
    return indexController;
};
