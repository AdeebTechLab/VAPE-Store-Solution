const API_URL = 'http://localhost:5000/api';
const TARGET_SHOP_ID = '693050c026085f6b3778cfa4'; // Shop 2
const SHOP_DB_NAME = 'shop_db_2';

async function debugQRFlow() {
    try {
        // 1. Login as Admin
        console.log('Logging in as admin...');
        const loginRes = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'vapeshop121!' })
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
            console.error('Admin Login Failed:', loginData);
            return;
        }
        const adminToken = loginData.token;
        console.log('Admin Login successful.');

        // 2. Create Shopkeeper for Shop 2
        const skUsername = `sk_qr_${Date.now()}`;
        console.log(`\nCreating shopkeeper "${skUsername}"...`);
        let skPassword;

        const skCreateRes = await fetch(`${API_URL}/admin/shops/${TARGET_SHOP_ID}/shopkeepers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({ username: skUsername })
        });
        const skCreateData = await skCreateRes.json();

        if (skCreateRes.ok) {
            skPassword = skCreateData.credentials.password;
            console.log(`Shopkeeper created. Pass: ${skPassword}`);
        } else {
            console.error('Shopkeeper Creation Failed:', skCreateData);
            return;
        }

        // 3. Login as Shopkeeper
        console.log('\nLogging in as Shopkeeper...');
        const skLoginRes = await fetch(`${API_URL}/auth/shopkeeper/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: skUsername, password: skPassword })
        });
        const skLoginData = await skLoginRes.json();
        if (!skLoginData.success) {
            console.error('Shopkeeper Login Failed:', skLoginData);
            return;
        }
        const skToken = skLoginData.token;
        console.log('Shopkeeper Login successful.');

        // 4. Create Product with QR Code (as Admin)
        const qrCode = `QR_${Date.now()}`;
        console.log(`\nCreating product with QR Code: ${qrCode}...`);

        const createRes = await fetch(`${API_URL}/admin/shops/${TARGET_SHOP_ID}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'Test QR Product',
                category: 'Device',
                units: 10,
                pricePerUnit: 50,
                qrCodeData: qrCode
            })
        });

        const createData = await createRes.json();
        if (!createRes.ok) {
            console.error('Creation Failed:', createData);
            return;
        }
        console.log('Product Created:', createData.product.name);

        // 5. Search by QR Code (as Shopkeeper)
        console.log(`\nSearching for product with QR: ${qrCode} in ${SHOP_DB_NAME}...`);
        const searchRes = await fetch(`${API_URL}/shop/${SHOP_DB_NAME}/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${skToken}`
            },
            body: JSON.stringify({ qrCode: qrCode })
        });

        const searchData = await searchRes.json();

        if (searchRes.ok && searchData.success) {
            console.log('✅ Search SUCCESS!');
            console.log('Found Product:', searchData.product.name);
            console.log('QR Match:', searchData.product.qrCodeData === qrCode);
        } else {
            console.error('❌ Search FAILED:', searchData);
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    }
}

debugQRFlow();
