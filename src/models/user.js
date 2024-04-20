const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  blogs: {type: mongoose.Schema.Types.ObjectId, ref: "Blog"},
  role: {type: String, enum: ["USER", "ADMIN"], default: "USER" }
}, {timestamps: true });

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
