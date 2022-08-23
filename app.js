let express = require('express');
let dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const dbConnection = require('./config/db');
// import dbConnection from './config/db.js';
const app = express();
app.use(express.json());
// Aquiring all the models
const User = require('./models/User');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
// Creating a db  connection
dbConnection();

app.listen(3000, (err) => {
  if (err) {
    return console.log(err);
  } else {
    console.log('Server listening on port 3000');
  }
});

// Registeration of all routes
app.use('/', (req, res, next) => {
  let requestMethod = req.method;
  console.log(`${requestMethod}: ${req.url}`);
  next();
});
app.use('/user', userRoutes);
app.use('/post', postRoutes);
