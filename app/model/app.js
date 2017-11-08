module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        name: {type: String},
        repos: {type: String},
        config:{type: String},
        deploys:{type: String},
        build: {type: Number}
    },{timestamps: true});

    return mongoose.model('app', schema);
}
