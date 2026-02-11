require('dotenv').config();
const { getShopConnection } = require('./src/config/database');
const transactionSchema = require('./src/models/Transaction');
const openedBottleSchema = require('./src/models/OpenedBottle');
const productSchema = require('./src/models/Product');
const fs = require('fs');

(async () => {
    const conn = await getShopConnection('shop_db_2');
    const T = conn.model('Transaction', transactionSchema);
    const OB = conn.model('OpenedBottle', openedBottleSchema);
    const P = conn.model('Product', productSchema);

    // Dump ALL transactions with ALL fields
    const txns = await T.find().sort({ soldAt: -1 }).lean();
    let out = '=== ALL TRANSACTIONS (newest first) ===\n\n';
    for (const t of txns) {
        out += JSON.stringify({
            name: t.productName,
            qty: t.qty,
            pricePerUnit: t.pricePerUnit,
            totalPrice: t.totalPrice,
            costPrice: t.costPrice,
            originalPrice: t.originalPrice,
            cartPrice: t.cartPrice,
            soldAt: t.soldAt,
            soldBy: t.soldBy,
            sessionId: t.sessionId,
            _id: t._id
        }, null, 2) + '\n\n';
    }

    // Dump opened bottles
    out += '\n=== OPENED BOTTLES ===\n\n';
    const bottles = await OB.find().lean();
    for (const b of bottles) {
        out += JSON.stringify({
            name: b.productName,
            pricePerUnit: b.pricePerUnit,
            costPrice: b.costPrice,
            mlCapacity: b.mlCapacity,
            remainingMl: b.remainingMl,
            status: b.status,
            salesHistory: b.salesHistory
        }, null, 2) + '\n\n';
    }

    // Dump products
    out += '\n=== PRODUCTS ===\n\n';
    const products = await P.find().lean();
    for (const p of products) {
        out += JSON.stringify({
            name: p.name,
            pricePerUnit: p.pricePerUnit,
            costPrice: p.costPrice,
            units: p.units,
            mlCapacity: p.mlCapacity
        }, null, 2) + '\n\n';
    }

    fs.writeFileSync('debug_full_dump.txt', out);
    console.log('Written to debug_full_dump.txt');
    setTimeout(() => process.exit(0), 2000);
})();
