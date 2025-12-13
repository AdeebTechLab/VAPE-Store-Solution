const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/environment');

const shopkeeperSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    plainPassword: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'shopkeeper',
    },
    createdByAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving (updated for Mongoose 7+)
shopkeeperSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }

    const salt = await bcrypt.genSalt(config.bcryptRounds);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to compare passwords
shopkeeperSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = shopkeeperSchema;
