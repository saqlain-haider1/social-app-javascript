let express = require('express');
require('dotenv').config();
const bodyparser = require('body-parser');
const dbConnection = require('./config/db');
const { init } = require('./config/server');

const app = express();
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Aquiring all Routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const moderatorRoutes = require('./routes/moderator');

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

app.use('/', (req, res, next) => {
  let requestMethod = req.method;
  console.log(`${requestMethod}: ${req.url}`);
  next();
});

app.get('/', (req, res, next) => {
  console.log('Welcome to the Social Network App deployed on Heroku Server');
  next();
});

// Registeration of all routes
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/moderator', moderatorRoutes);
