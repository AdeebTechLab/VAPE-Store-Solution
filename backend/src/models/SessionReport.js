const mongoose = require('mongoose');

const sessionReportSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    shopkeeperId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shopkeeper',
        required: true,
    },
    shopkeeperUsername: {
        type: String,
        required: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    soldItems: [{
        productId: mongoose.Schema.Types.ObjectId,
        productName: String,
        qty: Number,
        pricePerUnit: Number,
        totalPrice: Number,
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    totalItemsSold: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for queries
sessionReportSchema.index({ shopkeeperId: 1, createdAt: -1 });
sessionReportSchema.index({ startTime: -1 });

module.exports = sessionReportSchema;
