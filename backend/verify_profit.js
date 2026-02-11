require('dotenv').config();
const http = require('http');

function post(path, data) {
    return new Promise((resolve, reject) => {
        const d = JSON.stringify(data);
        const req = http.request({ hostname: 'localhost', port: 5000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(d) } }, res => {
            let b = ''; res.on('data', c => b += c); res.on('end', () => resolve(JSON.parse(b)));
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
        const login = await post('/api/auth/admin/login', { username: 'shani', password: 'shani933' });
        console.log('Login:', login.success);
        const token = login.token;

        const shops = await get('/api/admin/shops', token);
        shops.shops?.forEach(s => {
            console.log(`${s.name}: Investment=${s.stats?.totalHistoricalInvestment} Sales=${s.stats?.allTimeSales} Profit=${s.stats?.totalProfit}`);
        });

        // Now simulate a sell-ml to test (using shopkeeper login)
        const shop2 = shops.shops?.find(s => s.name.includes('2'));
        if (shop2) {
            console.log('\n--- Testing sell-ml on Shop 2 ---');
            // Get shopkeepers for shop 2
            const shopkeepers = await get(`/api/admin/shops/${shop2._id}/shopkeepers`, token);
            console.log('Shopkeepers:', shopkeepers.shopkeepers?.map(s => s.username));
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
    setTimeout(() => process.exit(0), 1000);
})();
