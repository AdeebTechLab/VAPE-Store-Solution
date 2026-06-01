const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { connectAdminDB, getShopConnection } = require('../config/database');
const config = require('../config/environment');
const adminSchema = require('../models/Admin');
const shopkeeperSchema = require('../models/Shopkeeper');
const shopSchema = require('../models/Shop');
const sessionService = require('../services/sessionService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Admin login
 * POST /api/auth/admin/login
 */
const findAdminByUsername = async (Admin, username) => {
    const trimmed = username.trim();
    const exact = await Admin.findOne({ username: trimmed });
    if (exact) return exact;

    return Admin.findOne({
        username: { $regex: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    });
};

const adminLogin = asyncHandler(async (req, res) => {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required',
        });
    }

    // Get admin database connection
    const adminConn = await connectAdminDB();
    const Admin = adminConn.model('Admin', adminSchema);

    // Find admin user (case-insensitive fallback)
    const admin = await findAdminByUsername(Admin, username);

    if (!admin) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            id: admin._id,
            username: admin.username,
            role: admin.role,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiration }
    );

    res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: admin._id,
            username: admin.username,
            role: admin.role,
        },
    });
});

/**
 * Shopkeeper login
 * POST /api/auth/shopkeeper/login
 */
const shopkeeperLogin = asyncHandler(async (req, res) => {
    const { shopId, username, password } = req.body;

    if (!shopId || !username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Shop ID, username, and password are required',
        });
    }

    // Get shop information from admin database
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

    // Find shopkeeper
    const shopkeeper = await Shopkeeper.findOne({ username, isActive: true });

    if (!shopkeeper) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    // Verify password
    const isPasswordValid = await shopkeeper.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    // Create session
    const session = sessionService.createSession(
        shopkeeper._id.toString(),
        shopkeeper.username
    );

    // Generate JWT token
    const token = jwt.sign(
        {
            id: shopkeeper._id,
            username: shopkeeper.username,
            role: shopkeeper.role,
            shopId: shop._id.toString(),
            shopDbName: shop.dbName,
            sessionId: session.sessionId,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiration }
    );

    res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: shopkeeper._id,
            username: shopkeeper.username,
            role: shopkeeper.role,
            shopId: shop._id,
            shopName: shop.name,
            shopDbName: shop.dbName,
        },
        session: {
            sessionId: session.sessionId,
            startTime: session.startTime,
        },
    });
});

/**
 * Get current user info
 * GET /api/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});

/**
 * Dev only: reset admin password (hashes correctly in MongoDB)
 * POST /api/auth/dev/reset-admin-password
 */
const devResetAdminPassword = asyncHandler(async (req, res) => {
    if (config.nodeEnv === 'production') {
        return res.status(404).json({ success: false, message: 'Not found' });
    }

    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'username and password are required',
        });
    }

    const adminConn = await connectAdminDB();
    const Admin = adminConn.model('Admin', adminSchema);
    const admin = await findAdminByUsername(Admin, username);

    if (!admin) {
        return res.status(404).json({
            success: false,
            message: `Admin "${username}" not found`,
        });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    admin.passwordHash = passwordHash;
    admin.plainPassword = password;
    await admin.save();

    const valid = await bcrypt.compare(password, admin.passwordHash);

    res.json({
        success: true,
        message: `Password updated for "${admin.username}". You can login now.`,
        verified: valid,
    });
});

module.exports = {
    adminLogin,
    shopkeeperLogin,
    getCurrentUser,
    devResetAdminPassword,
};
