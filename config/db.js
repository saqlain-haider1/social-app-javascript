const { mongoose } = require('mongoose');
require('dotenv').config();
// dbConnection is used to establish a connection to MongoDB and export it as a utility function
const dbConnection = async () => {
  let URI = process.env.DBURI;
  mongoose.connect(URI, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Connected to database successfully');
    }
  });
};

module.exports = dbConnection;
