/**
 * Middleware to check if user has admin role
 */
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

/**
 * Middleware to check if user has shopkeeper role
 */
const isShopkeeper = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'shopkeeper') {
        return res.status(403).json({
            success: false,
            message: 'Shopkeeper access required'
        });
    }

    next();
};

/**
 * Middleware to check if shopkeeper has access to specific shop
 */
const checkShopAccess = (req, res, next) => {
    const shopId = req.params.shopId;

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    // Admin has access to all shops
    if (req.user.role === 'admin') {
        return next();
    }

    // Shopkeeper can only access their assigned shop
    if (req.user.role === 'shopkeeper' && req.user.shopId !== shopId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied to this shop'
        });
    }

    next();
};

module.exports = {
    isAdmin,
    isShopkeeper,
    checkShopAccess,
};
