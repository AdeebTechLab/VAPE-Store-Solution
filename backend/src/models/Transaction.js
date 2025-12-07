const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: {
        type: String,
        required: true,
    },
    qty: {
        type: Number,
        required: true,
        min: 1,
    },
    pricePerUnit: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    soldByShopkeeperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shopkeeper',
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
        index: true,
    },
    soldAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
transactionSchema.index({ soldAt: -1 });
transactionSchema.index({ sessionId: 1 });

module.exports = transactionSchema;
