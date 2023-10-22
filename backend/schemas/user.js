const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const UserSchema = new Schema({
    provider: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    displayName: {
        type: String,
        minLenght: 3
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    google : {
        name: String,
        given_name: String,
        family_name: String,
        picture: String,
        email: String,
        email_verified: Boolean,
        locale: String
    },
    avatar: {
        type: String,
        required: false,
    },
    uid: {
        type: String,
        required: true,
        unique: true,
    },
    roles: [String],
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    }
})
UserSchema.methods.isValidPassword = async function (password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (err) {
      throw err;
    }
};

const User = mongoose.model("user", UserSchema);
module.exports = User;
