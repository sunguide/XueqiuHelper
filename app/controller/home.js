'use strict';
const moment = require("moment");
module.exports = app => {
    class indexController extends app.Controller {
        * index() {
            // this.ctx.body = "fuck ";
            this.ctx.body = yield this.ctx.service.touker.getLoginCookie();return;
            let data = {nickname:this.ctx.session.nickname};
            yield this.ctx.render('home/index.tpl', data);
        }
        * test(){
          // let info = yield this.ctx.service.xueqiu.getFollows(3)
          // this.ctx.body = info;
            yield this.ctx.service.xueqiu.request('')
        }

        * login(){
            this.ctx.body = app.config.env;return;
            yield this.ctx.render('home/login.tpl');
        }

        * loginDo(){
            let loginPass = {
                username:this.ctx.request.body.username,
                password:this.ctx.request.body.password,
            };
            let info = yield this.ctx.service.xueqiu.getLogin(loginPass.username,loginPass.password);
            if(info){
                this.ctx.session.uid = info.uid;
                this.ctx.session.nickname = info.user.screen_name;
                this.ctx.session.avatar = info.user.photo_domain + info.user.profile_image_url.split(',')[0];
                this.ctx.session.xq_a_token = info.access_token;
                const Datastore = require('nedb');
                const db = new Datastore({ filename: './data/database/user.db', autoload: true });
                info.user.access_token = info.access_token;

                info.user.refresh_token = info.refresh_token;
                db.find({"id":info.uid},function (err,docs) {
                    if(docs.length > 0){
                        db.update({"id":info.uid},{$set:info.user});
                    }else{
                        db.insert(info.user,function (err) {
                            console.log(err);
                        });
                    }
                });
                // this.ctx.body = info;
                this.ctx.redirect("/");
            }else{
                yield this.ctx.render('home/login.tpl',{"toast":"用户名和密码错误，请输入雪球用户名和密码！"});
                // this.error("用户名和密码错误，请输入雪球用户名和密码！")
            }
        }

        * logout(){
            this.ctx.session.uid = 0;
            this.ctx.session.nickname = '';
            this.ctx.session.avatar = '';
            this.ctx.session.xq_a_token = '';
            this.ctx.redirect('/');
        }

        * test3(){
          let info = yield this.ctx.service.xueqiu.chat(3595607502,5435417380,"我们能否合作一下")
          this.ctx.body = info;
        }
        * test1(){

            const info = yield app.runSchedule('longhubang2');
            console.log(info);
            this.ctx.body = info;
        }
        * posters(){
          const _ = require('lodash');
          let posters = yield this.service.xueqiu.getRecentPoster("002049");
          posters = "@" + _.chunk(posters,5)[0].join(", @");
          this.ctx.body = posters;
          // let result = yield this.service.xueqiu.post("请" +posters + " 来点评一下 $同方股份(SH600100)$ ");
        }

        * longhubangimage(ctx){
            const moment = require("moment");
            const fs = require("fs")
            this.ctx = ctx;
            this.service = ctx.service;
            let app = ctx.app;
            let logger = ctx.logger;
            this.service = ctx.service;
            const _ = require('lodash');
            let lhbs = yield this.service.longhubang.getLhbs(this.ctx.helper.datetime("YYYY-MM-DD"));
            let identify;
            let result;
            if (lhbs) {
                for (let i = 0; i < lhbs.length; i++) {
                    identify = this.ctx.helper.md5(lhbs[i].buy_details.toString());
                    lhbs[i].identify = (lhbs[i].date).replace(new RegExp("-", "gm"), "") + "_" + lhbs[i].stock_code + "_" + identify;
                    let filepath = './images/' + lhbs[i].identify + ".jpg";
                    if(!fs.existsSync(filepath)){
                        let imagePath = yield this.service.longhubang.geneImage(lhbs[i]);
                        console.log(imagePath);
                    }else{
                        console.log("already exits");
                    }
                }
            } else {
                logger.info("not found 龙虎榜");
            }
        }

        * test2(){
            // var t = this, s = jQuery.ajax({
            //     url: n.getBaseUrl() + "/v2/messages.json?user_id=" + window.SNOWMAN_USER.id,
            //     type: "POST",
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     data: JSON.stringify(e)
            // });
            // $.ajax({
            //     type: "post",
            //     url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=359560750",
            //     data:JSON.stringify({
            //         "toId":"5435417380",
            //         "toGroup":false,
            //         "sequenceId": 320852957,
            //         "plain":"明天见"
            //     }),
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     success: function (data) {
            //         console.log(data);
            //     },
            //     error: function (XMLHttpRequest, textStatus, errorThrown) {
            //         alert(errorThrown);
            //     }
            // });
            //
            // $.ajax({
            //     type: "POST",
            //     url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=359560750",
            //     data:JSON.stringify({
            //         "plain":"明天见",
            //         "sequenceId": 320852957,
            //         "toGroup":false,
            //         "toId":5435417380,
            //     }),
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     success: function (data) {
            //         console.log(data);
            //     },
            //     error: function (XMLHttpRequest, textStatus, errorThrown) {
            //         alert(errorThrown);
            //     }
            // });
            // var t = this, s = jQuery.ajax({
            //     url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=" + window.SNOWMAN_USER.id,
            //     type: "POST",
            //     timeout: 2e4,
            //     contentType: "application/json",
            //     data: '{"toId":5435417380,"toGroup":false,"sequenceId":32085297,"plain":"哈哈哈2"}'
            // });
            jQuery.ajax({
                url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=586328842",
                type: "POST",
                timeout: 2e4,
                headers:{Cookie:"xq_a_token=a365d23ab715f9c3b963dc268149f35031ddb8c1"},
                contentType: "application/json",
                data: '{"toId":5435417380,"toGroup":false,"sequenceId":32085299,"plain":"新的一天"}'
            });
        }


    }
    return indexController;
};
