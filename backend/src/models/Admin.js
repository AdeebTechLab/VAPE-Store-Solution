const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/environment');

const adminSchema = new mongoose.Schema({
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
    role: {
        type: String,
        default: 'admin',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving (updated for Mongoose 7+)
adminSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) {
        return;
    }

    const salt = await bcrypt.genSalt(config.bcryptRounds);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Note: Model will be created on admin database connection
module.exports = adminSchema;
