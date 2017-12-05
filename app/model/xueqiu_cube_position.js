module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id: {type: String, index: true},
        uid: {type: Number, index: true},
        date: {type: Number, index: true},
        stock_code: {type: String, index: true},
        stock_name: {type: String},
        stock_weight: {type: Number},
    },{timestamps: true});

    return mongoose.model('XQ_cube_position', schema);
}
