module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id:{type: String},
        stock_code: {type: String},
        stock_name: {type: String},
        buy_details:{type: Array},
        sell_details:{type: Array},
        buy_amount:{type: Number},
        sell_amount:{type: Number},
        net_amount:{type: Number},
        buy1:{type: Number},
        buy2:{type: Number},
        buy3:{type: Number},
        buy4:{type: Number},
        buy5:{type: Number},
        sell1:{type: Number},
        sell2:{type: Number},
        sell3:{type: Number},
        sell4:{type: Number},
        sell5:{type: Number},
        date: {type: Number},
        extra: {type: String},
    });

    return mongoose.model('XQ_longhubang', schema);
}
