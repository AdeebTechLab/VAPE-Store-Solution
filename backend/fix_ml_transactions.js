/**
 * One-time migration script to fix historical ML transactions
 * 
 * This script:
 * 1. Finds ML transactions (containing "ml)" in name) with costPrice = 0
 * 2. Looks up parent product to get correct pricing
 * 3. Recalculates costPrice (and pricePerUnit/totalPrice if they are 0)
 * 4. Backfills existing OpenedBottle records with pricePerUnit and costPrice
 * 
 * SAFE: Only updates missing/zero values. Does NOT delete any data.
 * 
 * Usage: node fix_ml_transactions.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const config = require('./src/config/environment');
const { connectAdminDB, getShopConnection } = require('./src/config/database');
const shopSchema = require('./src/models/Shop');
const productSchema = require('./src/models/Product');
const transactionSchema = require('./src/models/Transaction');
const openedBottleSchema = require('./src/models/OpenedBottle');

async function fixMlTransactions() {
    console.log('=== ML Transaction & Opened Bottle Data Repair ===\n');

    try {
        // Get all shops
        const adminConn = await connectAdminDB();
        const Shop = adminConn.model('Shop', shopSchema);
        const shops = await Shop.find({ isActive: true });

        console.log(`Found ${shops.length} active shop(s)\n`);

        let totalFixed = 0;
        let totalBottlesFixed = 0;

        for (const shop of shops) {
            console.log(`\n--- Processing: ${shop.name} (${shop.dbName}) ---`);

            const shopConn = await getShopConnection(shop.dbName);
            const Product = shopConn.model('Product', productSchema);
            const Transaction = shopConn.model('Transaction', transactionSchema);
            const OpenedBottle = shopConn.model('OpenedBottle', openedBottleSchema);

            // ==========================================
            // PART 1: Fix ML transactions
            // ==========================================

            // Find ML transactions: productName contains "ml)" pattern
            const mlTransactions = await Transaction.find({
                productName: { $regex: /\(\d+ml\)/ },
                $or: [
                    { costPrice: { $exists: false } },
                    { costPrice: 0 },
                    { costPrice: null },
                    { pricePerUnit: 0 },
                    { totalPrice: 0 },
                ]
            });

            console.log(`  Found ${mlTransactions.length} ML transactions needing repair`);

            for (const tx of mlTransactions) {
                // Extract ML amount from product name, e.g. "Pineapple Mango 35mg (5ml)"
                const mlMatch = tx.productName.match(/\((\d+)ml\)/);
                if (!mlMatch) {
                    console.log(`    ⚠ Could not parse ML from: ${tx.productName}`);
                    continue;
                }
                const mlSold = parseInt(mlMatch[1]);

                // Look up the parent product
                const product = await Product.findById(tx.productId);
                if (!product) {
                    console.log(`    ⚠ Product not found for tx ${tx._id} (${tx.productName})`);
                    continue;
                }

                if (!product.mlCapacity || product.mlCapacity <= 0) {
                    console.log(`    ⚠ Product ${product.name} has no mlCapacity`);
                    continue;
                }

                const updateFields = {};

                // Fix costPrice
                const correctCost = Math.round((product.costPrice || 0) / product.mlCapacity * mlSold);
                if (!tx.costPrice || tx.costPrice === 0) {
                    updateFields.costPrice = correctCost;
                }

                // Fix pricePerUnit and totalPrice if they are 0
                const correctPrice = Math.round(product.pricePerUnit / product.mlCapacity * mlSold);
                if (!tx.pricePerUnit || tx.pricePerUnit === 0) {
                    updateFields.pricePerUnit = correctPrice;
                }
                if (!tx.totalPrice || tx.totalPrice === 0) {
                    updateFields.totalPrice = correctPrice;
                }

                if (Object.keys(updateFields).length > 0) {
                    await Transaction.updateOne({ _id: tx._id }, { $set: updateFields });
                    totalFixed++;
                    console.log(`    ✓ Fixed: ${tx.productName} | ${mlSold}ml | cost=${updateFields.costPrice || tx.costPrice} | price=${updateFields.pricePerUnit || tx.pricePerUnit}`);
                }
            }

            // ==========================================
            // PART 2: Backfill OpenedBottle records
            // ==========================================

            const bottles = await OpenedBottle.find({
                $or: [
                    { pricePerUnit: { $exists: false } },
                    { pricePerUnit: 0 },
                    { pricePerUnit: null },
                    { costPrice: { $exists: false } },
                    { costPrice: 0 },
                    { costPrice: null },
                ]
            });

            console.log(`  Found ${bottles.length} opened bottles needing price backfill`);

            for (const bottle of bottles) {
                const product = await Product.findById(bottle.productId);
                if (!product) {
                    console.log(`    ⚠ Product not found for bottle ${bottle._id} (${bottle.productName})`);
                    continue;
                }

                const updateFields = {};
                if (!bottle.pricePerUnit || bottle.pricePerUnit === 0) {
                    updateFields.pricePerUnit = product.pricePerUnit || 0;
                }
                if (!bottle.costPrice || bottle.costPrice === 0) {
                    updateFields.costPrice = product.costPrice || 0;
                }

                if (Object.keys(updateFields).length > 0) {
                    await OpenedBottle.updateOne({ _id: bottle._id }, { $set: updateFields });
                    totalBottlesFixed++;
                    console.log(`    ✓ Backfilled bottle: ${bottle.productName} | sellPrice=${updateFields.pricePerUnit || bottle.pricePerUnit} | costPrice=${updateFields.costPrice || bottle.costPrice}`);
                }
            }
        }

        console.log(`\n=== DONE ===`);
        console.log(`  Transactions fixed: ${totalFixed}`);
        console.log(`  Bottles backfilled: ${totalBottlesFixed}`);
        console.log(`\n  No data was deleted. Only missing costPrice/pricePerUnit values were added.`);

    } catch (error) {
        console.error('Migration error:', error);
    } finally {
        // Wait a bit then exit
        setTimeout(() => process.exit(0), 2000);
    }
}

fixMlTransactions();
