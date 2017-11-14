'use strict';
const moment = require("moment");
module.exports = app => {
    class cubeController extends app.Controller {
        * index(ctx) {
            let cubes = yield ctx.model.XueqiuCube.find({close:{$ne:1}}).sort({nav:-1}).limit(50);

            let cubes_statistics = yield ctx.model.XueqiuCube.aggregate([
            {
             $match: {
               "close": 0
             }
            },
            {
              $group: {
                 _id:"$date", //将_id设置为day数据
                 total:{$sum: 1}, //统计price
              }
            },
            {
              $sort: {_id: 1}//根据date排序
            }
            ]);

            cubes = yield ctx.model.XueqiuCube.find({close:{$ne:1},date:20171113}).sort({nav:-1});
            let cube_weights = {};
            if(cubes.length > 0){
                for(let i = 0;i < cubes.length; i++){
                    console.log(cubes[i]);

                    if(cubes[i].weights.length === 0){

                    }else{
                        for(let k = 0; k < cubes[i]['weights'].length; k++){
                            let item = cubes[i]['weights'][k];
                            console.log(item);
                            if(cube_weights[item.stock_code]){
                                cube_weights[item.stock_code]['stock_weight'] += item.stock_weight;
                            }else{
                                cube_weights[item.stock_code] = item;
                            }
                        }

                    }
                }
            }
console.log(cube_weights)
            yield this.ctx.body = cube_weights;//cubes_statistics
            // yield this.ctx.render('cube/list.tpl',{"cubes":cubes});

            // this.ctx.body = cubes;

        }
        * top(){
            let stocks = {};
            let size = 1000;
            let offset = 0;
            let cubes;
            while (cubes = yield ctx.model.XueqiuCube.find({close:{$ne:1}}).limit(size).skip(offset)){
                if(cubes.length === 0){
                    break;
                }
                for(let i = 0; i< cubes.length;i++){
                    if(cubes[i].weights && cubes[i].weights.length > 0){
                        cubes[i].weights.forEach(function(item,k){
                            console.log(item)
                            if(stocks[item.stock_code]){
                                stocks[item.stock_code]['stock_weight'] += item.stock_weight;
                            }else{
                                stocks[item.stock_code] = item;
                            }
                        });
                    }
                }
                offset += size;
            }

            this.ctx.body = stocks;

        }

    }

    return cubeController;
};
