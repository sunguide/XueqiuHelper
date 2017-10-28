module.exports = app => {
    const mongoose = app.mongoose;
    const schema = new mongoose.Schema({
        fromId:{type: Number},
        toId: {type: Number},
        sequenceId: {type: Number},
        toGroup: {type: Boolean},
        plain: {type: String},
        success: {type: Boolean},
        created: {type: Number},
    });

    return mongoose.model('XQ_message_record', schema);
}
