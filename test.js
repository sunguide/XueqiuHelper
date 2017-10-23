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
let key = "key";
db.post_record.find({key:key},function(err,docs){
  console.log(docs);
})

function randomChinese(length){
    //unicode
    let range,rand,min,max;
    let char = [];
    let chars = [];
    for(let i = 0; i < length; i++){
        //1
        max = 9;
        min = 4;
        range = max - min;
        rand = Math.random();
        char[0] = min + Math.round(rand * range);
        //2
        max = 15;
        min = char[0] === 4 ? 14:0;
        range = max - min;
        rand = Math.random();
        char[1] = min + Math.round(rand * range);
        //3
        max = char[0] === 9 && char[1] === 15 ? 10:15;
        min = 0;
        range = max - min;
        rand = Math.random();
        char[2] = min + Math.round(rand * range);
        //4
        max = char[0] === 9 && char[1] === 15 && char[2] === 10 ? 5:15;
        min = 0;
        range = max - min;
        rand = Math.random();
        char[3] = min + Math.round(rand * range);

        for(let k = 0; k < 4;k++){
            char[k] = char[k].toString(16);
        }
        chars.push("\\u" + char.join(''));
    }
    return eval("'"+ chars.join('')+ "'");
}

console.log(randomChinese(500));