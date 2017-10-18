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
            return new Promise((resolve, reject) => {
                request.get("http://data.10jqka.com.cn/market/longhu/")
                    .charset("GBK")
                    .end((err,res) => {
                        let $ = cheerio.load(res.text,{decodeEntities: false});
                        let today = $(".m_text_date.startday").val();
                        if(today != date){
                            resolve(false);
                        }
                        $('.stockcont').each(function (i,item) {
                            item = $(item);
                            let stock_code = item.attr('stockcode');
                            let lhb_title = item.find('p').first().text();
                            let lhb_reason = lhb_title.split("明细：")[1];
                            let stock_name = lhb_title.split("(")[0];
                            lhb_title = stock_name + "(" + stock_code + ")：" + today + " 龙虎榜数据";
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
                                date:today,
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
    }

    return longhubang;
};
