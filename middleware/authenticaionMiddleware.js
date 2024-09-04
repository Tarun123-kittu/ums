const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader) { return res.status(401).json({ type: "error", message: "Authorization header missing" }); }

    const token = authHeader.split(' ')[1];

    if (!token) { return res.status(401).json({ type: "error", message: "Token missing" }); }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) { return res.status(403).json({ type: "error", message: "Token is invalid or expired" }); }

        const isAdmin = user.roles === "Admin"

        if (!isAdmin) { return res.status(403).json({ type: "error", message: "You don't have permission to create users only Admin can create new user" }); }

        req.user = user;

        next();
    });
};

module.exports = authenticateToken;



