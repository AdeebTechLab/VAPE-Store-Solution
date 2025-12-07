const mongoose = require('mongoose');
const { connectAdminDB, getShopConnection } = require('./src/config/database');
const shopSchema = require('./src/models/Shop');
const shopkeeperSchema = require('./src/models/Shopkeeper');

async function debugShop2() {
    try {
        console.log('Connecting to Admin DB...');
        const adminConn = await connectAdminDB();
        const Shop = adminConn.model('Shop', shopSchema);

        console.log('Listing all shops:');
        const shops = await Shop.find();
        shops.forEach(s => console.log(`- ${s.name} (ID: ${s._id}, DB: ${s.dbName})`));

        // Find Shop 2
        const shop2 = shops.find(s => s.name.includes('Shop 2') || s.dbName === 'shop_db_2');
        if (!shop2) {
            console.error('Shop 2 not found!');
            return;
        }

        console.log(`\nChecking Shop 2 (DB: ${shop2.dbName})...`);
        const shopConn = await getShopConnection(shop2.dbName);
        const Shopkeeper = shopConn.model('Shopkeeper', shopkeeperSchema);

        const shopkeepers = await Shopkeeper.find();
        console.log(`Found ${shopkeepers.length} shopkeepers:`);
        shopkeepers.forEach(s => console.log(`- ${s.username} (ID: ${s._id})`));

        // Try to validate a new shopkeeper manually
        console.log('\nTesting validation for new shopkeeper "test_user"...');
        const username = 'test_user';
        const existing = await Shopkeeper.findOne({ username });
        if (existing) {
            console.log('Username already exists!');
        } else {
            console.log('Username is available.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

debugShop2();
