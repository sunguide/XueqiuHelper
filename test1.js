'use strict';
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const request = require("superagent");
let options = {
  runScripts: "dangerously"
}
request.get("https://xueqiu.com/follows")
  .set("Cookie","xq_a_token=a365d23ab715f9c3b963dc268149f35031ddb8c1")
  .end(function(err,res){

    const dom = new JSDOM(res.text, options);
    const cheerio = require("cheerio");
    let $ = cheerio.load(dom.serialize(),{decodeEntities: false});
    let follower= {},follows = [];
    $('.follower-list ul li').each(function (i,item) {
        follower.uid = $(item).find(".headpic").attr("data-uid");
        follower.avatar = $(item).find(".headpic img").attr("src");
        follower.desc = $(item).find(".content .userDes").text();
        let str = $(item).find(".content .userInfo").text("src") + "";
        if(str.match(/(粉丝[0-9]+)人/)){
          follower.fans = str.match(/(粉丝[0-9]+)人/)[1];
        }else{
          follower.fans = 0;
        }
        if(str.match(/(关注[0-9]+)人/)){
          follower.follows = str.match(/(关注[0-9]+)人/)[1];
        }else{
          follower.follows = 0;
        }
        follows.push(follower);
    });
    console.log(follows);
  });
