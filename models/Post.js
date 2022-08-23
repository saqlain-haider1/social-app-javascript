const { mongoose } = require('mongoose');
const User = require('./User');

const postSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

module.exports = Post = mongoose.model('Post', postSchema);
