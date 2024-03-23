const mongoose = require('mongoose')

const Schema = mongoose.Schema

const logSchema = new Schema({
    timeStamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    data: {
        type: Schema.Types.Mixed,
    },
})

const Log = mongoose.model("log", logSchema);
module.exports = Log;