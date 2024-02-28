const mongoose = require('mongoose')

const Schema = mongoose.Schema

const deletedSchema = new Schema({
    deletedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    deletedBy: {
        type: String,
        required: true
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
    deleted: {
        type: Schema.Types.Mixed, 
    },
})

const Deleted = mongoose.model("deleted", deletedSchema);
module.exports = Deleted;