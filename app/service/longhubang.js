'use strict';

const request = require("superagent");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs");
require("superagent-charset")(request);

module.exports = app => {

    class longhubang extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        * getLhbs(date) {
            let lhbs = [];
            let save = this.save;
            return new Promise((resolve, reject) => {
                //http://data.10jqka.com.cn/ifmarket/lhbggxq/report/2017-12-26/

                let url = "http://data.10jqka.com.cn/ifmarket/lhbggxq/report/"+date;//"http://data.10jqka.com.cn/market/longhu/";
                request.get(url)
                    .charset("GBK")
                    .end((err,res) => {
                        let $ = cheerio.load(res.text,{decodeEntities: false});
                        // let today = $(".m_text_date.startday").val();
                        // if(today != date){
                        //     resolve(false);
                        // }
                        $('.stockcont').each(function (i,item) {
                            item = $(item);
                            let stock_code = item.attr('stockcode');
                            let lhb_title = item.find('p').first().text();
                            let lhb_reason = lhb_title.split("明细：")[1];
                            let stock_name = lhb_title.split("(")[0];
                            lhb_title = stock_name + "(" + stock_code + ")：" + date + " 龙虎榜数据";
                            let unitNames = item.find('.cell-cont p').first().text().split("元");
                            let buy_amount = item.find('.cell-cont p .c-rise').first().text();
                            if(unitNames[1][unitNames[1].length - 1] === "亿"){
                                buy_amount = buy_amount * 10000;
                            }
                            let sell_amount = item.find('.cell-cont p .c-fall').first().text();
                            if(unitNames[2][unitNames[2].length - 1] === "亿"){
                                sell_amount = sell_amount * 10000;
                            }
                            buy_amount = parseFloat(buy_amount).toFixed(2);
                            sell_amount = parseFloat(sell_amount).toFixed(2);
                            let buy_details = [];
                            let sell_details = [];
                            item.find(".m-table").first().find("tr").each(function (i,item1) {
                                if(i === 0) return;
                                i--;
                                item1 = $(item1);
                                let buy_details_item = [];
                                item1.find('td').each(function (i,item2) {
                                    if(i === 0){
                                        buy_details_item[i] = $(item2).find('a').attr('title') ;
                                        if($(item2).find('label').length > 0){
                                            buy_details_item[i] += "[" + $(item2).find('label').text() + "]";
                                        }
                                    }else{
                                        buy_details_item[i]= $(item2).text();
                                    }
                                });
                                buy_details[i] = buy_details_item;
                            });
                            item.find('.m-table').last().find("tr").each(function (i,item1) {
                                if(i === 0) return;
                                i--;
                                item1 = $(item1);
                                let sell_details_item = [];
                                item1.find('td').each(function (i,item2) {
                                    if(i === 0){
                                        sell_details_item[i] = $(item2).find('a').attr('title') ;
                                        if($(item2).find('label').length > 0){
                                            sell_details_item[i] += "[" + $(item2).find('label').text() + "]";
                                        }
                                    }else{
                                        sell_details_item[i]= $(item2).text();
                                    }
                                });
                                sell_details[i] = sell_details_item;
                            });
                            let lhb = {
                                stock_code:stock_code,
                                stock_name:stock_name,
                                date:date,
                                title:lhb_title,
                                reason:lhb_reason,
                                buy_amount:buy_amount,
                                sell_amount:sell_amount,
                                buy_details:buy_details,
                                sell_details:sell_details
                            };
                            lhbs.push(lhb);

                        });
                        resolve(lhbs);

                    });
            });

        }

        * save(item){

            let ctx = this.ctx;

            return new Promise((resolve, reject) => {

                let id = ctx.helper.md5(item.date + item.stock_code + item.reason);

                let data = {
                    id:id,
                    stock_code:item.stock_code,
                    stock_name:item.stock_name,
                    date:item.date,
                    reason:item.reason,
                    buy_amount:item.buy_amount,
                    sell_amount:item.sell_amount,
                    net_amount:item.buy_amount - item.sell_amount,
                    buy_details:item.buy_details,
                    sell_details:item.sell_details
                };
                // if(item.buy_details){
                //     for(let k = 0; k < item.buy_details.length; k++){
                //         data['buy'+(k+1)] = item.buy_details[k].amount
                //     }
                // }
                ctx.model.Longhubang.find({id: id}, function (err, exist) {
                    if (exist.length === 0) {
                        let Cube = new ctx.model.Longhubang(data);
                        Cube.save(function (err, docs) {
                            console.log("save success" + docs)
                            if(err){
                                resolve(false);
                            }else{
                                resolve(true);
                            }
                        });
                    } else {
                        resolve(false);
                        // ctx.model.XueqiuCube.update({id: id, date: date}, data, {multi: true}, function (err) {
                        //     if(err){
                        //         resolve(false);
                        //     }else{
                        //         resolve(true);
                        //     }
                        // });
                    }
                });
            });

        }

        * geneImage(lhb){
          let all_amount = parseFloat(lhb.buy_amount) + parseFloat(lhb.sell_amount);
          if(all_amount > 10000){
              all_amount = (all_amount/10000).toFixed(2) + "亿元";
          }else{
              all_amount = all_amount.toFixed(2) + "万元";
          }
          lhb.closing_quote = yield app.cache.get("quote_" + lhb.stock_code);
          if(!lhb.closing_quote){
             lhb.closing_quote = yield this.service.xueqiu.getTodayStockInfo(lhb.stock_code);
             app.cache.set("quote_" + lhb.stock_code, lhb.closing_quote, 60000);
          }
          let gm = require("gm");
          let img = gm(900, 800, "#e4f2ff")
              .font('./data/font/msyh.ttf')      //引入预先下载的黑体字库
              .fontSize(26)
              .drawText(30, 40, lhb.title)
              .fontSize(16);
          //股票收盘
          let stock_quote = lhb.closing_quote;
          img.drawText(32, 70, "收盘价：");
          if(stock_quote && stock_quote.percentage > 0){
              img.fill("red")
          }else if(stock_quote && stock_quote.percentage < 0){
              img.fill("green");
          }
          img.drawText(100, 70, stock_quote.close);
          img.fill("#2f2f2f")
              .drawText(160, 70,"涨跌幅：");

          if(stock_quote && stock_quote.percentage> 0){
              img.fill("red");
          }else if(stock_quote && stock_quote.percentage < 0){
              img.fill("green");
          }
          img.drawText(220, 70, stock_quote.percentage + "%");
          img.fill("#2f2f2f");
          img.drawText(300, 70, "换手率：" + stock_quote.turnover_rate + "  总市值：" + (stock_quote.marketCapital/100000000).toFixed(2) + "亿元    市盈率：" + parseFloat(stock_quote.pe_ttm).toFixed(2));

          //龙虎榜
          img.drawText(30, 105, "上榜理由："+lhb.reason)
              .drawText(30, 150, "成交额：" + all_amount + "    合计买入：" + lhb.buy_amount + "万元    合计卖出：" +lhb.sell_amount + "万元    净额：" + (parseFloat(lhb.buy_amount) - parseFloat(lhb.sell_amount)).toFixed(2) + "万元")
              .fill("#f5f8fa")
              .drawRectangle(25,170,970,220)
              .fill("#2f2f2f")
              .drawText(35, 200, "买入金额最大的前5名营业部")
              .drawText(600, 200, "买入额/万")
              .drawText(700, 200, "卖出额/万")
              .drawText(800, 200, "净额/万")
              .fill("red");

              if(lhb.buy_details){
                  let y = 250;
                  lhb.buy_details.forEach(function(item,i){
                      item.forEach(function (kitem,k) {
                          if(k === 0){
                              img.drawText(35,y,kitem);
                          }else if(k === 1){
                              img.drawText(600,y,kitem);
                          }else if(k === 2){
                              img.drawText(700,y,kitem);
                          }else{
                              img.drawText(800,y,kitem);
                          }
                      });
                      y +=50;
                  });
              }
              img.fill("#f5f8fa")
                  .drawRectangle(25,470,870,520)
                  .fill("#2f2f2f")
                  .drawText(35, 500, "卖出金额最大的前5名营业部")
                  .drawText(600, 500, "买入额/万")
                  .drawText(700, 500, "卖出额/万")
                  .drawText(800, 500, "净额/万")
                  .fill("green");
              if(lhb.sell_details){
                  let y = 550;
                  lhb.sell_details.forEach(function(item,i){
                      item.forEach(function (kitem,k) {
                          if(k === 0){
                              img.drawText(35,y,kitem);
                          }else if(k === 1){
                              img.drawText(600,y,kitem);
                          }else if(k === 2){
                              img.drawText(700,y,kitem);
                          }else{
                              img.drawText(800,y,kitem);
                          }
                      });
                      y +=50;
                  });
              }
              img.fill("#2f2f2f")
                  .drawText(600,850, "雪球");
              img.fill("red")
                  .drawText(630,850, "『龙虎榜助手』");
              img.fill("#2f2f2f");
              img.drawText(740,850, "倾情提供");
              img.drawText(600,880, "https://xueqiu.com/longhubang");
              let filepath = './images/' + lhb.identify + ".jpg";
              return new Promise((resolve, reject) => {
                img.quality(90)
                    .write(filepath,function (err) {
                    if(err){
                        reject(err);
                    }else{
                        console.log('gene image');
                        gm("./data/images/top.jpg")
                            .append(filepath)
                            .append("./data/images/ad.jpg")
                            .write(filepath,function (err) {
                                if(err){
                                    reject(err);
                                }else{
                                    resolve(filepath);
                                }
                            });
                    }
                });
              });

        }

        * analyze(lhb){
            let stock_quote = yield app.cache.get("quote_" + lhb.stock_code);
            if(!stock_quote){
               stock_quote = yield this.service.xueqiu.getTodayStockInfo(lhb.stock_code);
               app.cache.set("quote_" + lhb.stock_code, stock_quote, 60000);
            }
            console.log(stock_quote);
            let $this = this;
            //分析买入榜
            //模型一，买一主买封涨停
            //模型二，卖一砸盘封跌停
            //模型三，股价走过山车
            //模型四，
            let buyers = [];
            let sellers = [];
            let comments = [];
            //amplitude振幅
            if(parseFloat(stock_quote.amplitude) > 12){
                comments.push("主力推动股价巨幅波动走过山车")
            }
            let stockCloseStatus = "";

            if(parseFloat(stock_quote.close) === parseFloat(stock_quote.rise_stop)){
                stockCloseStatus = "RISE_STOP";
            }

            if(parseFloat(stock_quote.close) === parseFloat(stock_quote.fall_stop)){
                stockCloseStatus = "FALL_STOP";
            }
            if(lhb.buy_details){
                lhb.buy_details.forEach(function (item,i){
                    let departmentName = item[0].split('[')[0];
                    let departmentAliasName =  $this.getDepartmentAliasName(departmentName);
                    buyers[i] = departmentAliasName ? departmentName + "（" + departmentAliasName + "）": departmentName;
                    if(stockCloseStatus == "RISE_STOP"){
                        if(i === 0){
                            comments.push(buyers[i] + "主买封涨停板");
                        }
                    }

                    if(departmentAliasName && !stockCloseStatus){
                        if(parseFloat(item[2]) > 0){
                            if(parseFloat(item[3]) > 0){
                                comments.push(buyers[i] + "做T加仓");
                            }
                        }else if(i < 2){
                            comments.push(buyers[i] + "强势介入");
                        }else{
                            comments.push(buyers[i] + "跟风介入");
                        }
                    }

                });
            }

            if(lhb.sell_details){
                lhb.sell_details.forEach(function (item,i){
                    let departmentName = item[0].split('[')[0];
                    let departmentAliasName =  $this.getDepartmentAliasName(departmentName);
                    sellers[i] = departmentAliasName ? departmentName + "（" + departmentAliasName + "）": departmentName;
                    if(stockCloseStatus == "FALL_STOP"){
                        if(i === 0){
                            comments.push(sellers[i] + "主卖封跌停板");
                        }
                    }


                    if(departmentAliasName && !stockCloseStatus){
                        if(parseFloat(item[1]) > 0){
                            if(parseFloat(item[3]) < 0){
                                comments.push(sellers[i] + "做T出货");
                            }
                        }else{
                            comments.push(sellers[i] + "清仓出货");
                        }
                    }


                });
            }
            //涨停板出货
            if(stockCloseStatus == "RISE_STOP"){
                if(lhb.sell_details && lhb.sell_details.length > 1){
                    if(parseFloat(lhb.buy_details[0][1]) > 2000 && parseFloat(lhb.sell_details[0][2]) > parseFloat(lhb.buy_details[0][1])){
                        comments.push(sellers[0] + "涨停板上大肆出货");
                    }
                }
                if(stock_quote){
                    if(stock_quote.low == stock_quote.high){
                        if(parseFloat(stock_quote.turnover_rate) < 2){
                            comments.push("强势一字涨停板，没啥可说的，明天继续");
                        }else if(parseFloat(stock_quote.turnover_rate) > 10){
                            comments.push("一字板涨停，但是换手率有点高，注意高抛低吸");
                        }else{
                            comments.push( "一字涨停板，后市可期");
                        }
                    }else if(stock_quote.high == stock_quote.open && stock_quote.low < stock_quote.high){
                        comments.push("一字涨停板被打开，多空激战，注意高抛低吸，守住盈利");
                    }
                }

            }else if(stockCloseStatus == "FALL_STOP"){
            //跌停板上勇于抄底
                if(lhb.sell_details && lhb.sell_details.length > 1){
                    if(parseFloat(lhb.buy_details[0][1]) > 2000 && parseFloat(lhb.sell_details[0][2]) < parseFloat(lhb.buy_details[0][1])){
                        comments.push(buyers[0] + "跌停板上勇于抄底");
                    }
                }
            }
            let _comments = "";
            if(comments){
                for(let i = 0; i < comments.length;i++){
                    _comments += (i+1) + ". "+comments[i] +"<br>";
                }
            }
            return _comments;
        }
        //是否发布到雪球
        * isPostedXueqiu(identify){
            const Datastore = require('nedb');
            const db = new Datastore({ filename: './data/database/post_record.db', autoload: true });
            return new Promise((resolve, reject) => {
               db.find({identify:identify},function (err,docs) {
                   if(err){
                       reject(err);
                   }else{
                       if(docs.length > 0 && docs[0].success){
                           resolve(true);
                       }else{
                           resolve(false);
                       }
                   }
               })
            });
        }
        //是否发布到雪球
        * setPostedXueqiu(identify, docData){
            const Datastore = require('nedb');
            const db = new Datastore({ filename: './data/database/post_record.db', autoload: true });
            return new Promise((resolve, reject) => {
                let data = {identify:identify,data:docData,success:docData.success};
                db.find({identify:identify}, function (err, docs) {
                    if(err){
                        reject(err);
                    }else{
                        if(docs.length > 0){
                            db.update({_id:docs[0]._id},{ $set: data },function (err) {
                                resolve(true);
                            });
                        }else{
                            db.insert(data,function (err) {
                                resolve(true);
                            });
                        }
                    }
                });
            });
        }
        getDepartments(){
            return  [
                {"name":"招商证券深圳蛇口工业七路证券营业部","alias":"知名游资『乔帮主』"},
                {"name":"招商证券股份有限公司深圳蛇口工业七路证券营业部","alias":"知名游资『乔帮主』"},
                {"name":"中信证券溧阳路证券营业部","alias":"知名游资溧阳路"},
                {"name":"中信证券股份有限公司溧阳路证券营业部","alias":"知名游资溧阳路"},
                {"name":"中信证券上海古北路证券营业部","alias":"知名游资上海古北路"},
                {"name":"中信证券股份有限公司上海古北路证券营业部","alias":"知名游资上海古北路"},
                {"name":"中信证券上海瑞金南路证券营业部","alias":"知名游资席位"},
                {"name":"中信证券股份有限公司上海瑞金南路证券营业部","alias":"知名游资席位"},
                {"name":"中信证券上海淮海中路证券营业部","alias":"知名游资席位"},
                {"name":"中信证券股份有限公司上海淮海中路证券营业部","alias":"知名游资席位"},
                {"name":"浙商证券股份有限公司绍兴解放北路证券营业部","alias":"宁波敢死队『赵老哥』"},
                {"name":"浙商证券绍兴解放北路证券营业部","alias":"宁波敢死队『赵老哥』"},
                {"name":"中国银河证券绍兴证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"中国银河证券绍兴股份有限公司证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"中国银河证券北京阜成路证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"中国银河证券股份有限公司北京阜成路证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"华泰证券浙江分公司","alias":"知名游资『赵老哥』"},
                {"name":"华泰证券股份有限公司浙江分公司","alias":"知名游资『赵老哥』"},
                {"name":"湘财证券上海陆家嘴证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"湘财证券股份有限公司上海陆家嘴证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"华泰证券永嘉阳光大道证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"华泰证券股份有限公司永嘉阳光大道证券营业部","alias":"知名游资『赵老哥』"},
                {"name":"光大证券佛山绿景路证券营业部","alias":"知名游资『佛山无影脚』"},
                {"name":"光大证券股份有限公司佛山绿景路证券营业部","alias":"知名游资『佛山无影脚』"},
                {"name":"光大证券佛山季华六路","alias":"知名游资『佛山无影脚』"},
                {"name":"光大证券股份有限公司佛山季华六路","alias":"知名游资『佛山无影脚』"},
                {"name":"长江证券佛山普澜二路","alias":"知名游资『佛山无影脚』"},
                {"name":"长江证券股份有限公司佛山普澜二路","alias":"知名游资『佛山无影脚』"},
                {"name":"湘财证券佛山祖庙路","alias":"知名游资『佛山无影脚』"},
                {"name":"湘财证券股份有限公司佛山祖庙路","alias":"知名游资『佛山无影脚』"},
                {"name":"华泰证券成都南一环路证券营业部","alias":"知名游资『职业炒手』"},
                {"name":"华泰证券股份有限公司成都南一环路证券营业部","alias":"知名游资『职业炒手』"},
                {"name":"国泰君安证券成都北一环路证券营业部","alias":"知名游资『职业炒手』"},
                {"name":"国泰君安证券股份有限公司成都北一环路证券营业部","alias":"知名游资『职业炒手』"},
                {"name":"国信证券成都二环路证券营业部","alias":"知名游资『职业炒手』"},
                {"name":"国信证券股份有限公司成都二环路证券营业部","alias":"知名游资『职业炒手』"},
                {"name":"华鑫证券上海宛平南路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券股份有限公司上海宛平南路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券宁波沧海路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券股份有限公司宁波沧海路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券上海淞滨路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券股份有限公司上海淞滨路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券上海松江证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券股份有限公司上海松江证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券上海茅台路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"华鑫证券股份有限公司上海茅台路证券营业部","alias":"知名游资『炒股养家』"},
                {"name":"光大证券宁波解放南路证券营业部","alias":"宁波敢死队"},
                {"name":"光大证券股份有限公司宁波解放南路证券营业部","alias":"宁波敢死队"},
                {"name":"华泰证券厦门厦禾路证券营业部","alias":"著名实力游资"},
                {"name":"华泰证券股份有限公司厦门厦禾路证券营业部","alias":"著名实力游资"},
                {"name":"中信建投证券宜昌解放路证券营业部","alias":"知名游资『瑞鹤仙』"},
                {"name":"中信建投证券股份有限公司宜昌解放路证券营业部","alias":"知名游资『瑞鹤仙』"},
                {"name":"中国银河证券宜昌新世纪证券营业部","alias":"知名游资『瑞鹤仙』"},
                {"name":"中国银河证券股份有限公司宜昌新世纪证券营业部","alias":"知名游资『瑞鹤仙』"},
                {"name":"新时代证券宜昌东山大道证券营业部","alias":"知名游资『瑞鹤仙』"},
                {"name":"新时代证券股份有限公司宜昌东山大道证券营业部","alias":"知名游资『瑞鹤仙』"},
                {"name":"中信证券杭州延安路证券营业部","alias":"著名牛散章建平席位"},
                {"name":"中信证券股份有限公司杭州延安路证券营业部","alias":"著名牛散章建平席位"},
                {"name":"财通证券有限责任公司绍兴人民中路证券营业部","alias":"浙江帮绍兴知名游资"},
                {"name":"财通证券股份有限公司有限责任公司绍兴人民中路证券营业部","alias":"浙江帮绍兴知名游资"},
                {"name":"华泰证券南京六合彤华街证券营业部","alias":"知名游资『桃仙大神龙飞虎』"},
                {"name":"华泰证券股份有限公司南京六合彤华街证券营业部","alias":"知名游资『桃仙大神龙飞虎』"},
                {"name":"光大证券杭州庆春路证券营业部","alias":"知名游资"},
                {"name":"光大证券股份有限公司杭州庆春路证券营业部","alias":"知名游资"},
                {"name":"华泰证券上海武定路证券营业部","alias":"新生代游资"},
                {"name":"华泰证券股份有限公司上海武定路证券营业部","alias":"新生代游资"},
                {"name":"华泰证券北京雍和宫证券营业部","alias":"牛散唐汉若"},
                {"name":"华泰证券股份有限公司北京雍和宫证券营业部","alias":"牛散唐汉若"},
                {"name":"国泰君安证券股份有限公司南京太平南路证券营业部","alias":"知名游资『作手新一』"}
            ];
        }

        getDepartmentAliasName(departmentName){
            let departments = this.getDepartments();
            for(let i=0; i < departments.length;i++){
                if(departments[i].name === departmentName){
                    return departments[i].alias;
                }
            }
            return "";
        }
    }

    return longhubang;
};
