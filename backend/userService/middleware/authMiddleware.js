"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const authUtils_1 = require("../utils/authUtils");
// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    // Get the authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required' });
    }
    const decoded = (0, authUtils_1.verifyToken)(token);
    if (!decoded) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
    // Add user info to request object
    req.user = { userId: decoded.userId };
    next();
};
exports.authenticateToken = authenticateToken;
