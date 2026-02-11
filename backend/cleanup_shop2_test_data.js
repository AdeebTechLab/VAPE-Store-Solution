const mongoose = require('mongoose');
const fs = require('fs');
const { connectAdminDB, getShopConnection } = require('./src/config/database');
const shopSchema = require('./src/models/Shop');
const productSchema = require('./src/models/Product');
const transactionSchema = require('./src/models/Transaction');
require('dotenv').config();

function log(message) {
    fs.appendFileSync('cleanup_log.txt', message + '\n');
    console.log(message);
}

// Clear log file
fs.writeFileSync('cleanup_log.txt', '--- Cleanup Log (Revert Test) ---\n');

async function listRecentData() {
    try {
        log('Starting revert test...');
        await connectAdminDB();

        let shopDbName = 'shop_db_2';
        log(`Targeting Database: ${shopDbName}`);

        const shopConn = await getShopConnection(shopDbName);
        const Product = shopConn.model('Product', productSchema);
        const Transaction = shopConn.model('Transaction', transactionSchema);

        log('Querying products...');
        const products = await Product.find().sort({ createdAt: -1 }).limit(10);

        log(`Found ${products.length} products.`);
        products.forEach(p => {
            log(`- [${p._id}] ${p.name}`);
        });

    } catch (error) {
        log(`Error: ${error.message}`);
    } finally {
        process.exit(0);
    }
}

listRecentData();
