/**
 * One-time migration: ensure plainPassword is set for all admins and shopkeepers.
 * passwordHash stays bcrypt-hashed for login; plainPassword is readable in MongoDB.
 *
 * Run: node scripts/migratePlainPasswords.js
 */
require('dotenv').config();
const config = require('../src/config/environment');
const { connectAdminDB, getShopConnection, closeAllConnections } = require('../src/config/database');
const adminSchema = require('../src/models/Admin');
const shopSchema = require('../src/models/Shop');
const shopkeeperSchema = require('../src/models/Shopkeeper');

const migrate = async () => {
    console.log('\n🔐 Migrating plain passwords...\n');

    const adminConn = await connectAdminDB();
    const Admin = adminConn.model('Admin', adminSchema);
    const Shop = adminConn.model('Shop', shopSchema);

    const admins = await Admin.find();
    for (const admin of admins) {
        if (admin.plainPassword) {
            console.log(`✓ Admin "${admin.username}" already has plainPassword: ${admin.plainPassword}`);
            continue;
        }

        const password =
            admin.username === config.adminUsername
                ? config.adminPassword
                : admin.username;

        admin.plainPassword = password;
        admin.passwordHash = password;
        await admin.save();
        console.log(`✓ Admin "${admin.username}" → plainPassword: "${password}"`);
    }

    const shops = await Shop.find();
    for (const shop of shops) {
        const shopConn = await getShopConnection(shop.dbName);
        const Shopkeeper = shopConn.model('Shopkeeper', shopkeeperSchema);
        const shopkeepers = await Shopkeeper.find();

        for (const sk of shopkeepers) {
            if (sk.plainPassword) {
                console.log(`✓ ${shop.name} / "${sk.username}" already has plainPassword`);
                continue;
            }

            // Cannot recover from hash — reset to username (change after migration if needed)
            const newPassword = sk.username;
            sk.plainPassword = newPassword;
            sk.passwordHash = newPassword;
            await sk.save();
            console.log(
                `✓ ${shop.name} / "${sk.username}" → plainPassword set to username "${newPassword}" (login with this)`
            );
        }
    }

    console.log('\n✅ Migration done. In MongoDB Compass, open field: plainPassword\n');
    await closeAllConnections();
    process.exit(0);
};

migrate().catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
