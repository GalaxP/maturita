const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
    type: String,
    filename: String,
    path: String,
    createdAt: { type: Date, default: Date.now }
  });
  
module.exports = Avatar = mongoose.model('Avatar', avatarSchema);