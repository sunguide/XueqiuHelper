module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id: {type: String},
        uid: {type: Number},
        username: {type: String},
        nav: {type: Number},
        name: {type: String},
        close: {type: Number},
        weights: {type: Array},//[{"stock_name":"中国银行","stock_code":600300，weight:"10%"}]
        positions:{type: Number},
        date: {type: Number},
    },{timestamps: true});

    return mongoose.model('XQ_cube', schema);
}
