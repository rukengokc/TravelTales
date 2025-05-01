const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  dateOfBirth: Date,
  profileImage: String,
  followers: {
    type: Number,
    default: 0
  },
  following: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('User', UserSchema);
