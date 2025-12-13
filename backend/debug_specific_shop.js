const API_URL = 'http://localhost:5000/api';
const TARGET_SHOP_ID = '693050c026085f6b3778cfa4';

async function debugSpecificShop() {
    try {
        // 1. Login as Admin
        console.log('Logging in as admin...');
        let loginRes;
        try {
            loginRes = await fetch(`${API_URL}/auth/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'vapeshop121!' })
            });
        } catch (e) {
            console.error('Connection failed:', e.message);
            return;
        }

        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('Login failed:', loginData);
            return;
        }

        const token = loginData.token;
        console.log('Login successful.');

        // 2. Check if Shop exists
        console.log(`\nChecking Shop ID: ${TARGET_SHOP_ID}...`);
        // We can't get a single shop by ID directly via API (only list), so let's list and find
        const shopsRes = await fetch(`${API_URL}/admin/shops`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const shopsData = await shopsRes.json();

        const shop = shopsData.shops.find(s => s._id === TARGET_SHOP_ID);

        if (!shop) {
            console.error('❌ Shop NOT found in the list!');
            console.log('Available Shops:');
            shopsData.shops.forEach(s => console.log(`- ${s.name} (ID: ${s._id})`));
            return;
        }

        console.log(`✅ Shop Found: ${shop.name} (DB: ${shop.dbName})`);

        // 3. Try to create a valid shopkeeper
        const newUsername = `sk_debug_${Date.now()}`;
        console.log(`\nAttempting to create shopkeeper "${newUsername}"...`);

        const createRes = await fetch(`${API_URL}/admin/shops/${TARGET_SHOP_ID}/shopkeepers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ username: newUsername })
        });

        const createData = await createRes.json();

        if (createRes.ok) {
            console.log('✅ Creation SUCCESS:', createData);
        } else {
            console.error('❌ Creation FAILED. Status:', createRes.status);
            console.error('Error Body:', JSON.stringify(createData, null, 2));
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

debugSpecificShop();
