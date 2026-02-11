const mongoose = require('mongoose');
const fs = require('fs');
const { connectAdminDB, getShopConnection } = require('./src/config/database');
const shopSchema = require('./src/models/Shop');
const productSchema = require('./src/models/Product');
const transactionSchema = require('./src/models/Transaction');
require('dotenv').config();

async function listRecentData() {
    try {
        await connectAdminDB();

        // We need to confirm the DB name for Shop 2. 
        // Let's list shops first to be sure.
        const adminConn = await connectAdminDB();
        const Shop = adminConn.model('Shop', shopSchema);
        const shop = await Shop.findOne({ name: 'Shop 2' }); // Try to find by name "Shop 2" or just list all

        let shopDbName = 'shop_db_2';
        if (shop) {
            shopDbName = shop.dbName;
            console.log(`Found Shop 2 with DB: ${shopDbName}`);
        } else {
            console.log('Could not find "Shop 2" by name, trying shop_db_2 directly...');
        }

        const shopConn = await getShopConnection(shopDbName);
        const Product = shopConn.model('Product', productSchema);
        const Transaction = shopConn.model('Transaction', transactionSchema);

        const products = await Product.find().sort({ createdAt: -1 }).limit(20);
        const transactions = await Transaction.find().sort({ soldAt: -1 }).limit(20);

        let output = `--- Data for ${shopDbName} ---\n\n`;

        output += '--- Recent Products ---\n';
        products.forEach(p => {
            output += `- ID: ${p._id}, Name: ${p.name}, Units: ${p.units}, Price: ${p.pricePerUnit}\n`;
        });

        output += '\n--- Recent Transactions ---\n';
        transactions.forEach(t => {
            output += `- ID: ${t._id}, Product: ${t.productName}, Qty: ${t.qty}, Total: ${t.totalPrice}, Date: ${t.soldAt}\n`;
        });

        fs.writeFileSync('shop2_data.txt', output);
        console.log('Data written to shop2_data.txt');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

listRecentData();
