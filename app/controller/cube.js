'use strict';
const moment = require("moment");
module.exports = app => {
    class cubeController extends app.Controller {
        * index(ctx) {
            let cubes = yield ctx.model.XueqiuCube.find({close:{$ne:1}}).sort({nav:-1}).limit(50);


            yield this.ctx.render('cube/list.tpl',{"cubes":cubes});

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
