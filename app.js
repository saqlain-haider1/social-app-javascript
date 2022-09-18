let express = require('express');
const { mongoose } = require('mongoose');
require('dotenv').config();
const bodyparser = require('body-parser');
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
let URI;
if (process.env.NODE_ENV === 'test') {
  URI = process.env.TEST_DBURI;
} else {
  URI = process.env.DBURI;
}
mongoose.connect(URI, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Connected to database successfully');
  }
});

const server = app.listen(process.env.PORT, async (err) => {
  if (err) {
    return console.log(err);
  } else {
    console.log(`Server listening on port ${process.env.PORT}`);
    const io = init(server);
  }
});

// app.use('/', (req, res, next) => {
//   let requestMethod = req.method;
//   console.log(`${requestMethod}: ${req.url}`);
//   next();
// });

app.get('/', (req, res, next) => {
  res
    .status(200)
    .send('Welcome to the Social Network App deployed on Heroku Server');
  next();
});

// Registeration of all routes
app.use('/user', userRoutes);
app.use('/post', postRoutes);
app.use('/moderator', moderatorRoutes);

module.exports = { server };
