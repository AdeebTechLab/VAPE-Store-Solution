const { connectAdminDB, getShopConnection } = require('../config/database');
const shopSchema = require('../models/Shop');
const shopkeeperSchema = require('../models/Shopkeeper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get all shopkeepers for a shop
 * GET /api/admin/shops/:shopId/shopkeepers
 */
const getShopkeepers = asyncHandler(async (req, res) => {
    const { shopId } = req.params;

    // Get shop info
    const adminConn = await connectAdminDB();
    const Shop = adminConn.model('Shop', shopSchema);
    const shop = await Shop.findById(shopId);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shop.dbName);
    const Shopkeeper = shopConn.model('Shopkeeper', shopkeeperSchema);

    const shopkeepers = await Shopkeeper.find().select('-passwordHash').sort({ createdAt: -1 });

    res.json({
        success: true,
        count: shopkeepers.length,
        shopName: shop.name,
        shopkeepers,
    });
});

/**
 * Create new shopkeeper
 * POST /api/admin/shops/:shopId/shopkeepers
 */
const createShopkeeper = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    let { username, password } = req.body;

    // Auto-generate password if not provided
    if (!password) {
        password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    }

    // Get shop info
    const adminConn = await connectAdminDB();
    const Shop = adminConn.model('Shop', shopSchema);
    const shop = await Shop.findById(shopId);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shop.dbName);
    const Shopkeeper = shopConn.model('Shopkeeper', shopkeeperSchema);

    // Check if username already exists
    const existingShopkeeper = await Shopkeeper.findOne({ username });

    if (existingShopkeeper) {
        return res.status(400).json({
            success: false,
            message: 'Username already exists',
        });
    }

    // Create shopkeeper
    const shopkeeper = new Shopkeeper({
        username,
        passwordHash: password, // Will be hashed by pre-save hook
        plainPassword: password, // Store plain password for display
        role: 'shopkeeper',
        createdByAdminId: req.user.id,
    });

    await shopkeeper.save();

    // Return success
    res.status(201).json({
        success: true,
        message: 'Shopkeeper created successfully',
        shopkeeper: {
            id: shopkeeper._id,
            username: shopkeeper.username,
            plainPassword: shopkeeper.plainPassword,
            role: shopkeeper.role,
            createdAt: shopkeeper.createdAt,
        },
        credentials: {
            username: username,
            password: password,
        },
    });
});

/**
 * Delete shopkeeper
 * DELETE /api/admin/shops/:shopId/shopkeepers/:shopkeeperId
 */
const deleteShopkeeper = asyncHandler(async (req, res) => {
    const { shopId, shopkeeperId } = req.params;

    // Get shop info
    const adminConn = await connectAdminDB();
    const Shop = adminConn.model('Shop', shopSchema);
    const shop = await Shop.findById(shopId);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shop.dbName);
    const Shopkeeper = shopConn.model('Shopkeeper', shopkeeperSchema);

    const shopkeeper = await Shopkeeper.findByIdAndDelete(shopkeeperId);

    if (!shopkeeper) {
        return res.status(404).json({
            success: false,
            message: 'Shopkeeper not found',
        });
    }

    res.json({
        success: true,
        message: 'Shopkeeper deleted successfully',
    });
});

/**
 * Update shopkeeper (toggle active status or change password)
 * PUT /api/admin/shops/:shopId/shopkeepers/:shopkeeperId
 */
const updateShopkeeper = asyncHandler(async (req, res) => {
    const { shopId, shopkeeperId } = req.params;
    const { isActive, password } = req.body;

    // Get shop info
    const adminConn = await connectAdminDB();
    const Shop = adminConn.model('Shop', shopSchema);
    const shop = await Shop.findById(shopId);

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shop.dbName);
    const Shopkeeper = shopConn.model('Shopkeeper', shopkeeperSchema);

    const shopkeeper = await Shopkeeper.findById(shopkeeperId);

    if (!shopkeeper) {
        return res.status(404).json({
            success: false,
            message: 'Shopkeeper not found',
        });
    }

    // Update fields
    if (isActive !== undefined) {
        shopkeeper.isActive = isActive;
    }

    if (password) {
        shopkeeper.passwordHash = password; // Will be hashed by pre-save hook
        shopkeeper.plainPassword = password; // Update plainPassword too
    }

    await shopkeeper.save();

    res.json({
        success: true,
        message: 'Shopkeeper updated successfully',
        shopkeeper: {
            id: shopkeeper._id,
            username: shopkeeper.username,
            isActive: shopkeeper.isActive,
        },
    });
});

module.exports = {
    getShopkeepers,
    createShopkeeper,
    deleteShopkeeper,
    updateShopkeeper,
};
