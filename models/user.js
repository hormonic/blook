const mongoose = require('mongoose');

// User Schema
const UserSchema = mongoose.Schema({
  email:{
    type: String,
    required: true
  },
  username:{
    type: String,
    required: true
  },
  password:{
    type: String,
    required: true
  },
  bio:{
    type: String
  },
  level:{
    type: String
  },
  created:{
    type: Date, default: Date.now
  },
  image:{
    filename: {
      type: String
    },
    data: Buffer,
    contentType: String
  }
});

const User = module.exports = mongoose.model('User', UserSchema);
