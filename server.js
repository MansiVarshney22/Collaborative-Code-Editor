import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust this to your frontend origin in production
        methods: ["GET", "POST"],
    },
});

const userSocketMap = {};

// Handle socket connections
io.on("connection", (socket) => {
    // Example event handling
    socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });

    socket.on('join', ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId); //creating a room at the server with the same name as the roomId
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit('joined', {
                clients,
                socketId: socket.id,
                username
            })
        })
    })

    // socket.on('code_change', ({ roomId, code }) => {
    //     console.log(roomId, code, 'aaaaa')
    //     io.to(roomId).emit('code_change', {code})
    // })

    socket.on('code_change', ({ roomId, code }) => {
        // Broadcast only to others in the same room
        socket.in(roomId).emit('code_change', { code });
    });

    socket.on('sync_code', ({ code, socketId }) => {
        console.log('object', code)
        io.to(socketId).emit('code_change', { code });
    });

    socket.on('request_sync', ({ roomId }) => {
        // Let everyone else in the room know someone needs code
        socket.in(roomId).emit('request_sync', { socketId: socket.id });
    });

    socket.on("output_sync", ({ roomId, output, error }) => {
        // Send to everyone else in the room
        socket.in(roomId).emit("output_sync", { output, error });
    });

    socket.on("output_loading", ({ roomId, isLoading }) => {
        // Broadcast loading state to everyone else in the room
        console.log(roomId, isLoading, 'hiiiii')
        socket.in(roomId).emit("output_loading", { isLoading });
    });
    socket.on('language_change', ({ roomId, language, socketId }) => {
        if (socketId) {
            io.to(socketId).emit('language_change', { language });
        } else {
            socket.in(roomId).emit('language_change', { language });
        }
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms]
        console.log(rooms, 'room1');
        rooms.forEach((roomId) => {
            socket.in(roomId).emit('disconnected', {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            })
        })
        delete userSocketMap[socket.id];
        socket.leave();
    })
});

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId]
        }
    })
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
});
