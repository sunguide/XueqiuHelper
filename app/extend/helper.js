module.exports = helper = {
    getFullStockCode(stock_code) {
        if (stock_code < "600000") {
            return "SZ" + stock_code;
        } else {
            return "SH" + stock_code;
        }
    },
    getStockAnchor(stock_code, stock_name){
        return "$" + stock_name + "(" + helper.getFullStockCode(stock_code) + ")$";
    },
    md5(str){
        let crypto = require("crypto");
        let md5 = crypto.createHash("md5");
        md5.update(str);
        str = md5.digest('hex');
        return str.toUpperCase();
    },
    //unicode 4E00-9FA5

    randomChinese(length){
        //unicode
        let range, rand, min, max;
        let char = [];
        let chars = [];
        for (let i = 0; i < length; i++) {
            //1
            max = 9;
            min = 4;
            range = max - min;
            rand = Math.random();
            char[0] = min + Math.round(rand * range);
            //2
            max = 15;
            min = char[0] === 4 ? 14 : 0;
            range = max - min;
            rand = Math.random();
            char[1] = min + Math.round(rand * range);
            //3
            max = char[0] === 9 && char[1] === 15 ? 10 : 15;
            min = 0;
            range = max - min;
            rand = Math.random();
            char[2] = min + Math.round(rand * range);
            //4
            max = char[0] === 9 && char[1] === 15 && char[2] === 10 ? 5 : 15;
            min = 0;
            range = max - min;
            rand = Math.random();
            char[3] = min + Math.round(rand * range);

            for (let k = 0; k < 4; k++) {
                char[k] = char[k].toString(16);
            }
            chars.push("\\u" + char.join(''));
        }
        return eval("'" + chars.join('') + "'");

    },
    datetime(format, timestamp){
        const moment = require("moment");
        if(timestamp){
            return moment(timestamp).format(format);
        }
        return moment().format(format);
    },
    * sleep(timeout){
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                resolve(true);
            }, timeout);
        });
    },
    getOneTip(index){
        index = index || 0;
        let tips = require("../../data/investment_tips.js").tips;
        if(index < tips.length){
            return tips[index];
        }else{
            return false;
        }
    },
    JSON:{
        parse(str){
            try {
                str = JSON.parse(str);
            } catch (e) {
                return false;
            }
            return str;
        }
    }
};
