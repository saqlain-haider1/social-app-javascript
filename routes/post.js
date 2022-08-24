const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const postController = require('../controllers/postController');
const checkAuth = require('../middleware/auth');
// Endpoint for creating a new post
router.post('/create', checkAuth, (req, res) =>
  postController.createPost(req, res)
);

// Endpoint for reading posts with the specified user
router.get('/:userId', checkAuth, (req, res) =>
  postController.getPost(req, res)
);

// Endpoint for updating a post with the given post and user ID
router.put('/update/:postId', checkAuth, (req, res) =>
  postController.updatePost(req, res)
);

// Endpoint for deleting a post with the specified post and user ID
router.delete('/:postId', checkAuth, (req, res) =>
  postController.deletePost(req, res)
);

module.exports = router;
