const API_URL = 'http://localhost:5000/api';

async function debugShop2API() {
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
        console.log('Login successful. Token obtained.');

        // 2. Get Shops to find Shop 2
        console.log('\nFetching shops...');
        const shopsRes = await fetch(`${API_URL}/admin/shops`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const shopsData = await shopsRes.json();

        const shop2 = shopsData.shops.find(s => s.name.includes('Shop 2'));
        if (!shop2) {
            console.error('Shop 2 not found via API!');
            return;
        }
        console.log(`Found Shop 2: ${shop2.name} (ID: ${shop2._id})`);

        // 3. Try to create a valid shopkeeper
        const newUsername = `sk_test_${Date.now()}`;
        console.log(`\nCreating shopkeeper "${newUsername}" in Shop 2...`);
        try {
            const createRes = await fetch(`${API_URL}/admin/shops/${shop2._id}/shopkeepers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ username: newUsername }) // No password provided
            });

            const createData = await createRes.json();

            if (createRes.ok) {
                console.log('Creation SUCCESS:', createData);
            } else {
                console.error('Creation FAILED. Status:', createRes.status);
                console.error('Error Body:', JSON.stringify(createData, null, 2));
            }
        } catch (err) {
            console.error('Fetch Error:', err.message);
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

debugShop2API();
