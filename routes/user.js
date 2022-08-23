const express = require('express');
const router = express.Router();
const User = require('../models/User');
const userController = require('../controllers/userController');

router.post('/test', (req, res) => {
  console.log(req.body);

  res.send({ message: 'Welcome to the test Server', body: req.body }).json();
});

// User CRUD Routes
// Route for creating user account

router.post('/signup', (req, res) => userController.userSignUp(req, res));

// Route for getting user through user ID
router.get('/:userId', (req, res) => userController.getUser(req, res));

// Route for updating user account
router.put('/:userId', (req, res) => userController.updateUser(req, res));

// Route for deleting user account
router.delete('/:userId', (req, res) => userController.deleteUser(req, res));

module.exports = router;
