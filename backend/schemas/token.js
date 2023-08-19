const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  uid: {
    type: String,
    required: true,
    lowercase: true,
  },
  token: {
    type: String,
    required: true,
  },
  expireAt: {
    type: Date,
    required: true,
  },
});

TokenSchema.pre("save", async function (next) {
  try {
    const previousToken = await Token.findOne({ uid: this.uid });
    if (previousToken !== null) {
      await Token.deleteMany({ uid: this.uid });
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Token = mongoose.model("token", TokenSchema);
module.exports = Token;
