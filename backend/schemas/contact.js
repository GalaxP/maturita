const mongoose = require('mongoose')

const Schema = mongoose.Schema

const contactSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    remoteIP: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
})

const Contact = mongoose.model("contact", contactSchema);
module.exports = Contact;