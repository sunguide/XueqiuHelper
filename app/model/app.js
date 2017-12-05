module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        name: {type: String},
        description: {type: String},
        config:{type: String},
        proxy:{type: String},
        webhooks:{type: String},
        status:{type: String}
    },{timestamps: true});

    return mongoose.model('app', schema);
}
