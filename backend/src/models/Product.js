const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
    },
    brand: {
        type: String,
        default: '',
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Device', 'Coil', 'E-Liquid'],
    },
    // E-Liquid specific fields
    flavour: {
        type: String,
        default: '',
        trim: true, // Required for E-Liquid products
    },
    units: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Units cannot be negative'],
    },
    pricePerUnit: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    costPrice: {
        type: Number,
        default: 0,
        min: [0, 'Cost price cannot be negative'],
    },
    shortDescription: {
        type: String,
        default: '',
    },
    imageUrl: {
        type: String,
        default: '',
    },
    // Multiple barcodes support - each unit can have different barcode
    barcodes: {
        type: [String],
        default: [],
    },
    // Legacy single barcode field (for backwards compatibility)
    barcode: {
        type: String,
        default: '',
        sparse: true,
    },
    mlCapacity: {
        type: Number,
        default: 0, // ML capacity for E-Liquid products (e.g., 100ml, 500ml, 1000ml)
    },
    hasOpenedBottle: {
        type: Boolean,
        default: false, // Whether this product has an opened bottle
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update updatedAt on save
productSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Index for search
productSchema.index({ name: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ qrCodeData: 1 });

module.exports = productSchema;
