const mongoose = require('mongoose');

const cdnSchema = new mongoose.Schema({
    type: String,
    filename: String,
    path: String,
    author: String,
    originalName: String,
    createdAt: { type: Date, default: Date.now }
})

const CDN = mongoose.model("cdn", cdnSchema);
module.exports = CDN;