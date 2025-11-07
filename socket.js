import { io } from "socket.io-client";

export const initSocket = async () => {
    const backendURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    console.log("Connecting to backend:", backendURL); 
    const options = {
        'force new connection': true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['websocket']
    }
    
    return io(backendURL, options)
}