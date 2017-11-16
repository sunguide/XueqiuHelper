module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id: {type: String, index: true},
        uid: {type: Number, index: true},
        username: {type: String},
        nav: {type: Number, index: true},
        name: {type: String},
        close: {type: Number, index: true},
        weights: {type: Array},//[{"stock_name":"中国银行","stock_code":600300，weight:"10%"}]
        positions:{type: Number, index: true},
        date: {type: Number, index: true},
    },{timestamps: true});

    return mongoose.model('XQ_cube', schema);
}
