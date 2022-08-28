const Moderator = require('../models/Moderator');
const Post = require('../models/Post');

// Function to handle userSignUp
const moderatorSignUp = async (req, res) => {
  try {
    const { userData } = req.body;
    if (userData) {
      // If user object is present in the request body
      const { firstName, lastName, email, password } = userData;
      const user = await Moderator.findOne({ email: email });
      // If user email is already present in the database
      if (user) {
        res.status(409).json({ message: 'Email already in use' });
      } else {
        // create new user object
        hashValue = await bcrypt.hash(password, 10);
        let newUser = new Moderator({
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

const moderatorLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Moderator.findOne({ email: email });
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
              {
                expiresIn: '1h',
              }
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
const getAllPosts = async (req, res) => {
  try {
    // Fetching query params and if not present
    // assign the default values
    const sortOrder = req.query.sortOrder || -1;
    const sortBy = req.query.sortBy || 'createdAt';
    const limitVal = req.query.postsPerPage || 11;
    const pageNo = req.query.page || 1;
    let posts = await Post.find({})
      .sort({ sortBy: sortOrder })
      .skip(limitVal * (pageNo - 1))
      .limit(limitVal);
    let totalPosts = await Post.find({})
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
  } catch (err) {
    //console.log(err);
    return res.status(500).json({ error: err.message });
  }
};
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    if (postId) {
      const limitValue = req.query.limit;
      const skipValue = req.query.skip;
      // Pagination of posts
      const post = await Post.find({ _id: postId });

      res.status(200).json({
        post: post,
      });
    } else {
      throw new Error(`Post ID not found`);
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findOne({ _id: postId });
    if (post) {
      // Post found in the database
      let deletedPost = await Post.findByIdAndDelete(
        mongoose.Types.ObjectId(post.id)
      );
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
module.exports = {
  moderatorSignUp,
  moderatorLogin,
  getAllPosts,
  getPost,
  deletePost,
};
