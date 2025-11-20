import { io } from 'socket.io-client';

// Replace with your backend URL
const SOCKET_URL = 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'] // Force WebSocket to avoid polling initially if desired
});
