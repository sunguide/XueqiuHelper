module.exports = app => {
module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id: {type: String},
        name: {type: String},
        stocks: {type: Array},//[{"stock_name":"中国银行","stock_code":600300，weight:"10%"}]
        date: {type: String},
    },{timestamps: true});

    return mongoose.model('XQ_cube_rebalancing_log', schema);
}
