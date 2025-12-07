const mongoose = require('mongoose');

const openedBottleSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    productBrand: {
        type: String,
        default: '',
    },
    mlCapacity: {
        type: Number,
        required: true,
    },
    remainingMl: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        default: '',
    },
    openedAt: {
        type: Date,
        default: Date.now,
    },
    openedBy: {
        type: String,
        default: 'Unknown',
    },
    status: {
        type: String,
        enum: ['open', 'empty'],
        default: 'open',
    },
    // Track ML sales history
    salesHistory: [{
        mlSold: Number,
        soldAt: { type: Date, default: Date.now },
        soldBy: String,
    }],
});

// Index for quick lookups
openedBottleSchema.index({ productId: 1, status: 1 });

module.exports = openedBottleSchema;
