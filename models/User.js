const { mongoose } = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // index: true,
    // sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  followers: {
    type: [mongoose.Types.ObjectId],
    default: [],
  },
  following: {
    type: [mongoose.Types.ObjectId],
    default: [],
  },
});
module.exports = User = mongoose.model('User', userSchema);
