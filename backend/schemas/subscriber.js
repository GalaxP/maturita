const mongoose = require('mongoose')

const Schema = mongoose.Schema

const subscriberSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    unsubscribed: {
        type: Boolean,
        default: false,
    },
    verified: {
        type: Boolean,
        required:true,
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

const Subscriber = mongoose.model("subscriber", subscriberSchema);
module.exports = Subscriber;