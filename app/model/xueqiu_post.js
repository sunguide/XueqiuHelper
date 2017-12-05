module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        id:{type:Number},
        uid:{type: Number},
        title: {type: String},
        cotent: {type: String},
        images: {type: String},
        type: {type: String},
        created_at: {type: Number},
    });

    return mongoose.model('XQ_post', schema);
}
