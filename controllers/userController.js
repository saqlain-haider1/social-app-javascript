const { default: mongoose } = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

// Function to handle userSignUp
const userSignUp = async (req, res) => {
  try {
    const { userData } = req.body;
    if (userData) {
      // If user object is present in the request body
      const { firstName, lastName, email, password } = userData;
      const user = await User.findOne({ email: email });
      // If user email is already present in the database
      if (user) {
        res.status(409).json({ message: 'Email already in use' });
      } else {
        // create new user object
        hashValue = await bcrypt.hash(password, 10);
        let newUser = new User({
          firstName,
          lastName,
          email,
          password: hashValue,
        });
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

// Function to get user information from  the database
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

// Function to handle user login
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const result = bcrypt.compare(
        password,
        user.password,
        function (err, result) {
          if (err) {
            throw err;
          }
          if (result) {
            const token = jwt.sign(
              {
                userId: user._id,
                email: user.email,
              },
              process.env.JWT_SECRET,
              {}
            );
            return res
              .status(200)
              .json({ message: 'Auth Succeded!', token: token });
          } else {
            return res.status(400).json({ message: 'Auth Failed!' });
          }
        }
      );
    } else {
      throw new Error('Email or Password is incorrect !');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Function to update information of an exisisting user account
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
// Function to handle DELETION of a given user account
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

// Function to followUser
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userData } = req.body;
    if (!userId || !userData.id) {
      throw new Error('User1 or User2  ID not found!');
    } else {
      const userToFollow = await User.findById(mongoose.Types.ObjectId(userId));
      if (userToFollow) {
        // User 1 found in the database
        let followUser = await User.findById(
          mongoose.Types.ObjectId(userData.id)
        );
        if (followUser) {
          // User 2 found in the database
          if (followUser.following.includes(userToFollow._id)) {
            return res
              .status(200)
              .json({ message: 'User is already followed!' });
          }
          followUser.following.push(userToFollow._id);
          await followUser.save();
          userToFollow.followers.push(followUser._id);
          await userToFollow.save();
          return res
            .status(200)
            .json({ message: 'User followed successfully!' });
        } else {
          throw new Error('Following User not exists!');
        }
      } else {
        throw new Error('User to follow not exists!');
      }
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Function to unfollow user
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userData } = req.body;
    if (!userId || !userData.id) {
      throw new Error('User1 or User2  ID not found!');
    } else {
      const userToUnfollow = await User.findById(
        mongoose.Types.ObjectId(userId)
      );
      if (userToUnfollow) {
        // User 1 found in the database
        let followingUser = await User.findById(
          mongoose.Types.ObjectId(userData.id)
        );
        if (followingUser) {
          // User 2 found in the database
          console.log(followingUser, userToUnfollow._id);
          let userToUnfollowIndex = followingUser.following.indexOf(
            userToUnfollow._id
          );
          console.log(userToUnfollowIndex);
          if (userToUnfollowIndex === -1) {
            throw new Error('User not followed!');
          }

          let followingUserIndex = userToUnfollow.followers.indexOf(
            followingUser._id
          );
          followingUser.following.splice(userToUnfollowIndex, 1);
          await followingUser.save();
          userToUnfollow.followers.splice(followingUserIndex, 1);
          await userToUnfollow.save();
          return res
            .status(200)
            .json({ message: 'User unfollowed successfully!' });
        } else {
          throw new Error('Following User not exists!');
        }
      } else {
        throw new Error('User to unfollow not exists!');
      }
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
module.exports = {
  userSignUp,
  userLogin,
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
};
