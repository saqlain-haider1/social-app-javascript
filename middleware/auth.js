const jwt = require('jsonwebtoken');

// Auth function exported from the module
// This function is used to verify the JSON web token
// provided from the client side.
const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: 'Authorization failed' });
  }
};

module.exports = checkAuth;
