/**
 * Validate product input data
 */
const validateProduct = (req, res, next) => {
    const { name, category, units, pricePerUnit } = req.body;
    const errors = [];

    if (!name || name.trim() === '') {
        errors.push('Product name is required');
    }

    if (!category) {
        errors.push('Category is required');
    } else if (!['Device', 'Coil', 'E-Liquid'].includes(category)) {
        errors.push('Invalid category. Must be Device, Coil, or E-Liquid');
    }

    if (units === undefined || units === null) {
        errors.push('Units is required');
    } else if (isNaN(units) || parseInt(units) < 0) {
        errors.push('Units must be a non-negative number');
    }

    if (pricePerUnit === undefined || pricePerUnit === null) {
        errors.push('Price per unit is required');
    } else if (isNaN(pricePerUnit) || parseFloat(pricePerUnit) < 0) {
        errors.push('Price must be a non-negative number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate shopkeeper creation
 */
const validateShopkeeper = (req, res, next) => {
    const { username, password } = req.body;
    const errors = [];

    if (!username || username.trim() === '') {
        errors.push('Username is required');
    } else if (username.length < 3) {
        errors.push('Username must be at least 3 characters');
    }

    // Password is optional - will be auto-generated if not provided
    if (password && password.trim() !== '' && password.length < 6) {
        errors.push('Password must be at least 6 characters if provided');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate sell transaction
 */
const validateSell = (req, res, next) => {
    const { productId, qty } = req.body;
    const errors = [];

    if (!productId) {
        errors.push('Product ID is required');
    }

    if (!qty || isNaN(qty) || parseInt(qty) <= 0) {
        errors.push('Quantity must be a positive number');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

module.exports = {
    validateProduct,
    validateShopkeeper,
    validateSell,
};
