const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    dbName: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        type: String,
        default: '',
    },
    logoUrl: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
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
shopSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = shopSchema;
