const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Public routes
router.post('/admin/login', authController.adminLogin);
router.post('/shopkeeper/login', authController.shopkeeperLogin);

// Public endpoint to get shops (for login page shop selection)
router.get('/shops', adminController.getAllShops);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
