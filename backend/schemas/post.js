const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true
    },
    locked: {
        type: Boolean,
        required: true,
        default: false
    },
    author: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    community: {
        type: String,
        required: true
    },
    tag: {
        type: String,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }]
})
postSchema.index({title: 'text', body: 'text'})
const Post = mongoose.model("post", postSchema);
module.exports = Post;