const { default: mongoose } = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

// Function to fetch feed of a given userID
const getFeed = async (req, res) => {
  try {
    console.log('getting');
    const { userId } = req.body;

    // Fetching query params and if not present
    // assign the default values
    const sortOrder = req.query.sortOrder || -1;
    const sortBy = req.query.sortBy || 'createdAt';
    const limitVal = req.query.postsPerPage || 11;
    const pageNo = req.query.page || 1;
    const user = await User.findOne({ _id: userId });

    if (user) {
      // User found in database

      let posts = await Post.find({ userId: { $in: user.following } })
        .sort({ sortBy: sortOrder })
        .skip(limitVal * (pageNo - 1))
        .limit(limitVal);
      let totalPosts = await Post.find({
        userId: { $in: user.following },
      })
        .sort([[sortBy, sortOrder]])
        .count();
      res.status(200).json({
        'Pagination Details': {
          TOTAL_POSTS: totalPosts,
          POSTS_PER_PAGE: limitVal,
          'Current Page No': pageNo,
          'Has Next Page? ': pageNo * limitVal < totalPosts,
        },
        posts: posts,
      });
    } else {
      throw new Error('User not found');
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err });
  }
};

module.exports = {
  getFeed,
};
