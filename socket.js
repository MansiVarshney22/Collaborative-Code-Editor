import { io } from "socket.io-client";

export const initSocket = async () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const options = {
        'force new connection': true,
        reconnectionAttempt: Infinity,
        timeout: 1000,
        transports: ['websocket']
    }
    
    return io(backendURL, options)
}