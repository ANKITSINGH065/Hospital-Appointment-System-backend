const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['doctor', 'patient'],
    required: true,
  },
});

// Create User Model
const User = mongoose.model('User', userSchema);

module.exports = User;