module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        uid:{type: Number},
        username: {type: String},
        password: {type: String},
        screen_name: {type: String},
        access_token: {type: String},
    });

    return mongoose.model('XQ_user', schema);
}
