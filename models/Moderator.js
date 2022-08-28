const { mongoose } = require('mongoose');

const moderatorSchema = mongoose.Schema({
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
});
module.exports = User = mongoose.model('Moderator', moderatorSchema);
