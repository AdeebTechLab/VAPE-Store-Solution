require('dotenv').config();
const config = require('./src/config/environment');
const { getShopConnection } = require('./src/config/database');
const transactionSchema = require('./src/models/Transaction');
const productSchema = require('./src/models/Product');

(async () => {
    const conn = await getShopConnection('shop_db_2');
    const Transaction = conn.model('Transaction', transactionSchema);
    const Product = conn.model('Product', productSchema);

    console.log('\n=== ALL TRANSACTIONS IN SHOP 2 ===\n');
    const txns = await Transaction.find().sort({ soldAt: -1 }).lean();

    let totalProfitCalc = 0;
    for (const t of txns) {
        const cost = t.costPrice || 0;
        const profit = (t.pricePerUnit - cost) * t.qty;
        totalProfitCalc += profit;
        console.log(`  ${t.productName}`);
        console.log(`    qty=${t.qty} | pricePerUnit=${t.pricePerUnit} | totalPrice=${t.totalPrice} | costPrice=${cost} | profit=${profit}`);
    }

    console.log(`\nTotal transactions: ${txns.length}`);
    console.log(`Manual profit calc (pricePerUnit-costPrice)*qty: ${totalProfitCalc}`);

    console.log('\n=== PRODUCTS IN SHOP 2 ===\n');
    const products = await Product.find().lean();
    for (const p of products) {
        console.log(`  ${p.name} | pricePerUnit=${p.pricePerUnit} | costPrice=${p.costPrice} | units=${p.units} | mlCapacity=${p.mlCapacity}`);
    }

    console.log('\n=== PROFIT AGGREGATION (same as adminController) ===\n');
    const profitFromSales = await Transaction.aggregate([
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $addFields: {
                effectiveCostPrice: {
                    $cond: {
                        if: { $gt: ['$costPrice', 0] },
                        then: '$costPrice',
                        else: { $ifNull: [{ $arrayElemAt: ['$product.costPrice', 0] }, 0] }
                    }
                }
            }
        },
        {
            $project: {
                productName: 1,
                qty: 1,
                pricePerUnit: 1,
                costPrice: 1,
                effectiveCostPrice: 1,
                productCostPrice: { $arrayElemAt: ['$product.costPrice', 0] },
                profit: {
                    $multiply: [
                        { $subtract: ['$pricePerUnit', '$effectiveCostPrice'] },
                        '$qty'
                    ]
                }
            }
        }
    ]);

    for (const r of profitFromSales) {
        console.log(`  ${r.productName}`);
        console.log(`    qty=${r.qty} | pricePerUnit=${r.pricePerUnit} | txCostPrice=${r.costPrice} | effectiveCost=${r.effectiveCostPrice} | productCost=${r.productCostPrice} | profit=${r.profit}`);
    }

    const totalProfit = profitFromSales.reduce((sum, r) => sum + r.profit, 0);
    console.log(`\nAggregation total profit: ${totalProfit}`);

    setTimeout(() => process.exit(0), 2000);
})();
