let express = require('express');
let dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const bodyparser = require('body-parser');
const dbConnection = require('./config/db');
const { init } = require('./config/server');
// import dbConnection from './config/db.js';
const app = express();
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
// Aquiring all the models
const User = require('./models/User');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
// Creating a db  connection
dbConnection();

const server = app.listen(process.env.PORT, (err) => {
  if (err) {
    return console.log(err);
  } else {
    console.log(`Server listening on port ${process.env.PORT}`);
    const io = init(server);
    io.on('connection', () => {
      // on connection with client
      console.log(`Client # ${io.engine.clientsCount} is connected`);
    });
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
