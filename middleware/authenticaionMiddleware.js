const jwt = require('jsonwebtoken');



const authenticateToken = (req, res, next) => {
    
    const authHeader = req.headers['authorization'];

    if (!authHeader) { return res.status(401).json({ type: "error", message: "Authorization header missing" }); }

    const token = authHeader.split(' ')[1];

    if (!token) {return res.status(401).json({ type: "error", message: "Token missing" }); }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) { return res.status(403).json({ type: "error", message: "Token is invalid or expired" }); }

        if (!user.roles || !Array.isArray(user.roles)) {return res.status(403).json({ type: "error", message: "Invalid user roles data" }); }

        const isAdmin = user.roles.some(role => role.role_name === 'Admin');

        if (!isAdmin) { return res.status(403).json({ type: "error", message: "You don't have permission to create users only HR can create new user" }); }

        req.user = user; 

        next(); 
    });
};

module.exports = authenticateToken;



