const jwt = require('jsonwebtoken');

const createToken = async (roles, userId, username, email) => {
    return new Promise((resolve, reject) => {
        jwt.sign({ roles, userId, username, email }, process.env.JWT_SECRET, (err, token) => {
            if (err) {
                reject(err);
            } else {
                resolve(token);
            }
        });
    });
};

module.exports = { createToken };

