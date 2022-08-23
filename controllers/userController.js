const { default: mongoose } = require('mongoose');
const User = require('../models/User');

const userSignUp = async (req, res) => {
  try {
    const { userObject } = req.body;
    if (userObject) {
      // If user object is present in the request body
      const { firstName, lastName, email, password } = userObject;
      const user = await User.findOne({ email: email });
      // If user email is already present in the database
      if (user) {
        res.status(409).json({ message: 'Email already in use' });
      } else {
        // create new user object

        let newUser = new User({ firstName, lastName, email, password });
        newUser.save().then((user) => {
          console.log('Created User: ' + user);
          return res
            .status(200)
            .json({ message: 'User created successfully!' });
        });
      }
    } else {
      throw new Error('Invalid user data!');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (user) {
      return res.status(200).json({ message: 'User found', userId: user });
    } else {
      throw new Error('User not found!');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userData } = req.body;
    if (!userData) {
      throw new Error('Invalid user data!');
    }
    const user = await User.findOne({ _id: userId });
    if (user) {
      // User found in the database
      let updatedUser = await User.findByIdAndUpdate(
        user._id,
        ({ firstName, lastName, email, password } = userData),
        { new: true }
      );
      return res
        .status(200)
        .json({ message: 'User updated successfully!', Updated: updatedUser });
    } else {
      throw new Error('User not found!');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId });
    if (user) {
      // User found in the database
      let deletedUser = await User.findByIdAndDelete(
        mongoose.Types.ObjectId(user.id)
      );
      console.log(deletedUser);
      return res.status(200).json({
        message: 'User deleted successfully!',
        DeletedUser: deletedUser,
      });
    } else {
      throw new Error('User not found!');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
module.exports = {
  userSignUp,
  getUser,
  updateUser,
  deleteUser,
};
