module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        app_id:{type: String},
        data: {type: String},
    },{timestamps: true});

    return mongoose.model('crawler_thing', schema);
}
