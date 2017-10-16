"use strict";

const base_headers = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4,ja;q=0.2",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    Host: "xueqiu.com",
    Origin: "https://xueqiu.com",
    Pragma: "no-cache",
    Referer: "https://xueqiu.com/",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest"
};

const request = require("superagent");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const moment = require("moment");
const fs = require("fs");
const coroutine = require("coroutine");

require("superagent-charset")(request);

let cookie;
let config = {
    "images_path": "./images/"
};
let urls = {
    home: "https://xueqiu.com",
    login: "https://xueqiu.com/snowman/login",
    token: "https://xueqiu.com/service/csrf?api=%2Fstatuses%2Fupdate.json&_=1507965835009",
    post: "https://xueqiu.com/statuses/update.json",
    upload: "https://xueqiu.com/photo/upload.json"
};

let loginPass = {
    remember_me: true,
    username: "18521527528",
    password: "woshini8",
    captcha: ""
};

let hasPosted = [];
let sleepTime = 0;
let currentDate = moment().format("YYYY-MM-DD");

let lhb = {
    stock_code: '603963',
    stock_name: '大理药业',
    title: '大理药业(603963)：2017年10月12日龙虎榜',
    reason: "日换手率达20%的证券",
    buy_amount: '6661.61',
    sell_amount: '8073.71',
    buy_details:
        [ [ '券股份有限公司成都科华北路证券营业部', '2099.03', '0.00', '2099.03' ],
            [ '华福证券有限责任公司厦门湖滨南路证券营业部[一线游资]', '1846.48', '0.00', '1846.48' ],
            [ '国泰君安证券股份有限公司沈阳黄河南大街证券营业部', '1027.51', '0.00', '1027.51' ],
            [ '平安证券股份有限公司芜湖江北证券营业部', '892.94', '0.00', '892.94' ],
            [ '中信证券股份有限公司温岭万昌中路证券营业部', '795.65', '0.00', '795.65' ] ],
    sell_details:
        [ [ '光大证券股份有限公司佛山绿景路证券营业部[一线游资]', '0.00', '2259.70', '-2259.70' ],
            [ '中国银河证券股份有限公司成都科华北路证券营业部', '0.00', '1700.93', '-1700.93' ],
            [ '华泰证券股份有限公司南京中山北路证券营业部', '0.00', '1419.65', '-1419.65' ],
            [ '华泰证券股份有限公司深圳益田路荣超商务中心证券营业部[一线游资]',
                '0.00',
                '1346.88',
                '-1346.88' ],
            [ '国泰君安证券股份有限公司顺德东乐路证券营业部', '0.00', '1346.55', '-1346.55' ] ] }

getLHB();
// geneImage(lhb,function () {});
// post();

// getLogin(function (cookie) {
//     cookie = cookie;
//     uploadImg("./images/000560_20171013.jpg");
// });
// getTodayStockInfo('000970',function () {});

function getFullStockCode(stock_code){
    if(stock_code < "600000"){
        return "SZ" + stock_code;
    }else{
        return "SH" + stock_code;
    }
}


function getLHB() {
    request.get("http://data.10jqka.com.cn/market/longhu/")
        .charset("GBK")
        .end((err,res) => {
            let $ = cheerio.load(res.text,{decodeEntities: false});
            let today = $(".m_text_date.startday").val();
            if(today != currentDate){
                console.log("未获得最新的龙虎榜");
                return;
            }
            $('.stockcont').each(function (i,item) {
                item = $(item);
                let stock_code = item.attr('stockcode');
                if(hasPosted.indexOf(stock_code) > -1){
                    return;
                }
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
                console.log(lhb);
                sleepTime += 121000;
                setTimeout(function () {
                    geneImage(lhb,function (lhb_data) {
                        getLogin(function (cookie) {
                            uploadImg(lhb_data.img_path,function (img_url) {
                                request.get(urls.token)
                                    .set(base_headers)
                                    .set("Cookie", cookie)
                                    .end((err, res) => {
                                        let data = JSON.parse(res.text);
                                        if(data.token){
                                            let stock_anchor = lhb_data.stock_name + "(" + getFullStockCode(lhb_data.stock_code) + ")";
                                            let form = {
                                                "status": '<p> $' + stock_anchor + '$  ' +lhb.date + '龙虎榜' + '</p><p>上榜理由：'+ lhb.reason + '</p><div class="img-single-upload"><img src="' + img_url + '" class="ke_img"></div>',
                                                "session_token": data.token
                                            };
                                            request.post(urls.post)
                                                .set(base_headers)
                                                .set("Cookie", cookie)
                                                .type("form")
                                                .send(form)
                                                .end((err,res) => {
                                                    let resData = JSON.parse(res.text);
                                                    if(resData.error_code == "20204"){
                                                        // setTimeout(function () {
                                                        //     request.post(urls.post)
                                                        //         .set(base_headers)
                                                        //         .set("Cookie", cookie)
                                                        //         .type("form")
                                                        //         .send(form)
                                                        //         .end((err,res) => {
                                                        //             let resData = JSON.parse(res.text);
                                                        //
                                                        //             if(resData.error_code){
                                                        //                 console.log(resData);
                                                        //             }
                                                        //         });
                                                        // },i * 100000);
                                                        console.log(res.text);
                                                    }else if(resData.error_code){
                                                        console.log(resData);
                                                    }else{
                                                        hasPosted.push(lhb_data.stock_code);
                                                        fs.writeFileSync('./hasPosted.txt',hasPosted.toString());
                                                    }
                                                })
                                        }else{
                                            console.log('get post token fail');
                                        }
                                    });
                            });

                        });

                    })
                },sleepTime)

            });

        });
}

function geneImage(lhb,callback) {
    // let images = require("images");

    // let img = images(400, 1000)
    //     .fill(0xff, 0x00, 0x00, 0.5);
    let all_amount = parseFloat(lhb.buy_amount) + parseFloat(lhb.sell_amount);
    if(all_amount > 10000){
        all_amount = (all_amount/10000).toFixed(2) + "亿元";
    }else{
        all_amount = all_amount.toFixed(2) + "万元";
    }
    // img.save('lhb.jpg');
    let gm = require("gm");
    let img = gm(900, 1000, "#e4f2ff")
        .font('./data/font/msyh.ttf')      //引入预先下载的黑体字库
        .fontSize(28)
        .drawText(30, 50, lhb.title)
        .fontSize(16)
        .drawText(30, 100, "上榜理由："+lhb.reason)
        .drawText(30, 150, "成交额：" + all_amount + "    合计买入：" + lhb.buy_amount + "万元    合计卖出：" +lhb.sell_amount + "万元    净额：" + (parseFloat(lhb.buy_amount) - parseFloat(lhb.sell_amount)).toFixed(2) + "万元")
        .fill("#f5f8fa")
        .drawRectangle(25,170,970,220)
        .fill("#2f2f2f")
        .drawText(35, 200, "买入金额最大的前5名营业部")
        .drawText(600, 200, "买入额/万")
        .drawText(700, 200, "卖出额/万")
        .drawText(800, 200, "净额/万");

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
            .drawText(800, 500, "净额/万");
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
        img.drawText(600,850, "雪球");
        img.fill("red")
        img.drawText(630,850, "『龙虎榜助手』");
        img.fill("#2f2f2f");
        img.drawText(740,850, "倾情提供");
        img.drawText(600,880, "https://xueqiu.com/longhubang");
        let filepath = config.images_path + lhb.stock_code + "_" + moment(lhb.date).format("YYYYMMDD") + ".jpg";
        img.write(filepath,function (err) {
            if(err){
                console.log(err);
            }else{
                gm("./data/images/top.jpg")
                    .append(filepath)
                    .write(filepath,function (err) {
                        if(err){
                            console.log(err);
                        }else{
                            lhb.img_path = filepath;
                            callback(lhb);
                        }
                    });
            }
        });

}


function post() {
    request.get(urls.home)
        .end((err, res) => {
            console.log(res.headers);
            cookie = res.headers["set-cookie"].join(",").match(/(xq_a_token=.+?);/)[1];
            // cookie.push(res.headers["set-cookie"].join(",").match(/(xq_a_token=.+?);/)[0]);
            // cookie.push(res.headers["set-cookie"].join(",").match(/(xq_a_token.sig=.+?);/)[0]);
            // cookie.push(res.headers["set-cookie"].join(",").match(/(xq_r_token=.+?);/)[0]);
            // cookie.push(res.headers["set-cookie"].join(",").match(/(xq_r_token.sig=.+?);/)[0]);
            // cookie.push(res.headers["set-cookie"].join(",").match(/(xq_is_login=.+?);/)[0]);
            // cookie.push(res.headers["set-cookie"].join(",").match(/(xq_is_login.sig=.+?);/)[0]);
            request.post(urls.login)
                .set(base_headers)
                .set("Cookie", cookie)
                .type("form")
                .send(loginPass)
                .redirects(0)
                .end((err, res) => {
                    // console.log(res);
                    // request.post(urls.post)
                    //     .set(base_headers)
                    //     .set("Cookie", cookie)
                    //     .type("form")
                    //     .send({status:"<p>士大夫似懂非懂是f</p>",session_token: "GAOQvCDru0U8epFCXkc2vc"})
                    //     .redirects(0)
                    //     .end((err, res) => {
                    //         console.log(res);
                    //     });
                    console.log(cookie);
                    console.log(res.text);
                    let loginData = JSON.parse(res.text);
                    if(loginData.access_token){
                        cookie = "xq_a_token=" + loginData.access_token;
                    }
                    request.get(urls.token)
                        .set(base_headers)
                        .set("Cookie", cookie)
                        .end((err, res) => {
                            let data = JSON.parse(res.text);
                            if(data.token){
                                let form = {
                                    "status": '<p>xxdf士大夫了时代峰峻螺蛳粉塑料袋</p><div class="img-single-upload"><img src="http://xqimg.imedao.com/15f207b793211b863fd36dbc.jpg" class="ke_img"></div><p>纯属测试的三连发是</p>',
                                    "session_token": data.token
                                };
                                request.post(urls.post)
                                    .set(base_headers)
                                    .set("Cookie", cookie)
                                    .type("form")
                                    .send(form)
                                    .end((err,res) => {
                                        console.log(res.text);
                                    })
                            }
                            console.log(res.text);
                        });

                });
        });
}

function getLogin(callback) {
    request.get(urls.home)
        .end((err, res) => {
            console.log(res.headers);
            cookie = res.headers["set-cookie"].join(",").match(/(xq_a_token=.+?);/)[1];
            let is_login = res.headers["set-cookie"].join(",").match(/(xq_is_login=.*?);/)[1];
            if(is_login !== "xq_is_login="){
                console.log('has logined');
                callback(cookie);
            }else{
                request.post(urls.login)
                    .set(base_headers)
                    .set("Cookie", cookie)
                    .type("form")
                    .send(loginPass)
                    .redirects(0)
                    .end((err, res) => {
                        // console.log(res);
                        // request.post(urls.post)
                        //     .set(base_headers)
                        //     .set("Cookie", cookie)
                        //     .type("form")
                        //     .send({status:"<p>士大夫似懂非懂是f</p>",session_token: "GAOQvCDru0U8epFCXkc2vc"})
                        //     .redirects(0)
                        //     .end((err, res) => {
                        //         console.log(res);
                        //     });
                        console.log(cookie);
                        // console.log(res.text);
                        let loginData = JSON.parse(res.text);
                        if(loginData.access_token){
                            cookie = "xq_a_token=" + loginData.access_token;
                            console.log('cookie:');
                            console.log(cookie);
                            callback(cookie);
                        }else{
                            console.log(res.text);
                        }
                    });
            }
        });

}
function uploadImg(filePath,callback){
    request.post(urls.upload)
        .set(base_headers)
        .set("Cookie", cookie)
        .attach('file', filePath)
        .field('filename', filePath)
        .end((err,res) => {
            console.log(res.text);
            let resData = JSON.parse(res.text);
            if(resData.url){
                callback(resData.url + '/' + resData.filename);
            }
        })
}

let departments  = [
    {"招商证券深圳蛇口工业七路证券营业部": "知名游资『乔帮主』"},
    {"中信证券溧阳路证券营业部":"知名游资席位"},
    {"中信证券上海古北路证券营业部":"知名游资席位"},
    {"中信证券上海瑞金南路证券营业部":"知名游资席位"},
    {"中信证券上海淮海中路证券营业部":"知名游资席位"},
    {"浙商证券绍兴解放北路证券营业部":"宁波敢死队『赵老哥』"},
    {"中国银河证券绍兴证券营业部":"知名游资『赵老哥』"},
    {"中国银河证券北京阜成路证券营业部":"知名游资『赵老哥』"},
    {"华泰证券浙江分公司":"知名游资『赵老哥』"},
    {"湘财证券上海陆家嘴证券营业部":"知名游资『赵老哥』"},
    {"华泰证券永嘉阳光大道证券营业部":"知名游资『赵老哥』"},
    {"光大证券佛山绿景路证券营业部":"知名游资『佛山无影脚』"},
    {"光大证券佛山季华六路":"知名游资『佛山无影脚』"},
    {"长江证券佛山普澜二路":"知名游资『佛山无影脚』"},
    {"湘财证券佛山祖庙路":"知名游资『佛山无影脚』"},
    {"华泰证券成都南一环路证券营业部":"知名游资『职业炒手』"},
    {"国泰君安证券成都北一环路证券营业部":"知名游资『职业炒手』"},
    {"国信证券成都二环路证券营业部":"知名游资『职业炒手』"},
    {"华鑫证券上海宛平南路证券营业部":"知名游资『炒股养家』"},
    {"华鑫证券宁波沧海路证券营业部":"知名游资『炒股养家』"},
    {"华鑫证券上海淞滨路证券营业部":"知名游资『炒股养家』"},
    {"华鑫证券上海松江证券营业部":"知名游资『炒股养家』"},
    {"华鑫证券上海茅台路证券营业部":"知名游资『炒股养家』"},
    {"光大证券宁波解放南路证券营业部":"宁波敢死队"},
    {"华泰证券厦门厦禾路证券营业部":"著名实力游资"},
    {"中信建投证券宜昌解放路证券营业部":"知名游资『瑞鹤仙』"},
    {"中国银河证券宜昌新世纪证券营业部":"知名游资『瑞鹤仙』"},
    {"新时代证券宜昌东山大道证券营业部":"知名游资『瑞鹤仙』"},
    {"中信证券杭州延安路证券营业部":"著名牛散章建平席位"},
    {"财通证券有限责任公司绍兴人民中路证券营业部":"浙江帮绍兴知名游资"},
    {"华泰证券南京六合彤华街证券营业部":"知名游资『桃仙大神龙飞虎』"},
    {"光大证券股份有限公司杭州庆春路证券营业部":"知名游资"},
    {"华泰证券股份有限公司上海武定路证券营业部":"新生代游资"},
    {"华泰证券股份有限公司北京雍和宫证券营业部龙虎榜数据":"牛散唐汉若"}
];

function getTodayStockInfo(stock_code,callback) {
    getLogin(function (cookie) {
        request.get("https://xueqiu.com/v4/stock/quote.json?code=" + getFullStockCode(stock_code) + "&_=" + new Date().getTime())
            .set("Cookie", cookie)
            .end((err, res) => {
            console.log(res.text);
            callback(info);
        });
    });

}
function analyze(lhb) {
    //分析买入榜
    //模型一，买一主买封涨停
    //模型二，卖一砸盘封跌停
    let buyers = [];
    let comments = [];
    if(lhb.buy_details){
        lhb.buy_details.forEach(function (item,i){
            let departmentName = item[0].split('[')[0];
            let departmentAliasName = departmentName;
            if(departments[departmentName]){
                departmentAliasName = buyers[i] = departments[departmentName];
            }
            if(i == 0){
                comments.push(departmentAliasName + "主买封涨停");
            }
        });
    }

    if(lhb.sell_details){
        lhb.sell_details.forEach(function (item,i){
            let departmentName = item[0].split('[')[0];
            let departmentAliasName = departmentName;
            if(departments[departmentName]){
                departmentAliasName = buyers[i] = departments[departmentName];
            }
            if(i == 0){
                comments.push(departmentAliasName + "主卖封涨停");
            }
        });
    }
}