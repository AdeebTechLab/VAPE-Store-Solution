const { connectAdminDB, getShopConnection } = require('../config/database');
const shopSchema = require('../models/Shop');
const productSchema = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const { generateQRCode } = require('../services/qrService');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * Get all products for a shop
 * GET /api/admin/shops/:shopId/products
 */
const getProducts = asyncHandler(async (req, res) => {
    const { shopId, shopDbName } = req.params;
    const { q, category } = req.query;

    // Get shop info
    const adminConn = await connectAdminDB();
    const Shop = adminConn.model('Shop', shopSchema);

    let shop;
    if (shopId) {
        shop = await Shop.findById(shopId);
    } else if (shopDbName) {
        shop = await Shop.findOne({ dbName: shopDbName });
    }

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shop.dbName);
    const Product = shopConn.model('Product', productSchema);

    // Build query
    const query = {};

    if (category && category !== 'All') {
        query.category = category;
    }

    if (q) {
        query.$or = [
            { name: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
        ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json({
        success: true,
        count: products.length,
        shopName: shop.name,
        products,
    });
});

/**
 * Get single product
 * GET /api/admin/shops/:shopId/products/:productId
 */
const getProduct = asyncHandler(async (req, res) => {
    const { shopId, productId, shopDbName } = req.params;

    // Get shop info
    const adminConn = await connectAdminDB();
    const Shop = adminConn.model('Shop', shopSchema);

    let shop;
    if (shopId) {
        shop = await Shop.findById(shopId);
    } else if (shopDbName) {
        shop = await Shop.findOne({ dbName: shopDbName });
    }

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shop.dbName);
    const Product = shopConn.model('Product', productSchema);

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    res.json({
        success: true,
        product,
    });
});

/**
 * Create new product or update existing if name matches
 * POST /api/admin/shops/:shopId/products
 */
const createProduct = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { name, brand, category, units, pricePerUnit, costPrice, shortDescription, barcode, mlCapacity, flavour } = req.body;

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
    const Product = shopConn.model('Product', productSchema);

    // Build match query - for E-Liquid include flavour
    const matchQuery = {
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        brand: { $regex: new RegExp(`^${(brand || '').trim()}$`, 'i') },
        category: category,
        pricePerUnit: parseFloat(pricePerUnit),
    };

    // For E-Liquid, also match by flavour
    if (category === 'E-Liquid' && flavour) {
        matchQuery.flavour = { $regex: new RegExp(`^${flavour.trim()}$`, 'i') };
    }

    const existingProduct = await Product.findOne(matchQuery);

    if (existingProduct) {
        // Add units to existing product
        const addedUnits = parseInt(units) || 0;
        existingProduct.units += addedUnits;

        // Update description if provided
        if (shortDescription) existingProduct.shortDescription = shortDescription;

        // Add barcode to barcodes array if provided and not already present
        if (barcode && barcode.trim()) {
            if (!existingProduct.barcodes) {
                existingProduct.barcodes = [];
            }
            // Add legacy barcode to array if exists
            if (existingProduct.barcode && !existingProduct.barcodes.includes(existingProduct.barcode)) {
                existingProduct.barcodes.push(existingProduct.barcode);
            }
            // Add new barcode if not already in array
            if (!existingProduct.barcodes.includes(barcode.trim())) {
                existingProduct.barcodes.push(barcode.trim());
            }
            existingProduct.barcode = barcode.trim(); // Also update legacy field
        }

        // Update image if new one is uploaded
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            existingProduct.imageUrl = result.secure_url;
        }

        await existingProduct.save();

        return res.status(200).json({
            success: true,
            message: `Product already exists! Added ${addedUnits} units. New total: ${existingProduct.units} units.`,
            product: existingProduct,
            merged: true,
        });
    }

    // Handle image upload for new product
    let imageUrl = '';
    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
    }

    // Initialize barcodes array
    const barcodes = barcode && barcode.trim() ? [barcode.trim()] : [];

    // Create new product
    const product = new Product({
        name: name.trim(),
        brand: brand || '',
        category,
        flavour: category === 'E-Liquid' ? (flavour || '') : '',
        units: parseInt(units) || 0,
        pricePerUnit: parseFloat(pricePerUnit),
        costPrice: parseFloat(costPrice) || 0,
        shortDescription: shortDescription || '',
        imageUrl,
        barcode: barcode || '',
        barcodes: barcodes,
        mlCapacity: category === 'E-Liquid' ? (parseInt(mlCapacity) || 0) : 0,
    });

    await product.save();

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product,
        merged: false,
    });
});

/**
 * Update product
 * PUT /api/admin/shops/:shopId/products/:productId
 */
const updateProduct = asyncHandler(async (req, res) => {
    const { shopId, productId } = req.params;
    const { name, brand, category, units, pricePerUnit, costPrice, shortDescription, barcode } = req.body;

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
    const Product = shopConn.model('Product', productSchema);

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    // Update fields
    if (name) product.name = name;
    if (brand !== undefined) product.brand = brand;
    if (category) product.category = category;
    if (units !== undefined) product.units = parseInt(units);
    if (pricePerUnit !== undefined) product.pricePerUnit = parseFloat(pricePerUnit);
    if (costPrice !== undefined) product.costPrice = parseFloat(costPrice);
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (barcode !== undefined) product.barcode = barcode;

    // Handle image upload
    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        product.imageUrl = result.secure_url;
    }

    await product.save();

    res.json({
        success: true,
        message: 'Product updated successfully',
        product,
    });
});

/**
 * Delete product
 * DELETE /api/admin/shops/:shopId/products/:productId
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const { shopId, productId } = req.params;

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
    const Product = shopConn.model('Product', productSchema);

    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    await Product.deleteOne({ _id: productId });

    res.json({
        success: true,
        message: 'Product deleted successfully',
    });
});

/**
 * Search product by Barcode (searches both legacy barcode and barcodes array)
 * POST /api/admin/shops/:shopId/scan
 */
const searchByBarcode = asyncHandler(async (req, res) => {
    const { shopId, shopDbName } = req.params;
    const { barcode } = req.body;

    if (!barcode) {
        return res.status(400).json({
            success: false,
            message: 'Barcode is required',
        });
    }

    // Get shop info
    const adminConn = await connectAdminDB();
    const Shop = adminConn.model('Shop', shopSchema);

    let shop;
    if (shopId) {
        shop = await Shop.findById(shopId);
    } else if (shopDbName) {
        shop = await Shop.findOne({ dbName: shopDbName });
    }

    if (!shop) {
        return res.status(404).json({
            success: false,
            message: 'Shop not found',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shop.dbName);
    const Product = shopConn.model('Product', productSchema);

    // Search in both legacy barcode field and barcodes array
    const product = await Product.findOne({
        $or: [
            { barcode: barcode },
            { barcodes: barcode }
        ]
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found with this Barcode',
        });
    }

    res.json({
        success: true,
        product,
    });
});

/**
 * Update product price (Shopkeeper endpoint)
 * PATCH /api/shop/:shopDbName/products/:productId/price
 */
const updateProductPrice = asyncHandler(async (req, res) => {
    const { shopDbName, productId } = req.params;
    const { pricePerUnit } = req.body;

    if (pricePerUnit === undefined || pricePerUnit < 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid price is required',
        });
    }

    // Connect to shop database
    const shopConn = await getShopConnection(shopDbName);
    const Product = shopConn.model('Product', productSchema);

    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found',
        });
    }

    // Update price
    const oldPrice = product.pricePerUnit;
    product.pricePerUnit = pricePerUnit;
    await product.save();

    res.json({
        success: true,
        message: `Price updated from Rs ${oldPrice} to Rs ${pricePerUnit}`,
        product,
    });
});

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchByBarcode,
    updateProductPrice,
};
