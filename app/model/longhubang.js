module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id:{type: String},
        stock_code: {type: String},
        stock_name: {type: String},
        date: {type: Number},
        extra: {type: String},
        created: {type: Number},
    });

    return mongoose.model('XQ_longhubang', schema);
}
