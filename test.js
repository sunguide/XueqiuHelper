/**
 * Created by Administrator on 2017/10/18.
 */


const Datastore = require('nedb');
let db = {};
db.post_record = new Datastore({ filename: 'data/database/post_record.db', autoload: true });


function isPosted(id) {
    let isPosted = false;
    return new Promise((resolve,reject)=>{
        db.post_record.find({"id":id},function (err,docs) {
            if(err){
                reject(err);
            }else{
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
(bbb());