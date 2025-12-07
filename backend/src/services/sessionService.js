// Simple UUID v4 generator
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Store active sessions in memory (in production, use Redis)
const activeSessions = new Map();

/**
 * Create a new shopkeeper session
 * @param {string} shopkeeperId - Shopkeeper ID
 * @param {string} shopkeeperUsername - Shopkeeper username
 * @returns {Object} Session data
 */
const createSession = (shopkeeperId, shopkeeperUsername) => {
    const sessionId = generateUUID();
    const sessionData = {
        sessionId,
        shopkeeperId,
        shopkeeperUsername,
        startTime: new Date(),
        salesCount: 0,
        totalAmount: 0,
    };

    activeSessions.set(sessionId, sessionData);

    return sessionData;
};

/**
 * Get active session by ID
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Session data or null
 */
const getSession = (sessionId) => {
    return activeSessions.get(sessionId) || null;
};

/**
 * Update session with sale information
 * @param {string} sessionId - Session ID
 * @param {number} amount - Sale amount to add
 */
const updateSession = (sessionId, amount) => {
    const session = activeSessions.get(sessionId);
    if (session) {
        session.salesCount += 1;
        session.totalAmount += amount;
        activeSessions.set(sessionId, session);
    }
};

/**
 * End a session and remove from active sessions
 * @param {string} sessionId - Session ID
 * @returns {Object|null} Final session data
 */
const endSession = (sessionId) => {
    const session = activeSessions.get(sessionId);
    if (session) {
        session.endTime = new Date();
        activeSessions.delete(sessionId);
        return session;
    }
    return null;
};

/**
 * Get all active sessions for a shopkeeper
 * @param {string} shopkeeperId - Shopkeeper ID
 * @returns {Array} Array of active sessions
 */
const getShopkeeperSessions = (shopkeeperId) => {
    const sessions = [];
    activeSessions.forEach((session) => {
        if (session.shopkeeperId === shopkeeperId) {
            sessions.push(session);
        }
    });
    return sessions;
};

module.exports = {
    createSession,
    getSession,
    updateSession,
    endSession,
    getShopkeeperSessions,
};
