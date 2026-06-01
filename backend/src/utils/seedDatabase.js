const { connectAdminDB, getShopConnection } = require('../config/database');
const config = require('../config/environment');
const adminSchema = require('../models/Admin');
const shopSchema = require('../models/Shop');
const productSchema = require('../models/Product');
const shopkeeperSchema = require('../models/Shopkeeper');

const seedDatabase = async () => {
    // Check if seeding is disabled
    if (process.env.DISABLE_SEEDING === 'true') {
        console.log('⏭️  Database seeding is disabled (set DISABLE_SEEDING=false to enable)');
        return;
    }

    try {
        console.log('\n🌱 Starting database seeding...\n');

        // Connect to admin database
        const adminConn = await connectAdminDB();
        const Admin = adminConn.model('Admin', adminSchema);
        const Shop = adminConn.model('Shop', shopSchema);

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: config.adminUsername });

        if (!existingAdmin) {
            // Create default admin user
            const admin = new Admin({
                username: config.adminUsername,
                passwordHash: config.adminPassword, // Will be hashed by pre-save hook
                plainPassword: config.adminPassword,
                role: 'admin',
            });
            await admin.save();
            console.log(`✓ Created admin user: ${config.adminUsername}`);
        } else {
            // Update existing admin password to match configured password
            existingAdmin.passwordHash = config.adminPassword; // Will be hashed by pre-save hook
            existingAdmin.plainPassword = config.adminPassword;
            await existingAdmin.save();
            console.log(`✓ Updated admin user password: ${config.adminUsername}`);
        }

        // Create 3 shops if they don't exist
        const shopNames = ['Shop 1', 'Shop 2', 'Shop 3'];

        for (let i = 1; i <= 3; i++) {
            const dbName = `${config.shopDbPrefix}${i}`;
            const existingShop = await Shop.findOne({ dbName });

            if (!existingShop) {
                const shop = new Shop({
                    name: shopNames[i - 1],
                    dbName: dbName,
                    location: `Location ${i}`,
                    logoUrl: '',
                });
                await shop.save();
                console.log(`✓ Created shop: ${shopNames[i - 1]} (${dbName})`);
            } else {
                console.log(`✓ Shop already exists: ${shopNames[i - 1]}`);
            }
        }

        console.log('\n✅ Database seeding completed!\n');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

module.exports = seedDatabase;
