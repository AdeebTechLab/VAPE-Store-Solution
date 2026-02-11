require('dotenv').config();
const http = require('http');
const { getShopConnection } = require('./src/config/database');
const transactionSchema = require('./src/models/Transaction');

function post(path, data, token) {
    return new Promise((resolve, reject) => {
        const d = JSON.stringify(data);
        const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const req = http.request({ hostname: 'localhost', port: 5000, path, method: 'POST', headers }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { resolve({ raw: b }); } });
        });
        req.on('error', reject); req.write(d); req.end();
    });
}

function get(path, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({ hostname: 'localhost', port: 5000, path, method: 'GET', headers: { 'Authorization': 'Bearer ' + token } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(JSON.parse(b)));
        });
        req.on('error', reject); req.end();
    });
}

(async () => {
    try {
        // 1. Login as admin to get shop info
        const adminLogin = await post('/api/auth/admin/login', { username: 'shani', password: 'shani933' });
        const adminToken = adminLogin.token;

        const shops = await get('/api/admin/shops', adminToken);
        const shop2 = shops.shops?.find(s => s.name.includes('2'));
        console.log('Shop 2 BEFORE:', `Sales=${shop2.stats.allTimeSales} Profit=${shop2.stats.totalProfit}`);

        // 2. Login as shopkeeper
        const shopkeepers = await get(`/api/admin/shops/${shop2._id}/shopkeepers`, adminToken);
        const sk = shopkeepers.shopkeepers?.[0];
        if (!sk) { console.log('No shopkeepers found'); process.exit(1); }

        const skLogin = await post('/api/auth/shopkeeper/login', { username: sk.username, password: 'test123', shopId: shop2._id });
        if (!skLogin.success) {
            console.log('Shopkeeper login failed:', JSON.stringify(skLogin));
            // Try without password since we don't know it
            console.log('Skipping sell-ml test (cannot login as shopkeeper)');
            console.log('\nChecking transaction data instead...');
        }

        // 3. Check transaction data directly
        const conn = await getShopConnection(shop2.dbName);
        const T = conn.model('Transaction', transactionSchema);
        const allTxns = await T.find().sort({ soldAt: -1 }).lean();

        console.log('\n=== ALL TRANSACTIONS ===');
        let totalProfit = 0;
        for (const t of allTxns) {
            const cost = t.costPrice || 0;
            const profit = (t.pricePerUnit - cost) * t.qty;
            totalProfit += profit;
            console.log(`  ${t.productName} | price=${t.pricePerUnit} | cost=${cost} | profit=${profit}`);
        }
        console.log(`\nCalculated total profit: ${totalProfit}`);
        console.log(`API reported profit: ${shop2.stats.totalProfit}`);
        console.log(`Match: ${totalProfit === shop2.stats.totalProfit ? 'YES ✓' : 'NO ✗'}`);

    } catch (err) {
        console.error('Error:', err.message);
    }
    setTimeout(() => process.exit(0), 2000);
})();
