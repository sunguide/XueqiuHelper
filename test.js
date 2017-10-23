/**
 * Created by Administrator on 2017/10/18.
 */


const Datastore = require('nedb');
let db = {};
db.post_record = new Datastore({ filename: 'data/database/cache.db', autoload: true });


function isPosted(id) {
    let isPosted = false;
    return new Promise((resolve,reject)=>{
        db.post_record.find({"id":id},function (err,docs) {
            if(err){
                reject(err);
            }else{
                console.log(docs);
                if(docs.length > 0){
                    isPosted = true;
                }
            }
            resolve(isPosted);
        });
    });
}
async function aaa() {
    let i = await isPosted(1);
    return new Promise(function (resolve, reject) {
        resolve(i);
    })
}

async function bbb() {
    let i = await aaa();
    console.log(i);
}
// let key = "key";
// db.post_record.find({key:key},function(err,docs){
//   console.log(docs);
// })


const request = require("superagent");
let sequenceId = 100000211;
for(let i = 0; i<100;i++){

    request.post("https://im7.xueqiu.com/im-comet/v2/messages.json")
        .query({ user_id: 3595607502 })
        .set("Cookie","xq_a_token=a365d23ab715f9c3b963dc268149f35031ddb8c1")
        .set('Content-Type', 'application/json')
        .set('Host','im7.xueqiu.com')
        .set('Origin','https://xueqiu.com')
        .set('Referer','https://xueqiu.com/')
        .set('Content-Type', 'application/json')
        .set("User-Agent",'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36')
        .send(JSON.stringify({"toId":5435417380,"toGroup":false,"sequenceId":sequenceId,"plain":"I love U"+sequenceId}))
        .withCredentials()
        .end(function(err, res){
            if (err || !res.ok) {
                console.log('Oh no! error');
            } else {
                console.log('yay got ' + JSON.stringify(res.body));
            }
        });
    sequenceId ++;
}

// jQuery.ajax({
//     url: "https://im7.xueqiu.com/im-comet/v2/messages.json?user_id=3595607502",
//     type: "POST",
//     timeout: 2e4,
//     contentType: "application/json",
//     data: '{"toId":5435417380,"toGroup":false,"sequenceId":39990821,"plain":"新的一89000"}'
// });