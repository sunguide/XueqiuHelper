module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        uid:{type: Number},
        username: {type: String},
        password: {type: String},
        nickname: {type: String},
    });

    return mongoose.model('user', schema);
}
