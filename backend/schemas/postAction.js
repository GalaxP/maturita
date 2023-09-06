const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postActionSchema = new Schema({
    postId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    direction: {
        type: Number,
        min: -1,
        max: 1,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const PostAction = mongoose.model("postAction", postActionSchema);
module.exports = PostAction;