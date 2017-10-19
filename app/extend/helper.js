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
  }
};
