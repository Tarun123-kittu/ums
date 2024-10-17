let jwt = require('jsonwebtoken');
const config = require('../config/config');
const getLatestRoles = require("../utils/getLatestRoles")
const {errorResponse,successResponse} = require("../utils/responseHandler")

let verifyToken = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token) {

            token = token.split(' ')[1];

            let decoded = jwt.verify(token, config.development.secret_key);
            
            const { user_id } = decoded;
         
            let roles = await getLatestRoles(user_id)
            
            req.result = {
                ...decoded,
                roles: [...new Set([...(decoded.roles || []), ...roles])],
            };
           
        } else {
            return res.status(401).json(errorResponse("Token is required for authentication"));
        }
        
        next();

    } catch (error) {
        console.log("ERROR::", error);
        return res.status(401).json(errorResponse("Unauthorized user"));
    }
};

module.exports = verifyToken;
