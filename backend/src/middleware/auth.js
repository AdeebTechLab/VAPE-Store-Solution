const jwt = require('jsonwebtoken');
const config = require('../config/environment');

/**
 * Middleware to verify JWT token
 */
const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);

        // Attach user info to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
};

module.exports = auth;
