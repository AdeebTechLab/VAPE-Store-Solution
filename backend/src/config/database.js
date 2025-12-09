const mongoose = require('mongoose');
const config = require('./environment');

// Store database connections
const connections = {};

/**
 * Connect to the admin database
 */
const connectAdminDB = async () => {
    try {
        if (connections.admin && connections.admin.readyState === 1) {
            return connections.admin;
        }

        // Remove trailing slash from MONGO_URI if present
        const baseUri = config.mongoUri.replace(/\/$/, '');
        const adminDbUri = `${baseUri}/${config.adminDbName}`;

        // TLS options for Node.js v22 compatibility with MongoDB Atlas
        const connectionOptions = {
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
        };

        connections.admin = await mongoose.createConnection(adminDbUri, connectionOptions);

        console.log(`✓ Connected to Admin DB: ${config.adminDbName}`);
        return connections.admin;
    } catch (error) {
        console.error('Error connecting to Admin DB:', error.message);
        throw error;
    }
};

/**
 * Get or create connection to a specific shop database
 * @param {string} shopDbName - Name of the shop database (e.g., 'shop_db_1')
 */
const getShopConnection = async (shopDbName) => {
    try {
        // Return existing connection if available
        if (connections[shopDbName] && connections[shopDbName].readyState === 1) {
            return connections[shopDbName];
        }

        // Remove trailing slash from MONGO_URI if present
        const baseUri = config.mongoUri.replace(/\/$/, '');
        const shopDbUri = `${baseUri}/${shopDbName}`;

        // TLS options for Node.js v22 compatibility with MongoDB Atlas
        const connectionOptions = {
            tls: true,
            tlsAllowInvalidCertificates: true,
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
        };

        connections[shopDbName] = await mongoose.createConnection(shopDbUri, connectionOptions);

        console.log(`✓ Connected to Shop DB: ${shopDbName}`);
        return connections[shopDbName];
    } catch (error) {
        console.error(`Error connecting to Shop DB (${shopDbName}):`, error.message);
        throw error;
    }
};

/**
 * Close all database connections
 */
const closeAllConnections = async () => {
    try {
        const closePromises = Object.values(connections).map(conn => conn.close());
        await Promise.all(closePromises);
        console.log('✓ All database connections closed');
    } catch (error) {
        console.error('Error closing connections:', error.message);
    }
};

/**
 * Get all active shop connections
 */
const getAllShopConnections = () => {
    return Object.keys(connections)
        .filter(key => key !== 'admin' && connections[key].readyState === 1)
        .map(key => ({ name: key, connection: connections[key] }));
};

module.exports = {
    connectAdminDB,
    getShopConnection,
    closeAllConnections,
    getAllShopConnections,
};
