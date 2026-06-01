/**
 * Set plainPassword for one admin (visible in MongoDB Compass).
 *
 * Usage:
 *   node scripts/setPlainPassword.js shani
 *   node scripts/setPlainPassword.js shani MyNewPassword123
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const config = require('../src/config/environment');
const { connectAdminDB, closeAllConnections } = require('../src/config/database');
const adminSchema = require('../src/models/Admin');

const username = process.argv[2];
const password = process.argv[3] || process.argv[2];

if (!username) {
    console.error('\nUsage: node scripts/setPlainPassword.js <username> [password]\n');
    console.error('Example: node scripts/setPlainPassword.js shani shani123\n');
    process.exit(1);
}

const run = async () => {
    const adminConn = await connectAdminDB();
    const Admin = adminConn.model('Admin', adminSchema);

    const admin = await Admin.findOne({ username });
    if (!admin) {
        console.error(`❌ Admin "${username}" not found`);
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    admin.passwordHash = passwordHash;
    admin.plainPassword = password;
    await admin.save();

    console.log(`\n✅ Done for "${username}"`);
    console.log(`   plainPassword in MongoDB: ${password}`);
    console.log(`   Login with username "${username}" and this password.\n`);
    console.log('   Refresh MongoDB Compass (F5) and look for field: plainPassword\n');

    await closeAllConnections();
    process.exit(0);
};

run().catch((err) => {
    console.error('❌', err.message);
    process.exit(1);
});
