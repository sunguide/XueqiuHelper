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
  datetime(format){
      const moment = require("moment");
      return moment().format(format);
  }
};
