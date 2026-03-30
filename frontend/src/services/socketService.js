import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

let socket = null;
let pendingRooms = []; // Queue of rooms to join once connected

/**
 * Connect to Socket.io server
 */
export const connectSocket = () => {
    if (socket?.connected) return socket;

    // If socket exists but is reconnecting, don't create a new one
    if (socket) return socket;

    socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        // Replay any pending room joins
        pendingRooms.forEach(({ event, data }) => {
            socket.emit(event, data);
            console.log(`📍 Replayed pending room join: ${event}`, data || '');
        });
    });

    // On reconnect, re-join all rooms automatically
    socket.on('reconnect', () => {
        console.log('🔌 Socket reconnected, re-joining rooms...');
        pendingRooms.forEach(({ event, data }) => {
            socket.emit(event, data);
        });
    });

    socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.log('🔌 Socket connection error:', error.message);
    });

    return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        pendingRooms = [];
    }
};

/**
 * Get current socket instance
 */
export const getSocket = () => socket;

/**
 * Join a shop room to receive shop-specific updates
 */
export const joinShopRoom = (shopDbName) => {
    // Always remember this room so we can re-join on reconnect
    const existing = pendingRooms.find(r => r.event === 'join:shop' && r.data === shopDbName);
    if (!existing) {
        pendingRooms.push({ event: 'join:shop', data: shopDbName });
    }
    if (socket?.connected) {
        socket.emit('join:shop', shopDbName);
    }
};

/**
 * Join admin room to receive admin-specific updates
 */
export const joinAdminRoom = () => {
    // Always remember this room so we can re-join on reconnect
    const existing = pendingRooms.find(r => r.event === 'join:admin');
    if (!existing) {
        pendingRooms.push({ event: 'join:admin' });
    }
    if (socket?.connected) {
        socket.emit('join:admin');
    }
};

// ==================== EVENT LISTENERS ====================

/**
 * Listen for product added events
 */
export const onProductAdded = (callback) => {
    socket?.on('product:added', callback);
    return () => socket?.off('product:added', callback);
};

/**
 * Listen for product updated events
 */
export const onProductUpdated = (callback) => {
    socket?.on('product:updated', callback);
    return () => socket?.off('product:updated', callback);
};

/**
 * Listen for product deleted events
 */
export const onProductDeleted = (callback) => {
    socket?.on('product:deleted', callback);
    return () => socket?.off('product:deleted', callback);
};

/**
 * Listen for stock updated events
 */
export const onStockUpdated = (callback) => {
    socket?.on('stock:updated', callback);
    return () => socket?.off('stock:updated', callback);
};

/**
 * Listen for sale completed events
 */
export const onSaleCompleted = (callback) => {
    socket?.on('sale:completed', callback);
    return () => socket?.off('sale:completed', callback);
};

/**
 * Listen for session ended events
 */
export const onSessionEnded = (callback) => {
    socket?.on('session:ended', callback);
    return () => socket?.off('session:ended', callback);
};

/**
 * Listen for session reconciled events
 */
export const onSessionReconciled = (callback) => {
    socket?.on('session:reconciled', callback);
    return () => socket?.off('session:reconciled', callback);
};

/**
 * Listen for bottle opened events
 */
export const onBottleOpened = (callback) => {
    socket?.on('bottle:opened', callback);
    return () => socket?.off('bottle:opened', callback);
};

/**
 * Listen for bottle updated events
 */
export const onBottleUpdated = (callback) => {
    socket?.on('bottle:updated', callback);
    return () => socket?.off('bottle:updated', callback);
};

/**
 * Listen for bottle deleted events
 */
export const onBottleDeleted = (callback) => {
    socket?.on('bottle:deleted', callback);
    return () => socket?.off('bottle:deleted', callback);
};

/**
 * Listen for shop updated events
 */
export const onShopUpdated = (callback) => {
    socket?.on('shop:updated', callback);
    return () => socket?.off('shop:updated', callback);
};

export default {
    connectSocket,
    disconnectSocket,
    getSocket,
    joinShopRoom,
    joinAdminRoom,
    onProductAdded,
    onProductUpdated,
    onProductDeleted,
    onStockUpdated,
    onSaleCompleted,
    onSessionEnded,
    onSessionReconciled,
    onBottleOpened,
    onBottleUpdated,
    onBottleDeleted,
    onShopUpdated,
};
