const { default: mongoose } = require('mongoose');
const Post = require('../models/Post');
const { getIO } = require('../config/server');

// Function to handle POST creation request
const createPost = async (req, res) => {
  try {
    const { postData } = req.body;
    const { userId } = req.body;
    if (postData && userId) {
      let user = await User.findOne({ _id: userId });
      if (!user) {
        throw new Error('User not found!');
      } else {
        const { title, description } = postData;

        const post = await new Post({
          userId,
          title,
          description,
        });
        console.log(post);
        post.save().then((result) => {
          // giving signal to all client who are listening to socket "newPost"
          getIO().emit('newPost', { newPost: post });
          res.status(200).json({
            message: 'Post created successfully!',
            CreatedPost: result,
          });
        });
      }
    } else {
      throw new Error(`Invalid post data or UserID: ${postData} + ${userId}`);
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Function to get posts of a given user ID
const getPost = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId) {
      const limitValue = req.query.limit;
      const skipValue = req.query.skip;
      // Pagination of posts
      const posts = await Post.find({ userId: userId })
        .limit(limitValue)
        .skip(skipValue);
      res.status(200).json({
        pagination: { limit: limitValue, skip: skipValue },
        posts: posts,
      });
    } else {
      throw new Error(`User ID not found`);
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// Function to update a POST
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { postData } = req.body;

    if (!postData || !postId) {
      throw new Error('PostID or Post Data not given!');
    }
    const post = await Post.findOne({ _id: postId });
    if (post) {
      // Post found in the database
      let updatedPost = await Post.findByIdAndUpdate(
        post._id,
        ({ title, description } = postData),
        { new: true }
      );
      return res
        .status(200)
        .json({ message: 'Post updated successfully!', Updated: updatedPost });
    } else {
      throw new Error('Post not found!');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Function to handle DELETION of a post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({ _id: postId });
    if (post) {
      // Post found in the database
      let deletedPost = await Post.findByIdAndDelete(
        mongoose.Types.ObjectId(post.id)
      );
      console.log(deletedPost);
      return res.status(200).json({
        message: 'Post deleted successfully!',
        DeletedPost: deletedPost,
      });
    } else {
      throw new Error('Post not found!');
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// Exporting all functions
module.exports = {
  createPost,
  getPost,
  updatePost,
  deletePost,
};
