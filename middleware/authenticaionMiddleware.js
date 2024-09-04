const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token) {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, config.development.secret_key);

      req.result = decoded; 
    } else {
      return res.status(401).json({ message: "Token is required for authentication.", type: 'error' });
    }
    next();
  } catch (error) {
    console.log("ERROR::", error);
    return res.status(401).json({ message: "Unauthorized user", type: "error", data: error.message });
  }
};

module.exports = verifyToken;
