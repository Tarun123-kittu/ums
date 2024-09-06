let jwt = require('jsonwebtoken');
const config = require('../config/config');
const getLatestRoles = require("../utils/getLatestRoles")

let verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token) {

            token = token.split(' ')[1]; 

            let decoded = jwt.verify(token, config.development.secret_key);
    
            const { userId } = decoded;

            let roles = await getLatestRoles(userId)
            
            req.result = {
                ...decoded,
                roles: [...new Set([...(decoded.roles || []), ...roles])], 
            };

            console.log("result -----",req.result)
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
