const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/auth');
const moderatorController = require('../controllers/moderatorController');

// Route for sign up moderator
router.post('/signup', (req, res) =>
  moderatorController.moderatorSignUp(req, res)
);

// Route for login moderator
router.post('/login', (req, res) =>
  moderatorController.moderatorLogin(req, res)
);

// Route for getting all the posts
router.get('/', checkAuth, (req, res) =>
  moderatorController.getAllPosts(req, res)
);

// Route for getting a single post
router.get('/:postId', checkAuth, (req, res) =>
  moderatorController.getPost(req, res)
);

// Route for deleting a post
router.delete('/:postId', checkAuth, (req, res) =>
  moderatorController.deletePost(req, res)
);

module.exports = router;
