module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id: {type: String},
        name: {type: String},
        stocks: {type: Array},
        date: {type: String},
    },{timestamps: true});

    return mongoose.model('XQ_cube_rebalancing_log', schema);
}
