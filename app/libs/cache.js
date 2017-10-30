'use strict';
const Datastore = require('nedb');
const db = new Datastore({ filename: './data/database/cache.db', autoload: false });

module.exports =  {
    set: function (key, value, ttl){
        return new Promise((resolve, reject) => {
            if(ttl){
                ttl = parseInt(ttl) + Date.now();
            }else{
                ttl = 0;
            }
            let data = { key: key, value:value, ttl: ttl };
            db.loadDatabase();
            db.find({key:key}, function (err, docs) {
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
    },
    get:function (key){
        return new Promise((resolve, reject) => {
            db.loadDatabase();
            db.find({key:key},function (err, docs) {
                if(err){
                    reject(err);
                }else{
                    let doc = false;
                    if(docs.length > 0 && (!docs[0].ttl || docs[0].ttl >= Date.now())){
                        doc = docs[0]['value'];
                    }
                    resolve(doc);
                }
            });
        });
    }
};
