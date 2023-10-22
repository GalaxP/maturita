const mongoose = require('mongoose')

const Schema = mongoose.Schema

const communitySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    moderators: {
        type: [String]
    },
    avatar: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    members: {
        type: [String]
    },
    createdBy: {
        type: String,
        required: true
    }
})

const Community = mongoose.model("community", communitySchema);
module.exports = Community;