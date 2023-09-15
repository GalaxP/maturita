const mongoose = require('mongoose');

const Schema = mongoose.Schema

const commentSchema = new Schema({
    body: {
        type: String,
        required: true,
        maxLength: 500
    },
    author: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Schema.Types.Boolean,
        default: false
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
})

const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;